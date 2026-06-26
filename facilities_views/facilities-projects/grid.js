/*================================================================
FACILITIES-PROJECTS GRID
VERSION: v2026_06_26_add_project_location_fields_fixed
UPDATED: 2026-06-26
================================================================*/

import {
    fetchProjects,
    fetchFacilityContacts,
    createProject,
    updateProject,
    deleteProject
} from './data.js';

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

function formatProjectDate(value) {
    if (!value) return 'No date';
    return new Date(value).toLocaleDateString();
}

function getProjectStatus(project) {
    return project.status || project.active_status || 'No status';
}

function getContactTitle(contact) {
    return contact?.role || contact?.title || '';
}

function getContactPhone(contact) {
    return contact?.phone || contact?.phone_number || '';
}

export async function renderProjectsGrid(containerId, context = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const facilityId = getFacilityId(context);
    const facilityName = getFacilityName(context);

    if (!facilityId) {
        container.innerHTML = `<p style="color:red;text-align:center;">Missing facility ID.</p>`;
        return;
    }

    const projects = await fetchProjects(facilityId);
    const contacts = await fetchFacilityContacts(facilityId);

    container.innerHTML = `
        <style>
            .projects-card { background:#ffffff; max-width:350px; margin:16px auto; padding:18px; border-radius:14px; box-shadow:0 4px 18px rgba(0,0,0,0.08); text-align:center; }
            .projects-title { color:#003b73; font-size:24px; font-weight:bold; margin-bottom:2px; overflow-wrap:anywhere; }
            .projects-subtitle { color:#003b73; font-size:13px; font-weight:bold; margin-bottom:16px; letter-spacing:2px; }
            .projects-add-btn { background:#22a843; color:white; border:none; border-radius:9px; width:100%; padding:13px; font-weight:bold; font-size:15px; cursor:pointer; margin-bottom:16px; }
            .projects-list { display:grid; grid-template-columns:repeat(2, 1fr); gap:8px; }
            .project-record-button { min-height:86px; background:#003b73; color:white; border:none; border-radius:10px; padding:8px; cursor:pointer; text-align:center; }
            .project-record-button:hover { background:#00509d; }
            .project-record-title { font-weight:bold; font-size:13px; margin-bottom:5px; overflow-wrap:anywhere; }
            .project-record-meta { font-size:11px; font-weight:normal; opacity:0.95; line-height:1.3; }
            .projects-back-btn { background:#747d8c; color:white; border:none; border-radius:9px; width:100%; min-height:48px; font-size:15px; font-weight:bold; cursor:pointer; margin-top:16px; }
            .projects-version-tag { border-top:1px solid #d6dee8; margin-top:18px; padding-top:10px; font-size:10px; color:#7d8ba0; text-align:center; }

            .project-modal-backdrop { position:fixed; inset:0; background:rgba(0,0,0,0.45); display:none; align-items:center; justify-content:center; z-index:9999; }
            .project-modal { background:white; width:90%; max-width:360px; border-radius:12px; padding:18px; box-shadow:0 4px 18px rgba(0,0,0,0.25); text-align:left; max-height:90vh; overflow-y:auto; }
            .project-modal h3 { margin:0 0 14px; text-align:center; color:#003b73; }

            .project-modal-section { border:1px solid #d6dee8; border-radius:10px; padding:12px; margin-top:12px; background:#f8fbff; }
            .project-modal-section-title { color:#003b73; text-align:center; font-size:13px; font-weight:bold; letter-spacing:1px; margin-bottom:10px; }

            .project-modal label { display:block; font-size:13px; font-weight:bold; margin:10px 0 4px; color:#003b73; }
            .project-modal input, .project-modal textarea, .project-modal select { width:100%; padding:9px; border:1px solid #bbb; border-radius:6px; font-size:15px; box-sizing:border-box; }
            .project-modal textarea { min-height:80px; resize:vertical; }

            .project-modal-buttons { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:16px; }
            .project-modal-buttons button { padding:11px; border:none; border-radius:7px; font-weight:bold; cursor:pointer; }
            .btn-save-project { background:#22a843; color:white; }
            .btn-cancel-project { background:#777; color:white; }
            .btn-delete-project { background:#dc2626; color:yellow; display:none; width:100%; margin-top:10px; padding:11px; border:none; border-radius:7px; font-weight:bold; cursor:pointer; }
            .project-error { color:red; font-size:13px; text-align:center; margin-top:10px; min-height:16px; }
        </style>

        <div class="projects-card">
            <div class="projects-title">${escapeHtml(facilityName)}</div>
            <div class="projects-subtitle">PROJECTS</div>

            <button id="btn-add-project" class="projects-add-btn">ADD PROJECT</button>

            <div class="projects-list">
                ${projects.length ? projects.map(project => `
                    <button type="button" class="project-record-button" data-id="${project.id}">
                        <div class="project-record-title">${escapeHtml(project.project_name || project.name || 'Project')}</div>
                        <div class="project-record-meta">${escapeHtml(formatProjectDate(project.created_at))}</div>
                        <div class="project-record-meta">${escapeHtml(getProjectStatus(project))}</div>
                    </button>
                `).join('') : `<p style="text-align:center;color:#667085;grid-column:1 / -1;">No projects yet.</p>`}
            </div>

            <button id="btn-back-facility" class="projects-back-btn">⬅️ BACK</button>

            <div class="projects-version-tag">grid.js | v2026_06_26_add_project_location_fields_fixed | 2026-06-26</div>
        </div>

        <div id="project-modal-backdrop" class="project-modal-backdrop">
            <div class="project-modal">
                <h3 id="project-modal-title">Add Project for ${escapeHtml(facilityName)}</h3>

                <input id="project-id-input" type="hidden">

                <label>Project Name</label>
                <input id="project-name-input" type="text">

                <label>Type</label>
                <input id="project-type-input" type="text" list="project-type-options">

                <datalist id="project-type-options">
                    <option value="Repair"></option>
                    <option value="Renovation"></option>
                    <option value="Maintenance"></option>
                    <option value="Inspection"></option>
                    <option value="Replacement"></option>
                    <option value="Other"></option>
                </datalist>

                <div class="project-modal-section">
                    <div class="project-modal-section-title">PROJECT REQUEST INFORMATION</div>

                    <label>Requested By Name</label>
                    <select id="requested-by-name-input">
                        <option value="">Select Contact</option>
                        ${contacts.length ? contacts.map(contact => `
                            <option value="${escapeHtml(contact.id)}">${escapeHtml(contact.name || 'Unnamed Contact')}</option>
                        `).join('') : `
                            <option value="" disabled>No contacts found</option>
                        `}
                    </select>

                    <label>Requested By Title</label>
                    <input id="requested-by-title-input" type="text">

                    <label>Requested By Phone</label>
                    <input id="project-phone-number-input" type="tel">
                </div>

                <div class="project-modal-section">
                    <div class="project-modal-section-title">ACTUAL PROJECT LOCATION / CONTACT</div>

                    <label>Project Location Name</label>
                    <input id="project-location-name-input" type="text" placeholder="Example: Cottage">

                    <label>Project Address</label>
                    <input id="project-address-input" type="text" placeholder="Example: 123 Main St, Bartow FL 33830">

                    <label>Project Contact / Tenant Name</label>
                    <input id="project-contact-name-input" type="text">

                    <label>Project Contact / Tenant Phone</label>
                    <input id="project-contact-phone-input" type="tel">

                    <label>Property Manager Name</label>
                    <input id="property-manager-name-input" type="text">

                    <label>Property Manager Phone</label>
                    <input id="property-manager-phone-input" type="tel">
                </div>

                <label>Appointment Time</label>
                <input id="project-appointment-time-input" type="datetime-local">

                <label>Reminder</label>
                <input id="project-reminder-input" type="text">

                <label>Description</label>
                <textarea id="project-description-input"></textarea>

                <label>Notes</label>
                <textarea id="project-notes-input"></textarea>

                <div class="project-modal-buttons">
                    <button id="btn-save-project" class="btn-save-project">Save</button>
                    <button id="btn-cancel-project" class="btn-cancel-project">Cancel</button>
                </div>

                <button id="btn-delete-project" class="btn-delete-project">Delete Project</button>

                <div id="project-error" class="project-error"></div>

                <div class="projects-version-tag">grid.js | v2026_06_26_add_project_location_fields_fixed | 2026-06-26</div>
            </div>
        </div>
    `;

    const modalBackdrop = document.getElementById('project-modal-backdrop');
    const modalTitle = document.getElementById('project-modal-title');
    const projectIdInput = document.getElementById('project-id-input');
    const projectNameInput = document.getElementById('project-name-input');
    const typeInput = document.getElementById('project-type-input');
    const requestedByNameInput = document.getElementById('requested-by-name-input');
    const requestedByTitleInput = document.getElementById('requested-by-title-input');
    const phoneNumberInput = document.getElementById('project-phone-number-input');
    const projectLocationNameInput = document.getElementById('project-location-name-input');
    const addressInput = document.getElementById('project-address-input');
    const projectContactNameInput = document.getElementById('project-contact-name-input');
    const projectContactPhoneInput = document.getElementById('project-contact-phone-input');
    const propertyManagerNameInput = document.getElementById('property-manager-name-input');
    const propertyManagerPhoneInput = document.getElementById('property-manager-phone-input');
    const appointmentTimeInput = document.getElementById('project-appointment-time-input');
    const reminderInput = document.getElementById('project-reminder-input');
    const descriptionInput = document.getElementById('project-description-input');
    const notesInput = document.getElementById('project-notes-input');
    const errorBox = document.getElementById('project-error');
    const deleteButton = document.getElementById('btn-delete-project');

    function getSelectedRequestedByContact() {
        const selectedContactId = requestedByNameInput.value;
        if (!selectedContactId) return null;
        return contacts.find(contact => String(contact.id) === String(selectedContactId)) || null;
    }

    function populateRequestedByContactFields(contact) {
        if (!contact) {
            requestedByTitleInput.value = '';
            phoneNumberInput.value = '';
            return;
        }

        requestedByTitleInput.value = getContactTitle(contact);
        phoneNumberInput.value = getContactPhone(contact);
    }

    function selectRequestedByContactById(contactId) {
        if (!contactId) return false;

        const contact = contacts.find(item => String(item.id) === String(contactId));
        if (!contact) return false;

        requestedByNameInput.value = contact.id;
        populateRequestedByContactFields(contact);
        return true;
    }

    function selectRequestedByContactByName(contactName) {
        const cleanName = String(contactName || '').trim().toLowerCase();
        if (!cleanName) return false;

        const contact = contacts.find(item => String(item.name || '').trim().toLowerCase() === cleanName);
        if (!contact) return false;

        requestedByNameInput.value = contact.id;
        populateRequestedByContactFields(contact);
        return true;
    }

    function clearModal() {
        projectIdInput.value = '';
        projectNameInput.value = '';
        typeInput.value = '';
        requestedByNameInput.value = '';
        requestedByTitleInput.value = '';
        phoneNumberInput.value = '';
        projectLocationNameInput.value = '';
        addressInput.value = '';
        projectContactNameInput.value = '';
        projectContactPhoneInput.value = '';
        propertyManagerNameInput.value = '';
        propertyManagerPhoneInput.value = '';
        appointmentTimeInput.value = '';
        reminderInput.value = '';
        descriptionInput.value = '';
        notesInput.value = '';
        errorBox.textContent = '';
        modalTitle.textContent = `Add Project for ${facilityName}`;
        deleteButton.style.display = 'none';
    }

    function openModal(project = null) {
        clearModal();

        if (project) {
            projectIdInput.value = project.id || '';
            projectNameInput.value = project.project_name || project.name || '';
            typeInput.value = project.type || '';
            requestedByTitleInput.value = project.requested_by_title || '';
            phoneNumberInput.value = project.phone_number || '';
            projectLocationNameInput.value = project.project_location_name || '';
            addressInput.value = project.address || '';
            projectContactNameInput.value = project.project_contact_name || '';
            projectContactPhoneInput.value = project.project_contact_phone || '';
            propertyManagerNameInput.value = project.property_manager_name || '';
            propertyManagerPhoneInput.value = project.property_manager_phone || '';
            appointmentTimeInput.value = project.appointment_time ? String(project.appointment_time).slice(0, 16) : '';
            reminderInput.value = project.reminder || '';
            descriptionInput.value = project.description || '';
            notesInput.value = project.notes || '';
            modalTitle.textContent = `Edit Project for ${facilityName}`;
            deleteButton.style.display = 'block';

            if (project.requested_by_contact_id) {
                selectRequestedByContactById(project.requested_by_contact_id);
            } else if (project.requested_by_name) {
                selectRequestedByContactByName(project.requested_by_name);
            }
        }

        if (context?.project_draft_prefill) {
            projectNameInput.value = context.project_draft_prefill.project_name || context.project_draft_prefill.name || '';
            typeInput.value = context.project_draft_prefill.type || '';
            requestedByTitleInput.value = context.project_draft_prefill.requested_by_title || '';
            phoneNumberInput.value = context.project_draft_prefill.phone_number || '';
            projectLocationNameInput.value = context.project_draft_prefill.project_location_name || '';
            addressInput.value = context.project_draft_prefill.address || '';
            projectContactNameInput.value = context.project_draft_prefill.project_contact_name || '';
            projectContactPhoneInput.value = context.project_draft_prefill.project_contact_phone || '';
            propertyManagerNameInput.value = context.project_draft_prefill.property_manager_name || '';
            propertyManagerPhoneInput.value = context.project_draft_prefill.property_manager_phone || '';
            appointmentTimeInput.value = context.project_draft_prefill.appointment_time ? String(context.project_draft_prefill.appointment_time).slice(0, 16) : '';
            reminderInput.value = context.project_draft_prefill.reminder || '';
            descriptionInput.value = context.project_draft_prefill.description || '';
            notesInput.value = context.project_draft_prefill.notes || '';

            if (context.project_draft_prefill.requested_by_contact_id) {
                selectRequestedByContactById(context.project_draft_prefill.requested_by_contact_id);
            } else {
                selectRequestedByContactByName(context.project_draft_prefill.requested_by_name);
            }
        }

        if (context?.project_prefill) {
            projectNameInput.value = context.project_prefill.project_name || context.project_prefill.name || projectNameInput.value;
            typeInput.value = context.project_prefill.type || typeInput.value;
            requestedByTitleInput.value = context.project_prefill.requested_by_title || requestedByTitleInput.value;
            phoneNumberInput.value = context.project_prefill.phone_number || phoneNumberInput.value;
            projectLocationNameInput.value = context.project_prefill.project_location_name || projectLocationNameInput.value;
            addressInput.value = context.project_prefill.address || addressInput.value;
            projectContactNameInput.value = context.project_prefill.project_contact_name || projectContactNameInput.value;
            projectContactPhoneInput.value = context.project_prefill.project_contact_phone || projectContactPhoneInput.value;
            propertyManagerNameInput.value = context.project_prefill.property_manager_name || propertyManagerNameInput.value;
            propertyManagerPhoneInput.value = context.project_prefill.property_manager_phone || propertyManagerPhoneInput.value;
            appointmentTimeInput.value = context.project_prefill.appointment_time ? String(context.project_prefill.appointment_time).slice(0, 16) : appointmentTimeInput.value;
            reminderInput.value = context.project_prefill.reminder || reminderInput.value;
            descriptionInput.value = context.project_prefill.description || descriptionInput.value;
            notesInput.value = context.project_prefill.notes || notesInput.value;

            if (context.project_prefill.requested_by_contact_id) {
                selectRequestedByContactById(context.project_prefill.requested_by_contact_id);
            } else {
                selectRequestedByContactByName(context.project_prefill.requested_by_name);
            }
        }

        if (context?.requested_by_contact_id) {
            selectRequestedByContactById(context.requested_by_contact_id);
        } else if (context?.requested_by_name) {
            selectRequestedByContactByName(context.requested_by_name);
        }

        if (context?.requested_by_title) {
            requestedByTitleInput.value = context.requested_by_title || requestedByTitleInput.value;
        }

        if (context?.phone_number) {
            phoneNumberInput.value = context.phone_number || phoneNumberInput.value;
        }

        modalBackdrop.style.display = 'flex';
    }

    function getProjectDraft() {
        const selectedContact = getSelectedRequestedByContact();

        return {
            facilities_id: facilityId,
            location_id: facilityId,
            name: projectNameInput.value.trim(),
            project_name: projectNameInput.value.trim(),
            type: typeInput.value.trim(),
            requested_by_name: selectedContact?.name || '',
            requested_by_title: requestedByTitleInput.value.trim(),
            requested_by_contact_id: selectedContact?.id || null,
            phone_number: phoneNumberInput.value.trim(),
            project_location_name: projectLocationNameInput.value.trim(),
            address: addressInput.value.trim(),
            project_contact_name: projectContactNameInput.value.trim(),
            project_contact_phone: projectContactPhoneInput.value.trim(),
            property_manager_name: propertyManagerNameInput.value.trim(),
            property_manager_phone: propertyManagerPhoneInput.value.trim(),
            appointment_time: appointmentTimeInput.value || null,
            reminder: reminderInput.value.trim(),
            description: descriptionInput.value.trim(),
            notes: notesInput.value.trim()
        };
    }

    requestedByNameInput.addEventListener('change', () => {
        populateRequestedByContactFields(getSelectedRequestedByContact());
    });

    document.getElementById('btn-add-project').addEventListener('click', () => {
        openModal();
    });

    if (context?.project_draft_prefill || context?.project_prefill || context?.open_add_project_modal) {
        openModal();
    }

    document.querySelectorAll('.project-record-button').forEach(button => {
        button.addEventListener('click', () => {
            const projectId = button.dataset.id;
            const project = projects.find(p => String(p.id) === String(projectId));

            if (project && window.navigateTo) {
                window.navigateTo('facility-project-detail', {
                    ...context,
                    project_id: project.id
                });
            }
        });
    });

    document.getElementById('btn-cancel-project').addEventListener('click', () => {
        modalBackdrop.style.display = 'none';
    });

    document.getElementById('btn-back-facility').addEventListener('click', () => {
        if (window.navigateTo) window.navigateTo('facilities-home');
    });

    deleteButton.addEventListener('click', async () => {
        const projectId = projectIdInput.value;

        if (!projectId) return;
        if (!confirm('Are you sure you want to delete this project?')) return;

        const { error } = await deleteProject(projectId);

        if (error) {
            console.error('Delete project error:', error);
            errorBox.textContent = 'Could not delete project.';
            return;
        }

        modalBackdrop.style.display = 'none';
        await renderProjectsGrid(containerId, context);
    });

    document.getElementById('btn-save-project').addEventListener('click', async () => {
        const projectId = projectIdInput.value;
        const projectName = projectNameInput.value.trim();
        const selectedContact = getSelectedRequestedByContact();
        const requestedByName = selectedContact?.name || '';
        const requestedByTitle = requestedByTitleInput.value.trim();
        const requestedByContactId = selectedContact?.id || null;

        if (!projectName) {
            errorBox.textContent = 'Project name required.';
            return;
        }

        const payload = {
            facilities_id: facilityId,
            location_id: facilityId,
            name: projectName,
            project_name: projectName,
            type: typeInput.value.trim(),
            requested_by_name: requestedByName,
            requested_by_title: requestedByTitle,
            requested_by_contact_id: requestedByContactId,
            phone_number: phoneNumberInput.value.trim(),
            project_location_name: projectLocationNameInput.value.trim(),
            address: addressInput.value.trim(),
            project_contact_name: projectContactNameInput.value.trim(),
            project_contact_phone: projectContactPhoneInput.value.trim(),
            property_manager_name: propertyManagerNameInput.value.trim(),
            property_manager_phone: propertyManagerPhoneInput.value.trim(),
            appointment_time: appointmentTimeInput.value || null,
            reminder: reminderInput.value.trim(),
            description: descriptionInput.value.trim(),
            notes: notesInput.value.trim()
        };

        if (projectId) {
            const { error } = await updateProject(projectId, payload);

            if (error) {
                console.error('Update project error:', error);
                errorBox.textContent = 'Could not update project.';
                return;
            }
        } else {
            const { data, error } = await createProject(payload);

            if (error) {
                console.error('Insert project error:', error);
                errorBox.textContent = 'Could not save project.';
                return;
            }

            if (data?.id && window.navigateTo) {
                window.navigateTo('facility-project-detail', {
                    ...context,
                    project_id: data.id
                });
                return;
            }
        }

        modalBackdrop.style.display = 'none';
        await renderProjectsGrid(containerId, context);
    });
}
