/*================================================================
SYSTEM: Facility Tracker Modular View System
PURPOSE: Material detail popup for view/edit/delete
LOCATION: /facilities_views/materials/material-detail-popup.js
VERSION: v2026_06_21_material_detail_popup_picture_thumbnails
UPDATED: 2026-06-21
LINES: 383
================================================================*/

import { updateMaterial, deleteMaterial } from './data.js';
import { openOkPopup } from './popups.js';
import { openAmazonMaterialSearch } from './material-amazon.js';
import {
    openMaterialPicturePicker,
    renderMaterialPictureThumbnails,
    openMaterialPictureViewer
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

            .material-detail-save-btn {
                background:#003b73;
            }

            .material-detail-close-btn {
                background:#6b7280;
            }

            .material-detail-amazon-btn {
                background:#f59e0b;
                color:#111827;
            }

            .material-detail-picture-btn {
                background:#22a843;
            }

            .material-detail-images-btn {
                background:#0f766e;
            }

            .material-detail-delete-btn {
                background:#b91c1c;
                color:#ffff00;
            }
        </style>

        <div id="material-detail-popup-backdrop" class="material-detail-popup-backdrop">
            <div class="material-detail-popup-box">
                <div class="material-detail-popup-title">Material Detail</div>

                <input id="material-detail-id-input" type="hidden">

                <label class="material-detail-label" for="material-detail-name-input">Material</label>
                <input id="material-detail-name-input" class="material-detail-input" type="text">

                <div class="material-detail-row">
                    <div>
                        <label class="material-detail-label" for="material-detail-quantity-input">Quantity</label>
                        <input id="material-detail-quantity-input" class="material-detail-input" type="text">
                    </div>

                    <div>
                        <label class="material-detail-label" for="material-detail-status-input">Status</label>
                        <select id="material-detail-status-input" class="material-detail-select">
                            <option value="Needed">Needed</option>
                            <option value="Ordered">Ordered</option>
                            <option value="Received">Received</option>
                            <option value="Installed">Installed</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>

                <div class="material-detail-row">
                    <div>
                        <label class="material-detail-label" for="material-detail-estimated-cost-input">Estimated Cost</label>
                        <input id="material-detail-estimated-cost-input" class="material-detail-input" type="number" step="0.01">
                    </div>

                    <div>
                        <label class="material-detail-label" for="material-detail-actual-cost-input">Actual Cost</label>
                        <input id="material-detail-actual-cost-input" class="material-detail-input" type="number" step="0.01">
                    </div>
                </div>

                <label class="material-detail-label" for="material-detail-description-input">Description</label>
                <textarea id="material-detail-description-input" class="material-detail-textarea"></textarea>

                <label class="material-detail-label" for="material-detail-notes-input">Notes</label>
                <textarea id="material-detail-notes-input" class="material-detail-textarea"></textarea>

                <div class="material-detail-buttons">
                    <button id="material-detail-amazon-btn" class="material-detail-btn material-detail-amazon-btn" type="button">Amazon</button>
                    <button id="material-detail-picture-btn" class="material-detail-btn material-detail-picture-btn" type="button">Take Picture</button>
                </div>

                <div class="material-detail-buttons">
                    <button id="material-detail-images-btn" class="material-detail-btn material-detail-images-btn" type="button">See Pictures</button>
                    <button id="material-detail-save-btn" class="material-detail-btn material-detail-save-btn" type="button">Save Changes</button>
                </div>

                <div class="material-detail-buttons">
                    <button id="material-detail-delete-btn" class="material-detail-btn material-detail-delete-btn" type="button">Delete</button>
                    <button id="material-detail-close-btn" class="material-detail-btn material-detail-close-btn" type="button">Close</button>
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

    backdrop.style.display = 'flex';

    renderMaterialPictureThumbnails(material);

    const closeButton = document.getElementById('material-detail-close-btn');
    const saveButton = document.getElementById('material-detail-save-btn');
    const deleteButton = document.getElementById('material-detail-delete-btn');
    const amazonButton = document.getElementById('material-detail-amazon-btn');
    const pictureButton = document.getElementById('material-detail-picture-btn');
    const imagesButton = document.getElementById('material-detail-images-btn');

    if (closeButton) {
        closeButton.onclick = () => {
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

    if (imagesButton) {
        imagesButton.onclick = async () => {
            await openMaterialPictureViewer(material);
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
        return;
    }

    const material = {
        material_name: getInputValue('material-detail-name-input'),
        quantity: getInputValue('material-detail-quantity-input'),
        estimated_cost: getInputValue('material-detail-estimated-cost-input'),
        actual_cost: getInputValue('material-detail-actual-cost-input'),
        material_status: getInputValue('material-detail-status-input') || 'Needed',
        description: getInputValue('material-detail-description-input'),
        notes: getInputValue('material-detail-notes-input')
    };

    if (!material.material_name) {
        openOkPopup('Material name is required.');
        return;
    }

    const result = await updateMaterial(materialId, material);

    if (!result.success) {
        openOkPopup('Material was not updated.');
        return;
    }

    const backdrop = document.getElementById('material-detail-popup-backdrop');

    if (backdrop) {
        backdrop.style.display = 'none';
    }

    if (typeof afterChange === 'function') {
        await afterChange();
    }

    openOkPopup('Material updated.');
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

    const confirmed = window.confirm('Delete this material?');

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
    setInputValue('material-detail-id-input', material.id || '');
    setInputValue('material-detail-name-input', material.material_name || '');
    setInputValue('material-detail-quantity-input', material.quantity || '');
    setInputValue('material-detail-estimated-cost-input', material.estimated_cost || '');
    setInputValue('material-detail-actual-cost-input', material.actual_cost || '');
    setInputValue('material-detail-status-input', material.material_status || 'Needed');
    setInputValue('material-detail-description-input', material.description || '');
    setInputValue('material-detail-notes-input', material.notes || '');
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
