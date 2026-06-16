/* ================================================================
   NAME     : router.js
   PURPOSE  : Traffic controller to switch views in index.html
   ================================================================ */

// UPDATE THESE PATHS TO MATCH YOUR ACTUAL GITHUB FOLDERS
import { renderLocations } from '../locations/locations_view.js';
import { renderContacts } from '../contacts/contacts_view.js';
// import { renderProjects } from '../projects/projects_view.js';

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
            case 'projects':
                // await renderProjects();
                break;
            default:
                app.innerHTML = '<h1>Welcome to Facility Tracker</h1>';
        }
    }
};
