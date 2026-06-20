/*================================================================
FACILITY-PROJECT-DETAIL GRID
VERSION: v2026_06_19_clean_tag_project_description
UPDATED: 2026-06-19 @ 4:45 AM EDT
================================================================*/
import { openMaterialsPanel } from './materials-panel.js';
import {
    fetchProjectDetail,
    updateProjectDetail,
    deleteProjectDetail,
    fetchProjectUpdates,
    createProjectUpdate
} from './data.js';

function escapeHtml(value) {
    return String(value || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function getProjectId(context) {
    if (typeof context === 'object' && context !== null) return context.project_id || context.projectId || context.id;
    return context;
}

function getFacilityContext(context) {
    if (typeof context === 'object' && context !== null) {
        return context.facility || context;
    }
    return {};
}

function getFacilityName(context) {
    const facility = getFacilityContext(context);
    return facility?.abbreviation || facility?.number_name || facility?.name || 'Facility';
}

function formatDate(value) {
    if (!value) return '';
    return new Date(value).toLocaleString();
}

export async function renderFacilityProjectDetailGrid(containerId, context = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const projectId = getProjectId(context);
    const facility = getFacilityContext(context);

    if (!projectId) {
        container.innerHTML = `<p style="color:red;text-align:center;">Missing project ID.</p>`;
        return;
    }

    const { data: project, error } = await fetchProjectDetail(projectId);

    if (error || !project) {
        console.error(error);
        container.innerHTML = `<p style="color:red;text-align:center;">Could not load project.</p>`;
        return;
    }

    const projectUpdates = await fetchProjectUpdates(projectId);

    const facilityName = getFacilityName(facility);
    const projectName = project.project_name || project.name || 'Project';
    const facilityId = project.facilities_id || project.location_id || facility.id || null;

    container.innerHTML = `
        <style>
            .project-detail-card { background:#fff; max-width:350px; margin:16px auto; padding:18px; border-radius:14px; box-shadow:0 4px 18px rgba(0,0,0,0.08); text-align:center; }
            .project-detail-title { color:#003b73; font-size:24px; font-weight:bold; }
            .project-detail-subtitle { color:#003b73; font-size:13px; font-weight:bold; margin-bottom:16px; }
            .project-detail-info-box { border:1px solid #d6dee8; border-radius:10px; padding:12px; text-align:left; margin-bottom:14px; background:#f8fbff; }
            .project-detail-label { color:#003b73; font-size:11px; font-weight:bold; margin-top:8px; }
            .project-detail-value { color:#111827; font-size:14px; margin-bottom:8px; white-space:pre-wrap; }
            .project-detail-main-btn { background:#003b73; color:#fff; border:none; border-radius:9px; width:100%; min-height:50px; margin-top:8px; font-weight:bold; cursor:pointer; }
            .project-detail-back-btn { background:#747d8c; color:#fff; border:none; border-radius:9px; width:100%; min-height:48px; margin-top:12px; font-weight:bold; cursor:pointer; }

            .project-update-record-button {
                width:100%;
                border:1px solid #d6dee8;
                border-radius:10px;
                padding:10px;
                margin-top:10px;
                background:#fff;
                text-align:left;
                cursor:pointer;
                display:flex;
                flex-direction:column;
                gap:4px;
            }
        </style>

        <div class="project-detail-card">
            <div class="project-detail-title">${escapeHtml(projectName)}</div>
            <div class="project-detail-subtitle">${escapeHtml(facilityName)} PROJECT DETAIL</div>

            <div class="project-detail-info-box">
                <div class="project-detail-label">PROJECT DESCRIPTION</div>
                <div class="project-detail-value">${escapeHtml(project.description || '')}</div>
            </div>

            <div class="project-detail-info-box">
                <div class="project-detail-label">PROJECT UPDATES</div>

                ${projectUpdates.length ? projectUpdates.map(update => `
                    <button class="project-update-record-button">
                        <div><b>${escapeHtml(update.update_title || 'Project Update')}</b></div>
                        <div>${escapeHtml(update.status || '')}</div>
                        <div>${escapeHtml(formatDate(update.created_at))}</div>
                    </button>
                `).join('') : `
                    <div class="project-detail-value">No project updates yet.</div>
                `}
            </div>

            <button id="btn-add-project-update" class="project-detail-main-btn">ADD PROJECT UPDATE</button>

            <button id="btn-open-materials" class="project-detail-main-btn">MATERIALS</button>

            <button id="btn-back-projects" class="project-detail-back-btn">BACK</button>
        </div>
    `;

    const updateModalBackdrop = document.getElementById('project-update-modal-backdrop');

    function bindProjectButtons() {
        const addBtn = document.getElementById('btn-add-project-update');
        const materialsBtn = document.getElementById('btn-open-materials');
        const backBtn = document.getElementById('btn-back-projects');

        if (addBtn) {
            addBtn.onclick = () => {
                updateModalBackdrop.style.display = 'flex';
            };
        }

        if (materialsBtn) {
            materialsBtn.onclick = () => {
                openMaterialsPanel({
                    id: projectId,
                    facilities_id: facilityId,
                    project_name: projectName
                });
            };
        }

        if (backBtn) {
            backBtn.onclick = () => {
                if (window.navigateTo) window.navigateTo('facilities-projects', facility);
            };
        }
    }

    bindProjectButtons();
}
