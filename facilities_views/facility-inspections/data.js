/* ================================================================
   FACILITY TRACKER MODULAR VIEW SYSTEM
   PURPOSE: Facility Inspections Data Service
   LOCATION: /facilities_views/facility-inspections/data.js
   VERSION: v2026_06_22_inspections_data_build
   UPDATED: 2026-06-22 @ 9:45 AM EDT
================================================================ */

import { supabase } from '../../global_engine/supabaseClient.js';

/* ================================================================
   INSPECTION LOCATIONS
================================================================ */

export async function fetchInspectionLocations(facilitiesId) {
    return await supabase
        .from('inspection_locations')
        .select('*')
        .eq('facilities_id', facilitiesId)
        .eq('active_status', 'active')
        .order('location_type', { ascending: true })
        .order('location_name', { ascending: true });
}

export async function createInspectionLocation(payload) {
    return await supabase
        .from('inspection_locations')
        .insert([payload])
        .select()
        .single();
}

/* ================================================================
   INSPECTION ITEMS
================================================================ */

export async function fetchInspectionItems(facilitiesId) {
    return await supabase
        .from('inspection_items')
        .select('*')
        .eq('facilities_id', facilitiesId)
        .eq('active_status', 'active')
        .order('item_name', { ascending: true });
}

export async function createInspectionItem(payload) {
    return await supabase
        .from('inspection_items')
        .insert([payload])
        .select()
        .single();
}

/* ================================================================
   INSPECTIONS
================================================================ */

export async function fetchInspections(projectId) {
    return await supabase
        .from('inspections')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
}

export async function createInspection(payload) {
    return await supabase
        .from('inspections')
        .insert([payload])
        .select()
        .single();
}

export async function updateInspection(inspectionId, payload) {
    return await supabase
        .from('inspections')
        .update(payload)
        .eq('id', inspectionId)
        .select()
        .single();
}

export async function deleteInspection(inspectionId) {
    return await supabase
        .from('inspections')
        .delete()
        .eq('id', inspectionId);
}

/* ================================================================
   INSPECTION IMAGES
================================================================ */

export async function fetchInspectionImages(inspectionId) {
    return await supabase
        .from('inspection_images')
        .select('*')
        .eq('inspection_id', inspectionId)
        .order('created_at', { ascending: false });
}

export async function createInspectionImage(payload) {
    return await supabase
        .from('inspection_images')
        .insert([payload])
        .select()
        .single();
}

export async function deleteInspectionImage(imageId) {
    return await supabase
        .from('inspection_images')
        .delete()
        .eq('id', imageId);
}
