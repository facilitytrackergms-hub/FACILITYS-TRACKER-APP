/*================================================================ 
FACILITIES-HOME GRID
================================================================*/

import { fetchFacilities } from './data.js';

export async function renderDashboard(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const facilities = await fetchFacilities();

    let html = `
        <style>
            .facilities-home-container {
                background: #f7f9fb;
                border-radius: 0 0 14px 14px;
                padding: 24px 18px 32px;
                max-width: 320px;
                margin: 0 auto;
                text-align: center;
                border-top: 3px solid #003b73;
            }

            .btn-green {
                background: #22a843;
                color: white;
                border: none;
                border-radius: 8px;
                padding: 14px 18px;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                margin-bottom: 24px;
            }

            .facilities-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 8px;
            }

            .btn-facility {
                background: #003b73;
                color: white;
                border: none;
                border-radius: 8px;
                min-height: 56px;
                padding: 8px;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                white-space: normal;
                line-height: 1.1;
            }

            .btn-facility:active {
                transform: scale(0.97);
            }
        </style>

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

    html += `
            </div>
        </div>
    `;

    container.innerHTML = html;

    document.getElementById('btn-create-facility').addEventListener('click', () => {
        console.log("Create new facility clicked");
    });

    document.querySelectorAll('.btn-facility').forEach(button => {
        button.addEventListener('click', () => {
            const facilityId = button.dataset.id;
            console.log("Facility clicked:", facilityId);
        });
    });
}

/*================================================================
FACILITIES-HOME GRID
================================================================*/
