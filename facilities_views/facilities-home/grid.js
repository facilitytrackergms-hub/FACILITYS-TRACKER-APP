/*================================================================ 
FACILITIES-HOME GRID
================================================================*/

import { fetchFacilities } from './data.js';
import { supabase } from '../../global_engine/supabaseClient.js';

export async function renderDashboard(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const facilities = await fetchFacilities();

    let html = `
       // ... inside renderDashboard ...
    let html = `
        <style>
            .home-header {
                font-size: 20px;
                font-weight: bold;
                color: #003b73;
                margin-bottom: 10px;
                text-align: center;
            }
            .facilities-home-container {
                background: #f7f9fb;
                border-radius: 0 0 14px 14px;
                padding: 24px 18px 32px;
                max-width: 320px;
                margin: 0 auto;
                text-align: center;
                border-top: 3px solid #003b73;
                margin-top: 40px; /* Space for the title */
            }
            /* ... rest of your existing CSS ... */
        </style>

        <div class="home-header">FACILITY HOMES</div>
        
        <div class="facilities-home-container">
            <button id="btn-create-facility" class="btn-green">Create New Facility</button>
            <div class="facilities-grid">
    `;
// ... rest of your function ...

        <div class="facilities-home-container">
            <button id="btn-create-facility" class="btn-green">Create New Facility</button>

            <div class="facilities-grid">
    `;

    facilities.forEach(fac => {
        html += `
            <button class="btn-facility" data-id="${fac.id}">
                ${fac.abbreviation || fac.number_name || fac.name || 'FAC'}
            </button>
        `;
    });

    html += `
            </div>
        </div>

        <div id="facility-modal-backdrop" class="facility-modal-backdrop">
            <div class="facility-modal">
                <h3>Create New Facility</h3>

                <label>Facility Name</label>
                <input id="facility-name-input" type="text">

                <label>Abbreviation</label>
                <input id="facility-abbreviation-input" type="text">

                <label>Address</label>
                <input id="facility-address-input" type="text">

                <label>Phone</label>
                <input id="facility-phone-input" type="tel">

                <div class="facility-modal-buttons">
                    <button id="btn-save-facility" class="btn-save-facility">Save</button>
                    <button id="btn-cancel-facility" class="btn-cancel-facility">Cancel</button>
                </div>

                <div id="facility-error" class="facility-error"></div>
            </div>
        </div>
    `;

    container.innerHTML = html;

    const modalBackdrop = document.getElementById('facility-modal-backdrop');
    const errorBox = document.getElementById('facility-error');

    document.getElementById('btn-create-facility').addEventListener('click', () => {
        document.getElementById('facility-name-input').value = '';
        document.getElementById('facility-abbreviation-input').value = '';
        document.getElementById('facility-address-input').value = '';
        document.getElementById('facility-phone-input').value = '';
        errorBox.textContent = '';
        modalBackdrop.style.display = 'flex';
    });

    document.getElementById('btn-cancel-facility').addEventListener('click', () => {
        modalBackdrop.style.display = 'none';
    });

    document.getElementById('btn-save-facility').addEventListener('click', async () => {
        const numberName = document.getElementById('facility-name-input').value.trim();
        const abbreviation = document.getElementById('facility-abbreviation-input').value.trim();
        const address = document.getElementById('facility-address-input').value.trim();
        const phone = document.getElementById('facility-phone-input').value.trim();

        if (!numberName || !abbreviation) {
            errorBox.textContent = 'Facility name and abbreviation are required.';
            return;
        }

        const { error } = await supabase
            .from('facilities')
            .insert([{
                number_name: numberName,
                abbreviation: abbreviation,
                address: address,
                phone: phone
            }]);

        if (error) {
            console.error('Create facility error:', error);
            errorBox.textContent = 'Could not save facility.';
            return;
        }

        modalBackdrop.style.display = 'none';
        await renderDashboard(containerId);
    });

    document.querySelectorAll('.btn-facility').forEach(button => {
        button.addEventListener('click', () => {
            const facilityId = button.dataset.id;
            const selectedFacility = facilities.find(fac => String(fac.id) === String(facilityId));

            if (window.navigateTo && selectedFacility) {
                window.navigateTo('facilities-projects', selectedFacility);
            }
        });
    });
}

/*================================================================
FACILITIES-HOME GRID
VERSION: v2026_06_18_home_to_projects_fix
================================================================*/
