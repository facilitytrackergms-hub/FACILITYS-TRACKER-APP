/*================================================================
SYSTEM: Facility Tracker Modular View System
PURPOSE: Materials blank card component with own build code
LOCATION: /facilities_views/materials/materials_blank_card_component.js
VERSION: v2026_06_21_blank_card_component_owns_build

UPDATED: 2026-06-21
================================================================*/

export function renderMaterialsBlankCard() {
    return `
        <style>
            .materials-blank-card {
               background:#d9fbe3;
                max-width:350px;
                min-height:200px;
                margin:16px auto;
                padding:18px;
                border-radius:14px;
                box-shadow:0 4px 18px rgba(0,0,0,0.08);
            }
        </style>

        <div class="materials-blank-card"></div>
    `;
}
