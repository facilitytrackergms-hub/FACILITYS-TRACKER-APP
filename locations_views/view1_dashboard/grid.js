/* ================================================================
   PURPOSE: Dashboard with "Create New Facility" button
   LOCATION: /locations/view1_dashboard/grid.js
   DATE: 2026-06-17
   ================================================================ */

import { fetchLocations } from './data.js';
import { supabase } from '../../00_global_engine/supabaseClient.js';

export async function renderDashboard() {
    const app = document.getElementById('app');
    const locations = await fetchLocations();

    app.innerHTML = `
        <div style="padding: 20px; max-width: 400px; margin: auto; font-family: sans-serif;">
            <h1 style="text-align: center;">FACILITIES DASHBOARD</h1>
            
            <button id="openFormBtn" style="width: 100%; padding: 15px; background: #28a745; color: white; border: none; border-radius: 5px; margin-bottom: 20px; font-weight: bold;">
                Create New Facility
            </button>

            <div style="display: grid; gap: 10px;">
                ${locations.map(loc => `
                    <button onclick="window.navigateTo('view1_facilities', ${JSON.stringify(loc).replace(/"/g, '&quot;')})" 
                            style="padding: 15px; background: #003366; color: white; border: none; border-radius: 5px;">
                        ${loc.abbreviation} - ${loc.number_name}
                    </button>
                `).join('')}
            </div>
        </div>
    `;
    
    // Attach event listeners after rendering
    document.getElementById('openFormBtn').onclick = () => { /* Logic */ };
}
