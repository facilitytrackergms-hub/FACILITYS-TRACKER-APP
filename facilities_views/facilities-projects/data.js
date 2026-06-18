/* ================================================================
   PURPOSE: Project data service
   LOCATION: /facilities_views/facilities-projects/data.js
   VERSION: v2026_06_18_view_on_button_projects
   DATE: 2026-06-18
   ================================================================ */

import { supabase } from '../../global_engine/supabaseClient.js';

export async function fetchProjects(facilityId) {
    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('facilities_id', facilityId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching projects:', error);
        return [];
    }

    return data || [];
}

export async function createProject(payload) {
    return await supabase
        .from('projects')
        .insert([payload])
        .select('*')
        .single();
}

export async function updateProject(projectId, payload) {
    return await supabase
        .from('projects')
        .update(payload)
        .eq('id', projectId)
        .select('*')
        .single();
}

export async function deleteProject(projectId) {
    return await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);
}
