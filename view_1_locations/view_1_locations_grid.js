/* ================================================================
   PURPOSE: Dashboard view for Locations with inline creation and image handling
   LOCATION: /FACILITYS-TRACKER-APP/view_1_locations/view_1_locations_grid.js
   ================================================================ */

import { fetchLocations } from './view_1_locations_data.js';

export async function renderLocations() {
    const app = document.getElementById('app');
    const locations = await fetchLocations();

    app.innerHTML = `
        <div style="padding: 20px; max-width: 400px; margin: auto; font-family: sans-serif;">
            <h1 style="text-align: center;">Location Dashboard</h1>
            
            <form id="createForm" style="border: 1px solid #ccc; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <input type="text" id="name" placeholder="Location Name" required style="width: 90%; padding: 10px; margin-bottom: 5px;">
                <input type="text" id="address" placeholder="Address" required style="width: 90%; padding: 10px; margin-bottom: 5px;">
                <input type="tel" id="phone" placeholder="Phone" required style="width: 90%; padding: 10px; margin-bottom: 10px;">
                
                <div style="margin-bottom: 10px;">
                    <input type="file" id="imageInput" accept="image/*" capture="environment" style="display: none;">
                    <button type="button" onclick="document.getElementById('imageInput').click()" 
                            style="width: 100%; padding: 10px; background: #6c757d; color: white; border: none; border-radius: 5px;">
                        📸 TAKE/UPLOAD IMAGE
                    </button>
                    <p id="imageStatus" style="font-size: 12px; color: #555; text-align: center; margin-top: 5px;">No image selected</p>
                </div>

                <button type="submit" style="width: 100%; padding: 10px; background: #28a745; color: white; border: none; border-radius: 5px;">ADD LOCATION</button>
            </form>

            <div style="display: grid; gap: 10px;">
                ${locations.map(loc => `
                    <button onclick="window.navigateTo('hud', ${JSON.stringify(loc).replace(/"/g, '&quot;')})" 
                            style="padding: 15px; background: #003366; color: white; border: none; border-radius: 5px;">
                        ${loc.number_name}
                    </button>
                `).join('')}
            </div>
        </div>
    `;

    // Handle file selection
    document.getElementById('imageInput').onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            document.getElementById('imageStatus').innerText = "Selected: " + file.name;
        }
    };

    document.getElementById('createForm').onsubmit = async (e) => {
        e.preventDefault();
        const number_name = document.getElementById('name').value;
        const address = document.getElementById('address').value;
        const phone = document.getElementById('phone').value;
        const file = document.getElementById('imageInput').files[0];

        let imageUrl = null;

        // Upload to Supabase Storage if file exists
        if (file) {
            const { data, error } = await supabase.storage
                .from('locations-images')
                .upload(`${Date.now()}_${file.name}`, file);
            
            if (!error) {
                const { data: publicUrl } = supabase.storage
                    .from('locations-images')
                    .getPublicUrl(data.path);
                imageUrl = publicUrl.publicUrl;
            }
        }

        const { error } = await supabase
            .from('locations')
            .insert([{ number_name, address, phone, image_url: imageUrl }]);

        if (error) {
            alert('Error: ' + error.message);
        } else {
            renderLocations();
        }
    };
}
