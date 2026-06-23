/* ================================================================
   PURPOSE: Facility details data service
   LOCATION: /facilities_views/facilities-details/data.js
   VERSION: v2026_06_22_delete_facility_export_confirmed
   DATE: 2026-06-22
   ================================================================ */

import { supabase } from '../../global_engine/supabaseClient.js';

export async function updateFacility(facilityId, payload) {
    return await supabase
        .from('facilities')
        .update(payload)
        .eq('id', facilityId)
        .select('*')
        .single();
}

export async function deleteFacility(facilityId) {
    const projectsDeleteResult = await supabase
        .from('projects')
        .delete()
        .eq('facilities_id', facilityId);

    if (projectsDeleteResult.error) {
        return projectsDeleteResult;
    }

    return await supabase
        .from('facilities')
        .delete()
        .eq('id', facilityId);
}
