/* ================================================================
   PURPOSE: Data service for Facility Projects
   LOCATION: /FACILITYS-TRACKER-APP/view_4_projects/view_4_projects_data.js
   LAST UPDATED: 2026-06-16 @ 11:05 PM
   VERSION: v2026_06_16_projects_new_build
   ================================================================ */

import { supabase } from '../00_global_engine/supabaseClient.js';

export async function fetchProjects(locationId) {
    if (!locationId) return [];

    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('location_id', locationId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching projects:', error);
        return [];
    }

    return data || [];
}

export async function createProject(projectData) {
    const { data, error } = await supabase
        .from('projects')
        .insert([projectData])
        .select()
        .single();

    if (error) {
        console.error('Error creating project:', error);
        return { data: null, error };
    }

    return { data, error: null };
}

export async function updateProject(projectId, projectData) {
    const { data, error } = await supabase
        .from('projects')
        .update(projectData)
        .eq('id', projectId)
        .select()
        .single();

    if (error) {
        console.error('Error updating project:', error);
        return { data: null, error };
    }

    return { data, error: null };
}

export async function deleteProject(projectId) {
    const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

    if (error) {
        console.error('Error deleting project:', error);
        return { error };
    }

    return { error: null };
}

export async function fetchProjectImages(projectId) {
    if (!projectId) return [];

    const { data, error } = await supabase
        .from('project_images')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching project images:', error);
        return [];
    }

    return data || [];
}

export async function addProjectImage(imageData) {
    const { data, error } = await supabase
        .from('project_images')
        .insert([imageData])
        .select()
        .single();

    if (error) {
        console.error('Error adding project image:', error);
        return { data: null, error };
    }

    return { data, error: null };
}
