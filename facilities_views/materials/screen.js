/*================================================================
SYSTEM: Facility Tracker Modular View System
PURPOSE: Materials main screen
LOCATION: /facilities_views/materials/screen.js
VERSION: v2026_06_21_materials_screen_bottom_back_button
UPDATED: 2026-06-21
LINES: 66
================================================================*/

import { renderCard } from './card.js';
import { connectAddMaterialsButtom } from './addmaterialsbuttom.js';
import { renderPopups } from './popups.js';
import { renderMaterialPopup } from './material-popup.js';
import { renderMaterialDetailPopup } from './material-detail-popup.js';
import { connectMaterialsList } from './materials-list.js';

export async function renderMaterialsScreen(containerId, context = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
        <div id="materials-screen-root">
            ${renderCard()}

            <div style="
                width:100%;
                display:flex;
                justify-content:center;
                margin-top:14px;
                margin-bottom:10px;
            ">
                <button
                    id="materials-back-project-detail-btn"
                    style="
                        width:70%;
                        max-width:260px;
                        padding:12px;
                        border:none;
                        border-radius:8px;
                        background:#7b8491;
                        color:white;
                        font-size:17px;
                        font-weight:bold;
                        cursor:pointer;
                    "
                >
                    ⬅ BACK
                </button>
            </div>

            ${renderPopups()}
            ${renderMaterialPopup()}
            ${renderMaterialDetailPopup()}
        </div>
    `;

    connectAddMaterialsButtom(context);
    await connectMaterialsList(context);

    const backButton = document.getElementById('materials-back-project-detail-btn');

    if (backButton) {
        backButton.addEventListener('click', () => {
            if (window.navigateTo) {
                window.navigateTo('facility-project-detail', context);
                return;
            }

            console.error('window.navigateTo not found.');
        });
    }
}
