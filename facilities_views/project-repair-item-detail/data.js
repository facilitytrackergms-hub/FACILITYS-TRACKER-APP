/*================================================================
PROJECT-REPAIR-ITEM-DETAIL DATA
LOCATION: /facilities_views/project-repair-item-detail/data.js
VERSION: v2026_06_26_repair_item_dashboard_new
UPDATED: 2026-06-26
================================================================*/

import { supabase } from '../../global_engine/supabaseClient.js';

export async function fetchRepairItemDetail(repairItemId) {
    if (!repairItemId) {
        return { data: null, error: { message: 'Missing repair item ID.' } };
    }

    return await supabase
        .from('project_scope_items')
        .select('*')
        .eq('id', repairItemId)
        .maybeSingle();
}

export async function updateRepairItemDetail(repairItemId, payload) {
    if (!repairItemId) {
        return { data: null, error: { message: 'Missing repair item ID.' } };
    }

    const { data, error } = await supabase
        .from('project_scope_items')
        .update({
            ...payload,
            updated_at: new Date().toISOString()
        })
        .eq('id', repairItemId)
        .select('*')
        .maybeSingle();

    if (error) {
        console.error('Update repair item failed:', error);
        return { data: null, error };
    }

    return { data, error: null };
}

export async function deleteRepairItemDetail(repairItemId) {
    if (!repairItemId) {
        return { data: null, error: { message: 'Missing repair item ID.' } };
    }

    return await supabase
        .from('project_scope_items')
        .update({
            active_status: 'deleted',
            updated_at: new Date().toISOString()
        })
        .eq('id', repairItemId);
}

export async function fetchProjectDetail(projectId) {
    if (!projectId) {
        return { data: null, error: { message: 'Missing project ID.' } };
    }

    return await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .maybeSingle();
}

export async function fetchRepairItemUpdates(repairItemId) {
    if (!repairItemId) return [];

    const { data, error } = await supabase
        .from('project_updates')
        .select('*')
        .eq('project_scope_item_id', repairItemId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Fetch repair item updates error:', error);
        return [];
    }

    return data || [];
}

export async function createRepairItemUpdate(payload) {
    return await supabase
        .from('project_updates')
        .insert([payload])
        .select('*')
        .single();
}

export async function fetchRepairItemPhotos(repairItemId) {
    if (!repairItemId) return [];

    const { data, error } = await supabase
        .from('project_photos')
        .select('*')
        .eq('project_scope_item_id', repairItemId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Fetch repair item photos error:', error);
        return [];
    }

    return data || [];
}

export async function createRepairItemPhoto(payload) {
    return await supabase
        .from('project_photos')
        .insert([payload])
        .select('*')
        .single();
}
