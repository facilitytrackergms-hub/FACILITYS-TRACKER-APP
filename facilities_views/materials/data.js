/*================================================================
SYSTEM: Facility Tracker Modular View System
PURPOSE: Materials data service
LOCATION: /facilities_views/materials/data.js
VERSION: v2026_06_21_materials_data_project_id_fix
UPDATED: 2026-06-21
LINES: 144
================================================================*/

import { supabase } from '../../global_engine/supabaseClient.js';

/*================================================================
FETCH MATERIALS
================================================================*/
export async function fetchMaterials(context = {}) {
    const projectId = context.project_id || null;
    const projectUpdateId = context.project_update_id || null;
    const facilityId = context.facilities_id || context.facility_id || null;

    let query = supabase
        .from('project_materials')
        .select('*')
        .order('created_at', { ascending: false });

    if (projectUpdateId) {
        query = query.eq('project_update_id', projectUpdateId);
    } else if (projectId) {
        query = query.eq('project_id', projectId);
    } else if (facilityId) {
        query = query.eq('facilities_id', facilityId);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Fetch materials error:', JSON.stringify(error, null, 2));
        return [];
    }

    return data || [];
}

/*================================================================
CREATE MATERIAL
================================================================*/
export async function createMaterial(context = {}, material = {}) {
    const projectId = context.project_id || null;
    const projectUpdateId = context.project_update_id || null;
    const facilityId = context.facilities_id || context.facility_id || null;

    if (!projectId && !projectUpdateId && !facilityId) {
        console.error('Create material error: Missing project_id, project_update_id, and facilities_id.');
        return {
            success: false,
            data: null,
            error: 'Missing project context'
        };
    }

    const payload = {
        project_id: projectId,
        project_update_id: projectUpdateId,
        facilities_id: facilityId,
        material_name: material.material_name || '',
        quantity: material.quantity || '',
        estimated_cost: cleanNumber(material.estimated_cost),
        actual_cost: cleanNumber(material.actual_cost),
        material_status: material.material_status || 'Needed',
        description: material.description || '',
        notes: material.notes || ''
    };

    const { data, error } = await supabase
        .from('project_materials')
        .insert([payload])
        .select()
        .single();

    if (error) {
        console.error('Create material error:', JSON.stringify(error, null, 2));
        console.error('Create material payload:', JSON.stringify(payload, null, 2));

        return {
            success: false,
            data: null,
            error
        };
    }

    return {
        success: true,
        data,
        error: null
    };
}

/*================================================================
UPDATE MATERIAL
================================================================*/
export async function updateMaterial(materialId, material = {}) {
    if (!materialId) {
        return {
            success: false,
            data: null,
            error: 'Missing material id'
        };
    }

    const payload = {
        material_name: material.material_name || '',
        quantity: material.quantity || '',
        estimated_cost: cleanNumber(material.estimated_cost),
        actual_cost: cleanNumber(material.actual_cost),
        material_status: material.material_status || 'Needed',
        description: material.description || '',
        notes: material.notes || '',
        updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
        .from('project_materials')
        .update(payload)
        .eq('id', materialId)
        .select()
        .single();

    if (error) {
        console.error('Update material error:', JSON.stringify(error, null, 2));
        return {
            success: false,
            data: null,
            error
        };
    }

    return {
        success: true,
        data,
        error: null
    };
}

/*================================================================
DELETE MATERIAL
================================================================*/
export async function deleteMaterial(materialId) {
    if (!materialId) {
        return {
            success: false,
            error: 'Missing material id'
        };
    }

    const { error } = await supabase
        .from('project_materials')
        .delete()
        .eq('id', materialId);

    if (error) {
        console.error('Delete material error:', JSON.stringify(error, null, 2));
        return {
            success: false,
            error
        };
    }

    return {
        success: true,
        error: null
    };
}

/*================================================================
HELPERS
================================================================*/
function cleanNumber(value) {
    if (value === '' || value === null || value === undefined) {
        return null;
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
        return null;
    }

    return number;
}
