/* ================================================================
   FACILITY TRACKER MODULAR VIEW SYSTEM
   PURPOSE: Facility Inspections Grid
   LOCATION: /facilities_views/facility-inspections/grid.js
   VERSION: v2026_06_23_facility_level_inspections
   UPDATED: 2026-06-23
================================================================ */

import { supabase } from '../../global_engine/supabaseClient.js';

import {
    fetchInspectionLocations,
    createInspectionLocation,
    fetchInspectionItems,
    createInspectionItem,
    createInspection,
    deleteInspection,
    fetchInspectionImages,
    createInspectionImage,
    deleteInspectionImage
} from './data.js';

function escapeHtml(value) {
    return String(value || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function getProjectId(context) {
    return context?.project_id || context?.projectId || null;
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

async function fetchFacilityInspections(facilitiesId) {
    return await supabase
        .from('inspections')
        .select('*')
        .eq('facilities_id', facilitiesId)
        .order('created_at', { ascending: false });
}

let currentResult = 'passed';
let currentSavedInspectionId = null;
let currentSavedInspection = null;

export async function render(containerId, context = {}) {
    await renderFacilityInspectionsGrid(containerId, context);
}

export async function renderFacilityInspectionsGrid(containerId, context = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const projectId = getProjectId(context);
    const facilitiesId = getFacilitiesId(context);
    const facilityName = getFacilityName(context);

    if (!facilitiesId) {
        container.innerHTML = `<p style="color:red;text-align:center;">Missing facility ID.</p>`;
        return;
    }

    currentResult = 'passed';
    currentSavedInspectionId = null;
    currentSavedInspection = null;

    const locationsResponse = await fetchInspectionLocations(facilitiesId);
    const itemsResponse = await fetchInspectionItems(facilitiesId);
    const inspectionsResponse = await fetchFacilityInspections(facilitiesId);

    const locations = locationsResponse.data || [];
    const items = itemsResponse.data || [];
    const inspections = inspectionsResponse.data || [];

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
            .inspection-select,
            .inspection-textarea {
                width:100%;
                padding:10px;
                border:1px solid #bbb;
                border-radius:7px;
                font-size:15px;
                box-sizing:border-box;
            }

            .inspection-textarea {
                min-height:80px;
                resize:vertical;
            }

            .inspection-two-row {
                display:grid;
                grid-template-columns:1fr 1fr;
                gap:8px;
                margin-top:8px;
            }

            .inspection-main-btn {
                background:#003b73;
                color:white;
                border:none;
                border-radius:9px;
                width:100%;
                min-height:50px;
                font-size:15px;
                font-weight:bold;
                cursor:pointer;
                margin-top:8px;
            }

            .inspection-small-btn {
                background:#00509d;
                color:white;
                border:none;
                border-radius:9px;
                min-height:46px;
                font-size:13px;
                font-weight:bold;
                cursor:pointer;
            }

            .inspection-pass-btn {
                background:#16a34a;
                color:white;
                border:none;
                border-radius:9px;
                min-height:50px;
                font-size:15px;
                font-weight:bold;
                cursor:pointer;
            }

            .inspection-fail-btn {
                background:#dc2626;
                color:white;
                border:none;
                border-radius:9px;
                min-height:50px;
                font-size:15px;
                font-weight:bold;
                cursor:pointer;
            }

            .inspection-pass-btn.active,
            .inspection-fail-btn.active {
                outline:4px solid #facc15;
            }

            .inspection-delete-btn {
                background:#7f1d1d;
                color:yellow;
                border:none;
                border-radius:8px;
                padding:8px;
                font-weight:bold;
                cursor:pointer;
                width:100%;
                margin-top:8px;
            }

            .inspection-back-btn {
                background:#747d8c;
                color:white;
                border:none;
                border-radius:9px;
                width:100%;
                min-height:48px;
                font-size:15px;
                font-weight:bold;
                cursor:pointer;
                margin-top:12px;
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

            .inspection-version-tag {
                border-top:1px solid #d6dee8;
                margin-top:18px;
                padding-top:10px;
                font-size:10px;
                color:#7d8ba0;
                text-align:center;
            }

            .inspection-hidden-file {
                display:none;
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

            .inspection-image-thumb {
                width:100%;
                border-radius:10px;
                margin-top:8px;
                border:1px solid #d6dee8;
            }
        </style>

        <div class="inspection-card">
            <div class="inspection-title">Inspections</div>
            <div class="inspection-subtitle">${escapeHtml(facilityName)}</div>

            <div class="inspection-box">
                <div class="inspection-label">LOCATION</div>
                <select id="inspection-location-select" class="inspection-select">
                    <option value="">Select Location</option>
                    ${locations.map(location => `
                        <option value="${location.id}">
                            ${escapeHtml(location.location_name)} (${escapeHtml(location.location_type)})
                        </option>
                    `).join('')}
                </select>

                <div class="inspection-label">ADD NEW LOCATION</div>
                <select id="new-location-type" class="inspection-select">
                    <option value="room">Room</option>
                    <option value="common_area">Common Area</option>
                </select>

                <input id="new-location-name" class="inspection-input" type="text" placeholder="Room 101, Kitchen, Dining Room" style="margin-top:8px;">

                <button id="btn-add-inspection-location" class="inspection-main-btn">ADD LOCATION</button>

                <div class="inspection-label">ITEM INSPECTED</div>
                <select id="inspection-item-select" class="inspection-select">
                    <option value="">Select Item</option>
                    ${items.map(item => `
                        <option value="${item.id}">
                            ${escapeHtml(item.item_name)}
                        </option>
                    `).join('')}
                </select>

                <div class="inspection-label">ADD NEW ITEM</div>
                <input id="new-item-name" class="inspection-input" type="text" placeholder="Toilet, Sink, PTAC, Door">
                <button id="btn-add-inspection-item" class="inspection-main-btn">ADD ITEM</button>

                <div class="inspection-label">RESULT</div>
                <div class="inspection-two-row">
                    <button id="btn-inspection-pass" class="inspection-pass-btn active">PASS</button>
                    <button id="btn-inspection-fail" class="inspection-fail-btn">FAIL</button>
                </div>

                <div id="failed-reason-area" style="display:none;">
                    <div class="inspection-label">WHY DID IT FAIL?</div>
                    <textarea id="inspection-failed-reason" class="inspection-textarea"></textarea>
                </div>

                <div class="inspection-label">NOTES</div>
                <textarea id="inspection-notes" class="inspection-textarea"></textarea>

                <div class="inspection-label">INSPECTED BY</div>
                <input id="inspection-inspected-by" class="inspection-input" type="text" placeholder="Your name">

                <button id="btn-save-inspection" class="inspection-main-btn">SAVE INSPECTION</button>

                <div class="inspection-two-row">
                    <button id="btn-take-inspection-picture" class="inspection-small-btn">TAKE PICTURE</button>
                    <button id="btn-see-inspection-pictures" class="inspection-small-btn">SEE PICTURES</button>
                </div>

                <input id="inspection-picture-input" class="inspection-hidden-file" type="file" accept="image/*" capture="environment">

                <div id="inspection-success" class="inspection-success"></div>
                <div id="inspection-error" class="inspection-error"></div>
            </div>

            <div class="inspection-box">
                <div class="inspection-label">SAVED INSPECTIONS</div>

                ${inspections.length ? inspections.map(inspection => `
                    <div class="inspection-record">
                        <div class="inspection-record-title">
                            ${escapeHtml(inspection.location_name || 'Location')} - ${escapeHtml(inspection.item_name || 'Item')}
                        </div>
                        <div class="inspection-record-value">
                            Result: ${escapeHtml(inspection.result || '')}
                        </div>
                        <div class="inspection-record-value">
                            Failed Reason: ${escapeHtml(inspection.failed_reason || '')}
                        </div>
                        <div class="inspection-record-value">
                            Notes: ${escapeHtml(inspection.notes || '')}
                        </div>
                        <div class="inspection-record-value">
                            Date: ${escapeHtml(formatDate(inspection.created_at))}
                        </div>
                        <button class="inspection-delete-btn" data-id="${inspection.id}">🗑 Delete</button>
                    </div>
                `).join('') : `
                    <div class="inspection-record-value">No inspections saved yet.</div>
                `}
            </div>

            <button id="btn-back-facility-detail" class="inspection-back-btn">⬅️ BACK</button>

            <div class="inspection-version-tag">facility-inspections/grid.js | v2026_06_23_facility_level_inspections | 2026-06-23</div>
        </div>

        <div id="inspection-images-modal-backdrop" class="inspection-modal-backdrop">
            <div class="inspection-modal">
                <h3 style="text-align:center;color:#003b73;margin-top:0;">Inspection Pictures</h3>
                <div id="inspection-images-list"></div>
                <button id="btn-close-inspection-images" class="inspection-back-btn">Close</button>
                <div class="inspection-version-tag">facility-inspections/grid.js | v2026_06_23_facility_level_inspections | 2026-06-23</div>
            </div>
        </div>
    `;

    const errorBox = document.getElementById('inspection-error');
    const successBox = document.getElementById('inspection-success');
    const failedReasonArea = document.getElementById('failed-reason-area');
    const passButton = document.getElementById('btn-inspection-pass');
    const failButton = document.getElementById('btn-inspection-fail');
    const pictureInput = document.getElementById('inspection-picture-input');
    const imagesModalBackdrop = document.getElementById('inspection-images-modal-backdrop');
    const imagesList = document.getElementById('inspection-images-list');

    function clearMessages() {
        errorBox.textContent = '';
        successBox.textContent = '';
    }

    function getSelectedLocation() {
        const selectedId = document.getElementById('inspection-location-select').value;
        return locations.find(location => String(location.id) === String(selectedId)) || null;
    }

    function getSelectedItem() {
        const selectedId = document.getElementById('inspection-item-select').value;
        return items.find(item => String(item.id) === String(selectedId)) || null;
    }

    async function saveInspectionIfNeeded() {
        if (currentSavedInspectionId && currentSavedInspection) {
            return currentSavedInspection;
        }

        const selectedLocation = getSelectedLocation();
        const selectedItem = getSelectedItem();
        const notes = document.getElementById('inspection-notes').value.trim();
        const failedReason = document.getElementById('inspection-failed-reason').value.trim();
        const inspectedBy = document.getElementById('inspection-inspected-by').value.trim();

        if (!selectedLocation) {
            errorBox.textContent = 'Select a location.';
            return null;
        }

        if (!selectedItem) {
            errorBox.textContent = 'Select an item.';
            return null;
        }

        if (currentResult === 'failed' && !failedReason) {
            errorBox.textContent = 'Enter why it failed.';
            return null;
        }

        const payload = {
            facilities_id: facilitiesId,
            project_id: projectId,
            inspection_location_id: selectedLocation.id,
            inspection_item_id: selectedItem.id,
            location_type: selectedLocation.location_type,
            location_name: selectedLocation.location_name,
            item_name: selectedItem.item_name,
            inspection_status: 'complete',
            result: currentResult,
            notes,
            failed_reason: currentResult === 'failed' ? failedReason : '',
            inspected_by: inspectedBy
        };

        const { data, error } = await createInspection(payload);

        if (error) {
            console.error('Create inspection error:', error);
            errorBox.textContent = 'Could not save inspection.';
            return null;
        }

        currentSavedInspectionId = data.id;
        currentSavedInspection = data;
        successBox.textContent = 'Inspection saved.';

        return data;
    }

    passButton.addEventListener('click', () => {
        currentResult = 'passed';
        passButton.classList.add('active');
        failButton.classList.remove('active');
        failedReasonArea.style.display = 'none';
        clearMessages();
    });

    failButton.addEventListener('click', () => {
        currentResult = 'failed';
        failButton.classList.add('active');
        passButton.classList.remove('active');
        failedReasonArea.style.display = 'block';
        clearMessages();
    });

    document.getElementById('btn-add-inspection-location').addEventListener('click', async () => {
        clearMessages();

        const locationType = document.getElementById('new-location-type').value;
        const locationName = document.getElementById('new-location-name').value.trim();

        if (!locationName) {
            errorBox.textContent = 'Enter location name.';
            return;
        }

        const payload = {
            facilities_id: facilitiesId,
            location_type: locationType,
            location_name: locationName,
            active_status: 'active'
        };

        const { error } = await createInspectionLocation(payload);

        if (error) {
            console.error('Create inspection location error:', error);
            errorBox.textContent = 'Could not add location.';
            return;
        }

        if (window.navigateTo) {
            window.navigateTo('facility-inspections', context);
        }
    });

    document.getElementById('btn-add-inspection-item').addEventListener('click', async () => {
        clearMessages();

        const itemName = document.getElementById('new-item-name').value.trim();

        if (!itemName) {
            errorBox.textContent = 'Enter item name.';
            return;
        }

        const payload = {
            facilities_id: facilitiesId,
            item_name: itemName,
            active_status: 'active'
        };

        const { error } = await createInspectionItem(payload);

        if (error) {
            console.error('Create inspection item error:', error);
            errorBox.textContent = 'Could not add item.';
            return;
        }

        if (window.navigateTo) {
            window.navigateTo('facility-inspections', context);
        }
    });

    document.getElementById('btn-save-inspection').addEventListener('click', async () => {
        clearMessages();

        const savedInspection = await saveInspectionIfNeeded();

        if (!savedInspection) return;

        if (window.navigateTo) {
            window.navigateTo('facility-inspections', context);
        }
    });

    document.getElementById('btn-take-inspection-picture').addEventListener('click', async () => {
        clearMessages();

        const savedInspection = await saveInspectionIfNeeded();

        if (!savedInspection) return;

        pictureInput.click();
    });

    pictureInput.addEventListener('change', async () => {
        clearMessages();

        const file = pictureInput.files && pictureInput.files[0];

        if (!file) return;

        const savedInspection = await saveInspectionIfNeeded();

        if (!savedInspection) return;

        const fileExt = file.name.split('.').pop() || 'jpg';
        const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;
        const filePath = `inspection_${savedInspection.id}/${fileName}`;

        const uploadResult = await supabase.storage
            .from('inspection-images')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (uploadResult.error) {
            console.error('Upload inspection image error:', uploadResult.error);
            errorBox.textContent = 'Could not upload picture. Check storage bucket inspection-images.';
            return;
        }

        const publicUrlResult = supabase.storage
            .from('inspection-images')
            .getPublicUrl(filePath);

        const imageUrl = publicUrlResult.data.publicUrl;

        const imagePayload = {
            inspection_id: savedInspection.id,
            facilities_id: facilitiesId,
            project_id: projectId,
            image_url: imageUrl,
            image_type: currentResult === 'failed' ? 'failed' : 'inspection',
            notes: ''
        };

        const { error } = await createInspectionImage(imagePayload);

        if (error) {
            console.error('Create inspection image record error:', error);
            errorBox.textContent = 'Picture uploaded but record was not saved.';
            return;
        }

        successBox.textContent = 'Picture saved.';
        pictureInput.value = '';
    });

    document.getElementById('btn-see-inspection-pictures').addEventListener('click', async () => {
        clearMessages();

        const savedInspection = await saveInspectionIfNeeded();

        if (!savedInspection) return;

        const { data, error } = await fetchInspectionImages(savedInspection.id);

        if (error) {
            console.error('Fetch inspection images error:', error);
            errorBox.textContent = 'Could not load pictures.';
            return;
        }

        imagesList.innerHTML = data.length ? data.map(image => `
            <div style="margin-bottom:12px;">
                <img src="${escapeHtml(image.image_url)}" class="inspection-image-thumb">
                <button class="inspection-delete-btn inspection-image-delete-btn" data-id="${image.id}">🗑 Delete Picture</button>
            </div>
        `).join('') : `
            <p style="text-align:center;color:#667085;">No pictures yet.</p>
        `;

        imagesModalBackdrop.style.display = 'flex';

        document.querySelectorAll('.inspection-image-delete-btn').forEach(button => {
            button.addEventListener('click', async () => {
                if (!confirm('Delete this inspection picture?')) return;

                const { error } = await deleteInspectionImage(button.dataset.id);

                if (error) {
                    console.error('Delete inspection image error:', error);
                    alert('Could not delete picture.');
                    return;
                }

                button.closest('div').remove();
            });
        });
    });

    document.getElementById('btn-close-inspection-images').addEventListener('click', () => {
        imagesModalBackdrop.style.display = 'none';
    });

    document.querySelectorAll('.inspection-delete-btn[data-id]').forEach(button => {
        button.addEventListener('click', async () => {
            if (!confirm('Delete this inspection?')) return;

            const { error } = await deleteInspection(button.dataset.id);

            if (error) {
                console.error('Delete inspection error:', error);
                alert('Could not delete inspection.');
                return;
            }

            if (window.navigateTo) {
                window.navigateTo('facility-inspections', context);
            }
        });
    });

    document.getElementById('btn-back-facility-detail').addEventListener('click', () => {
        if (window.navigateTo) {
            window.navigateTo('facilities-details', context);
        }
    });
}
