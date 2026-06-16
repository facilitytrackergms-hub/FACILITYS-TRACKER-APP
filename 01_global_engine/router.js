/* ================================================================
   NAME     : router.js
   PURPOSE  : Central Navigation Controller
   ================================================================ */

window.navigateTo = async (view, context = {}) => {
    const app = document.getElementById('app');
    if (!app) return;

    app.innerHTML = '<p style="text-align:center; padding:50px;">Loading...</p>';
    
    // Cache-buster ensures GitHub Pages always loads the newest file
    const cb = "?v=" + new Date().getTime();

    try {
        if (view === 'locations') {
            const { renderLocations } = await import(`../02_locations/locations_view.js${cb}`);
            await renderLocations(context);
        } 
        else if (view === 'contacts') {
            const { renderContacts } = await import(`../03_contacts/contacts_view.js${cb}`);
            await renderContacts(context);
        }
        else {
            app.innerHTML = '<h1>Welcome to Facility Tracker</h1>';
        }
    } catch (err) {
        console.error("Navigation error:", err);
        app.innerHTML = `<p style="color:red; text-align:center;">Error loading view: ${view}</p>`;
    }
};

// Initial load
window.addEventListener('DOMContentLoaded', () => {
    window.navigateTo('locations');
});
