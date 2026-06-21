/* ================================================================
   PURPOSE: Router to handle view navigation
   LOCATION: /global_engine/router.js
   ================================================================ */

const ROUTE_MAP = {
    'facilities-home': { path: 'facilities_views/facilities-home/grid.js', fn: 'renderDashboard' },
    'facilities-details': { path: 'facilities_views/facilities-details/grid.js', fn: 'renderFacilityDetailsGrid' },
    'facilities-projects': { path: 'facilities_views/facilities-projects/grid.js', fn: ['renderProjectsGrid', 'renderProjects', 'renderDashboard'] },
    'facility-project-detail': { path: 'facilities_views/facility-project-detail/grid.js', fn: 'renderFacilityProjectDetailGrid' },
    'project-update': { path: 'facilities_views/project-update/grid.js', fn: 'renderProjectUpdateGrid' },
    'project-photos': { path: 'facilities_views/project-photos/grid.js', fn: 'renderProjectPhotosGrid' },
    'materials': { path: 'facilities_views/materials-panel/grid.js', fn: 'renderMaterialsGrid' },
    'facilities-contacts': { path: 'facilities_views/facilities-contacts/grid.js', fn: ['renderContactsGrid', 'renderContacts', 'renderDashboard'] }
};

export async function navigateTo(view, context = {}) {
    const app = document.getElementById('app-container');
    if (!app) return console.error("App container not found.");

    const route = ROUTE_MAP[view];
    if (!route) {
        app.innerHTML = `<div style="padding:20px;color:red;">Unknown route: ${view}</div>`;
        return;
    }

    try {
        const module = await import(`/FACILITYS-TRACKER-APP/${route.path}`);
        const fns = Array.isArray(route.fn) ? route.fn : [route.fn];
        const targetFn = fns.find(fnName => typeof module[fnName] === 'function');

        if (targetFn) {
            await module[targetFn]('app-container', context);
        } else {
            throw new Error(`No valid render function found for ${view}`);
        }
    } catch (err) {
        console.error("Navigation error:", err);
        app.innerHTML = `<div style="padding:20px;color:red;">Navigation error. Check console.</div>`;
    }
}

window.navigateTo = navigateTo;
