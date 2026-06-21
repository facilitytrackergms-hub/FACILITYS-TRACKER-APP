/*================================================================
SYSTEM: Facility Tracker Modular View System
PURPOSE: Custom Add Material popup with Supabase save
LOCATION: /facilities_views/materials/material-popup.js
VERSION: v2026_06_21_material_popup_initial
UPDATED: 2026-06-21
LINES: 214
================================================================*/

import { createMaterial } from './data.js';
import { openOkPopup } from './popups.js';

/*================================================================
RENDER MATERIAL POPUP
================================================================*/
export function renderMaterialPopup() {
    return `
        <style>
            .material-form-popup-backdrop {
                position:fixed;
                inset:0;
                background:rgba(0,0,0,0.45);
                display:none;
                align-items:center;
                justify-content:center;
                z-index:9998;
            }

            .material-form-popup-box {
                background:#ffffff;
                width:92%;
                max-width:380px;
                border-radius:12px;
                padding:16px;
                box-shadow:0 4px 18px rgba(0,0,0,0.25);
                text-align:left;
            }

            .material-form-popup-title {
                text-align:center;
                color:#111827;
                font-size:20px;
                font-weight:bold;
                margin-bottom:14px;
            }

            .material-form-label {
                display:block;
                color:#111827;
                font-size:13px;
                font-weight:bold;
                margin:8px 0 4px;
            }

            .material-form-input,
            .material-form-textarea,
            .material-form-select {
                width:100%;
                box-sizing:border-box;
                border:1px solid #cbd5e1;
                border-radius:8px;
                padding:10px;
                font-size:15px;
                color:#111827;
                background:#ffffff;
            }

            .material-form-textarea {
                min-height:70px;
                resize:vertical;
            }

            .material-form-row {
                display:grid;
                grid-template-columns:1fr 1fr;
                gap:8px;
            }

            .material-form-buttons {
                display:grid;
                grid-template-columns:1fr 1fr;
                gap:10px;
                margin-top:14px;
            }

            .material-form-save-btn {
                background:#003b73;
                color:white;
                border:none;
                border-radius:8px;
                min-height:44px;
                font-size:15px;
                font-weight:bold;
                cursor:pointer;
            }

            .material-form-cancel-btn {
                background:#6b7280;
                color:white;
                border:none;
                border-radius:8px;
                min-height:44px;
                font-size:15px;
                font-weight:bold;
                cursor:pointer;
            }
        </style>

        <div id="material-form-popup-backdrop" class="material-form-popup-backdrop">
            <div class="material-form-popup-box">
                <div class="material-form-popup-title">Add Material</div>

                <label class="material-form-label" for="material-name-input">Material</label>
                <input
                    id="material-name-input"
                    class="material-form-input"
                    type="text"
                    placeholder="Material name"
                >

                <div class="material-form-row">
                    <div>
                        <label class="material-form-label" for="material-quantity-input">Quantity</label>
                        <input
                            id="material-quantity-input"
                            class="material-form-input"
                            type="text"
                            placeholder="Qty"
                        >
                    </div>

                    <div>
                        <label class="material-form-label" for="material-status-input">Status</label>
                        <select id="material-status-input" class="material-form-select">
                            <option value="Needed">Needed</option>
                            <option value="Ordered">Ordered</option>
                            <option value="Received">Received</option>
                            <option value="Installed">Installed</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>

                <div class="material-form-row">
                    <div>
                        <label class="material-form-label" for="material-estimated-cost-input">Estimated Cost</label>
                        <input
                            id="material-estimated-cost-input"
                            class="material-form-input"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                        >
                    </div>

                    <div>
                        <label class="material-form-label" for="material-actual-cost-input">Actual Cost</label>
                        <input
                            id="material-actual-cost-input"
                            class="material-form-input"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                        >
                    </div>
                </div>

                <label class="material-form-label" for="material-description-input">Description</label>
                <textarea
                    id="material-description-input"
                    class="material-form-textarea"
                    placeholder="Description"
                ></textarea>

                <label class="material-form-label" for="material-notes-input">Notes</label>
                <textarea
                    id="material-notes-input"
                    class="material-form-textarea"
                    placeholder="Notes"
                ></textarea>

                <div class="material-form-buttons">
                    <button id="material-form-cancel-btn" class="material-form-cancel-btn" type="button">
                        Cancel
                    </button>

                    <button id="material-form-save-btn" class="material-form-save-btn" type="button">
                        Save
                    </button>
                </div>
            </div>
        </div>
    `;
}

/*================================================================
OPEN MATERIAL POPUP
================================================================*/
export function openMaterialPopup(context = {}, afterSave = null) {
    const backdrop = document.getElementById('material-form-popup-backdrop');

    if (!backdrop) {
        console.error('Material popup not found.');
        return;
    }

    clearMaterialForm();

    backdrop.style.display = 'flex';

    const cancelButton = document.getElementById('material-form-cancel-btn');
    const saveButton = document.getElementById('material-form-save-btn');

    if (cancelButton) {
        cancelButton.onclick = () => {
            backdrop.style.display = 'none';
        };
    }

    if (saveButton) {
        saveButton.onclick = async () => {
            await saveMaterialFromPopup(context, afterSave);
        };
    }
}

/*================================================================
SAVE MATERIAL FROM POPUP
================================================================*/
async function saveMaterialFromPopup(context = {}, afterSave = null) {
    const materialNameInput = document.getElementById('material-name-input');

    if (!materialNameInput) return;

    const materialName = materialNameInput.value.trim();

    if (!materialName) {
        openOkPopup('Material name is required.');
        return;
    }

    const material = {
        material_name: materialName,
        quantity: getInputValue('material-quantity-input'),
        estimated_cost: getInputValue('material-estimated-cost-input'),
        actual_cost: getInputValue('material-actual-cost-input'),
        material_status: getInputValue('material-status-input') || 'Needed',
        description: getInputValue('material-description-input'),
        notes: getInputValue('material-notes-input')
    };

    const result = await createMaterial(context, material);

    if (!result.success) {
        openOkPopup('Material was not saved.');
        return;
    }

    const backdrop = document.getElementById('material-form-popup-backdrop');

    if (backdrop) {
        backdrop.style.display = 'none';
    }

    if (typeof afterSave === 'function') {
        await afterSave(result.data);
    }

    openOkPopup('Material saved.');
}

/*================================================================
HELPERS
================================================================*/
function getInputValue(id) {
    const input = document.getElementById(id);

    if (!input) {
        return '';
    }

    return input.value.trim();
}

function clearMaterialForm() {
    setInputValue('material-name-input', '');
    setInputValue('material-quantity-input', '');
    setInputValue('material-estimated-cost-input', '');
    setInputValue('material-actual-cost-input', '');
    setInputValue('material-status-input', 'Needed');
    setInputValue('material-description-input', '');
    setInputValue('material-notes-input', '');
}

function setInputValue(id, value) {
    const input = document.getElementById(id);

    if (!input) {
        return;
    }

    input.value = value;
}
