/* ================================================================
   FACILITY TRACKER MODULAR VIEW SYSTEM
   PURPOSE: Facility Inspections Data Service
   LOCATION: /facilities_views/facility-inspections/data.js
   VERSION: v2026_06_23_inspection_sessions_data
   UPDATED: 2026-06-23
================================================================ */

import { supabase } from '../../global_engine/supabaseClient.js';

/* ================================================================
   INSPECTION SESSIONS
   One facility inspection with many inspected locations/items
================================================================ */

export async function createInspectionSession(payload) {
    return await supabase
        .from('inspection_sessions')
        .insert([payload])
        .select()
        .single();
}

export async function updateInspectionSession(sessionId, payload) {
    return await supabase
        .from('inspection_sessions')
        .update(payload)
        .eq('id', sessionId)
        .select()
        .single();
}

export async function fetchInspectionSessions(facilitiesId) {
    return await supabase
        .from('inspection_sessions')
        .select('*')
        .eq('facilities_id', facilitiesId)
        .order('created_at', { ascending: false });
}

export async function fetchInspectionSession(sessionId) {
    return await supabase
        .from('inspection_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();
}

export async function deleteInspectionSession(sessionId) {
    return await supabase
        .from('inspection_sessions')
        .delete()
        .eq('id', sessionId);
}

/* ================================================================
   INSPECTION SESSION ITEMS
   Rooms / areas / items inside one inspection session
================================================================ */

export async function createInspectionSessionItem(payload) {
    return await supabase
        .from('inspection_session_items')
        .insert([payload])
        .select()
        .single();
}

export async function fetchInspectionSessionItems(sessionId) {
    return await supabase
        .from('inspection_session_items')
        .select('*')
        .eq('inspection_session_id', sessionId)
        .order('created_at', { ascending: true });
}

export async function deleteInspectionSessionItem(itemId) {
    return await supabase
        .from('inspection_session_items')
        .delete()
        .eq('id', itemId);
}

/* ================================================================
   OLD INSPECTION LOCATIONS
   Kept so nothing else breaks
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
   OLD INSPECTION ITEMS
   Kept so nothing else breaks
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
   OLD INSPECTIONS
   Kept so nothing else breaks
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
   Kept for later picture/report use
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
