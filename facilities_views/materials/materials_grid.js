/*================================================================
SYSTEM: Facility Tracker Modular View System
PURPOSE: Materials view blank starter screen
LOCATION: /facilities_views/materials/materials_grid.js
VERSION: v2026_06_21_materials_blank_view_connected
UPDATED: 2026-06-21
================================================================*/

function escapeHtml(value) {
    return String(value || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function getProjectName(context) {
    return context?.project_name || context?.projectName || 'Project';
}

export async function renderMaterialsGrid(containerId, context = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const projectName = getProjectName(context);

    container.innerHTML = `
        <style>
            .materials-card {
                background:#ffffff;
                max-width:350px;
                margin:16px auto;
                padding:18px;
                border-radius:14px;
                box-shadow:0 4px 18px rgba(0,0,0,0.08);
                text-align:center;
            }

            .materials-title {
                color:#003b73;
                font-size:24px;
                font-weight:bold;
                margin-bottom:2px;
            }

            .materials-subtitle {
                color:#003b73;
                font-size:13px;
                font-weight:bold;
                margin-bottom:16px;
                letter-spacing:2px;
            }

            .materials-info-box {
                border:1px solid #d6dee8;
                border-radius:10px;
                padding:14px;
                text-align:center;
                margin-bottom:14px;
                background:#f8fbff;
                color:#111827;
                font-size:14px;
                font-weight:bold;
            }

            .materials-back-btn {
                background:#747d8c;
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

            .materials-version-tag {
                border-top:1px solid #d6dee8;
                margin-top:18px;
                padding-top:10px;
                font-size:10px;
                color:#7d8ba0;
                text-align:center;
            }
        </style>

        <div class="materials-card">
            <div class="materials-title">MATERIALS</div>
            <div class="materials-subtitle">${escapeHtml(projectName)}</div>

            <div class="materials-info-box">
                Materials view connected.
            </div>

            <button id="btn-back-materials" class="materials-back-btn">⬅️ BACK</button>

            <div class="materials-version-tag">
                materials_grid.js | Facility Tracker Modular View System | v2026_06_21_materials_blank_view_connected | 2026-06-21
            </div>
        </div>
    `;

    document.getElementById('btn-back-materials').addEventListener('click', () => {
        if (window.navigateTo) {
            window.navigateTo('facility-project-detail', context);
        }
    });
}
