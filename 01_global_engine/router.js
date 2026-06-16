/* ================================================================
   NAME     : router.js
   PURPOSE  : Traffic controller to switch views in index.html
   ================================================================ */

// Import your view functions
import { renderLocations } from '../02_locations/02_locations_view.js';
import { renderContacts } from '../03_contacts/02_contacts_view.js';
// import { renderProjects } from '../04_projects/02_projects_view.js';

export const router = {
    // This function clears the app div and loads the correct view
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
            case 'projects':
                // await renderProjects();
                break;
            default:
                app.innerHTML = '<h1>Welcome to Facility Tracker</h1>';
        }
    }
};
