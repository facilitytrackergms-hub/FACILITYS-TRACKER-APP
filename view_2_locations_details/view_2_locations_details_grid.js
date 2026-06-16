/* ================================================================
   PURPOSE: Updated Detail view with two buttons and actionable links
   LOCATION: /FACILITYS-TRACKER-APP/view_2_locations_details/view_2_locations_details_grid.js
   ================================================================ */

import { fetchLocationDetails } from './view_2_locations_details_data.js';

export async function renderDetails(location) {
    const app = document.getElementById('app');
    const details = await fetchLocationDetails(location.id);

    app.innerHTML = `
        <div style="padding: 20px; max-width: 400px; margin: auto; font-family: sans-serif;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h1 style="margin: 0;">${details.number_name}</h1>
                <button style="padding: 5px 10px; background: #e9ecef; border: 1px solid #ccc; border-radius: 4px;">Edit</button>
            </div>
            
            <div style="border: 1px solid #ccc; padding: 15px; margin: 20px 0; border-radius: 8px;">
                <p>📍 <strong>ADDRESS</strong><br>
                    <a href="https://maps.google.com/?q=${encodeURIComponent(details.address)}" target="_blank" style="color: #003366;">${details.address}</a>
                </p>
                <p>📞 <strong>PHONE CONTACT</strong><br>
                    <a href="tel:${details.phone}" style="color: #003366;">${details.phone}</a>
                </p>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <button style="padding: 20px; background: #003366; color: white; border: none; border-radius: 5px;">1. CONTACT</button>
                <button style="padding: 20px; background: #003366; color: white; border: none; border-radius: 5px;">2. PROJECTS</button>
            </div>

            <button onclick="window.navigateTo('locations')" style="width: 100%; margin-top: 10px; padding: 15px; background: #6c757d; color: white; border: none; border-radius: 5px;">BACK</button>
        </div>
    `;
}
