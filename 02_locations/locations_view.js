/* ================================================================
   NAME     : locations_data.js
   PURPOSE  : Database operations for locations
   ================================================================ */
import { supabase } from '../01_global_engine/supabaseClient.js';

export const locationData = {
    async fetchAll() {
        // Fetches all location records
        const { data, error } = await supabase
            .from('locations')
            .select('*')
            .order('number_name', { ascending: true });
            
        if (error) throw error;
        return data;
    },
    
    async insert(location) {
        // Inserts new record into Supabase
        const { data, error } = await supabase
            .from('locations')
            .insert([{
                number_name: location.number_name,
                address: location.address,
                phone: location.phone
            }]);
            
        if (error) throw error;
        return data;
    }
};
