/*================================================================
FACILITIES-DETAILS GRID
VERSION: v2026_06_18_clickable_address_phone_tag_fix
================================================================*/

import {
    updateFacility,
    deleteFacility
} from './data.js';

function escapeHtml(value) {
    return String(value || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function getFacilityName(facility) {
    return facility?.abbreviation || facility?.number_name || facility?.name || 'Facility';
}

function getMapUrl(address) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || '')}`;
}

function getPhoneUrl(phone) {
    const cleanPhone = String(phone || '').replace(/[^\d+]/g, '');
    return `tel:${cleanPhone}`;
}

export async function renderFacilityDetailsGrid(containerId, context = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const facility = context || {};
    const facilityId = facility.id;

    if (!facilityId) {
        container.innerHTML = `<p style="color:red;text-align:center;">Missing facility ID.</p>`;
        return;
    }

    container.innerHTML = `
        <style>
            .details-card { background:#ffffff; max-width:350px; margin:16px auto; padding:18px; border-radius:14px; box-shadow:0 4px 18px rgba(0,0,0,0.08); text-align:center; }
            .details-title { color:#003b73; font-size:24px; font-weight:bold; margin-bottom:2px; }
            .details-subtitle { color:#003b73; font-size:13px; font-weight:bold; margin-bottom:16px; letter-spacing:2px; }
            .details-image { width:100%; max-height:150px; object-fit:cover; border-radius:10px; background:#e5e7eb; margin-bottom:14px; }
            .details-info-box { border:1px solid #d6dee8; border-radius:10px; padding:12px; text-align:left; margin-bottom:14px; background:#f8fbff; }
            .details-label { color:#003b73; font-size:11px; font-weight:bold; margin-top:6px; }
            .details-value { color:#111827; font-size:14px; margin-bottom:6px; }
            .details-link { color:#003b73; text-decoration:underline; font-weight:bold; }
            .details-button-row { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:12px; }
            .details-action-btn { background:#003b73; color:white; border:none; border-radius:9px; min-height:48px; font-size:14px; font-weight:bold; cursor:pointer; }
            .details-delete-btn { background:#dc2626; color:yellow; border:none; border-radius:9px; min-height:48px; font-size:14px; font-weight:bold; cursor:pointer; }
            .details-main-btn { background:#003b73; color:white; border:none; border-radius:9px; width:100%; min-height:50px; font-size:15px; font-weight:bold; cursor:pointer; margin-top:8px; }
            .details-back-btn { background:#747d8c; color:white; border:none; border-radius:9px; width:100%; min-height:48px; font-size:15px; font-weight:bold; cursor:pointer; margin-top:12px; }
            .details-version-tag { border-top:1px solid #d6dee8; margin-top:18px; padding-top:10px; font-size:10px; color:#7d8ba0; text-align:center; }

            .facility-modal-backdrop { position:fixed; inset:0; background:rgba(0,0,0,0.45); display:none; align-items:center; justify-content:center; z-index:9999; }
            .facility-modal { background:white; width:90%; max-width:360px; border-radius:12px; padding:18px; box-shadow:0 4px 18px rgba(0,0,0,0.25); text-align:left; }
            .facility-modal h3 { margin:0 0 14px; text-align:center; color:#003b73; }
            .facility-modal label { display:block; font-size:13px; font-weight:bold; margin:10px 0 4px; color:#003b73; }
            .facility-modal input { width:100%; padding:9px; border:1px solid #bbb; border-radius:6px; font-size:15px; box-sizing:border-box; }
            .facility-modal-buttons { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:16px; }
            .facility-modal-buttons button { padding:11px; border:none; border-radius:7px; font-weight:bold; cursor:pointer; }
            .btn-save-facility { background:#22a843; color:white; }
            .btn-cancel-facility { background:#777; color:white; }
            .facility-error { color:red; font-size:13px; text-align:center; margin-top:10px; min-height:16px; }
        </style>

        <div class="details-card">
            <div class="details-title">${escapeHtml(getFacilityName(facility))}</div>
            <div class="details-subtitle">FACILITY DETAILS</div>

            ${facility.image_url
                ? `<img class="details-image" src="${escapeHtml(facility.image_url)}" alt="${escapeHtml(getFacilityName(facility))}">`
                : `<div class="details-image"></div>`}

            <div class="details-info-box">
                <div class="details-label">ADDRESS</div>
                <div class="details-value">
                    ${facility.address
                        ? `<a class="details-link" href="${escapeHtml(getMapUrl(facility.address))}" target="_blank" rel="noopener noreferrer">${escapeHtml(facility.address)}</a>`
                        : ''}
                </div>

                <div class="details-label">PHONE</div>
                <div class="details-value">
                    ${facility.phone
                        ? `<a class="details-link" href="${escapeHtml(getPhoneUrl(facility.phone))}">${escapeHtml(facility.phone)}</a>`
                        : ''}
                </div>
            </div>

            <div class="details-button-row">
                <button id="btn-edit-facility" class="details-action-btn">⚙️ Edit</button>
                <button id="btn-delete-facility" class="details-delete-btn">🗑 Delete</button>
            </div>

            <button id="btn-go-contacts" class="details-main-btn">📇 CONTACTS</button>
            <button id="btn-go-projects" class="details-main-btn">📋 PROJECTS</button>
            <button id="btn-back-home" class="details-back-btn">⬅️ BACK</button>

            <div class="details-version-tag">facilities_views/facilities-details/grid.js</div>
        </div>

        <div id="facility-modal-backdrop" class="facility-modal-backdrop">
            <div class="facility-modal">
                <h3>Edit Facility</h3>

                <label>Facility Name</label>
                <input id="facility-name-input" type="text" value="${escapeHtml(facility.number_name || facility.name || '')}">

                <label>Abbreviation</label>
                <input id="facility-abbreviation-input" type="text" value="${escapeHtml(facility.abbreviation || '')}">

                <label>Address</label>
                <input id="facility-address-input" type="text" value="${escapeHtml(facility.address || '')}">

                <label>Phone</label>
                <input id="facility-phone-input" type="tel" inputmode="numeric" value="${escapeHtml(facility.phone || '')}">

                <div class="facility-modal-buttons">
                    <button id="btn-save-facility" class="btn-save-facility">Save</button>
                    <button id="btn-cancel-facility" class="btn-cancel-facility">Cancel</button>
                </div>

                <div id="facility-error" class="facility-error"></div>

                <div class="details-version-tag">facilities_views/facilities-details/grid.js</div>
            </div>
        </div>
    `;

    const modalBackdrop = document.getElementById('facility-modal-backdrop');
    const errorBox = document.getElementById('facility-error');

    document.getElementById('btn-edit-facility').addEventListener('click', () => {
        modalBackdrop.style.display = 'flex';
    });

    document.getElementById('btn-cancel-facility').addEventListener('click', () => {
        modalBackdrop.style.display = 'none';
    });

    document.getElementById('btn-go-contacts').addEventListener('click', () => {
        if (window.navigateTo) window.navigateTo('facilities-contacts', facility);
    });

    document.getElementById('btn-go-projects').addEventListener('click', () => {
        if (window.navigateTo) window.navigateTo('facilities-projects', facility);
    });

    document.getElementById('btn-back-home').addEventListener('click', () => {
        if (window.navigateTo) window.navigateTo('facilities-home');
    });

    document.getElementById('btn-delete-facility').addEventListener('click', async () => {
        if (!confirm('Are you sure you want to delete this facility?')) return;

        const { error } = await deleteFacility(facilityId);

        if (error) {
            console.error('Delete facility error:', error);
            alert('Could not delete facility.');
            return;
        }

        if (window.navigateTo) window.navigateTo('facilities-home');
    });

    document.getElementById('btn-save-facility').addEventListener('click', async () => {
        const numberName = document.getElementById('facility-name-input').value.trim();
        const abbreviation = document.getElementById('facility-abbreviation-input').value.trim();
        const address = document.getElementById('facility-address-input').value.trim();
        const phone = document.getElementById('facility-phone-input').value.trim();

        if (!numberName || !abbreviation) {
            errorBox.textContent = 'Name and abbreviation required.';
            return;
        }

        const payload = {
            number_name: numberName,
            abbreviation,
            address,
            phone
        };

        const { data, error } = await updateFacility(facilityId, payload);

        if (error) {
            console.error('Update facility error:', error);
            errorBox.textContent = 'Could not update facility.';
            return;
        }

        modalBackdrop.style.display = 'none';

        if (window.navigateTo) {
            window.navigateTo('facilities-details', data);
        }
    });
}
