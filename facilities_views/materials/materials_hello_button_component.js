/*================================================================
SYSTEM: Facility Tracker Modular View System
PURPOSE: Materials hello button component
LOCATION: /facilities_views/materials/materials_hello_button_component.js
VERSION: v2026_06_21_materials_hello_button_component
UPDATED: 2026-06-21
================================================================*/

export function renderMaterialsHelloButton() {
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

        <button
            id="btn-materials-hello"
            class="materials-hello-button"
            type="button"
            onclick="alert('Hello')"
        >
            SAY HELLO
        </button>
    `;
}
