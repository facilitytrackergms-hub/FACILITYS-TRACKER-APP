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
        console.error('Fetch project detail error:', error);
        container.innerHTML = `<p style="color:red;text-align:center;">Could not load project.</p>`;
        return;
    }

    const projectUpdates = await fetchProjectUpdates(projectId);

    const facilityName = getFacilityName(facility);
    const projectName = project.project_name || project.name || 'Project';
    const facilityId = project.facilities_id || project.location_id || facility.id || null;

    container.innerHTML = `
        <style>
            .project-detail-card { background:#ffffff; max-width:350px; margin:16px auto; padding:18px; border-radius:14px; box-shadow:0 4px 18px rgba(0,0,0,0.08); text-align:center; }
            .project-detail-title { color:#003b73; font-size:24px; font-weight:bold; margin-bottom:2px; }
            .project-detail-subtitle { color:#003b73; font-size:13px; font-weight:bold; margin-bottom:16px; letter-spacing:2px; }
            .project-detail-info-box { border:1px solid #d6dee8; border-radius:10px; padding:12px; text-align:left; margin-bottom:14px; background:#f8fbff; }
            .project-detail-label { color:#003b73; font-size:11px; font-weight:bold; margin-top:8px; }
            .project-detail-value { color:#111827; font-size:14px; margin-bottom:8px; white-space:pre-wrap; }
            .project-detail-button-row { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:12px; }
            .project-detail-action-btn { background:#003b73; color:white; border:none; border-radius:9px; min-height:48px; font-size:14px; font-weight:bold; cursor:pointer; }
            .project-detail-delete-btn { background:#dc2626; color:yellow; border:none; border-radius:9px; min-height:48px; font-size:14px; font-weight:bold; cursor:pointer; }
            .project-detail-main-btn { background:#003b73; color:white; border:none; border-radius:9px; width:100%; min-height:50px; font-size:15px; font-weight:bold; cursor:pointer; margin-top:8px; }
            .project-detail-back-btn { background:#747d8c; color:white; border:none; border-radius:9px; width:100%; min-height:48px; font-size:15px; font-weight:bold; cursor:pointer; margin-top:12px; }
            .project-detail-version-tag { border-top:1px solid #d6dee8; margin-top:18px; padding-top:10px; font-size:10px; color:#7d8ba0; text-align:center; }
       
        .project-update-record-button {
    width: 100%;
    border: 1px solid #d6dee8;
    border-radius: 10px;
    padding: 10px;
    margin-top: 10px;
    background: #ffffff;
    text-align: left;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    gap: 4px;
}
        
        
        </style>

        <div class="project-detail-card">
            <div class="project-detail-title">${escapeHtml(projectName)}</div>
            <div class="project-detail-subtitle">${escapeHtml(facilityName)} PROJECT DETAIL</div>

            <div class="project-detail-info-box">
                <div class="project-detail-label">PROJECT DESCRIPTION</div>
                <div class="project-detail-value">${escapeHtml(project.description || '')}</div>

                <div class="project-detail-label">TYPE</div>
                <div class="project-detail-value">${escapeHtml(project.type || '')}</div>

                <div class="project-detail-label">REQUESTED BY NAME</div>
                <div class="project-detail-value">${escapeHtml(project.requested_by_name || '')}</div>

                <div class="project-detail-label">REQUESTED BY TITLE</div>
                <div class="project-detail-value">${escapeHtml(project.requested_by_title || '')}</div>

                <div class="project-detail-label">NOTES</div>
                <div class="project-detail-value">${escapeHtml(project.notes || '')}</div>
            </div>

            <div class="project-detail-info-box">
                <div class="project-detail-label">PROJECT UPDATES</div>

                ${projectUpdates.length ? projectUpdates.map(update => `
                    <button type="button" class="project-update-record-button" data-id="${update.id}">
                        <div class="project-update-record-button-title">${escapeHtml(update.update_title || 'Project Update')}</div>
                        <div class="project-update-record-button-status">${escapeHtml(update.status || '')}</div>
                        <div class="project-update-record-button-date">${escapeHtml(formatDate(update.created_at))}</div>
                    </button>
                `).join('') : `
                    <div class="project-detail-value">No project updates yet.</div>
                `}
            </div>

            <button id="btn-add-project-update" class="project-detail-main-btn">ADD PROJECT UPDATE</button>

            <button id="btn-open-materials" class="project-detail-main-btn">
                MATERIALS
            </button>

            <div class="project-detail-button-row" style="margin-top:12px;">
                <button id="btn-edit-project-detail" class="project-detail-action-btn">⚙️ Edit</button>
                <button id="btn-delete-project-detail" class="project-detail-delete-btn">🗑 Delete</button>
            </div>

            <button id="btn-back-projects" class="project-detail-back-btn">⬅️ BACK</button>

            <div class="project-detail-version-tag">grid.js | 2026-06-19 @ 4:45 AM EDT</div>
        </div>
    `;

    const modalBackdrop = document.getElementById('project-detail-modal-backdrop');
    const updateModalBackdrop = document.getElementById('project-update-modal-backdrop');

    document.getElementById('btn-add-project-update').addEventListener('click', () => {
        updateModalBackdrop.style.display = 'flex';
    });

    document.getElementById('btn-open-materials').addEventListener('click', () => {
        openMaterialsPanel({
            id: projectId,
            facilities_id: facilityId,
            project_name: projectName
        });
    });

    document.getElementById('btn-back-projects').addEventListener('click', () => {
        if (window.navigateTo) window.navigateTo('facilities-projects', facility);
    });
}
