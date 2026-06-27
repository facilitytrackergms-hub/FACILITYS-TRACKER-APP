/*================================================================
FACILITY-PROJECT-DETAIL RENDER SECTIONS
LOCATION: /facilities_views/facility-project-detail/render-sections.js
VERSION: v2026_06_26_split_render_sections
UPDATED: 2026-06-26
================================================================*/

import {
    escapeHtml,
    formatDate,
    renderValue,
    renderPhoneLink,
    renderAddressLink,
    renderDetailRow,
    renderScopeItemButton
} from './helpers.js';

export function renderProjectTabs() {
    return `
        <div class="project-detail-tab-grid">
            <button type="button" class="project-detail-tab-btn active" data-section="request">REQUEST INFO</button>
            <button type="button" class="project-detail-tab-btn" data-section="location">LOCATION</button>
            <button type="button" class="project-detail-tab-btn" data-section="contacts">CONTACTS</button>
            <button type="button" class="project-detail-tab-btn" data-section="areas">AREAS / ITEMS</button>
            <button type="button" class="project-detail-tab-btn" data-section="updates">UPDATES</button>
            <button type="button" class="project-detail-tab-btn" data-section="materials">MATERIALS</button>
            <button type="button" class="project-detail-tab-btn" data-section="pictures">PICTURES</button>
        </div>
    `;
}

export function renderProjectPanels(project, projectName, projectScopeItems = [], projectUpdates = []) {
    return `
        ${renderRequestInfoPanel(project, projectName)}
        ${renderLocationPanel(project)}
        ${renderContactsPanel(project)}
        ${renderAreasPanel(projectScopeItems)}
        ${renderUpdatesPanel(projectUpdates)}
        ${renderMaterialsPanel()}
        ${renderPicturesPanel()}
    `;
}

function renderRequestInfoPanel(project, projectName) {
    return `
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
    `;
}

function renderLocationPanel(project) {
    return `
        <div class="project-detail-panel" data-section-panel="location">
            <div class="project-detail-info-box">
                <div class="project-detail-section-title">ACTUAL PROJECT LOCATION</div>
                ${renderDetailRow('PROJECT SITE TYPE', renderValue(project.project_site_type || ''))}
                ${renderDetailRow('PROJECT LOCATION / AREA NAME', renderValue(project.project_location_name || ''))}
                ${renderDetailRow('PROJECT ADDRESS', renderAddressLink(project.address || ''))}
            </div>
        </div>
    `;
}

function renderContactsPanel(project) {
    return `
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
    `;
}

function renderAreasPanel(projectScopeItems = []) {
    return `
        <div class="project-detail-panel" data-section-panel="areas">
            <div class="project-detail-info-box">
                <div class="project-detail-section-title">PROJECT SCOPE / AREA ITEMS</div>
                <div class="project-detail-summary">${projectScopeItems.length} AREA / ITEM${projectScopeItems.length === 1 ? '' : 'S'}</div>
                <button id="btn-add-project-scope-item" type="button" class="project-scope-add-btn">+ ADD AREA / ITEM</button>
                ${projectScopeItems.length ? projectScopeItems.map(renderScopeItemButton).join('') : `
                    <div class="project-detail-value">No area items yet.</div>
                `}
            </div>
        </div>
    `;
}

function renderUpdatesPanel(projectUpdates = []) {
    return `
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
    `;
}

function renderMaterialsPanel() {
    return `
        <div class="project-detail-panel" data-section-panel="materials">
            <div class="project-detail-info-box">
                <div class="project-detail-section-title">PROJECT MATERIALS</div>
                <button id="btn-open-materials" class="project-detail-main-btn">OPEN MATERIALS</button>
            </div>
        </div>
    `;
}

function renderPicturesPanel() {
    return `
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
    `;
}
