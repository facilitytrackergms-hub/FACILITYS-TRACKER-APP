/*================================================================
FACILITY-PROJECT-DETAIL GRID
LOCATION: /facilities_views/facility-project-detail/grid.js
VERSION: v2026_06_26_split_main_controller
UPDATED: 2026-06-26
================================================================*/

import {
    fetchProjectDetail,
    fetchProjectScopeItems,
    fetchProjectUpdates
} from './data.js';

import {
    escapeHtml,
    getProjectId,
    getFacilityContext,
    getFacilityName
} from './helpers.js';

import { renderProjectDetailStyles } from './styles.js';
import { renderProjectTabs, renderProjectPanels } from './render-sections.js';
import { renderProjectDetailModals } from './modals.js';
import { setupProjectDetailEvents } from './events.js';

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

    const projectScopeItems = await fetchProjectScopeItems(projectId);
    const projectUpdates = await fetchProjectUpdates(projectId);

    const facilityName = getFacilityName(facility);
    const projectName = project.project_name || project.name || 'Project';
    const facilityId = project.facilities_id || project.location_id || facility.id || null;
    const appointmentTimeValue = project.appointment_time ? String(project.appointment_time).slice(0, 16) : '';

    container.innerHTML = `
        ${renderProjectDetailStyles()}

        <div class="project-detail-card">
            <div class="project-detail-title">${escapeHtml(projectName)}</div>
            <div class="project-detail-subtitle">${escapeHtml(facilityName)} PROJECT DASHBOARD</div>

            ${renderProjectTabs()}
            ${renderProjectPanels(project, projectName, projectScopeItems, projectUpdates)}

            <div class="project-detail-button-row" style="margin-top:12px;">
                <button id="btn-edit-project-detail" class="project-detail-action-btn">⚙️ EDIT</button>
                <button id="btn-delete-project-detail" class="project-detail-delete-btn">🗑 DELETE</button>
            </div>

            <button id="btn-save-project-and-back" class="project-detail-save-btn">💾 SAVE</button>
            <button id="btn-back-projects" class="project-detail-back-btn">⬅️ BACK</button>

            <div class="project-detail-version-tag">facility-project-detail/grid.js | v2026_06_26_split_main_controller | 2026-06-26</div>
        </div>

        ${renderProjectDetailModals(project, projectName, appointmentTimeValue)}
    `;

    setupProjectDetailEvents({
        projectId,
        facility,
        facilityId,
        project,
        projectName,
        projectScopeItems
    });
}
