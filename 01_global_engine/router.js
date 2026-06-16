/* ================================================================
   NAME     : router.js
   PURPOSE  : Traffic controller to switch views in index.html
   ================================================================ */

import { renderLocations } from '../02_locations/locations_view.js';
import { renderContacts } from '../03_contacts/contacts_view.js';

export const router = {
    async navigateTo(viewName) {
        const app = document.getElementById('app');
        app.innerHTML = '<div class="loading">Loading...</div>';

        switch(viewName) {
            case 'locations':
                await renderLocations();
                break;
            case 'contacts':
                await renderContacts();
                break;
            default:
                app.innerHTML = '<h1>Welcome to Facility Tracker</h1>';
        }
    }
};
