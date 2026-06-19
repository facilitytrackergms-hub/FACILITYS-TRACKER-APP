/*================================================================
PROJECT-PHOTOS GRID
VERSION: v2026_06_18_project_photos_new
================================================================*/

import {
    fetchProjectPhotos,
    createProjectPhoto,
    deleteProjectPhoto
} from './data.js';

import {
    uploadImage
} from '../../global_engine/image-handler.js';

function escapeHtml(value) {
    return String(value || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function getProjectId(context) {
    if (typeof context === 'object' && context !== null) return context.project_id || context.projectId || context.id;
    return context;
}

function getPhotoType(context) {
    if (typeof context === 'object' && context !== null) return context.photo_type || context.photoType || 'before';
    return 'before';
}

function getFacilityId(context) {
    if (typeof context === 'object' && context !== null) return context.facilities_id || context.facility_id || context.location_id || context.id || null;
    return null;
}

function getTitle(photoType) {
    if (photoType === 'during') return 'DURING PHOTOS';
    if (photoType === 'after') return 'AFTER PHOTOS';
    return 'BEFORE PHOTOS';
}

export async function renderProjectPhotosGrid(containerId, context = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const projectId = getProjectId(context);
    const photoType = getPhotoType(context);
    const facilityId = getFacilityId(context);
    const projectName = context.project_name || context.name || 'Project';

    if (!projectId) {
        container.innerHTML = `<p style="color:red;text-align:center;">Missing project ID.</p>`;
        return;
    }

    const photos = await fetchProjectPhotos(projectId, photoType);

    container.innerHTML = `
        <style>
            .photos-card { background:#ffffff; max-width:350px; margin:16px auto; padding:18px; border-radius:14px; box-shadow:0 4px 18px rgba(0,0,0,0.08); text-align:center; }
            .photos-title { color:#003b73; font-size:22px; font-weight:bold; margin-bottom:2px; }
            .photos-subtitle { color:#003b73; font-size:13px; font-weight:bold; margin-bottom:16px; letter-spacing:2px; }
            .photos-add-btn { background:#22a843; color:white; border:none; border-radius:9px; width:100%; min-height:48px; font-size:15px; font-weight:bold; cursor:pointer; margin-bottom:14px; }
            .photos-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
            .photo-box { border:1px solid #d6dee8; border-radius:10px; padding:6px; background:#f8fbff; }
            .photo-box img { width:100%; height:115px; object-fit:cover; border-radius:8px; cursor:pointer; }
            .photo-date { font-size:10px; color:#667085; margin-top:4px; }
            .photo-delete-btn { background:#dc2626; color:yellow; border:none; border-radius:6px; width:100%; padding:7px; margin-top:6px; font-size:11px; font-weight:bold; cursor:pointer; }
            .photos-empty { color:#667085; font-size:14px; padding:14px; grid-column:1 / -1; }
            .photos-back-btn { background:#747d8c; color:white; border:none; border-radius:9px; width:100%; min-height:48px; font-size:15px; font-weight:bold; cursor:pointer; margin-top:16px; }
            .photos-version-tag { border-top:1px solid #d6dee8; margin-top:18px; padding-top:10px; font-size:10px; color:#7d8ba0; text-align:center; }

            .photo-view-backdrop { position:fixed; inset:0; background:rgba(0,0,0,0.82); display:none; align-items:center; justify-content:center; z-index:9999; padding:18px; }
            .photo-view-box { width:100%; max-width:420px; text-align:center; }
            .photo-view-box img { width:100%; max-height:75vh; object-fit:contain; border-radius:10px; background:white; }
            .photo-view-close { background:#dc2626; color:white; border:none; border-radius:8px; padding:10px 18px; margin-top:12px; font-weight:bold; cursor:pointer; }
        </style>

        <div class="photos-card">
            <div class="photos-title">${escapeHtml(projectName)}</div>
            <div class="photos-subtitle">${escapeHtml(getTitle(photoType))}</div>

            <button id="btn-add-project-photo" class="photos-add-btn">ADD IMAGE</button>
            <input id="project-photo-input" type="file" accept="image/*" multiple style="display:none;">

            <div class="photos-grid">
                ${photos.length ? photos.map(photo => `
                    <div class="photo-box">
                        <img src="${escapeHtml(photo.image_url)}" alt="${escapeHtml(photoType)} photo" data-url="${escapeHtml(photo.image_url)}">
                        <div class="photo-date">${escapeHtml(photo.created_at ? new Date(photo.created_at).toLocaleString() : '')}</div>
                        <button type="button" class="photo-delete-btn" data-id="${photo.id}">DELETE</button>
                    </div>
                `).join('') : `<div class="photos-empty">No ${escapeHtml(photoType)} photos yet.</div>`}
            </div>

            <button id="btn-back-project-detail" class="photos-back-btn">⬅️ BACK</button>

            <div class="photos-version-tag">facilities_views/project-photos/grid.js</div>
        </div>

        <div id="photo-view-backdrop" class="photo-view-backdrop">
            <div class="photo-view-box">
                <img id="photo-view-image" src="" alt="Project photo">
                <button id="photo-view-close" class="photo-view-close">CLOSE</button>
            </div>
        </div>
    `;

    const photoInput = document.getElementById('project-photo-input');
    const photoViewBackdrop = document.getElementById('photo-view-backdrop');
    const photoViewImage = document.getElementById('photo-view-image');

    document.getElementById('btn-add-project-photo').addEventListener('click', () => {
        photoInput.click();
    });

    photoInput.addEventListener('change', async event => {
        const files = Array.from(event.target.files || []);

        for (const file of files) {
            try {
                const imageUrl = await uploadImage(
                    file,
                    'locations-images',
                    `project_photos/project_${projectId}/${photoType}`
                );

                const { error } = await createProjectPhoto({
                    project_id: projectId,
                    project_update_id: context.project_update_id || null,
                    facilities_id: facilityId,
                    photo_type: photoType,
                    image_url: imageUrl,
                    caption: ''
                });

                if (error) {
                    console.error('Create project photo error:', error);
                    alert('Could not save photo record.');
                    return;
                }
            } catch (err) {
                console.error('Upload project photo error:', err);
                alert('Could not upload image.');
                return;
            }
        }

        await renderProjectPhotosGrid(containerId, context);
    });

    document.querySelectorAll('.photo-box img').forEach(image => {
        image.addEventListener('click', () => {
            photoViewImage.src = image.dataset.url;
            photoViewBackdrop.style.display = 'flex';
        });
    });

    document.getElementById('photo-view-close').addEventListener('click', () => {
        photoViewBackdrop.style.display = 'none';
        photoViewImage.src = '';
    });

    document.querySelectorAll('.photo-delete-btn').forEach(button => {
        button.addEventListener('click', async () => {
            const photoId = button.dataset.id;

            if (!confirm('Delete this image?')) return;

            const { error } = await deleteProjectPhoto(photoId);

            if (error) {
                console.error('Delete project photo error:', error);
                alert('Could not delete image.');
                return;
            }

            await renderProjectPhotosGrid(containerId, context);
        });
    });

    document.getElementById('btn-back-project-detail').addEventListener('click', () => {
        if (window.navigateTo) {
            window.navigateTo('facility-project-detail', {
                ...context,
                project_id: projectId
            });
        }
    });
}
