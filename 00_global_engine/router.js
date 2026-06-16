/* ================================================================
   PURPOSE: Router to handle view navigation
   LOCATION: /FACILITYS-TRACKER-APP/00_global_engine/router.js
   ================================================================ */

import { renderLocations } from '../view_1_locations/view_1_locations_grid.js';
import { renderDetails } from '../view_2_locations_details/view_2_locations_details_grid.js';

window.navigateTo = (view, context) => {
    switch (view) {
        case 'locations':
            renderLocations();
            break;
        case 'view_2_locations_details':
            renderDetails(context);
            break;
        default:
            renderLocations();
    }
};
