/* ================================================================
   NAME      : locations_view_1_data.js
   PURPOSE   : Database operations for locations
   LOCATION  : /FACILITYS-TRACKER-APP/02_locations/
   ================================================================ */

import { supabase } from '/FACILITYS-TRACKER-APP/00_global_engine/supabaseClient.js';

export const locationData = {
    async fetchAll() {
        const { data, error } = await supabase.from('locations').select('*');
        if (error) throw error;
        return data;
    },
    
    async insert(location) {
        const { data, error } = await supabase.from('locations').insert([{
            number_name: location.number_name,
            address: location.address,
            phone: location.phone
        }]);
        if (error) throw error;
        return data;
    }
};
