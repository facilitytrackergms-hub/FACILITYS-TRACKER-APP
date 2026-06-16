/* ================================================================
   NAME     : 02_locations_view.js
   PURPOSE  : UI rendering for locations
   ================================================================ */
import { locationData } from './01_locations_data.js';

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
