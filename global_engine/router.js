/* ================================================================
   PURPOSE: Router to handle view navigation
   LOCATION: /global_engine/router.js
   DATE: 2026-06-24
   VERSION: v2026_06_24_login_guard
   ================================================================ */

import { supabase } from './supabaseClient.js';

async function fetchLoggedInAppUser(authUserId) {
    return await supabase
        .from('app_users')
        .select('*')
        .eq('auth_user_id', authUserId)
        .eq('active_status', 'active')
        .single();
}

async function requireLogin(view) {
    if (view === 'login') return true;

    const { data, error } = await supabase.auth.getUser();

    if (error || !data?.user?.id) {
        localStorage.removeItem('facility_tracker_app_user');
        return false;
    }

    const profileResponse = await fetchLoggedInAppUser(data.user.id);

    if (profileResponse.error || !profileResponse.data) {
        console.error('App user profile error:', profileResponse.error);
        await supabase.auth.signOut();
        localStorage.removeItem('facility_tracker_app_user');
        return false;
    }

    localStorage.setItem('facility_tracker_app_user', JSON.stringify({
        auth_user_id: profileResponse.data.auth_user_id,
        display_name: profileResponse.data.display_name,
        role: profileResponse.data.role,
        active_status: profileResponse.data.active_status
    }));

    return true;
}

export async function navigateTo(view, context = {}) {
    const app = document.getElementById('app-container');

    if (!app) {
        console.error("App container (#app-container) not found.");
        return;
    }

    try {
        const basePath = '/FACILITYS-TRACKER-APP';

        const isAllowed = await requireLogin(view);

        if (!isAllowed) {
            const module = await import(`${basePath}/facilities_views/login/grid.js?v=20260624_login_view`);
            await module.renderLoginGrid('app-container', context);
            return;
        }

        if (view === 'login') {
            const module = await import(`${basePath}/facilities_views/login/grid.js?v=20260624_login_view`);

            if (typeof module.renderLoginGrid === 'function') {
                await module.renderLoginGrid('app-container', context);
                return;
            }

            if (typeof module.render === 'function') {
                await module.render('app-container', context);
                return;
            }

            console.error("No valid render function found in login/grid.js");
            app.innerHTML = `<div style="padding:20px;color:red;">Login view render function not found.</div>`;
            return;
        }

        if (view === 'facilities-home') {
            const module = await import(`${basePath}/facilities_views/facilities-home/grid.js?v=20260623_home_modal_hide_fix`);
            await module.renderDashboard('app-container');
            return;
        }

        if (view === 'facilities-details') {
            const module = await import(`${basePath}/facilities_views/facilities-details/grid.js?v=20260623_add_inspections_button`);

            if (typeof module.renderFacilityDetailsGrid === 'function') {
                await module.renderFacilityDetailsGrid('app-container', context);
                return;
            }

            console.error("No valid render function found in facilities-details/grid.js");
            app.innerHTML = `<div style="padding:20px;color:red;">Facility details view render function not found.</div>`;
            return;
        }

        if (view === 'facility-codes') {
            const module = await import(`${basePath}/facilities_views/facility-codes/grid.js?v=20260623_codes`);

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
            const module = await import(`${basePath}/facilities_views/facilities-projects/grid.js?v=20260623_projects`);

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
            const module = await import(`${basePath}/facilities_views/facility-project-detail/grid.js?v=20260623_remove_inspections_button`);

            if (typeof module.renderFacilityProjectDetailGrid === 'function') {
                await module.renderFacilityProjectDetailGrid('app-container', context);
                return;
            }

            console.error("No valid render function found in facility-project-detail/grid.js");
            app.innerHTML = `<div style="padding:20px;color:red;">Project detail view render function not found.</div>`;
            return;
        }

        if (view === 'facility-inspections') {
            const module = await import(`${basePath}/facilities_views/facility-inspections/grid.js?v=20260624_login_user_tracking`);

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
            const module = await import(`${basePath}/facilities_views/project-update/grid.js?v=20260623_update`);

            if (typeof module.renderProjectUpdateGrid === 'function') {
                await module.renderProjectUpdateGrid('app-container', context);
                return;
            }

            console.error("No valid render function found in project-update/grid.js");
            app.innerHTML = `<div style="padding:20px;color:red;">Project update view render function not found.</div>`;
            return;
        }

        if (view === 'project-photos') {
            const module = await import(`${basePath}/facilities_views/project-photos/grid.js?v=20260623_photos`);

            if (typeof module.renderProjectPhotosGrid === 'function') {
                await module.renderProjectPhotosGrid('app-container', context);
                return;
            }

            console.error("No valid render function found in project-photos/grid.js");
            app.innerHTML = `<div style="padding:20px;color:red;">Project photos view render function not found.</div>`;
            return;
        }

        if (view === 'materials') {
            const module = await import(`${basePath}/facilities_views/materials/screen.js?v=20260623_materials`);

            if (typeof module.renderMaterialsScreen === 'function') {
                await module.renderMaterialsScreen('app-container', context);
                return;
            }

            console.error("No valid render function found in materials/screen.js");
            app.innerHTML = `<div style="padding:20px;color:red;">Materials screen render function not found.</div>`;
            return;
        }

        if (view === 'facilities-contacts') {
            const module = await import(`${basePath}/facilities_views/facilities-contacts/grid.js?v=20260623_contacts`);

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
