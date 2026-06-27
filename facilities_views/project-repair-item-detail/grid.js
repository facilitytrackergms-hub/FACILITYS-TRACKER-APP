/*================================================================
PROJECT-REPAIR-ITEM-DETAIL GRID
LOCATION: /facilities_views/project-repair-item-detail/grid.js
VERSION: v2026_06_26_repair_item_dashboard_new
UPDATED: 2026-06-26
================================================================*/

import {
    fetchRepairItemDetail,
    updateRepairItemDetail,
    deleteRepairItemDetail,
    fetchProjectDetail,
    fetchRepairItemUpdates,
    createRepairItemUpdate,
    fetchRepairItemPhotos
} from './data.js';

function escapeHtml(value) {
    return String(value || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function getRepairItemId(context) {
    if (typeof context === 'object' && context !== null) {
        return context.project_scope_item_id || context.repair_item_id || context.scope_item_id || context.id;
    }

    return context;
}

function getProjectId(context, repairItem = {}) {
    if (typeof context === 'object' && context !== null) {
        return context.project_id || context.projectId || repairItem.project_id || null;
    }

    return repairItem.project_id || null;
}

function getFacilityId(context, repairItem = {}, project = {}) {
    if (typeof context === 'object' && context !== null) {
        return context.facilities_id || context.facility_id || context.id || repairItem.facilities_id || project.facilities_id || project.location_id || null;
    }

    return repairItem.facilities_id || project.facilities_id || project.location_id || null;
}

function getFacilityContext(context) {
    if (typeof context === 'object' && context !== null) {
        return context.facility || context;
    }

    return {};
}

function formatDate(value) {
    if (!value) return '';
    return new Date(value).toLocaleString();
}

function renderValue(value) {
    return `<div class="repair-item-value">${escapeHtml(value || '')}</div>`;
}

function renderPhoneLink(value) {
    if (!value) return `<div class="repair-item-value"></div>`;

    return `
        <div class="repair-item-value">
            <a class="repair-item-link" href="tel:${escapeHtml(value)}">${escapeHtml(value)}</a>
        </div>
    `;
}

function renderRow(label, valueHtml) {
    return `
        <div class="repair-item-row">
            <div class="repair-item-label">${escapeHtml(label)}</div>
            ${valueHtml}
        </div>
    `;
}

function getRepairItemTitle(item) {
    const location = item.location_number || item.area_name || 'Repair Item';
    const component = item.item_name || item.work_needed || '';
    return component ? `${location} — ${component}` : location;
}

export async function renderProjectRepairItemDetailGrid(containerId, context = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const repairItemId = getRepairItemId(context);

    if (!repairItemId) {
        container.innerHTML = `<p style="color:red;text-align:center;">Missing repair item ID.</p>`;
        return;
    }

    const { data: repairItem, error } = await fetchRepairItemDetail(repairItemId);

    if (error || !repairItem) {
        console.error('Fetch repair item detail error:', error);
        container.innerHTML = `<p style="color:red;text-align:center;">Could not load repair item.</p>`;
        return;
    }

    const projectId = getProjectId(context, repairItem);
    const { data: project } = projectId ? await fetchProjectDetail(projectId) : { data: null };
    const updates = await fetchRepairItemUpdates(repairItemId);
    const photos = await fetchRepairItemPhotos(repairItemId);

    const facility = getFacilityContext(context);
    const facilityId = getFacilityId(context, repairItem, project || {});
    const projectName = project?.project_name || project?.name || context.project_name || 'Project';
    const repairTitle = getRepairItemTitle(repairItem);

    container.innerHTML = `
        <style>
            .repair-item-card { background:#ffffff; max-width:350px; margin:16px auto; padding:18px; border-radius:14px; box-shadow:0 4px 18px rgba(0,0,0,0.08); text-align:center; }
            .repair-item-title { color:#003b73; font-size:22px; font-weight:bold; margin-bottom:3px; line-height:1.15; overflow-wrap:anywhere; }
            .repair-item-subtitle { color:#003b73; font-size:12px; font-weight:bold; margin-bottom:12px; letter-spacing:1px; overflow-wrap:anywhere; }

            .repair-item-tab-grid { display:grid; grid-template-columns:1fr 1fr; gap:7px; margin-bottom:12px; }
            .repair-item-tab-btn { background:#ffffff; color:#003b73; border:1px solid #003b73; border-radius:8px; min-height:40px; padding:7px 5px; font-size:11px; font-weight:bold; cursor:pointer; }
            .repair-item-tab-btn.active { background:#003b73; color:white; }

            .repair-item-panel { display:none; }
            .repair-item-panel.active { display:block; }

            .repair-item-info-box { border:1px solid #d6dee8; border-radius:10px; padding:12px; text-align:left; margin-bottom:14px; background:#f8fbff; }
            .repair-item-section-title { color:#003b73; font-size:13px; font-weight:bold; margin-bottom:10px; text-align:center; letter-spacing:1px; }
            .repair-item-summary { color:#667085; font-size:12px; font-weight:bold; text-align:center; margin-bottom:10px; }
            .repair-item-row { margin-bottom:10px; text-align:left; }
            .repair-item-label { color:#003b73; font-size:11px; font-weight:bold; margin-bottom:3px; text-align:left; }
            .repair-item-value { color:#111827; font-size:14px; line-height:1.35; white-space:pre-wrap; text-align:left; overflow-wrap:anywhere; word-break:break-word; }
            .repair-item-link { color:#003b73; font-weight:bold; text-decoration:underline; display:inline-block; max-width:100%; overflow-wrap:anywhere; word-break:break-word; text-align:left; }

            .repair-item-main-btn { background:#003b73; color:white; border:none; border-radius:9px; width:100%; min-height:50px; font-size:15px; font-weight:bold; cursor:pointer; margin-top:8px; }
            .repair-item-save-btn { background:#22a843; color:white; border:none; border-radius:9px; width:100%; min-height:50px; font-size:15px; font-weight:bold; cursor:pointer; margin-top:8px; }
            .repair-item-back-btn { background:#747d8c; color:white; border:none; border-radius:9px; width:100%; min-height:48px; font-size:15px; font-weight:bold; cursor:pointer; margin-top:12px; }
            .repair-item-delete-btn { background:#dc2626; color:yellow; border:none; border-radius:9px; width:100%; min-height:48px; font-size:15px; font-weight:bold; cursor:pointer; margin-top:8px; }

            .repair-item-button-row { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:12px; }
            .repair-item-action-btn { background:#003b73; color:white; border:none; border-radius:9px; min-height:48px; font-size:14px; font-weight:bold; cursor:pointer; }
            .repair-item-update-record-button { width:100%; border:1px solid #d6dee8; border-radius:10px; padding:10px; margin-top:8px; background:#ffffff; text-align:left; cursor:pointer; }
            .repair-item-update-title { color:#003b73; font-size:14px; font-weight:bold; margin-bottom:3px; }
            .repair-item-update-status { color:#111827; font-size:12px; margin-bottom:3px; }
            .repair-item-update-date { color:#667085; font-size:11px; }

            .repair-item-modal-backdrop,
            .repair-update-modal-backdrop,
            .repair-confirm-backdrop { position:fixed; inset:0; background:rgba(0,0,0,0.45); display:none; align-items:center; justify-content:center; z-index:9999; }

            .repair-item-modal,
            .repair-update-modal,
            .repair-confirm-modal { background:white; width:90%; max-width:360px; border-radius:12px; padding:18px; box-shadow:0 4px 18px rgba(0,0,0,0.25); text-align:left; max-height:90vh; overflow-y:auto; }

            .repair-confirm-modal { text-align:center; }

            .repair-item-modal h3,
            .repair-update-modal h3 { margin:0 0 14px; text-align:center; color:#003b73; }

            .repair-confirm-title { color:#003b73; font-size:18px; font-weight:bold; margin-bottom:10px; }
            .repair-confirm-message { color:#1f2937; font-size:14px; line-height:1.35; margin-bottom:16px; }
            .repair-confirm-buttons { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
            .repair-confirm-buttons button { border:none; border-radius:8px; padding:11px; font-size:14px; font-weight:bold; cursor:pointer; }
            .btn-confirm-yes { background:#dc2626; color:yellow; }
            .btn-confirm-no { background:#777; color:white; }

            .repair-item-modal label,
            .repair-update-modal label { display:block; font-size:13px; font-weight:bold; margin:10px 0 4px; color:#003b73; }

            .repair-item-modal input,
            .repair-item-modal textarea,
            .repair-item-modal select,
            .repair-update-modal input,
            .repair-update-modal textarea { width:100%; padding:9px; border:1px solid #bbb; border-radius:6px; font-size:15px; box-sizing:border-box; }

            .repair-item-modal textarea,
            .repair-update-modal textarea { min-height:80px; resize:vertical; }

            .repair-item-modal-buttons,
            .repair-update-modal-buttons { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:16px; }

            .repair-item-modal-buttons button,
            .repair-update-modal-buttons button { padding:11px; border:none; border-radius:7px; font-weight:bold; cursor:pointer; }

            .btn-save-repair-item,
            .btn-save-repair-update { background:#22a843; color:white; }

            .btn-cancel-repair-item,
            .btn-cancel-repair-update { background:#777; color:white; }

            .repair-item-error,
            .repair-update-error { color:red; font-size:13px; text-align:center; margin-top:10px; min-height:16px; }

            .repair-item-version-tag { border-top:1px solid #d6dee8; margin-top:18px; padding-top:10px; font-size:10px; color:#7d8ba0; text-align:center; }
        </style>

        <div class="repair-item-card">
            <div class="repair-item-title">${escapeHtml(repairTitle)}</div>
            <div class="repair-item-subtitle">${escapeHtml(projectName)} REPAIR ITEM</div>

            <div class="repair-item-tab-grid">
                <button type="button" class="repair-item-tab-btn active" data-section="details">DETAILS</button>
                <button type="button" class="repair-item-tab-btn" data-section="pictures">PICTURES</button>
                <button type="button" class="repair-item-tab-btn" data-section="materials">MATERIALS</button>
                <button type="button" class="repair-item-tab-btn" data-section="updates">UPDATES</button>
                <button type="button" class="repair-item-tab-btn" data-section="testing">TESTING</button>
                <button type="button" class="repair-item-tab-btn" data-section="reports">REPORTS</button>
            </div>

            <div class="repair-item-panel active" data-section-panel="details">
                <div class="repair-item-info-box">
                    <div class="repair-item-section-title">REPAIR ITEM DETAILS</div>
                    ${renderRow('LOCATION / ROOM / APARTMENT NUMBER', renderValue(repairItem.location_number || ''))}
                    ${renderRow('RESIDENT / AREA CONTACT NAME', renderValue(repairItem.resident_name || ''))}
                    ${renderRow('RESIDENT / AREA CONTACT PHONE', renderPhoneLink(repairItem.resident_phone || ''))}
                    ${renderRow('AREA / SECTION', renderValue(repairItem.area_name || ''))}
                    ${renderRow('ITEM / COMPONENT', renderValue(repairItem.item_name || ''))}
                    ${renderRow('WORK NEEDED', renderValue(repairItem.work_needed || ''))}
                    ${renderRow('REPAIR STATUS', renderValue(repairItem.repair_status || 'Open'))}
                    ${renderRow('REPAIR PRIORITY', renderValue(repairItem.repair_priority || ''))}
                    ${renderRow('NOTES', renderValue(repairItem.notes || ''))}
                </div>
            </div>

            <div class="repair-item-panel" data-section-panel="pictures">
                <div class="repair-item-info-box">
                    <div class="repair-item-section-title">REPAIR ITEM PICTURES</div>
                    <div class="repair-item-summary">${photos.length} PICTURE${photos.length === 1 ? '' : 'S'}</div>
                    <button id="btn-open-repair-pictures" class="repair-item-main-btn">OPEN PICTURES</button>
                    <div class="repair-item-value" style="margin-top:10px;">Pictures will be tied to this repair item using project_scope_item_id.</div>
                </div>
            </div>

            <div class="repair-item-panel" data-section-panel="materials">
                <div class="repair-item-info-box">
                    <div class="repair-item-section-title">REPAIR ITEM MATERIALS</div>
                    <button id="btn-open-repair-materials" class="repair-item-main-btn">OPEN MATERIALS</button>
                    <div class="repair-item-value" style="margin-top:10px;">Materials will be tied to this repair item using project_scope_item_id.</div>
                </div>
            </div>

            <div class="repair-item-panel" data-section-panel="updates">
                <div class="repair-item-info-box">
                    <div class="repair-item-section-title">REPAIR ITEM UPDATES</div>
                    <button id="btn-add-repair-update" class="repair-item-main-btn">ADD UPDATE</button>

                    ${updates.length ? updates.map(update => `
                        <button type="button" class="repair-item-update-record-button">
                            <div class="repair-item-update-title">${escapeHtml(update.update_title || 'Repair Update')}</div>
                            <div class="repair-item-update-status">${escapeHtml(update.status || '')}</div>
                            <div class="repair-item-update-date">${escapeHtml(formatDate(update.created_at))}</div>
                        </button>
                    `).join('') : `
                        <div class="repair-item-value" style="margin-top:10px;">No repair updates yet.</div>
                    `}
                </div>
            </div>

            <div class="repair-item-panel" data-section-panel="testing">
                <div class="repair-item-info-box">
                    <div class="repair-item-section-title">TESTING / COMPLETION</div>
                    ${renderRow('STARTED AT', renderValue(formatDate(repairItem.started_at)))}
                    ${renderRow('COMPLETED AT', renderValue(formatDate(repairItem.completed_at)))}
                    ${renderRow('TESTED BY', renderValue(repairItem.tested_by || ''))}
                    ${renderRow('TESTING NOTES', renderValue(repairItem.testing_notes || ''))}
                    ${renderRow('COMPLETION NOTES', renderValue(repairItem.completion_notes || ''))}
                </div>
            </div>

            <div class="repair-item-panel" data-section-panel="reports">
                <div class="repair-item-info-box">
                    <div class="repair-item-section-title">REPAIR ITEM REPORTS</div>
                    <button id="btn-open-repair-report" class="repair-item-main-btn">OPEN REPORT</button>
                    <div class="repair-item-value" style="margin-top:10px;">Reports will be tied to this repair item using project_scope_item_id.</div>
                </div>
            </div>

            <div class="repair-item-button-row">
                <button id="btn-edit-repair-item" class="repair-item-action-btn">⚙️ EDIT</button>
                <button id="btn-delete-repair-item" class="repair-item-delete-btn">🗑 DELETE</button>
            </div>

            <button id="btn-back-project-detail" class="repair-item-back-btn">⬅️ BACK TO PROJECT</button>

            <div class="repair-item-version-tag">project-repair-item-detail/grid.js | v2026_06_26_repair_item_dashboard_new | 2026-06-26</div>
        </div>

        <div id="repair-item-modal-backdrop" class="repair-item-modal-backdrop">
            <div class="repair-item-modal">
                <h3>Edit Repair Item</h3>

                <label>Location / Room / Apartment Number</label>
                <input id="repair-location-number-input" type="text" value="${escapeHtml(repairItem.location_number || '')}">

                <label>Resident / Area Contact Name</label>
                <input id="repair-resident-name-input" type="text" value="${escapeHtml(repairItem.resident_name || '')}">

                <label>Resident / Area Contact Phone</label>
                <input id="repair-resident-phone-input" type="tel" value="${escapeHtml(repairItem.resident_phone || '')}">

                <label>Area / Section</label>
                <input id="repair-area-name-input" type="text" value="${escapeHtml(repairItem.area_name || '')}">

                <label>Item / Component</label>
                <input id="repair-item-name-input" type="text" value="${escapeHtml(repairItem.item_name || '')}">

                <label>Work Needed</label>
                <input id="repair-work-needed-input" type="text" value="${escapeHtml(repairItem.work_needed || '')}">

                <label>Repair Status</label>
                <select id="repair-status-input">
                    <option value="Open" ${(repairItem.repair_status || 'Open') === 'Open' ? 'selected' : ''}>Open</option>
                    <option value="In Progress" ${repairItem.repair_status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                    <option value="Waiting on Materials" ${repairItem.repair_status === 'Waiting on Materials' ? 'selected' : ''}>Waiting on Materials</option>
                    <option value="Waiting on Vendor" ${repairItem.repair_status === 'Waiting on Vendor' ? 'selected' : ''}>Waiting on Vendor</option>
                    <option value="Testing" ${repairItem.repair_status === 'Testing' ? 'selected' : ''}>Testing</option>
                    <option value="Completed" ${repairItem.repair_status === 'Completed' ? 'selected' : ''}>Completed</option>
                    <option value="Cancelled" ${repairItem.repair_status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>

                <label>Repair Priority</label>
                <select id="repair-priority-input">
                    <option value="" ${!repairItem.repair_priority ? 'selected' : ''}>None</option>
                    <option value="Low" ${repairItem.repair_priority === 'Low' ? 'selected' : ''}>Low</option>
                    <option value="Normal" ${repairItem.repair_priority === 'Normal' ? 'selected' : ''}>Normal</option>
                    <option value="High" ${repairItem.repair_priority === 'High' ? 'selected' : ''}>High</option>
                    <option value="Urgent" ${repairItem.repair_priority === 'Urgent' ? 'selected' : ''}>Urgent</option>
                </select>

                <label>Started At</label>
                <input id="repair-started-at-input" type="datetime-local" value="${escapeHtml(repairItem.started_at ? String(repairItem.started_at).slice(0, 16) : '')}">

                <label>Completed At</label>
                <input id="repair-completed-at-input" type="datetime-local" value="${escapeHtml(repairItem.completed_at ? String(repairItem.completed_at).slice(0, 16) : '')}">

                <label>Tested By</label>
                <input id="repair-tested-by-input" type="text" value="${escapeHtml(repairItem.tested_by || '')}">

                <label>Testing Notes</label>
                <textarea id="repair-testing-notes-input">${escapeHtml(repairItem.testing_notes || '')}</textarea>

                <label>Completion Notes</label>
                <textarea id="repair-completion-notes-input">${escapeHtml(repairItem.completion_notes || '')}</textarea>

                <label>Notes</label>
                <textarea id="repair-notes-input">${escapeHtml(repairItem.notes || '')}</textarea>

                <div class="repair-item-modal-buttons">
                    <button id="btn-save-repair-item" class="btn-save-repair-item">Save</button>
                    <button id="btn-cancel-repair-item" class="btn-cancel-repair-item">Cancel</button>
                </div>

                <div id="repair-item-error" class="repair-item-error"></div>

                <div class="repair-item-version-tag">project-repair-item-detail/grid.js | v2026_06_26_repair_item_dashboard_new | 2026-06-26</div>
            </div>
        </div>

        <div id="repair-update-modal-backdrop" class="repair-update-modal-backdrop">
            <div class="repair-update-modal">
                <h3>Add Repair Update</h3>

                <label>Update Title</label>
                <input id="repair-update-title-input" type="text" list="repair-update-title-options">

                <datalist id="repair-update-title-options">
                    <option value="General Update"></option>
                    <option value="Bathroom Update"></option>
                    <option value="Kitchen Update"></option>
                    <option value="Bedroom Update"></option>
                    <option value="Materials Update"></option>
                    <option value="Vendor Update"></option>
                    <option value="Testing Update"></option>
                    <option value="Completion Update"></option>
                </datalist>

                <label>Status Today</label>
                <input id="repair-update-status-input" type="text" list="repair-update-status-options">

                <datalist id="repair-update-status-options">
                    <option value="Not Started"></option>
                    <option value="In Progress"></option>
                    <option value="Waiting on Materials"></option>
                    <option value="Waiting on Vendor"></option>
                    <option value="Testing"></option>
                    <option value="Completed"></option>
                </datalist>

                <label>Work Done Today</label>
                <textarea id="repair-update-work-done-input"></textarea>

                <label>Where I Left Off</label>
                <textarea id="repair-update-left-off-input"></textarea>

                <label>Materials Needed</label>
                <textarea id="repair-update-materials-input"></textarea>

                <label>Next Step</label>
                <textarea id="repair-update-next-step-input"></textarea>

                <label>Notes</label>
                <textarea id="repair-update-notes-input"></textarea>

                <div class="repair-update-modal-buttons">
                    <button id="btn-save-repair-update" class="btn-save-repair-update">Save</button>
                    <button id="btn-cancel-repair-update" class="btn-cancel-repair-update">Cancel</button>
                </div>

                <div id="repair-update-error" class="repair-update-error"></div>

                <div class="repair-item-version-tag">project-repair-item-detail/grid.js | v2026_06_26_repair_item_dashboard_new | 2026-06-26</div>
            </div>
        </div>

        <div id="repair-confirm-backdrop" class="repair-confirm-backdrop">
            <div class="repair-confirm-modal">
                <div id="repair-confirm-title" class="repair-confirm-title">Confirm</div>
                <div id="repair-confirm-message" class="repair-confirm-message"></div>
                <div class="repair-confirm-buttons">
                    <button id="btn-repair-confirm-yes" class="btn-confirm-yes">YES</button>
                    <button id="btn-repair-confirm-no" class="btn-confirm-no">NO</button>
                </div>
            </div>
        </div>
    `;

    const editModal = document.getElementById('repair-item-modal-backdrop');
    const updateModal = document.getElementById('repair-update-modal-backdrop');
    const confirmBackdrop = document.getElementById('repair-confirm-backdrop');
    const confirmTitle = document.getElementById('repair-confirm-title');
    const confirmMessage = document.getElementById('repair-confirm-message');
    const confirmYes = document.getElementById('btn-repair-confirm-yes');
    const confirmNo = document.getElementById('btn-repair-confirm-no');
    const repairErrorBox = document.getElementById('repair-item-error');
    const updateErrorBox = document.getElementById('repair-update-error');

    function showRepairSection(sectionName) {
        document.querySelectorAll('.repair-item-tab-btn').forEach(button => {
            button.classList.toggle('active', button.dataset.section === sectionName);
        });

        document.querySelectorAll('.repair-item-panel').forEach(panel => {
            panel.classList.toggle('active', panel.dataset.sectionPanel === sectionName);
        });
    }

    function showConfirm(title, message) {
        confirmTitle.textContent = title;
        confirmMessage.textContent = message;
        confirmBackdrop.style.display = 'flex';

        return new Promise(resolve => {
            confirmYes.onclick = () => {
                confirmBackdrop.style.display = 'none';
                resolve(true);
            };

            confirmNo.onclick = () => {
                confirmBackdrop.style.display = 'none';
                resolve(false);
            };
        });
    }

    document.querySelectorAll('.repair-item-tab-btn').forEach(button => {
        button.addEventListener('click', () => {
            showRepairSection(button.dataset.section);
        });
    });

    document.getElementById('btn-edit-repair-item').addEventListener('click', () => {
        editModal.style.display = 'flex';
    });

    document.getElementById('btn-cancel-repair-item').addEventListener('click', () => {
        editModal.style.display = 'none';
    });

    document.getElementById('btn-add-repair-update').addEventListener('click', () => {
        updateModal.style.display = 'flex';
    });

    document.getElementById('btn-cancel-repair-update').addEventListener('click', () => {
        updateModal.style.display = 'none';
    });

    document.getElementById('btn-back-project-detail').addEventListener('click', () => {
        if (window.navigateTo) {
            window.navigateTo('facility-project-detail', {
                ...facility,
                project_id: projectId,
                facilities_id: facilityId
            });
        }
    });

    document.getElementById('btn-open-repair-materials').addEventListener('click', () => {
        if (window.navigateTo) {
            window.navigateTo('materials', {
                ...facility,
                project_id: projectId,
                project_scope_item_id: repairItemId,
                repair_item_id: repairItemId,
                project_name: projectName,
                facilities_id: facilityId
            });
        }
    });

    document.getElementById('btn-open-repair-pictures').addEventListener('click', () => {
        if (window.navigateTo) {
            window.navigateTo('project-photos', {
                ...facility,
                project_id: projectId,
                project_scope_item_id: repairItemId,
                repair_item_id: repairItemId,
                project_name: projectName,
                facilities_id: facilityId
            });
        }
    });

    document.getElementById('btn-open-repair-report').addEventListener('click', () => {
        alert('Repair item reports will be connected next.');
    });

    document.getElementById('btn-delete-repair-item').addEventListener('click', async () => {
        const shouldDelete = await showConfirm(
            'Delete Repair Item',
            'Are you sure you want to delete this repair item?'
        );

        if (!shouldDelete) return;

        const { error } = await deleteRepairItemDetail(repairItemId);

        if (error) {
            console.error('Delete repair item error:', error);
            alert('Could not delete repair item.');
            return;
        }

        if (window.navigateTo) {
            window.navigateTo('facility-project-detail', {
                ...facility,
                project_id: projectId,
                facilities_id: facilityId
            });
        }
    });

    document.getElementById('btn-save-repair-item').addEventListener('click', async () => {
        const payload = {
            location_number: document.getElementById('repair-location-number-input').value.trim(),
            resident_name: document.getElementById('repair-resident-name-input').value.trim(),
            resident_phone: document.getElementById('repair-resident-phone-input').value.trim(),
            area_name: document.getElementById('repair-area-name-input').value.trim(),
            item_name: document.getElementById('repair-item-name-input').value.trim(),
            work_needed: document.getElementById('repair-work-needed-input').value.trim(),
            repair_status: document.getElementById('repair-status-input').value.trim(),
            repair_priority: document.getElementById('repair-priority-input').value.trim(),
            started_at: document.getElementById('repair-started-at-input').value || null,
            completed_at: document.getElementById('repair-completed-at-input').value || null,
            tested_by: document.getElementById('repair-tested-by-input').value.trim(),
            testing_notes: document.getElementById('repair-testing-notes-input').value.trim(),
            completion_notes: document.getElementById('repair-completion-notes-input').value.trim(),
            notes: document.getElementById('repair-notes-input').value.trim()
        };

        if (!payload.location_number && !payload.area_name && !payload.item_name && !payload.work_needed) {
            repairErrorBox.textContent = 'Enter at least one repair detail.';
            return;
        }

        const { data, error } = await updateRepairItemDetail(repairItemId, payload);

        if (error) {
            console.error('Update repair item error:', error);
            repairErrorBox.textContent = 'Could not update repair item.';
            return;
        }

        editModal.style.display = 'none';

        if (window.navigateTo) {
            window.navigateTo('project-repair-item-detail', {
                ...facility,
                project_id: projectId,
                project_scope_item_id: data.id,
                repair_item_id: data.id,
                facilities_id: facilityId,
                project_name: projectName
            });
        }
    });

    document.getElementById('btn-save-repair-update').addEventListener('click', async () => {
        const updateTitle = document.getElementById('repair-update-title-input').value.trim();
        const status = document.getElementById('repair-update-status-input').value.trim();
        const workDone = document.getElementById('repair-update-work-done-input').value.trim();
        const leftOffAt = document.getElementById('repair-update-left-off-input').value.trim();
        const materialsNeeded = document.getElementById('repair-update-materials-input').value.trim();
        const nextStep = document.getElementById('repair-update-next-step-input').value.trim();
        const notes = document.getElementById('repair-update-notes-input').value.trim();

        if (!updateTitle && !status && !workDone && !leftOffAt && !materialsNeeded && !nextStep && !notes) {
            updateErrorBox.textContent = 'Enter at least one update detail.';
            return;
        }

        const payload = {
            project_id: projectId,
            facilities_id: facilityId,
            project_scope_item_id: repairItemId,
            update_title: updateTitle,
            status,
            work_done: workDone,
            left_off_at: leftOffAt,
            materials_needed: materialsNeeded,
            next_step: nextStep,
            vendor_needed: false,
            notes
        };

        const { error } = await createRepairItemUpdate(payload);

        if (error) {
            console.error('Insert repair update error:', error);
            updateErrorBox.textContent = 'Could not save repair update.';
            return;
        }

        updateModal.style.display = 'none';

        if (window.navigateTo) {
            window.navigateTo('project-repair-item-detail', {
                ...facility,
                project_id: projectId,
                project_scope_item_id: repairItemId,
                repair_item_id: repairItemId,
                facilities_id: facilityId,
                project_name: projectName
            });
        }
    });
}
