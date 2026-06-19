/* ================================================================
   PURPOSE: Facility details data service
   LOCATION: /facilities_views/facilities-details/data.js
   VERSION: v2026_06_18_facility_details_new
   DATE: 2026-06-18
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
    return await supabase
        .from('facilities')
        .delete()
        .eq('id', facilityId);
}
