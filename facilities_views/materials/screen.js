/*================================================================
SYSTEM: Facility Tracker Modular View System
PURPOSE: Materials main screen
LOCATION: /facilities_views/materials/screen.js
VERSION: v2026_06_21_materials_screen_back_to_project_detail
UPDATED: 2026-06-21
LINES: 55
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

            <button
                id="materials-back-project-detail-btn"
                style="
                    width:100%;
                    margin-top:14px;
                    padding:14px;
                    border:none;
                    border-radius:10px;
                    background:#1f6feb;
                    color:white;
                    font-size:18px;
                    font-weight:bold;
                    cursor:pointer;
                "
            >
                BACK TO PROJECT DETAIL
            </button>

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
