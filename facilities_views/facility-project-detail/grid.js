/*================================================================
FACILITY-PROJECT-DETAIL GRID
VERSION: v2026_06_18_project_photo_dashboard_links
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
    const latestUpdate = projectUpdates[0] || null;

    const facilityName = getFacilityName(facility);
    const projectName = project.project_name || project.name || 'Project';
    const facilityId = project.facilities_id || project.location_id || facility.id || null;

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
            .project-detail-back-btn { background:#747d8c; color:white; border:none; border-radius:9px; width:100%; min-height:48px; font-size:15px; font-weight:bold; cursor:pointer; margin-top:12px; }
            .project-detail-version-tag { border-top:1px solid #d6dee8; margin-top:18px; padding-top:10px; font-size:10px; color:#7d8ba0; text-align:center; }
            .project-update-date { color:#667085; font-size:11px; margin-bottom:4px; }
            .project-photo-button-row { display:grid; grid-template-columns:1fr 1fr 1fr; gap:6px; margin-top:12px; }
            .project-photo-btn { background:#003b73; color:white; border:none; border-radius:7px; padding:10px 4px; font-size:12px; font-weight:bold; cursor:pointer; }

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
                <div class="project-detail-label">PROJECT NAME</div>
                <div class="project-detail-value">${escapeHtml(projectName)}</div>

                <div class="project-detail-label">TYPE</div>
                <div class="project-detail-value">${escapeHtml(project.type || '')}</div>

                <div class="project-detail-label">DESCRIPTION</div>
                <div class="project-detail-value">${escapeHtml(project.description || '')}</div>

                <div class="project-detail-label">NOTES</div>
                <div class="project-detail-value">${escapeHtml(project.notes || '')}</div>
            </div>

            <div class="project-detail-info-box">
                <div class="project-detail-label">LAST PROJECT UPDATE</div>

                ${latestUpdate ? `
                    <div class="project-update-date">${escapeHtml(formatDate(latestUpdate.created_at))}</div>

                    <div class="project-detail-label">UPDATE TITLE</div>
                    <div class="project-detail-value">${escapeHtml(latestUpdate.update_title || '')}</div>

                    <div class="project-detail-label">STATUS</div>
                    <div class="project-detail-value">${escapeHtml(latestUpdate.status || '')}</div>

                    <div class="project-detail-label">WHERE I LEFT OFF</div>
                    <div class="project-detail-value">${escapeHtml(latestUpdate.left_off_at || '')}</div>

                    <div class="project-detail-label">MATERIALS NEEDED</div>
                    <div class="project-detail-value">${escapeHtml(latestUpdate.materials_needed || '')}</div>

                    <div class="project-detail-label">NEXT STEP</div>
                    <div class="project-detail-value">${escapeHtml(latestUpdate.next_step || '')}</div>
                ` : `
                    <div class="project-detail-value">No project updates yet.</div>
                `}
            </div>

            <div class="project-detail-info-box">
                <div class="project-detail-label">PROJECT PHOTOS</div>
                <div class="project-photo-button-row">
                    <button id="btn-view-before-images" type="button" class="project-photo-btn">BEFORE</button>
                    <button id="btn-view-during-images" type="button" class="project-photo-btn">DURING</button>
                    <button id="btn-view-after-images" type="button" class="project-photo-btn">AFTER</button>
                </div>
            </div>

            <button id="btn-add-project-update" class="project-detail-main-btn">ADD PROJECT UPDATE</button>

            <div class="project-detail-button-row" style="margin-top:12px;">
                <button id="btn-edit-project-detail" class="project-detail-action-btn">⚙️ Edit</button>
                <button id="btn-delete-project-detail" class="project-detail-delete-btn">🗑 Delete</button>
            </div>

            <button id="btn-back-projects" class="project-detail-back-btn">⬅️ BACK</button>

            <div class="project-detail-version-tag">facilities_views/facility-project-detail/grid.js</div>
        </div>

        <div id="project-detail-modal-backdrop" class="project-detail-modal-backdrop">
            <div class="project-detail-modal">
                <h3>Edit Project</h3>

                <label>Project Name</label>
                <input id="project-detail-name-input" type="text" value="${escapeHtml(projectName)}">

                <label>Type</label>
                <input id="project-detail-type-input" type="text" list="project-detail-type-options" value="${escapeHtml(project.type || '')}">

                <datalist id="project-detail-type-options">
                    <option value="Repair"></option>
                    <option value="Renovation"></option>
                    <option value="Maintenance"></option>
                    <option value="Inspection"></option>
                    <option value="Replacement"></option>
                    <option value="Other"></option>
                </datalist>

                <label>Description</label>
                <textarea id="project-detail-description-input">${escapeHtml(project.description || '')}</textarea>

                <label>Notes</label>
                <textarea id="project-detail-notes-input">${escapeHtml(project.notes || '')}</textarea>

                <div class="project-detail-modal-buttons">
                    <button id="btn-save-project-detail" class="btn-save-project-detail">Save</button>
                    <button id="btn-cancel-project-detail" class="btn-cancel-project-detail">Cancel</button>
                </div>

                <div id="project-detail-error" class="project-detail-error"></div>

                <div class="project-detail-version-tag">facilities_views/facility-project-detail/grid.js</div>
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

                <div class="project-detail-version-tag">facilities_views/facility-project-detail/grid.js</div>
            </div>
        </div>
    `;

    const modalBackdrop = document.getElementById('project-detail-modal-backdrop');
    const updateModalBackdrop = document.getElementById('project-update-modal-backdrop');
    const errorBox = document.getElementById('project-detail-error');
    const updateErrorBox = document.getElementById('project-update-error');

    function openProjectPhotos(photoType) {
        if (window.navigateTo) {
            window.navigateTo('project-photos', {
                ...facility,
                project_id: projectId,
                project_name: projectName,
                facilities_id: facilityId,
                photo_type: photoType
            });
        }
    }

    document.getElementById('btn-view-before-images').addEventListener('click', () => {
        openProjectPhotos('before');
    });

    document.getElementById('btn-view-during-images').addEventListener('click', () => {
        openProjectPhotos('during');
    });

    document.getElementById('btn-view-after-images').addEventListener('click', () => {
        openProjectPhotos('after');
    });

    document.getElementById('btn-add-project-update').addEventListener('click', () => {
        updateModalBackdrop.style.display = 'flex';
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

        const { error } = await createProjectUpdate(payload);

        if (error) {
            console.error('Insert project update error:', error);
            updateErrorBox.textContent = 'Could not save project update.';
            return;
        }

        updateModalBackdrop.style.display = 'none';

        if (window.navigateTo) {
            window.navigateTo('facility-project-detail', {
                ...facility,
                project_id: projectId
            });
        }
    });

    document.getElementById('btn-save-project-detail').addEventListener('click', async () => {
        const projectNameInput = document.getElementById('project-detail-name-input').value.trim();
        const typeInput = document.getElementById('project-detail-type-input').value.trim();
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
