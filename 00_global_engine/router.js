/* ================================================================
   PURPOSE: Router to handle view navigation
   LOCATION: /FACILITYS-TRACKER-APP/00_global_engine/router.js
   ================================================================ */

import { renderLocations } from '../view_1_locations/view_1_locations_grid.js';

window.navigateTo = (view, context) => {
    switch (view) {
        case 'locations':
            renderLocations();
            break;
        case 'hud':
            // Logic for your hub/dashboard here
            console.log("Navigating to Hub with context:", context);
            break;
        case 'create_location':
            // If you have a separate form file, import it and call it here
            break;
        default:
            renderLocations();
    }
};
