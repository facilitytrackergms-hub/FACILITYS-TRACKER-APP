/*================================================================
FACILITIES-CONTACTS GRID
VERSION: v2026_06_18_contacts_image_upload_view
================================================================*/

import { supabase } from '../../global_engine/supabaseClient.js';
import { uploadImage } from '../../global_engine/image-handler.js';

async function fetchContacts(facilityId) {
    const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('facilities_id', facilityId)
        .order('name', { ascending: true });

    if (error) {
        console.error('fetchContacts error:', error);
        return [];
    }

    return data || [];
}

function escapeHtml(value) {
    return String(value || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function getFacilityId(context) {
    if (typeof context === 'object' && context !== null) return context.id;
    return context;
}

function getFacilityName(context) {
    if (typeof context === 'object' && context !== null) {
        return context.abbreviation || context.number_name || context.name || 'Facility';
    }

    return 'Facility';
}

export async function renderContactsGrid(containerId, context = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const facilityId = getFacilityId(context);
    const facilityName = getFacilityName(context);

    if (!facilityId) {
        container.innerHTML = `<p style="color:red;text-align:center;">Missing facility ID.</p>`;
        return;
    }

    const contacts = await fetchContacts(facilityId);

    container.innerHTML = `
        <style>
            .contacts-card { background: #ffffff; max-width: 350px; margin: 16px auto; padding: 18px; border-radius: 14px; box-shadow: 0 4px 18px rgba(0,0,0,0.08); text-align: center; }
            .contacts-title { color: #003b73; font-size: 22px; font-weight: bold; margin-bottom: 4px; }
            .contacts-subtitle { color: #667085; font-size: 12px; margin-bottom: 16px; }
            .contacts-add-btn { background: #22a843; color: white; border: none; border-radius: 9px; width: 100%; padding: 13px; font-weight: bold; font-size: 15px; cursor: pointer; margin-bottom: 16px; }
            .contacts-list { display: grid; gap: 12px; }
            .contact-item { border: 1px solid #d6dee8; border-radius: 12px; padding: 12px; background: #f8fbff; text-align: left; }
            .contact-top { display: flex; gap: 12px; align-items: center; }
            .contact-img { width: 58px; height: 58px; border-radius: 10px; object-fit: cover; background: #dbe5ef; flex: 0 0 auto; }
            .contact-name { color: #003b73; font-weight: bold; font-size: 17px; }
            .contact-role { color: #667085; font-size: 12px; font-weight: bold; margin-top: 2px; }
            .contact-link { display: block; color: #003b73; font-size: 13px; margin-top: 4px; text-decoration: underline; }
            .contact-notes { font-size: 12px; color: #344054; margin-top: 6px; }
            .contact-buttons { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px; }
            .contact-buttons button { border: none; border-radius: 8px; padding: 9px; font-weight: bold; cursor: pointer; }
            .btn-edit-contact { background: #003b73; color: white; }
            .btn-delete-contact { background: #fee2e2; color: #dc2626; }
            .contacts-back-btn { background: #747d8c; color: white; border: none; border-radius: 9px; width: 100%; min-height: 48px; font-size: 15px; font-weight: bold; cursor: pointer; margin-top: 16px; }
            .contacts-version-tag { border-top: 1px solid #d6dee8; margin-top: 18px; padding-top: 10px; font-size: 10px; color: #7d8ba0; text-align: center; }

            .contact-modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: none; align-items: center; justify-content: center; z-index: 9999; }
            .contact-modal { background: white; width: 90%; max-width: 360px; border-radius: 12px; padding: 18px; box-shadow: 0 4px 18px rgba(0,0,0,0.25); text-align: left; max-height: 90vh; overflow-y: auto; }
            .contact-modal h3 { margin: 0 0 14px; text-align: center; color: #003b73; }
            .contact-modal label { display: block; font-size: 13px; font-weight: bold; margin: 10px 0 4px; color: #003b73; }
            .contact-modal input, .contact-modal textarea { width: 100%; padding: 9px; border: 1px solid #bbb; border-radius: 6px; font-size: 15px; box-sizing: border-box; }
            .contact-modal textarea { min-height: 70px; resize: vertical; }
            .contact-image-preview { width: 100%; max-height: 130px; object-fit: cover; border-radius: 8px; margin-top: 8px; display: none; }
            .btn-contact-image { background: #003b73; color: white; border: none; border-radius: 7px; padding: 11px; font-weight: bold; cursor: pointer; width: 100%; margin-top: 8px; }
            .contact-modal-buttons { display: flex; gap: 8px; margin-top: 16px; }
            .contact-modal-buttons button { flex: 1; padding: 11px; border: none; border-radius: 7px; font-weight: bold; cursor: pointer; }
            .btn-save-contact { background: #22a843; color: white; }
            .btn-cancel-contact { background: #777; color: white; }
            .contact-error { color: red; font-size: 13px; text-align: center; margin-top: 10px; min-height: 16px; }
        </style>

        <div class="contacts-card">
            <div class="contacts-title">CONTACTS</div>
            <div class="contacts-subtitle">${escapeHtml(facilityName)}</div>

            <button id="btn-add-contact" class="contacts-add-btn">ADD CONTACT</button>

            <div class="contacts-list">
                ${contacts.length ? contacts.map(contact => `
                    <div class="contact-item">
                        <div class="contact-top">
                            ${contact.image_url ? `<img class="contact-img" src="${escapeHtml(contact.image_url)}" alt="${escapeHtml(contact.name)}">` : `<div class="contact-img"></div>`}
                            <div>
                                <div class="contact-name">${escapeHtml(contact.name)}</div>
                                <div class="contact-role">${escapeHtml(contact.role)}</div>
                                ${contact.phone ? `<a class="contact-link" href="tel:${escapeHtml(contact.phone)}">📞 ${escapeHtml(contact.phone)}</a>` : ''}
                                ${contact.email ? `<a class="contact-link" href="mailto:${escapeHtml(contact.email)}">✉️ ${escapeHtml(contact.email)}</a>` : ''}
                            </div>
                        </div>

                        ${contact.address ? `<a class="contact-link" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.address)}" target="_blank">📍 ${escapeHtml(contact.address)}</a>` : ''}
                        ${contact.notes ? `<div class="contact-notes">${escapeHtml(contact.notes)}</div>` : ''}

                        <div class="contact-buttons">
                            <button class="btn-edit-contact" data-id="${contact.id}">Edit</button>
                            <button class="btn-delete-contact" data-id="${contact.id}">Delete</button>
                        </div>
                    </div>
                `).join('') : `<p style="text-align:center;color:#667085;">No contacts yet.</p>`}
            </div>

            <button id="btn-back-facility" class="contacts-back-btn">⬅️ BACK</button>

            <div class="contacts-version-tag">facilities-contacts/grid.js | v2026_06_18_contacts_image_upload_view | 2026-06-18</div>
        </div>

        <div id="contact-modal-backdrop" class="contact-modal-backdrop">
            <div class="contact-modal">
                <h3 id="contact-modal-title">Add Contact</h3>

                <input id="contact-id-input" type="hidden">

                <label>Contact Name</label>
                <input id="contact-name-input" type="text">

                <label>Role</label>
                <input id="contact-role-input" type="text">

                <label>Phone</label>
                <input id="contact-phone-input" type="tel">

                <label>Email</label>
                <input id="contact-email-input" type="email">

                <label>Address</label>
                <input id="contact-address-input" type="text">

                <label>Notes</label>
                <textarea id="contact-notes-input"></textarea>

                <label>Contact Image</label>
                <input id="contact-image-input" type="file" accept="image/*">
                <img id="contact-image-preview" class="contact-image-preview" alt="Contact Image Preview">

                <button id="btn-update-contact-image" class="btn-contact-image">Add / Update Image</button>

                <div class="contact-modal-buttons">
                    <button id="btn-save-contact" class="btn-save-contact">Save</button>
                    <button id="btn-cancel-contact" class="btn-cancel-contact">Cancel</button>
                </div>

                <div id="contact-error" class="contact-error"></div>
            </div>
        </div>
    `;

    const modalBackdrop = document.getElementById('contact-modal-backdrop');
    const modalTitle = document.getElementById('contact-modal-title');
    const contactIdInput = document.getElementById('contact-id-input');
    const nameInput = document.getElementById('contact-name-input');
    const roleInput = document.getElementById('contact-role-input');
    const phoneInput = document.getElementById('contact-phone-input');
    const emailInput = document.getElementById('contact-email-input');
    const addressInput = document.getElementById('contact-address-input');
    const notesInput = document.getElementById('contact-notes-input');
    const imageInput = document.getElementById('contact-image-input');
    const imagePreview = document.getElementById('contact-image-preview');
    const errorBox = document.getElementById('contact-error');

    function clearModal() {
        contactIdInput.value = '';
        nameInput.value = '';
        roleInput.value = '';
        phoneInput.value = '';
        emailInput.value = '';
        addressInput.value = '';
        notesInput.value = '';
        imageInput.value = '';
        imagePreview.src = '';
        imagePreview.style.display = 'none';
        errorBox.textContent = '';
        modalTitle.textContent = 'Add Contact';
    }

    function openModal(contact = null) {
        clearModal();

        if (contact) {
            contactIdInput.value = contact.id || '';
            nameInput.value = contact.name || '';
            roleInput.value = contact.role || '';
            phoneInput.value = contact.phone || '';
            emailInput.value = contact.email || '';
            addressInput.value = contact.address || '';
            notesInput.value = contact.notes || '';
            modalTitle.textContent = 'Edit Contact';

            if (contact.image_url) {
                imagePreview.src = contact.image_url;
                imagePreview.style.display = 'block';
            }
        }

        modalBackdrop.style.display = 'flex';
    }

    document.getElementById('btn-add-contact').addEventListener('click', () => {
        openModal();
    });

    document.getElementById('btn-cancel-contact').addEventListener('click', () => {
        modalBackdrop.style.display = 'none';
    });

    document.getElementById('btn-back-facility').addEventListener('click', () => {
        if (window.navigateTo) window.navigateTo('facilities-projects', context);
    });

    imageInput.addEventListener('change', () => {
        const file = imageInput.files?.[0];
        if (!file) return;

        imagePreview.src = URL.createObjectURL(file);
        imagePreview.style.display = 'block';
    });

    document.querySelectorAll('.btn-edit-contact').forEach(button => {
        button.addEventListener('click', () => {
            const contactId = button.dataset.id;
            const contact = contacts.find(c => String(c.id) === String(contactId));
            if (contact) openModal(contact);
        });
    });

    document.querySelectorAll('.btn-delete-contact').forEach(button => {
        button.addEventListener('click', async () => {
            const contactId = button.dataset.id;

            if (!confirm('Are you sure you want to delete this contact?')) return;

            const { error } = await supabase
                .from('contacts')
                .delete()
                .eq('id', contactId);

            if (error) {
                console.error('Delete contact error:', error);
                alert('Could not delete contact.');
                return;
            }

            await renderContactsGrid(containerId, context);
        });
    });

    document.getElementById('btn-update-contact-image').addEventListener('click', async () => {
        const contactId = contactIdInput.value;
        const file = imageInput.files?.[0];

        if (!contactId) {
            errorBox.textContent = 'Save contact first, then update image.';
            return;
        }

        if (!file) {
            errorBox.textContent = 'Choose an image first.';
            return;
        }

        errorBox.textContent = 'Uploading image...';

        try {
            const imageUrlUploaded = await uploadImage(file, 'locations-images', `contacts/${facilityId}`);

            const { error } = await supabase
                .from('contacts')
                .update({ image_url: imageUrlUploaded })
                .eq('id', contactId);

            if (error) throw error;

            errorBox.textContent = '';
            modalBackdrop.style.display = 'none';
            await renderContactsGrid(containerId, context);

        } catch (err) {
            console.error('Contact image update error:', err);
            errorBox.textContent = 'Could not update image.';
        }
    });

    document.getElementById('btn-save-contact').addEventListener('click', async () => {
        const contactId = contactIdInput.value;
        const contactName = nameInput.value.trim();
        const contactRole = roleInput.value.trim();
        const contactPhone = phoneInput.value.trim();
        const contactEmail = emailInput.value.trim();
        const contactAddress = addressInput.value.trim();
        const contactNotes = notesInput.value.trim();

        if (!contactName) {
            errorBox.textContent = 'Contact name required.';
            return;
        }

        const payload = {
            facilities_id: facilityId,
            name: contactName,
            role: contactRole,
            phone: contactPhone,
            email: contactEmail,
            address: contactAddress,
            notes: contactNotes
        };

        let savedContact = null;

        if (contactId) {
            const { data, error } = await supabase
                .from('contacts')
                .update(payload)
                .eq('id', contactId)
                .select('*')
                .single();

            if (error) {
                console.error('Update contact error:', error);
                errorBox.textContent = 'Could not update contact.';
                return;
            }

            savedContact = data;
        } else {
            const { data, error } = await supabase
                .from('contacts')
                .insert([payload])
                .select('*')
                .single();

            if (error) {
                console.error('Insert contact error:', error);
                errorBox.textContent = 'Could not save contact.';
                return;
            }

            savedContact = data;
        }

        const file = imageInput.files?.[0];

        if (file && savedContact?.id) {
            try {
                const imageUrlUploaded = await uploadImage(file, 'locations-images', `contacts/${facilityId}`);

                const { error: imageError } = await supabase
                    .from('contacts')
                    .update({ image_url: imageUrlUploaded })
                    .eq('id', savedContact.id);

                if (imageError) throw imageError;

            } catch (err) {
                console.error('Contact image save error:', err);
                errorBox.textContent = 'Contact saved, but image failed.';
                return;
            }
        }

        modalBackdrop.style.display = 'none';
        await renderContactsGrid(containerId, context);
    });
}
