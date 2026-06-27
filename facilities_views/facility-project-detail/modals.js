/*================================================================
FACILITY-PROJECT-DETAIL MODALS
LOCATION: /facilities_views/facility-project-detail/modals.js
VERSION: v2026_06_26_split_modals
UPDATED: 2026-06-26
================================================================*/

import { escapeHtml } from './helpers.js';

function selectedAttr(currentValue, optionValue, fallbackValue = '') {
    const cleanCurrent = currentValue || fallbackValue;
    return cleanCurrent === optionValue ? 'selected' : '';
}

export function renderProjectDetailModals(project, projectName, appointmentTimeValue) {
    return `
        ${renderScopeDetailModal()}
        ${renderAddScopeItemModal()}
        ${renderEditProjectModal(project, projectName, appointmentTimeValue)}
        ${renderProjectUpdateModal()}
        ${renderConfirmPopupModal()}
    `;
}

function renderScopeDetailModal() {
    return `
        <div id="project-scope-detail-backdrop" class="project-scope-detail-backdrop">
            <div class="project-scope-detail-modal">
                <h3>Area / Item Detail</h3>
                <div id="project-scope-detail-content"></div>
                <button id="btn-close-scope-detail" class="project-detail-back-btn">CLOSE</button>
                <div class="project-detail-version-tag">facility-project-detail/modals.js | v2026_06_26_split_modals | 2026-06-26</div>
            </div>
        </div>
    `;
}

function renderAddScopeItemModal() {
    return `
        <div id="project-add-scope-backdrop" class="project-scope-detail-backdrop">
            <div class="project-detail-modal">
                <h3>Add Area / Item</h3>

                <label>Location / Room / Apartment Number</label>
                <input id="add-scope-location-number-input" type="text" placeholder="Apartment #2, Room 203, Cottage">

                <label>Resident / Area Contact Name</label>
                <input id="add-scope-resident-name-input" type="text" placeholder="Resident or area contact">

                <label>Resident / Area Contact Phone</label>
                <input id="add-scope-resident-phone-input" type="tel" placeholder="Phone number">

                <label>Area / Section</label>
                <input id="add-scope-area-name-input" type="text" placeholder="Bathroom, Kitchen, Master Room">

                <label>Item / Component</label>
                <input id="add-scope-item-name-input" type="text" placeholder="Sink, Window, Ceiling, Floor">

                <label>Work Needed</label>
                <input id="add-scope-work-needed-input" type="text" placeholder="Repair leak, Replace, Paint, Inspect">

                <label>Repair Status</label>
                <select id="add-scope-repair-status-input">
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Waiting on Materials">Waiting on Materials</option>
                    <option value="Waiting on Vendor">Waiting on Vendor</option>
                    <option value="Testing">Testing</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                </select>

                <label>Repair Priority</label>
                <select id="add-scope-repair-priority-input">
                    <option value="">None</option>
                    <option value="Low">Low</option>
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                </select>

                <label>Notes</label>
                <textarea id="add-scope-notes-input"></textarea>

                <div class="project-detail-modal-buttons">
                    <button id="btn-save-project-scope-item" class="btn-save-project-detail">Save</button>
                    <button id="btn-cancel-project-scope-item" class="btn-cancel-project-detail">Cancel</button>
                </div>

                <div id="project-add-scope-error" class="project-detail-error"></div>

                <div class="project-detail-version-tag">facility-project-detail/modals.js | v2026_06_26_split_modals | 2026-06-26</div>
            </div>
        </div>
    `;
}

function renderEditProjectModal(project, projectName, appointmentTimeValue) {
    return `
        <div id="project-detail-modal-backdrop" class="project-detail-modal-backdrop">
            <div class="project-detail-modal">
                <h3>Edit Project</h3>

                <label>Project Name</label>
                <input id="project-detail-name-input" type="text" value="${escapeHtml(projectName)}">

                <label>Type</label>
                <input id="project-detail-type-input" type="text" list="project-detail-type-options" value="${escapeHtml(project.type || '')}">

                <label>Status</label>
                <select id="project-detail-status-input">
                    <option value="Open" ${selectedAttr(project.status, 'Open', 'Open')}>Open</option>
                    <option value="In Progress" ${selectedAttr(project.status, 'In Progress')}>In Progress</option>
                    <option value="Waiting on Materials" ${selectedAttr(project.status, 'Waiting on Materials')}>Waiting on Materials</option>
                    <option value="Waiting on Vendor" ${selectedAttr(project.status, 'Waiting on Vendor')}>Waiting on Vendor</option>
                    <option value="On Hold" ${selectedAttr(project.status, 'On Hold')}>On Hold</option>
                    <option value="Completed" ${selectedAttr(project.status, 'Completed')}>Completed</option>
                    <option value="Cancelled" ${selectedAttr(project.status, 'Cancelled')}>Cancelled</option>
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

                <div class="project-detail-version-tag">facility-project-detail/modals.js | v2026_06_26_split_modals | 2026-06-26</div>
            </div>
        </div>
    `;
}

function renderProjectUpdateModal() {
    return `
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

                <div class="project-detail-version-tag">facility-project-detail/modals.js | v2026_06_26_split_modals | 2026-06-26</div>
            </div>
        </div>
    `;
}

function renderConfirmPopupModal() {
    return `
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
}
