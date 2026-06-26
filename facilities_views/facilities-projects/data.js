/* ================================================================
   PURPOSE: Project data service
   LOCATION: /facilities_views/facilities-projects/data.js
   VERSION: v2026_06_26_contact_dropdown_prefill
   UPDATED: 2026-06-26
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

export async function fetchFacilityContacts(facilityId) {
    if (!facilityId) return [];

    const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('facilities_id', facilityId)
        .order('name', { ascending: true });

    if (error) {
        console.error('Error fetching facility contacts:', error);
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

export async function findContactByName(facilityId, contactName) {
    const cleanName = String(contactName || '').trim();

    if (!facilityId || !cleanName) {
        return { data: null, error: null };
    }

    return await supabase
        .from('contacts')
        .select('*')
        .eq('facilities_id', facilityId)
        .ilike('name', cleanName)
        .maybeSingle();
}

export async function createRequestedByContact(payload) {
    return await supabase
        .from('contacts')
        .insert([payload])
        .select('*')
        .single();
}
