/* ================================================================
   FACILITY TRACKER MODULAR VIEW SYSTEM
   PURPOSE: Facility Inspections Grid Controller
   LOCATION: /facilities_views/facility-inspections/grid.js
   VERSION: v2026_06_24_grid_ui_split_saved_card_details
   UPDATED: 2026-06-24
================================================================ */

import {
    createInspectionSession,
    updateInspectionSession,
    fetchInspectionSessions,
    deleteInspectionSession,
    createInspectionSessionItem,
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

async function fetchSavedSessionItemsBySessionId(sessions = []) {
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

        itemsBySessionId[sessionId] = data || [];
    }

    return itemsBySessionId;
}

let activeSession = null;
let currentResult = 'pass';
let selectedInspectionImages = [];
let pendingOpenLocationModalAfterImage = false;
let currentReportText = '';

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

    const sessionsResponse = await fetchInspectionSessions(facilitiesId);
    const sessions = sessionsResponse.data || [];
    const sessionItemsBySessionId = await fetchSavedSessionItemsBySessionId(sessions);

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

    const locationModal = document.getElementById('inspection-location-modal-backdrop');
    const reportModal = document.getElementById('inspection-report-modal-backdrop');
    const modalError = document.getElementById('location-modal-error');

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

    function getSessionInspectorName() {
        return activeSession?.inspected_by || inspectedByInput.value.trim() || appUser.display_name;
    }

    function getSessionInspectorUserId() {
        return activeSession?.inspected_by_user_id || appUser.auth_user_id;
    }

    function getSessionInspectorRole() {
        return activeSession?.inspected_by_role || appUser.role || 'inspector';
    }

    function updateImagePreview() {
        imageCount.textContent = selectedInspectionImages.length
            ? `${selectedInspectionImages.length} image(s) selected.`
            : 'Take a picture before saving.';

        imagePreview.innerHTML = selectedInspectionImages.map(file => `
            <img src="${URL.createObjectURL(file)}" alt="Inspection image">
        `).join('');
    }

    function clearLocationModal() {
        document.getElementById('location-name-input').value = '';
        document.getElementById('item-name-input').value = '';
        document.getElementById('location-notes-input').value = '';
        failReasonsList.innerHTML = '';
        modalError.textContent = '';
        modalError.style.color = 'red';
        currentResult = 'pass';
        selectedInspectionImages = [];
        imageInput.value = '';
        imagePreview.style.display = 'none';
        updateImagePreview();
        popupPassButton.classList.add('active');
        popupFailButton.classList.remove('active');
        failReasonsArea.style.display = 'none';
    }

    function showActiveSessionUi() {
        startButton.style.display = 'none';
        activeActions.style.display = 'grid';
    }

    function openCameraForNextInspectionItem() {
        clearMainMessages();

        if (!appUser?.display_name) {
            errorBox.textContent = 'Login user not found.';
            return;
        }

        clearLocationModal();
        pendingOpenLocationModalAfterImage = true;
        imageInput.click();
    }

    async function startInspectionIfNeeded() {
        clearMainMessages();

        if (activeSession) return activeSession;

        const sessionNotes = sessionNotesInput.value.trim();

        const payload = {
            facilities_id: facilitiesId,
            inspected_by: appUser.display_name,
            inspected_by_user_id: appUser.auth_user_id,
            inspected_by_role: appUser.role || 'inspector',
            session_notes: sessionNotes,
            status: 'open'
        };

        const { data, error } = await createInspectionSession(payload);

        if (error) {
            console.error('Create inspection session error:', error);
            errorBox.textContent = 'Could not start inspection.';
            return null;
        }

        activeSession = data;
        inspectedByInput.value = data.inspected_by || appUser.display_name;
        successBox.textContent = 'Inspection started. You can save and continue later.';
        showActiveSessionUi();

        return activeSession;
    }

    async function saveInspectionProgress(leaveAfterSave = false) {
        if (!activeSession) {
            errorBox.textContent = 'Start with a picture first.';
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

        successBox.textContent = 'Saved inspection loaded. Add the next item by taking a picture.';
        errorBox.textContent = '';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function getFailReasons() {
        const inputs = document.querySelectorAll('.fail-reason-input');
        return Array.from(inputs)
            .map(input => input.value.trim())
            .filter(value => value);
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
        modalError.textContent = '';
        modalError.style.color = 'red';

        const locationName = document.getElementById('location-name-input').value.trim();
        const itemName = document.getElementById('item-name-input').value.trim();
        const notes = document.getElementById('location-notes-input').value.trim();
        const failReasons = getFailReasons();

        if (!selectedInspectionImages.length) {
            modalError.textContent = 'Take a picture first.';
            return null;
        }

        if (!locationName) {
            modalError.textContent = 'Enter location, room, or common area.';
            return null;
        }

        if (!itemName) {
            modalError.textContent = 'Enter item inspected.';
            return null;
        }

        if (currentResult === 'fail' && !failReasons.length) {
            modalError.textContent = 'Enter at least one fail reason.';
            return null;
        }

        if (!appUser?.display_name) {
            modalError.textContent = 'Login user not found.';
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

        const { data, error } = await createInspectionSessionItem(payload);

        if (error) {
            console.error('Create inspection session item error:', error);
            modalError.textContent = 'Could not save this location.';
            return null;
        }

        const imagesSaved = await uploadSelectedImages(data);

        if (!imagesSaved) {
            modalError.textContent = 'Location saved, but image record failed.';
            return data;
        }

        return data;
    }

    async function finishInspection() {
        if (!activeSession) {
            errorBox.textContent = 'Start with a picture first.';
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

        if (window.navigateTo) {
            window.navigateTo('facility-inspections', context);
        }

        return true;
    }

    async function saveFailAndStartProject() {
        if (currentResult !== 'fail') {
            modalError.textContent = 'Select FAIL before starting a project.';
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
        openCameraForNextInspectionItem();
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

    popupPassButton.addEventListener('click', () => {
        currentResult = 'pass';
        popupPassButton.classList.add('active');
        popupFailButton.classList.remove('active');
        failReasonsArea.style.display = 'none';
        failReasonsList.innerHTML = '';
        modalError.textContent = '';
    });

    popupFailButton.addEventListener('click', () => {
        currentResult = 'fail';
        popupFailButton.classList.add('active');
        popupPassButton.classList.remove('active');
        failReasonsArea.style.display = 'block';
        modalError.textContent = '';

        if (!document.querySelector('.fail-reason-input')) {
            failReasonsList.innerHTML = `
                <input class="inspection-input fail-reason-input" type="text" placeholder="Reason 1" style="margin-top:8px;">
            `;
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
        pendingOpenLocationModalAfterImage = false;
        imageInput.click();
    });

    imageInput.addEventListener('change', () => {
        selectedInspectionImages = Array.from(imageInput.files || []);
        imagePreview.style.display = selectedInspectionImages.length ? 'grid' : 'none';
        updateImagePreview();

        if (pendingOpenLocationModalAfterImage) {
            pendingOpenLocationModalAfterImage = false;

            if (selectedInspectionImages.length) {
                locationModal.style.display = 'flex';
            } else {
                errorBox.textContent = 'Take a picture first.';
            }
        }
    });

    document.getElementById('btn-see-inspection-images').addEventListener('click', () => {
        if (!selectedInspectionImages.length) {
            modalError.textContent = 'No image selected.';
            return;
        }

        modalError.textContent = '';
        imagePreview.style.display = imagePreview.style.display === 'grid' ? 'none' : 'grid';
    });

    document.getElementById('btn-start-project-from-fail').addEventListener('click', async () => {
        await saveFailAndStartProject();
    });

    document.getElementById('btn-save-fail-only').addEventListener('click', async () => {
        const saved = await saveLocationItem();
        if (!saved) return;

        locationModal.style.display = 'none';
        clearLocationModal();
        successBox.textContent = 'Failed item saved.';
        errorBox.textContent = '';
    });

    document.getElementById('btn-save-location-add-another').addEventListener('click', async () => {
        const saved = await saveLocationItem();
        if (!saved) return;

        locationModal.style.display = 'none';
        clearLocationModal();
        successBox.textContent = 'Saved. Take the next picture.';
        errorBox.textContent = '';

        pendingOpenLocationModalAfterImage = true;
        imageInput.click();
    });

    document.getElementById('btn-save-location-finish').addEventListener('click', async () => {
        const saved = await saveLocationItem();
        if (!saved) return;

        locationModal.style.display = 'none';
        await finishInspection();
    });

    document.getElementById('btn-cancel-location-modal').addEventListener('click', () => {
        pendingOpenLocationModalAfterImage = false;
        locationModal.style.display = 'none';
        clearLocationModal();
    });

    document.querySelectorAll('.btn-continue-inspection-session').forEach(button => {
        button.addEventListener('click', async () => {
            const sessionId = button.dataset.id;
            const session = sessions.find(item => String(item.id) === String(sessionId));

            if (!session) {
                alert('Could not load saved inspection.');
                return;
            }

            const { error } = await updateInspectionSession(session.id, {
                status: 'open'
            });

            if (error) {
                console.error('Reopen inspection session error:', error);
                alert('Could not reopen inspection.');
                return;
            }

            session.status = 'open';
            loadSavedInspection(session);
        });
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

            if (window.navigateTo) {
                window.navigateTo('facility-inspections', context);
            }
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

            const reportItems = [];

            for (const item of data || []) {
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
                `General Notes:`,
                `${session?.session_notes || ''}`,
                ``,
                `LOCATIONS INSPECTED:`,
                ``,
                ...reportItems.map((entry, index) => {
                    const item = entry.item;
                    const images = entry.images || [];
                    const reasons = Array.isArray(item.fail_reasons) ? item.fail_reasons : [];
                    const imageLines = images.length
                        ? [
                            `Photos:`,
                            ...images.map((image, imageIndex) => `Photo ${imageIndex + 1}: ${image.image_url || ''}`)
                        ]
                        : [
                            `Photos:`
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
