/*================================================================
FACILITIES-PROJECTS GRID
VERSION: v2026_06_18_edit_button_fix
================================================================*/

import { supabase } from '../../global_engine/supabaseClient.js';

async function fetchFacilityById(facilityId) {
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

async function fetchFacilityImage(facilityId) {
    const { data, error } = await supabase
        .from('facilities_images')
        .select('image_url')
        .eq('facilities_id', facilityId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (error) {
        console.error('fetchFacilityImage error:', error);
        return '';
    }

    return data?.image_url || '';
}

function escapeHtml(value) {
    return String(value || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

export async function renderProjectsGrid(containerId, context = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    let facilityId = null;
    let facility = null;

    if (typeof context === 'object' && context !== null) {
        facilityId = context.id;
        facility = context;
    } else {
        facilityId = context;
    }

    if (!facilityId) {
        container.innerHTML = `<p style="color:red; text-align:center;">Missing facility ID.</p>`;
        return;
    }

    if (!facility || !facility.id) {
        facility = await fetchFacilityById(facilityId);
    }

    if (!facility) {
        container.innerHTML = `<p style="color:red; text-align:center;">Facility not found.</p>`;
        return;
    }

    const imageUrl = facility.image_url || await fetchFacilityImage(facilityId);

    const facilityName = facility.abbreviation || facility.number_name || facility.name || 'Facility';
    const address = facility.address || '';
    const phone = facility.phone || '';
    const numberName = facility.number_name || facility.name || '';
    const abbreviation = facility.abbreviation || '';

    container.innerHTML = `
        <style>
            .facility-detail-card { background: #ffffff; max-width: 320px; margin: 16px auto; padding: 18px; border-radius: 14px; box-shadow: 0 4px 18px rgba(0, 0, 0, 0.08); text-align: center; }
            .facility-detail-title-row { display: flex; align-items: center; justify-content: center; position: relative; min-height: 40px; }
            .facility-detail-title { color: #003b73; font-size: 24px; font-weight: bold; margin: 8px 0 10px; }
            .facility-del-btn { position: absolute; left: 0; top: 0; background: #fee2e2; color: #dc2626; border: none; border-radius: 7px; padding: 8px 10px; font-weight: bold; cursor: pointer; }
            .facility-edit-btn { position: absolute; right: 0; top: 0; background: #e9edf4; color: #003b73; border: none; border-radius: 7px; padding: 8px 12px; font-weight: bold; cursor: pointer; }
            .facility-main-image { width: 100%; max-width: 260px; height: 140px; object-fit: cover; border-radius: 9px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.12); margin-bottom: 14px; }
            .facility-info-box { border: 1px solid #d6dee8; border-radius: 10px; padding: 12px 14px; text-align: left; max-width: 250px; margin: 0 auto 18px; background: #f8fbff; }
            .facility-info-label { font-size: 11px; font-weight: bold; color: #003b73; margin-top: 4px; text-transform: uppercase; }
            .facility-info-link { display: block; color: #003b73; font-size: 14px; margin: 3px 0 12px; text-decoration: underline; }
            .facility-divider { height: 4px; background: #003b73; border-radius: 4px; margin: 18px 4px; }
            .facility-action-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-top: 18px; }
            .facility-action-btn { background: #003b73; color: white; border: none; border-radius: 9px; min-height: 54px; font-size: 15px; font-weight: bold; cursor: pointer; }
            .facility-back-btn { background: #747d8c; color: white; border: none; border-radius: 9px; width: 100%; min-height: 48px; font-size: 15px; font-weight: bold; cursor: pointer; margin-top: 16px; }
            .facility-version-tag { border-top: 1px solid #d6dee8; margin-top: 22px; padding-top: 12px; font-size: 10px; color: #7d8ba0; text-align: center; }

            .facility-edit-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.45); display: none; align-items: center; justify-content: center; z-index: 9999; }
            .facility-edit-modal { background: white; width: 90%; max-width: 340px; border-radius: 12px; padding: 18px; box-shadow: 0 4px 18px rgba(0,0,0,0.25); text-align: left; }
            .facility-edit-modal h3 { margin: 0 0 14px; text-align: center; color: #003b73; }
            .facility-edit-modal label { display: block; font-size: 13px; font-weight: bold; margin: 10px 0 4px; color: #003b73; }
            .facility-edit-modal input { width: 100%; padding: 9px; border: 1px solid #bbb; border-radius: 6px; font-size: 15px; box-sizing: border-box; }
            .facility-edit-buttons { display: flex; gap: 8px; margin-top: 16px; }
            .facility-edit-buttons button { flex: 1; padding: 11px; border: none; border-radius: 7px; font-weight: bold; cursor: pointer; }
            .btn-save-edit { background: #22a843; color: white; }
            .btn-cancel-edit { background: #777; color: white; }
            .facility-edit-error { color: red; font-size: 13px; text-align: center; margin-top: 10px; min-height: 16px; }
        </style>

        <div class="facility-detail-card">
            <div class="facility-detail-title-row">
                <button id="btn-delete-facility" class="facility-del-btn">🗑️</button>
                <div class="facility-detail-title">${escapeHtml(facilityName)}</div>
                <button id="btn-edit-facility" class="facility-edit-btn">⚙️ Edit</button>
            </div>

            ${imageUrl ? `<img class="facility-main-image" src="${escapeHtml(imageUrl)}" alt="${escapeHtml(facilityName)}">` : ''}

            <div class="facility-info-box">
                <div class="facility-info-label">📍 Address</div>
                ${address ? `<a class="facility-info-link" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}" target="_blank">${escapeHtml(address)}</a>` : `<span class="facility-info-link">No address</span>`}
                <div class="facility-info-label">Phone Contact</div>
                ${phone ? `<a class="facility-info-link" href="tel:${escapeHtml(phone)}">📞 ${escapeHtml(phone)}</a>` : `<span class="facility-info-link">No phone</span>`}
            </div>

            <div class="facility-divider"></div>

            <div class="facility-action-grid">
                <button id="btn-open-contacts" class="facility-action-btn">👥 2. CONTACT</button>
                <button id="btn-open-projects" class="facility-action-btn">📋 3. PROJECTS</button>
            </div>

            <button id="btn-back-home" class="facility-back-btn">⬅️ BACK</button>

            <div class="facility-version-tag">facilities-projects/grid.js | v2026_06_18_edit_button_fix | 2026-06-18</div>
        </div>

        <div id="facility-edit-backdrop" class="facility-edit-backdrop">
            <div class="facility-edit-modal">
                <h3>Edit Facility</h3>

                <label>Facility Name</label>
                <input id="edit-facility-name" type="text" value="${escapeHtml(numberName)}">

                <label>Abbreviation</label>
                <input id="edit-facility-abbreviation" type="text" value="${escapeHtml(abbreviation)}">

                <label>Address</label>
                <input id="edit-facility-address" type="text" value="${escapeHtml(address)}">

                <label>Phone</label>
                <input id="edit-facility-phone" type="tel" value="${escapeHtml(phone)}">

                <div class="facility-edit-buttons">
                    <button id="btn-save-edit-facility" class="btn-save-edit">Save</button>
                    <button id="btn-cancel-edit-facility" class="btn-cancel-edit">Cancel</button>
                </div>

                <div id="facility-edit-error" class="facility-edit-error"></div>
            </div>
        </div>
    `;

    const editBackdrop = document.getElementById('facility-edit-backdrop');
    const editError = document.getElementById('facility-edit-error');

    document.getElementById('btn-delete-facility').addEventListener('click', async () => {
        if (!confirm('Are you sure you want to delete this facility?')) return;

        const { data, error } = await supabase
            .from('facilities')
            .delete()
            .eq('id', facilityId)
            .select('id');

        if (error) {
            console.error('Delete error:', error);
            alert('Failed to delete facility. Check console.');
            return;
        }

        if (!data || data.length === 0) {
            console.error('Delete blocked or no matching facility found:', facilityId);
            alert('Facility was not deleted. Supabase may be blocking delete with RLS policy.');
            return;
        }

        window.navigateTo('facilities-home');
    });

    document.getElementById('btn-open-contacts').addEventListener('click', () => {
        if (window.navigateTo) window.navigateTo('facilities-contacts', facility);
    });

    document.getElementById('btn-open-projects').addEventListener('click', () => {
        console.log('Projects button clicked:', facilityId);
    });

    document.getElementById('btn-back-home').addEventListener('click', () => {
        if (window.navigateTo) window.navigateTo('facilities-home');
    });

    document.getElementById('btn-edit-facility').addEventListener('click', () => {
        editBackdrop.style.display = 'flex';
    });

    document.getElementById('btn-cancel-edit-facility').addEventListener('click', () => {
        editBackdrop.style.display = 'none';
    });

    document.getElementById('btn-save-edit-facility').addEventListener('click', async () => {
        const updatedName = document.getElementById('edit-facility-name').value.trim();
        const updatedAbbreviation = document.getElementById('edit-facility-abbreviation').value.trim();
        const updatedAddress = document.getElementById('edit-facility-address').value.trim();
        const updatedPhone = document.getElementById('edit-facility-phone').value.trim();

        if (!updatedName || !updatedAbbreviation) {
            editError.textContent = 'Name and abbreviation required.';
            return;
        }

        const { data, error } = await supabase
            .from('facilities')
            .update({
                number_name: updatedName,
                abbreviation: updatedAbbreviation,
                address: updatedAddress,
                phone: updatedPhone
            })
            .eq('id', facilityId)
            .select('*')
            .single();

        if (error) {
            console.error('Edit save error:', error);
            editError.textContent = 'Could not save changes.';
            return;
        }

        editBackdrop.style.display = 'none';

        if (window.navigateTo) {
            window.navigateTo('facilities-projects', data);
        }
    });
}
