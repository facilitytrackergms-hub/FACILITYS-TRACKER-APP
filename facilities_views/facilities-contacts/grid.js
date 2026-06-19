/*================================================================
FACILITIES-CONTACTS GRID
VERSION: v2026_06_19_contact_detail_center_project_button
UPDATED: 2026-06-19 @ 6:19 AM EDT
================================================================*/

import {
    fetchContacts,
    createContact,
    updateContact,
    deleteContact,
    updateContactImage,
    fetchContactProjects
} from './data.js';

import {
    createProject
} from '../facilities-projects/data.js';

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

function cleanPhone(value) {
    return String(value || '').replace(/[^\d+]/g, '');
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
            .contacts-list { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }

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

            .contact-detail-card { background:#ffffff; max-width:350px; margin:16px auto; padding:18px; border-radius:14px; box-shadow:0 4px 18px rgba(0,0,0,0.08); text-align:center; display:none; }
            .contact-detail-title { color:#003b73; font-size:24px; font-weight:bold; margin-bottom:2px; text-align:center; }
            .contact-detail-subtitle { color:#003b73; font-size:13px; font-weight:bold; margin-bottom:16px; letter-spacing:2px; text-align:center; }
            .contact-detail-img { width:90px; height:90px; border-radius:50%; object-fit:cover; background:#dbe5ef; margin:0 auto 14px; display:block; }

            .contact-detail-info-box {
                border:1px solid #c3d2e3;
                border-radius:12px;
                padding:14px;
                text-align:center;
                margin-bottom:14px;
                background:#edf3f9;
            }

            .contact-detail-label {
                color:#003b73;
                font-size:11px;
                font-weight:bold;
                margin-top:10px;
                margin-bottom:4px;
                text-align:center;
                letter-spacing:1px;
            }

            .contact-detail-label:first-child {
                margin-top:0;
            }

            .contact-detail-value {
                color:#111827;
                font-size:14px;
                margin:0 auto 10px;
                white-space:pre-wrap;
                text-align:center;
                line-height:1.35;
                max-width:260px;
            }

            .contact-detail-link { color:#00509d; font-size:14px; font-weight:bold; text-decoration:underline; cursor:pointer; background:none; border:none; padding:0; text-align:center; }
            .contact-detail-add-project-btn { background:#22a843; color:white; border:none; border-radius:9px; width:100%; min-height:48px; font-size:14px; font-weight:bold; cursor:pointer; margin:0 0 14px; }
            .contact-detail-button-row { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:12px; }
            .contact-detail-action-btn { background:#003b73; color:white; border:none; border-radius:9px; min-height:48px; font-size:14px; font-weight:bold; cursor:pointer; }
            .contact-detail-delete-btn { background:#dc2626; color:yellow; border:none; border-radius:9px; min-height:48px; font-size:14px; font-weight:bold; cursor:pointer; }
            .contact-project-button { width:100%; border:1px solid #c3d2e3; border-radius:10px; padding:10px; margin-top:8px; background:#ffffff; text-align:center; cursor:pointer; }
            .contact-project-title { color:#003b73; font-size:14px; font-weight:bold; margin-bottom:3px; text-align:center; }
            .contact-project-line { color:#111827; font-size:12px; text-align:center; }

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

            .contact-custom-popup-backdrop { position:fixed; inset:0; background:rgba(0,0,0,0.55); display:none; align-items:center; justify-content:center; z-index:10000; }
            .contact-custom-popup { background:white; width:88%; max-width:330px; border-radius:12px; padding:18px; box-shadow:0 4px 18px rgba(0,0,0,0.28); text-align:center; }
            .contact-custom-popup-title { color:#003b73; font-size:18px; font-weight:bold; margin-bottom:10px; }
            .contact-custom-popup-message { color:#1f2937; font-size:14px; line-height:1.35; margin-bottom:16px; }
            .contact-custom-popup-buttons { display:grid; grid-template-columns:1fr; gap:8px; }
            .contact-custom-popup-buttons button { border:none; border-radius:8px; padding:11px; font-size:14px; font-weight:bold; cursor:pointer; background:#22a843; color:white; }

            .contact-phone-popup-backdrop { position:fixed; inset:0; background:rgba(0,0,0,0.55); display:none; align-items:center; justify-content:center; z-index:10001; }
            .contact-phone-popup { background:white; width:88%; max-width:330px; border-radius:12px; padding:18px; box-shadow:0 4px 18px rgba(0,0,0,0.28); text-align:center; }
            .contact-phone-popup-title { color:#003b73; font-size:18px; font-weight:bold; margin-bottom:10px; }
            .contact-phone-popup-buttons { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:14px; }
            .contact-phone-popup-buttons button { border:none; border-radius:8px; padding:11px; font-size:14px; font-weight:bold; cursor:pointer; }
            .btn-phone-call { background:#003b73; color:white; }
            .btn-phone-text { background:#22a843; color:white; }
            .btn-phone-cancel { background:#777; color:white; grid-column:1 / -1; }
        </style>

        <div id="contacts-list-view" class="contacts-card">
            <div class="contacts-title">${escapeHtml(facilityName)}</div>
            <div class="contacts-subtitle">CONTACTS</div>

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

            <div class="contacts-version-tag">facilities_views/facilities-contacts/grid.js | v2026_06_19_contact_detail_center_project_button | 2026-06-19 @ 6:19 AM EDT</div>
        </div>

        <div id="contact-detail-view" class="contact-detail-card"></div>

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

                <div class="contacts-version-tag">facilities_views/facilities-contacts/grid.js modal | v2026_06_19_contact_detail_center_project_button | 2026-06-19 @ 6:19 AM EDT</div>
            </div>
        </div>

        <div id="contact-saved-popup-backdrop" class="contact-custom-popup-backdrop">
            <div class="contact-custom-popup">
                <div class="contact-custom-popup-title">Contact Saved</div>
                <div class="contact-custom-popup-message">Contact was added. Opening project detail.</div>
                <div class="contact-custom-popup-buttons">
                    <button id="btn-contact-saved-ok">OK</button>
                </div>
            </div>
        </div>

        <div id="contact-phone-popup-backdrop" class="contact-phone-popup-backdrop">
            <div class="contact-phone-popup">
                <div class="contact-phone-popup-title">Phone Options</div>
                <div id="contact-phone-popup-number" class="contact-detail-value"></div>
                <div class="contact-phone-popup-buttons">
                    <button id="btn-contact-call" class="btn-phone-call">CALL</button>
                    <button id="btn-contact-text" class="btn-phone-text">TEXT</button>
                    <button id="btn-contact-phone-cancel" class="btn-phone-cancel">CANCEL</button>
                </div>
            </div>
        </div>
    `;

    const listView = document.getElementById('contacts-list-view');
    const detailView = document.getElementById('contact-detail-view');
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
    const contactSavedPopupBackdrop = document.getElementById('contact-saved-popup-backdrop');
    const phonePopupBackdrop = document.getElementById('contact-phone-popup-backdrop');
    const phonePopupNumber = document.getElementById('contact-phone-popup-number');

    let activePhoneNumber = '';

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

        if (!contact && context?.requested_contact_prefill) {
            nameInput.value = context.requested_contact_prefill.name || '';
            roleInput.value = context.requested_contact_prefill.role || '';
            modalTitle.textContent = 'Add Requested By Contact';
        }

        modalBackdrop.style.display = 'flex';
    }

    async function showContactDetail(contact) {
        const contactProjects = await fetchContactProjects(facilityId, contact.id, contact.name);

        detailView.innerHTML = `
            <div class="contact-detail-title">${escapeHtml(contact.name || 'Contact')}</div>
            <div class="contact-detail-subtitle">${escapeHtml(facilityName)} CONTACT DETAIL</div>

            ${contact.image_url
                ? `<img class="contact-detail-img" src="${escapeHtml(contact.image_url)}" alt="${escapeHtml(contact.name)}">`
                : `<div class="contact-detail-img"></div>`}

          <div class="contact-detail-info-box">

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;">
        <div>
            <div class="contact-detail-label" style="font-size:15px;">CONTACT NAME</div>
            <div class="contact-detail-value" style="font-size:22px;font-weight:bold;">${escapeHtml(contact.name || '')}</div>
        </div>

        <div>
            <div class="contact-detail-label" style="font-size:15px;">ROLE</div>
            <div class="contact-detail-value" style="font-size:22px;font-weight:bold;">${escapeHtml(contact.role || '')}</div>
        </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;">
        <div>
            <div class="contact-detail-label" style="font-size:15px;">PHONE</div>
            <div class="contact-detail-value" style="font-size:18px;font-weight:bold;">
                ${contact.phone ? `<button id="btn-contact-phone-options" class="contact-detail-link">${escapeHtml(contact.phone)}</button>` : ''}
            </div>
        </div>

        <div>
            <div class="contact-detail-label" style="font-size:15px;">EMAIL</div>
            <div class="contact-detail-value" style="font-size:18px;font-weight:bold;">
                ${contact.email ? `<a class="contact-detail-link" href="mailto:${escapeHtml(contact.email)}">${escapeHtml(contact.email)}</a>` : ''}
            </div>
        </div>
    </div>

    <div class="contact-detail-label" style="font-size:15px;">ADDRESS</div>
    <div class="contact-detail-value" style="font-size:18px;">
        ${escapeHtml(contact.address || '')}
    </div>

    <div class="contact-detail-label" style="font-size:15px;">NOTES</div>
    <div class="contact-detail-value" style="font-size:18px;">
        ${escapeHtml(contact.notes || '')}
    </div>

</div>

            <button id="btn-add-project-from-contact" class="contact-detail-add-project-btn">➕ ADD PROJECT</button>

            <div class="contact-detail-info-box">
                <div class="contact-detail-label">PROJECTS ATTACHED TO THIS CONTACT</div>

                ${contactProjects.length ? contactProjects.map(project => `
                    <button type="button" class="contact-project-button" data-project-id="${project.id}">
                        <div class="contact-project-title">${escapeHtml(project.project_name || project.name || 'Project')}</div>
                        <div class="contact-project-line">${escapeHtml(project.type || '')}</div>
                    </button>
                `).join('') : `
                    <div class="contact-detail-value">No projects attached to this contact.</div>
                `}
            </div>

            <button id="btn-contact-detail-back" class="contacts-back-btn">⬅️ BACK TO CONTACTS</button>

            <div class="contact-detail-button-row">
                <button id="btn-contact-detail-edit" class="contact-detail-action-btn">⚙️ Edit</button>
                <button id="btn-contact-detail-delete" class="contact-detail-delete-btn">🗑 Delete</button>
            </div>

            <div class="contacts-version-tag">facilities_views/facilities-contacts/grid.js | v2026_06_19_contact_detail_center_project_button | 2026-06-19 @ 6:19 AM EDT</div>
        `;

        listView.style.display = 'none';
        detailView.style.display = 'block';

        const phoneButton = document.getElementById('btn-contact-phone-options');

        if (phoneButton) {
            phoneButton.addEventListener('click', () => {
                activePhoneNumber = cleanPhone(contact.phone);
                phonePopupNumber.textContent = contact.phone || '';
                phonePopupBackdrop.style.display = 'flex';
            });
        }

        document.getElementById('btn-add-project-from-contact').addEventListener('click', () => {
            if (window.navigateTo) {
                window.navigateTo('facilities-projects', {
                    ...context,
                    open_add_project_modal: true,
                    requested_by_name: contact.name || '',
                    requested_by_title: contact.role || '',
                    requested_by_contact_id: contact.id || null,
                    project_prefill: {
                        requested_by_name: contact.name || '',
                        requested_by_title: contact.role || '',
                        requested_by_contact_id: contact.id || null
                    }
                });
            }
        });

        document.querySelectorAll('.contact-project-button').forEach(button => {
            button.addEventListener('click', () => {
                if (window.navigateTo) {
                    window.navigateTo('facility-project-detail', {
                        ...context,
                        project_id: button.dataset.projectId
                    });
                }
            });
        });

        document.getElementById('btn-contact-detail-back').addEventListener('click', () => {
            detailView.style.display = 'none';
            listView.style.display = 'block';
        });

        document.getElementById('btn-contact-detail-edit').addEventListener('click', () => {
            openModal(contact);
        });

        document.getElementById('btn-contact-detail-delete').addEventListener('click', async () => {
            if (!confirm('Are you sure you want to delete this contact?')) return;

            const { error } = await deleteContact(contact.id);

            if (error) {
                console.error('Delete contact error:', error);
                alert('Could not delete contact.');
                return;
            }

            await renderContactsGrid(containerId, context);
        });
    }

    document.getElementById('btn-add-contact').addEventListener('click', () => {
        openModal();
    });

    if (context?.requested_contact_prefill) {
        openModal();
    }

    document.querySelectorAll('.contact-record-button').forEach(button => {
        button.addEventListener('click', () => {
            const contactId = button.dataset.id;
            const contact = contacts.find(c => String(c.id) === String(contactId));
            if (contact) showContactDetail(contact);
        });
    });

    if (context?.open_contact_id) {
        const contact = contacts.find(c => String(c.id) === String(context.open_contact_id));
        if (contact) showContactDetail(contact);
    }

    document.getElementById('btn-cancel-contact').addEventListener('click', () => {
        modalBackdrop.style.display = 'none';
    });

    document.getElementById('btn-back-facility').addEventListener('click', () => {
        if (window.navigateTo) window.navigateTo('facilities-details', context);
    });

    document.getElementById('btn-contact-saved-ok').addEventListener('click', () => {
        contactSavedPopupBackdrop.style.display = 'none';
    });

    document.getElementById('btn-contact-call').addEventListener('click', () => {
        if (activePhoneNumber) window.location.href = `tel:${activePhoneNumber}`;
    });

    document.getElementById('btn-contact-text').addEventListener('click', () => {
        if (activePhoneNumber) window.location.href = `sms:${activePhoneNumber}`;
    });

    document.getElementById('btn-contact-phone-cancel').addEventListener('click', () => {
        phonePopupBackdrop.style.display = 'none';
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
            await renderContactsGrid(containerId, { ...context, open_contact_id: contactId });

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

        if (context?.return_to_project_detail_after_contact && context?.project_draft_prefill && savedContact?.id) {
            const projectPayload = {
                ...context.project_draft_prefill,
                requested_by_name: contactName,
                requested_by_title: contactRole,
                requested_by_contact_id: savedContact.id
            };

            const { data: newProject, error: projectError } = await createProject(projectPayload);

            if (projectError) {
                console.error('Create project after contact error:', projectError);
                errorBox.textContent = 'Contact saved, but project failed.';
                return;
            }

            modalBackdrop.style.display = 'none';

            if (newProject?.id && window.navigateTo) {
                window.navigateTo('facility-project-detail', {
                    ...context,
                    requested_contact_prefill: null,
                    project_draft_prefill: null,
                    return_to_project_detail_after_contact: false,
                    project_id: newProject.id
                });
                return;
            }
        }

        modalBackdrop.style.display = 'none';

        if (savedContact?.id) {
            await renderContactsGrid(containerId, {
                ...context,
                requested_contact_prefill: null,
                open_contact_id: savedContact.id
            });
            return;
        }

        await renderContactsGrid(containerId, context);
    });
}
