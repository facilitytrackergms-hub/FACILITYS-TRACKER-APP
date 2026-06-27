/* ================================================================
   PURPOSE: Project data service
   LOCATION: /facilities_views/facilities-projects/data.js
   VERSION: v2026_06_26_contact_check_project_scope
   UPDATED: 2026-06-26
   ================================================================ */

import { supabase } from '../../global_engine/supabaseClient.js';

export async function fetchProjects(facilityId) {
    const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('facilities_id', facilityId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching projects:', error);
        return [];
    }

    return data || [];
}

export async function fetchFacilityContacts(facilityId) {
    if (!facilityId) return [];

    const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('facilities_id', facilityId)
        .order('name', { ascending: true });

    if (error) {
        console.error('Error fetching facility contacts:', error);
        return [];
    }

    return data || [];
}

export async function findContactByName(facilityId, contactName) {
    const cleanName = String(contactName || '').trim();

    if (!facilityId || !cleanName) {
        return { data: null, error: null };
    }

    const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('facilities_id', facilityId)
        .ilike('name', cleanName)
        .limit(1);

    if (error) {
        return { data: null, error };
    }

    return { data: data?.[0] || null, error: null };
}

export async function createRequestedByContact(payload) {
    return await supabase
        .from('contacts')
        .insert([payload])
        .select('*')
        .single();
}

export async function createOrUpdateFacilityContact(facilityId, person = {}) {
    const cleanName = String(person.name || '').trim();

    if (!facilityId || !cleanName) {
        return { data: null, error: null };
    }

    const role = String(person.role || person.title || '').trim();
    const phone = String(person.phone || person.phone_number || '').trim();
    const email = String(person.email || '').trim();
    const notes = String(person.notes || '').trim();

    const existingResponse = await findContactByName(facilityId, cleanName);

    if (existingResponse.error) {
        console.error('Find contact error:', existingResponse.error);
        return { data: null, error: existingResponse.error };
    }

    if (existingResponse.data) {
        const updatePayload = {};

        if (role) updatePayload.role = role;
        if (phone) updatePayload.phone = phone;
        if (email) updatePayload.email = email;
        if (notes) updatePayload.notes = notes;

        if (!Object.keys(updatePayload).length) {
            return { data: existingResponse.data, error: null };
        }

        return await supabase
            .from('contacts')
            .update(updatePayload)
            .eq('id', existingResponse.data.id)
            .select('*')
            .single();
    }

    const insertPayload = {
        facilities_id: facilityId,
        name: cleanName
    };

    if (role) insertPayload.role = role;
    if (phone) insertPayload.phone = phone;
    if (email) insertPayload.email = email;
    if (notes) insertPayload.notes = notes;

    return await supabase
        .from('contacts')
        .insert([insertPayload])
        .select('*')
        .single();
}

export async function createProject(payload) {
    return await supabase
        .from('projects')
        .insert([payload])
        .select('*')
        .single();
}

export async function createProjectWithScopeItems(payload, scopeItems = []) {
    const facilityId = payload.facilities_id || payload.location_id;

    const contactResponse = await ensureProjectContacts(facilityId, payload, scopeItems);

    if (contactResponse.error) {
        return { data: null, error: contactResponse.error };
    }

    const { data: project, error: projectError } = await createProject(payload);

    if (projectError || !project) {
        return { data: null, error: projectError };
    }

    const cleanedItems = cleanScopeItems(project.id, facilityId, scopeItems);

    if (!cleanedItems.length) {
        return { data: project, error: null };
    }

    const { error: scopeError } = await supabase
        .from('project_scope_items')
        .insert(cleanedItems);

    if (scopeError) {
        console.error('Error creating project scope items:', scopeError);
        return { data: project, error: scopeError };
    }

    return { data: project, error: null };
}

export async function updateProject(projectId, payload) {
    return await supabase
        .from('projects')
        .update(payload)
        .eq('id', projectId)
        .select('*')
        .single();
}

export async function updateProjectWithScopeItems(projectId, payload, scopeItems = []) {
    const facilityId = payload.facilities_id || payload.location_id;

    const contactResponse = await ensureProjectContacts(facilityId, payload, scopeItems);

    if (contactResponse.error) {
        return { data: null, error: contactResponse.error };
    }

    const { data: project, error: projectError } = await updateProject(projectId, payload);

    if (projectError || !project) {
        return { data: null, error: projectError };
    }

    const replaceResponse = await replaceProjectScopeItems(
        projectId,
        facilityId,
        scopeItems
    );

    if (replaceResponse.error) {
        return { data: project, error: replaceResponse.error };
    }

    return { data: project, error: null };
}

export async function deleteProject(projectId) {
    return await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);
}

export async function fetchProjectScopeItems(projectId) {
    if (!projectId) return [];

    const { data, error } = await supabase
        .from('project_scope_items')
        .select('*')
        .eq('project_id', projectId)
        .eq('active_status', 'active')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching project scope items:', error);
        return [];
    }

    return data || [];
}

export async function createProjectScopeItem(payload) {
    return await supabase
        .from('project_scope_items')
        .insert([payload])
        .select('*')
        .single();
}

export async function createProjectScopeItems(projectId, facilityId, scopeItems = []) {
    const cleanedItems = cleanScopeItems(projectId, facilityId, scopeItems);

    if (!cleanedItems.length) {
        return { data: [], error: null };
    }

    return await supabase
        .from('project_scope_items')
        .insert(cleanedItems)
        .select('*');
}

export async function updateProjectScopeItem(scopeItemId, payload) {
    return await supabase
        .from('project_scope_items')
        .update({
            ...payload,
            updated_at: new Date().toISOString()
        })
        .eq('id', scopeItemId)
        .select('*')
        .single();
}

export async function deleteProjectScopeItem(scopeItemId) {
    return await supabase
        .from('project_scope_items')
        .update({
            active_status: 'deleted',
            updated_at: new Date().toISOString()
        })
        .eq('id', scopeItemId);
}

export async function deleteProjectScopeItemsForProject(projectId) {
    if (!projectId) {
        return { data: null, error: null };
    }

    return await supabase
        .from('project_scope_items')
        .update({
            active_status: 'deleted',
            updated_at: new Date().toISOString()
        })
        .eq('project_id', projectId)
        .eq('active_status', 'active');
}

export async function replaceProjectScopeItems(projectId, facilityId, scopeItems = []) {
    const deleteResponse = await deleteProjectScopeItemsForProject(projectId);

    if (deleteResponse.error) {
        console.error('Error deleting old project scope items:', deleteResponse.error);
        return { data: null, error: deleteResponse.error };
    }

    return await createProjectScopeItems(projectId, facilityId, scopeItems);
}

async function ensureProjectContacts(facilityId, projectPayload = {}, scopeItems = []) {
    if (!facilityId) {
        return { error: null };
    }

    const people = [];

    if (projectPayload.requested_by_name) {
        people.push({
            name: projectPayload.requested_by_name,
            role: projectPayload.requested_by_title,
            phone: projectPayload.phone_number
        });
    }

    if (projectPayload.project_contact_name) {
        people.push({
            name: projectPayload.project_contact_name,
            phone: projectPayload.project_contact_phone
        });
    }

    if (projectPayload.property_manager_name) {
        people.push({
            name: projectPayload.property_manager_name,
            phone: projectPayload.property_manager_phone
        });
    }

    if (Array.isArray(scopeItems)) {
        scopeItems.forEach(item => {
            if (item.resident_name) {
                people.push({
                    name: item.resident_name,
                    phone: item.resident_phone
                });
            }
        });
    }

    for (const person of people) {
        const response = await createOrUpdateFacilityContact(facilityId, person);

        if (response.error) {
            console.error('Create or update contact error:', response.error);
            return { error: response.error };
        }
    }

    return { error: null };
}

function cleanScopeItems(projectId, facilityId, scopeItems = []) {
    if (!projectId || !Array.isArray(scopeItems)) return [];

    return scopeItems
        .map((item, index) => ({
            project_id: projectId,
            facilities_id: facilityId || null,
            location_number: String(item.location_number || '').trim(),
            resident_name: String(item.resident_name || '').trim(),
            resident_phone: String(item.resident_phone || '').trim(),
            area_name: String(item.area_name || '').trim(),
            item_name: String(item.item_name || '').trim(),
            work_needed: String(item.work_needed || '').trim(),
            notes: String(item.notes || '').trim(),
            sort_order: index + 1,
            active_status: 'active'
        }))
        .filter(item =>
            item.location_number ||
            item.resident_name ||
            item.resident_phone ||
            item.area_name ||
            item.item_name ||
            item.work_needed ||
            item.notes
        );
}
