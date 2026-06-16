/* ================================================================
   NAME     : 02_locations_view.js
   PURPOSE  : UI rendering for locations
   ================================================================ */
import { locationData } from './01_locations_data.js';
/* ================================================================
   NAME     : 02_locations_view.js
   PURPOSE  : UI for Location Dashboard with dynamic button generation
   ================================================================ */
import { locationData } from './01_locations_data.js';

export async function renderLocations() {
    const app = document.getElementById('app');
    
    // 1. Render Dashboard Layout
    app.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <h1>Location Dashboard</h1>
            <button id="btn-create" style="background: green; color: white; padding: 10px 20px; border: none; cursor: pointer;">
                Create New Location
            </button>
            <div id="location-grid" style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin-top: 20px;">
            </div>
        </div>
        <div id="modal" style="display:none; position:fixed; top:20%; left:30%; background:white; padding:20px; border:1px solid #ccc;">
            <h3>New Location</h3>
            <input id="loc-name" placeholder="Initials (e.g. FAC)" /><br>
            <input id="loc-address" placeholder="Address" /><br>
            <input id="loc-phone" placeholder="Phone" /><br>
            <input id="loc-image" placeholder="Image URL" /><br>
            <button id="btn-save">Save Location</button>
            <button id="btn-close">Cancel</button>
        </div>
    `;

    // 2. Fetch and Render Buttons
    const grid = document.getElementById('location-grid');
    const locations = await locationData.fetchAll();
    
    locations.forEach(loc => {
        const btn = document.createElement('button');
        btn.innerText = loc.name; // This is your Initials/Name
        btn.style.padding = "20px";
        btn.style.width = "100px";
        grid.appendChild(btn);
    });

    // 3. Modal Logic
    document.getElementById('btn-create').onclick = () => document.getElementById('modal').style.display = 'block';
    document.getElementById('btn-close').onclick = () => document.getElementById('modal').style.display = 'none';
    
    document.getElementById('btn-save').onclick = async () => {
        const newLoc = {
            name: document.getElementById('loc-name').value,
            address: document.getElementById('loc-address').value,
            phone: document.getElementById('loc-phone').value,
            image_url: document.getElementById('loc-image').value
        };
        await locationData.insert(newLoc);
        document.getElementById('modal').style.display = 'none';
        renderLocations(); // Refresh grid
    };
}
export async function renderLocations() {
    const container = document.getElementById('app');
    container.innerHTML = '<h1>Locations</h1><div id="grid"></div>';
    
    try {
        const locations = await locationData.fetchAll();
        const grid = document.getElementById('grid');
        
        locations.forEach(loc => {
            const card = document.createElement('div');
            card.className = 'location-card';
            card.innerHTML = `<h3>${loc.number_name}</h3><p>${loc.address}</p>`;
            grid.appendChild(card);
        });
    } catch (err) {
        console.error("Error loading locations:", err);
    }
}
