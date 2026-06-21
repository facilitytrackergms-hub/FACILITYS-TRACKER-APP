/*================================================================
SYSTEM: Facility Tracker Modular View System
PURPOSE: Materials card component
LOCATION: /facilities_views/materials/card.js
VERSION: v2026_06_21_materials_card_initial
UPDATED: 2026-06-21
================================================================*/
import { renderAddMaterialsButtom } from './addmaterialsbuttom.js';
import { renderHelloButton } from './helloButton.js';
import { renderPopups } from './popups.js';

export function renderCard() {
    return `
        <style>
            .materials-card {
                background:#d9fbe3;
                max-width:350px;
                min-height:200px;
                margin:16px auto;
                padding:18px;
                border-radius:14px;
                box-shadow:0 4px 18px rgba(0,0,0,0.08);
            }
        </style>

        <div class="materials-card">
            ${renderHelloButton()}
             ${renderAddMaterialsButtom()}
        </div>

        ${renderPopups()}
    `;
}
