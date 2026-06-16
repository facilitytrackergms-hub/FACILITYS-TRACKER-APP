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
        // Ensure the key 'number_name' matches your SQL table column exactly
        const { data, error } = await supabase.from('locations').insert([{
            number_name: location.number_name,
            address: location.address,
            phone: location.phone,
            image_url: location.image_url
        }]);
        if (error) throw error;
        return data;
    }
};
