/*================================================================
FACILITY-PROJECT-DETAIL GRID
LOCATION: /facilities_views/facility-project-detail/grid.js
VERSION: v2026_06_22_project_pictures_inspections_buttons
UPDATED: 2026-06-22 @ 9:25 AM EDT
================================================================*/

import {
    fetchProjectDetail,
    updateProjectDetail,
    deleteProjectDetail,
    fetchProjectUpdates,
    createProjectUpdate
} from './data.js';

function escapeHtml(value) {
    return String(value || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function getProjectId(context) {
    if (typeof context === 'object' && context !== null) return context.project_id || context.projectId || context.id;
    return context;
}

function getFacilityContext(context) {
    if (typeof context === 'object' && context !== null) {
        return context.facility || context;
    }

    return {};
}

function getFacilityName(context) {
    const facility = getFacilityContext(context);
    return facility?.abbreviation || facility?.number_name || facility?.name || 'Facility';
}

function formatDate(value) {
    if (!value) return '';
    return new Date(value).toLocaleString();
}

export async function renderFacilityProjectDetailGrid(containerId, context = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const projectId = getProjectId(context);
    const facility = getFacilityContext(context);

    if (!projectId) {
        container.innerHTML = `<p style="color:red;text-align:center;">Missing project ID.</p>`;
        return;
    }

    const { data: project, error } = await fetchProjectDetail(projectId);

    if (error || !project) {
        console.error('Fetch project detail error:', error);
        container.innerHTML = `<p style="color:red;text-align:center;">Could not load project.</p>`;
        return;
    }

    const projectUpdates = await fetchProjectUpdates(projectId);

    const facilityName = getFacilityName(facility);
    const projectName = project.project_name || project.name || 'Project';
    const facilityId = project.facilities_id || project.location_id || facility.id || null;
    const appointmentTimeValue = project.appointment_time ? String(project.appointment_time).slice(0, 16) : '';

    container.innerHTML = `
        <style>
            .project-detail-card { background:#ffffff; max-width:350px; margin:16px auto; padding:18px; border-radius:14px; box-shadow:0 4px 18px rgba(0,0,0,0.08); text-align:center; }
            .project-detail-title { color:#003b73; font-size:24px; font-weight:bold; margin-bottom:2px; }
            .project-detail-subtitle { color:#003b73; font-size:13px; font-weight:bold; margin-bottom:16px; letter-spacing:2px; }
            .project-detail-info-box { border:1px solid #d6dee8; border-radius:10px; padding:12px; text-align:left; margin-bottom:14px; background:#f8fbff; }
            .project-detail-label { color:#003b73; font-size:11px; font-weight:bold; margin-top:8px; }
            .project-detail-value { color:#111827; font-size:14px; margin-bottom:8px; white-space:pre-wrap; }
            .project-detail-button-row { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:12px; }
            .project-detail-action-btn { background:#003b73; color:white; border:none; border-radius:9px; min-height:48px; font-size:14px; font-weight:bold; cursor:pointer; }
            .project-detail-delete-btn { background:#dc2626; color:yellow; border:none; border-radius:9px; min-height:48px; font-size:14px; font-weight:bold; cursor:pointer; }
            .project-detail-main-btn { background:#003b73; color:white; border:none; border-radius:9px; width:100%; min-height:50px; font-size:15px; font-weight:bold; cursor:pointer; margin-top:8px; }
            .project-detail-two-btn-row { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:8px; }
            .project-detail-half-btn { background:#003b73; color:white; border:none; border-radius:9px; min-height:50px; font-size:14px; font-weight:bold; cursor:pointer; }
            .project-detail-picture-actions { display:none; grid-template-columns:1fr 1fr; gap:8px; margin-top:8px; }
            .project-detail-picture-btn { background:#00509d; color:white; border:none; border-radius:9px; min-height:48px; font-size:13px; font-weight:bold; cursor:pointer; }
            .project-detail-back-btn { background:#747d8c; color:white; border:none; border-radius:9px; width:100%; min-height:48px; font-size:15px; font-weight:bold; cursor:pointer; margin-top:12px; }
            .project-detail-version-tag { border-top:1px solid #d6dee8; margin-top:18px; padding-top:10px; font-size:10px; color:#7d8ba0; text-align:center; }
            .project-update-date { color:#667085; font-size:11px; margin-bottom:4px; }
            .project-update-record-button { width:100%; border:1px solid #d6dee8; border-radius:10px; padding:10px; margin-top:8px; background:#ffffff; text-align:left; cursor:pointer; }
            .project-update-record-button-title { color:#003b73; font-size:14px; font-weight:bold; margin-bottom:3px; }
            .project-update-record-button-status { color:#111827; font-size:12px; margin-bottom:3px; }
            .project-update-record-button-date { color:#667085; font-size:11px; }

            .project-detail-modal-backdrop,
            .project-update-modal-backdrop { position:fixed; inset:0; background:rgba(0,0,0,0.45); display:none; align-items:center; justify-content:center; z-index:9999; }

            .project-detail-modal,
            .project-update-modal { background:white; width:90%; max-width:360px; border-radius:12px; padding:18px; box-shadow:0 4px 18px rgba(0,0,0,0.25); text-align:left; max-height:90vh; overflow-y:auto; }

            .project-detail-modal h3,
            .project-update-modal h3 { margin:0 0 14px; text-align:center; color:#003b73; }

            .project-detail-modal label,
            .project-update-modal label { display:block; font-size:13px; font-weight:bold; margin:10px 0 4px; color:#003b73; }

            .project-detail-modal input,
            .project-detail-modal textarea,
            .project-detail-modal select,
            .project-update-modal input,
            .project-update-modal textarea { width:100%; padding:9px; border:1px solid #bbb; border-radius:6px; font-size:15px; box-sizing:border-box; }

            .project-detail-modal textarea,
            .project-update-modal textarea { min-height:80px; resize:vertical; }

            .project-update-checkbox-row { display:flex; align-items:center; gap:8px; margin-top:12px; color:#003b73; font-size:13px; font-weight:bold; }
            .project-update-checkbox-row input { width:auto; }

            .project-detail-modal-buttons,
            .project-update-modal-buttons { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:16px; }

            .project-detail-modal-buttons button,
            .project-update-modal-buttons button { padding:11px; border:none; border-radius:7px; font-weight:bold; cursor:pointer; }

            .btn-save-project-detail,
            .btn-save-project-update { background:#22a843; color:white; }

            .btn-cancel-project-detail,
            .btn-cancel-project-update { background:#777; color:white; }

            .project-detail-error,
            .project-update-error { color:red; font-size:13px; text-align:center; margin-top:10px; min-height:16px; }
        </style>

        <div class="project-detail-card">
            <div class="project-detail-title">${escapeHtml(projectName)}</div>
            <div class="project-detail-subtitle">${escapeHtml(facilityName)} PROJECT DETAIL</div>

            <div class="project-detail-info-box">
                <div class="project-detail-label">PROJECT DESCRIPTION</div>
                <div class="project-detail-value">${escapeHtml(project.description || '')}</div>

                <div class="project-detail-label">TYPE</div>
                <div class="project-detail-value">${escapeHtml(project.type || '')}</div>

                <div class="project-detail-label">STATUS</div>
                <div class="project-detail-value">${escapeHtml(project.status || 'Open')}</div>

                <div class="project-detail-label">REQUESTED BY NAME</div>
                <div class="project-detail-value">${escapeHtml(project.requested_by_name || '')}</div>

                <div class="project-detail-label">REQUESTED BY TITLE</div>
                <div class="project-detail-value">${escapeHtml(project.requested_by_title || '')}</div>

                <div class="project-detail-label">CONTACT PHONE NUMBER</div>
                <div class="project-detail-value">
                    ${project.phone_number ? `<a href="tel:${escapeHtml(project.phone_number)}" style="color:#003b73;font-weight:bold;text-decoration:underline;">${escapeHtml(project.phone_number)}</a>` : ''}
                </div>

                <div class="project-detail-label">ADDRESS</div>
                <div class="project-detail-value">
                    ${project.address ? `<a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(project.address)}" target="_blank" style="color:#003b73;font-weight:bold;text-decoration:underline;">${escapeHtml(project.address)}</a>` : ''}
                </div>

                <div class="project-detail-label">APPOINTMENT TIME</div>
                <div class="project-detail-value">${escapeHtml(formatDate(project.appointment_time))}</div>

                <div class="project-detail-label">REMINDER</div>
                <div class="project-detail-value">${escapeHtml(project.reminder || '')}</div>

                <div class="project-detail-label">NOTES</div>
                <div class="project-detail-value">${escapeHtml(project.notes || '')}</div>
            </div>

            <button id="btn-open-materials" class="project-detail-main-btn">MATERIALS</button>
            <button id="btn-add-project-update" class="project-detail-main-btn">ADD PROJECT UPDATE</button>

            <div class="project-detail-two-btn-row">
                <button id="btn-open-pictures" class="project-detail-half-btn">PICTURES</button>
                <button id="btn-open-inspections" class="project-detail-half-btn">INSPECTIONS</button>
            </div>

            <div id="project-picture-actions" class="project-detail-picture-actions">
                <button id="btn-take-project-picture" class="project-detail-picture-btn">TAKE PICTURE</button>
                <button id="btn-see-project-pictures" class="project-detail-picture-btn">SEE PICTURES</button>
            </div>

            <div class="project-detail-info-box" style="margin-top:14px;">
                <div class="project-detail-label">PROJECT UPDATES</div>

                ${projectUpdates.length ? projectUpdates.map(update => `
                    <button type="button" class="project-update-record-button" data-id="${update.id}">
                        <div class="project-update-record-button-title">${escapeHtml(update.update_title || 'Project Update')}</div>
                        <div class="project-update-record-button-status">${escapeHtml(update.status || '')}</div>
                        <div class="project-update-record-button-date">${escapeHtml(formatDate(update.created_at))}</div>
                    </button>
                `).join('') : `
                    <div class="project-detail-value">No project updates yet.</div>
                `}
            </div>

            <div class="project-detail-button-row" style="margin-top:12px;">
                <button id="btn-edit-project-detail" class="project-detail-action-btn">⚙️ Edit</button>
                <button id="btn-delete-project-detail" class="project-detail-delete-btn">🗑 Delete</button>
            </div>

            <button id="btn-back-projects" class="project-detail-back-btn">⬅️ BACK</button>

            <div class="project-detail-version-tag">facility-project-detail/grid.js | v2026_06_22_project_pictures_inspections_buttons | 2026-06-22 @ 9:25 AM EDT</div>
        </div>

        <div id="project-detail-modal-backdrop" class="project-detail-modal-backdrop">
            <div class="project-detail-modal">
                <h3>Edit Project</h3>

                <label>Project Name</label>
                <input id="project-detail-name-input" type="text" value="${escapeHtml(projectName)}">

                <label>Type</label>
                <input id="project-detail-type-input" type="text" list="project-detail-type-options" value="${escapeHtml(project.type || '')}">

                <label>Status</label>
                <select id="project-detail-status-input">
                    <option value="Open" ${project.status === 'Open' ? 'selected' : ''}>Open</option>
                    <option value="In Progress" ${project.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                    <option value="Waiting on Materials" ${project.status === 'Waiting on Materials' ? 'selected' : ''}>Waiting on Materials</option>
                    <option value="Waiting on Vendor" ${project.status === 'Waiting on Vendor' ? 'selected' : ''}>Waiting on Vendor</option>
                    <option value="On Hold" ${project.status === 'On Hold' ? 'selected' : ''}>On Hold</option>
                    <option value="Completed" ${project.status === 'Completed' ? 'selected' : ''}>Completed</option>
                    <option value="Cancelled" ${project.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>

                <datalist id="project-detail-type-options">
                    <option value="Repair"></option>
                    <option value="Renovation"></option>
                    <option value="Maintenance"></option>
                    <option value="Inspection"></option>
                    <option value="Replacement"></option>
                    <option value="Other"></option>
                </datalist>

                <label>Contact Phone Number</label>
                <input id="project-detail-phone-number-input" type="tel" value="${escapeHtml(project.phone_number || '')}">

                <label>Address</label>
                <input id="project-detail-address-input" type="text" value="${escapeHtml(project.address || '')}">

                <label>Appointment Time</label>
                <input id="project-detail-appointment-time-input" type="datetime-local" value="${escapeHtml(appointmentTimeValue)}">

                <label>Reminder</label>
                <input id="project-detail-reminder-input" type="text" value="${escapeHtml(project.reminder || '')}">

                <label>Description</label>
                <textarea id="project-detail-description-input">${escapeHtml(project.description || '')}</textarea>

                <label>Notes</label>
                <textarea id="project-detail-notes-input">${escapeHtml(project.notes || '')}</textarea>

                <div class="project-detail-modal-buttons">
                    <button id="btn-save-project-detail" class="btn-save-project-detail">Save</button>
                    <button id="btn-cancel-project-detail" class="btn-cancel-project-detail">Cancel</button>
                </div>

                <div id="project-detail-error" class="project-detail-error"></div>

                <div class="project-detail-version-tag">facility-project-detail/grid.js | v2026_06_22_project_pictures_inspections_buttons | 2026-06-22 @ 9:25 AM EDT</div>
            </div>
        </div>

        <div id="project-update-modal-backdrop" class="project-update-modal-backdrop">
            <div class="project-update-modal">
                <h3>Add Project Update</h3>

                <label>Update Title</label>
                <input id="project-update-title-input" type="text" list="project-update-title-options">

                <datalist id="project-update-title-options">
                    <option value="General Update"></option>
                    <option value="Carpet Update"></option>
                    <option value="AC Update"></option>
                    <option value="Plumbing Update"></option>
                    <option value="Electrical Update"></option>
                    <option value="Painting Update"></option>
                    <option value="Materials Update"></option>
                    <option value="Vendor Update"></option>
                    <option value="Room Flip Update"></option>
                </datalist>

                <label>Status Today</label>
                <input id="project-update-status-input" type="text" list="project-update-status-options">

                <datalist id="project-update-status-options">
                    <option value="Not Started"></option>
                    <option value="In Progress"></option>
                    <option value="Waiting on Materials"></option>
                    <option value="Waiting on Vendor"></option>
                    <option value="On Hold"></option>
                    <option value="Completed"></option>
                </datalist>

                <label>Work Done Today</label>
                <textarea id="project-update-work-done-input"></textarea>

                <label>Where I Left Off</label>
                <textarea id="project-update-left-off-input"></textarea>

                <label>Materials Needed</label>
                <textarea id="project-update-materials-input"></textarea>

                <label>Next Step</label>
                <textarea id="project-update-next-step-input"></textarea>

                <div class="project-update-checkbox-row">
                    <input id="project-update-vendor-needed-input" type="checkbox">
                    <span>Vendor Needed</span>
                </div>

                <label>Notes</label>
                <textarea id="project-update-notes-input"></textarea>

                <div class="project-update-modal-buttons">
                    <button id="btn-save-project-update" class="btn-save-project-update">Save</button>
                    <button id="btn-cancel-project-update" class="btn-cancel-project-update">Cancel</button>
                </div>

                <div id="project-update-error" class="project-update-error"></div>

                <div class="project-detail-version-tag">facility-project-detail/grid.js | v2026_06_22_project_pictures_inspections_buttons | 2026-06-22 @ 9:25 AM EDT</div>
            </div>
        </div>
    `;

    const modalBackdrop = document.getElementById('project-detail-modal-backdrop');
    const updateModalBackdrop = document.getElementById('project-update-modal-backdrop');
    const errorBox = document.getElementById('project-detail-error');
    const updateErrorBox = document.getElementById('project-update-error');
    const pictureActions = document.getElementById('project-picture-actions');

    document.querySelectorAll('.project-update-record-button').forEach(button => {
        button.addEventListener('click', () => {
            if (window.navigateTo) {
                window.navigateTo('project-update', {
                    ...facility,
                    project_id: projectId,
                    project_update_id: button.dataset.id,
                    project_name: projectName,
                    facilities_id: facilityId
                });
            }
        });
    });

    document.getElementById('btn-open-materials').addEventListener('click', () => {
        if (window.navigateTo) {
            window.navigateTo('materials', {
                ...facility,
                project_id: projectId,
                project_name: projectName,
                facilities_id: facilityId
            });
        }
    });

    document.getElementById('btn-add-project-update').addEventListener('click', () => {
        updateModalBackdrop.style.display = 'flex';
    });

    document.getElementById('btn-open-pictures').addEventListener('click', () => {
        pictureActions.style.display = pictureActions.style.display === 'grid' ? 'none' : 'grid';
    });

    document.getElementById('btn-open-inspections').addEventListener('click', () => {
        alert('Inspections button is added. We will connect this next.');
    });

    document.getElementById('btn-take-project-picture').addEventListener('click', () => {
        alert('Take Picture button is added. We will connect the camera next.');
    });

    document.getElementById('btn-see-project-pictures').addEventListener('click', () => {
        alert('See Pictures button is added. We will connect the image list next.');
    });

    document.getElementById('btn-cancel-project-update').addEventListener('click', () => {
        updateModalBackdrop.style.display = 'none';
    });

    document.getElementById('btn-edit-project-detail').addEventListener('click', () => {
        modalBackdrop.style.display = 'flex';
    });

    document.getElementById('btn-cancel-project-detail').addEventListener('click', () => {
        modalBackdrop.style.display = 'none';
    });

    document.getElementById('btn-back-projects').addEventListener('click', () => {
        if (window.navigateTo) window.navigateTo('facilities-projects', facility);
    });

    document.getElementById('btn-delete-project-detail').addEventListener('click', async () => {
        if (!confirm('Are you sure you want to delete this project?')) return;

        const { error } = await deleteProjectDetail(projectId);

        if (error) {
            console.error('Delete project detail error:', error);
            alert('Could not delete project.');
            return;
        }

        if (window.navigateTo) window.navigateTo('facilities-projects', facility);
    });

    document.getElementById('btn-save-project-update').addEventListener('click', async () => {
        const updateTitle = document.getElementById('project-update-title-input').value.trim();
        const status = document.getElementById('project-update-status-input').value.trim();
        const workDone = document.getElementById('project-update-work-done-input').value.trim();
        const leftOffAt = document.getElementById('project-update-left-off-input').value.trim();
        const materialsNeeded = document.getElementById('project-update-materials-input').value.trim();
        const nextStep = document.getElementById('project-update-next-step-input').value.trim();
        const vendorNeeded = document.getElementById('project-update-vendor-needed-input').checked;
        const notes = document.getElementById('project-update-notes-input').value.trim();

        if (!updateTitle && !status && !workDone && !leftOffAt && !materialsNeeded && !nextStep && !notes) {
            updateErrorBox.textContent = 'Enter at least one update detail.';
            return;
        }

        const payload = {
            project_id: projectId,
            facilities_id: facilityId,
            update_title: updateTitle,
            status,
            work_done: workDone,
            left_off_at: leftOffAt,
            materials_needed: materialsNeeded,
            next_step: nextStep,
            vendor_needed: vendorNeeded,
            notes
        };

        const { data, error } = await createProjectUpdate(payload);

        if (error) {
            console.error('Insert project update error:', error);
            updateErrorBox.textContent = 'Could not save project update.';
            return;
        }

        updateModalBackdrop.style.display = 'none';

        if (window.navigateTo) {
            window.navigateTo('project-update', {
                ...facility,
                project_id: projectId,
                project_update_id: data.id,
                project_name: projectName,
                facilities_id: facilityId
            });
        }
    });

    document.getElementById('btn-save-project-detail').addEventListener('click', async () => {
        const projectNameInput = document.getElementById('project-detail-name-input').value.trim();
        const typeInput = document.getElementById('project-detail-type-input').value.trim();
        const statusInput = document.getElementById('project-detail-status-input').value.trim();
        const phoneNumberInput = document.getElementById('project-detail-phone-number-input').value.trim();
        const addressInput = document.getElementById('project-detail-address-input').value.trim();
        const appointmentTimeInput = document.getElementById('project-detail-appointment-time-input').value;
        const reminderInput = document.getElementById('project-detail-reminder-input').value.trim();
        const descriptionInput = document.getElementById('project-detail-description-input').value.trim();
        const notesInput = document.getElementById('project-detail-notes-input').value.trim();

        if (!projectNameInput) {
            errorBox.textContent = 'Project name required.';
            return;
        }

        const payload = {
            name: projectNameInput,
            project_name: projectNameInput,
            type: typeInput,
            status: statusInput,
            phone_number: phoneNumberInput,
            address: addressInput,
            appointment_time: appointmentTimeInput || null,
            reminder: reminderInput,
            description: descriptionInput,
            notes: notesInput
        };

        const { data, error } = await updateProjectDetail(projectId, payload);

        if (error) {
            console.error('Update project detail error:', error);
            errorBox.textContent = 'Could not update project.';
            return;
        }

        modalBackdrop.style.display = 'none';

        if (window.navigateTo) {
            window.navigateTo('facility-project-detail', {
                ...facility,
                project_id: data.id
            });
        }
    });
}
