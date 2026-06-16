/* ================================================================
   PURPOSE: Data fetching for Location Details
   LOCATION: /FACILITYS-TRACKER-APP/view_2_locations_details/view_2_locations_details_data.js
   ================================================================ */
/* ================================================================
   PURPOSE: Data fetching for Locations
   LOCATION: /FACILITYS-TRACKER-APP/view_1_locations/view_1_locations_data.js
   ================================================================ */
import { supabase } from '../00_global_engine/supabaseClient.js';
export async function fetchLocations() {
    const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('number_name', { ascending: true });
    
    if (error) {
        console.error("Error fetching locations:", error);
        return [];
    }
    return data;
}
export async function fetchLocationDetails(id) {
    const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error("Error fetching location details:", error);
        return null;
    }
    return data;
}
