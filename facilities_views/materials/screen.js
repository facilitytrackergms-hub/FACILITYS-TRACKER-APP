/*================================================================
SYSTEM: Facility Tracker Modular View System
PURPOSE: Materials main screen
LOCATION: /facilities_views/materials/screen.js
VERSION: v2026_06_21_materials_screen_small_back_arrow
UPDATED: 2026-06-21
LINES: 61
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
        <div id="materials-screen-root" style="position:relative;">
            <button
                id="materials-back-project-detail-btn"
                title="Back"
                style="
                    position:absolute;
                    top:12px;
                    left:12px;
                    width:42px;
                    height:42px;
                    border:none;
                    border-radius:50%;
                    background:#1f6feb;
                    color:white;
                    font-size:26px;
                    font-weight:bold;
                    line-height:42px;
                    cursor:pointer;
                    z-index:20;
                    box-shadow:0 2px 6px rgba(0,0,0,0.25);
                "
            >
                ←
            </button>

            ${renderCard()}
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
