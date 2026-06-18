
/*================================================================
FACILITIES-HOME GRID
================================================================*/

import { fetchFacilities } from './data.js';

export async function renderDashboard(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const facilities = await fetchFacilities();

    let html = `
        <div class="facilities-home-container">
            <button id="btn-create-facility" class="btn-green">Create New Facility</button>
            <div class="facilities-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 20px;">
    `;

    facilities.forEach(fac => {
        html += `
            <button class="btn-facility" data-id="${fac.id}" style="padding: 20px;">
                ${fac.abbreviation || fac.number_name}
            </button>
        `;
    });

    html += `</div></div>`;
    container.innerHTML = html;
}

/*================================================================
FACILITIES-HOME GRID
================================================================*/
