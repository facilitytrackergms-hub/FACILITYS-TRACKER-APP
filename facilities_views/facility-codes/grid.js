/* ================================================================
   FACILITY TRACKER MODULAR VIEW SYSTEM
   PURPOSE: Facility Codes Grid
   LOCATION: /facilities_views/facility-codes/grid.js
   VERSION: v2026_06_22_facility_codes_grid_build
   UPDATED: 2026-06-22 @ 11:00 AM EDT
================================================================ */

import { supabase } from '../../global_engine/supabaseClient.js';

import {
    fetchFacilityCodes,
    createFacilityCode,
    updateFacilityCode,
    deleteFacilityCode,
    fetchFacilityCodeImages,
    createFacilityCodeImage,
    deleteFacilityCodeImage
} from './data.js';

function escapeHtml(value) {
    return String(value || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function getFacilityName(facility) {
    return facility?.abbreviation || facility?.number_name || facility?.name || 'Facility';
}

export async function renderFacilityCodesGrid(containerId, context = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const facility = context || {};
    const facilitiesId = facility.id || facility.facilities_id || facility.facility_id;

    if (!facilitiesId) {
        container.innerHTML = `<p style="color:red;text-align:center;">Missing facility ID.</p>`;
        return;
    }

    const { data: codes, error } = await fetchFacilityCodes(facilitiesId);

    if (error) {
        console.error('Fetch facility codes error:', error);
        container.innerHTML = `<p style="color:red;text-align:center;">Could not load facility codes.</p>`;
        return;
    }

    container.innerHTML = `
        <style>
            .facility-codes-card {
                background:#ffffff;
                max-width:350px;
                margin:16px auto;
                padding:18px;
                border-radius:14px;
                box-shadow:0 4px 18px rgba(0,0,0,0.08);
                text-align:center;
            }

            .facility-codes-title {
                color:#003b73;
                font-size:24px;
                font-weight:bold;
                margin-bottom:2px;
            }

            .facility-codes-subtitle {
                color:#003b73;
                font-size:13px;
                font-weight:bold;
                margin-bottom:16px;
                letter-spacing:2px;
            }

            .facility-codes-box {
                border:1px solid #d6dee8;
                border-radius:10px;
                padding:12px;
                text-align:left;
                margin-bottom:14px;
                background:#f8fbff;
            }

            .facility-codes-label {
                color:#003b73;
                font-size:12px;
                font-weight:bold;
                margin-top:10px;
                margin-bottom:4px;
            }

            .facility-codes-input,
            .facility-codes-textarea,
            .facility-codes-select {
                width:100%;
                padding:10px;
                border:1px solid #bbb;
                border-radius:7px;
                font-size:15px;
                box-sizing:border-box;
            }

            .facility-codes-textarea {
                min-height:80px;
                resize:vertical;
            }

            .facility-codes-main-btn {
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

            .facility-codes-back-btn {
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

            .facility-codes-delete-btn {
                background:#7f1d1d;
                color:yellow;
                border:none;
                border-radius:8px;
                padding:9px;
                font-weight:bold;
                cursor:pointer;
                width:100%;
                margin-top:8px;
            }

            .facility-codes-small-btn {
                background:#00509d;
                color:white;
                border:none;
                border-radius:8px;
                padding:9px;
                font-weight:bold;
                cursor:pointer;
                width:100%;
                margin-top:8px;
            }

            .facility-codes-record {
                border:1px solid #d6dee8;
                border-radius:10px;
                padding:10px;
                margin-top:8px;
                background:#ffffff;
            }

            .facility-codes-record-title {
                color:#003b73;
                font-size:14px;
                font-weight:bold;
                margin-bottom:4px;
            }

            .facility-codes-record-value {
                color:#111827;
                font-size:13px;
                margin-top:3px;
                white-space:pre-wrap;
            }

            .facility-codes-two-row {
                display:grid;
                grid-template-columns:1fr 1fr;
                gap:8px;
                margin-top:8px;
            }

            .facility-codes-error {
                color:red;
                font-size:13px;
                text-align:center;
                min-height:18px;
                margin-top:10px;
            }

            .facility-codes-success {
                color:#16a34a;
                font-size:13px;
                text-align:center;
                min-height:18px;
                margin-top:10px;
                font-weight:bold;
            }

            .facility-codes-hidden-file {
                display:none;
            }

            .facility-codes-modal-backdrop {
                position:fixed;
                inset:0;
                background:rgba(0,0,0,0.45);
                display:none;
                align-items:center;
                justify-content:center;
                z-index:9999;
            }

            .facility-codes-modal {
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

            .facility-codes-image-thumb {
                width:100%;
                border-radius:10px;
                margin-top:8px;
                border:1px solid #d6dee8;
            }

            .facility-codes-version-tag {
                border-top:1px solid #d6dee8;
                margin-top:18px;
                padding-top:10px;
                font-size:10px;
                color:#7d8ba0;
                text-align:center;
            }
        </style>

        <div class="facility-codes-card">
            <div class="facility-codes-title">Facility Codes</div>
            <div class="facility-codes-subtitle">${escapeHtml(getFacilityName(facility))}</div>

            <div class="facility-codes-box">
                <div class="facility-codes-label">DOOR NAME</div>
                <input id="door-name-input" class="facility-codes-input" type="text" placeholder="Front Door, Side Door, East Door">

                <div class="facility-codes-label">DOOR LOCATION</div>
                <input id="door-location-input" class="facility-codes-input" type="text" placeholder="Main entrance, west hallway, kitchen side">

                <div class="facility-codes-label">ACCESS CODE</div>
                <input id="access-code-input" class="facility-codes-input" type="text" placeholder="Use test codes for now">

                <div class="facility-codes-label">NOTES</div>
                <textarea id="door-notes-input" class="facility-codes-textarea"></textarea>

                <button id="btn-save-facility-code" class="facility-codes-main-btn">SAVE CODE</button>

                <div id="facility-codes-success" class="facility-codes-success"></div>
                <div id="facility-codes-error" class="facility-codes-error"></div>
            </div>

            <div class="facility-codes-box">
                <div class="facility-codes-label">SAVED FACILITY CODES</div>

                ${codes && codes.length ? codes.map(code => `
                    <div class="facility-codes-record">
                        <div class="facility-codes-record-title">${escapeHtml(code.door_name)}</div>
                        <div class="facility-codes-record-value"><strong>Location:</strong> ${escapeHtml(code.door_location || '')}</div>
                        <div class="facility-codes-record-value"><strong>Code:</strong> ${escapeHtml(code.access_code || '')}</div>
                        <div class="facility-codes-record-value"><strong>Notes:</strong> ${escapeHtml(code.notes || '')}</div>

                        <div class="facility-codes-two-row">
                            <button class="facility-codes-small-btn btn-take-door-picture" data-id="${code.id}">TAKE PICTURE</button>
                            <button class="facility-codes-small-btn btn-see-door-pictures" data-id="${code.id}">SEE PICTURES</button>
                        </div>

                        <div class="facility-codes-two-row">
                            <button class="facility-codes-small-btn btn-edit-code"
                                data-id="${code.id}"
                                data-door-name="${escapeHtml(code.door_name)}"
                                data-door-location="${escapeHtml(code.door_location || '')}"
                                data-access-code="${escapeHtml(code.access_code || '')}"
                                data-notes="${escapeHtml(code.notes || '')}">
                                EDIT
                            </button>

                            <button class="facility-codes-delete-btn btn-delete-code" data-id="${code.id}">DELETE</button>
                        </div>
                    </div>
                `).join('') : `
                    <div class="facility-codes-record-value">No facility codes saved yet.</div>
                `}
            </div>

            <button id="btn-back-facility-details" class="facility-codes-back-btn">⬅️ BACK</button>

            <input id="door-picture-input" class="facility-codes-hidden-file" type="file" accept="image/*" capture="environment">

            <div class="facility-codes-version-tag">facility-codes/grid.js | v2026_06_22_facility_codes_grid_build | 2026-06-22 @ 11:00 AM EDT</div>
        </div>

        <div id="facility-code-images-modal-backdrop" class="facility-codes-modal-backdrop">
            <div class="facility-codes-modal">
                <h3 style="text-align:center;color:#003b73;margin-top:0;">Door Pictures</h3>
                <div id="facility-code-images-list"></div>
                <button id="btn-close-door-pictures" class="facility-codes-back-btn">Close</button>
                <div class="facility-codes-version-tag">facility-codes/grid.js | v2026_06_22_facility_codes_grid_build | 2026-06-22 @ 11:00 AM EDT</div>
            </div>
        </div>
    `;

    const errorBox = document.getElementById('facility-codes-error');
    const successBox = document.getElementById('facility-codes-success');
    const pictureInput = document.getElementById('door-picture-input');
    const imagesModalBackdrop = document.getElementById('facility-code-images-modal-backdrop');
    const imagesList = document.getElementById('facility-code-images-list');

    let selectedDoorCodeIdForPicture = null;
    let editingCodeId = null;

    function clearMessages() {
        errorBox.textContent = '';
        successBox.textContent = '';
    }

    document.getElementById('btn-save-facility-code').addEventListener('click', async () => {
        clearMessages();

        const doorName = document.getElementById('door-name-input').value.trim();
        const doorLocation = document.getElementById('door-location-input').value.trim();
        const accessCode = document.getElementById('access-code-input').value.trim();
        const notes = document.getElementById('door-notes-input').value.trim();

        if (!doorName) {
            errorBox.textContent = 'Door name required.';
            return;
        }

        const payload = {
            facilities_id: facilitiesId,
            door_name: doorName,
            door_location: doorLocation,
            access_code: accessCode,
            notes,
            active_status: 'active'
        };

        if (editingCodeId) {
            const { error } = await updateFacilityCode(editingCodeId, payload);

            if (error) {
                console.error('Update facility code error:', error);
                errorBox.textContent = 'Could not update facility code.';
                return;
            }
        } else {
            const { error } = await createFacilityCode(payload);

            if (error) {
                console.error('Create facility code error:', error);
                errorBox.textContent = 'Could not save facility code.';
                return;
            }
        }

        if (window.navigateTo) {
            window.navigateTo('facility-codes', facility);
        }
    });

    document.querySelectorAll('.btn-edit-code').forEach(button => {
        button.addEventListener('click', () => {
            editingCodeId = button.dataset.id;

            document.getElementById('door-name-input').value = button.dataset.doorName || '';
            document.getElementById('door-location-input').value = button.dataset.doorLocation || '';
            document.getElementById('access-code-input').value = button.dataset.accessCode || '';
            document.getElementById('door-notes-input').value = button.dataset.notes || '';

            successBox.textContent = 'Editing selected code. Press SAVE CODE when done.';
        });
    });

    document.querySelectorAll('.btn-delete-code').forEach(button => {
        button.addEventListener('click', async () => {
            if (!confirm('Delete this facility code?')) return;

            const { error } = await deleteFacilityCode(button.dataset.id);

            if (error) {
                console.error('Delete facility code error:', error);
                alert('Could not delete facility code.');
                return;
            }

            if (window.navigateTo) {
                window.navigateTo('facility-codes', facility);
            }
        });
    });

    document.querySelectorAll('.btn-take-door-picture').forEach(button => {
        button.addEventListener('click', () => {
            clearMessages();
            selectedDoorCodeIdForPicture = button.dataset.id;
            pictureInput.click();
        });
    });

    pictureInput.addEventListener('change', async () => {
        clearMessages();

        const file = pictureInput.files && pictureInput.files[0];

        if (!file || !selectedDoorCodeIdForPicture) return;

        const fileExt = file.name.split('.').pop() || 'jpg';
        const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;
        const filePath = `facility_${facilitiesId}/door_code_${selectedDoorCodeIdForPicture}/${fileName}`;

        const uploadResult = await supabase.storage
            .from('facilities-images')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (uploadResult.error) {
            console.error('Upload door image error:', uploadResult.error);
            errorBox.textContent = 'Could not upload picture. Check bucket name facilities-images.';
            return;
        }

        const publicUrlResult = supabase.storage
            .from('facilities-images')
            .getPublicUrl(filePath);

        const imageUrl = publicUrlResult.data.publicUrl;

        const imagePayload = {
            facilities_id: facilitiesId,
            image_url: imageUrl,
            category: 'facility_code_door',
            door_code_id: selectedDoorCodeIdForPicture
        };

        const { error } = await createFacilityCodeImage(imagePayload);

        if (error) {
            console.error('Create door image record error:', error);
            errorBox.textContent = 'Picture uploaded but record was not saved.';
            return;
        }

        successBox.textContent = 'Door picture saved.';
        pictureInput.value = '';
        selectedDoorCodeIdForPicture = null;
    });

    document.querySelectorAll('.btn-see-door-pictures').forEach(button => {
        button.addEventListener('click', async () => {
            clearMessages();

            const doorCodeId = button.dataset.id;

            const { data, error } = await fetchFacilityCodeImages(facilitiesId, doorCodeId);

            if (error) {
                console.error('Fetch door images error:', error);
                alert('Could not load door pictures.');
                return;
            }

            imagesList.innerHTML = data && data.length ? data.map(image => `
                <div style="margin-bottom:12px;">
                    <img src="${escapeHtml(image.image_url)}" class="facility-codes-image-thumb">
                    <button class="facility-codes-delete-btn btn-delete-door-picture" data-id="${image.id}">DELETE PICTURE</button>
                </div>
            `).join('') : `
                <p style="text-align:center;color:#667085;">No pictures yet.</p>
            `;

            imagesModalBackdrop.style.display = 'flex';

            document.querySelectorAll('.btn-delete-door-picture').forEach(deleteButton => {
                deleteButton.addEventListener('click', async () => {
                    if (!confirm('Delete this door picture?')) return;

                    const { error } = await deleteFacilityCodeImage(deleteButton.dataset.id);

                    if (error) {
                        console.error('Delete door image error:', error);
                        alert('Could not delete picture.');
                        return;
                    }

                    deleteButton.closest('div').remove();
                });
            });
        });
    });

    document.getElementById('btn-close-door-pictures').addEventListener('click', () => {
        imagesModalBackdrop.style.display = 'none';
    });

    document.getElementById('btn-back-facility-details').addEventListener('click', () => {
        if (window.navigateTo) {
            window.navigateTo('facilities-details', facility);
        }
    });
}

export async function render(containerId, context = {}) {
    await renderFacilityCodesGrid(containerId, context);
}
