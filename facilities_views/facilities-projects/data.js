/*================================================================
FACILITIES-PROJECTS DATA
LOCATION: facilities_views/facilities-projects/data.js
================================================================*/

import { supabase } from '../../global_engine/supabaseClient.js';

/**
 * Fetches core facility information
 */
export async function fetchFacilityById(facilityId) {
    const { data, error } = await supabase
        .from('facilities')
        .select('*')
        .eq('id', facilityId)
        .single();

    if (error) {
        console.error('fetchFacilityById error:', error);
        return null;
    }
    return data;
}

/**
 * Fetches the latest image for a facility
 */
export async function fetchFacilityImage(facilityId) {
    const { data, error } = await supabase
        .from('facilities_images')
        .select('image_url')
        .eq('location_id', facilityId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) {
        console.error('fetchFacilityImage error:', error);
        return '';
    }
    return data?.image_url || '';
}

/**
 * Fetches all projects associated with a facility
 */
export async function fetchProjects(facilityId) {
    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('facilities_id', facilityId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('fetchProjects error:', error);
        return [];
    }
    return data || [];
}

/*================================================================
FACILITIES-PROJECTS DATA
================================================================*/
