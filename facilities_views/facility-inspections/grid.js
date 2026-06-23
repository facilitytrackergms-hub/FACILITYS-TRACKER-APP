/* ================================================================
   FACILITY TRACKER MODULAR VIEW SYSTEM
   PURPOSE: Facility Inspections Grid
   LOCATION: /facilities_views/facility-inspections/grid.js
   VERSION: v2026_06_23_popup_images_fail_project
   UPDATED: 2026-06-23
================================================================ */

import {
    createInspectionSession,
    updateInspectionSession,
    fetchInspectionSessions,
    deleteInspectionSession,
    createInspectionSessionItem,
    fetchInspectionSessionItems,
    createInspectionImage
} from './data.js';

import { uploadImage } from '../../global_engine/imageHandler.js';

function escapeHtml(value) {
    return String(value || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function getFacilitiesId(context) {
    return context?.facilities_id || context?.facility_id || context?.facilityId || context?.location_id || context?.id || null;
}

function getFacilityName(context) {
    return context?.abbreviation || context?.number_name || context?.name || 'Facility';
}

function formatDate(value) {
    if (!value) return '';
    return new Date(value).toLocaleString();
}

let activeSession = null;
let currentResult = 'pass';
let selectedInspectionImages = [];

export async function render(containerId, context = {}) {
    await renderFacilityInspectionsGrid(containerId, context);
}

export async function renderFacilityInspectionsGrid(containerId, context = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const facilitiesId = getFacilitiesId(context);
    const facilityName = getFacilityName(context);

    if (!facilitiesId) {
        container.innerHTML = `<p style="color:red;text-align:center;">Missing facility ID.</p>`;
        return;
    }

    activeSession = null;
    currentResult = 'pass';
    selectedInspectionImages = [];

    const sessionsResponse = await fetchInspectionSessions(facilitiesId);
    const sessions = sessionsResponse.data || [];

    container.innerHTML = `
        <style>
            .inspection-card {
                background:#ffffff;
                max-width:350px;
                margin:16px auto;
                padding:18px;
                border-radius:14px;
                box-shadow:0 4px 18px rgba(0,0,0,0.08);
                text-align:center;
            }

            .inspection-title {
                color:#003b73;
                font-size:24px;
                font-weight:bold;
                margin-bottom:2px;
            }

            .inspection-subtitle {
                color:#003b73;
                font-size:13px;
                font-weight:bold;
                margin-bottom:16px;
                letter-spacing:2px;
            }

            .inspection-box {
                border:1px solid #d6dee8;
                border-radius:10px;
                padding:12px;
                text-align:left;
                margin-bottom:14px;
                background:#f8fbff;
            }

            .inspection-label {
                color:#003b73;
                font-size:12px;
                font-weight:bold;
                margin-top:10px;
                margin-bottom:4px;
            }

            .inspection-input,
            .inspection-textarea {
                width:100%;
                padding:10px;
                border:1px solid #bbb;
                border-radius:6px;
                font-size:15px;
                box-sizing:border-box;
            }

            .inspection-textarea {
                min-height:75px;
                resize:vertical;
            }

            .inspection-main-btn {
                background:#003b73;
                color:white;
                border:none;
                border-radius:4px;
                width:100%;
                min-height:54px;
                font-size:15px;
                font-weight:bold;
                cursor:pointer;
                margin-top:8px;
            }

            .inspection-action-grid {
                display:grid;
                grid-template-columns:1fr 1fr;
                gap:8px;
                margin-top:10px;
            }

            .inspection-square-btn {
                color:white;
                border:none;
                border-radius:4px;
                min-height:58px;
                font-size:13px;
                font-weight:bold;
                cursor:pointer;
                width:100%;
                padding:8px 6px;
            }

            .inspection-btn-blue {
                background:#003b73;
            }

            .inspection-btn-green {
                background:#16a34a;
            }

            .inspection-btn-gray {
                background:#747d8c;
            }

            .inspection-btn-dark {
                background:#111827;
            }

            .inspection-btn-orange {
                background:#ea580c;
            }

            .inspection-btn-purple {
                background:#6d28d9;
            }

            .inspection-small-btn {
                background:#00509d;
                color:white;
                border:none;
                border-radius:4px;
                min-height:44px;
                font-size:13px;
                font-weight:bold;
                cursor:pointer;
                width:100%;
            }

            .inspection-two-row {
                display:grid;
                grid-template-columns:1fr 1fr;
                gap:8px;
                margin-top:8px;
            }

            .inspection-pass-btn {
                background:#16a34a;
                color:white;
                border:none;
                border-radius:4px;
                min-height:50px;
                font-size:15px;
                font-weight:bold;
                cursor:pointer;
            }

            .inspection-fail-btn {
                background:#dc2626;
                color:white;
                border:none;
                border-radius:4px;
                min-height:50px;
                font-size:15px;
                font-weight:bold;
                cursor:pointer;
            }

            .inspection-pass-btn.active,
            .inspection-fail-btn.active {
                outline:4px solid #facc15;
            }

            .inspection-back-btn {
                background:#747d8c;
                color:white;
                border:none;
                border-radius:4px;
                width:100%;
                min-height:48px;
                font-size:15px;
                font-weight:bold;
                cursor:pointer;
                margin-top:12px;
            }

            .inspection-delete-btn {
                background:#7f1d1d;
                color:yellow;
                border:none;
                border-radius:4px;
                padding:9px;
                font-weight:bold;
                cursor:pointer;
                width:100%;
                min-height:44px;
            }

            .inspection-record {
                border:1px solid #d6dee8;
                border-radius:10px;
                padding:10px;
                margin-top:8px;
                background:white;
            }

            .inspection-record-title {
                color:#003b73;
                font-size:14px;
                font-weight:bold;
            }

            .inspection-record-value {
                color:#111827;
                font-size:12px;
                margin-top:3px;
            }

            .inspection-record-actions {
                display:grid;
                grid-template-columns:1fr 1fr;
                gap:8px;
                margin-top:8px;
            }

            .inspection-record-delete {
                grid-column:1 / 3;
            }

            .inspection-error {
                color:red;
                font-size:13px;
                text-align:center;
                min-height:18px;
                margin-top:10px;
            }

            .inspection-success {
                color:#16a34a;
                font-size:13px;
                text-align:center;
                min-height:18px;
                margin-top:10px;
                font-weight:bold;
            }

            .inspection-image-count {
                color:#003b73;
                font-size:12px;
                font-weight:bold;
                text-align:center;
                margin-top:8px;
                min-height:16px;
            }

            .inspection-image-preview {
                display:none;
                grid-template-columns:1fr 1fr;
                gap:8px;
                margin-top:8px;
            }

            .inspection-image-preview img {
                width:100%;
                height:90px;
                object-fit:cover;
                border-radius:6px;
                border:1px solid #d6dee8;
            }

            .inspection-version-tag {
                border-top:1px solid #d6dee8;
                margin-top:18px;
                padding-top:10px;
                font-size:10px;
                color:#7d8ba0;
                text-align:center;
            }

            .inspection-modal-backdrop {
                position:fixed;
                inset:0;
                background:rgba(0,0,0,0.45);
                display:none;
                align-items:center;
                justify-content:center;
                z-index:9999;
            }

            .inspection-modal {
                background:white;
                width:90%;
                max-width:360px;
                border-radius:12px;
                padding:18px;
                box-shadow:0 4px 18px rgba(0,0,0,0.25);
                text-align:left;
                max-height:90vh;
                overflow-y:auto;
            }

            .inspection-modal h3 {
                margin:0 0 14px;
                text-align:center;
                color:#003b73;
            }

            .inspection-report-area {
                border:1px solid #d6dee8;
                border-radius:10px;
                padding:10px;
                background:#f8fbff;
                white-space:pre-wrap;
                font-size:13px;
                color:#111827;
            }
        </style>

        <div class="inspection-card">
            <div class="inspection-title">Inspections</div>
            <div class="inspection-subtitle">${escapeHtml(facilityName)}</div>

            <div class="inspection-box">
                <div class="inspection-label">INSPECTED BY</div>
                <input id="inspection-inspected-by" class="inspection-input" type="text" placeholder="Your name">

                <div class="inspection-label">INSPECTION NOTES</div>
                <textarea id="inspection-session-notes" class="inspection-textarea" placeholder="General notes for this inspection"></textarea>

                <button id="btn-start-inspection" class="inspection-main-btn">START INSPECTION</button>

                <div id="inspection-active-actions" class="inspection-action-grid" style="display:none;">
                    <button id="btn-add-location-to-inspect" class="inspection-square-btn inspection-btn-blue">ADD LOCATION</button>
                    <button id="btn-save-progress-inspection" class="inspection-square-btn inspection-btn-dark">SAVE PROGRESS</button>
                    <button id="btn-finish-later-inspection" class="inspection-square-btn inspection-btn-gray">SAVE &amp; FINISH LATER</button>
                    <button id="btn-finish-active-inspection" class="inspection-square-btn inspection-btn-green">FINISH INSPECTION</button>
                </div>

                <div id="inspection-success" class="inspection-success"></div>
                <div id="inspection-error" class="inspection-error"></div>
            </div>

            <div class="inspection-box">
                <div class="inspection-label">SAVED INSPECTIONS</div>

                ${sessions.length ? sessions.map(session => `
                    <div class="inspection-record">
                        <div class="inspection-record-title">
                            ${escapeHtml(formatDate(session.created_at))}
                        </div>
                        <div class="inspection-record-value">
                            Inspected By: ${escapeHtml(session.inspected_by || '')}
                        </div>
                        <div class="inspection-record-value">
                            Status: ${escapeHtml(session.status || '')}
                        </div>

                        <div class="inspection-record-actions">
                            <button class="inspection-small-btn btn-continue-inspection-session" data-id="${session.id}">CONTINUE / EDIT</button>
                            <button class="inspection-small-btn btn-view-inspection-report" data-id="${session.id}">VIEW REPORT</button>
                            <button class="inspection-delete-btn inspection-record-delete btn-delete-inspection-session" data-id="${session.id}">🗑 Delete</button>
                        </div>
                    </div>
                `).join('') : `
                    <div class="inspection-record-value">No inspections saved yet.</div>
                `}
            </div>

            <button id="btn-back-facility-detail" class="inspection-back-btn">⬅️ BACK</button>

            <div class="inspection-version-tag">facility-inspections/grid.js | v2026_06_23_popup_images_fail_project</div>
        </div>

        <div id="inspection-location-modal-backdrop" class="inspection-modal-backdrop">
            <div class="inspection-modal">
                <h3>Add Location</h3>

                <div class="inspection-label">LOCATION / ROOM NUMBER</div>
                <input id="location-name-input" class="inspection-input" type="text" placeholder="Room 201, Dining Room, Hallway">

                <div class="inspection-label">ITEM INSPECTED</div>
                <input id="item-name-input" class="inspection-input" type="text" placeholder="PTAC, Sink, Toilet, Door">

                <div class="inspection-label">RESULT</div>
                <div class="inspection-two-row">
                    <button id="btn-popup-pass" class="inspection-pass-btn active">PASS</button>
                    <button id="btn-popup-fail" class="inspection-fail-btn">FAIL</button>
                </div>

                <div id="fail-reasons-area" style="display:none;">
                    <div class="inspection-label">FAIL REASONS</div>
                    <div id="fail-reasons-list"></div>
                    <button id="btn-add-fail-reason" class="inspection-small-btn" type="button" style="margin-top:8px;">ADD FAIL REASON</button>

                    <div class="inspection-action-grid">
                        <button id="btn-start-project-from-fail" class="inspection-square-btn inspection-btn-orange" type="button">START PROJECT</button>
                        <button id="btn-save-fail-only" class="inspection-square-btn inspection-btn-dark" type="button">SAVE FAIL ONLY</button>
                    </div>
                </div>

                <div class="inspection-label">NOTES FOR THIS LOCATION</div>
                <textarea id="location-notes-input" class="inspection-textarea"></textarea>

                <div class="inspection-label">LOCATION IMAGES</div>
                <input id="inspection-image-input" type="file" accept="image/*" capture="environment" multiple style="display:none;">

                <div class="inspection-action-grid">
                    <button id="btn-take-inspection-image" class="inspection-square-btn inspection-btn-purple" type="button">TAKE IMAGE</button>
                    <button id="btn-see-inspection-images" class="inspection-square-btn inspection-btn-blue" type="button">SEE IMAGES</button>
                </div>

                <div id="inspection-image-count" class="inspection-image-count">No images selected.</div>
                <div id="inspection-image-preview" class="inspection-image-preview"></div>

                <div class="inspection-action-grid">
                    <button id="btn-save-location-add-another" class="inspection-square-btn inspection-btn-blue">ADD ANOTHER</button>
                    <button id="btn-save-location-finish" class="inspection-square-btn inspection-btn-green">FINISH</button>
                </div>

                <button id="btn-cancel-location-modal" class="inspection-back-btn">CANCEL</button>

                <div id="location-modal-error" class="inspection-error"></div>

                <div class="inspection-version-tag">facility-inspections/grid.js | v2026_06_23_popup_images_fail_project</div>
            </div>
        </div>

        <div id="inspection-report-modal-backdrop" class="inspection-modal-backdrop">
            <div class="inspection-modal">
                <h3>Inspection Report</h3>
                <div id="inspection-report-content" class="inspection-report-area"></div>
                <button id="btn-print-inspection-report" class="inspection-main-btn">PRINT REPORT</button>
                <button id="btn-close-inspection-report" class="inspection-back-btn">CLOSE</button>
                <div class="inspection-version-tag">facility-inspections/grid.js | v2026_06_23_popup_images_fail_project</div>
            </div>
        </div>
    `;

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

    function updateImagePreview() {
        imageCount.textContent = selectedInspectionImages.length
            ? `${selectedInspectionImages.length} image(s) selected.`
            : 'No images selected.';

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

    async function startInspectionIfNeeded() {
        clearMainMessages();

        if (activeSession) return activeSession;

        const inspectedBy = inspectedByInput.value.trim();
        const sessionNotes = sessionNotesInput.value.trim();

        if (!inspectedBy) {
            errorBox.textContent = 'Enter inspected by.';
            return null;
        }

        const payload = {
            facilities_id: facilitiesId,
            inspected_by: inspectedBy,
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
        successBox.textContent = 'Inspection started. You can save and continue later.';
        showActiveSessionUi();

        return activeSession;
    }

    async function saveInspectionProgress(leaveAfterSave = false) {
        const session = await startInspectionIfNeeded();
        if (!session) return false;

        const { error } = await updateInspectionSession(session.id, {
            status: 'open',
            inspected_by: inspectedByInput.value.trim(),
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
        inspectedByInput.value = session.inspected_by || '';
        sessionNotesInput.value = session.session_notes || '';

        showActiveSessionUi();

        successBox.textContent = 'Saved inspection loaded. Keep adding locations or finish it.';
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
                image_url: imageUrl,
                caption: `${savedItem.location_name || ''} - ${savedItem.item_name || ''}`,
                uploaded_by: inspectedByInput.value.trim()
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

        const session = await startInspectionIfNeeded();
        if (!session) return null;

        const locationName = document.getElementById('location-name-input').value.trim();
        const itemName = document.getElementById('item-name-input').value.trim();
        const notes = document.getElementById('location-notes-input').value.trim();
        const failReasons = getFailReasons();

        if (!locationName) {
            modalError.textContent = 'Enter location or room number.';
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

        const payload = {
            inspection_session_id: session.id,
            facilities_id: facilitiesId,
            location_name: locationName,
            item_name: itemName,
            result: currentResult,
            fail_reasons: failReasons,
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
        const session = await startInspectionIfNeeded();
        if (!session) return false;

        const { error } = await updateInspectionSession(session.id, {
            status: 'finished',
            inspected_by: inspectedByInput.value.trim(),
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
                    requested_by_name: inspectedByInput.value.trim(),
                    requested_by_title: 'Inspector',
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

    startButton.addEventListener('click', async () => {
        await startInspectionIfNeeded();
    });

    addLocationButton.addEventListener('click', async () => {
        const session = await startInspectionIfNeeded();
        if (!session) return;

        clearLocationModal();
        locationModal.style.display = 'flex';
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
        imageInput.click();
    });

    imageInput.addEventListener('change', () => {
        selectedInspectionImages = Array.from(imageInput.files || []);
        imagePreview.style.display = 'none';
        updateImagePreview();
    });

    document.getElementById('btn-see-inspection-images').addEventListener('click', () => {
        if (!selectedInspectionImages.length) {
            modalError.textContent = 'No images selected.';
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

        clearLocationModal();
        modalError.style.color = '#16a34a';
        modalError.textContent = 'Failed item saved. Add next location.';
    });

    document.getElementById('btn-save-location-add-another').addEventListener('click', async () => {
        const saved = await saveLocationItem();
        if (!saved) return;

        clearLocationModal();
        modalError.style.color = '#16a34a';
        modalError.textContent = 'Saved. Add next location.';
    });

    document.getElementById('btn-save-location-finish').addEventListener('click', async () => {
        const saved = await saveLocationItem();
        if (!saved) return;

        locationModal.style.display = 'none';
        await finishInspection();
    });

    document.getElementById('btn-cancel-location-modal').addEventListener('click', () => {
        locationModal.style.display = 'none';
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

            const reportText = [
                `INSPECTION REPORT`,
                ``,
                `Facility: ${facilityName}`,
                `Date: ${formatDate(session?.created_at)}`,
                `Inspected By: ${session?.inspected_by || ''}`,
                `Status: ${session?.status || ''}`,
                ``,
                `General Notes:`,
                `${session?.session_notes || ''}`,
                ``,
                `LOCATIONS INSPECTED:`,
                ``,
                ...(data || []).map((item, index) => {
                    const reasons = Array.isArray(item.fail_reasons) ? item.fail_reasons : [];
                    return [
                        `${index + 1}. ${item.location_name || ''}`,
                        `Item: ${item.item_name || ''}`,
                        `Result: ${String(item.result || '').toUpperCase()}`,
                        reasons.length ? `Fail Reasons: ${reasons.join('; ')}` : `Fail Reasons:`,
                        `Notes: ${item.notes || ''}`,
                        ``
                    ].join('\n');
                })
            ].join('\n');

            document.getElementById('inspection-report-content').textContent = reportText;
            reportModal.style.display = 'flex';
        });
    });

    document.getElementById('btn-print-inspection-report').addEventListener('click', () => {
        window.print();
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
