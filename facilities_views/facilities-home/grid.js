/*================================================================
FACILITIES-HOME GRID
VERSION: v2026_06_18_fixed_structure
================================================================*/

import { fetchFacilities } from './data.js';
import { supabase } from '../../global_engine/supabaseClient.js';

export async function renderDashboard(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const facilities = await fetchFacilities();

    // 1. Build the HTML string
    let html = `
        <style>
            .home-page-title { text-align: center; color: #003b73; font-weight: bold; font-size: 20px; margin-bottom: 10px; }
            .facilities-home-container { background: #f7f9fb; border-radius: 0 0 14px 14px; padding: 24px 18px 32px; max-width: 320px; margin: 0 auto; text-align: center; border-top: 3px solid #003b73; }
            .btn-green { background: #22a843; color: white; border: none; border-radius: 8px; padding: 14px 18px; font-size: 16px; font-weight: bold; cursor: pointer; margin-bottom: 24px; width: 100%; }
            .facilities-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
            .btn-facility { background: #003b73; color: white; border: none; border-radius: 8px; min-height: 56px; padding: 8px; font-size: 16px; font-weight: bold; cursor: pointer; line-height: 1.1; }
            .facility-modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: none; align-items: center; justify-content: center; z-index: 9999; }
            .facility-modal { background: white; width: 90%; max-width: 340px; border-radius: 12px; padding: 18px; box-shadow: 0 4px 18px rgba(0,0,0,0.25); text-align: left; }
            .facility-modal h3 { margin: 0 0 14px; text-align: center; color: #003b73; }
            .facility-modal label { display: block; font-size: 13px; font-weight: bold; margin: 10px 0 4px; }
            .facility-modal input { width: 100%; padding: 9px; border: 1px solid #bbb; border-radius: 6px; font-size: 15px; box-sizing: border-box; }
            .facility-modal-buttons { display: flex; gap: 8px; margin-top: 16px; }
            .facility-modal-buttons button { flex: 1; padding: 11px; border: none; border-radius: 7px; font-weight: bold; cursor: pointer; }
            .btn-save-facility { background: #22a843; color: white; }
            .btn-cancel-facility { background: #777; color: white; }
            .facility-error { color: red; font-size: 13px; text-align: center; margin-top: 10px; min-height: 16px; }
        </style>

        <div class="home-page-title">FACILITY HOMES</div>
        <div class="facilities-home-container">
            <button id="btn-create-facility" class="btn-green">Create New Facility</button>
            <div class="facilities-grid">
                ${facilities.map(fac => `
                    <button class="btn-facility" data-id="${fac.id}">
                        ${fac.abbreviation || fac.number_name || fac.name || 'FAC'}
                    </button>
                `).join('')}
            </div>
        </div>

        <div id="facility-modal-backdrop" class="facility-modal-backdrop">
            <div class="facility-modal">
                <h3>Create New Facility</h3>
                <label>Facility Name</label><input id="facility-name-input" type="text">
                <label>Abbreviation</label><input id="facility-abbreviation-input" type="text">
                <label>Address</label><input id="facility-address-input" type="text">
                <label>Phone</label><input id="facility-phone-input" type="tel">
                <div class="facility-modal-buttons">
                    <button id="btn-save-facility" class="btn-save-facility">Save</button>
                    <button id="btn-cancel-facility" class="btn-cancel-facility">Cancel</button>
                </div>
                <div id="facility-error" class="facility-error"></div>
            </div>
        </div>
    `;

    // 2. Render to DOM
    container.innerHTML = html;

    // 3. Attach all event listeners
    const modalBackdrop = document.getElementById('facility-modal-backdrop');
    const errorBox = document.getElementById('facility-error');

    document.getElementById('btn-create-facility').addEventListener('click', () => {
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
            errorBox.textContent = 'Name and abbreviation required.';
            return;
        }

        const { error } = await supabase.from('facilities').insert([{ 
            number_name: numberName, abbreviation, address, phone 
        }]);

        if (error) {
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
               window.navigateTo('facilities-details', selectedFacility);
            }
        });
    });
}
