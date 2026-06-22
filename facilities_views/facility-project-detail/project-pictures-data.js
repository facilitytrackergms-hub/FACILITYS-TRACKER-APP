/*================================================================
FACILITY-PROJECT-DETAIL PROJECT PICTURES DATA
LOCATION: /facilities_views/facility-project-detail/project-pictures-data.js
VERSION: v2026_06_22_project_pictures_data_new
UPDATED: 2026-06-22 @ 9:40 AM EDT
================================================================*/

import { supabase } from '../../global_engine/supabaseClient.js';

const PROJECT_IMAGE_BUCKET = 'locations-images';
const PROJECT_IMAGE_TABLE = 'projects_images';

function buildProjectImagePath(projectId, file) {
    const timestamp = Date.now();
    const cleanName = String(file.name || 'project-image.jpg')
        .replaceAll(' ', '-')
        .replace(/[^a-zA-Z0-9._-]/g, '');

    return `projects/project-${projectId}/${timestamp}-${cleanName}`;
}

export async function uploadProjectPicture({ file, projectId, facilitiesId }) {
    if (!file) {
        return { data: null, error: { message: 'No image selected.' } };
    }

    if (!projectId) {
        return { data: null, error: { message: 'Missing project ID.' } };
    }

    const filePath = buildProjectImagePath(projectId, file);

    const { error: uploadError } = await supabase.storage
        .from(PROJECT_IMAGE_BUCKET)
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (uploadError) {
        console.error('Upload project picture error:', uploadError);
        return { data: null, error: uploadError };
    }

    const { data: publicUrlData } = supabase.storage
        .from(PROJECT_IMAGE_BUCKET)
        .getPublicUrl(filePath);

    const imageUrl = publicUrlData?.publicUrl || '';

    const { data, error } = await supabase
        .from(PROJECT_IMAGE_TABLE)
        .insert([{
            project_id: projectId,
            facilities_id: facilitiesId || null,
            image_url: imageUrl,
            image_type: 'project',
            material_id: null
        }])
        .select('*')
        .single();

    if (error) {
        console.error('Save project picture record error:', error);
        return { data: null, error };
    }

    return { data, error: null };
}

export async function fetchProjectPictures(projectId) {
    const { data, error } = await supabase
        .from(PROJECT_IMAGE_TABLE)
        .select('*')
        .eq('project_id', projectId)
        .eq('image_type', 'project')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Fetch project pictures error:', error);
        return [];
    }

    return data || [];
}

export async function deleteProjectPicture(imageId) {
    return await supabase
        .from(PROJECT_IMAGE_TABLE)
        .delete()
        .eq('id', imageId);
}
