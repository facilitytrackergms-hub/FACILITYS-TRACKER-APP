/*================================================================
SYSTEM: Facility Tracker Modular View System
PURPOSE: Materials list component
LOCATION: /facilities_views/materials/materials-list.js
VERSION: v2026_06_21_materials_list_status_color_timestamp
UPDATED: 2026-06-21
LINES: 150
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
                border-left:8px solid #cbd5e1;
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

            .materials-list-status-needed {
                border-left-color:#b91c1c;
            }

            .materials-list-status-ordered {
                border-left-color:#facc15;
            }

            .materials-list-status-purchased {
                border-left-color:#22a843;
            }

            .materials-list-status-received {
                border-left-color:#2563eb;
            }

            .materials-list-status-installed {
                border-left-color:#0f766e;
            }

            .materials-list-status-cancelled {
                border-left-color:#6b7280;
            }

            .materials-list-status-pill {
                display:inline-block;
                margin-top:4px;
                padding:3px 8px;
                border-radius:999px;
                font-size:12px;
                font-weight:bold;
                color:white;
            }

            .materials-list-pill-needed {
                background:#b91c1c;
            }

            .materials-list-pill-ordered {
                background:#facc15;
                color:#111827;
            }

            .materials-list-pill-purchased {
                background:#22a843;
            }

            .materials-list-pill-received {
                background:#2563eb;
            }

            .materials-list-pill-installed {
                background:#0f766e;
            }

            .materials-list-pill-cancelled {
                background:#6b7280;
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

    listBox.innerHTML = materials.map(material => {
        const status = material.material_status || 'Needed';
        const statusKey = getStatusKey(status);
        const statusDate = getStatusDate(material);

        return `
            <button
                class="materials-list-button materials-list-status-${statusKey}"
                type="button"
                data-material-id="${material.id}"
            >
                ${escapeHtml(material.material_name || 'Material')}

                <span class="materials-list-subtext">
                    <span class="materials-list-status-pill materials-list-pill-${statusKey}">
                        ${escapeHtml(status)}
                    </span>
                </span>

                <span class="materials-list-subtext">
                    Updated: ${escapeHtml(statusDate)}
                </span>
            </button>
        `;
    }).join('');

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

function getStatusKey(status = '') {
    const cleanStatus = String(status || '').toLowerCase().trim();

    if (cleanStatus === 'needed') return 'needed';
    if (cleanStatus === 'ordered') return 'ordered';
    if (cleanStatus === 'purchased') return 'purchased';
    if (cleanStatus === 'received') return 'received';
    if (cleanStatus === 'installed') return 'installed';
    if (cleanStatus === 'cancelled') return 'cancelled';

    return 'needed';
}

function getStatusDate(material = {}) {
    const rawDate =
        material.status_updated_at ||
        material.updated_at ||
        material.purchased_at ||
        material.created_at ||
        '';

    if (!rawDate) {
        return 'No date';
    }

    const date = new Date(rawDate);

    if (Number.isNaN(date.getTime())) {
        return 'No date';
    }

    return date.toLocaleString();
}

function escapeHtml(value) {
    return String(value || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}
