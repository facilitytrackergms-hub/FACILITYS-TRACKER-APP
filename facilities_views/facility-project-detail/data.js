/*================================================================
FACILITY-PROJECT-DETAIL DATA
VERSION: v2026_06_18_facility_project_detail_new
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
