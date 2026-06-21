/*================================================================
SYSTEM: Facility Tracker Modular View System
PURPOSE: Materials view grid calls blank card component
LOCATION: /facilities_views/materials/materials_grid.js
VERSION: v2026_06_21_grid_calls_blank_card_component
UPDATED: 2026-06-21
================================================================*/

import { renderMaterialsBlankCard } from './materials_blank_card_component.js';

export async function renderMaterialsGrid(containerId, context = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
        <div id="materials-view-root">
            ${renderMaterialsBlankCard()}
        </div>
    `;
}
