/* ================================================================
   PURPOSE: Dashboard with "Create New Facility" button and schema-aligned form
   LOCATION: /FACILITYS-TRACKER-APP/view_1_locations/view_1_locations_grid.js
   ================================================================ */

import { fetchLocations } from './view_1_locations_data.js';
import { supabase } from '../00_global_engine/supabaseClient.js';

export async function renderLocations() {
    const app = document.getElementById('app');
    const locations = await fetchLocations();

    app.innerHTML = `
        <div style="padding: 20px; max-width: 400px; margin: auto; font-family: sans-serif;">
            <h1 style="text-align: center;">FACILITIES DASHBOARD</h1>
            
            <button id="openFormBtn" style="width: 100%; padding: 15px; background: #28a745; color: white; border: none; border-radius: 5px; margin-bottom: 20px; font-weight: bold;">
                Create New Facility
            </button>

            <div id="formModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); padding:20px; box-sizing:border-box;">
                <form id="createForm" style="background:white; padding: 20px; border-radius: 8px; margin-top: 50px;">
                    <input type="text" id="name" placeholder="Location Name" required style="width: 100%; padding: 10px; margin-bottom: 10px; box-sizing:border-box; text-transform: capitalize;">
                    <input type="text" id="abbr" placeholder="Abbreviation (e.g., GMS)" maxlength="5" required style="width: 100%; padding: 10px; margin-bottom: 10px; box-sizing:border-box; text-transform: uppercase;">
                    <input type="text" id="address" placeholder="Address" required style="width: 100%; padding: 10px; margin-bottom: 10px; box-sizing:border-box;">
                    <input type="tel" id="phone" placeholder="Phone" inputmode="decimal" required style="width: 100%; padding: 10px; margin-bottom: 10px; box-sizing:border-box;">
                    
                    <input type="file" id="imageInput" accept="image/*" capture="environment" style="display: none;">
                    <button type="button" onclick="document.getElementById('imageInput').click()" 
                            style="width: 100%; padding: 10px; background: #6c757d; color: white; border: none; border-radius: 5px; margin-bottom: 10px;">
                        📸 TAKE/UPLOAD IMAGE
                    </button>
                    
                    <button type="submit" style="width: 100%; padding: 10px; background: #28a745; color: white; border: none; border-radius: 5px;">SUBMIT</button>
                    <button type="button" id="closeFormBtn" style="width: 100%; padding: 10px; background: #dc3545; color: white; border: none; border-radius: 5px; margin-top: 10px;">CANCEL</button>
                </form>
            </div>

            <div style="display: grid; gap: 10px;">
                ${locations.map(loc => `
                    <button onclick="window.navigateTo('view_2_locations_details', ${JSON.stringify(loc).replace(/"/g, '&quot;')})" 
                            style="padding: 15px; background: #003366; color: white; border: none; border-radius: 5px; display: flex; flex-direction: column; align-items: center;">
                        <span style="font-size: 18px; font-weight: bold;">${loc.abbreviation || 'N/A'}</span>
                        <span style="font-size: 10px; opacity: 0.8;">${loc.number_name}</span>
                    </button>
                `).join('')}
            </div>
        </div>
    `;

    const modal = document.getElementById('formModal');
    document.getElementById('openFormBtn').onclick = () => modal.style.display = 'block';
    document.getElementById('closeFormBtn').onclick = () => modal.style.display = 'none';

    document.getElementById('createForm').onsubmit = async (e) => {
        e.preventDefault();
        
        const number_name = document.getElementById('name').value;
        const abbreviation = document.getElementById('abbr').value;
        const address = document.getElementById('address').value;
        const phone = document.getElementById('phone').value;
        const file = document.getElementById('imageInput').files[0];

        // 1. Insert into locations
        const { data: locData, error: locError } = await supabase
            .from('locations')
            .insert([{ number_name, address, phone, abbreviation }])
            .select();

        if (locError) {
            alert('Error saving location: ' + locError.message);
            return;
        }

        // 2. If image, upload and link to location_images table
        if (file && locData.length > 0) {
            const locationId = locData[0].id;
            const fileName = `${Date.now()}_${file.name}`;
            
            const { error: uploadError } = await supabase.storage
                .from('locations-images')
                .upload(fileName, file);

            if (!uploadError) {
                const { data: urlData } = supabase.storage
                    .from('locations-images')
                    .getPublicUrl(fileName);
                
                await supabase
                    .from('location_images')
                    .insert([{ location_id: locationId, image_url: urlData.publicUrl }]);
            }
        }

        modal.style.display = 'none';
        renderLocations();
    };
}
