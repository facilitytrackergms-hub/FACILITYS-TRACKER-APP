/*================================================================
FACILITY-PROJECT-DETAIL DATA
VERSION: v2026_06_18_project_update_images_added
================================================================*/

import { supabase } from '../../global_engine/supabaseClient.js';

export async function fetchProjectDetail(projectId) {
    return await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();
}

export async function updateProjectDetail(projectId, payload) {
    return await supabase
        .from('projects')
        .update(payload)
        .eq('id', projectId)
        .select('*')
        .single();
}

export async function deleteProjectDetail(projectId) {
    return await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);
}

export async function fetchProjectUpdates(projectId) {
    const { data, error } = await supabase
        .from('project_updates')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Fetch project updates error:', error);
        return [];
    }

    return data || [];
}

export async function createProjectUpdate(payload) {
    return await supabase
        .from('project_updates')
        .insert([payload])
        .select('*')
        .single();
}

export async function createProjectPhoto(payload) {
    return await supabase
        .from('project_photos')
        .insert([payload])
        .select('*')
        .single();
}
