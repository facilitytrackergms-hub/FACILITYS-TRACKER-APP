/* ================================================================
   PURPOSE: Updated Detail view with working Edit, Delete, Image Replacement, Divider, and Action Buttons
   LOCATION: /FACILITYS-TRACKER-APP/view_2_locations_details/view_2_locations_details_grid.js
   LAST UPDATED: 2026-06-16 @ 9:35 PM
   VERSION: v2026_06_16_contact_project_buttons_fix
   ================================================================ */

import { fetchLocationDetails } from './view_2_locations_details_data.js';
import { supabase } from '../00_global_engine/supabaseClient.js';

const __FILENAME = 'view_2_locations_details_grid.js';
const __VERSION = 'v2026_06_16_contact_project_buttons_fix';
const __UPDATED = '2026-06-16 @ 9:35 PM';

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
            <div style="padding: 20px; text-align:center;">
                Location details missing.
                ${renderBottomVersionTag()}
            </div>
        `;
        return;
    }

    const details = await fetchLocationDetails(location.id);
    if (!details) return;

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
                    <button id="editBtn" style="padding: 5px 10px; background: #e9ecef; border: 1px solid #ccc; border-radius: 4px;">Edit</button>
                    <button id="deleteBtn" style="padding: 5px 10px; background: #dc3545; color: white; border: none; border-radius: 4px;">🗑️</button>
                </div>
            </div>
            
            <div id="editModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); padding:20px; box-sizing:border-box; z-index:100;">
                <form id="editForm" style="background:white; padding: 20px; border-radius: 8px; margin-top: 50px;">
                    <input type="text" id="editName" value="${name}" style="width: 100%; padding: 10px; margin-bottom: 10px; box-sizing:border-box;">
                    <input type="text" id="editAbbr" value="${abbreviation}" style="width: 100%; padding: 10px; margin-bottom: 10px; box-sizing:border-box; text-transform: uppercase;">
                    <input type="text" id="editAddress" value="${address}" style="width: 100%; padding: 10px; margin-bottom: 10px; box-sizing:border-box;">
                    <input type="tel" id="editPhone" value="${phone}" inputmode="tel" style="width: 100%; padding: 10px; margin-bottom: 10px; box-sizing:border-box;">
                    
                    <input type="file" id="replaceImageInput" accept="image/*" style="display:none;">
                    <button type="button" onclick="document.getElementById('replaceImageInput').click()" style="width: 100%; padding: 10px; background: #6c757d; color: white; border: none; border-radius: 5px; margin-bottom: 10px;">REPLACE IMAGE</button>
                    
                    <button type="submit" style="width: 100%; padding: 10px; background: #28a745; color: white; border: none; border-radius: 5px;">SAVE CHANGES</button>
                    <button type="button" id="closeEditBtn" style="width: 100%; padding: 10px; background: #6c757d; color: white; border: none; border-radius: 5px; margin-top: 10px;">CANCEL</button>
                </form>
            </div>
            
            <div style="margin: 20px 0; text-align: center;">
                ${imageUrl 
                    ? `<img src="${imageUrl}" style="width: 250px; height: 250px; object-fit: cover; border-radius: 8px;">` 
                    : `<div style="width: 250px; height: 250px; margin:auto; background:#f1f1f1; display:flex; align-items:center; justify-content:center;">No Image</div>`
                }
            </div>

            <div style="height: 5px; background: #003366; border-radius: 2px; margin: 20px 7px 18px 7px;"></div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 14px;">
                <button style="padding: 18px 10px; background: #003366; color: white; border: none; border-radius: 10px; font-weight: bold; font-size: 14px;">
                    1. CONTACT
                </button>
                <button style="padding: 18px 10px; background: #003366; color: white; border: none; border-radius: 10px; font-weight: bold; font-size: 14px;">
                    2. PROJECTS
                </button>
            </div>
            
            <button onclick="window.navigateTo('locations')" style="width: 100%; padding: 15px; background: #6c757d; color: white; border: none; border-radius: 5px;">BACK</button>
            ${renderBottomVersionTag()}
        </div>
    `;

    document.getElementById('editBtn').onclick = () => document.getElementById('editModal').style.display = 'block';
    document.getElementById('closeEditBtn').onclick = () => document.getElementById('editModal').style.display = 'none';

    document.getElementById('editForm').onsubmit = async (e) => {
        e.preventDefault();

        const file = document.getElementById('replaceImageInput').files[0];
        let newImageUrl = details.image_url || '';

        if (file) {
            const sanitizedName = file.name
                .replace(/\s+/g, '_')
                .replace(/[^a-zA-Z0-9._-]/g, '');

            const fileName = `${Date.now()}_${sanitizedName}`;

            const { error: uploadError } = await supabase.storage
                .from('locations-images')
                .upload(fileName, file);

            if (uploadError) {
                console.error("Storage Error:", uploadError);
                alert("Image upload failed: " + uploadError.message);
                return;
            }

            const { data } = supabase.storage
                .from('locations-images')
                .getPublicUrl(fileName);

            newImageUrl = data.publicUrl;

            const { error: imageInsertError } = await supabase
                .from('location_images')
                .insert([{
                    location_id: details.id,
                    image_url: newImageUrl,
                    category: 'main'
                }]);

            if (imageInsertError) {
                console.error("Image Table Insert Error:", imageInsertError);
                alert("Image saved to storage, but failed to link: " + imageInsertError.message);
                return;
            }
        }

        const { error } = await supabase
            .from('locations')
            .update({
                number_name: document.getElementById('editName').value.trim(),
                abbreviation: document.getElementById('editAbbr').value.trim().toUpperCase(),
                address: document.getElementById('editAddress').value.trim(),
                phone: document.getElementById('editPhone').value.trim(),
                image_url: newImageUrl
            })
            .eq('id', details.id);

        if (error) {
            alert('Error: ' + error.message);
            return;
        }

        document.getElementById('editModal').style.display = 'none';
        renderDetails({ id: details.id });
    };

    document.getElementById('deleteBtn').onclick = async () => {
        if (confirm(`Delete ${details.number_name}?`)) {
            const { error } = await supabase
                .from('locations')
                .delete()
                .eq('id', details.id);

            if (error) alert('Error: ' + error.message);
            else window.navigateTo('locations');
        }
    };
}
