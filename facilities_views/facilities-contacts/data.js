
/* ================================================================
   PURPOSE: Fetch contacts for a specific facility
   LOCATION: /facilities_views/facilities-contacts/data.js
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
        console.error("Error fetching contacts:", error);
        return [];
    }
    return data;
}
