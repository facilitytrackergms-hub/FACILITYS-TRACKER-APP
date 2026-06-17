/* ================================================================
   PURPOSE: Router to handle view navigation
   LOCATION: /FACILITYS-TRACKER-APP/00_global_engine/router.js
   DATE: 2026-06-17
   ================================================================ */

import { renderLocations } from '../locations/view1_dashboard/grid.js';
import { renderDetails } from '../view_2_locations_details/view_2_locations_details_grid.js';
import { renderContacts } from '../view_3_contacts/view_3_contacts_grid.js';
import { renderProjects } from '../view_4_projects/view_4_projects_grid.js';

window.navigateTo = (view, context) => {
    switch (view) {
        case 'view1_dashboard':
            renderLocations();
            break;

        case 'view_2_locations_details':
            renderDetails(context);
            break;

        case 'view_3_contacts':
            renderContacts(context);
            break;

        case 'view_4_projects':
            renderProjects(context);
            break;

        default:
            renderLocations();
    }
};
