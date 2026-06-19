/* ================================================================
   PURPOSE: Contact data service
   LOCATION: /facilities_views/facilities-contacts/data.js
   VERSION: v2026_06_19_contact_detail_projects
   UPDATED: 2026-06-19 @ 4:45 AM EDT
   ================================================================ */

import { supabase } from '../../global_engine/supabaseClient.js';

export async function fetchContacts(facilityId) {
    const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('facilities_id', facilityId)
        .order('name', { ascending: true });

    if (error) {
        console.error('Error fetching contacts:', error);
        return [];
    }

    return data || [];
}

export async function createContact(payload) {
    return await supabase
        .from('contacts')
        .insert([payload])
        .select('*')
        .single();
}

export async function updateContact(contactId, payload) {
    return await supabase
        .from('contacts')
        .update(payload)
        .eq('id', contactId)
        .select('*')
        .single();
}

export async function updateContactImage(contactId, imageUrl) {
    return await supabase
        .from('contacts')
        .update({ image_url: imageUrl })
        .eq('id', contactId);
}

export async function deleteContact(contactId) {
    return await supabase
        .from('contacts')
        .delete()
        .eq('id', contactId);
}

export async function fetchContactProjects(facilityId, contactId, contactName = '') {
    if (!facilityId || !contactId) return [];

    const { data: contactIdProjects, error: contactIdError } = await supabase
        .from('projects')
        .select('*')
        .eq('facilities_id', facilityId)
        .eq('requested_by_contact_id', contactId)
        .order('created_at', { ascending: false });

    if (contactIdError) {
        console.error('Error fetching contact projects by ID:', contactIdError);
        return [];
    }

    const cleanName = String(contactName || '').trim();

    if (!cleanName) {
        return contactIdProjects || [];
    }

    const { data: contactNameProjects, error: contactNameError } = await supabase
        .from('projects')
        .select('*')
        .eq('facilities_id', facilityId)
        .ilike('requested_by_name', cleanName)
        .order('created_at', { ascending: false });

    if (contactNameError) {
        console.error('Error fetching contact projects by name:', contactNameError);
        return contactIdProjects || [];
    }

    const projectMap = new Map();

    (contactIdProjects || []).forEach(project => {
        projectMap.set(String(project.id), project);
    });

    (contactNameProjects || []).forEach(project => {
        projectMap.set(String(project.id), project);
    });

    return Array.from(projectMap.values());
}
