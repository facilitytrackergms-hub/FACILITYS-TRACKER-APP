/*================================================================
FACILITIES-PROJECTS GRID
VERSION: v2026_06_26_project_card_by_card_contacts
UPDATED: 2026-06-26
================================================================*/

import {
    fetchProjects,
    fetchFacilityContacts,
    fetchProjectScopeItems,
    createProjectWithScopeItems,
    updateProjectWithScopeItems,
    deleteProject,
    createOrUpdateFacilityContact
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

function normalizeName(value) {
    return String(value || '').trim().toLowerCase();
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
            .project-modal h3 { margin:0 0 6px; text-align:center; color:#003b73; }
            .project-step-label { text-align:center; font-size:12px; color:#667085; font-weight:bold; margin-bottom:12px; }

            .project-wizard-card { display:none; border:1px solid #d6dee8; border-radius:10px; padding:12px; margin-top:12px; background:#f8fbff; }
            .project-wizard-card.active { display:block; }
            .project-modal-section-title { color:#003b73; text-align:center; font-size:13px; font-weight:bold; letter-spacing:1px; margin-bottom:10px; }

            .project-modal label { display:block; font-size:13px; font-weight:bold; margin:10px 0 4px; color:#003b73; }
            .project-modal input, .project-modal textarea, .project-modal select { width:100%; padding:9px; border:1px solid #bbb; border-radius:6px; font-size:15px; box-sizing:border-box; }
            .project-modal textarea { min-height:70px; resize:vertical; }

            .project-site-type-grid { display:grid; grid-template-columns:1fr 1fr; gap:7px; margin-top:6px; }
            .project-site-type-btn { background:#ffffff; color:#003b73; border:1px solid #003b73; border-radius:8px; padding:9px 6px; font-size:11px; font-weight:bold; cursor:pointer; min-height:38px; }
            .project-site-type-btn.selected { background:#003b73; color:white; }

            .project-scope-card-title { color:#003b73; font-size:12px; font-weight:bold; text-align:center; margin-bottom:8px; }
            .project-area-count { text-align:center; color:#667085; font-size:12px; font-weight:bold; margin-bottom:8px; }

            .project-modal-buttons { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:16px; }
            .project-modal-buttons button { padding:11px; border:none; border-radius:7px; font-weight:bold; cursor:pointer; }
            .project-modal-buttons-three { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:10px; }
            .project-modal-buttons-three button { padding:10px; border:none; border-radius:7px; font-size:12px; font-weight:bold; cursor:pointer; }

            .btn-save-project { background:#22a843; color:white; }
            .btn-next-project { background:#003b73; color:white; }
            .btn-back-project { background:#747d8c; color:white; }
            .btn-cancel-project { background:#777; color:white; }
            .btn-delete-project { background:#dc2626; color:yellow; display:none; width:100%; margin-top:10px; padding:11px; border:none; border-radius:7px; font-weight:bold; cursor:pointer; }
            .project-error { color:red; font-size:13px; text-align:center; margin-top:10px; min-height:16px; }

            .project-custom-popup-backdrop { position:fixed; inset:0; background:rgba(0,0,0,0.55); display:none; align-items:center; justify-content:center; z-index:10000; }
            .project-custom-popup { background:white; width:88%; max-width:330px; border-radius:12px; padding:18px; box-shadow:0 4px 18px rgba(0,0,0,0.28); text-align:center; }
            .project-custom-popup-title { color:#003b73; font-size:18px; font-weight:bold; margin-bottom:10px; }
            .project-custom-popup-message { color:#1f2937; font-size:14px; line-height:1.35; margin-bottom:16px; }
            .project-custom-popup-buttons { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
            .project-custom-popup-buttons button { border:none; border-radius:8px; padding:11px; font-size:14px; font-weight:bold; cursor:pointer; }
            .btn-popup-yes { background:#22a843; color:white; }
            .btn-popup-no { background:#777; color:white; }
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

            <div class="projects-version-tag">grid.js | v2026_06_26_project_card_by_card_contacts | 2026-06-26</div>
        </div>

        <div id="project-modal-backdrop" class="project-modal-backdrop">
            <div class="project-modal">
                <h3 id="project-modal-title">Add Project</h3>
                <div id="project-step-label" class="project-step-label">STEP 1 OF 5</div>

                <input id="project-id-input" type="hidden">
                <input id="project-site-type-input" type="hidden">

                <datalist id="project-contact-options">
                    ${contacts.length ? contacts.map(contact => `
                        <option value="${escapeHtml(contact.name || '')}"></option>
                    `).join('') : ''}
                </datalist>

                <div id="wizard-card-basic" class="project-wizard-card active">
                    <div class="project-modal-section-title">BASIC PROJECT</div>

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

                    <label>Description</label>
                    <textarea id="project-description-input"></textarea>

                    <div class="project-modal-buttons">
                        <button id="btn-cancel-basic" type="button" class="btn-cancel-project">Cancel</button>
                        <button id="btn-basic-next" type="button" class="btn-next-project">Next</button>
                    </div>
                </div>

                <div id="wizard-card-request" class="project-wizard-card">
                    <div class="project-modal-section-title">REQUESTED BY CONTACT</div>

                    <label>Requested By Name</label>
                    <input id="requested-by-name-input" type="text" list="project-contact-options">

                    <label>Requested By Title / Role</label>
                    <input id="requested-by-title-input" type="text">

                    <label>Requested By Phone</label>
                    <input id="project-phone-number-input" type="tel">

                    <div class="project-modal-buttons">
                        <button id="btn-request-back" type="button" class="btn-back-project">Back</button>
                        <button id="btn-request-next" type="button" class="btn-next-project">Next</button>
                    </div>
                </div>

                <div id="wizard-card-location" class="project-wizard-card">
                    <div class="project-modal-section-title">PROPERTY / PROJECT LOCATION</div>

                    <label>Property Type</label>
                    <div class="project-site-type-grid">
                        <button type="button" class="project-site-type-btn" data-value="Facility Room">Facility Room</button>
                        <button type="button" class="project-site-type-btn" data-value="Common Area">Common Area</button>
                        <button type="button" class="project-site-type-btn" data-value="Single House">Single House</button>
                        <button type="button" class="project-site-type-btn" data-value="Apartment / Community">Apartment / Community</button>
                        <button type="button" class="project-site-type-btn" data-value="Street Address Only">Street Address Only</button>
                        <button type="button" class="project-site-type-btn" data-value="Other">Other</button>
                    </div>

                    <label>Project Location / Area Name</label>
                    <input id="project-location-name-input" type="text" placeholder="Room 203, Dining Room, The Cottage, 741 Main St">

                    <label>Project Address</label>
                    <input id="project-address-input" type="text" placeholder="123 Main St, Bartow FL 33830">

                    <div class="project-modal-buttons">
                        <button id="btn-location-back" type="button" class="btn-back-project">Back</button>
                        <button id="btn-location-next" type="button" class="btn-next-project">Next</button>
                    </div>
                </div>

                <div id="wizard-card-contacts" class="project-wizard-card">
                    <div class="project-modal-section-title">PROJECT CONTACTS</div>

                    <label>On-Site Contact Name</label>
                    <input id="project-contact-name-input" type="text" list="project-contact-options">

                    <label>On-Site Contact Phone</label>
                    <input id="project-contact-phone-input" type="tel">

                    <label>Property / Facility Contact Name</label>
                    <input id="property-manager-name-input" type="text" list="project-contact-options">

                    <label>Property / Facility Contact Phone</label>
                    <input id="property-manager-phone-input" type="tel">

                    <div class="project-modal-buttons">
                        <button id="btn-contacts-back" type="button" class="btn-back-project">Back</button>
                        <button id="btn-contacts-next" type="button" class="btn-next-project">Next</button>
                    </div>
                </div>

                <div id="wizard-card-scope" class="project-wizard-card">
                    <div class="project-modal-section-title">PROJECT SCOPE / AREA ITEM</div>
                    <div id="project-area-count" class="project-area-count">AREA / ITEM 1 OF 1</div>

                    <label>Location / Room / Apartment Number</label>
                    <input id="scope-location-number-input" type="text" placeholder="Room 203, Apt 12B, Unit 4">

                    <label>Resident / Area Contact Name</label>
                    <input id="scope-resident-name-input" type="text" list="project-contact-options" placeholder="Resident name or area contact">

                    <label>Resident / Area Contact Phone</label>
                    <input id="scope-resident-phone-input" type="tel" placeholder="Phone number">

                    <label>Area / Section</label>
                    <input id="scope-area-name-input" type="text" placeholder="Master Room, Bathroom, Dining Room">

                    <label>Item / Component</label>
                    <input id="scope-item-name-input" type="text" placeholder="Window, Ceiling, Sink, Floor, Door">

                    <label>Work Needed</label>
                    <input id="scope-work-needed-input" type="text" placeholder="Repair, Replace, Paint, Install, Inspect">

                    <label>Notes</label>
                    <textarea id="scope-notes-input"></textarea>

                    <div class="project-modal-buttons-three">
                        <button id="btn-scope-prev" type="button" class="btn-back-project">Prev Area</button>
                        <button id="btn-scope-save-add" type="button" class="btn-next-project">Add Another</button>
                    </div>

                    <div class="project-modal-buttons">
                        <button id="btn-scope-back" type="button" class="btn-back-project">Back</button>
                        <button id="btn-finish-project" type="button" class="btn-save-project">Finish Project</button>
                    </div>
                </div>

                <button id="btn-delete-project" class="btn-delete-project">Delete Project</button>

                <div id="project-error" class="project-error"></div>

                <div class="projects-version-tag">grid.js | v2026_06_26_project_card_by_card_contacts | 2026-06-26</div>
            </div>
        </div>

        <div id="project-custom-popup-backdrop" class="project-custom-popup-backdrop">
            <div class="project-custom-popup">
                <div id="project-custom-popup-title" class="project-custom-popup-title">Confirm</div>
                <div id="project-custom-popup-message" class="project-custom-popup-message"></div>
                <div class="project-custom-popup-buttons">
                    <button id="btn-project-popup-yes" class="btn-popup-yes">YES</button>
                    <button id="btn-project-popup-no" class="btn-popup-no">NO</button>
                </div>
            </div>
        </div>
    `;

    const modalBackdrop = document.getElementById('project-modal-backdrop');
    const modalTitle = document.getElementById('project-modal-title');
    const stepLabel = document.getElementById('project-step-label');

    const projectIdInput = document.getElementById('project-id-input');
    const projectNameInput = document.getElementById('project-name-input');
    const typeInput = document.getElementById('project-type-input');
    const projectSiteTypeInput = document.getElementById('project-site-type-input');
    const requestedByNameInput = document.getElementById('requested-by-name-input');
    const requestedByTitleInput = document.getElementById('requested-by-title-input');
    const phoneNumberInput = document.getElementById('project-phone-number-input');
    const projectLocationNameInput = document.getElementById('project-location-name-input');
    const addressInput = document.getElementById('project-address-input');
    const projectContactNameInput = document.getElementById('project-contact-name-input');
    const projectContactPhoneInput = document.getElementById('project-contact-phone-input');
    const propertyManagerNameInput = document.getElementById('property-manager-name-input');
    const propertyManagerPhoneInput = document.getElementById('property-manager-phone-input');

    const scopeLocationNumberInput = document.getElementById('scope-location-number-input');
    const scopeResidentNameInput = document.getElementById('scope-resident-name-input');
    const scopeResidentPhoneInput = document.getElementById('scope-resident-phone-input');
    const scopeAreaNameInput = document.getElementById('scope-area-name-input');
    const scopeItemNameInput = document.getElementById('scope-item-name-input');
    const scopeWorkNeededInput = document.getElementById('scope-work-needed-input');
    const scopeNotesInput = document.getElementById('scope-notes-input');
    const projectAreaCount = document.getElementById('project-area-count');

    const descriptionInput = document.getElementById('project-description-input');
    const errorBox = document.getElementById('project-error');
    const deleteButton = document.getElementById('btn-delete-project');

    const popupBackdrop = document.getElementById('project-custom-popup-backdrop');
    const popupTitle = document.getElementById('project-custom-popup-title');
    const popupMessage = document.getElementById('project-custom-popup-message');
    const popupYesButton = document.getElementById('btn-project-popup-yes');
    const popupNoButton = document.getElementById('btn-project-popup-no');

    const wizardCards = [
        document.getElementById('wizard-card-basic'),
        document.getElementById('wizard-card-request'),
        document.getElementById('wizard-card-location'),
        document.getElementById('wizard-card-contacts'),
        document.getElementById('wizard-card-scope')
    ];

    let currentStep = 0;
    let scopeItemsState = [];
    let currentScopeIndex = 0;

    function showStep(index) {
        currentStep = index;

        wizardCards.forEach((card, cardIndex) => {
            card.classList.toggle('active', cardIndex === currentStep);
        });

        stepLabel.textContent = `STEP ${currentStep + 1} OF ${wizardCards.length}`;
        errorBox.textContent = '';
    }

    function showPopup(title, message) {
        popupTitle.textContent = title;
        popupMessage.textContent = message;
        popupBackdrop.style.display = 'flex';

        return new Promise(resolve => {
            popupYesButton.onclick = () => {
                popupBackdrop.style.display = 'none';
                resolve(true);
            };

            popupNoButton.onclick = () => {
                popupBackdrop.style.display = 'none';
                resolve(false);
            };
        });
    }

    function findLocalContactByName(contactName) {
        const cleanName = normalizeName(contactName);

        if (!cleanName) return null;

        return contacts.find(contact => normalizeName(contact.name) === cleanName) || null;
    }

    function addContactToDatalist(contact) {
        if (!contact?.name) return;

        const optionsList = document.getElementById('project-contact-options');
        const existingOption = Array.from(optionsList.options).find(option => normalizeName(option.value) === normalizeName(contact.name));

        if (existingOption) return;

        const option = document.createElement('option');
        option.value = contact.name;
        optionsList.appendChild(option);
    }

    function fillContactFields(contact, phoneInput, roleInput = null) {
        if (!contact) return;

        if (roleInput && getContactTitle(contact)) {
            roleInput.value = getContactTitle(contact);
        }

        if (phoneInput && getContactPhone(contact)) {
            phoneInput.value = getContactPhone(contact);
        }
    }

    async function checkAndSaveContact(nameInput, phoneInput, roleInput = null, label = 'Contact') {
        const contactName = nameInput.value.trim();

        if (!contactName) {
            return { ok: true, contact: null };
        }

        const existingContact = findLocalContactByName(contactName);

        if (existingContact) {
            fillContactFields(existingContact, phoneInput, roleInput);
            return { ok: true, contact: existingContact };
        }

        const shouldAdd = await showPopup(
            'Contact Not Found',
            `${label} is not in contacts. Add this person to contacts now?`
        );

        if (!shouldAdd) {
            errorBox.textContent = `${label} must be added to contacts before continuing.`;
            return { ok: false, contact: null };
        }

        const response = await createOrUpdateFacilityContact(facilityId, {
            name: contactName,
            role: roleInput ? roleInput.value.trim() : '',
            phone: phoneInput ? phoneInput.value.trim() : ''
        });

        if (response.error) {
            console.error('Create contact error:', response.error);
            errorBox.textContent = `Could not save ${label.toLowerCase()} to contacts.`;
            return { ok: false, contact: null };
        }

        if (response.data) {
            contacts.push(response.data);
            addContactToDatalist(response.data);
            fillContactFields(response.data, phoneInput, roleInput);
        }

        return { ok: true, contact: response.data || null };
    }

    function autoFillContact(nameInput, phoneInput, roleInput = null) {
        const contact = findLocalContactByName(nameInput.value);

        if (contact) {
            fillContactFields(contact, phoneInput, roleInput);
        }
    }

    function setProjectSiteType(value) {
        projectSiteTypeInput.value = value || '';

        document.querySelectorAll('.project-site-type-btn').forEach(button => {
            button.classList.toggle('selected', button.dataset.value === value);
        });
    }

    function getEmptyScopeItem() {
        return {
            location_number: '',
            resident_name: '',
            resident_phone: '',
            area_name: '',
            item_name: '',
            work_needed: '',
            notes: ''
        };
    }

    function scopeItemHasValue(item) {
        return !!(
            item.location_number ||
            item.resident_name ||
            item.resident_phone ||
            item.area_name ||
            item.item_name ||
            item.work_needed ||
            item.notes
        );
    }

    function getCurrentScopeFormValue() {
        return {
            location_number: scopeLocationNumberInput.value.trim(),
            resident_name: scopeResidentNameInput.value.trim(),
            resident_phone: scopeResidentPhoneInput.value.trim(),
            area_name: scopeAreaNameInput.value.trim(),
            item_name: scopeItemNameInput.value.trim(),
            work_needed: scopeWorkNeededInput.value.trim(),
            notes: scopeNotesInput.value.trim()
        };
    }

    function saveCurrentScopeFormToState() {
        scopeItemsState[currentScopeIndex] = getCurrentScopeFormValue();
    }

    function loadScopeItemToForm(item = {}) {
        scopeLocationNumberInput.value = item.location_number || '';
        scopeResidentNameInput.value = item.resident_name || '';
        scopeResidentPhoneInput.value = item.resident_phone || '';
        scopeAreaNameInput.value = item.area_name || '';
        scopeItemNameInput.value = item.item_name || '';
        scopeWorkNeededInput.value = item.work_needed || '';
        scopeNotesInput.value = item.notes || '';
        updateScopeCountLabel();
    }

    function updateScopeCountLabel() {
        const total = scopeItemsState.length || 1;
        projectAreaCount.textContent = `AREA / ITEM ${currentScopeIndex + 1} OF ${total}`;
    }

    function resetScopeItems(items = []) {
        const cleanItems = Array.isArray(items) && items.length ? items : [getEmptyScopeItem()];
        scopeItemsState = cleanItems.map(item => ({
            location_number: item.location_number || '',
            resident_name: item.resident_name || '',
            resident_phone: item.resident_phone || '',
            area_name: item.area_name || '',
            item_name: item.item_name || '',
            work_needed: item.work_needed || '',
            notes: item.notes || ''
        }));
        currentScopeIndex = 0;
        loadScopeItemToForm(scopeItemsState[currentScopeIndex]);
    }

    function getScopeItems() {
        saveCurrentScopeFormToState();

        return scopeItemsState.filter(scopeItemHasValue);
    }

    async function saveCurrentScopeContact() {
        return await checkAndSaveContact(
            scopeResidentNameInput,
            scopeResidentPhoneInput,
            null,
            'Resident / Area Contact'
        );
    }

    function clearModal() {
        projectIdInput.value = '';
        projectNameInput.value = '';
        typeInput.value = '';
        setProjectSiteType('');
        requestedByNameInput.value = '';
        requestedByTitleInput.value = '';
        phoneNumberInput.value = '';
        projectLocationNameInput.value = '';
        addressInput.value = '';
        projectContactNameInput.value = '';
        projectContactPhoneInput.value = '';
        propertyManagerNameInput.value = '';
        propertyManagerPhoneInput.value = '';
        descriptionInput.value = '';
        resetScopeItems();
        errorBox.textContent = '';
        modalTitle.textContent = `Add Project`;
        deleteButton.style.display = 'none';
        showStep(0);
    }

    async function openModal(project = null) {
        clearModal();

        if (project) {
            projectIdInput.value = project.id || '';
            projectNameInput.value = project.project_name || project.name || '';
            typeInput.value = project.type || '';
            setProjectSiteType(project.project_site_type || '');
            requestedByNameInput.value = project.requested_by_name || '';
            requestedByTitleInput.value = project.requested_by_title || '';
            phoneNumberInput.value = project.phone_number || '';
            projectLocationNameInput.value = project.project_location_name || '';
            addressInput.value = project.address || '';
            projectContactNameInput.value = project.project_contact_name || '';
            projectContactPhoneInput.value = project.project_contact_phone || '';
            propertyManagerNameInput.value = project.property_manager_name || '';
            propertyManagerPhoneInput.value = project.property_manager_phone || '';
            descriptionInput.value = project.description || '';
            modalTitle.textContent = `Edit Project`;
            deleteButton.style.display = 'block';

            const existingScopeItems = await fetchProjectScopeItems(project.id);
            resetScopeItems(existingScopeItems);
        }

        if (context?.project_draft_prefill) {
            projectNameInput.value = context.project_draft_prefill.project_name || context.project_draft_prefill.name || '';
            typeInput.value = context.project_draft_prefill.type || '';
            setProjectSiteType(context.project_draft_prefill.project_site_type || '');
            requestedByNameInput.value = context.project_draft_prefill.requested_by_name || '';
            requestedByTitleInput.value = context.project_draft_prefill.requested_by_title || '';
            phoneNumberInput.value = context.project_draft_prefill.phone_number || '';
            projectLocationNameInput.value = context.project_draft_prefill.project_location_name || '';
            addressInput.value = context.project_draft_prefill.address || '';
            projectContactNameInput.value = context.project_draft_prefill.project_contact_name || '';
            projectContactPhoneInput.value = context.project_draft_prefill.project_contact_phone || '';
            propertyManagerNameInput.value = context.project_draft_prefill.property_manager_name || '';
            propertyManagerPhoneInput.value = context.project_draft_prefill.property_manager_phone || '';
            descriptionInput.value = context.project_draft_prefill.description || '';

            if (Array.isArray(context.project_draft_prefill.scope_items)) {
                resetScopeItems(context.project_draft_prefill.scope_items);
            }
        }

        if (context?.project_prefill) {
            projectNameInput.value = context.project_prefill.project_name || context.project_prefill.name || projectNameInput.value;
            typeInput.value = context.project_prefill.type || typeInput.value;
            setProjectSiteType(context.project_prefill.project_site_type || projectSiteTypeInput.value);
            requestedByNameInput.value = context.project_prefill.requested_by_name || requestedByNameInput.value;
            requestedByTitleInput.value = context.project_prefill.requested_by_title || requestedByTitleInput.value;
            phoneNumberInput.value = context.project_prefill.phone_number || phoneNumberInput.value;
            projectLocationNameInput.value = context.project_prefill.project_location_name || projectLocationNameInput.value;
            addressInput.value = context.project_prefill.address || addressInput.value;
            projectContactNameInput.value = context.project_prefill.project_contact_name || projectContactNameInput.value;
            projectContactPhoneInput.value = context.project_prefill.project_contact_phone || projectContactPhoneInput.value;
            propertyManagerNameInput.value = context.project_prefill.property_manager_name || propertyManagerNameInput.value;
            propertyManagerPhoneInput.value = context.project_prefill.property_manager_phone || propertyManagerPhoneInput.value;
            descriptionInput.value = context.project_prefill.description || descriptionInput.value;

            if (Array.isArray(context.project_prefill.scope_items)) {
                resetScopeItems(context.project_prefill.scope_items);
            }
        }

        if (context?.requested_by_name) {
            requestedByNameInput.value = context.requested_by_name || requestedByNameInput.value;
        }

        if (context?.requested_by_title) {
            requestedByTitleInput.value = context.requested_by_title || requestedByTitleInput.value;
        }

        if (context?.phone_number) {
            phoneNumberInput.value = context.phone_number || phoneNumberInput.value;
        }

        modalBackdrop.style.display = 'flex';
    }

    async function finishProject() {
        const projectId = projectIdInput.value;
        const projectName = projectNameInput.value.trim();

        if (!projectName) {
            showStep(0);
            errorBox.textContent = 'Project name required.';
            return;
        }

        const requestedCheck = await checkAndSaveContact(
            requestedByNameInput,
            phoneNumberInput,
            requestedByTitleInput,
            'Requested By Contact'
        );

        if (!requestedCheck.ok) {
            showStep(1);
            return;
        }

        const onSiteCheck = await checkAndSaveContact(
            projectContactNameInput,
            projectContactPhoneInput,
            null,
            'On-Site Contact'
        );

        if (!onSiteCheck.ok) {
            showStep(3);
            return;
        }

        const propertyContactCheck = await checkAndSaveContact(
            propertyManagerNameInput,
            propertyManagerPhoneInput,
            null,
            'Property / Facility Contact'
        );

        if (!propertyContactCheck.ok) {
            showStep(3);
            return;
        }

        const residentCheck = await saveCurrentScopeContact();

        if (!residentCheck.ok) {
            showStep(4);
            return;
        }

        const scopeItems = getScopeItems();

        const payload = {
            facilities_id: facilityId,
            location_id: facilityId,
            name: projectName,
            project_name: projectName,
            type: typeInput.value.trim(),
            project_site_type: projectSiteTypeInput.value.trim(),
            requested_by_name: requestedByNameInput.value.trim(),
            requested_by_title: requestedByTitleInput.value.trim(),
            requested_by_contact_id: requestedCheck.contact?.id || null,
            phone_number: phoneNumberInput.value.trim(),
            project_location_name: projectLocationNameInput.value.trim(),
            address: addressInput.value.trim(),
            project_contact_name: projectContactNameInput.value.trim(),
            project_contact_phone: projectContactPhoneInput.value.trim(),
            property_manager_name: propertyManagerNameInput.value.trim(),
            property_manager_phone: propertyManagerPhoneInput.value.trim(),
            description: descriptionInput.value.trim()
        };

        if (projectId) {
            const { error } = await updateProjectWithScopeItems(projectId, payload, scopeItems);

            if (error) {
                console.error('Update project error:', error);
                errorBox.textContent = 'Could not update project.';
                return;
            }
        } else {
            const { data, error } = await createProjectWithScopeItems(payload, scopeItems);

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
    }

    requestedByNameInput.addEventListener('change', () => {
        autoFillContact(requestedByNameInput, phoneNumberInput, requestedByTitleInput);
    });

    requestedByNameInput.addEventListener('blur', () => {
        autoFillContact(requestedByNameInput, phoneNumberInput, requestedByTitleInput);
    });

    projectContactNameInput.addEventListener('change', () => {
        autoFillContact(projectContactNameInput, projectContactPhoneInput);
    });

    projectContactNameInput.addEventListener('blur', () => {
        autoFillContact(projectContactNameInput, projectContactPhoneInput);
    });

    propertyManagerNameInput.addEventListener('change', () => {
        autoFillContact(propertyManagerNameInput, propertyManagerPhoneInput);
    });

    propertyManagerNameInput.addEventListener('blur', () => {
        autoFillContact(propertyManagerNameInput, propertyManagerPhoneInput);
    });

    scopeResidentNameInput.addEventListener('change', () => {
        autoFillContact(scopeResidentNameInput, scopeResidentPhoneInput);
    });

    scopeResidentNameInput.addEventListener('blur', () => {
        autoFillContact(scopeResidentNameInput, scopeResidentPhoneInput);
    });

    document.querySelectorAll('.project-site-type-btn').forEach(button => {
        button.addEventListener('click', () => {
            setProjectSiteType(button.dataset.value);
        });
    });

    document.getElementById('btn-basic-next').addEventListener('click', () => {
        if (!projectNameInput.value.trim()) {
            errorBox.textContent = 'Project name required.';
            return;
        }

        showStep(1);
    });

    document.getElementById('btn-request-next').addEventListener('click', async () => {
        const contactCheck = await checkAndSaveContact(
            requestedByNameInput,
            phoneNumberInput,
            requestedByTitleInput,
            'Requested By Contact'
        );

        if (!contactCheck.ok) return;

        showStep(2);
    });

    document.getElementById('btn-location-next').addEventListener('click', () => {
        showStep(3);
    });

    document.getElementById('btn-contacts-next').addEventListener('click', async () => {
        const onSiteCheck = await checkAndSaveContact(
            projectContactNameInput,
            projectContactPhoneInput,
            null,
            'On-Site Contact'
        );

        if (!onSiteCheck.ok) return;

        const propertyContactCheck = await checkAndSaveContact(
            propertyManagerNameInput,
            propertyManagerPhoneInput,
            null,
            'Property / Facility Contact'
        );

        if (!propertyContactCheck.ok) return;

        showStep(4);
    });

    document.getElementById('btn-request-back').addEventListener('click', () => showStep(0));
    document.getElementById('btn-location-back').addEventListener('click', () => showStep(1));
    document.getElementById('btn-contacts-back').addEventListener('click', () => showStep(2));
    document.getElementById('btn-scope-back').addEventListener('click', () => {
        saveCurrentScopeFormToState();
        showStep(3);
    });

    document.getElementById('btn-scope-prev').addEventListener('click', () => {
        saveCurrentScopeFormToState();

        if (currentScopeIndex > 0) {
            currentScopeIndex -= 1;
            loadScopeItemToForm(scopeItemsState[currentScopeIndex]);
        }
    });

    document.getElementById('btn-scope-save-add').addEventListener('click', async () => {
        const contactCheck = await saveCurrentScopeContact();

        if (!contactCheck.ok) return;

        saveCurrentScopeFormToState();
        scopeItemsState.push(getEmptyScopeItem());
        currentScopeIndex = scopeItemsState.length - 1;
        loadScopeItemToForm(scopeItemsState[currentScopeIndex]);
    });

    document.getElementById('btn-finish-project').addEventListener('click', finishProject);

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

    document.getElementById('btn-cancel-basic').addEventListener('click', () => {
        modalBackdrop.style.display = 'none';
    });

    document.getElementById('btn-back-facility').addEventListener('click', () => {
        if (window.navigateTo) window.navigateTo('facilities-home');
    });

    deleteButton.addEventListener('click', async () => {
        const projectId = projectIdInput.value;

        if (!projectId) return;

        const shouldDelete = await showPopup(
            'Delete Project',
            'Are you sure you want to delete this project?'
        );

        if (!shouldDelete) return;

        const { error } = await deleteProject(projectId);

        if (error) {
            console.error('Delete project error:', error);
            errorBox.textContent = 'Could not delete project.';
            return;
        }

        modalBackdrop.style.display = 'none';
        await renderProjectsGrid(containerId, context);
    });
}
