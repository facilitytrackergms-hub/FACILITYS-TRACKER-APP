/* ================================================================
   FACILITY TRACKER MODULAR VIEW SYSTEM
   PURPOSE: Facility Inspections Grid Controller
   LOCATION: /facilities_views/facility-inspections/grid.js
   VERSION: v2026_06_24_grid_clickable_item_dashboard
   UPDATED: 2026-06-24
================================================================ */

import {
    createInspectionSession,
    updateInspectionSession,
    fetchInspectionSessions,
    deleteInspectionSession,
    createInspectionSessionItem,
    updateInspectionSessionItem,
    deleteInspectionSessionItem,
    fetchInspectionSessionItems,
    createInspectionImage,
    fetchInspectionImages
} from './data.js';

import { uploadImage } from '../../global_engine/image-handler.js';

import {
    buildInspectionGridHtml,
    buildLoginMissingHtml,
    escapeHtml,
    formatDate
} from './ui.js';

function getFacilitiesId(context) {
    return context?.facilities_id || context?.facility_id || context?.facilityId || context?.location_id || context?.id || null;
}

function getFacilityName(context) {
    return context?.abbreviation || context?.number_name || context?.name || 'Facility';
}

function getStoredAppUser() {
    try {
        const raw = localStorage.getItem('facility_tracker_app_user');
        const parsed = JSON.parse(raw || '{}');

        if (!parsed?.auth_user_id || !parsed?.display_name || parsed?.active_status !== 'active') {
            return null;
        }

        return parsed;
    } catch (error) {
        console.error('Read stored app user error:', error);
        return null;
    }
}

function normalizeResult(value) {
    return String(value || '').trim().toLowerCase();
}

async function fetchSavedSessionItemsBySessionId(sessions = [], facilitiesId = null) {
    const itemsBySessionId = {};

    for (const session of sessions) {
        const sessionId = String(session?.id || '');

        if (!sessionId) continue;

        const { data, error } = await fetchInspectionSessionItems(session.id);

        if (error) {
            console.error('Fetch saved inspection session items error:', error);
            itemsBySessionId[sessionId] = [];
            continue;
        }

        itemsBySessionId[sessionId] = (data || []).filter(item => {
            const itemSessionId = String(item?.inspection_session_id || '');
            const itemFacilityId = String(item?.facilities_id || '');

            return itemSessionId === sessionId &&
                (!facilitiesId || !itemFacilityId || itemFacilityId === String(facilitiesId));
        });
    }

    return itemsBySessionId;
}

    return itemsBySessionId;
}

let activeSession = null;
let currentResult = 'pass';
let selectedInspectionImages = [];
let pendingOpenLocationModalAfterImage = false;
let currentReportText = '';
let currentLocationType = 'room';
let editingInspectionItem = null;
let dashboardInspectionItem = null;
let dashboardInspectionSession = null;

export async function render(containerId, context = {}) {
    await renderFacilityInspectionsGrid(containerId, context);
}

export async function renderFacilityInspectionsGrid(containerId, context = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const facilitiesId = getFacilitiesId(context);
    const facilityName = getFacilityName(context);
    const appUser = getStoredAppUser();

    if (!appUser) {
        container.innerHTML = buildLoginMissingHtml();
        return;
    }

    if (!facilitiesId) {
        container.innerHTML = `<p style="color:red;text-align:center;">Missing facility ID.</p>`;
        return;
    }

    activeSession = null;
    currentResult = 'pass';
    selectedInspectionImages = [];
    pendingOpenLocationModalAfterImage = false;
    currentReportText = '';
    currentLocationType = 'room';
    editingInspectionItem = null;
    dashboardInspectionItem = null;
    dashboardInspectionSession = null;

    const sessionsResponse = await fetchInspectionSessions(facilitiesId);
    const sessions = sessionsResponse.data || [];
    const sessionItemsBySessionId = await fetchSavedSessionItemsBySessionId(sessions, facilitiesId);
    const allSavedItems = Object.values(sessionItemsBySessionId).flat();

    container.innerHTML = buildInspectionGridHtml({
        facilityName,
        appUser,
        sessions,
        sessionItemsBySessionId
    });

    const inspectedByInput = document.getElementById('inspection-inspected-by');
    const sessionNotesInput = document.getElementById('inspection-session-notes');
    const startButton = document.getElementById('btn-start-inspection');
    const activeActions = document.getElementById('inspection-active-actions');
    const addLocationButton = document.getElementById('btn-add-location-to-inspect');
    const saveProgressButton = document.getElementById('btn-save-progress-inspection');
    const finishLaterButton = document.getElementById('btn-finish-later-inspection');
    const finishActiveButton = document.getElementById('btn-finish-active-inspection');
    const errorBox = document.getElementById('inspection-error');
    const successBox = document.getElementById('inspection-success');

    const sessionModal = document.getElementById('inspection-session-modal-backdrop');
    const inspectionNameInput = document.getElementById('inspection-name-input');
    const inspectionNameError = document.getElementById('inspection-name-error');

    const itemDescriptionModal = document.getElementById('inspection-item-description-modal-backdrop');
    const itemDescriptionError = document.getElementById('item-description-error');

    const locationModal = document.getElementById('inspection-location-modal-backdrop');
    const locationModalError = document.getElementById('location-modal-error');

    const statusModal = document.getElementById('inspection-status-modal-backdrop');
    const statusModalError = document.getElementById('status-modal-error');

    const itemDashboardModal = document.getElementById('inspection-item-dashboard-modal-backdrop');
    const itemDashboardError = document.getElementById('item-dashboard-error');

    const reportModal = document.getElementById('inspection-report-modal-backdrop');

    const roomTypeButton = document.getElementById('btn-location-type-room');
    const commonTypeButton = document.getElementById('btn-location-type-common');

    const popupPassButton = document.getElementById('btn-popup-pass');
    const popupFailButton = document.getElementById('btn-popup-fail');
    const failReasonsArea = document.getElementById('fail-reasons-area');
    const failReasonsList = document.getElementById('fail-reasons-list');

    const imageInput = document.getElementById('inspection-image-input');
    const imageCount = document.getElementById('inspection-image-count');
    const imagePreview = document.getElementById('inspection-image-preview');

    function clearMainMessages() {
        errorBox.textContent = '';
        successBox.textContent = '';
    }

    function clearStepErrors() {
        inspectionNameError.textContent = '';
        itemDescriptionError.textContent = '';
        locationModalError.textContent = '';
        statusModalError.textContent = '';

        if (itemDashboardError) {
            itemDashboardError.textContent = '';
        }
    }

    function reloadInspectionView() {
        if (window.navigateTo) {
            window.navigateTo('facility-inspections', context);
        }
    }

    function getSessionInspectorName() {
        return activeSession?.inspected_by || inspectedByInput.value.trim() || appUser.display_name;
    }

    function getSessionInspectorUserId() {
        return activeSession?.inspected_by_user_id || appUser.auth_user_id;
    }

    function getSessionInspectorRole() {
        return activeSession?.inspected_by_role || appUser.role || 'inspector';
    }

    function formatCommonAreaLocation(value) {
        return String(value || '')
            .trim()
            .toLowerCase()
            .replace(/\b\w/g, letter => letter.toUpperCase());
    }

    function updateImagePreview() {
        if (editingInspectionItem && !selectedInspectionImages.length) {
            imageCount.textContent = 'Existing image kept. Retake only if needed.';
            imagePreview.innerHTML = '';
            imagePreview.style.display = 'none';
            return;
        }

        imageCount.textContent = selectedInspectionImages.length
            ? `${selectedInspectionImages.length} image(s) selected.`
            : 'Take a picture before saving.';

        imagePreview.innerHTML = selectedInspectionImages.map(file => `
            <img src="${URL.createObjectURL(file)}" alt="Inspection image">
        `).join('');
    }

    function setFailReasonInputs(reasons = []) {
        failReasonsList.innerHTML = '';

        const cleanReasons = Array.isArray(reasons)
            ? reasons.map(reason => String(reason || '').trim()).filter(Boolean)
            : [];

        if (!cleanReasons.length) {
            cleanReasons.push('');
        }

        cleanReasons.forEach((reason, index) => {
            const input = document.createElement('input');
            input.className = 'inspection-input fail-reason-input';
            input.type = 'text';
            input.placeholder = `Reason ${index + 1}`;
            input.style.marginTop = '8px';
            input.value = reason;
            failReasonsList.appendChild(input);
        });
    }

    function resetStatusStep() {
        currentResult = 'pass';
        popupPassButton.classList.add('active');
        popupFailButton.classList.remove('active');
        failReasonsArea.style.display = 'none';
        failReasonsList.innerHTML = '';
        statusModalError.textContent = '';
    }

    function loadStatusStepForEdit(item) {
        const result = normalizeResult(item?.result);

        if (result === 'fail') {
            currentResult = 'fail';
            popupFailButton.classList.add('active');
            popupPassButton.classList.remove('active');
            failReasonsArea.style.display = 'block';
            setFailReasonInputs(item?.fail_reasons || []);
            return;
        }

        resetStatusStep();
    }

    function resetLocationStep() {
        currentLocationType = 'room';
        roomTypeButton.classList.add('active');
        commonTypeButton.classList.remove('active');

        const locationInput = document.getElementById('location-name-input');
        locationInput.value = '';
        locationInput.type = 'number';
        locationInput.inputMode = 'numeric';
        locationInput.placeholder = 'Room number';

        locationModalError.textContent = '';
    }

    function loadLocationStepForEdit(item) {
        const locationInput = document.getElementById('location-name-input');
        const locationName = String(item?.location_name || '').trim();
        const roomMatch = locationName.match(/^room\s+(.+)$/i);

        if (roomMatch) {
            currentLocationType = 'room';
            roomTypeButton.classList.add('active');
            commonTypeButton.classList.remove('active');
            locationInput.type = 'number';
            locationInput.inputMode = 'numeric';
            locationInput.placeholder = 'Room number';
            locationInput.value = roomMatch[1].replace(/[^\d]/g, '');
            return;
        }

        currentLocationType = 'common';
        commonTypeButton.classList.add('active');
        roomTypeButton.classList.remove('active');
        locationInput.type = 'text';
        locationInput.inputMode = 'text';
        locationInput.placeholder = 'Dining Room, Hallway, Lobby';
        locationInput.value = locationName;
    }

    function clearLocationModal() {
        document.getElementById('location-name-input').value = '';
        document.getElementById('item-name-input').value = '';
        document.getElementById('location-notes-input').value = '';
        failReasonsList.innerHTML = '';
        clearStepErrors();
        resetLocationStep();
        resetStatusStep();
        selectedInspectionImages = [];
        imageInput.value = '';
        imagePreview.style.display = 'none';
        updateImagePreview();
    }

    function showActiveSessionUi() {
        startButton.style.display = 'none';
        activeActions.style.display = 'grid';
    }

    function openInspectionNameModal() {
        clearMainMessages();
        clearStepErrors();
        inspectionNameInput.value = '';
        sessionModal.style.display = 'flex';
        setTimeout(() => inspectionNameInput.focus(), 50);
    }

    async function createInspectionFromName() {
        clearMainMessages();
        clearStepErrors();

        const inspectionName = inspectionNameInput.value.trim();

        if (!inspectionName) {
            inspectionNameError.textContent = 'Enter inspection name or purpose.';
            return null;
        }

        const payload = {
            facilities_id: facilitiesId,
            inspected_by: appUser.display_name,
            inspected_by_user_id: appUser.auth_user_id,
            inspected_by_role: appUser.role || 'inspector',
            session_notes: inspectionName,
            status: 'open'
        };

        const { data, error } = await createInspectionSession(payload);

        if (error) {
            console.error('Create inspection session error:', error);
            inspectionNameError.textContent = 'Could not save inspection.';
            return null;
        }

        activeSession = data;
        inspectedByInput.value = data.inspected_by || appUser.display_name;
        sessionNotesInput.value = inspectionName;
        sessionModal.style.display = 'none';
        successBox.textContent = 'Inspection saved. Click INSPECT ITEM.';
        showActiveSessionUi();

        return activeSession;
    }

    function openCameraForNextInspectionItem() {
        clearMainMessages();
        clearStepErrors();

        if (!appUser?.display_name) {
            errorBox.textContent = 'Login user not found.';
            return;
        }

        if (!activeSession) {
            errorBox.textContent = 'Add inspection first.';
            return;
        }

        editingInspectionItem = null;
        clearLocationModal();
        pendingOpenLocationModalAfterImage = true;
        imageInput.value = '';
        imageInput.click();
    }

    async function startInspectionIfNeeded() {
        clearMainMessages();

        if (activeSession) return activeSession;

        errorBox.textContent = 'Add inspection first.';
        return null;
    }

    async function saveInspectionProgress(leaveAfterSave = false) {
        if (!activeSession) {
            errorBox.textContent = 'Add inspection first.';
            return false;
        }

        const { error } = await updateInspectionSession(activeSession.id, {
            status: 'open',
            inspected_by: getSessionInspectorName(),
            inspected_by_user_id: getSessionInspectorUserId(),
            inspected_by_role: getSessionInspectorRole(),
            session_notes: sessionNotesInput.value.trim()
        });

        if (error) {
            console.error('Save inspection progress error:', error);
            errorBox.textContent = 'Could not save progress.';
            return false;
        }

        successBox.textContent = 'Progress saved. You can continue this inspection later.';

        if (leaveAfterSave && window.navigateTo) {
            window.navigateTo('facilities-details', context);
        }

        return true;
    }

    function loadSavedInspection(session) {
        if (!session) return;

        activeSession = session;
        inspectedByInput.value = session.inspected_by || appUser.display_name;
        sessionNotesInput.value = session.session_notes || '';

        showActiveSessionUi();

        successBox.textContent = 'Saved inspection loaded. Click INSPECT ITEM.';
        errorBox.textContent = '';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function openEditInspectionItem(session, item) {
        if (!session || !item) {
            alert('Could not load item.');
            return;
        }

        clearMainMessages();
        clearStepErrors();
        clearLocationModal();

        editingInspectionItem = item;
        activeSession = session;

        inspectedByInput.value = session.inspected_by || appUser.display_name;
        sessionNotesInput.value = session.session_notes || '';
        showActiveSessionUi();

        document.getElementById('item-name-input').value = item.item_name || '';
        document.getElementById('location-notes-input').value = item.notes || '';

        selectedInspectionImages = [];
        imageInput.value = '';
        updateImagePreview();

        itemDescriptionModal.style.display = 'flex';
        setTimeout(() => document.getElementById('item-name-input').focus(), 50);
    }

    function getFailReasons() {
        const inputs = document.querySelectorAll('.fail-reason-input');
        return Array.from(inputs)
            .map(input => input.value.trim())
            .filter(value => value);
    }

    function buildProjectPrefillFromItem(session, item) {
        const reasons = Array.isArray(item?.fail_reasons)
            ? item.fail_reasons.map(reason => String(reason || '').trim()).filter(Boolean)
            : [];

        const projectName = `${item?.location_name || 'Inspection'} - ${item?.item_name || 'Inspection Item'}`;

        return {
            project_name: projectName,
            name: projectName,
            type: 'Inspection',
            requested_by_name: getSessionInspectorName(),
            requested_by_title: getSessionInspectorRole(),
            description: [
                `Created from inspection item.`,
                ``,
                `Facility: ${facilityName}`,
                `Inspection: ${session?.session_notes || ''}`,
                `Location: ${item?.location_name || ''}`,
                `Item: ${item?.item_name || ''}`,
                `Result: ${String(item?.result || '').toUpperCase()}`,
                reasons.length ? `Fail Reasons: ${reasons.join('; ')}` : `Fail Reasons:`,
                `Notes: ${item?.notes || ''}`
            ].join('\n'),
            notes: `Inspection session ID: ${session?.id || ''}\nInspection item ID: ${item?.id || ''}`
        };
    }

    function startProjectFromExistingItem(session, item) {
        if (!session || !item) {
            itemDashboardError.textContent = 'Could not load item.';
            return;
        }

        activeSession = session;

        if (window.navigateTo) {
            window.navigateTo('facilities-projects', {
                ...context,
                id: facilitiesId,
                facilities_id: facilitiesId,
                open_add_project_modal: true,
                project_prefill: buildProjectPrefillFromItem(session, item)
            });
        }
    }

    function addProjectUpdateFromExistingItem(session, item) {
        if (!session || !item) {
            itemDashboardError.textContent = 'Could not load item.';
            return;
        }

        if (window.navigateTo) {
            window.navigateTo('project-update', {
                ...context,
                id: facilitiesId,
                facilities_id: facilitiesId,
                from_inspection_item: true,
                inspection_update_prefill: {
                    facility_name: facilityName,
                    inspection_session_id: session.id,
                    inspection_item_id: item.id,
                    inspection_name: session.session_notes || '',
                    location_name: item.location_name || '',
                    item_name: item.item_name || '',
                    result: item.result || '',
                    fail_reasons: Array.isArray(item.fail_reasons) ? item.fail_reasons : [],
                    notes: item.notes || '',
                    requested_by_name: getSessionInspectorName(),
                    requested_by_title: getSessionInspectorRole(),
                    update_text: [
                        `Inspection Update`,
                        `Inspection: ${session.session_notes || ''}`,
                        `Location: ${item.location_name || ''}`,
                        `Item: ${item.item_name || ''}`,
                        `Result: ${String(item.result || '').toUpperCase()}`
                    ].join('\n')
                }
            });
        }
    }

    function openInspectionItemDashboard(session, item) {
        if (!session || !item) {
            alert('Could not load inspection item.');
            return;
        }

        dashboardInspectionSession = session;
        dashboardInspectionItem = item;
        activeSession = session;

        const reasons = Array.isArray(item.fail_reasons)
            ? item.fail_reasons.map(reason => String(reason || '').trim()).filter(Boolean)
            : [];

        document.getElementById('item-dashboard-inspection-name').textContent = session.session_notes || '';
        document.getElementById('item-dashboard-location').textContent = item.location_name || '';
        document.getElementById('item-dashboard-item').textContent = item.item_name || '';
        document.getElementById('item-dashboard-status').textContent = String(item.result || '').toUpperCase();
        document.getElementById('item-dashboard-fail-reasons').textContent = reasons.length ? reasons.join('; ') : 'None';

        itemDashboardError.textContent = '';
        itemDashboardModal.style.display = 'flex';
    }

    async function uploadSelectedImages(savedItem) {
        if (!selectedInspectionImages.length || !savedItem?.id) return true;

        for (const file of selectedInspectionImages) {
            const imageUrl = await uploadImage(
                file,
                'inspection-images',
                `facility_${facilitiesId}/session_${activeSession.id}/item_${savedItem.id}`
            );

            const { error } = await createInspectionImage({
                inspection_id: savedItem.id,
                facilities_id: facilitiesId,
                image_url: imageUrl,
                caption: `${savedItem.location_name || ''} - ${savedItem.item_name || ''}`,
                uploaded_by: getSessionInspectorName()
            });

            if (error) {
                console.error('Create inspection image record error:', error);
                return false;
            }
        }

        return true;
    }

    async function saveLocationItem() {
        statusModalError.textContent = '';
        statusModalError.style.color = 'red';

        const locationInput = document.getElementById('location-name-input');
        const rawLocationName = locationInput.value.trim();
        const itemName = document.getElementById('item-name-input').value.trim();
        const notes = document.getElementById('location-notes-input').value.trim();
        const failReasons = getFailReasons();

        let locationName = rawLocationName;

        if (currentLocationType === 'room') {
            locationName = rawLocationName ? `Room ${rawLocationName}` : '';
        }

        if (currentLocationType === 'common') {
            locationName = formatCommonAreaLocation(rawLocationName);
        }

        if (!editingInspectionItem && !selectedInspectionImages.length) {
            statusModalError.textContent = 'Take a picture first.';
            return null;
        }

        if (!itemName) {
            statusModalError.textContent = 'Enter item description.';
            return null;
        }

        if (!locationName) {
            statusModalError.textContent = 'Enter location.';
            return null;
        }

        if (currentResult === 'fail' && !failReasons.length) {
            statusModalError.textContent = 'Enter at least one fail reason.';
            return null;
        }

        if (!appUser?.display_name) {
            statusModalError.textContent = 'Login user not found.';
            return null;
        }

        const session = await startInspectionIfNeeded();
        if (!session) return null;

        const payload = {
            inspection_session_id: session.id,
            facilities_id: facilitiesId,
            inspected_by_user_id: getSessionInspectorUserId(),
            inspected_by_name: getSessionInspectorName(),
            location_name: locationName,
            item_name: itemName,
            result: currentResult,
            fail_reasons: currentResult === 'fail' ? failReasons : [],
            notes
        };

        let response;

        if (editingInspectionItem?.id) {
            response = await updateInspectionSessionItem(editingInspectionItem.id, payload);
        } else {
            response = await createInspectionSessionItem(payload);
        }

        if (response.error) {
            console.error('Save inspection session item error:', response.error);
            statusModalError.textContent = 'Could not save this item.';
            return null;
        }

        const imagesSaved = await uploadSelectedImages(response.data);

        if (!imagesSaved) {
            statusModalError.textContent = 'Item saved, but image record failed.';
            return response.data;
        }

        editingInspectionItem = null;
        return response.data;
    }

    async function finishInspection() {
        if (!activeSession) {
            errorBox.textContent = 'Add inspection first.';
            return false;
        }

        const { error } = await updateInspectionSession(activeSession.id, {
            status: 'finished',
            inspected_by: getSessionInspectorName(),
            inspected_by_user_id: getSessionInspectorUserId(),
            inspected_by_role: getSessionInspectorRole(),
            session_notes: sessionNotesInput.value.trim()
        });

        if (error) {
            console.error('Finish inspection error:', error);
            errorBox.textContent = 'Could not finish inspection.';
            return false;
        }

        activeSession = null;
        reloadInspectionView();

        return true;
    }

    async function saveFailAndStartProject() {
        if (currentResult !== 'fail') {
            statusModalError.textContent = 'Select FAIL before starting a project.';
            return;
        }

        const saved = await saveLocationItem();
        if (!saved) return;

        const reasons = getFailReasons();
        const projectName = `${saved.location_name || 'Inspection'} - ${saved.item_name || 'Failed Item'}`;

        if (window.navigateTo) {
            window.navigateTo('facilities-projects', {
                ...context,
                id: facilitiesId,
                facilities_id: facilitiesId,
                open_add_project_modal: true,
                project_prefill: {
                    project_name: projectName,
                    name: projectName,
                    type: 'Inspection',
                    requested_by_name: getSessionInspectorName(),
                    requested_by_title: getSessionInspectorRole(),
                    description: [
                        `Created from failed inspection.`,
                        ``,
                        `Facility: ${facilityName}`,
                        `Inspection: ${activeSession?.session_notes || sessionNotesInput.value.trim() || ''}`,
                        `Location: ${saved.location_name || ''}`,
                        `Item: ${saved.item_name || ''}`,
                        `Result: FAIL`,
                        reasons.length ? `Fail Reasons: ${reasons.join('; ')}` : `Fail Reasons:`,
                        `Notes: ${saved.notes || ''}`
                    ].join('\n'),
                    notes: `Inspection session ID: ${activeSession?.id || ''}\nInspection item ID: ${saved.id || ''}`
                }
            });
        }
    }

    function getCurrentReportText() {
        if (!currentReportText) {
            alert('Open a report first.');
            return '';
        }

        return currentReportText;
    }

    function textCurrentReport() {
        const reportText = getCurrentReportText();
        if (!reportText) return;

        const phoneInput = document.getElementById('inspection-report-phone');
        const phone = String(phoneInput?.value || '').trim().replace(/[^\d+]/g, '');

        if (!phone) {
            alert('Enter phone number.');
            return;
        }

        window.location.href = `sms:${phone}?&body=${encodeURIComponent(reportText)}`;
    }

    function emailCurrentReport() {
        const reportText = getCurrentReportText();
        if (!reportText) return;

        const emailInput = document.getElementById('inspection-report-email');
        const email = String(emailInput?.value || '').trim();

        if (!email) {
            alert('Enter email address.');
            return;
        }

        const subject = `Inspection Report - ${facilityName}`;
        window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(reportText)}`;
    }

    function printCurrentReport() {
        const reportText = getCurrentReportText();
        if (!reportText) return;

        const printWindow = window.open('', '_blank');

        if (!printWindow) {
            window.print();
            return;
        }

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <title>Inspection Report</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            padding: 20px;
                            color: #111827;
                        }

                        pre {
                            white-space: pre-wrap;
                            font-size: 14px;
                            line-height: 1.4;
                        }
                    </style>
                </head>
                <body>
                    <pre>${escapeHtml(reportText)}</pre>
                    <script>
                        window.onload = function() {
                            window.print();
                        };
                    <\/script>
                </body>
            </html>
        `);

        printWindow.document.close();
    }

    startButton.addEventListener('click', () => {
        openInspectionNameModal();
    });

    document.getElementById('btn-save-inspection-name').addEventListener('click', async () => {
        await createInspectionFromName();
    });

    document.getElementById('btn-cancel-inspection-name').addEventListener('click', () => {
        sessionModal.style.display = 'none';
        inspectionNameInput.value = '';
        inspectionNameError.textContent = '';
    });

    addLocationButton.addEventListener('click', () => {
        openCameraForNextInspectionItem();
    });

    saveProgressButton.addEventListener('click', async () => {
        await saveInspectionProgress(false);
    });

    finishLaterButton.addEventListener('click', async () => {
        await saveInspectionProgress(true);
    });

    finishActiveButton.addEventListener('click', async () => {
        await finishInspection();
    });

    roomTypeButton.addEventListener('click', () => {
        currentLocationType = 'room';
        roomTypeButton.classList.add('active');
        commonTypeButton.classList.remove('active');

        const locationInput = document.getElementById('location-name-input');
        locationInput.value = '';
        locationInput.type = 'number';
        locationInput.inputMode = 'numeric';
        locationInput.placeholder = 'Room number';
        locationModalError.textContent = '';
    });

    commonTypeButton.addEventListener('click', () => {
        currentLocationType = 'common';
        commonTypeButton.classList.add('active');
        roomTypeButton.classList.remove('active');

        const locationInput = document.getElementById('location-name-input');
        locationInput.value = '';
        locationInput.type = 'text';
        locationInput.inputMode = 'text';
        locationInput.placeholder = 'Dining Room, Hallway, Lobby';
        locationModalError.textContent = '';
    });

    document.getElementById('location-name-input').addEventListener('input', event => {
        if (currentLocationType !== 'common') return;

        const cursorPosition = event.target.selectionStart;
        event.target.value = formatCommonAreaLocation(event.target.value);

        try {
            event.target.setSelectionRange(cursorPosition, cursorPosition);
        } catch (error) {
            console.error('Set cursor position error:', error);
        }
    });

    popupPassButton.addEventListener('click', () => {
        currentResult = 'pass';
        popupPassButton.classList.add('active');
        popupFailButton.classList.remove('active');
        failReasonsArea.style.display = 'none';
        failReasonsList.innerHTML = '';
        statusModalError.textContent = '';
    });

    popupFailButton.addEventListener('click', () => {
        currentResult = 'fail';
        popupFailButton.classList.add('active');
        popupPassButton.classList.remove('active');
        failReasonsArea.style.display = 'block';
        statusModalError.textContent = '';

        if (!document.querySelector('.fail-reason-input')) {
            setFailReasonInputs([]);
        }
    });

    document.getElementById('btn-add-fail-reason').addEventListener('click', () => {
        const count = document.querySelectorAll('.fail-reason-input').length + 1;
        const input = document.createElement('input');
        input.className = 'inspection-input fail-reason-input';
        input.type = 'text';
        input.placeholder = `Reason ${count}`;
        input.style.marginTop = '8px';
        failReasonsList.appendChild(input);
    });

    document.getElementById('btn-take-inspection-image').addEventListener('click', () => {
        itemDescriptionError.textContent = '';
        pendingOpenLocationModalAfterImage = true;
        imageInput.value = '';
        imageInput.click();
    });

    imageInput.addEventListener('change', () => {
        selectedInspectionImages = Array.from(imageInput.files || []);
        imagePreview.style.display = selectedInspectionImages.length ? 'grid' : 'none';
        updateImagePreview();

        if (pendingOpenLocationModalAfterImage) {
            pendingOpenLocationModalAfterImage = false;

            if (selectedInspectionImages.length) {
                itemDescriptionModal.style.display = 'flex';
                setTimeout(() => document.getElementById('item-name-input').focus(), 50);
            } else if (!editingInspectionItem) {
                errorBox.textContent = 'Take a picture first.';
            }
        }
    });

    document.getElementById('btn-see-inspection-images').addEventListener('click', () => {
        if (!selectedInspectionImages.length) {
            itemDescriptionError.textContent = editingInspectionItem
                ? 'Existing image is kept. Retake only if needed.'
                : 'No image selected.';
            return;
        }

        itemDescriptionError.textContent = '';
        imagePreview.style.display = imagePreview.style.display === 'grid' ? 'none' : 'grid';
    });

    document.getElementById('btn-save-item-description').addEventListener('click', () => {
        itemDescriptionError.textContent = '';

        const itemName = document.getElementById('item-name-input').value.trim();

        if (!editingInspectionItem && !selectedInspectionImages.length) {
            itemDescriptionError.textContent = 'Take a picture first.';
            return;
        }

        if (!itemName) {
            itemDescriptionError.textContent = 'Enter item description.';
            return;
        }

        itemDescriptionModal.style.display = 'none';

        if (editingInspectionItem) {
            loadLocationStepForEdit(editingInspectionItem);
        } else {
            resetLocationStep();
        }

        locationModal.style.display = 'flex';
        setTimeout(() => document.getElementById('location-name-input').focus(), 50);
    });

    document.getElementById('btn-cancel-item-description-modal').addEventListener('click', () => {
        pendingOpenLocationModalAfterImage = false;
        itemDescriptionModal.style.display = 'none';
        editingInspectionItem = null;
        clearLocationModal();
    });

    document.getElementById('btn-save-location-step').addEventListener('click', () => {
        locationModalError.textContent = '';

        const locationInput = document.getElementById('location-name-input');
        const locationValue = locationInput.value.trim();

        if (!locationValue) {
            locationModalError.textContent = 'Enter location.';
            return;
        }

        if (currentLocationType === 'room' && !/^\d+$/.test(locationValue)) {
            locationModalError.textContent = 'Room must be numbers only.';
            return;
        }

        if (currentLocationType === 'common') {
            locationInput.value = formatCommonAreaLocation(locationValue);
        }

        locationModal.style.display = 'none';

        if (editingInspectionItem) {
            loadStatusStepForEdit(editingInspectionItem);
        } else {
            resetStatusStep();
        }

        statusModal.style.display = 'flex';
    });

    document.getElementById('btn-cancel-location-modal').addEventListener('click', () => {
        pendingOpenLocationModalAfterImage = false;
        locationModal.style.display = 'none';
        itemDescriptionModal.style.display = 'flex';
        locationModalError.textContent = '';
    });

    document.getElementById('btn-start-project-from-fail').addEventListener('click', async () => {
        await saveFailAndStartProject();
    });

    document.getElementById('btn-save-location-add-another').addEventListener('click', async () => {
        const saved = await saveLocationItem();
        if (!saved) return;

        statusModal.style.display = 'none';
        clearLocationModal();
        successBox.textContent = 'Item saved.';
        errorBox.textContent = '';

        reloadInspectionView();
    });

    document.getElementById('btn-save-location-finish').addEventListener('click', async () => {
        const saved = await saveLocationItem();
        if (!saved) return;

        statusModal.style.display = 'none';
        await finishInspection();
    });

    document.getElementById('btn-cancel-status-modal').addEventListener('click', () => {
        statusModal.style.display = 'none';
        locationModal.style.display = 'flex';
        statusModalError.textContent = '';
    });

    document.querySelectorAll('.btn-continue-inspection-session').forEach(button => {
        button.addEventListener('click', () => {
            const sessionId = button.dataset.id;
            const session = sessions.find(item => String(item.id) === String(sessionId));

            if (!session) {
                alert('Could not load saved inspection.');
                return;
            }

            session.status = 'open';
            loadSavedInspection(session);

            updateInspectionSession(session.id, {
                status: 'open'
            }).then(({ error }) => {
                if (error) {
                    console.error('Reopen inspection session error:', error);
                }
            });

            openCameraForNextInspectionItem();
        });
    });

    document.querySelectorAll('.btn-open-inspection-item-dashboard').forEach(button => {
        button.addEventListener('click', () => {
            const itemId = button.dataset.itemId;
            const item = allSavedItems.find(savedItem => String(savedItem.id) === String(itemId));

            if (!item) {
                alert('Could not load item.');
                return;
            }

            const session = sessions.find(savedSession => String(savedSession.id) === String(item.inspection_session_id));

            if (!session) {
                alert('Could not load saved inspection.');
                return;
            }

            openInspectionItemDashboard(session, item);
        });

        button.addEventListener('keydown', event => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            button.click();
        });
    });

    document.getElementById('btn-dashboard-edit-item').addEventListener('click', () => {
        itemDashboardModal.style.display = 'none';
        openEditInspectionItem(dashboardInspectionSession, dashboardInspectionItem);
    });

    document.getElementById('btn-dashboard-change-status').addEventListener('click', () => {
        if (!dashboardInspectionSession || !dashboardInspectionItem) {
            itemDashboardError.textContent = 'Could not load item.';
            return;
        }

        itemDashboardModal.style.display = 'none';

        activeSession = dashboardInspectionSession;
        editingInspectionItem = dashboardInspectionItem;

        inspectedByInput.value = dashboardInspectionSession.inspected_by || appUser.display_name;
        sessionNotesInput.value = dashboardInspectionSession.session_notes || '';
        showActiveSessionUi();

        document.getElementById('item-name-input').value = dashboardInspectionItem.item_name || '';
        document.getElementById('location-notes-input').value = dashboardInspectionItem.notes || '';
        loadLocationStepForEdit(dashboardInspectionItem);
        loadStatusStepForEdit(dashboardInspectionItem);

        statusModal.style.display = 'flex';
    });

    document.getElementById('btn-dashboard-start-project').addEventListener('click', () => {
        startProjectFromExistingItem(dashboardInspectionSession, dashboardInspectionItem);
    });

    document.getElementById('btn-dashboard-project-update').addEventListener('click', () => {
        addProjectUpdateFromExistingItem(dashboardInspectionSession, dashboardInspectionItem);
    });

    document.getElementById('btn-dashboard-delete-item').addEventListener('click', async () => {
        if (!dashboardInspectionItem?.id) {
            itemDashboardError.textContent = 'Could not load item.';
            return;
        }

        if (!confirm('Delete this inspection item?')) return;

        const { error } = await deleteInspectionSessionItem(dashboardInspectionItem.id);

        if (error) {
            console.error('Delete inspection item error:', error);
            itemDashboardError.textContent = 'Could not delete item.';
            return;
        }

        itemDashboardModal.style.display = 'none';
        reloadInspectionView();
    });

    document.getElementById('btn-close-item-dashboard').addEventListener('click', () => {
        itemDashboardModal.style.display = 'none';
        dashboardInspectionItem = null;
        dashboardInspectionSession = null;
    });

    document.querySelectorAll('.btn-delete-inspection-session').forEach(button => {
        button.addEventListener('click', async () => {
            if (!confirm('Delete this whole inspection?')) return;

            const { error } = await deleteInspectionSession(button.dataset.id);

            if (error) {
                console.error('Delete inspection session error:', error);
                alert('Could not delete inspection.');
                return;
            }

            reloadInspectionView();
        });
    });

    document.querySelectorAll('.btn-view-inspection-report').forEach(button => {
        button.addEventListener('click', async () => {
            const sessionId = button.dataset.id;
            const session = sessions.find(item => String(item.id) === String(sessionId));

            const { data, error } = await fetchInspectionSessionItems(sessionId);

            if (error) {
                console.error('Fetch inspection report items error:', error);
                alert('Could not load report.');
                return;
            }

       const filteredReportItems = (data || []).filter(item => {
    const itemSessionId = String(item?.inspection_session_id || '');
    const itemFacilityId = String(item?.facilities_id || '');

    return itemSessionId === String(sessionId) &&
        (!itemFacilityId || itemFacilityId === String(facilitiesId));
});

const reportItems = [];

for (const item of filteredReportItems) {
                const imageResponse = await fetchInspectionImages(item.id);

                if (imageResponse.error) {
                    console.error('Fetch inspection images error:', imageResponse.error);
                }

                reportItems.push({
                    item,
                    images: imageResponse.data || []
                });
            }

            currentReportText = [
                `INSPECTION REPORT`,
                ``,
                `Facility: ${facilityName}`,
                `Date: ${formatDate(session?.created_at)}`,
                `Inspected By: ${session?.inspected_by || ''}`,
                session?.inspected_by_role ? `Role: ${session.inspected_by_role}` : ``,
                ``,
                `Status: ${session?.status || ''}`,
                ``,
                `Inspection Name / Purpose:`,
                `${session?.session_notes || ''}`,
                ``,
                `ITEMS INSPECTED:`,
                ``,
                ...reportItems.map((entry, index) => {
                    const item = entry.item;
                    const images = entry.images || [];
                    const reasons = Array.isArray(item.fail_reasons) ? item.fail_reasons : [];
                    const imageLines = images.length
    ? [
        `Photos: ${images.length} image(s) saved.`
    ]
    : [
        `Photos: No photos saved.`
    ];

                    return [
                        `${index + 1}. ${item.location_name || ''}`,
                        item.inspected_by_name ? `Inspector: ${item.inspected_by_name}` : ``,
                        `Item: ${item.item_name || ''}`,
                        `Result: ${String(item.result || '').toUpperCase()}`,
                        reasons.length ? `Fail Reasons: ${reasons.join('; ')}` : `Fail Reasons:`,
                        `Notes: ${item.notes || ''}`,
                        ...imageLines,
                        ``
                    ].join('\n');
                })
            ].filter(line => line !== '').join('\n');

            document.getElementById('inspection-report-content').textContent = currentReportText;
            reportModal.style.display = 'flex';
        });
    });

    document.getElementById('btn-text-inspection-report').addEventListener('click', () => {
        textCurrentReport();
    });

    document.getElementById('btn-email-inspection-report').addEventListener('click', () => {
        emailCurrentReport();
    });

    document.getElementById('btn-print-inspection-report').addEventListener('click', () => {
        printCurrentReport();
    });

    document.getElementById('btn-close-inspection-report').addEventListener('click', () => {
        reportModal.style.display = 'none';
    });

    document.getElementById('btn-back-facility-detail').addEventListener('click', () => {
        if (window.navigateTo) {
            window.navigateTo('facilities-details', context);
        }
    });
}
