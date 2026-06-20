/* =========================================================
   MATERIALS PANEL MODULE
   Router Compatible Version
========================================================= */

import { supabase } from '../../global_engine/supabaseClient.js';

/* =========================================================
   ROUTER ENTRY POINTS
========================================================= */
export function render(project) {
    openMaterialsPanel(project);
}

export function renderFacilityMaterialsGrid(project) {
    openMaterialsPanel(project);
}

/* =========================================================
   MAIN PANEL
========================================================= */
export function openMaterialsPanel(project) {
    const container = document.getElementById('app-container');

    container.innerHTML = `
        <div style="padding:12px;">
            <h2>Materials</h2>

            <button id="add-material-btn">Add Material</button>
            <button id="back-project-btn">Back</button>

            <div id="materials-list"></div>
        </div>
    `;

    document.getElementById('back-project-btn').onclick = () => {
        window.navigateTo('facility-project-detail', {
            project_id: project.id
        });
    };

    document.getElementById('add-material-btn').onclick = () => {
        addMaterial(project.id);
    };

    loadMaterials(project.id);
}

/* =========================================================
   LOAD MATERIALS
========================================================= */
async function loadMaterials(projectId) {
    const { data } = await supabase
        .from('project_materials')
        .select('*')
        .eq('project_id', projectId);

    const list = document.getElementById('materials-list');
    list.innerHTML = '';

    (data || []).forEach(m => {
        const row = document.createElement('div');

        row.style.padding = "10px";
        row.style.borderBottom = "1px solid #ddd";
        row.style.cursor = "pointer";

        row.innerHTML = `
            <div><b>${m.material_name}</b></div>
            <div>${m.quantity || ''}</div>
            <div>${m.material_status || ''}</div>
        `;

        row.onclick = () => openMaterialDetail(projectId, m);

        list.appendChild(row);
    });
}

/* =========================================================
   ADD MATERIAL
========================================================= */
function addMaterial(projectId) {
    const name = prompt("Material name");
    if (!name) return;

    supabase.from('project_materials')
        .insert({
            project_id: projectId,
            material_name: name,
            material_status: 'normal'
        })
        .then(() => loadMaterials(projectId));
}

/* =========================================================
   MATERIAL DETAIL VIEW
========================================================= */
function openMaterialDetail(projectId, material) {
    const container = document.getElementById('app-container');

    container.innerHTML = `
        <div style="padding:12px;">
            <h2>${material.material_name}</h2>

            <button id="add-photo-btn">Add Photo</button>
            <button id="back-btn">Back</button>

            <div id="photo-list"></div>
        </div>
    `;

    document.getElementById('back-btn').onclick = () => {
        window.navigateTo('facility-project-detail', {
            project_id: projectId
        });
    };

    document.getElementById('add-photo-btn').onclick = () => {
        const input = document.createElement('input');
        input.type = 'file';

        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const url = await uploadProjectImage(file, projectId);

            await supabase.from('projects_images').insert({
                project_id: projectId,
                image_url: url,
                image_type: 'material'
            });

            loadMaterialImages(projectId);
        };

        input.click();
    };

    loadMaterialImages(projectId);
}

/* =========================================================
   LOAD MATERIAL IMAGES
========================================================= */
async function loadMaterialImages(projectId) {
    const { data } = await supabase
        .from('projects_images')
        .select('*')
        .eq('project_id', projectId)
        .eq('image_type', 'material');

    const list = document.getElementById('photo-list');
    list.innerHTML = '';

    (data || []).forEach(img => {
        const el = document.createElement('img');
        el.src = img.image_url;
        el.style.width = "80px";
        el.style.margin = "5px";

        list.appendChild(el);
    });
}
