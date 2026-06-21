/*================================================================
SYSTEM: Facility Tracker Modular View System
PURPOSE: Materials list component
LOCATION: /facilities_views/materials/materials-list.js
VERSION: v2026_06_21_materials_list_detail_popup_connected
UPDATED: 2026-06-21
================================================================*/

import { fetchMaterials } from './data.js';
import { openMaterialDetailPopup } from './material-detail-popup.js';

export function renderMaterialsListContainer() {
    return `
        <style>
            .materials-list-container {
                margin-top:14px;
            }

            .materials-list-title {
                font-size:14px;
                font-weight:bold;
                color:#111827;
                margin-bottom:8px;
                text-align:center;
            }

            .materials-list-empty {
                font-size:13px;
                color:#374151;
                text-align:center;
                padding:10px;
                background:#ffffff;
                border-radius:8px;
            }

            .materials-list-button {
                background:#ffffff;
                color:#111827;
                border:1px solid #cbd5e1;
                border-radius:9px;
                width:100%;
                min-height:46px;
                font-size:15px;
                font-weight:bold;
                cursor:pointer;
                margin-bottom:8px;
                text-align:left;
                padding:10px;
            }

            .materials-list-subtext {
                display:block;
                font-size:12px;
                font-weight:normal;
                color:#4b5563;
                margin-top:3px;
            }
        </style>

        <div id="materials-list-container" class="materials-list-container">
            <div class="materials-list-title">Saved Materials</div>
            <div id="materials-list-items"></div>
        </div>
    `;
}

export async function connectMaterialsList(context = {}) {
    const listBox = document.getElementById('materials-list-items');
    if (!listBox) return;

    const materials = await fetchMaterials(context);

    if (!materials.length) {
        listBox.innerHTML = `
            <div class="materials-list-empty">
                No materials saved yet.
            </div>
        `;
        return;
    }

    listBox.innerHTML = materials.map(material => `
        <button
            class="materials-list-button"
            type="button"
            data-material-id="${material.id}"
        >
            ${escapeHtml(material.material_name || 'Material')}
            <span class="materials-list-subtext">
                Status: ${escapeHtml(material.material_status || 'Needed')}
            </span>
        </button>
    `).join('');

    document.querySelectorAll('.materials-list-button').forEach(button => {
        button.addEventListener('click', () => {
            const materialId = button.dataset.materialId;
            const selectedMaterial = materials.find(material => String(material.id) === String(materialId));

            if (!selectedMaterial) return;

            openMaterialDetailPopup(selectedMaterial, async () => {
                await connectMaterialsList(context);
            });
        });
    });
}

function escapeHtml(value) {
    return String(value || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}
