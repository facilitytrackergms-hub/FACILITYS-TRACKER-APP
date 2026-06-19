/*================================================================
PROJECT-PHOTOS DATA
VERSION: v2026_06_18_project_photos_new
================================================================*/

import { supabase } from '../../global_engine/supabaseClient.js';

export async function fetchProjectPhotos(projectId, photoType) {
    const { data, error } = await supabase
        .from('project_photos')
        .select('*')
        .eq('project_id', projectId)
        .eq('photo_type', photoType)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Fetch project photos error:', error);
        return [];
    }

    return data || [];
}

export async function createProjectPhoto(payload) {
    return await supabase
        .from('project_photos')
        .insert([payload])
        .select('*')
        .single();
}

export async function deleteProjectPhoto(photoId) {
    return await supabase
        .from('project_photos')
        .delete()
        .eq('id', photoId);
}
