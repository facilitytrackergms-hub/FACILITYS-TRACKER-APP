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

    const facilityViews = ['facilities-contacts', 'facilities-projects'];
    if (facilityViews.includes(view)) {
        const facilityId = context?.facility?.id || context?.id || context?.facilityId;
        if (!facilityId) {
            console.warn(`Navigation blocked to "${view}": Missing valid facility ID.`);
            view = 'facilities-home';
            context = {};
        }
    }

    app.innerHTML = '<p style="text-align:center; padding:50px;">Loading...</p>';

    try {
        if (view === 'facilities-home') {
            const { renderDashboard } = await import(`../facilities_views/facilities-home/grid.js`);
            await renderDashboard('app-container');
        } 
        else if (view === 'facilities-contacts') {
            const { renderContactsGrid } = await import(`../facilities_views/facilities-contacts/grid.js`);
            const facilityId = context.facility?.id || context?.id;
            await renderContactsGrid('app-container', facilityId);
        }
        else if (view === 'facilities-projects') {
            const { renderProjectsGrid } = await import(`../facilities_views/facilities-projects/grid.js`);
            const facilityId = context.facility?.id || context?.id;
            await renderProjectsGrid('app-container', facilityId);
        }
        else {
            console.warn(`Unknown view "${view}"`);
            app.innerHTML = `<p style="text-align:center; padding:20px;">View not found.</p>`;
        }
    } catch (err) {
        console.error("Navigation error:", err);
        app.innerHTML = `<p style="color:red; text-align:center; padding:20px;">Error loading: ${view}</p>`;
    }
}

// Ensure global access for buttons
window.navigateTo = navigateTo;

window.addEventListener('DOMContentLoaded', () => {
    navigateTo('facilities-home');
});
