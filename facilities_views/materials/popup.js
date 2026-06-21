/*================================================================
SYSTEM: Facility Tracker Modular View System
PURPOSE: Materials reusable popup tools
LOCATION: /facilities_views/materials/popups.js
VERSION: v2026_06_21_materials_popups_initial
UPDATED: 2026-06-21
================================================================*/

export function renderPopups() {
    return `
        <style>
            .materials-popup-backdrop {
                position:fixed;
                inset:0;
                background:rgba(0,0,0,0.45);
                display:none;
                align-items:center;
                justify-content:center;
                z-index:9999;
            }

            .materials-popup-box {
                background:#ffffff;
                width:90%;
                max-width:320px;
                border-radius:12px;
                padding:18px;
                box-shadow:0 4px 18px rgba(0,0,0,0.25);
                text-align:center;
            }

            .materials-popup-message {
                color:#111827;
                font-size:16px;
                font-weight:bold;
                margin-bottom:16px;
            }

            .materials-popup-ok-btn {
                background:#003b73;
                color:white;
                border:none;
                border-radius:8px;
                min-height:44px;
                width:100%;
                font-size:15px;
                font-weight:bold;
                cursor:pointer;
            }
        </style>

        <div id="materials-popup-backdrop" class="materials-popup-backdrop">
            <div class="materials-popup-box">
                <div id="materials-popup-message" class="materials-popup-message"></div>
                <button id="materials-popup-ok-btn" class="materials-popup-ok-btn" type="button">OK</button>
            </div>
        </div>
    `;
}

export function openOkPopup(message) {
    const backdrop = document.getElementById('materials-popup-backdrop');
    const messageBox = document.getElementById('materials-popup-message');
    const okButton = document.getElementById('materials-popup-ok-btn');

    if (!backdrop || !messageBox || !okButton) return;

    messageBox.textContent = message;
    backdrop.style.display = 'flex';

    okButton.onclick = () => {
        backdrop.style.display = 'none';
    };
}
