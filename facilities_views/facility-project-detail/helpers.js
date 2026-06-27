/*================================================================
FACILITY-PROJECT-DETAIL HELPERS
LOCATION: /facilities_views/facility-project-detail/helpers.js
VERSION: v2026_06_26_split_helpers
UPDATED: 2026-06-26
================================================================*/

export function escapeHtml(value) {
    return String(value || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

export function getProjectId(context) {
    if (typeof context === 'object' && context !== null) {
        return context.project_id || context.projectId || context.id;
    }

    return context;
}

export function getFacilityContext(context) {
    if (typeof context === 'object' && context !== null) {
        return context.facility || context;
    }

    return {};
}

export function getFacilityName(context) {
    const facility = getFacilityContext(context);
    return facility?.abbreviation || facility?.number_name || facility?.name || 'Facility';
}

export function formatDate(value) {
    if (!value) return '';
    return new Date(value).toLocaleString();
}

export function renderValue(value) {
    return `<div class="project-detail-value">${escapeHtml(value || '')}</div>`;
}

export function renderPhoneLink(value) {
    if (!value) return `<div class="project-detail-value"></div>`;

    return `
        <div class="project-detail-value">
            <a class="project-detail-link" href="tel:${escapeHtml(value)}">${escapeHtml(value)}</a>
        </div>
    `;
}

export function renderAddressLink(value) {
    if (!value) return `<div class="project-detail-value"></div>`;

    return `
        <div class="project-detail-value">
            <a class="project-detail-link" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value)}" target="_blank">${escapeHtml(value)}</a>
        </div>
    `;
}

export function renderDetailRow(label, valueHtml) {
    return `
        <div class="project-detail-row">
            <div class="project-detail-label">${escapeHtml(label)}</div>
            ${valueHtml}
        </div>
    `;
}

export function getScopeItemTitle(item, index) {
    const location = item.location_number || item.area_name || `Area ${index + 1}`;
    const itemName = item.item_name || item.work_needed || 'Item';
    return `${location} — ${itemName}`;
}

export function renderScopeItemButton(item, index) {
    return `
        <button type="button" class="project-scope-record-button" data-index="${index}">
            <div class="project-scope-record-title">${escapeHtml(getScopeItemTitle(item, index))}</div>
            <div class="project-scope-record-meta">${escapeHtml(item.resident_name || item.area_name || '')}</div>
            <div class="project-scope-record-meta">${escapeHtml(item.work_needed || '')}</div>
        </button>
    `;
}
