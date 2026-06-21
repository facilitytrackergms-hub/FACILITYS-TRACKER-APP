/*================================================================
SYSTEM: Facility Tracker Modular View System
PURPOSE: Material picture upload helper
LOCATION: /facilities_views/materials/material-pictures.js
VERSION: v2026_06_21_material_pictures_material_id_connected
UPDATED: 2026-06-21
LINES: 125
================================================================*/

import { supabase } from '../../global_engine/supabaseClient.js';
import { openOkPopup } from './popups.js';

const STORAGE_BUCKET = 'locations-images';
const IMAGE_TABLE = 'projects_images';

/*================================================================
OPEN PHONE CAMERA / IMAGE PICKER
================================================================*/
export function openMaterialPicturePicker(material = {}) {
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

        await uploadMaterialPicture(file, material);
        input.remove();
    });

    input.click();
}

/*================================================================
UPLOAD MATERIAL PICTURE
================================================================*/
async function uploadMaterialPicture(file, material = {}) {
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
