/* ================================================================
   PURPOSE: Router to handle view navigation
   LOCATION: /global_engine/router.js
   DATE: 2026-06-22
   VERSION: v2026_06_22_cache_bust_facility_details
   ================================================================ */

export async function navigateTo(view, context = {}) {
    const app = document.getElementById('app-container');

    if (!app) {
        console.error("App container (#app-container) not found.");
        return;
    }

    try {
        const basePath = '/FACILITYS-TRACKER-APP';

        if (view === 'facilities-home') {
            const module = await import(`${basePath}/facilities_views/facilities-home/grid.js?v=20260622_home`);
            await module.renderDashboard('app-container');
            return;
        }

        if (view === 'facilities-details') {
            const module = await import(`${basePath}/facilities_views/facilities-details/grid.js?v=20260622_codes_text_import_fix`);

            if (typeof module.renderFacilityDetailsGrid === 'function') {
                await module.renderFacilityDetailsGrid('app-container', context);
                return;
            }

            console.error("No valid render function found in facilities-details/grid.js");
            app.innerHTML = `<div style="padding:20px;color:red;">Facility details view render function not found.</div>`;
            return;
        }

        if (view === 'facility-codes') {
            const module = await import(`${basePath}/facilities_views/facility-codes/grid.js?v=20260622_codes`);

            if (typeof module.renderFacilityCodesGrid === 'function') {
                await module.renderFacilityCodesGrid('app-container', context);
                return;
            }

            if (typeof module.render === 'function') {
                await module.render('app-container', context);
                return;
            }

            console.error("No valid render function found in facility-codes/grid.js");
            app.innerHTML = `<div style="padding:20px;color:red;">Facility codes view render function not found.</div>`;
            return;
        }

        if (view === 'facilities-projects') {
            const module = await import(`${basePath}/facilities_views/facilities-projects/grid.js?v=20260622_projects`);

            if (typeof module.renderProjectsGrid === 'function') {
                await module.renderProjectsGrid('app-container', context);
                return;
            }

            if (typeof module.renderProjects === 'function') {
                await module.renderProjects('app-container', context);
                return;
            }

            if (typeof module.renderDashboard === 'function') {
                await module.renderDashboard('app-container', context);
                return;
            }

            console.error("No valid render function found in facilities-projects/grid.js");
            app.innerHTML = `<div style="padding:20px;color:red;">Projects view render function not found.</div>`;
            return;
        }

        if (view === 'facility-project-detail') {
            const module = await import(`${basePath}/facilities_views/facility-project-detail/grid.js?v=20260622_project_detail`);

            if (typeof module.renderFacilityProjectDetailGrid === 'function') {
                await module.renderFacilityProjectDetailGrid('app-container', context);
                return;
            }

            console.error("No valid render function found in facility-project-detail/grid.js");
            app.innerHTML = `<div style="padding:20px;color:red;">Project detail view render function not found.</div>`;
            return;
        }

        if (view === 'facility-inspections') {
            const module = await import(`${basePath}/facilities_views/facility-inspections/grid.js?v=20260622_inspections`);

            if (typeof module.renderFacilityInspectionsGrid === 'function') {
                await module.renderFacilityInspectionsGrid('app-container', context);
                return;
            }

            if (typeof module.render === 'function') {
                await module.render('app-container', context);
                return;
            }

            console.error("No valid render function found in facility-inspections/grid.js");
            app.innerHTML = `<div style="padding:20px;color:red;">Inspections view render function not found.</div>`;
            return;
        }

        if (view === 'project-update') {
            const module = await import(`${basePath}/facilities_views/project-update/grid.js?v=20260622_update`);

            if (typeof module.renderProjectUpdateGrid === 'function') {
                await module.renderProjectUpdateGrid('app-container', context);
                return;
            }

            console.error("No valid render function found in project-update/grid.js");
            app.innerHTML = `<div style="padding:20px;color:red;">Project update view render function not found.</div>`;
            return;
        }

        if (view === 'project-photos') {
            const module = await import(`${basePath}/facilities_views/project-photos/grid.js?v=20260622_photos`);

            if (typeof module.renderProjectPhotosGrid === 'function') {
                await module.renderProjectPhotosGrid('app-container', context);
                return;
            }

            console.error("No valid render function found in project-photos/grid.js");
            app.innerHTML = `<div style="padding:20px;color:red;">Project photos view render function not found.</div>`;
            return;
        }

        if (view === 'materials') {
            const module = await import(`${basePath}/facilities_views/materials/screen.js?v=20260622_materials`);

            if (typeof module.renderMaterialsScreen === 'function') {
                await module.renderMaterialsScreen('app-container', context);
                return;
            }

            console.error("No valid render function found in materials/screen.js");
            app.innerHTML = `<div style="padding:20px;color:red;">Materials screen render function not found.</div>`;
            return;
        }

        if (view === 'facilities-contacts') {
            const module = await import(`${basePath}/facilities_views/facilities-contacts/grid.js?v=20260622_contacts`);

            if (typeof module.renderContactsGrid === 'function') {
                await module.renderContactsGrid('app-container', context);
                return;
            }

            if (typeof module.renderContacts === 'function') {
                await module.renderContacts('app-container', context);
                return;
            }

            if (typeof module.renderDashboard === 'function') {
                await module.renderDashboard('app-container', context);
                return;
            }

            console.error("No valid render function found in facilities-contacts/grid.js");
            app.innerHTML = `<div style="padding:20px;color:red;">Contacts view render function not found.</div>`;
            return;
        }

        console.error("Unknown route:", view);
        app.innerHTML = `<div style="padding:20px;color:red;">Unknown route: ${view}</div>`;

    } catch (err) {
        console.error("Navigation error:", err);
        app.innerHTML = `<div style="padding:20px;color:red;">Navigation error. Check console.</div>`;
    }
}

window.navigateTo = navigateTo;
