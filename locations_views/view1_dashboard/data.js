/* ================================================================
   PURPOSE: Data fetching for Facilities
   LOCATION: /locations/view1_dashboard/data.js
   DATE: 2026-06-17
   ================================================================ */

import { supabase } from '../../00_global_engine/supabaseClient.js';

export async function fetchLocations() {
    const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('number_name', { ascending: true });
    
    if (error) {
        console.error("Error fetching facilities:", error);
        return [];
    }
    return data;
}
