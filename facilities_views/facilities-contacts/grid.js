
/* ================================================================
   PURPOSE: Grid rendering for contacts
   LOCATION: /facilities_views/facilities-contacts/grid.js
   DATE: 2026-06-18
   ================================================================ */

import { fetchContacts } from './data.js';

export async function renderContactsGrid(containerId, facilityId) {
    const container = document.getElementById(containerId);
    const contacts = await fetchContacts(facilityId);

    if (!contacts.length) {
        container.innerHTML = '<p>No contacts found for this facility.</p>';
        return;
    }

    let html = `<table>
        <thead>
            <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Phone</th>
                <th>Email</th>
            </tr>
        </thead>
        <tbody>`;

    contacts.forEach(contact => {
        html += `
            <tr>
                <td>${contact.name}</td>
                <td>${contact.role}</td>
                <td>${contact.phone}</td>
                <td>${contact.email}</td>
            </tr>`;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
}
