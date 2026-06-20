/* Purpose: Material Save Logic
   Location: /modules/materials/save.js */

import { supabase } from '../../global_engine/supabaseClient.js';

export async function saveMaterial(id, currentProjectId, loadMaterialsCallback) {
    const qty = document.getElementById(`qty-${id}`).value;
    const status = document.getElementById(`status-${id}`).value;
    const desc = document.getElementById(`desc-${id}`).value;

    const { error } = await supabase.from('project_materials')
        .update({
            quantity: qty,
            material_status: status,
            description: desc
        })
        .eq('id', id);

    if (error) {
        console.error('SAVE ERROR:', error);
        return;
    }

    window.materialCollapseState[id] = true;
    loadMaterialsCallback(currentProjectId);
}
