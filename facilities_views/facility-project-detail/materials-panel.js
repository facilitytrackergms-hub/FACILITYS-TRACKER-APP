/* =========================================================
   MATERIALS PANEL MODULE
   Router Compatible Version
========================================================= */

import { supabase } from '../../global_engine/supabaseClient.js';

/* =========================================================
   ROUTER ENTRY
========================================================= */
export function render(project) {
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

            <button id="add-material-btn" class="blue-btn">Add Material</button>
            <button id="back-project-btn" class="blue-btn secondary">Back</button>

            <div id="materials-list"></div>
        </div>

        <style>
            .blue-btn{
                background:#1e6fff;
                color:white;
                border:none;
                padding:8px 14px;
                border-radius:8px;
                cursor:pointer;
                margin:4px;
                font-weight:600;
            }

            .blue-btn.secondary{
                background:#6b7280;
            }

            .material-card{
                background:#fff;
                margin:10px 0;
                padding:12px;
                border-radius:10px;
                border:1px solid #e5e7eb;
            }

            .material-title{
                font-weight:700;
                font-size:16px;
                margin-bottom:6px;
            }

            .row{
                display:flex;
                gap:8px;
                align-items:center;
                flex-wrap:wrap;
                font-size:13px;
                color:#444;
            }

            .small-btn{
                background:#1e6fff;
                color:white;
                border:none;
                padding:5px 10px;
                border-radius:6px;
                cursor:pointer;
            }

            .delete-btn{
                background:#ef4444;
            }

            select,input{
                padding:4px;
                border-radius:6px;
                border:1px solid #ccc;
            }

            .img-row{
                display:flex;
                gap:6px;
                margin-top:8px;
                flex-wrap:wrap;
            }

            .img-row img{
                width:70px;
                height:70px;
                object-fit:cover;
                border-radius:6px;
                border:1px solid #ddd;
            }
        </style>
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
        row.className = "material-card";

        row.innerHTML = `
            <div class="material-title">${m.material_name}</div>

            <div class="row">
                Qty:
                <input type="number" value="${m.quantity || ''}" id="qty-${m.id}">
                
                Status:
                <select id="status-${m.id}">
                    <option value="normal" ${m.material_status === 'normal' ? 'selected' : ''}>normal</option>
                    <option value="low" ${m.material_status === 'low' ? 'selected' : ''}>low</option>
                    <option value="ordered" ${m.material_status === 'ordered' ? 'selected' : ''}>ordered</option>
                </select>

                <button class="small-btn" onclick="saveMaterial('${m.id}')">Save</button>
                <button class="small-btn delete-btn" onclick="deleteMaterial('${m.id}')">Delete</button>
                <button class="small-btn" onclick="openMaterialDetail(${projectId}, ${m.id})">Photos</button>
            </div>

            <div class="img-row" id="imgs-${m.id}"></div>
        `;

        list.appendChild(row);

        loadMaterialImages(projectId, m.id);
    });
}

/* =========================================================
   SAVE MATERIAL
========================================================= */
window.saveMaterial = async function(id){
    const qty = document.getElementById(`qty-${id}`).value;
    const status = document.getElementById(`status-${id}`).value;

    await supabase.from('project_materials')
        .update({
            quantity: qty,
            material_status: status
        })
        .eq('id', id);

    loadMaterials(window.currentProjectId);
};

/* =========================================================
   DELETE MATERIAL
========================================================= */
window.deleteMaterial = async function(id){
    await supabase.from('project_materials')
        .delete()
        .eq('id', id);

    loadMaterials(window.currentProjectId);
};

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
            material_status: 'normal',
            quantity: 0
        })
        .then(() => loadMaterials(projectId));
}

/* =========================================================
   MATERIAL DETAIL (PHOTOS)
========================================================= */
window.openMaterialDetail = function(projectId, materialId){
    openMaterialsPanel({ id: projectId });
};

/* =========================================================
   LOAD IMAGES PER MATERIAL
========================================================= */
async function loadMaterialImages(projectId, materialId) {
    const { data } = await supabase
        .from('projects_images')
        .select('*')
        .eq('project_id', projectId)
        .eq('material_id', materialId);

    const box = document.getElementById(`imgs-${materialId}`);
    if (!box) return;

    box.innerHTML = '';

    (data || []).forEach(img => {
        const el = document.createElement('img');
        el.src = img.image_url;
        box.appendChild(el);
    });
}
