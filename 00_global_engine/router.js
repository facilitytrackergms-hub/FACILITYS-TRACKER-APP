/* ================================================================
   NAME      : router.js
   PURPOSE   : Central Navigation Controller
   ================================================================ */

window.navigateTo = async (view, context = {}) => {
    const app = document.getElementById('app');
    if (!app) return;

    app.innerHTML = '<p style="text-align:center; padding:50px;">Loading...</p>';
    const cb = "?v=" + new Date().getTime();

    try {
        if (view === 'locations') {
            const module = await import(`/FACILITYS-TRACKER-APP/02_locations/locations_view.js${cb}`);
            await module.renderLocations(context);
        } 
        else if (view === 'contacts') {
            const module = await import(`/FACILITYS-TRACKER-APP/03_contacts/contacts_view.js${cb}`);
            await module.renderContacts(context);
        }
    } catch (err) {
        console.error("Navigation error:", err);
        app.innerHTML = `<p style="color:red; text-align:center;">Error loading view: ${view}</p>`;
    }
};

window.addEventListener('DOMContentLoaded', () => {
    window.navigateTo('locations');
});
