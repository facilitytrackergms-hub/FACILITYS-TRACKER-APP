/* ================================================================
   PURPOSE: Grid view for Facility Projects with Before/During/After Images
   LOCATION: /FACILITYS-TRACKER-APP/view_4_projects/view_4_projects_grid.js
   LAST UPDATED: 2026-06-16 @ 11:25 PM
   VERSION: v2026_06_16_view_images_by_category_fix
   ================================================================ */

import {
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    fetchProjectImages,
    addProjectImage
} from './view_4_projects_data.js';

import { supabase } from '../00_global_engine/supabaseClient.js';

const __FILENAME = 'view_4_projects_grid.js';
const __VERSION = 'v2026_06_16_view_images_by_category_fix';
const __UPDATED = '2026-06-16 @ 11:25 PM';

function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function renderBottomVersionTag() {
    return `
        <div style="margin-top: 18px; padding: 8px; text-align: center; font-size: 10px; color: #666; border-top: 1px solid #ddd;">
            ${__FILENAME} | ${__VERSION} | ${__UPDATED}
        </div>
    `;
}

export async function renderProjects(location) {
    const app = document.getElementById('app');
    if (!app) return;

    if (!location || !location.id) {
        app.innerHTML = `
            <div style="padding:20px; max-width:400px; margin:auto; font-family:sans-serif; text-align:center;">
                <p style="color:red;">Location missing.</p>
                <button onclick="window.navigateTo('locations')" style="width:100%; padding:15px; background:#6c757d; color:white; border:none; border-radius:6px;">BACK</button>
                ${renderBottomVersionTag()}
            </div>
        `;
        return;
    }

    const projects = await fetchProjects(location.id);
    const locationName = escapeHtml(location.number_name || location.name || location.abbreviation || 'LOCATION');

    app.innerHTML = `
        <div style="padding:20px; max-width:400px; margin:auto; font-family:sans-serif;">
            <h1 style="text-align:center; margin:0 0 8px 0; color:#003366;">PROJECTS</h1>
            <div style="text-align:center; font-size:13px; color:#555; margin-bottom:18px;">${locationName}</div>

            <button id="addProjectBtn" style="width:100%; padding:15px; background:#28a745; color:white; border:none; border-radius:6px; font-weight:bold; margin-bottom:15px;">
                ADD PROJECT
            </button>

            <div id="projectModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.55); padding:20px; box-sizing:border-box; z-index:100; overflow:auto;">
                <form id="projectForm" style="background:white; padding:20px; border-radius:8px; margin-top:35px;">
                    <input type="hidden" id="projectId">

                    <input type="text" id="projectName" placeholder="Project Name" required
                        style="width:100%; padding:10px; margin-bottom:10px; box-sizing:border-box;">

                    <input type="text" id="projectStatus" placeholder="Status" value="open"
                        style="width:100%; padding:10px; margin-bottom:10px; box-sizing:border-box;">

                    <input type="email" id="projectEmailTo" placeholder="Email To"
                        style="width:100%; padding:10px; margin-bottom:10px; box-sizing:border-box;">

                    <input type="tel" id="projectTextTo" placeholder="Text To"
                        style="width:100%; padding:10px; margin-bottom:10px; box-sizing:border-box;">

                    <textarea id="projectNotes" placeholder="Notes"
                        style="width:100%; padding:10px; margin-bottom:10px; box-sizing:border-box; min-height:80px;"></textarea>

                    <button type="submit" style="width:100%; padding:12px; background:#28a745; color:white; border:none; border-radius:5px; font-weight:bold;">
                        SAVE PROJECT
                    </button>

                    <button type="button" id="cancelProjectBtn" style="width:100%; padding:12px; background:#6c757d; color:white; border:none; border-radius:5px; margin-top:10px;">
                        CANCEL
                    </button>
                </form>
            </div>

            <div id="imageModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.55); padding:20px; box-sizing:border-box; z-index:101;">
                <form id="imageForm" style="background:white; padding:20px; border-radius:8px; margin-top:50px;">
                    <input type="hidden" id="imageProjectId">
                    <input type="hidden" id="imageType">

                    <h3 id="imageModalTitle" style="margin-top:0; color:#003366; text-align:center;">ADD IMAGE</h3>

                    <input type="file" id="projectImageInput" accept="image/*" required
                        style="width:100%; padding:10px; margin-bottom:10px; box-sizing:border-box;">

                    <button type="submit" style="width:100%; padding:12px; background:#28a745; color:white; border:none; border-radius:5px; font-weight:bold;">
                        SAVE IMAGE
                    </button>

                    <button type="button" id="cancelImageBtn" style="width:100%; padding:12px; background:#6c757d; color:white; border:none; border-radius:5px; margin-top:10px;">
                        CANCEL
                    </button>
                </form>
            </div>

            <div style="display:grid; gap:12px;">
                ${projects.length === 0 ? `
                    <div style="padding:15px; text-align:center; border:1px solid #ddd; border-radius:8px; color:#666;">
                        No projects yet.
                    </div>
                ` : projects.map(project => `
                    <div style="border:1px solid #ddd; border-radius:10px; padding:14px; background:white;">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
                            <div>
                                <div style="font-weight:bold; font-size:17px; color:#003366;">${escapeHtml(project.project_name)}</div>
                                <div style="font-size:13px; color:#555;">Status: ${escapeHtml(project.status || 'open')}</div>
                            </div>
                            <div style="display:flex; gap:5px;">
                                <button class="editProjectBtn" data-id="${project.id}" style="padding:5px 8px; background:#e9ecef; border:1px solid #ccc; border-radius:4px;">Edit</button>
                                <button class="deleteProjectBtn" data-id="${project.id}" data-name="${escapeHtml(project.project_name)}" style="padding:5px 8px; background:#dc3545; color:white; border:none; border-radius:4px;">🗑️</button>
                            </div>
                        </div>

                        <div style="margin-top:10px; font-size:14px;">
                            ${project.notes ? `<div style="margin-top:8px; color:#555;">${escapeHtml(project.notes)}</div>` : ''}
                            ${project.email_to ? `<div style="margin-top:8px;">✉️ <a href="mailto:${escapeHtml(project.email_to)}?subject=${encodeURIComponent(project.project_name || 'Project')}" style="color:#003366;">Email Project</a></div>` : ''}
                            ${project.text_to ? `<div>💬 <a href="sms:${escapeHtml(project.text_to)}" style="color:#003366;">Text Project</a></div>` : ''}
                        </div>

                        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; margin-top:12px;">
                            <button class="projectImageBtn" data-id="${project.id}" data-type="before" style="padding:10px 5px; background:#003366; color:white; border:none; border-radius:6px; font-size:12px; font-weight:bold;">BEFORE</button>
                            <button class="projectImageBtn" data-id="${project.id}" data-type="during" style="padding:10px 5px; background:#003366; color:white; border:none; border-radius:6px; font-size:12px; font-weight:bold;">DURING</button>
                            <button class="projectImageBtn" data-id="${project.id}" data-type="after" style="padding:10px 5px; background:#003366; color:white; border:none; border-radius:6px; font-size:12px; font-weight:bold;">AFTER</button>
                        </div>

                        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; margin-top:8px;">
                            <button class="viewProjectImagesBtn" data-id="${project.id}" data-type="before" style="padding:10px 5px; background:#6c757d; color:white; border:none; border-radius:6px; font-size:12px; font-weight:bold;">VIEW BEFORE</button>
                            <button class="viewProjectImagesBtn" data-id="${project.id}" data-type="during" style="padding:10px 5px; background:#6c757d; color:white; border:none; border-radius:6px; font-size:12px; font-weight:bold;">VIEW DURING</button>
                            <button class="viewProjectImagesBtn" data-id="${project.id}" data-type="after" style="padding:10px 5px; background:#6c757d; color:white; border:none; border-radius:6px; font-size:12px; font-weight:bold;">VIEW AFTER</button>
                        </div>
                    </div>
                `).join('')}
            </div>

            <button onclick="window.navigateTo('view_2_locations_details', ${JSON.stringify(location).replace(/"/g, '&quot;')})"
                style="width:100%; margin-top:16px; padding:15px; background:#6c757d; color:white; border:none; border-radius:6px;">
                BACK
            </button>

            ${renderBottomVersionTag()}
        </div>
    `;

    const projectModal = document.getElementById('projectModal');
    const projectForm = document.getElementById('projectForm');
    const imageModal = document.getElementById('imageModal');
    const imageForm = document.getElementById('imageForm');

    function clearProjectForm() {
        document.getElementById('projectId').value = '';
        document.getElementById('projectName').value = '';
        document.getElementById('projectStatus').value = 'open';
        document.getElementById('projectEmailTo').value = '';
        document.getElementById('projectTextTo').value = '';
        document.getElementById('projectNotes').value = '';
    }

    document.getElementById('addProjectBtn').onclick = () => {
        clearProjectForm();
        projectModal.style.display = 'block';
    };

    document.getElementById('cancelProjectBtn').onclick = () => {
        projectModal.style.display = 'none';
    };

    document.getElementById('cancelImageBtn').onclick = () => {
        imageModal.style.display = 'none';
    };

    document.querySelectorAll('.editProjectBtn').forEach(button => {
        button.onclick = () => {
            const projectId = button.dataset.id;
            const project = projects.find(p => String(p.id) === String(projectId));
            if (!project) return;

            document.getElementById('projectId').value = project.id;
            document.getElementById('projectName').value = project.project_name || '';
            document.getElementById('projectStatus').value = project.status || 'open';
            document.getElementById('projectEmailTo').value = project.email_to || '';
            document.getElementById('projectTextTo').value = project.text_to || '';
            document.getElementById('projectNotes').value = project.notes || '';

            projectModal.style.display = 'block';
        };
    });

    document.querySelectorAll('.deleteProjectBtn').forEach(button => {
        button.onclick = async () => {
            const projectId = button.dataset.id;
            const projectName = button.dataset.name || 'this project';

            if (!confirm(`Delete ${projectName}?`)) return;

            const { error } = await deleteProject(projectId);

            if (error) {
                alert('Error: ' + error.message);
                return;
            }

            renderProjects(location);
        };
    });

    document.querySelectorAll('.projectImageBtn').forEach(button => {
        button.onclick = () => {
            const projectId = button.dataset.id;
            const imageType = button.dataset.type;

            document.getElementById('imageProjectId').value = projectId;
            document.getElementById('imageType').value = imageType;
            document.getElementById('projectImageInput').value = '';
            document.getElementById('imageModalTitle').textContent = `ADD ${imageType.toUpperCase()} IMAGE`;

            imageModal.style.display = 'block';
        };
    });

    document.querySelectorAll('.viewProjectImagesBtn').forEach(button => {
        button.onclick = async () => {
            const projectId = button.dataset.id;
            const imageType = button.dataset.type;
            const allImages = await fetchProjectImages(projectId);
            const images = allImages.filter(img => img.image_type === imageType);

            if (!images.length) {
                alert(`No ${imageType} images found for this project.`);
                return;
            }

            app.innerHTML = `
                <div style="padding:20px; max-width:400px; margin:auto; font-family:sans-serif;">
                    <h1 style="text-align:center; color:#003366;">${imageType.toUpperCase()} IMAGES</h1>

                    <div style="display:grid; gap:12px;">
                        ${images.map(img => `
                            <div style="border:1px solid #ddd; border-radius:10px; padding:10px; background:white;">
                                <div style="font-weight:bold; color:#003366; margin-bottom:8px; text-transform:uppercase;">${escapeHtml(img.image_type)}</div>
                                <img src="${escapeHtml(img.image_url)}" style="width:100%; max-height:260px; object-fit:cover; border-radius:8px;">
                            </div>
                        `).join('')}
                    </div>

                    <button onclick="window.navigateTo('view_4_projects', ${JSON.stringify(location).replace(/"/g, '&quot;')})"
                        style="width:100%; margin-top:16px; padding:15px; background:#6c757d; color:white; border:none; border-radius:6px;">
                        BACK
                    </button>

                    ${renderBottomVersionTag()}
                </div>
            `;
        };
    });

    projectForm.onsubmit = async (e) => {
        e.preventDefault();

        const projectId = document.getElementById('projectId').value;

        const projectData = {
            location_id: location.id,
            project_name: document.getElementById('projectName').value.trim(),
            status: document.getElementById('projectStatus').value.trim() || 'open',
            email_to: document.getElementById('projectEmailTo').value.trim(),
            text_to: document.getElementById('projectTextTo').value.trim(),
            notes: document.getElementById('projectNotes').value.trim()
        };

        let result;

        if (projectId) {
            result = await updateProject(projectId, projectData);
        } else {
            result = await createProject(projectData);
        }

        if (result.error) {
            alert('Error: ' + result.error.message);
            return;
        }

        projectModal.style.display = 'none';
        renderProjects(location);
    };

    imageForm.onsubmit = async (e) => {
        e.preventDefault();

        const projectId = document.getElementById('imageProjectId').value;
        const imageType = document.getElementById('imageType').value;
        const imageFile = document.getElementById('projectImageInput').files[0];

        if (!projectId || !imageType || !imageFile) return;

        const sanitizedName = imageFile.name
            .replace(/\s+/g, '_')
            .replace(/[^a-zA-Z0-9._-]/g, '');

        const fileName = `projects/${projectId}/${imageType}/${Date.now()}_${sanitizedName}`;

        const { error: uploadError } = await supabase.storage
            .from('locations-images')
            .upload(fileName, imageFile);

        if (uploadError) {
            console.error('Project Image Upload Error:', uploadError);
            alert('Image upload failed: ' + uploadError.message);
            return;
        }

        const { data } = supabase.storage
            .from('locations-images')
            .getPublicUrl(fileName);

        const result = await addProjectImage({
            project_id: Number(projectId),
            location_id: location.id,
            image_url: data.publicUrl,
            image_type: imageType
        });

        if (result.error) {
            alert('Error: ' + result.error.message);
            return;
        }

        imageModal.style.display = 'none';
        renderProjects(location);
    };
}
