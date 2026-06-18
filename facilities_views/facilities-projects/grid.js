/*================================================================
FACILITIES-PROJECTS GRID
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
        .from('location_images')
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

function escapeHtml(value) {
    return String(value || '')
        .replaceAll('&', '&')
        .replaceAll('<', '<')
        .replaceAll('>', '>')
        .replaceAll('"', '"')
        .replaceAll("'", '&#39;');
}

export async function renderProjectsGrid(containerId, facilityId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!facilityId) {
        container.innerHTML = `<p style="color:red; text-align:center;">Missing facility ID.</p>`;
        return;
    }

    const facility = await fetchFacilityById(facilityId);
    if (!facility) {
        container.innerHTML = `<p style="color:red; text-align:center;">Facility not found.</p>`;
        return;
    }

    const imageUrl = facility.image_url || await fetchFacilityImage(facilityId);

    const facilityName = facility.abbreviation || facility.number_name || facility.name || 'Facility';
    const address = facility.address || '';
    const phone = facility.phone || '';

    container.innerHTML = `
        <style>
            .facility-detail-card {
                background: #ffffff;
                max-width: 320px;
                margin: 16px auto;
                padding: 18px;
                border-radius: 14px;
                box-shadow: 0 4px 18px rgba(0, 0, 0, 0.08);
                text-align: center;
            }

            .facility-detail-title-row {
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                min-height: 40px;
            }

            .facility-detail-title {
                color: #003b73;
                font-size: 24px;
                font-weight: bold;
                margin: 8px 0 10px;
            }

            .facility-del-btn {
                position: absolute;
                left: 0;
                top: 0;
                background: #fee2e2;
                color: #dc2626;
                border: none;
                border-radius: 7px;
                padding: 8px 10px;
                font-weight: bold;
                cursor: pointer;
            }

            .facility-edit-btn {
                position: absolute;
                right: 0;
                top: 0;
                background: #e9edf4;
                color: #003b73;
                border: none;
                border-radius: 7px;
                padding: 8px 12px;
                font-weight: bold;
                cursor: pointer;
            }

            .facility-main-image {
                width: 100%;
                max-width: 260px;
                height: 140px;
                object-fit: cover;
                border-radius: 9px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.12);
                margin-bottom: 14px;
            }

            .facility-info-box {
                border: 1px solid #d6dee8;
                border-radius: 10px;
                padding: 12px 14px;
                text-align: left;
                max-width: 250px;
                margin: 0 auto 18px;
                background: #f8fbff;
            }

            .facility-info-label {
                font-size: 11px;
                font-weight: bold;
                color: #003b73;
                margin-top: 4px;
                text-transform: uppercase;
            }

            .facility-info-link {
                display: block;
                color: #003b73;
                font-size: 14px;
                margin: 3px 0 12px;
                text-decoration: underline;
            }

            .facility-divider {
                height: 4px;
                background: #003b73;
                border-radius: 4px;
                margin: 18px 4px;
            }

            .facility-action-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 16px;
                margin-top: 18px;
            }

            .facility-action-btn {
                background: #003b73;
                color: white;
                border: none;
                border-radius: 9px;
                min-height: 54px;
                font-size: 15px;
                font-weight: bold;
                cursor: pointer;
            }

            .facility-back-btn {
                background: #747d8c;
                color: white;
                border: none;
                border-radius: 9px;
                width: 100%;
                min-height: 48px;
                font-size: 15px;
                font-weight: bold;
                cursor: pointer;
                margin-top: 16px;
            }

            .facility-version-tag {
                border-top: 1px solid #d6dee8;
                margin-top: 22px;
                padding-top: 12px;
                font-size: 10px;
                color: #7d8ba0;
                text-align: center;
            }
        </style>

        <div class="facility-detail-card">
            <div class="facility-detail-title-row">
                <button id="btn-delete-facility" class="facility-del-btn">🗑️</button>
                <div class="facility-detail-title">${escapeHtml(facilityName)}</div>
                <button id="btn-edit-facility" class="facility-edit-btn">⚙️ Edit</button>
            </div>

            ${imageUrl ? `
                <img class="facility-main-image" src="${escapeHtml(imageUrl)}" alt="${escapeHtml(facilityName)}">
            ` : ''}

            <div class="facility-info-box">
                <div class="facility-info-label">📍 Address</div>
                ${address ? `
                    <a class="facility-info-link" href="http://maps.google.com/?q=${encodeURIComponent(address)}" target="_blank">
                        ${escapeHtml(address)}
                    </a>
                ` : `
                    <span class="facility-info-link">No address</span>
                `}

                <div class="facility-info-label">Phone Contact</div>
                ${phone ? `
                    <a class="facility-info-link" href="tel:${escapeHtml(phone)}">
                        📞 ${escapeHtml(phone)}
                    </a>
                ` : `
                    <span class="facility-info-link">No phone</span>
                `}
            </div>

            <div class="facility-divider"></div>

            <div class="facility-action-grid">
                <button id="btn-open-contacts" class="facility-action-btn">👥 2. CONTACT</button>
                <button id="btn-open-projects" class="facility-action-btn">📋 3. PROJECTS</button>
            </div>

            <button id="btn-back-home" class="facility-back-btn">⬅️ BACK</button>

            <div class="facility-version-tag">
                facilities-projects/grid.js | v2026_06_18_projects_shell_v1 | 2026-06-18
            </div>
        </div>
    `;

    document.getElementById('btn-delete-facility').addEventListener('click', async () => {
        if (!confirm('Are you sure you want to delete this facility?')) return;
        const { error } = await supabase.from('facilities').delete().eq('id', facilityId);
        if (error) {
            console.error('Delete error:', error);
            alert('Failed to delete.');
        } else {
            window.navigateTo('facilities-home');
        }
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
        console.log('Edit facility clicked:', facilityId);
    });
}
