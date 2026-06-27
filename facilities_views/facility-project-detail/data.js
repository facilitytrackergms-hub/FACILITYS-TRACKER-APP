/*================================================================
FACILITY-PROJECT-DETAIL DATA
VERSION: v2026_06_26_add_repair_item
UPDATED: 2026-06-26
================================================================*/

import { supabase } from '../../global_engine/supabaseClient.js';

export async function fetchProjectDetail(projectId) {
    return await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .maybeSingle();
}

export async function updateProjectDetail(projectId, payload) {
    const { data, error } = await supabase
        .from('projects')
        .update(payload)
        .eq('id', projectId)
        .select('*')
        .maybeSingle();

    if (error) {
        console.error('Supabase project update failed:', error);
        return { data: null, error };
    }

    if (!data) {
        return {
            data: null,
            error: {
                message: 'No project row was updated. Check project ID or Supabase UPDATE policy.'
            }
        };
    }

    return { data, error: null };
}

export async function deleteProjectDetail(projectId) {
    return await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);
}

export async function fetchProjectScopeItems(projectId) {
    if (!projectId) return [];

    const { data, error } = await supabase
        .from('project_scope_items')
        .select('*')
        .eq('project_id', projectId)
        .eq('active_status', 'active')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Fetch project scope items error:', error);
        return [];
    }

    return data || [];
}

export async function createProjectScopeItem(payload) {
    return await supabase
        .from('project_scope_items')
        .insert([{
            ...payload,
            active_status: 'active',
            repair_status: payload.repair_status || 'Open'
        }])
        .select('*')
        .single();
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
