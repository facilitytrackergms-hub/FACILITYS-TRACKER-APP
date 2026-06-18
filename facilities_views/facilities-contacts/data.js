/* ================================================================
   PURPOSE: Contact data service
   LOCATION: /facilities_views/facilities-contacts/data.js
   VERSION: v2026_06_18_view_on_button_contacts
   DATE: 2026-06-18
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
