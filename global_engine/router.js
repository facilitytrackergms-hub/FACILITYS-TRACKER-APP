/* ================================================================
   PURPOSE: Router to handle view navigation
   LOCATION: /global_engine/router.js
   DATE: 2026-06-18
   ================================================================ */

export async function navigateTo(view, context = {}) {
    const app = document.getElementById('app-container');
    if (!app) {
        console.error("App container (#app-container) not found.");
        return;
    }

    // ... (keep your existing logic) ...

    try {
        // Use absolute paths starting with /FACILITYS-TRACKER-APP/
        // Adjust '/FACILITYS-TRACKER-APP/' if your root is different on GitHub
        const basePath = '/FACILITYS-TRACKER-APP'; 

        if (view === 'facilities-home') {
            const { renderDashboard } = await import(`${basePath}/facilities_views/facilities-home/grid.js`);
            await renderDashboard('app-container');
        } 
        else if (view === 'facilities-contacts') {
            const { renderContactsGrid } = await import(`${basePath}/facilities_views/facilities-contacts/grid.js`);
            // ...
        }
        // ...
    } catch (err) {
        console.error("Navigation error:", err);
    }
}
