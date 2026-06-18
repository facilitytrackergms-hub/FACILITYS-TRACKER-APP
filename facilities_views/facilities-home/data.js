/*================================================================
FACILITIES-HOME DATA
================================================================*/

import { supabase } from '../../global_engine/supabaseClient.js';

export async function fetchFacilities() {
    try {
        const { data, error } = await supabase
            .from('facilities')
            .select('*')
            .order('number_name', { ascending: true });

        if (error) {
            console.error("Error fetching facilities:", error);
            return [];
        }

        return data || [];
    } catch (err) {
        console.error("fetchFacilities Exception:", err);
        return [];
    }
}

/*================================================================
FACILITIES-HOME DATA
================================================================*/
