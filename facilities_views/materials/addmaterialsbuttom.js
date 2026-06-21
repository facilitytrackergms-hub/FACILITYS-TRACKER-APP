/*================================================================
SYSTEM: Facility Tracker Modular View System
PURPOSE: Materials add material button opens custom popup
LOCATION: /facilities_views/materials/addmaterialsbuttom.js
VERSION: v2026_06_21_add_materials_buttom_custom_popup_connected
UPDATED: 2026-06-21
================================================================*/

import { openMaterialPopup } from './material-popup.js';

export function renderAddMaterialsButtom() {
    return `
        <style>
            .materials-add-buttom {
                background:#22a843;
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
        </style>

        <button id="materials-add-buttom" class="materials-add-buttom" type="button">
            ADD MATERIAL
        </button>
    `;
}

export function connectAddMaterialsButtom(context = {}) {
    const button = document.getElementById('materials-add-buttom');
    if (!button) return;

    button.addEventListener('click', () => {
        openMaterialPopup(context);
    });
}
