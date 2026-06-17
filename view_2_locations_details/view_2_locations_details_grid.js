/* ================================================================
   PURPOSE: Updated Detail view with working Edit and Delete functionality
   LOCATION: /FACILITYS-TRACKER-APP/view_2_locations_details/view_2_locations_details_grid.js
   LAST UPDATED: 2026-06-16 @ 12:00 PM
   VERSION: v2026_06_16_locations_delete_rls_null_image_fix
   ================================================================ */

import { fetchLocationDetails } from './view_2_locations_details_data.js';
import { supabase } from '../00_global_engine/supabaseClient.js';

const __FILENAME = 'view_2_locations_details_grid.js';
const __VERSION = 'v2026_06_16_locations_delete_rls_null_image_fix';
const __UPDATED = '2026-06-16 @ 12:00 PM';

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function renderBottomVersionTag() {
    return `
        <div style="margin-top: 18px; padding: 8px; text-align: center; font-size: 10px; color: #666; border-top: 1px solid #ddd;">
            ${__FILENAME} | ${__VERSION} | ${__UPDATED}
        </div>
    `;
}

export async function renderDetails(location) {
    const app = document.getElementById('app');

    if (!app) return;

    if (!location || !location.id) {
        app.innerHTML = `
            <div style="padding: 20px; max-width: 400px; margin: auto; font-family: sans-serif;">
                <p style="color:red; text-align:center;">Location details missing.</p>
                <button onclick="window.navigateTo('locations')" style="width: 100%; margin-top: 10px; padding: 15px; background: #6c757d; color: white; border: none; border-radius: 5px;">BACK</button>
                ${renderBottomVersionTag()}
            </div>
        `;
        return;
    }

    const details = await fetchLocationDetails(location.id);

    if (!details) {
        app.innerHTML = `
            <div style="padding: 20px; max-width: 400px; margin: auto; font-family: sans-serif;">
                <p style="color:red; text-align:center;">Could not load location details.</p>
                <button onclick="window.navigateTo('locations')" style="width: 100%; margin-top: 10px; padding: 15px; background: #6c757d; color: white; border: none; border-radius: 5px;">BACK</button>
                ${renderBottomVersionTag()}
            </div>
        `;
        return;
    }

    const name = escapeHtml(details.number_name);
    const abbreviation = escapeHtml(details.abbreviation);
    const address = escapeHtml(details.address);
    const phone = escapeHtml(details.phone);
    const imageUrl = details.image_url ? escapeHtml(details.image_url) : '';

    app.innerHTML = `
        <div style="padding: 20px; max-width: 400px; margin: auto; font-family: sans-serif;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h1 style="margin: 0; text-transform: uppercase;">${abbreviation}</h1>
                <div>
                    <button id="editBtn" style="padding: 5px 10px; background: #e9ecef; border: 1px solid #ccc; border-radius: 4px; margin-right: 5px;">Edit</button>
                    <button id="deleteBtn" style="padding: 5px 10px; background: #dc3545; color: white; border: 1px solid #dc3545; border-radius: 4px;">🗑️</button>
                </div>
            </div>
            
            <div id="editModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); padding:20px; box-sizing:border-box; z-index:100;">
                <form id="editForm" style="background:white; padding: 20px; border-radius: 8px; margin-top: 50px;">
                    <input type="text" id="editName" value="${name}" style="width: 100%; padding: 10px; margin-bottom: 10px; box-sizing:border-box;">
                    <input type="text" id="editAbbr" value="${abbreviation}" style="width: 100%; padding: 10px; margin-bottom: 10px; box-sizing:border-box; text-transform: uppercase;">
                    <input type="text" id="editAddress" value="${address}" style="width: 100%; padding: 10px; margin-bottom: 10px; box-sizing:border-box;">
                    <input type="tel" id="editPhone" value="${phone}" inputmode="tel" style="width: 100%; padding: 10px; margin-bottom: 10px; box-sizing:border-box;">
                    <button type="submit" style="width: 100%; padding: 10px; background: #28a745; color: white; border: none; border-radius: 5px;">SAVE CHANGES</button>
                    <button type="button" id="closeEditBtn" style="width: 100%; padding: 10px; background: #6c757d; color: white; border: none; border-radius: 5px; margin-top: 10px;">CANCEL</button>
                </form>
            </div>
            
            <div style="margin: 20px 0; text-align: center;">
                ${imageUrl
                    ? `<img src="${imageUrl}" alt="Facility Image" style="width: 250px; height: 250px; object-fit: cover; border-radius: 8px; border: 1px solid #ccc;">`
                    : `<div style="width: 250px; height: 250px; margin: auto; display: flex; align-items: center; justify-content: center; border-radius: 8px; border: 1px solid #ccc; background:#f1f1f1; color:#666;">No Image</div>`
                }
            </div>
            
            <div style="border: 1px solid #ccc; padding: 15px; margin: 20px 0; border-radius: 8px;">
                <p>📍 <strong>ADDRESS</strong><br>
                    <a href="https://maps.google.com/?q=${encodeURIComponent(details.address || '')}" target="_blank" style="color: #003366;">${address}</a>
                </p>
                <p>📞 <strong>PHONE CONTACT</strong><br>
                    <a href="tel:${phone}" style="color: #003366;">${phone}</a>
                </p>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <button style="padding: 20px; background: #003366; color: white; border: none; border-radius: 5px;">1. CONTACT</button>
                <button style="padding: 20px; background: #003366; color: white; border: none; border-radius: 5px;">2. PROJECTS</button>
            </div>

            <button onclick="window.navigateTo('locations')" style="width: 100%; margin-top: 10px; padding: 15px; background: #6c757d; color: white; border: none; border-radius: 5px;">BACK</button>

            ${renderBottomVersionTag()}
        </div>
    `;

    const editModal = document.getElementById('editModal');
    const editBtn = document.getElementById('editBtn');
    const closeEditBtn = document.getElementById('closeEditBtn');
    const editForm = document.getElementById('editForm');
    const deleteBtn = document.getElementById('deleteBtn');

    if (editBtn && editModal) {
        editBtn.onclick = () => editModal.style.display = 'block';
    }

    if (closeEditBtn && editModal) {
        closeEditBtn.onclick = () => editModal.style.display = 'none';
    }

    if (editForm) {
        editForm.onsubmit = async (e) => {
            e.preventDefault();

            const { error } = await supabase
                .from('locations')
                .update({
                    number_name: document.getElementById('editName').value.trim(),
                    abbreviation: document.getElementById('editAbbr').value.trim().toUpperCase(),
                    address: document.getElementById('editAddress').value.trim(),
                    phone: document.getElementById('editPhone').value.trim()
                })
                .eq('id', details.id);

            if (error) {
                alert('Error: ' + error.message);
                return;
            }

            renderDetails({ id: details.id });
        };
    }

    if (deleteBtn) {
        deleteBtn.onclick = async () => {
            if (!confirm(`Are you sure you want to delete ${details.number_name}?`)) return;

            const { error } = await supabase
                .from('locations')
                .delete()
                .eq('id', details.id);

            if (error) {
                alert('Error: ' + error.message);
                return;
            }

            window.navigateTo('locations');
        };
    }
}
