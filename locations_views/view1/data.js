/* ================================================================
   PURPOSE: Data fetching for Facilities
   LOCATION: /FACILITYS-TRACKER-APP/locations/view1/data.js
   ================================================================ */

// Use ../../ to go up two levels to reach the root, then into 00_global_engine
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
