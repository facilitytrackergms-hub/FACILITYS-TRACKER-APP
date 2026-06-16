/* ================================================================
   PURPOSE: Data fetching for Location Details
   LOCATION: /FACILITYS-TRACKER-APP/view_2_locations_details/view_2_locations_details_data.js
   ================================================================ */

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
