/* ================================================================
   NAME     : 01_locations_data.js
   PURPOSE  : Database operations for locations
   ================================================================ */
import { supabase } from '../00_global_engine/02_supabase_client.js';

export const locationData = {
    async fetchAll() {
        const { data, error } = await supabase.from('locations').select('*');
        if (error) throw error;
        return data;
    },
    
    async insert(location) {
        const { data, error } = await supabase.from('locations').insert([location]);
        if (error) throw error;
        return data;
    }
};
