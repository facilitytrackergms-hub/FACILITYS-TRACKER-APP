/* ================================================================
   NAME     : locations_data.js
   PURPOSE  : Database operations for locations
   ================================================================ */
import { supabase } from '../00_global_engine/supabaseClient.js';

export const locationData = {
    async fetchAll() {
        const { data, error } = await supabase.from('locations').select('*');
        if (error) throw error;
        return data;
    },
    
    async insert(location) {
        // Mapping UI inputs to your database columns
        const { data, error } = await supabase.from('locations').insert([{
            number_name: location.number_name,
            address: location.address,
            phone: location.phone
        }]);
        if (error) throw error;
        return data;
    }
};
