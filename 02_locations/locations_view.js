/* ================================================================
   NAME     : locations_view.js
   PURPOSE  : UI for Location Dashboard
   ================================================================ */
import { locationData } from './locations_data.js';

export async function renderLocations(context) {
    const app = document.getElementById('app');
    
    app.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <h1>Location Dashboard</h1>
            <button id="btn-create" style="background: #28a745; color: white; padding: 10px 20px; border: none; cursor: pointer; border-radius: 5px;">
                Create New Location
            </button>
            <div id="location-grid" style="display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin-top: 20px;">
            </div>
        </div>
        <div id="modal" style="display:none; position:fixed; top:20%; left:30%; background:white; padding:20px; border:1px solid #ccc; box-shadow: 0 4px 8px rgba(0,0,0,0.2);">
            <h3>New Location</h3>
            <input id="loc-name" placeholder="Name" style="display:block; margin-bottom:10px;" /><br>
            <input id="loc-address" placeholder="Address" style="display:block; margin-bottom:10px;" /><br>
            <input id="loc-phone" placeholder="Phone" style="display:block; margin-bottom:10px;" /><br>
            <button id="btn-save">Save Location</button>
            <button id="btn-close">Cancel</button>
        </div>
    `;

    const grid = document.getElementById('location-grid');
    const locations = await locationData.fetchAll();
    
    locations.forEach(loc => {
        const btn = document.createElement('button');
        btn.innerText = loc.number_name;
        btn.style.padding = "20px";
        btn.style.backgroundColor = "#003366";
        btn.style.color = "white";
        btn.style.border = "none";
        btn.style.borderRadius = "5px";
        btn.style.cursor = "pointer";
        btn.onclick = () => window.location.href = `tel:${loc.phone}`;
        grid.appendChild(btn);
    });

    document.getElementById('btn-create').onclick = () => document.getElementById('modal').style.display = 'block';
    document.getElementById('btn-close').onclick = () => document.getElementById('modal').style.display = 'none';
    
    document.getElementById('btn-save').onclick = async () => {
        const newLoc = {
            number_name: document.getElementById('loc-name').value,
            address: document.getElementById('loc-address').value,
            phone: document.getElementById('loc-phone').value
        };
        await locationData.insert(newLoc);
        document.getElementById('modal').style.display = 'none';
        renderLocations(); // Refresh grid
    };
}
