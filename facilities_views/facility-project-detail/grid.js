/*================================================================
FACILITY-PROJECT-DETAIL GRID
VERSION: v2026_06_21_FULL_REWRITE
================================================================*/
import { supabase } from '../../global_engine/supabaseClient.js';
import { 
    fetchProjectDetail,
    updateProjectDetail,
    deleteProjectDetail,
    fetchProjectUpdates,
    createProjectUpdate
} from './data.js';

// --- Helper Functions ---
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
    if (typeof context === 'object' && context !== null) return context.facility || context;
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

// --- Main Render Function ---
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
        container.innerHTML = `<p style="color:red;text-align:center;">Could not load project.</p>`;
        return;
    }

    const projectUpdates = await fetchProjectUpdates(projectId);
    const facilityName = getFacilityName(facility);
    const projectName = project.project_name || project.name || 'Project';
    const facilityId = project.facilities_id || project.location_id || facility.id || null;

    // --- HTML Template ---
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
            .project-update-record-button { width:100%; border:1px solid #d6dee8; border-radius:10px; padding:10px; margin-top:8px; background:#ffffff; text-align:left; cursor:pointer; }
            .project-detail-modal-backdrop, .project-update-modal-backdrop { position:fixed; inset:0; background:rgba(0,0,0,0.45); display:none; align-items:center; justify-content:center; z-index:9999; }
            .project-detail-modal, .project-update-modal { background:white; width:90%; max-width:360px; border-radius:12px; padding:18px; }
        </style>
        <div class="project-detail-card">
            <div class="project-detail-title">${escapeHtml(projectName)}</div>
            <div class="project-detail-subtitle">${escapeHtml(facilityName)} PROJECT DETAIL</div>
            <div class="project-detail-info-box">
                <div class="project-detail-label">DESCRIPTION</div>
                <div class="project-detail-value">${escapeHtml(project.description || '')}</div>
            </div>
            <button id="btn-add-project-update" class="project-detail-main-btn">ADD PROJECT UPDATE</button>
            <button id="btn-open-materials" class="project-detail-main-btn">MATERIALS</button>
            <div class="project-detail-button-row">
                <button id="btn-edit-project-detail" class="project-detail-action-btn">Edit</button>
                <button id="btn-delete-project-detail" class="project-detail-delete-btn">Delete</button>
            </div>
            <button id="btn-back-projects" class="project-detail-back-btn">⬅️ BACK</button>
        </div>
        <div id="project-detail-modal-backdrop" class="project-detail-modal-backdrop">...</div>
        <div id="project-update-modal-backdrop" class="project-update-modal-backdrop">...</div>
    `;

    // --- EVENT LISTENERS ---
    document.getElementById('btn-add-project-update').addEventListener('click', () => document.getElementById('project-update-modal-backdrop').style.display = 'flex');
    document.getElementById('btn-open-materials').addEventListener('click', () => window.navigateTo('materials', { id: projectId, facilities_id: facilityId, project_name: projectName }));
    document.getElementById('btn-edit-project-detail').addEventListener('click', () => document.getElementById('project-detail-modal-backdrop').style.display = 'flex');
    document.getElementById('btn-cancel-project-detail').addEventListener('click', () => document.getElementById('project-detail-modal-backdrop').style.display = 'none');
    document.getElementById('btn-back-projects').addEventListener('click', () => window.navigateTo('facilities-projects', facility));

    document.getElementById('btn-delete-project-detail').addEventListener('click', async () => {
        if (!confirm('Are you sure you want to delete this project?')) return;
        const { error } = await deleteProjectDetail(projectId);
        if (error) return alert('Could not delete project.');
        window.navigateTo('facilities-projects', facility);
    });

    document.getElementById('btn-save-project-detail').addEventListener('click', async () => {
        const payload = { 
            name: document.getElementById('project-detail-name-input').value, 
            type: document.getElementById('project-detail-type-input').value 
        };
        const { data, error } = await updateProjectDetail(projectId, payload);
        if (!error) window.navigateTo('facility-project-detail', { ...facility, project_id: data.id });
    });
} // <--- FUNCTION CLOSES HERE

export default renderFacilityProjectDetailGrid;
