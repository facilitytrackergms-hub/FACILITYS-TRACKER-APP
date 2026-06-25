/* ================================================================
   FACILITY TRACKER MODULAR VIEW SYSTEM
   PURPOSE: Facility Inspections UI Builder
   LOCATION: /facilities_views/facility-inspections/ui.js
   VERSION: v2026_06_24_ui_clickable_item_dashboard
   UPDATED: 2026-06-24
================================================================ */

export function escapeHtml(value) {
    return String(value || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

export function formatDate(value) {
    if (!value) return '';
    return new Date(value).toLocaleString();
}

function normalizeResult(value) {
    return String(value || '').trim().toLowerCase();
}

function formatFailReasons(value) {
    if (!value) return '';

    let parsedValue = value;

    if (typeof value === 'string') {
        const trimmedValue = value.trim();

        if (!trimmedValue) return '';

        try {
            parsedValue = JSON.parse(trimmedValue);
        } catch {
            return trimmedValue;
        }
    }

    if (Array.isArray(parsedValue)) {
        return parsedValue
            .map(reason => {
                if (typeof reason === 'string') return reason.trim();

                return String(
                    reason?.reason ||
                    reason?.description ||
                    reason?.text ||
                    reason?.notes ||
                    ''
                ).trim();
            })
            .filter(Boolean)
            .join(', ');
    }

    if (typeof parsedValue === 'object') {
        return String(
            parsedValue.reason ||
            parsedValue.description ||
            parsedValue.text ||
            parsedValue.notes ||
            ''
        ).trim();
    }

    return String(parsedValue || '').trim();
}




function getSessionItems(session, sessionItemsBySessionId = {}) {
    const key = String(session?.id || '');
    return sessionItemsBySessionId[key] || session?.items || session?.session_items || [];
}

function buildSavedInspectionItemsHtml(items) {
    if (!items.length) {
        return `
            <div class="inspection-record-value">
                No items inspected yet.
            </div>
        `;
    }

    return items.map((item, index) => {
        const result = normalizeResult(item.result);
        const resultLabel = result ? result.toUpperCase() : 'NOT ENTERED';
        const itemClass = result === 'fail'
            ? 'inspection-session-item-summary inspection-session-item-fail btn-open-inspection-item-dashboard'
            : 'inspection-session-item-summary btn-open-inspection-item-dashboard';

        const failReasons = formatFailReasons(
            item.fail_reasons ||
            item.fail_reason ||
            item.fail_notes ||
            item.reason ||
            item.notes
        );

        const failReasonsHtml = result === 'fail'
            ? `
                <div class="inspection-record-value inspection-fail-reason-line">
                    <strong>Fail Reason:</strong> ${escapeHtml(failReasons || 'Not entered')}
                </div>
            `
            : '';

        return `
            <div 
                class="${itemClass}"
                data-item-id="${escapeHtml(item.id)}"
                data-session-id="${escapeHtml(item.inspection_session_id || '')}"
                role="button"
                tabindex="0"
            >
                <div class="inspection-record-value">
                    <strong>${index + 1}. Location:</strong> ${escapeHtml(item.location_name || 'Not entered')}
                </div>
                <div class="inspection-record-value">
                    <strong>Item:</strong> ${escapeHtml(item.item_name || 'Not entered')}
                </div>
                <div class="inspection-record-value inspection-result-${escapeHtml(result || 'none')}">
                    <strong>Status:</strong> ${escapeHtml(resultLabel)}
                </div>
                ${failReasonsHtml}
            </div>
        `;
    }).join('');
}
function buildSavedInspectionCardsHtml(sessions = [], sessionItemsBySessionId = {}) {
    if (!sessions.length) {
        return `<div class="inspection-record-value">No inspections saved yet.</div>`;
    }

    return sessions.map(session => {
        const items = getSessionItems(session, sessionItemsBySessionId);
        const recordClass = 'inspection-record';
        const inspectionName = session.session_notes || 'Inspection';

        return `
            <div class="${recordClass}">
                <div class="inspection-record-title">
                    ${escapeHtml(inspectionName)}
                </div>
                <div class="inspection-record-value">
                    Date: ${escapeHtml(formatDate(session.created_at))}
                </div>
                <div class="inspection-record-value">
                    Inspected By: ${escapeHtml(session.inspected_by || '')}
                </div>
                <div class="inspection-record-value">
                    Status: ${escapeHtml(session.status || '')}
                </div>

                ${buildSavedInspectionItemsHtml(items)}

                <div class="inspection-record-actions">
                    <button class="inspection-small-btn btn-continue-inspection-session" data-id="${session.id}">INSPECT ITEM</button>
                    <button class="inspection-small-btn btn-view-inspection-report" data-id="${session.id}">VIEW REPORT</button>
                    <button class="inspection-delete-btn inspection-record-delete btn-delete-inspection-session" data-id="${session.id}">🗑 Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

export function buildLoginMissingHtml() {
    return `
        <div style="background:white;max-width:350px;margin:16px auto;padding:18px;border-radius:14px;text-align:center;">
            <div style="color:red;font-weight:bold;">Login user not found.</div>
            <button style="margin-top:12px;width:100%;min-height:48px;background:#003b73;color:white;border:none;border-radius:4px;font-weight:bold;" onclick="window.navigateTo && window.navigateTo('login')">GO TO LOGIN</button>
            <div style="border-top:1px solid #d6dee8;margin-top:18px;padding-top:10px;font-size:10px;color:#7d8ba0;text-align:center;">facility-inspections/ui.js | v2026_06_24_ui_clickable_item_dashboard</div>
        </div>
    `;
}

export function buildInspectionGridHtml({
    facilityName = 'Facility',
    appUser = {},
    sessions = [],
    sessionItemsBySessionId = {}
} = {}) {
    return `
        <style>
            .inspection-card {
                background:#ffffff;
                max-width:350px;
                margin:16px auto;
                padding:18px;
                border-radius:14px;
                box-shadow:0 4px 18px rgba(0,0,0,0.08);
                text-align:center;
            }

            .inspection-title {
                color:#003b73;
                font-size:24px;
                font-weight:bold;
                margin-bottom:2px;
            }

            .inspection-subtitle {
                color:#003b73;
                font-size:13px;
                font-weight:bold;
                margin-bottom:16px;
                letter-spacing:2px;
            }

            .inspection-box {
                border:1px solid #d6dee8;
                border-radius:10px;
                padding:12px;
                text-align:left;
                margin-bottom:14px;
                background:#f8fbff;
            }

            .inspection-label {
                color:#003b73;
                font-size:12px;
                font-weight:bold;
                margin-top:10px;
                margin-bottom:4px;
            }

            .inspection-input,
            .inspection-textarea {
                width:100%;
                padding:10px;
                border:1px solid #bbb;
                border-radius:6px;
                font-size:15px;
                box-sizing:border-box;
            }

            .inspection-input[readonly] {
                background:#eef2f7;
                color:#111827;
                font-weight:bold;
            }

            .inspection-textarea {
                min-height:75px;
                resize:vertical;
            }

            .inspection-main-btn {
                background:#003b73;
                color:white;
                border:none;
                border-radius:4px;
                width:100%;
                min-height:54px;
                font-size:15px;
                font-weight:bold;
                cursor:pointer;
                margin-top:8px;
            }

            .inspection-action-grid {
                display:grid;
                grid-template-columns:1fr 1fr;
                gap:8px;
                margin-top:10px;
            }

            .inspection-single-grid {
                display:grid;
                grid-template-columns:1fr;
                gap:8px;
                margin-top:10px;
            }

            .inspection-square-btn {
                color:white;
                border:none;
                border-radius:4px;
                min-height:54px;
                font-size:13px;
                font-weight:bold;
                cursor:pointer;
                width:100%;
                padding:8px 6px;
            }

            .inspection-mini-btn {
                color:white;
                border:none;
                border-radius:4px;
                min-height:38px;
                font-size:12px;
                font-weight:bold;
                cursor:pointer;
                width:100%;
                padding:6px;
            }

            .inspection-btn-blue {
                background:#003b73;
            }

            .inspection-btn-green {
                background:#16a34a;
            }

            .inspection-btn-gray {
                background:#747d8c;
            }

            .inspection-btn-dark {
                background:#111827;
            }

            .inspection-btn-orange {
                background:#ea580c;
            }

            .inspection-btn-purple {
                background:#6d28d9;
            }

            .inspection-small-btn {
                background:#00509d;
                color:white;
                border:none;
                border-radius:4px;
                min-height:44px;
                font-size:13px;
                font-weight:bold;
                cursor:pointer;
                width:100%;
            }

            .inspection-two-row {
                display:grid;
                grid-template-columns:1fr 1fr;
                gap:8px;
                margin-top:8px;
            }

            .inspection-type-btn {
                background:#747d8c;
                color:white;
                border:none;
                border-radius:4px;
                min-height:44px;
                font-size:13px;
                font-weight:bold;
                cursor:pointer;
            }

            .inspection-type-btn.active {
                background:#003b73;
                outline:3px solid #facc15;
            }

            .inspection-pass-btn {
                background:#16a34a;
                color:white;
                border:none;
                border-radius:4px;
                min-height:50px;
                font-size:15px;
                font-weight:bold;
                cursor:pointer;
            }

            .inspection-fail-btn {
                background:#dc2626;
                color:white;
                border:none;
                border-radius:4px;
                min-height:50px;
                font-size:15px;
                font-weight:bold;
                cursor:pointer;
            }

            .inspection-pass-btn.active,
            .inspection-fail-btn.active {
                outline:4px solid #facc15;
            }

            .inspection-back-btn {
                background:#747d8c;
                color:white;
                border:none;
                border-radius:4px;
                width:100%;
                min-height:48px;
                font-size:15px;
                font-weight:bold;
                cursor:pointer;
                margin-top:12px;
            }

            .inspection-delete-btn {
                background:#7f1d1d;
                color:yellow;
                border:none;
                border-radius:4px;
                padding:9px;
                font-weight:bold;
                cursor:pointer;
                width:100%;
                min-height:44px;
            }

            .inspection-record {
                border:1px solid #d6dee8;
                border-radius:10px;
                padding:10px;
                margin-top:8px;
                background:white;
            }

                .inspection-record-title {
                color:#003b73;
                font-size:14px;
                font-weight:bold;
            }

            .inspection-record-value {
                color:#111827;
                font-size:12px;
                margin-top:3px;
            }

            .inspection-session-item-summary {
                border-top:1px solid #d6dee8;
                margin-top:8px;
                padding-top:8px;
            }

            .btn-open-inspection-item-dashboard {
                cursor:pointer;
                border-radius:6px;
                padding:8px 4px;
            }

            .btn-open-inspection-item-dashboard:hover {
                background:rgba(0,80,157,0.08);
            }

            .inspection-session-item-fail {
                background:#991b1b;
                border:1px solid #7f1d1d;
                border-radius:8px;
                padding:8px;
            }

            .inspection-session-item-fail:hover {
                background:#7f1d1d;
            }

            .inspection-session-item-fail .inspection-record-value {
                color:white;
            }

            .inspection-result-pass {
                color:#16a34a;
                font-weight:bold;
            }

            .inspection-result-fail {
                color:#dc2626;
                font-weight:bold;
            }

            .inspection-session-item-fail .inspection-result-fail {
                color:#facc15;
            }

            .inspection-fail-reason-line {
                color:white;
                font-weight:bold;
            }


            

            .inspection-record-actions {
                display:grid;
                grid-template-columns:1fr 1fr;
                gap:8px;
                margin-top:8px;
            }

            .inspection-record-delete {
                grid-column:1 / 3;
            }

            .inspection-error {
                color:red;
                font-size:13px;
                text-align:center;
                min-height:18px;
                margin-top:10px;
            }

            .inspection-success {
                color:#16a34a;
                font-size:13px;
                text-align:center;
                min-height:18px;
                margin-top:10px;
                font-weight:bold;
            }

            .inspection-image-count {
                color:#003b73;
                font-size:12px;
                font-weight:bold;
                text-align:center;
                margin-top:8px;
                min-height:16px;
            }

            .inspection-image-preview {
                display:none;
                grid-template-columns:1fr 1fr;
                gap:8px;
                margin-top:8px;
            }

            .inspection-image-preview img {
                width:100%;
                height:90px;
                object-fit:cover;
                border-radius:6px;
                border:1px solid #d6dee8;
            }

            .inspection-version-tag {
                border-top:1px solid #d6dee8;
                margin-top:18px;
                padding-top:10px;
                font-size:10px;
                color:#7d8ba0;
                text-align:center;
            }

            .inspection-modal-backdrop {
                position:fixed;
                inset:0;
                background:rgba(0,0,0,0.45);
                display:none;
                align-items:center;
                justify-content:center;
                z-index:9999;
            }

            .inspection-modal {
                background:white;
                width:90%;
                max-width:360px;
                border-radius:12px;
                padding:18px;
                box-shadow:0 4px 18px rgba(0,0,0,0.25);
                text-align:left;
                max-height:90vh;
                overflow-y:auto;
            }

            .inspection-modal h3 {
                margin:0 0 14px;
                text-align:center;
                color:#003b73;
            }

            .inspection-dashboard-detail {
                border:1px solid #d6dee8;
                border-radius:10px;
                background:#f8fbff;
                padding:10px;
                margin-bottom:10px;
            }

            .inspection-dashboard-line {
                color:#111827;
                font-size:13px;
                margin-top:4px;
                overflow-wrap:anywhere;
            }

            .inspection-report-area {
                border:1px solid #d6dee8;
                border-radius:10px;
                padding:10px;
                background:#f8fbff;
                white-space:pre-wrap;
                font-size:13px;
                color:#111827;
                max-width:100%;
                box-sizing:border-box;
                overflow-wrap:anywhere;
                word-break:break-word;
                overflow-x:hidden;
            }
        </style>

        <div class="inspection-card">
            <div class="inspection-title">Inspections</div>
            <div class="inspection-subtitle">${escapeHtml(facilityName)}</div>

            <div class="inspection-box">
                <div class="inspection-label">INSPECTED BY</div>
                <input id="inspection-inspected-by" class="inspection-input" type="text" value="${escapeHtml(appUser.display_name)}" readonly>
                <div class="inspection-record-value">Role: ${escapeHtml(appUser.role || 'inspector')}</div>

                <input id="inspection-session-notes" type="hidden" value="">

                <button id="btn-start-inspection" class="inspection-main-btn">ADD INSPECTION</button>

                <div id="inspection-active-actions" class="inspection-single-grid" style="display:none;">
                    <button id="btn-add-location-to-inspect" class="inspection-square-btn inspection-btn-blue">INSPECT ITEM</button>
                    <button id="btn-save-progress-inspection" class="inspection-square-btn inspection-btn-dark" style="display:none;">SAVE PROGRESS</button>
                    <button id="btn-finish-later-inspection" class="inspection-square-btn inspection-btn-gray" style="display:none;">SAVE &amp; FINISH LATER</button>
                    <button id="btn-finish-active-inspection" class="inspection-square-btn inspection-btn-green" style="display:none;">FINISH INSPECTION</button>
                </div>

                <input id="inspection-image-input" type="file" accept="image/*" capture="environment" style="display:none;">

                <div id="inspection-success" class="inspection-success"></div>
                <div id="inspection-error" class="inspection-error"></div>
            </div>

            <div class="inspection-box">
                <div class="inspection-label">SAVED INSPECTIONS</div>
                ${buildSavedInspectionCardsHtml(sessions, sessionItemsBySessionId)}
            </div>

            <button id="btn-back-facility-detail" class="inspection-back-btn">⬅️ BACK</button>

            <div class="inspection-version-tag">facility-inspections/ui.js | v2026_06_24_ui_clickable_item_dashboard</div>
        </div>

        <div id="inspection-session-modal-backdrop" class="inspection-modal-backdrop">
            <div class="inspection-modal">
                <h3>Add Inspection</h3>

                <div class="inspection-label">INSPECTION NAME / PURPOSE</div>
                <input id="inspection-name-input" class="inspection-input" type="text" placeholder="PTAC Inspection, Keypad Inspection, Toilet Inspection">

                <button id="btn-save-inspection-name" class="inspection-main-btn" type="button">SAVE</button>
                <button id="btn-cancel-inspection-name" class="inspection-back-btn" type="button">CANCEL</button>

                <div id="inspection-name-error" class="inspection-error"></div>

                <div class="inspection-version-tag">facility-inspections/ui.js | v2026_06_24_ui_clickable_item_dashboard</div>
            </div>
        </div>

        <div id="inspection-item-description-modal-backdrop" class="inspection-modal-backdrop">
            <div class="inspection-modal">
                <h3>Inspection Item</h3>

                <div class="inspection-label">STARTING IMAGE</div>

                <div class="inspection-two-row">
                    <button id="btn-take-inspection-image" class="inspection-mini-btn inspection-btn-purple" type="button">RETAKE</button>
                    <button id="btn-see-inspection-images" class="inspection-mini-btn inspection-btn-blue" type="button">SEE IMAGE</button>
                </div>

                <div id="inspection-image-count" class="inspection-image-count">1 image selected.</div>
                <div id="inspection-image-preview" class="inspection-image-preview"></div>

                <div class="inspection-label">ITEM DESCRIPTION</div>
                <input id="item-name-input" class="inspection-input" type="text" placeholder="PTAC, Toilet, Keypad, Air Handler">

                <button id="btn-save-item-description" class="inspection-main-btn" type="button">SAVE</button>
                <button id="btn-cancel-item-description-modal" class="inspection-back-btn" type="button">CANCEL</button>

                <div id="item-description-error" class="inspection-error"></div>

                <div class="inspection-version-tag">facility-inspections/ui.js | v2026_06_24_ui_clickable_item_dashboard</div>
            </div>
        </div>

        <div id="inspection-location-modal-backdrop" class="inspection-modal-backdrop">
            <div class="inspection-modal">
                <h3>Location</h3>

                <div class="inspection-label">LOCATION TYPE</div>
                <div class="inspection-two-row">
                    <button id="btn-location-type-room" class="inspection-type-btn active" type="button">ROOM</button>
                    <button id="btn-location-type-common" class="inspection-type-btn" type="button">COMMON AREA</button>
                </div>

                <div class="inspection-label">LOCATION</div>
                <input id="location-name-input" class="inspection-input" type="number" inputmode="numeric" placeholder="Room number">

                <textarea id="location-notes-input" class="inspection-textarea" style="display:none;"></textarea>

                <button id="btn-save-location-step" class="inspection-main-btn" type="button">SAVE</button>
                <button id="btn-cancel-location-modal" class="inspection-back-btn" type="button">CANCEL</button>

                <div id="location-modal-error" class="inspection-error"></div>

                <div class="inspection-version-tag">facility-inspections/ui.js | v2026_06_24_ui_clickable_item_dashboard</div>
            </div>
        </div>

        <div id="inspection-status-modal-backdrop" class="inspection-modal-backdrop">
            <div class="inspection-modal">
                <h3>Status</h3>

                <div class="inspection-label">PASS OR FAIL</div>
                <div class="inspection-two-row">
                    <button id="btn-popup-pass" class="inspection-pass-btn active" type="button">PASS</button>
                    <button id="btn-popup-fail" class="inspection-fail-btn" type="button">FAIL</button>
                </div>

                <div id="fail-reasons-area" style="display:none;">
                    <div class="inspection-label">FAIL REASONS</div>
                    <div id="fail-reasons-list"></div>
                    <button id="btn-add-fail-reason" class="inspection-small-btn" type="button" style="margin-top:8px;">ADD FAIL REASON</button>

                    <div class="inspection-single-grid">
                        <button id="btn-start-project-from-fail" class="inspection-square-btn inspection-btn-orange" type="button">START PROJECT</button>
                    </div>
                </div>

                <button id="btn-save-location-add-another" class="inspection-main-btn" type="button">SAVE ITEM</button>
                <button id="btn-save-location-finish" class="inspection-main-btn" type="button" style="display:none;">FINISH</button>
                <button id="btn-cancel-status-modal" class="inspection-back-btn" type="button">CANCEL</button>

                <div id="status-modal-error" class="inspection-error"></div>

                <div class="inspection-version-tag">facility-inspections/ui.js | v2026_06_24_ui_clickable_item_dashboard</div>
            </div>
        </div>

        <div id="inspection-item-dashboard-modal-backdrop" class="inspection-modal-backdrop">
            <div class="inspection-modal">
                <h3>Inspection Item Dashboard</h3>

                <div class="inspection-dashboard-detail">
                    <div class="inspection-dashboard-line"><strong>Inspection:</strong> <span id="item-dashboard-inspection-name"></span></div>
                    <div class="inspection-dashboard-line"><strong>Location:</strong> <span id="item-dashboard-location"></span></div>
                    <div class="inspection-dashboard-line"><strong>Item:</strong> <span id="item-dashboard-item"></span></div>
                    <div class="inspection-dashboard-line"><strong>Status:</strong> <span id="item-dashboard-status"></span></div>
                    <div class="inspection-dashboard-line"><strong>Fail Reasons:</strong> <span id="item-dashboard-fail-reasons"></span></div>
                </div>

                <div class="inspection-single-grid">
                    <button id="btn-dashboard-edit-item" class="inspection-square-btn inspection-btn-blue" type="button">EDIT ITEM / LOCATION</button>
                    <button id="btn-dashboard-change-status" class="inspection-square-btn inspection-btn-dark" type="button">CHANGE STATUS</button>
                    <button id="btn-dashboard-start-project" class="inspection-square-btn inspection-btn-orange" type="button">START PROJECT FROM THIS ITEM</button>
                    <button id="btn-dashboard-project-update" class="inspection-square-btn inspection-btn-purple" type="button">ADD PROJECT UPDATE</button>
                    <button id="btn-dashboard-delete-item" class="inspection-delete-btn" type="button">DELETE ITEM</button>
                </div>

                <button id="btn-close-item-dashboard" class="inspection-back-btn" type="button">BACK TO INSPECTION</button>

                <div id="item-dashboard-error" class="inspection-error"></div>

                <div class="inspection-version-tag">facility-inspections/ui.js | v2026_06_24_ui_clickable_item_dashboard</div>
            </div>
        </div>

        <div id="inspection-report-modal-backdrop" class="inspection-modal-backdrop">
            <div class="inspection-modal">
                <h3>Inspection Report</h3>
                <div id="inspection-report-content" class="inspection-report-area"></div>

                <div class="inspection-label">TEXT REPORT TO PHONE NUMBER</div>
                <input id="inspection-report-phone" class="inspection-input" type="tel" placeholder="Phone number">
                <button id="btn-text-inspection-report" class="inspection-main-btn">TEXT REPORT</button>

                <div class="inspection-label">EMAIL REPORT TO</div>
                <input id="inspection-report-email" class="inspection-input" type="email" placeholder="Email address">
                <button id="btn-email-inspection-report" class="inspection-main-btn">EMAIL REPORT</button>

                <button id="btn-print-inspection-report" class="inspection-main-btn">PRINT REPORT</button>
                <button id="btn-close-inspection-report" class="inspection-back-btn">CLOSE</button>
                <div class="inspection-version-tag">facility-inspections/ui.js | v2026_06_24_ui_clickable_item_dashboard</div>
            </div>
        </div>
    `;
}
