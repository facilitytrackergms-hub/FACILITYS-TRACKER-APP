/*================================================================
FACILITY-PROJECT-DETAIL GRID
LOCATION: /facilities_views/facility-project-detail/grid.js
VERSION: v2026_06_26_project_dashboard_cards
UPDATED: 2026-06-26
================================================================*/

import {
    fetchProjectDetail,
    updateProjectDetail,
    deleteProjectDetail,
    fetchProjectScopeItems,
    fetchProjectUpdates,
    createProjectUpdate
} from './data.js';

import { renderProjectPicturesPopup } from './project-pictures.js';

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

function renderValue(value) {
    return `<div class="project-detail-value">${escapeHtml(value || '')}</div>`;
}

function renderPhoneLink(value) {
    if (!value) return `<div class="project-detail-value"></div>`;

    return `
        <div class="project-detail-value">
            <a class="project-detail-link" href="tel:${escapeHtml(value)}">${escapeHtml(value)}</a>
        </div>
    `;
}

function renderAddressLink(value) {
    if (!value) return `<div class="project-detail-value"></div>`;

    return `
        <div class="project-detail-value">
            <a class="project-detail-link" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value)}" target="_blank">${escapeHtml(value)}</a>
        </div>
    `;
}

function renderDetailRow(label, valueHtml) {
    return `
        <div class="project-detail-row">
            <div class="project-detail-label">${escapeHtml(label)}</div>
            ${valueHtml}
        </div>
    `;
}

function getScopeItemTitle(item, index) {
    const location = item.location_number || item.area_name || `Area ${index + 1}`;
    const itemName = item.item_name || item.work_needed || 'Item';
    return `${location} — ${itemName}`;
}

function renderScopeItemButton(item, index) {
    return `
        <button type="button" class="project-scope-record-button" data-index="${index}">
            <div class="project-scope-record-title">${escapeHtml(getScopeItemTitle(item, index))}</div>
            <div class="project-scope-record-meta">${escapeHtml(item.resident_name || item.area_name || '')}</div>
            <div class="project-scope-record-meta">${escapeHtml(item.work_needed || '')}</div>
        </button>
    `;
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

    const projectScopeItems = await fetchProjectScopeItems(projectId);
    const projectUpdates = await fetchProjectUpdates(projectId);

    const facilityName = getFacilityName(facility);
    const projectName = project.project_name || project.name || 'Project';
    const facilityId = project.facilities_id || project.location_id || facility.id || null;
    const appointmentTimeValue = project.appointment_time ? String(project.appointment_time).slice(0, 16) : '';

    container.innerHTML = `
        <style>
            .project-detail-card { background:#ffffff; max-width:350px; margin:16px auto; padding:18px; border-radius:14px; box-shadow:0 4px 18px rgba(0,0,0,0.08); text-align:center; }
            .project-detail-title { color:#003b73; font-size:24px; font-weight:bold; margin-bottom:2px; line-height:1.15; overflow-wrap:anywhere; }
            .project-detail-subtitle { color:#003b73; font-size:13px; font-weight:bold; margin-bottom:12px; letter-spacing:2px; }

            .project-detail-tab-grid { display:grid; grid-template-columns:1fr 1fr; gap:7px; margin-bottom:12px; }
            .project-detail-tab-btn { background:#ffffff; color:#003b73; border:1px solid #003b73; border-radius:8px; min-height:40px; padding:7px 5px; font-size:11px; font-weight:bold; cursor:pointer; }
            .project-detail-tab-btn.active { background:#003b73; color:white; }

            .project-detail-panel { display:none; }
            .project-detail-panel.active { display:block; }
            .project-detail-info-box { border:1px solid #d6dee8; border-radius:10px; padding:12px; text-align:left; margin-bottom:14px; background:#f8fbff; }
            .project-detail-section-title { color:#003b73; font-size:13px; font-weight:bold; margin-bottom:10px; text-align:center; letter-spacing:1px; }
            .project-detail-summary { color:#667085; font-size:12px; font-weight:bold; text-align:center; margin-bottom:10px; }
            .project-detail-row { margin-bottom:10px; text-align:left; }
            .project-detail-label { color:#003b73; font-size:11px; font-weight:bold; margin-bottom:3px; text-align:left; }
            .project-detail-value { color:#111827; font-size:14px; line-height:1.35; margin-bottom:0; white-space:pre-wrap; text-align:left; overflow-wrap:anywhere; word-break:break-word; }
            .project-detail-link { color:#003b73; font-weight:bold; text-decoration:underline; display:inline-block; max-width:100%; overflow-wrap:anywhere; word-break:break-word; text-align:left; }

            .project-scope-record-button { width:100%; border:1px solid #d6dee8; border-radius:10px; padding:10px; margin-top:8px; background:#ffffff; text-align:left; cursor:pointer; }
            .project-scope-record-title { color:#003b73; font-size:14px; font-weight:bold; margin-bottom:3px; overflow-wrap:anywhere; }
            .project-scope-record-meta { color:#111827; font-size:12px; margin-bottom:3px; overflow-wrap:anywhere; }

            .project-detail-button-row { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:12px; }
            .project-detail-action-btn { background:#003b73; color:white; border:none; border-radius:9px; min-height:48px; font-size:14px; font-weight:bold; cursor:pointer; }
            .project-detail-delete-btn { background:#dc2626; color:yellow; border:none; border-radius:9px; min-height:48px; font-size:14px; font-weight:bold; cursor:pointer; }
            .project-detail-save-btn { background:#22a843; color:white; border:none; border-radius:9px; width:100%; min-height:50px; font-size:15px; font-weight:bold; cursor:pointer; margin-top:8px; }
            .project-detail-main-btn { background:#003b73; color:white; border:none; border-radius:9px; width:100%; min-height:50px; font-size:15px; font-weight:bold; cursor:pointer; margin-top:8px; }
            .project-detail-two-btn-row { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:8px; }
            .project-detail-half-btn { background:#003b73; color:white; border:none; border-radius:9px; min-height:50px; font-size:14px; font-weight:bold; cursor:pointer; }
            .project-detail-back-btn { background:#747d8c; color:white; border:none; border-radius:9px; width:100%; min-height:48px; font-size:15px; font-weight:bold; cursor:pointer; margin-top:12px; }
            .project-detail-version-tag { border-top:1px solid #d6dee8; margin-top:18px; padding-top:10px; font-size:10px; color:#7d8ba0; text-align:center; }
            .project-update-record-button { width:100%; border:1px solid #d6dee8; border-radius:10px; padding:10px; margin-top:8px; background:#ffffff; text-align:left; cursor:pointer; }
            .project-update-record-button-title { color:#003b73; font-size:14px; font-weight:bold; margin-bottom:3px; }
            .project-update-record-button-status { color:#111827; font-size:12px; margin-bottom:3px; }
            .project-update-record-button-date { color:#667085; font-size:11px; }

            .project-detail-modal-backdrop,
            .project-update-modal-backdrop,
            .project-scope-detail-backdrop,
            .project-custom-popup-backdrop { position:fixed; inset:0; background:rgba(0,0,0,0.45); display:none; align-items:center; justify-content:center; z-index:9999; }

            .project-detail-modal,
            .project-update-modal,
            .project-scope-detail-modal,
            .project-custom-popup { background:white; width:90%; max-width:360px; border-radius:12px; padding:18px; box-shadow:0 4px 18px rgba(0,0,0,0.25); text-align:left; max-height:90vh; overflow-y:auto; }

            .project-custom-popup { text-align:center; }

            .project-detail-modal h3,
            .project-update-modal h3,
            .project-scope-detail-modal h3 { margin:0 0 14px; text-align:center; color:#003b73; }

            .project-custom-popup-title { color:#003b73; font-size:18px; font-weight:bold; margin-bottom:10px; }
            .project-custom-popup-message { color:#1f2937; font-size:14px; line-height:1.35; margin-bottom:16px; }
            .project-custom-popup-buttons { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
            .project-custom-popup-buttons button { border:none; border-radius:8px; padding:11px; font-size:14px; font-weight:bold; cursor:pointer; }
            .btn-popup-yes { background:#dc2626; color:yellow; }
            .btn-popup-no { background:#777; color:white; }

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
            <div class="project-detail-subtitle">${escapeHtml(facilityName)} PROJECT DASHBOARD</div>

            <div class="project-detail-tab-grid">
                <button type="button" class="project-detail-tab-btn active" data-section="request">REQUEST INFO</button>
                <button type="button" class="project-detail-tab-btn" data-section="location">LOCATION</button>
                <button type="button" class="project-detail-tab-btn" data-section="contacts">CONTACTS</button>
                <button type="button" class="project-detail-tab-btn" data-section="areas">AREAS / ITEMS</button>
                <button type="button" class="project-detail-tab-btn" data-section="updates">UPDATES</button>
                <button type="button" class="project-detail-tab-btn" data-section="materials">MATERIALS</button>
                <button type="button" class="project-detail-tab-btn" data-section="pictures">PICTURES</button>
            </div>

            <div class="project-detail-panel active" data-section-panel="request">
                <div class="project-detail-info-box">
                    <div class="project-detail-section-title">PROJECT REQUEST INFORMATION</div>
                    ${renderDetailRow('PROJECT NAME', renderValue(projectName))}
                    ${renderDetailRow('PROJECT DESCRIPTION', renderValue(project.description || ''))}
                    ${renderDetailRow('TYPE', renderValue(project.type || ''))}
                    ${renderDetailRow('STATUS', renderValue(project.status || 'Open'))}
                    ${renderDetailRow('REQUESTED BY NAME', renderValue(project.requested_by_name || ''))}
                    ${renderDetailRow('REQUESTED BY TITLE', renderValue(project.requested_by_title || ''))}
                    ${renderDetailRow('REQUESTED BY PHONE', renderPhoneLink(project.phone_number || ''))}
                    ${renderDetailRow('APPOINTMENT TIME', renderValue(formatDate(project.appointment_time)))}
                    ${renderDetailRow('REMINDER', renderValue(project.reminder || ''))}
                    ${renderDetailRow('NOTES', renderValue(project.notes || ''))}
                </div>
            </div>

            <div class="project-detail-panel" data-section-panel="location">
                <div class="project-detail-info-box">
                    <div class="project-detail-section-title">ACTUAL PROJECT LOCATION</div>
                    ${renderDetailRow('PROJECT SITE TYPE', renderValue(project.project_site_type || ''))}
                    ${renderDetailRow('PROJECT LOCATION / AREA NAME', renderValue(project.project_location_name || ''))}
                    ${renderDetailRow('PROJECT ADDRESS', renderAddressLink(project.address || ''))}
                </div>
            </div>

            <div class="project-detail-panel" data-section-panel="contacts">
                <div class="project-detail-info-box">
                    <div class="project-detail-section-title">PROJECT CONTACTS</div>
                    ${renderDetailRow('REQUESTED BY NAME', renderValue(project.requested_by_name || ''))}
                    ${renderDetailRow('REQUESTED BY TITLE', renderValue(project.requested_by_title || ''))}
                    ${renderDetailRow('REQUESTED BY PHONE', renderPhoneLink(project.phone_number || ''))}
                    ${renderDetailRow('ON-SITE CONTACT NAME', renderValue(project.project_contact_name || ''))}
                    ${renderDetailRow('ON-SITE CONTACT PHONE', renderPhoneLink(project.project_contact_phone || ''))}
                    ${renderDetailRow('PROPERTY / FACILITY CONTACT NAME', renderValue(project.property_manager_name || ''))}
                    ${renderDetailRow('PROPERTY / FACILITY CONTACT PHONE', renderPhoneLink(project.property_manager_phone || ''))}
                </div>
            </div>

            <div class="project-detail-panel" data-section-panel="areas">
                <div class="project-detail-info-box">
                    <div class="project-detail-section-title">PROJECT SCOPE / AREA ITEMS</div>
                    <div class="project-detail-summary">${projectScopeItems.length} AREA / ITEM${projectScopeItems.length === 1 ? '' : 'S'}</div>
                    ${projectScopeItems.length ? projectScopeItems.map(renderScopeItemButton).join('') : `
                        <div class="project-detail-value">No area items yet.</div>
                    `}
                </div>
            </div>

            <div class="project-detail-panel" data-section-panel="updates">
                <div class="project-detail-info-box">
                    <div class="project-detail-section-title">PROJECT UPDATES</div>
                    <button id="btn-add-project-update" class="project-detail-main-btn">ADD PROJECT UPDATE</button>
                    ${projectUpdates.length ? projectUpdates.map(update => `
                        <button type="button" class="project-update-record-button" data-id="${update.id}">
                            <div class="project-update-record-button-title">${escapeHtml(update.update_title || 'Project Update')}</div>
                            <div class="project-update-record-button-status">${escapeHtml(update.status || '')}</div>
                            <div class="project-update-record-button-date">${escapeHtml(formatDate(update.created_at))}</div>
                        </button>
                    `).join('') : `
                        <div class="project-detail-value" style="margin-top:10px;">No project updates yet.</div>
                    `}
                </div>
            </div>

            <div class="project-detail-panel" data-section-panel="materials">
                <div class="project-detail-info-box">
                    <div class="project-detail-section-title">PROJECT MATERIALS</div>
                    <button id="btn-open-materials" class="project-detail-main-btn">OPEN MATERIALS</button>
                </div>
            </div>

            <div class="project-detail-panel" data-section-panel="pictures">
                <div class="project-detail-info-box">
                    <div class="project-detail-section-title">PROJECT PICTURES</div>
                    <div class="project-detail-two-btn-row">
                        <button id="btn-take-project-picture" class="project-detail-half-btn">TAKE PICTURE</button>
                        <button id="btn-see-project-pictures" class="project-detail-half-btn">SEE PICTURES</button>
                    </div>
                    <button id="btn-open-pictures" class="project-detail-main-btn">OPEN PICTURES</button>
                </div>
            </div>

            <div class="project-detail-button-row" style="margin-top:12px;">
                <button id="btn-edit-project-detail" class="project-detail-action-btn">⚙️ EDIT</button>
                <button id="btn-delete-project-detail" class="project-detail-delete-btn">🗑 DELETE</button>
            </div>

            <button id="btn-save-project-and-back" class="project-detail-save-btn">💾 SAVE</button>
            <button id="btn-back-projects" class="project-detail-back-btn">⬅️ BACK</button>

            <div class="project-detail-version-tag">facility-project-detail/grid.js | v2026_06_26_project_dashboard_cards | 2026-06-26</div>
        </div>

        <div id="project-scope-detail-backdrop" class="project-scope-detail-backdrop">
            <div class="project-scope-detail-modal">
                <h3>Area / Item Detail</h3>
                <div id="project-scope-detail-content"></div>
                <button id="btn-close-scope-detail" class="project-detail-back-btn">CLOSE</button>
                <div class="project-detail-version-tag">facility-project-detail/grid.js | v2026_06_26_project_dashboard_cards | 2026-06-26</div>
            </div>
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
                    <option value="Open" ${(project.status || 'Open') === 'Open' ? 'selected' : ''}>Open</option>
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

                <label>Project Site Type</label>
                <input id="project-detail-site-type-input" type="text" value="${escapeHtml(project.project_site_type || '')}">

                <label>Requested By Name</label>
                <input id="project-detail-requested-by-name-input" type="text" value="${escapeHtml(project.requested_by_name || '')}">

                <label>Requested By Title</label>
                <input id="project-detail-requested-by-title-input" type="text" value="${escapeHtml(project.requested_by_title || '')}">

                <label>Requested By Phone</label>
                <input id="project-detail-phone-number-input" type="tel" value="${escapeHtml(project.phone_number || '')}">

                <label>Project Location / Area Name</label>
                <input id="project-detail-location-name-input" type="text" value="${escapeHtml(project.project_location_name || '')}">

                <label>Project Address</label>
                <input id="project-detail-address-input" type="text" value="${escapeHtml(project.address || '')}">

                <label>On-Site Contact Name</label>
                <input id="project-detail-contact-name-input" type="text" value="${escapeHtml(project.project_contact_name || '')}">

                <label>On-Site Contact Phone</label>
                <input id="project-detail-contact-phone-input" type="tel" value="${escapeHtml(project.project_contact_phone || '')}">

                <label>Property / Facility Contact Name</label>
                <input id="project-detail-manager-name-input" type="text" value="${escapeHtml(project.property_manager_name || '')}">

                <label>Property / Facility Contact Phone</label>
                <input id="project-detail-manager-phone-input" type="tel" value="${escapeHtml(project.property_manager_phone || '')}">

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

                <div class="project-detail-version-tag">facility-project-detail/grid.js | v2026_06_26_project_dashboard_cards | 2026-06-26</div>
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

                <div class="project-detail-version-tag">facility-project-detail/grid.js | v2026_06_26_project_dashboard_cards | 2026-06-26</div>
            </div>
        </div>

        <div id="project-custom-popup-backdrop" class="project-custom-popup-backdrop">
            <div class="project-custom-popup">
                <div id="project-custom-popup-title" class="project-custom-popup-title">Confirm</div>
                <div id="project-custom-popup-message" class="project-custom-popup-message"></div>
                <div class="project-custom-popup-buttons">
                    <button id="btn-project-popup-yes" class="btn-popup-yes">YES</button>
                    <button id="btn-project-popup-no" class="btn-popup-no">NO</button>
                </div>
            </div>
        </div>
    `;

    const modalBackdrop = document.getElementById('project-detail-modal-backdrop');
    const updateModalBackdrop = document.getElementById('project-update-modal-backdrop');
    const scopeDetailBackdrop = document.getElementById('project-scope-detail-backdrop');
    const scopeDetailContent = document.getElementById('project-scope-detail-content');
    const errorBox = document.getElementById('project-detail-error');
    const updateErrorBox = document.getElementById('project-update-error');
    const popupBackdrop = document.getElementById('project-custom-popup-backdrop');
    const popupTitle = document.getElementById('project-custom-popup-title');
    const popupMessage = document.getElementById('project-custom-popup-message');
    const popupYesButton = document.getElementById('btn-project-popup-yes');
    const popupNoButton = document.getElementById('btn-project-popup-no');

    function showConfirmPopup(title, message) {
        popupTitle.textContent = title;
        popupMessage.textContent = message;
        popupBackdrop.style.display = 'flex';

        return new Promise(resolve => {
            popupYesButton.onclick = () => {
                popupBackdrop.style.display = 'none';
                resolve(true);
            };

            popupNoButton.onclick = () => {
                popupBackdrop.style.display = 'none';
                resolve(false);
            };
        });
    }

    function showProjectSection(sectionName) {
        document.querySelectorAll('.project-detail-tab-btn').forEach(button => {
            button.classList.toggle('active', button.dataset.section === sectionName);
        });

        document.querySelectorAll('.project-detail-panel').forEach(panel => {
            panel.classList.toggle('active', panel.dataset.sectionPanel === sectionName);
        });
    }

    function openScopeItemDetail(item, index) {
        scopeDetailContent.innerHTML = `
            <div class="project-detail-info-box">
                <div class="project-detail-section-title">${escapeHtml(getScopeItemTitle(item, index))}</div>
                ${renderDetailRow('LOCATION / ROOM / APARTMENT NUMBER', renderValue(item.location_number || ''))}
                ${renderDetailRow('RESIDENT / AREA CONTACT NAME', renderValue(item.resident_name || ''))}
                ${renderDetailRow('RESIDENT / AREA CONTACT PHONE', renderPhoneLink(item.resident_phone || ''))}
                ${renderDetailRow('AREA / SECTION', renderValue(item.area_name || ''))}
                ${renderDetailRow('ITEM / COMPONENT', renderValue(item.item_name || ''))}
                ${renderDetailRow('WORK NEEDED', renderValue(item.work_needed || ''))}
                ${renderDetailRow('NOTES', renderValue(item.notes || ''))}
            </div>
        `;

        scopeDetailBackdrop.style.display = 'flex';
    }

    document.querySelectorAll('.project-detail-tab-btn').forEach(button => {
        button.addEventListener('click', () => {
            showProjectSection(button.dataset.section);
        });
    });

    document.querySelectorAll('.project-scope-record-button').forEach(button => {
        button.addEventListener('click', () => {
            const index = Number(button.dataset.index);
            const item = projectScopeItems[index];
            if (item) openScopeItemDetail(item, index);
        });
    });

    document.getElementById('btn-close-scope-detail').addEventListener('click', () => {
        scopeDetailBackdrop.style.display = 'none';
    });

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
        renderProjectPicturesPopup({
            projectId,
            facilitiesId: facilityId,
            projectName
        });
    });

    document.getElementById('btn-take-project-picture').addEventListener('click', () => {
        renderProjectPicturesPopup({
            projectId,
            facilitiesId: facilityId,
            projectName
        });
    });

    document.getElementById('btn-see-project-pictures').addEventListener('click', () => {
        renderProjectPicturesPopup({
            projectId,
            facilitiesId: facilityId,
            projectName
        });
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

    document.getElementById('btn-save-project-and-back').addEventListener('click', async () => {
        const saveButton = document.getElementById('btn-save-project-and-back');

        saveButton.disabled = true;
        saveButton.textContent = 'SAVING...';

        const payload = {
            name: projectName,
            project_name: projectName,
            type: project.type || '',
            status: project.status || 'Open',
            project_site_type: project.project_site_type || '',
            requested_by_name: project.requested_by_name || '',
            requested_by_title: project.requested_by_title || '',
            phone_number: project.phone_number || '',
            project_location_name: project.project_location_name || '',
            address: project.address || '',
            project_contact_name: project.project_contact_name || '',
            project_contact_phone: project.project_contact_phone || '',
            property_manager_name: project.property_manager_name || '',
            property_manager_phone: project.property_manager_phone || '',
            appointment_time: project.appointment_time || null,
            reminder: project.reminder || '',
            description: project.description || '',
            notes: project.notes || ''
        };

        const { error } = await updateProjectDetail(projectId, payload);

        if (error) {
            console.error('Save project detail error:', error);
            saveButton.disabled = false;
            saveButton.textContent = '💾 SAVE';
            alert('Could not save project.');
            return;
        }

        if (window.navigateTo) {
            window.navigateTo('facilities-details', {
                ...facility,
                id: facilityId,
                facilities_id: facilityId
            });
        }
    });

    document.getElementById('btn-delete-project-detail').addEventListener('click', async () => {
        const shouldDelete = await showConfirmPopup(
            'Delete Project',
            'Are you sure you want to delete this project?'
        );

        if (!shouldDelete) return;

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
        const siteTypeInput = document.getElementById('project-detail-site-type-input').value.trim();
        const requestedByNameInput = document.getElementById('project-detail-requested-by-name-input').value.trim();
        const requestedByTitleInput = document.getElementById('project-detail-requested-by-title-input').value.trim();
        const phoneNumberInput = document.getElementById('project-detail-phone-number-input').value.trim();
        const locationNameInput = document.getElementById('project-detail-location-name-input').value.trim();
        const addressInput = document.getElementById('project-detail-address-input').value.trim();
        const projectContactNameInput = document.getElementById('project-detail-contact-name-input').value.trim();
        const projectContactPhoneInput = document.getElementById('project-detail-contact-phone-input').value.trim();
        const propertyManagerNameInput = document.getElementById('project-detail-manager-name-input').value.trim();
        const propertyManagerPhoneInput = document.getElementById('project-detail-manager-phone-input').value.trim();
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
            project_site_type: siteTypeInput,
            requested_by_name: requestedByNameInput,
            requested_by_title: requestedByTitleInput,
            phone_number: phoneNumberInput,
            project_location_name: locationNameInput,
            address: addressInput,
            project_contact_name: projectContactNameInput,
            project_contact_phone: projectContactPhoneInput,
            property_manager_name: propertyManagerNameInput,
            property_manager_phone: propertyManagerPhoneInput,
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
