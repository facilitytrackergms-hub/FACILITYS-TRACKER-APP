/*================================================================
FACILITIES-CONTACTS GRID
VERSION: v2026_06_18_view_on_button_contacts
================================================================*/

import {
    fetchContacts,
    createContact,
    updateContact,
    deleteContact,
    updateContactImage
} from './data.js';

import { uploadImage } from '../../global_engine/image-handler.js';

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
           .contacts-title { color: #003b73; font-size: 24px; font-weight: bold; margin-bottom: 2px; }
.contacts-subtitle { color: #003b73; font-size: 13px; font-weight: bold; margin-bottom: 16px; letter-spacing: 2px; }
            .contacts-add-btn { background: #22a843; color: white; border: none; border-radius: 9px; width: 100%; padding: 13px; font-weight: bold; font-size: 15px; cursor: pointer; margin-bottom: 16px; }
            .contacts-list {     display: grid;     grid-template-columns: repeat(3, 1fr);     gap: 8px; }
.contact-record-button {
    display:flex;
    flex-direction:column;
    align-items:center;
    justify-content:center;
    gap:4px;
    min-height:78px;
    background:#003b73;
    color:white;
    border:none;
    border-radius:10px;
    padding:6px 4px;
    cursor:pointer;
    font-weight:bold;
}

.contact-img {
    width:34px;
    height:34px;
    border-radius:50%;
    object-fit:cover;
    background:#dbe5ef;
}

.contact-name {
    color:white;
    font-size:12px;
    font-weight:bold;
    text-align:center;
    line-height:1.1;
}
.contact-role,
.contact-line,
.contact-notes,
.contact-top {
    display:none;
}
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
            .contact-modal-buttons { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 16px; }
            .contact-modal-buttons button { padding: 11px; border: none; border-radius: 7px; font-weight: bold; cursor: pointer; }
            .btn-save-contact { background: #22a843; color: white; }
            .btn-cancel-contact { background: #777; color: white; }
            .btn-delete-contact { background: #dc2626; color: yellow; display: none; width: 100%; margin-top: 10px; padding: 11px; border: none; border-radius: 7px; font-weight: bold; cursor: pointer; }
            .contact-error { color: red; font-size: 13px; text-align: center; margin-top: 10px; min-height: 16px; }
        </style>

        <div class="contacts-card">
           <div class="contacts-title">${escapeHtml(facilityName)}</div>
<div class="contacts-subtitle">CONTACTS</div>
            <div class="contacts-subtitle">${escapeHtml(facilityName)}</div>

            <button id="btn-add-contact" class="contacts-add-btn">ADD CONTACT</button>

            <div class="contacts-list">
              ${contacts.length ? contacts.map(contact => `
    <button type="button" class="contact-record-button" data-id="${contact.id}">
        ${contact.image_url
            ? `<img class="contact-img" src="${escapeHtml(contact.image_url)}" alt="${escapeHtml(contact.name)}">`
            : `<div class="contact-img"></div>`}
        <span class="contact-name">${escapeHtml(contact.name)}</span>
    </button>
`).join('') : `<p style="text-align:center;color:#667085;">No contacts yet.</p>`}
            </div>

            <button id="btn-back-facility" class="contacts-back-btn">⬅️ BACK</button>

            <div class="contacts-version-tag">facilities-contacts/grid.js | v2026_06_18_view_on_button_contacts | 2026-06-18</div>
        </div>

        <div id="contact-modal-backdrop" class="contact-modal-backdrop">
            <div class="contact-modal">
                <h3 id="contact-modal-title">Add Contact</h3>

                <input id="contact-id-input" type="hidden">

                <label>Contact Name</label>
                <input id="contact-name-input" type="text">

                <label>Role</label>
                <input id="contact-role-input" list="role-options" type="text">

                <datalist id="role-options">
                    <option value="Manager">
                    <option value="Nurse">
                    <option value="Technician">
                    <option value="Admin">
                </datalist>

                <label>Phone</label>
                <input id="contact-phone-input" type="tel" inputmode="numeric">

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

                <button id="btn-delete-contact" class="btn-delete-contact">Delete Contact</button>

                <div id="contact-error" class="contact-error"></div>

                <div class="contacts-version-tag">contact modal | v2026_06_18_view_on_button_contacts | 2026-06-18</div>
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
    const deleteButton = document.getElementById('btn-delete-contact');

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
        deleteButton.style.display = 'none';
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
            deleteButton.style.display = 'block';

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

    document.querySelectorAll('.contact-record-button').forEach(button => {
        button.addEventListener('click', () => {
            const contactId = button.dataset.id;
            const contact = contacts.find(c => String(c.id) === String(contactId));
            if (contact) openModal(contact);
        });
    });

    document.getElementById('btn-cancel-contact').addEventListener('click', () => {
        modalBackdrop.style.display = 'none';
    });

    document.getElementById('btn-back-facility').addEventListener('click', () => {
        if (window.navigateTo) window.navigateTo('facilities-details', context);
    });

    imageInput.addEventListener('change', () => {
        const file = imageInput.files?.[0];
        if (!file) return;

        imagePreview.src = URL.createObjectURL(file);
        imagePreview.style.display = 'block';
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
            const { error } = await updateContactImage(contactId, imageUrlUploaded);

            if (error) throw error;

            errorBox.textContent = '';
            modalBackdrop.style.display = 'none';
            await renderContactsGrid(containerId, context);

        } catch (err) {
            console.error('Contact image update error:', err);
            errorBox.textContent = 'Could not update image.';
        }
    });

    deleteButton.addEventListener('click', async () => {
        const contactId = contactIdInput.value;

        if (!contactId) return;
        if (!confirm('Are you sure you want to delete this contact?')) return;

        const { error } = await deleteContact(contactId);

        if (error) {
            console.error('Delete contact error:', error);
            errorBox.textContent = 'Could not delete contact.';
            return;
        }

        modalBackdrop.style.display = 'none';
        await renderContactsGrid(containerId, context);
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
            const { data, error } = await updateContact(contactId, payload);

            if (error) {
                console.error('Update contact error:', error);
                errorBox.textContent = 'Could not update contact.';
                return;
            }

            savedContact = data;
        } else {
            const { data, error } = await createContact(payload);

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
                const { error: imageError } = await updateContactImage(savedContact.id, imageUrlUploaded);

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
