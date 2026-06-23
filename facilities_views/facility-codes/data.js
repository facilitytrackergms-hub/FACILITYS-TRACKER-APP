/* ================================================================
   FACILITY TRACKER MODULAR VIEW SYSTEM
   PURPOSE: Facility Codes Data Service
   LOCATION: /facilities_views/facility-codes/data.js
   VERSION: v2026_06_22_facility_codes_data_build
   UPDATED: 2026-06-22 @ 10:45 AM EDT
================================================================ */

import { supabase } from '../../global_engine/supabaseClient.js';

export async function fetchFacilityCodes(facilitiesId) {
    return await supabase
        .from('facility_door_codes')
        .select('*')
        .eq('facilities_id', facilitiesId)
        .order('door_name', { ascending: true });
}

export async function createFacilityCode(payload) {
    return await supabase
        .from('facility_door_codes')
        .insert([payload])
        .select()
        .single();
}

export async function updateFacilityCode(codeId, payload) {
    return await supabase
        .from('facility_door_codes')
        .update(payload)
        .eq('id', codeId)
        .select()
        .single();
}

export async function deleteFacilityCode(codeId) {
    return await supabase
        .from('facility_door_codes')
        .delete()
        .eq('id', codeId);
}

export async function fetchFacilityCodeImages(facilitiesId, doorCodeId) {
    return await supabase
        .from('facilities_images')
        .select('*')
        .eq('facilities_id', facilitiesId)
        .eq('door_code_id', doorCodeId)
        .eq('category', 'facility_code_door')
        .order('created_at', { ascending: false });
}

export async function createFacilityCodeImage(payload) {
    return await supabase
        .from('facilities_images')
        .insert([payload])
        .select()
        .single();
}

export async function deleteFacilityCodeImage(imageId) {
    return await supabase
        .from('facilities_images')
        .delete()
        .eq('id', imageId);
}
