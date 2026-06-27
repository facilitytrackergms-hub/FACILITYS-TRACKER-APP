/*================================================================
FACILITY-PROJECT-DETAIL EVENTS
LOCATION: /facilities_views/facility-project-detail/events.js
VERSION: v2026_06_26_split_events_add_area_item
UPDATED: 2026-06-26
================================================================*/

import {
    updateProjectDetail,
    deleteProjectDetail,
    createProjectUpdate,
    createProjectScopeItem
} from './data.js';

import { renderProjectPicturesPopup } from './project-pictures.js';

function getEl(id) {
    return document.getElementById(id);
}

function getValue(id) {
    return String(getEl(id)?.value || '').trim();
}

function on(id, eventName, callback) {
    const element = getEl(id);
    if (!element) return;
    element.addEventListener(eventName, callback);
}

export function setupProjectDetailEvents({
    projectId,
    facility,
    facilityId,
    project,
    projectName,
    projectScopeItems
}) {
    const modalBackdrop = getEl('project-detail-modal-backdrop');
    const updateModalBackdrop = getEl('project-update-modal-backdrop');
    const addScopeBackdrop = getEl('project-add-scope-backdrop');
    const scopeDetailBackdrop = getEl('project-scope-detail-backdrop');

    const errorBox = getEl('project-detail-error');
    const updateErrorBox = getEl('project-update-error');
    const addScopeErrorBox = getEl('project-add-scope-error');

    const popupBackdrop = getEl('project-custom-popup-backdrop');
    const popupTitle = getEl('project-custom-popup-title');
    const popupMessage = getEl('project-custom-popup-message');
    const popupYesButton = getEl('btn-project-popup-yes');
    const popupNoButton = getEl('btn-project-popup-no');

    function showConfirmPopup(title, message) {
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

    function showProjectSection(sectionName) {
        document.querySelectorAll('.project-detail-tab-btn').forEach(button => {
            button.classList.toggle('active', button.dataset.section === sectionName);
        });

        document.querySelectorAll('.project-detail-panel').forEach(panel => {
            panel.classList.toggle('active', panel.dataset.sectionPanel === sectionName);
        });
    }

    document.querySelectorAll('.project-detail-tab-btn').forEach(button => {
        button.addEventListener('click', () => {
            showProjectSection(button.dataset.section);
        });
    });

    document.querySelectorAll('.project-scope-record-button').forEach(button => {
        button.addEventListener('click', () => {
            const index = Number(button.dataset.index);
            const item = projectScopeItems[index];

            if (!item || !window.navigateTo) return;

            window.navigateTo('project-repair-item-detail', {
                ...facility,
                project_id: projectId,
                project_scope_item_id: item.id,
                repair_item_id: item.id,
                facilities_id: facilityId,
                project_name: projectName
            });
        });
    });

    on('btn-close-scope-detail', 'click', () => {
        if (scopeDetailBackdrop) scopeDetailBackdrop.style.display = 'none';
    });

    on('btn-add-project-scope-item', 'click', () => {
        if (addScopeErrorBox) addScopeErrorBox.textContent = '';
        if (addScopeBackdrop) addScopeBackdrop.style.display = 'flex';
    });

    on('btn-cancel-project-scope-item', 'click', () => {
        if (addScopeBackdrop) addScopeBackdrop.style.display = 'none';
    });

    on('btn-save-project-scope-item', 'click', async () => {
        const locationNumber = getValue('add-scope-location-number-input');
        const residentName = getValue('add-scope-resident-name-input');
        const residentPhone = getValue('add-scope-resident-phone-input');
        const areaName = getValue('add-scope-area-name-input');
        const itemName = getValue('add-scope-item-name-input');
        const workNeeded = getValue('add-scope-work-needed-input');
        const repairStatus = getValue('add-scope-repair-status-input');
        const repairPriority = getValue('add-scope-repair-priority-input');
        const notes = getValue('add-scope-notes-input');

        if (!locationNumber && !areaName && !itemName && !workNeeded) {
            addScopeErrorBox.textContent = 'Enter at least one area/item detail.';
            return;
        }

        const payload = {
            project_id: projectId,
            facilities_id: facilityId,
            location_number: locationNumber,
            resident_name: residentName,
            resident_phone: residentPhone,
            area_name: areaName,
            item_name: itemName,
            work_needed: workNeeded,
            repair_status: repairStatus || 'Open',
            repair_priority: repairPriority,
            notes,
            sort_order: projectScopeItems.length + 1,
            active_status: 'active'
        };

        const { data, error } = await createProjectScopeItem(payload);

        if (error) {
            console.error('Create area/item error:', error);
            addScopeErrorBox.textContent = 'Could not save area/item.';
            return;
        }

        addScopeBackdrop.style.display = 'none';

        if (window.navigateTo) {
            window.navigateTo('project-repair-item-detail', {
                ...facility,
                project_id: projectId,
                project_scope_item_id: data.id,
                repair_item_id: data.id,
                facilities_id: facilityId,
                project_name: projectName
            });
        }
    });

    document.querySelectorAll('.project-update-record-button').forEach(button => {
        button.addEventListener('click', () => {
            if (window.navigateTo) {
                window.navigateTo('project-update', {
                    ...facility,
                    project_id: projectId,
                    project_update_id: button.dataset.id,
                    project_name: projectName,
                    facilities_id: facilityId
                });
            }
        });
    });

    on('btn-open-materials', 'click', () => {
        if (window.navigateTo) {
            window.navigateTo('materials', {
                ...facility,
                project_id: projectId,
                project_name: projectName,
                facilities_id: facilityId
            });
        }
    });

    on('btn-add-project-update', 'click', () => {
        if (updateModalBackdrop) updateModalBackdrop.style.display = 'flex';
    });

    on('btn-open-pictures', 'click', () => {
        renderProjectPicturesPopup({
            projectId,
            facilitiesId: facilityId,
            projectName
        });
    });

    on('btn-take-project-picture', 'click', () => {
        renderProjectPicturesPopup({
            projectId,
            facilitiesId: facilityId,
            projectName
        });
    });

    on('btn-see-project-pictures', 'click', () => {
        renderProjectPicturesPopup({
            projectId,
            facilitiesId: facilityId,
            projectName
        });
    });

    on('btn-cancel-project-update', 'click', () => {
        if (updateModalBackdrop) updateModalBackdrop.style.display = 'none';
    });

    on('btn-edit-project-detail', 'click', () => {
        if (modalBackdrop) modalBackdrop.style.display = 'flex';
    });

    on('btn-cancel-project-detail', 'click', () => {
        if (modalBackdrop) modalBackdrop.style.display = 'none';
    });

    on('btn-back-projects', 'click', () => {
        if (window.navigateTo) window.navigateTo('facilities-projects', facility);
    });

    on('btn-save-project-and-back', 'click', async () => {
        const saveButton = getEl('btn-save-project-and-back');

        saveButton.disabled = true;
        saveButton.textContent = 'SAVING...';

        const payload = {
            name: projectName,
            project_name: projectName,
            type: project.type || '',
            status: project.status || 'Open',
            project_site_type: project.project_site_type || '',
            requested_by_name: project.requested_by_name || '',
            requested_by_title: project.requested_by_title || '',
            phone_number: project.phone_number || '',
            project_location_name: project.project_location_name || '',
            address: project.address || '',
            project_contact_name: project.project_contact_name || '',
            project_contact_phone: project.project_contact_phone || '',
            property_manager_name: project.property_manager_name || '',
            property_manager_phone: project.property_manager_phone || '',
            appointment_time: project.appointment_time || null,
            reminder: project.reminder || '',
            description: project.description || '',
            notes: project.notes || ''
        };

        const { error } = await updateProjectDetail(projectId, payload);

        if (error) {
            console.error('Save project detail error:', error);
            saveButton.disabled = false;
            saveButton.textContent = '💾 SAVE';
            alert('Could not save project.');
            return;
        }

        if (window.navigateTo) {
            window.navigateTo('facilities-details', {
                ...facility,
                id: facilityId,
                facilities_id: facilityId
            });
        }
    });

    on('btn-delete-project-detail', 'click', async () => {
        const shouldDelete = await showConfirmPopup(
            'Delete Project',
            'Are you sure you want to delete this project?'
        );

        if (!shouldDelete) return;

        const { error } = await deleteProjectDetail(projectId);

        if (error) {
            console.error('Delete project detail error:', error);
            alert('Could not delete project.');
            return;
        }

        if (window.navigateTo) window.navigateTo('facilities-projects', facility);
    });

    on('btn-save-project-update', 'click', async () => {
        const updateTitle = getValue('project-update-title-input');
        const status = getValue('project-update-status-input');
        const workDone = getValue('project-update-work-done-input');
        const leftOffAt = getValue('project-update-left-off-input');
        const materialsNeeded = getValue('project-update-materials-input');
        const nextStep = getValue('project-update-next-step-input');
        const vendorNeeded = !!getEl('project-update-vendor-needed-input')?.checked;
        const notes = getValue('project-update-notes-input');

        if (!updateTitle && !status && !workDone && !leftOffAt && !materialsNeeded && !nextStep && !notes) {
            updateErrorBox.textContent = 'Enter at least one update detail.';
            return;
        }

        const payload = {
            project_id: projectId,
            facilities_id: facilityId,
            update_title: updateTitle,
            status,
            work_done: workDone,
            left_off_at: leftOffAt,
            materials_needed: materialsNeeded,
            next_step: nextStep,
            vendor_needed: vendorNeeded,
            notes
        };

        const { data, error } = await createProjectUpdate(payload);

        if (error) {
            console.error('Insert project update error:', error);
            updateErrorBox.textContent = 'Could not save project update.';
            return;
        }

        updateModalBackdrop.style.display = 'none';

        if (window.navigateTo) {
            window.navigateTo('project-update', {
                ...facility,
                project_id: projectId,
                project_update_id: data.id,
                project_name: projectName,
                facilities_id: facilityId
            });
        }
    });

    on('btn-save-project-detail', 'click', async () => {
        const projectNameInput = getValue('project-detail-name-input');
        const typeInput = getValue('project-detail-type-input');
        const statusInput = getValue('project-detail-status-input');
        const siteTypeInput = getValue('project-detail-site-type-input');
        const requestedByNameInput = getValue('project-detail-requested-by-name-input');
        const requestedByTitleInput = getValue('project-detail-requested-by-title-input');
        const phoneNumberInput = getValue('project-detail-phone-number-input');
        const locationNameInput = getValue('project-detail-location-name-input');
        const addressInput = getValue('project-detail-address-input');
        const projectContactNameInput = getValue('project-detail-contact-name-input');
        const projectContactPhoneInput = getValue('project-detail-contact-phone-input');
        const propertyManagerNameInput = getValue('project-detail-manager-name-input');
        const propertyManagerPhoneInput = getValue('project-detail-manager-phone-input');
        const appointmentTimeInput = getEl('project-detail-appointment-time-input')?.value || '';
        const reminderInput = getValue('project-detail-reminder-input');
        const descriptionInput = getValue('project-detail-description-input');
        const notesInput = getValue('project-detail-notes-input');

        if (!projectNameInput) {
            errorBox.textContent = 'Project name required.';
            return;
        }

        const payload = {
            name: projectNameInput,
            project_name: projectNameInput,
            type: typeInput,
            status: statusInput,
            project_site_type: siteTypeInput,
            requested_by_name: requestedByNameInput,
            requested_by_title: requestedByTitleInput,
            phone_number: phoneNumberInput,
            project_location_name: locationNameInput,
            address: addressInput,
            project_contact_name: projectContactNameInput,
            project_contact_phone: projectContactPhoneInput,
            property_manager_name: propertyManagerNameInput,
            property_manager_phone: propertyManagerPhoneInput,
            appointment_time: appointmentTimeInput || null,
            reminder: reminderInput,
            description: descriptionInput,
            notes: notesInput
        };

        const { data, error } = await updateProjectDetail(projectId, payload);

        if (error) {
            console.error('Update project detail error:', error);
            errorBox.textContent = 'Could not update project.';
            return;
        }

        modalBackdrop.style.display = 'none';

        if (window.navigateTo) {
            window.navigateTo('facility-project-detail', {
                ...facility,
                project_id: data.id
            });
        }
    });
}
