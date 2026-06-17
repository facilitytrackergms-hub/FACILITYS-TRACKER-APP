/* ================================================================
   PURPOSE: Grid view for Facility Contacts with Contact Image Upload/Replace
   LOCATION: /FACILITYS-TRACKER-APP/view_3_contacts/view_3_contacts_grid.js
   LAST UPDATED: 2026-06-16 @ 10:45 PM
   VERSION: v2026_06_16_contacts_image_fix
   ================================================================ */

import {
    fetchContacts,
    createContact,
    updateContact,
    deleteContact
} from './view_3_contacts_data.js';

import { supabase } from '../00_global_engine/supabaseClient.js';

const __FILENAME = 'view_3_contacts_grid.js';
const __VERSION = 'v2026_06_16_contacts_image_fix';
const __UPDATED = '2026-06-16 @ 10:45 PM';

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function renderBottomVersionTag() {
    return `
        <div style="margin-top: 18px; padding: 8px; text-align: center; font-size: 10px; color: #666; border-top: 1px solid #ddd;">
            ${__FILENAME} | ${__VERSION} | ${__UPDATED}
        </div>
    `;
}

export async function renderContacts(location) {
    const app = document.getElementById('app');
    if (!app) return;

    if (!location || !location.id) {
        app.innerHTML = `
            <div style="padding:20px; max-width:400px; margin:auto; font-family:sans-serif; text-align:center;">
                <p style="color:red;">Location missing.</p>
                <button onclick="window.navigateTo('locations')" style="width:100%; padding:15px; background:#6c757d; color:white; border:none; border-radius:6px;">BACK</button>
                ${renderBottomVersionTag()}
            </div>
        `;
        return;
    }

    const contacts = await fetchContacts(location.id);
    const locationName = escapeHtml(location.number_name || location.name || location.abbreviation || 'LOCATION');

    app.innerHTML = `
        <div style="padding:20px; max-width:400px; margin:auto; font-family:sans-serif;">
            <h1 style="text-align:center; margin:0 0 8px 0; color:#003366;">CONTACTS</h1>
            <div style="text-align:center; font-size:13px; color:#555; margin-bottom:18px;">${locationName}</div>

            <button id="addContactBtn" style="width:100%; padding:15px; background:#28a745; color:white; border:none; border-radius:6px; font-weight:bold; margin-bottom:15px;">
                ADD CONTACT
            </button>

            <div id="contactModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.55); padding:20px; box-sizing:border-box; z-index:100;">
                <form id="contactForm" style="background:white; padding:20px; border-radius:8px; margin-top:45px;">
                    <input type="hidden" id="contactId">
                    <input type="hidden" id="contactImageUrl">

                    <input type="text" id="contactName" placeholder="Contact Name" required
                        style="width:100%; padding:10px; margin-bottom:10px; box-sizing:border-box;">

                    <input type="text" id="contactRole" placeholder="Role / Title"
                        style="width:100%; padding:10px; margin-bottom:10px; box-sizing:border-box;">

                    <input type="tel" id="contactPhone" placeholder="Phone" inputmode="tel"
                        style="width:100%; padding:10px; margin-bottom:10px; box-sizing:border-box;">

                    <input type="email" id="contactEmail" placeholder="Email"
                        style="width:100%; padding:10px; margin-bottom:10px; box-sizing:border-box;">

                    <textarea id="contactNotes" placeholder="Notes"
                        style="width:100%; padding:10px; margin-bottom:10px; box-sizing:border-box; min-height:70px;"></textarea>

                    <input type="file" id="contactImageInput" accept="image/*" style="display:none;">

                    <button type="button" onclick="document.getElementById('contactImageInput').click()"
                        style="width:100%; padding:12px; background:#6c757d; color:white; border:none; border-radius:5px; font-weight:bold; margin-bottom:10px;">
                        ADD / REPLACE IMAGE
                    </button>

                    <button type="submit" style="width:100%; padding:12px; background:#28a745; color:white; border:none; border-radius:5px; font-weight:bold;">
                        SAVE CONTACT
                    </button>

                    <button type="button" id="cancelContactBtn" style="width:100%; padding:12px; background:#6c757d; color:white; border:none; border-radius:5px; margin-top:10px;">
                        CANCEL
                    </button>
                </form>
            </div>

            <div style="display:grid; gap:12px;">
                ${contacts.length === 0 ? `
                    <div style="padding:15px; text-align:center; border:1px solid #ddd; border-radius:8px; color:#666;">
                        No contacts yet.
                    </div>
                ` : contacts.map(contact => `
                    <div style="border:1px solid #ddd; border-radius:10px; padding:14px; background:white;">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
                            <div style="display:flex; gap:10px; align-items:center;">
                                ${contact.image_url ? `
                                    <img src="${escapeHtml(contact.image_url)}" style="width:55px; height:55px; object-fit:cover; border-radius:50%; border:1px solid #ccc;">
                                ` : `
                                    <div style="width:55px; height:55px; border-radius:50%; background:#f1f1f1; border:1px solid #ccc; display:flex; align-items:center; justify-content:center; font-size:20px;">
                                        👤
                                    </div>
                                `}
                                <div>
                                    <div style="font-weight:bold; font-size:17px; color:#003366;">${escapeHtml(contact.name)}</div>
                                    <div style="font-size:13px; color:#555;">${escapeHtml(contact.role)}</div>
                                </div>
                            </div>
                            <div style="display:flex; gap:5px;">
                                <button class="editContactBtn" data-id="${contact.id}" style="padding:5px 8px; background:#e9ecef; border:1px solid #ccc; border-radius:4px;">Edit</button>
                                <button class="deleteContactBtn" data-id="${contact.id}" data-name="${escapeHtml(contact.name)}" style="padding:5px 8px; background:#dc3545; color:white; border:none; border-radius:4px;">🗑️</button>
                            </div>
                        </div>

                        <div style="margin-top:10px; font-size:14px;">
                            ${contact.phone ? `<div>📞 <a href="tel:${escapeHtml(contact.phone)}" style="color:#003366;">${escapeHtml(contact.phone)}</a></div>` : ''}
                            ${contact.email ? `<div>✉️ <a href="mailto:${escapeHtml(contact.email)}" style="color:#003366;">${escapeHtml(contact.email)}</a></div>` : ''}
                            ${contact.notes ? `<div style="margin-top:8px; color:#555;">${escapeHtml(contact.notes)}</div>` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>

            <button onclick="window.navigateTo('view_2_locations_details', ${JSON.stringify(location).replace(/"/g, '&quot;')})"
                style="width:100%; margin-top:16px; padding:15px; background:#6c757d; color:white; border:none; border-radius:6px;">
                BACK
            </button>

            ${renderBottomVersionTag()}
        </div>
    `;

    const modal = document.getElementById('contactModal');
    const form = document.getElementById('contactForm');

    function clearForm() {
        document.getElementById('contactId').value = '';
        document.getElementById('contactImageUrl').value = '';
        document.getElementById('contactName').value = '';
        document.getElementById('contactRole').value = '';
        document.getElementById('contactPhone').value = '';
        document.getElementById('contactEmail').value = '';
        document.getElementById('contactNotes').value = '';
        document.getElementById('contactImageInput').value = '';
    }

    document.getElementById('addContactBtn').onclick = () => {
        clearForm();
        modal.style.display = 'block';
    };

    document.getElementById('cancelContactBtn').onclick = () => {
        modal.style.display = 'none';
    };

    document.querySelectorAll('.editContactBtn').forEach(button => {
        button.onclick = () => {
            const contactId = button.dataset.id;
            const contact = contacts.find(c => String(c.id) === String(contactId));
            if (!contact) return;

            document.getElementById('contactId').value = contact.id;
            document.getElementById('contactImageUrl').value = contact.image_url || '';
            document.getElementById('contactName').value = contact.name || '';
            document.getElementById('contactRole').value = contact.role || '';
            document.getElementById('contactPhone').value = contact.phone || '';
            document.getElementById('contactEmail').value = contact.email || '';
            document.getElementById('contactNotes').value = contact.notes || '';
            document.getElementById('contactImageInput').value = '';

            modal.style.display = 'block';
        };
    });

    document.querySelectorAll('.deleteContactBtn').forEach(button => {
        button.onclick = async () => {
            const contactId = button.dataset.id;
            const contactName = button.dataset.name || 'this contact';

            if (!confirm(`Delete ${contactName}?`)) return;

            const { error } = await deleteContact(contactId);

            if (error) {
                alert('Error: ' + error.message);
                return;
            }

            renderContacts(location);
        };
    });

    form.onsubmit = async (e) => {
        e.preventDefault();

        const contactId = document.getElementById('contactId').value;
        const imageFile = document.getElementById('contactImageInput').files[0];
        let imageUrl = document.getElementById('contactImageUrl').value || '';

        if (imageFile) {
            const sanitizedName = imageFile.name
                .replace(/\s+/g, '_')
                .replace(/[^a-zA-Z0-9._-]/g, '');

            const fileName = `contacts/${Date.now()}_${sanitizedName}`;

            const { error: uploadError } = await supabase.storage
                .from('locations-images')
                .upload(fileName, imageFile);

            if (uploadError) {
                console.error('Contact Image Upload Error:', uploadError);
                alert('Image upload failed: ' + uploadError.message);
                return;
            }

            const { data } = supabase.storage
                .from('locations-images')
                .getPublicUrl(fileName);

            imageUrl = data.publicUrl;
        }

        const contactData = {
            location_id: location.id,
            name: document.getElementById('contactName').value.trim(),
            role: document.getElementById('contactRole').value.trim(),
            phone: document.getElementById('contactPhone').value.trim(),
            email: document.getElementById('contactEmail').value.trim(),
            notes: document.getElementById('contactNotes').value.trim(),
            image_url: imageUrl
        };

        let result;

        if (contactId) {
            result = await updateContact(contactId, contactData);
        } else {
            result = await createContact(contactData);
        }

        if (result.error) {
            alert('Error: ' + result.error.message);
            return;
        }

        modal.style.display = 'none';
        renderContacts(location);
    };
}
