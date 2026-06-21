/*================================================================
SYSTEM: Facility Tracker Modular View System
PURPOSE: Materials hello button component
LOCATION: /facilities_views/materials/helloButton.js
VERSION: v2026_06_21_materials_hello_button_initial
UPDATED: 2026-06-21
================================================================*/

import { openOkPopup } from './popups.js';

export function renderHelloButton() {
    return `
        <style>
            .materials-hello-button {
                background:#003b73;
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

        <button id="materials-hello-button" class="materials-hello-button" type="button">
            SAY HELLO
        </button>
    `;
}

export function connectHelloButton() {
    const button = document.getElementById('materials-hello-button');
    if (!button) return;

    button.addEventListener('click', () => {
        openOkPopup('Hello');
    });
}
