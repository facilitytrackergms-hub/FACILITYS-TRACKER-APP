/*================================================================
FACILITIES-PROJECTS GRID
VERSION: v2026_06_18_view_on_button_projects
================================================================*/

import {
    fetchProjects,
    createProject,
    updateProject,
    deleteProject
} from './data.js';

function escapeHtml(value) {
    return String(value || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function getFacilityId(context) {
    if (typeof context === 'object' && context !== null) return context.id;
    return context;
}

function getFacilityName(context) {
    if (typeof context === 'object' && context !== null) {
        return context.abbreviation || context.number_name || context.name || 'Facility';
    }

    return 'Facility';
}

export async function renderProjectsGrid(containerId, context = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const facilityId = getFacilityId(context);
    const facilityName = getFacilityName(context);

    if (!facilityId) {
        container.innerHTML = `<p style="color:red;text-align:center;">Missing facility ID.</p>`;
        return;
    }

    const projects = await fetchProjects(facilityId);

    container.innerHTML = `
        <style>
            .projects-card { background:#ffffff; max-width:350px; margin:16px auto; padding:18px; border-radius:14px; box-shadow:0 4px 18px rgba(0,0,0,0.08); text-align:center; }
            .projects-title { color:#003b73; font-size:24px; font-weight:bold; margin-bottom:2px; }
            .projects-subtitle { color:#003b73; font-size:13px; font-weight:bold; margin-bottom:16px; letter-spacing:2px; }
            .projects-add-btn { background:#22a843; color:white; border:none; border-radius:9px; width:100%; padding:13px; font-weight:bold; font-size:15px; cursor:pointer; margin-bottom:16px; }
            .projects-list { display:grid; grid-template-columns:repeat(2, 1fr); gap:8px; }
            .project-record-button { min-height:70px; background:#003b73; color:white; border:none; border-radius:10px; padding:8px; cursor:pointer; font-weight:bold; font-size:13px; text-align:center; }
            .project-record-button:hover { background:#00509d; }
            .projects-back-btn { background:#747d8c; color:white; border:none; border-radius:9px; width:100%; min-height:48px; font-size:15px; font-weight:bold; cursor:pointer; margin-top:16px; }
            .projects-version-tag { border-top:1px solid #d6dee8; margin-top:18px; padding-top:10px; font-size:10px; color:#7d8ba0; text-align:center; }

            .project-modal-backdrop { position:fixed; inset:0; background:rgba(0,0,0,0.45); display:none; align-items:center; justify-content:center; z-index:9999; }
            .project-modal { background:white; width:90%; max-width:360px; border-radius:12px; padding:18px; box-shadow:0 4px 18px rgba(0,0,0,0.25); text-align:left; max-height:90vh; overflow-y:auto; }
            .project-modal h3 { margin:0 0 14px; text-align:center; color:#003b73; }
            .project-modal label { display:block; font-size:13px; font-weight:bold; margin:10px 0 4px; color:#003b73; }
            .project-modal input, .project-modal textarea { width:100%; padding:9px; border:1px solid #bbb; border-radius:6px; font-size:15px; box-sizing:border-box; }
            .project-modal textarea { min-height:80px; resize:vertical; }
            .project-modal-buttons { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:16px; }
            .project-modal-buttons button { padding:11px; border:none; border-radius:7px; font-weight:bold; cursor:pointer; }
            .btn-save-project { background:#22a843; color:white; }
            .btn-cancel-project { background:#777; color:white; }
            .btn-delete-project { background:#dc2626; color:yellow; display:none; width:100%; margin-top:10px; padding:11px; border:none; border-radius:7px; font-weight:bold; cursor:pointer; }
            .project-error { color:red; font-size:13px; text-align:center; margin-top:10px; min-height:16px; }
        </style>

        <div class="projects-card">
            <div class="projects-title">${escapeHtml(facilityName)}</div>
            <div class="projects-subtitle">PROJECTS</div>

            <button id="btn-add-project" class="projects-add-btn">ADD PROJECT</button>

            <div class="projects-list">
                ${projects.length ? projects.map(project => `
                    <button type="button" class="project-record-button" data-id="${project.id}">
                        ${escapeHtml(project.project_name || project.name || 'Project')}
                    </button>
                `).join('') : `<p style="text-align:center;color:#667085;grid-column:1 / -1;">No projects yet.</p>`}
            </div>

            <button id="btn-back-facility" class="projects-back-btn">⬅️ BACK</button>

            <div class="projects-version-tag">facilities-projects/grid.js | v2026_06_18_view_on_button_projects | 2026-06-18</div>
        </div>

        <div id="project-modal-backdrop" class="project-modal-backdrop">
            <div class="project-modal">
                <h3 id="project-modal-title">Add Project</h3>

                <input id="project-id-input" type="hidden">

                <label>Project Name</label>
                <input id="project-name-input" type="text">

                <label>Type</label>
                <input id="project-type-input" type="text">

                <label>Status</label>
                <input id="project-status-input" type="text">

                <label>Description</label>
                <textarea id="project-description-input"></textarea>

                <label>Notes</label>
                <textarea id="project-notes-input"></textarea>

                <label>Email To</label>
                <input id="project-email-input" type="email">

                <label>Text To</label>
                <input id="project-text-input" type="tel" inputmode="numeric">

                <div class="project-modal-buttons">
                    <button id="btn-save-project" class="btn-save-project">Save</button>
                    <button id="btn-cancel-project" class="btn-cancel-project">Cancel</button>
                </div>

                <button id="btn-delete-project" class="btn-delete-project">Delete Project</button>

                <div id="project-error" class="project-error"></div>

                <div class="projects-version-tag">project modal | v2026_06_18_view_on_button_projects | 2026-06-18</div>
            </div>
        </div>
    `;

    const modalBackdrop = document.getElementById('project-modal-backdrop');
    const modalTitle = document.getElementById('project-modal-title');
    const projectIdInput = document.getElementById('project-id-input');
    const projectNameInput = document.getElementById('project-name-input');
    const typeInput = document.getElementById('project-type-input');
    const statusInput = document.getElementById('project-status-input');
    const descriptionInput = document.getElementById('project-description-input');
    const notesInput = document.getElementById('project-notes-input');
    const emailInput = document.getElementById('project-email-input');
    const textInput = document.getElementById('project-text-input');
    const errorBox = document.getElementById('project-error');
    const deleteButton = document.getElementById('btn-delete-project');

    function clearModal() {
        projectIdInput.value = '';
        projectNameInput.value = '';
        typeInput.value = '';
        statusInput.value = '';
        descriptionInput.value = '';
        notesInput.value = '';
        emailInput.value = '';
        textInput.value = '';
        errorBox.textContent = '';
        modalTitle.textContent = 'Add Project';
        deleteButton.style.display = 'none';
    }

    function openModal(project = null) {
        clearModal();

        if (project) {
            projectIdInput.value = project.id || '';
            projectNameInput.value = project.project_name || project.name || '';
            typeInput.value = project.type || '';
            statusInput.value = project.status || '';
            descriptionInput.value = project.description || '';
            notesInput.value = project.notes || '';
            emailInput.value = project.email_to || '';
            textInput.value = project.text_to || '';
            modalTitle.textContent = 'Edit Project';
            deleteButton.style.display = 'block';
        }

        modalBackdrop.style.display = 'flex';
    }

    document.getElementById('btn-add-project').addEventListener('click', () => {
        openModal();
    });

    document.querySelectorAll('.project-record-button').forEach(button => {
        button.addEventListener('click', () => {
            const projectId = button.dataset.id;
            const project = projects.find(p => String(p.id) === String(projectId));
            if (project) openModal(project);
        });
    });

    document.getElementById('btn-cancel-project').addEventListener('click', () => {
        modalBackdrop.style.display = 'none';
    });

document.getElementById('btn-back-facility').addEventListener('click', () => {
    if (window.navigateTo) window.navigateTo('facilities-home');
    });

    deleteButton.addEventListener('click', async () => {
        const projectId = projectIdInput.value;

        if (!projectId) return;
        if (!confirm('Are you sure you want to delete this project?')) return;

        const { error } = await deleteProject(projectId);

        if (error) {
            console.error('Delete project error:', error);
            errorBox.textContent = 'Could not delete project.';
            return;
        }

        modalBackdrop.style.display = 'none';
        await renderProjectsGrid(containerId, context);
    });

    document.getElementById('btn-save-project').addEventListener('click', async () => {
        const projectId = projectIdInput.value;
        const projectName = projectNameInput.value.trim();

        if (!projectName) {
            errorBox.textContent = 'Project name required.';
            return;
        }

        const payload = {
            facilities_id: facilityId,
            location_id: facilityId,
            name: projectName,
            project_name: projectName,
            type: typeInput.value.trim(),
            status: statusInput.value.trim(),
            description: descriptionInput.value.trim(),
            notes: notesInput.value.trim(),
            email_to: emailInput.value.trim(),
            text_to: textInput.value.trim()
        };

        if (projectId) {
            const { error } = await updateProject(projectId, payload);

            if (error) {
                console.error('Update project error:', error);
                errorBox.textContent = 'Could not update project.';
                return;
            }
        } else {
            const { error } = await createProject(payload);

            if (error) {
                console.error('Insert project error:', error);
                errorBox.textContent = 'Could not save project.';
                return;
            }
        }

        modalBackdrop.style.display = 'none';
        await renderProjectsGrid(containerId, context);
    });
}
