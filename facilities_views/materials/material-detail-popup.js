/*================================================================
SYSTEM: Facility Tracker Modular View System
PURPOSE: Material detail popup for view/edit/delete
LOCATION: /facilities_views/materials/material-detail-popup.js
VERSION: v2026_06_21_material_detail_popup_edit_mode
UPDATED: 2026-06-21
LINES: 496
================================================================*/

import { updateMaterial, deleteMaterial } from './data.js';
import { openOkPopup } from './popups.js';
import { openAmazonMaterialSearch } from './material-amazon.js';
import {
    openMaterialPicturePicker,
    renderMaterialPictureThumbnails
} from './material-pictures.js';

/*================================================================
RENDER MATERIAL DETAIL POPUP
================================================================*/
export function renderMaterialDetailPopup() {
    return `
        <style>
            .material-detail-popup-backdrop {
                position:fixed;
                inset:0;
                background:rgba(0,0,0,0.45);
                display:none;
                align-items:center;
                justify-content:center;
                z-index:9997;
            }

            .material-detail-popup-box {
                background:#ffffff;
                width:92%;
                max-width:380px;
                border-radius:12px;
                padding:16px;
                box-shadow:0 4px 18px rgba(0,0,0,0.25);
                text-align:left;
            }

            .material-detail-popup-title {
                text-align:center;
                color:#111827;
                font-size:20px;
                font-weight:bold;
                margin-bottom:14px;
            }

            .material-detail-label {
                display:block;
                color:#111827;
                font-size:13px;
                font-weight:bold;
                margin:8px 0 4px;
            }

            .material-detail-input,
            .material-detail-textarea,
            .material-detail-select {
                width:100%;
                box-sizing:border-box;
                border:1px solid #cbd5e1;
                border-radius:8px;
                padding:10px;
                font-size:15px;
                color:#111827;
                background:#ffffff;
            }

            .material-detail-input:disabled,
            .material-detail-textarea:disabled,
            .material-detail-select:disabled {
                background:#f3f4f6;
                color:#374151;
                opacity:1;
            }

            .material-detail-textarea {
                min-height:70px;
                resize:vertical;
            }

            .material-detail-row {
                display:grid;
                grid-template-columns:1fr 1fr;
                gap:8px;
            }

            .material-detail-buttons {
                display:grid;
                grid-template-columns:1fr 1fr;
                gap:10px;
                margin-top:12px;
            }

            .material-detail-btn {
                border:none;
                border-radius:8px;
                min-height:44px;
                font-size:15px;
                font-weight:bold;
                cursor:pointer;
                color:white;
            }

            .material-detail-edit-btn {
                background:#003b73;
            }

            .material-detail-save-btn {
                background:#003b73;
            }

            .material-detail-cancel-btn {
                background:#6b7280;
            }

            .material-detail-amazon-btn {
                background:#f59e0b;
                color:#111827;
            }

            .material-detail-picture-btn {
                background:#22a843;
            }

            .material-detail-delete-btn {
                background:#b91c1c;
                color:#ffff00;
            }

            .material-detail-hidden {
                display:none !important;
            }
        </style>

        <div id="material-detail-popup-backdrop" class="material-detail-popup-backdrop">
            <div class="material-detail-popup-box">
                <div class="material-detail-popup-title">Material Detail</div>

                <input id="material-detail-id-input" type="hidden">
                <input id="material-detail-purchased-at-input" type="hidden">
                <input id="material-detail-status-updated-at-input" type="hidden">
                <input id="material-detail-original-status-input" type="hidden">

                <label class="material-detail-label" for="material-detail-name-input">Material</label>
                <input id="material-detail-name-input" class="material-detail-input material-detail-edit-field" type="text">

                <div class="material-detail-row">
                    <div>
                        <label class="material-detail-label" for="material-detail-quantity-input">Quantity</label>
                        <input id="material-detail-quantity-input" class="material-detail-input material-detail-edit-field" type="text">
                    </div>

                    <div>
                        <label class="material-detail-label" for="material-detail-status-input">Status</label>
                        <select id="material-detail-status-input" class="material-detail-select material-detail-edit-field">
                            <option value="Needed">Needed</option>
                            <option value="Ordered">Ordered</option>
                            <option value="Purchased">Purchased</option>
                            <option value="Received">Received</option>
                            <option value="Installed">Installed</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>

                <div class="material-detail-row">
                    <div>
                        <label class="material-detail-label" for="material-detail-estimated-cost-input">Estimated Cost</label>
                        <input id="material-detail-estimated-cost-input" class="material-detail-input material-detail-edit-field" type="number" step="0.01">
                    </div>

                    <div>
                        <label class="material-detail-label" for="material-detail-actual-cost-input">Actual Cost</label>
                        <input id="material-detail-actual-cost-input" class="material-detail-input material-detail-edit-field" type="number" step="0.01">
                    </div>
                </div>

                <label class="material-detail-label" for="material-detail-description-input">Description</label>
                <textarea id="material-detail-description-input" class="material-detail-textarea material-detail-edit-field"></textarea>

                <label class="material-detail-label" for="material-detail-notes-input">Notes</label>
                <textarea id="material-detail-notes-input" class="material-detail-textarea material-detail-edit-field"></textarea>

                <div class="material-detail-buttons">
                    <button id="material-detail-amazon-btn" class="material-detail-btn material-detail-amazon-btn" type="button">Amazon</button>
                    <button id="material-detail-picture-btn" class="material-detail-btn material-detail-picture-btn" type="button">Take Picture</button>
                </div>

                <div class="material-detail-buttons">
                    <button id="material-detail-edit-btn" class="material-detail-btn material-detail-edit-btn" type="button">Edit</button>
                    <button id="material-detail-save-btn" class="material-detail-btn material-detail-save-btn material-detail-hidden" type="button">Save</button>
                    <button id="material-detail-cancel-btn" class="material-detail-btn material-detail-cancel-btn" type="button">Cancel</button>
                </div>

                <div class="material-detail-buttons">
                    <button id="material-detail-delete-btn" class="material-detail-btn material-detail-delete-btn" type="button">Delete</button>
                </div>

                <div id="material-picture-thumbnails"></div>
            </div>
        </div>
    `;
}

/*================================================================
OPEN MATERIAL DETAIL POPUP
================================================================*/
export function openMaterialDetailPopup(material = {}, afterChange = null) {
    const backdrop = document.getElementById('material-detail-popup-backdrop');

    if (!backdrop) {
        console.error('Material detail popup not found.');
        return;
    }

    fillMaterialDetailForm(material);
    setMaterialEditMode(false);

    backdrop.style.display = 'flex';

    renderMaterialPictureThumbnails(material);

    const editButton = document.getElementById('material-detail-edit-btn');
    const cancelButton = document.getElementById('material-detail-cancel-btn');
    const saveButton = document.getElementById('material-detail-save-btn');
    const deleteButton = document.getElementById('material-detail-delete-btn');
    const amazonButton = document.getElementById('material-detail-amazon-btn');
    const pictureButton = document.getElementById('material-detail-picture-btn');

    if (editButton) {
        editButton.onclick = () => {
            setMaterialEditMode(true);
        };
    }

    if (cancelButton) {
        cancelButton.onclick = () => {
            backdrop.style.display = 'none';
        };
    }

    if (saveButton) {
        saveButton.onclick = async () => {
            await saveMaterialDetail(afterChange);
        };
    }

    if (deleteButton) {
        deleteButton.onclick = async () => {
            await deleteMaterialDetail(afterChange);
        };
    }

    if (amazonButton) {
        amazonButton.onclick = () => {
            const result = openAmazonMaterialSearch();

            if (!result.success) {
                openOkPopup(result.message);
            }
        };
    }

    if (pictureButton) {
        pictureButton.onclick = async () => {
            await openMaterialPicturePicker(material, async () => {
                await renderMaterialPictureThumbnails(material);
            });
        };
    }
}

/*================================================================
SAVE MATERIAL DETAIL
================================================================*/
async function saveMaterialDetail(afterChange = null) {
    const materialId = getInputValue('material-detail-id-input');

    if (!materialId) {
        openOkPopup('Missing material id.');
        return false;
    }

    const status = getInputValue('material-detail-status-input') || 'Needed';
    const originalStatus = getInputValue('material-detail-original-status-input') || 'Needed';
    const existingPurchasedAt = getInputValue('material-detail-purchased-at-input');
    const existingStatusUpdatedAt = getInputValue('material-detail-status-updated-at-input');

    const material = {
        material_name: getInputValue('material-detail-name-input'),
        quantity: getInputValue('material-detail-quantity-input'),
        estimated_cost: getInputValue('material-detail-estimated-cost-input'),
        actual_cost: getInputValue('material-detail-actual-cost-input'),
        material_status: status,
        description: getInputValue('material-detail-description-input'),
        notes: getInputValue('material-detail-notes-input')
    };

    if (status !== originalStatus || !existingStatusUpdatedAt) {
        material.status_updated_at = new Date().toISOString();
    }

    if (status === 'Purchased') {
        material.purchased_at = existingPurchasedAt || new Date().toISOString();
    }

    if (!material.material_name) {
        openOkPopup('Material name is required.');
        return false;
    }

    const result = await updateMaterial(materialId, material);

    if (!result.success) {
        openOkPopup('Material was not updated.');
        return false;
    }

    const backdrop = document.getElementById('material-detail-popup-backdrop');

    if (backdrop) {
        backdrop.style.display = 'none';
    }

    if (typeof afterChange === 'function') {
        await afterChange();
    }

    return true;
}

/*================================================================
DELETE MATERIAL DETAIL
================================================================*/
async function deleteMaterialDetail(afterChange = null) {
    const materialId = getInputValue('material-detail-id-input');

    if (!materialId) {
        openOkPopup('Missing material id.');
        return;
    }

   const confirmed = await openMaterialDeleteConfirmPopup();

if (!confirmed) return;

    const result = await deleteMaterial(materialId);

    if (!result.success) {
        openOkPopup('Material was not deleted.');
        return;
    }

    const backdrop = document.getElementById('material-detail-popup-backdrop');

    if (backdrop) {
        backdrop.style.display = 'none';
    }

    if (typeof afterChange === 'function') {
        await afterChange();
    }

    openOkPopup('Material deleted.');
}

/*================================================================
HELPERS
================================================================*/
function fillMaterialDetailForm(material = {}) {
    const status = material.material_status || 'Needed';

    setInputValue('material-detail-id-input', material.id || '');
    setInputValue('material-detail-purchased-at-input', material.purchased_at || '');
    setInputValue('material-detail-status-updated-at-input', material.status_updated_at || '');
    setInputValue('material-detail-original-status-input', status);
    setInputValue('material-detail-name-input', material.material_name || '');
    setInputValue('material-detail-quantity-input', material.quantity || '');
    setInputValue('material-detail-estimated-cost-input', material.estimated_cost || '');
    setInputValue('material-detail-actual-cost-input', material.actual_cost || '');
    setInputValue('material-detail-status-input', status);
    setInputValue('material-detail-description-input', material.description || '');
    setInputValue('material-detail-notes-input', material.notes || '');
}

function setMaterialEditMode(isEditing) {
    document.querySelectorAll('.material-detail-edit-field').forEach(field => {
        field.disabled = !isEditing;
    });

    const editButton = document.getElementById('material-detail-edit-btn');
    const saveButton = document.getElementById('material-detail-save-btn');

    if (editButton) {
        editButton.classList.toggle('material-detail-hidden', isEditing);
    }

    if (saveButton) {
        saveButton.classList.toggle('material-detail-hidden', !isEditing);
    }
}

function openMaterialDeleteConfirmPopup() {
    return new Promise(resolve => {
        const oldPopup = document.getElementById('material-delete-confirm-backdrop');

        if (oldPopup) {
            oldPopup.remove();
        }

        const popup = document.createElement('div');
        popup.id = 'material-delete-confirm-backdrop';
        popup.style.cssText = `
            position:fixed;
            inset:0;
            background:rgba(0,0,0,0.45);
            display:flex;
            align-items:center;
            justify-content:center;
            z-index:10060;
        `;

        popup.innerHTML = `
            <div style="
                background:white;
                width:86%;
                max-width:320px;
                border-radius:12px;
                padding:18px;
                text-align:center;
                box-shadow:0 4px 18px rgba(0,0,0,0.25);
            ">
                <div style="
                    font-size:20px;
                    font-weight:bold;
                    color:#111827;
                    margin-bottom:8px;
                ">
                    Delete Material?
                </div>

                <div style="
                    font-size:14px;
                    color:#374151;
                    margin-bottom:16px;
                ">
                    This cannot be undone.
                </div>

                <div style="
                    display:grid;
                    grid-template-columns:1fr 1fr;
                    gap:10px;
                ">
                    <button id="material-delete-yes-btn" style="
                        border:none;
                        border-radius:8px;
                        min-height:44px;
                        background:#b91c1c;
                        color:#ffff00;
                        font-size:15px;
                        font-weight:bold;
                        cursor:pointer;
                    ">
                        YES DELETE
                    </button>

                    <button id="material-delete-cancel-btn" style="
                        border:none;
                        border-radius:8px;
                        min-height:44px;
                        background:#6b7280;
                        color:white;
                        font-size:15px;
                        font-weight:bold;
                        cursor:pointer;
                    ">
                        CANCEL
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(popup);

        document.getElementById('material-delete-yes-btn').onclick = () => {
            popup.remove();
            resolve(true);
        };

        document.getElementById('material-delete-cancel-btn').onclick = () => {
            popup.remove();
            resolve(false);
        };
    });
}






function getInputValue(id) {
    const input = document.getElementById(id);

    if (!input) {
        return '';
    }

    return input.value.trim();
}

function setInputValue(id, value) {
    const input = document.getElementById(id);

    if (!input) {
        return;
    }

    input.value = value;
}
