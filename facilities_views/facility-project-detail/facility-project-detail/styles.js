/*================================================================
FACILITY-PROJECT-DETAIL STYLES
LOCATION: /facilities_views/facility-project-detail/styles.js
VERSION: v2026_06_26_split_styles
UPDATED: 2026-06-26
================================================================*/

export function renderProjectDetailStyles() {
    return `
        <style>
            .project-detail-card {
                background:#ffffff;
                max-width:350px;
                margin:16px auto;
                padding:18px;
                border-radius:14px;
                box-shadow:0 4px 18px rgba(0,0,0,0.08);
                text-align:center;
            }

            .project-detail-title {
                color:#003b73;
                font-size:24px;
                font-weight:bold;
                margin-bottom:2px;
                line-height:1.15;
                overflow-wrap:anywhere;
            }

            .project-detail-subtitle {
                color:#003b73;
                font-size:13px;
                font-weight:bold;
                margin-bottom:12px;
                letter-spacing:2px;
            }

            .project-detail-tab-grid {
                display:grid;
                grid-template-columns:1fr 1fr;
                gap:7px;
                margin-bottom:12px;
            }

            .project-detail-tab-btn {
                background:#ffffff;
                color:#003b73;
                border:1px solid #003b73;
                border-radius:8px;
                min-height:40px;
                padding:7px 5px;
                font-size:11px;
                font-weight:bold;
                cursor:pointer;
            }

            .project-detail-tab-btn.active {
                background:#003b73;
                color:white;
            }

            .project-detail-panel {
                display:none;
            }

            .project-detail-panel.active {
                display:block;
            }

            .project-detail-info-box {
                border:1px solid #d6dee8;
                border-radius:10px;
                padding:12px;
                text-align:left;
                margin-bottom:14px;
                background:#f8fbff;
            }

            .project-detail-section-title {
                color:#003b73;
                font-size:13px;
                font-weight:bold;
                margin-bottom:10px;
                text-align:center;
                letter-spacing:1px;
            }

            .project-detail-summary {
                color:#667085;
                font-size:12px;
                font-weight:bold;
                text-align:center;
                margin-bottom:10px;
            }

            .project-detail-row {
                margin-bottom:10px;
                text-align:left;
            }

            .project-detail-label {
                color:#003b73;
                font-size:11px;
                font-weight:bold;
                margin-bottom:3px;
                text-align:left;
            }

            .project-detail-value {
                color:#111827;
                font-size:14px;
                line-height:1.35;
                margin-bottom:0;
                white-space:pre-wrap;
                text-align:left;
                overflow-wrap:anywhere;
                word-break:break-word;
            }

            .project-detail-link {
                color:#003b73;
                font-weight:bold;
                text-decoration:underline;
                display:inline-block;
                max-width:100%;
                overflow-wrap:anywhere;
                word-break:break-word;
                text-align:left;
            }

            .project-scope-record-button {
                width:100%;
                border:1px solid #d6dee8;
                border-radius:10px;
                padding:10px;
                margin-top:8px;
                background:#ffffff;
                text-align:left;
                cursor:pointer;
            }

            .project-scope-record-title {
                color:#003b73;
                font-size:14px;
                font-weight:bold;
                margin-bottom:3px;
                overflow-wrap:anywhere;
            }

            .project-scope-record-meta {
                color:#111827;
                font-size:12px;
                margin-bottom:3px;
                overflow-wrap:anywhere;
            }

            .project-scope-add-btn {
                background:#22a843;
                color:white;
                border:none;
                border-radius:9px;
                width:100%;
                min-height:46px;
                font-size:14px;
                font-weight:bold;
                cursor:pointer;
                margin:8px 0 10px;
            }

            .project-detail-button-row {
                display:grid;
                grid-template-columns:1fr 1fr;
                gap:8px;
                margin-bottom:12px;
            }

            .project-detail-action-btn {
                background:#003b73;
                color:white;
                border:none;
                border-radius:9px;
                min-height:48px;
                font-size:14px;
                font-weight:bold;
                cursor:pointer;
            }

            .project-detail-delete-btn {
                background:#dc2626;
                color:yellow;
                border:none;
                border-radius:9px;
                min-height:48px;
                font-size:14px;
                font-weight:bold;
                cursor:pointer;
            }

            .project-detail-save-btn {
                background:#22a843;
                color:white;
                border:none;
                border-radius:9px;
                width:100%;
                min-height:50px;
                font-size:15px;
                font-weight:bold;
                cursor:pointer;
                margin-top:8px;
            }

            .project-detail-main-btn {
                background:#003b73;
                color:white;
                border:none;
                border-radius:9px;
                width:100%;
                min-height:50px;
                font-size:15px;
                font-weight:bold;
                cursor:pointer;
                margin-top:8px;
            }

            .project-detail-two-btn-row {
                display:grid;
                grid-template-columns:1fr 1fr;
                gap:8px;
                margin-top:8px;
            }

            .project-detail-half-btn {
                background:#003b73;
                color:white;
                border:none;
                border-radius:9px;
                min-height:50px;
                font-size:14px;
                font-weight:bold;
                cursor:pointer;
            }

            .project-detail-back-btn {
                background:#747d8c;
                color:white;
                border:none;
                border-radius:9px;
                width:100%;
                min-height:48px;
                font-size:15px;
                font-weight:bold;
                cursor:pointer;
                margin-top:12px;
            }

            .project-detail-version-tag {
                border-top:1px solid #d6dee8;
                margin-top:18px;
                padding-top:10px;
                font-size:10px;
                color:#7d8ba0;
                text-align:center;
            }

            .project-update-record-button {
                width:100%;
                border:1px solid #d6dee8;
                border-radius:10px;
                padding:10px;
                margin-top:8px;
                background:#ffffff;
                text-align:left;
                cursor:pointer;
            }

            .project-update-record-button-title {
                color:#003b73;
                font-size:14px;
                font-weight:bold;
                margin-bottom:3px;
            }

            .project-update-record-button-status {
                color:#111827;
                font-size:12px;
                margin-bottom:3px;
            }

            .project-update-record-button-date {
                color:#667085;
                font-size:11px;
            }

            .project-detail-modal-backdrop,
            .project-update-modal-backdrop,
            .project-scope-detail-backdrop,
            .project-custom-popup-backdrop {
                position:fixed;
                inset:0;
                background:rgba(0,0,0,0.45);
                display:none;
                align-items:center;
                justify-content:center;
                z-index:9999;
            }

            .project-detail-modal,
            .project-update-modal,
            .project-scope-detail-modal,
            .project-custom-popup {
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

            .project-custom-popup {
                text-align:center;
            }

            .project-detail-modal h3,
            .project-update-modal h3,
            .project-scope-detail-modal h3 {
                margin:0 0 14px;
                text-align:center;
                color:#003b73;
            }

            .project-custom-popup-title {
                color:#003b73;
                font-size:18px;
                font-weight:bold;
                margin-bottom:10px;
            }

            .project-custom-popup-message {
                color:#1f2937;
                font-size:14px;
                line-height:1.35;
                margin-bottom:16px;
            }

            .project-custom-popup-buttons {
                display:grid;
                grid-template-columns:1fr 1fr;
                gap:8px;
            }

            .project-custom-popup-buttons button {
                border:none;
                border-radius:8px;
                padding:11px;
                font-size:14px;
                font-weight:bold;
                cursor:pointer;
            }

            .btn-popup-yes {
                background:#dc2626;
                color:yellow;
            }

            .btn-popup-no {
                background:#777;
                color:white;
            }

            .project-detail-modal label,
            .project-update-modal label {
                display:block;
                font-size:13px;
                font-weight:bold;
                margin:10px 0 4px;
                color:#003b73;
            }

            .project-detail-modal input,
            .project-detail-modal textarea,
            .project-detail-modal select,
            .project-update-modal input,
            .project-update-modal textarea {
                width:100%;
                padding:9px;
                border:1px solid #bbb;
                border-radius:6px;
                font-size:15px;
                box-sizing:border-box;
            }

            .project-detail-modal textarea,
            .project-update-modal textarea {
                min-height:80px;
                resize:vertical;
            }

            .project-update-checkbox-row {
                display:flex;
                align-items:center;
                gap:8px;
                margin-top:12px;
                color:#003b73;
                font-size:13px;
                font-weight:bold;
            }

            .project-update-checkbox-row input {
                width:auto;
            }

            .project-detail-modal-buttons,
            .project-update-modal-buttons {
                display:grid;
                grid-template-columns:1fr 1fr;
                gap:8px;
                margin-top:16px;
            }

            .project-detail-modal-buttons button,
            .project-update-modal-buttons button {
                padding:11px;
                border:none;
                border-radius:7px;
                font-weight:bold;
                cursor:pointer;
            }

            .btn-save-project-detail,
            .btn-save-project-update {
                background:#22a843;
                color:white;
            }

            .btn-cancel-project-detail,
            .btn-cancel-project-update {
                background:#777;
                color:white;
            }

            .project-detail-error,
            .project-update-error {
                color:red;
                font-size:13px;
                text-align:center;
                margin-top:10px;
                min-height:16px;
            }
        </style>
    `;
}
