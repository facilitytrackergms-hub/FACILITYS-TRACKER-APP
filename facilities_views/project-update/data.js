/*================================================================
PROJECT-UPDATE DATA
VERSION: v2026_06_18_project_update_new
================================================================*/

import { supabase } from '../../global_engine/supabaseClient.js';

export async function fetchProjectUpdate(updateId) {
    return await supabase
        .from('project_updates')
        .select('*')
        .eq('id', updateId)
        .single();
}

export async function updateProjectUpdate(updateId, payload) {
    return await supabase
        .from('project_updates')
        .update(payload)
        .eq('id', updateId)
        .select('*')
        .single();
}

export async function deleteProjectUpdate(updateId) {
    return await supabase
        .from('project_updates')
        .delete()
        .eq('id', updateId);
}

export async function fetchProjectUpdatePhotos(updateId, photoType) {
    const { data, error } = await supabase
        .from('project_photos')
        .select('*')
        .eq('project_update_id', updateId)
        .eq('photo_type', photoType)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Fetch project update photos error:', error);
        return [];
    }

    return data || [];
}

export async function createProjectUpdatePhoto(payload) {
    return await supabase
        .from('project_photos')
        .insert([payload])
        .select('*')
        .single();
}

export async function deleteProjectUpdatePhoto(photoId) {
    return await supabase
        .from('project_photos')
        .delete()
        .eq('id', photoId);
}
