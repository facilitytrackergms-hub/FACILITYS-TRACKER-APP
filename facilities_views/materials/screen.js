/*================================================================
SYSTEM: Facility Tracker Modular View System
PURPOSE: Materials main screen
LOCATION: /facilities_views/materials/screen.js
VERSION: v2026_06_21_materials_screen_list_connected
UPDATED: 2026-06-21
================================================================*/

import { renderCard } from './card.js';
import { connectHelloButton } from './helloButton.js';
import { connectAddMaterialsButtom } from './addmaterialsbuttom.js';
import { renderPopups } from './popups.js';
import { renderMaterialPopup } from './material-popup.js';
import { connectMaterialsList } from './materials-list.js';

export async function renderMaterialsScreen(containerId, context = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
        <div id="materials-screen-root">
            ${renderCard()}
            ${renderPopups()}
            ${renderMaterialPopup()}
        </div>
    `;

    connectHelloButton();
    connectAddMaterialsButtom(context);
    await connectMaterialsList(context);
}
