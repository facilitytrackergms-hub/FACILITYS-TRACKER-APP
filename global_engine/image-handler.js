/* ================================================================
   PURPOSE: Reusable Image Handler for Supabase Buckets
   LOCATION: /global_engine/imageHandler.js
   DATE: 2026-06-18
   ================================================================ */

import { supabase } from './supabaseClient.js';

export async function uploadImage(file, bucket, folderPath) {
    const fileName = `${folderPath}/${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

    if (error) throw error;
    
    // Get public URL
    const { data: publicUrl } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);
        
    return publicUrl.publicUrl;
}
