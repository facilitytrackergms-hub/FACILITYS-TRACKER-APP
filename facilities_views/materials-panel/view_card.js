/* Purpose: Material Delete Logic | Location: /materials/delete.js */
import { supabase } from '../../global_engine/supabaseClient.js';
import { saveMaterial } from './save.js';

export async function deleteMaterial(id, currentProjectId, loadMaterialsCallback) {
    const { error } = await supabase.from('project_materials')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('DELETE ERROR:', error);
        return;
    }

    if (typeof loadMaterialsCallback === 'function') {
        loadMaterialsCallback(currentProjectId);
    }
}
