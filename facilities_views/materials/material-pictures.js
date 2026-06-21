/*================================================================
SYSTEM: Facility Tracker Modular View System
PURPOSE: Material picture upload and gallery helper
LOCATION: /facilities_views/materials/material-pictures.js
VERSION: v2026_06_21_material_pictures_gallery_connected
UPDATED: 2026-06-21
LINES: 286
================================================================*/

import { supabase } from '../../global_engine/supabaseClient.js';
import { openOkPopup } from './popups.js';

const STORAGE_BUCKET = 'locations-images';
const IMAGE_TABLE = 'projects_images';

/*================================================================
OPEN PHONE CAMERA / IMAGE PICKER
================================================================*/
export function openMaterialPicturePicker(material = {}, afterSave = null) {
    const materialId = material?.id || '';

    if (!materialId) {
        openOkPopup('Missing material id.');
        return;
    }

    const input = document.createElement('input');

    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.style.display = 'none';

    document.body.appendChild(input);

    input.addEventListener('change', async () => {
        const file = input.files && input.files[0];

        if (!file) {
            input.remove();
            return;
        }

        await uploadMaterialPicture(file, material, afterSave);
        input.remove();
    });

    input.click();
}

/*================================================================
UPLOAD MATERIAL PICTURE
================================================================*/
async function uploadMaterialPicture(file, material = {}, afterSave = null) {
    const materialId = material?.id || '';
    const projectId = material?.project_id || window.currentProjectId || '';
    const facilitiesId = material?.facilities_id || material?.facility_id || window.currentFacilityId || '';

    if (!projectId) {
        openOkPopup('Missing project id.');
        return;
    }

    if (!materialId) {
        openOkPopup('Missing material id.');
        return;
    }

    const cleanName = cleanFileName(file.name);
    const imagePath = buildImagePath(projectId, materialId, cleanName);

    const { error: uploadError } = await supabase
        .storage
        .from(STORAGE_BUCKET)
        .upload(imagePath, file);

    if (uploadError) {
        console.error('Material image upload error:', uploadError);
        openOkPopup('Picture was not uploaded.');
        return;
    }

    const { data } = supabase
        .storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(imagePath);

    const imageUrl = data?.publicUrl || '';

    if (!imageUrl) {
        openOkPopup('Picture uploaded but public URL was not created.');
        return;
    }

    const saved = await saveMaterialPictureRecord({
        projectId,
        facilitiesId,
        materialId,
        imageUrl
    });

    if (!saved) {
        openOkPopup('Picture uploaded, but the database record was not saved.');
        return;
    }

    if (typeof afterSave === 'function') {
        await afterSave();
    }

    openOkPopup('Picture saved.');
}

/*================================================================
SAVE IMAGE RECORD
================================================================*/
async function saveMaterialPictureRecord(payload = {}) {
    const record = {
        project_id: Number(payload.projectId),
        material_id: Number(payload.materialId),
        facilities_id: payload.facilitiesId ? Number(payload.facilitiesId) : null,
        image_url: payload.imageUrl,
        image_type: 'material'
    };

    if (!record.facilities_id) {
        delete record.facilities_id;
    }

    const { error } = await supabase
        .from(IMAGE_TABLE)
        .insert([record]);

    if (error) {
        console.error('Material image record insert error:', error);
        return false;
    }

    return true;
}

/*================================================================
RENDER MATERIAL THUMBNAILS
================================================================*/
export async function renderMaterialPictureThumbnails(material = {}) {
    const holder = document.getElementById('material-picture-thumbnails');

    if (!holder) {
        return;
    }

    holder.innerHTML = '';

    const pictures = await fetchMaterialPictures(material);

    if (!pictures.length) {
        return;
    }

    holder.innerHTML = `
        <div style="
            margin-top:12px;
            display:flex;
            gap:8px;
            overflow-x:auto;
            padding:6px 2px;
        ">
            ${pictures.map((picture, index) => `
                <img
                    src="${escapeHtml(picture.image_url)}"
                    data-material-picture-index="${index}"
                    style="
                        width:64px;
                        height:64px;
                        object-fit:cover;
                        border-radius:8px;
                        border:2px solid #cbd5e1;
                        cursor:pointer;
                        flex:0 0 auto;
                    "
                >
            `).join('')}
        </div>
    `;

    holder.querySelectorAll('[data-material-picture-index]').forEach(img => {
        img.addEventListener('click', () => {
            const index = Number(img.dataset.materialPictureIndex || 0);
            openPictureOverlay(pictures, index);
        });
    });
}

/*================================================================
OPEN MATERIAL PICTURE VIEWER
================================================================*/
export async function openMaterialPictureViewer(material = {}) {
    const pictures = await fetchMaterialPictures(material);

    if (!pictures.length) {
        openOkPopup('No pictures found for this material.');
        return;
    }

    openPictureOverlay(pictures, 0);
}

/*================================================================
FETCH MATERIAL PICTURES
================================================================*/
async function fetchMaterialPictures(material = {}) {
    const materialId = material?.id || '';

    if (!materialId) {
        return [];
    }

    const { data, error } = await supabase
        .from(IMAGE_TABLE)
        .select('id, image_url, created_at')
        .eq('image_type', 'material')
        .eq('material_id', Number(materialId))
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Material pictures fetch error:', error);
        return [];
    }

    return data || [];
}

/*================================================================
FULL SCREEN OVERLAY
================================================================*/
function openPictureOverlay(pictures = [], startIndex = 0) {
    let currentIndex = startIndex;

    let overlay = document.getElementById('material-picture-fullscreen-overlay');

    if (overlay) {
        overlay.remove();
    }

    overlay = document.createElement('div');
    overlay.id = 'material-picture-fullscreen-overlay';
    overlay.style.cssText = `
        position:fixed;
        inset:0;
        background:rgba(0,0,0,0.95);
        z-index:10000;
        display:flex;
        align-items:center;
        justify-content:center;
        overflow:hidden;
    `;

    overlay.innerHTML = `
        <button id="material-picture-overlay-close" style="
            position:absolute;
            top:12px;
            right:12px;
            background:#b91c1c;
            color:#ffff00;
            border:none;
            border-radius:8px;
            padding:10px 14px;
            font-size:18px;
            font-weight:bold;
            z-index:10001;
        ">X</button>

        <button id="material-picture-overlay-prev" style="
            position:absolute;
            left:8px;
            top:50%;
            transform:translateY(-50%);
            background:rgba(255,255,255,0.25);
            color:white;
            border:none;
            border-radius:50%;
            width:44px;
            height:44px;
            font-size:28px;
            font-weight:bold;
            z-index:10001;
        ">‹</button>

        <img id="material-picture-overlay-img" style="
            max-width:100%;
            max-height:100%;
            object-fit:contain;
        ">

        <button id="material-picture-overlay-next" style="
            position:absolute;
            right:8px;
            top:50%;
            transform:translateY(-50%);
            background:rgba(255,255,255,0.25);
            color:white;
            border:none;
            border-radius:50%;
            width:44px;
            height:44px;
            font-size:28px;
            font-weight:bold;
            z-index:10001;
        ">›</button>
    `;

    document.body.appendChild(overlay);

    const img = document.getElementById('material-picture-overlay-img');
    const closeBtn = document.getElementById('material-picture-overlay-close');
    const prevBtn = document.getElementById('material-picture-overlay-prev');
    const nextBtn = document.getElementById('material-picture-overlay-next');

    function showImage() {
        img.src = pictures[currentIndex].image_url;
    }

    function showPrev() {
        currentIndex = currentIndex <= 0 ? pictures.length - 1 : currentIndex - 1;
        showImage();
    }

    function showNext() {
        currentIndex = currentIndex >= pictures.length - 1 ? 0 : currentIndex + 1;
        showImage();
    }

    closeBtn.onclick = () => overlay.remove();
    prevBtn.onclick = showPrev;
    nextBtn.onclick = showNext;

    let touchStartX = 0;

    overlay.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });

    overlay.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].screenX;
        const difference = touchEndX - touchStartX;

        if (difference > 50) {
            showPrev();
        }

        if (difference < -50) {
            showNext();
        }
    });

    showImage();
}

/*================================================================
HELPERS
================================================================*/
function buildImagePath(projectId, materialId, fileName) {
    const projectPart = projectId ? `project_${projectId}` : 'project_unknown';
    const materialPart = materialId ? `material_${materialId}` : 'material_unknown';

    return `materials/${projectPart}/${materialPart}/${Date.now()}_${fileName}`;
}

function cleanFileName(fileName = '') {
    return String(fileName || 'material-picture.jpg')
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .toLowerCase();
}

function escapeHtml(value = '') {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
