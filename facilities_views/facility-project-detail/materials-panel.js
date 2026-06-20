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

    window.currentProjectId = project.id;
    window.materialCollapseState = {};

    container.innerHTML = `
        <div style="padding:12px;">
            <h2>Materials</h2>

            <button id="add-material-btn" class="blue-btn">Add Material</button>
            <button id="back-project-btn" class="blue-btn secondary">Back</button>

            <div id="materials-list"></div>
        </div>

        <input type="file" id="camera-input" accept="image/*" capture="environment" style="display:none;"/>

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

            .blue-btn.secondary{ background:#6b7280; }

            .material-card{
                background:#fff;
                margin:10px 0;
                padding:12px;
                border-radius:10px;
                border:1px solid #e5e7eb;
                cursor:pointer;
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

            .delete-btn{ background:#ef4444; }

            .amazon-btn{
                background:#ff9900;
                color:#111;
                font-weight:700;
            }

            select,input,textarea{
                padding:4px;
                border-radius:6px;
                border:1px solid #ccc;
                width:100%;
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

            .img-actions{
                display:flex;
                gap:6px;
                margin-top:6px;
            }

            #photo-viewer{
                position:fixed;
                top:0;
                left:0;
                width:100%;
                height:100%;
                background:rgba(0,0,0,0.95);
                z-index:999999;
                display:flex;
                flex-wrap:wrap;
                gap:6px;
                padding:10px;
                overflow:auto;
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

    setupCamera(project.id);
    loadMaterials(project.id);
}

/* =========================================================
   CAMERA
========================================================= */
let activeMaterialId = null;

function setupCamera(projectId){
    const input = document.getElementById('camera-input');

    input.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file || !activeMaterialId) return;

        const fileName = `${Date.now()}_${file.name}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('project-materials')
            .upload(fileName, file);

        if (uploadError) {
            console.error('UPLOAD ERROR:', uploadError);
            return;
        }

        const url = supabase.storage
            .from('project-materials')
            .getPublicUrl(fileName).data.publicUrl;

        const { error: insertError } = await supabase.from('projects_images').insert({
            project_id: projectId,
            material_id: activeMaterialId,
            image_url: url
        });

        if (insertError) {
            console.error('DB INSERT ERROR:', insertError);
            return;
        }

        loadMaterialImages(projectId, activeMaterialId);
    });
}

/* =========================================================
   LOAD MATERIALS
========================================================= */
async function loadMaterials(projectId) {
    const { data } = await supabase
        .from('project_materials')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

    const list = document.getElementById('materials-list');
    list.innerHTML = '';

    (data || []).forEach(m => {

        const isCollapsed = window.materialCollapseState[m.id];

        const row = document.createElement('div');
        row.className = "material-card";

        row.innerHTML = `
            <div class="material-title" onclick="toggleMaterial('${m.id}')">
                ${m.material_name}
            </div>

            <div id="body-${m.id}" style="display:${isCollapsed ? 'none' : 'block'}">

                <textarea id="desc-${m.id}" placeholder="Description...">${m.description || ''}</textarea>

                <div class="row">
                    Qty:
                    <input type="number" value="${m.quantity || ''}" id="qty-${m.id}">

                    Status:
                    <select id="status-${m.id}">
                        <option value="need_by" ${m.material_status === 'need_by' ? 'selected' : ''}>need by</option>
                        <option value="both" ${m.material_status === 'both' ? 'selected' : ''}>both</option>
                    </select>

                    <button class="small-btn" onclick="saveMaterial('${m.id}')">Save</button>
                    <button class="small-btn delete-btn" onclick="deleteMaterial('${m.id}')">Delete</button>

                    <button class="small-btn" onclick="openMaterialDetail('${m.id}')">See Pics</button>
                    <button class="small-btn" onclick="addImage('${m.id}')">Add Images</button>

                    <button class="small-btn amazon-btn" onclick="openAmazon('${m.material_name}')">Amazon</button>
                </div>

                <div class="img-actions" id="img-actions-${m.id}"></div>
                <div class="img-row" id="imgs-${m.id}"></div>
            </div>
        `;

        list.appendChild(row);

        loadMaterialImages(projectId, m.id);
    });
}

/* =========================================================
   COLLAPSE
========================================================= */
window.toggleMaterial = function(id){
    window.materialCollapseState[id] = !window.materialCollapseState[id];
    loadMaterials(window.currentProjectId);
};

/* =========================================================
   SAVE / DELETE
========================================================= */
window.saveMaterial = async function(id){

    const qty = document.getElementById(`qty-${id}`).value;
    const status = document.getElementById(`status-${id}`).value;
    const desc = document.getElementById(`desc-${id}`).value;

    await supabase.from('project_materials')
        .update({
            quantity: qty,
            material_status: status,
            description: desc
        })
        .eq('id', id);

    window.materialCollapseState[id] = true;
    loadMaterials(window.currentProjectId);
};

window.deleteMaterial = async function(id){
    await supabase.from('project_materials')
        .delete()
        .eq('id', id);

    loadMaterials(window.currentProjectId);
};

/* =========================================================
   ADD MATERIAL
========================================================= */
function addMaterial(projectId){
    const name = prompt("Material name");
    if (!name) return;

    supabase.from('project_materials')
        .insert({
            project_id: projectId,
            material_name: name,
            material_status: 'need_by',
            quantity: 0,
            description: ''
        })
        .then(() => loadMaterials(projectId));
}

/* =========================================================
   AMAZON
========================================================= */
window.openAmazon = function(name){
    window.open(`https://www.amazon.com/s?k=${encodeURIComponent(name)}`, '_blank');
};

/* =========================================================
   IMAGE UPLOAD
========================================================= */
window.addImage = function(materialId){
    activeMaterialId = materialId;
    document.getElementById('camera-input').click();
};

/* =========================================================
   SEE PICS (FIXED + RELIABLE)
========================================================= */
window.openMaterialDetail = async function(materialId){

    const projectId = window.currentProjectId;

    const { data, error } = await supabase
        .from('projects_images')
        .select('*')
        .eq('project_id', projectId)
        .eq('material_id', materialId);

    if (error) {
        console.error('IMAGE FETCH ERROR:', error);
        return;
    }

    if (!data || data.length === 0) return;

    let html = '';

    data.forEach(img => {
        html += `<img src="${img.image_url}" style="
            width:110px;
            height:110px;
            object-fit:cover;
            border-radius:6px;
        ">`;
    });

    const viewer = document.createElement('div');
    viewer.id = "photo-viewer";
    viewer.innerHTML = html;

    viewer.onclick = () => viewer.remove();

    document.body.appendChild(viewer);
};

/* =========================================================
   LOAD IMAGES (FIXED COUNT RELIABILITY)
========================================================= */
async function loadMaterialImages(projectId, materialId){

    const { data, error } = await supabase
        .from('projects_images')
        .select('*')
        .eq('project_id', projectId)
        .eq('material_id', materialId);

    if (error) {
        console.error('LOAD IMAGES ERROR:', error);
    }

    const box = document.getElementById(`imgs-${materialId}`);
    const actions = document.getElementById(`img-actions-${materialId}`);

    if (!box) return;

    box.innerHTML = '';

    (data || []).forEach(img => {
        const el = document.createElement('img');
        el.src = img.image_url;
        box.appendChild(el);
    });

    if (actions) {
        actions.innerHTML = `<small>${(data || []).length} images</small>`;
    }
}
