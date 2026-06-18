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
            <div class="facilities-grid">
    `;

    facilities.forEach(fac => {
        html += `
            <button class="btn-facility" data-id="${fac.id}">
                ${fac.abbreviation || fac.number_name}
            </button>
        `;
    });

    html += `</div></div>`;
    container.innerHTML = html;

    // Add event listener for the Create button
    document.getElementById('btn-create-facility').addEventListener('click', () => {
        console.log("Create new facility clicked");
    });
}

/*================================================================
FACILITIES-HOME GRID
================================================================*/
