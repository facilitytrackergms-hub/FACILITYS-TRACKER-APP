/*================================================================
PROJECT-UPDATE GRID
VERSION: v2026_06_23_text_photo_popup_fix
================================================================*/

import {
    fetchProjectUpdate,
    updateProjectUpdate,
    deleteProjectUpdate,
    fetchProjectUpdatePhotos,
    createProjectUpdatePhoto,
    deleteProjectUpdatePhoto
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
    if (typeof context === 'object' && context !== null) return context.project_id || context.projectId || null;
    return null;
}

function getProjectUpdateId(context) {
    if (typeof context === 'object' && context !== null) return context.project_update_id || context.projectUpdateId || context.update_id || context.id;
    return context;
}

function getFacilityId(context, update) {
    if (update?.facilities_id) return update.facilities_id;
    if (typeof context === 'object' && context !== null) return context.facilities_id || context.facility_id || context.location_id || context.id || null;
    return null;
}

function formatDate(value) {
    if (!value) return '';
    return new Date(value).toLocaleString();
}

function getPhotoTitle(photoType) {
    if (photoType === 'during') return 'DURING PHOTOS';
    if (photoType === 'after') return 'AFTER PHOTOS';
    return 'BEFORE PHOTOS';
}

function renderPhotoSection(photoType, photos) {
    return `
        <div class="project-update-photo-section">
            <div class="project-update-section-title">${escapeHtml(getPhotoTitle(photoType))}</div>

            <button type="button" class="project-update-add-photo-btn" data-type="${escapeHtml(photoType)}">ADD IMAGE</button>
            <input type="file" accept="image/*" capture="environment" multiple class="project-update-photo-input" data-type="${escapeHtml(photoType)}" style="display:none;">

            <button type="button" class="project-update-see-photo-btn" data-type="${escapeHtml(photoType)}">SEE IMAGES</button>

            <div class="project-update-photo-count">
                ${photos.length ? `${photos.length} image${photos.length === 1 ? '' : 's'}` : `No ${escapeHtml(photoType)} photos yet.`}
            </div>
        </div>
    `;
}

function renderPhotoPopupGrid(photoType, photos) {
    if (!photos.length) {
        return `<div class="project-update-no-photos">No ${escapeHtml(photoType)} photos yet.</div>`;
    }

    return photos.map((photo, index) => `
        <div class="project-update-popup-photo-box">
            <img
                src="${escapeHtml(photo.image_url)}"
                alt="${escapeHtml(photoType)} photo"
                data-url="${escapeHtml(photo.image_url)}"
                data-index="${index}"
                data-type="${escapeHtml(photoType)}"
                class="project-update-popup-photo-img"
            >
            <div class="project-update-photo-date">${escapeHtml(formatDate(photo.created_at))}</div>
            <button type="button" class="project-update-photo-delete-btn" data-id="${photo.id}">DELETE</button>
        </div>
    `).join('');
}

export async function renderProjectUpdateGrid(containerId, context = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const updateId = getProjectUpdateId(context);
    const projectIdFromContext = getProjectId(context);
    const projectName = context.project_name || context.projectName || 'Project';

    if (!updateId) {
        container.innerHTML = `<p style="color:red;text-align:center;">Missing project update ID.</p>`;
        return;
    }

    const { data: update, error } = await fetchProjectUpdate(updateId);

    if (error || !update) {
        console.error('Fetch project update error:', error);
        container.innerHTML = `<p style="color:red;text-align:center;">Could not load project update.</p>`;
        return;
    }

    const projectId = update.project_id || projectIdFromContext;
    const facilityId = getFacilityId(context, update);

    const beforePhotos = await fetchProjectUpdatePhotos(updateId, 'before');
    const duringPhotos = await fetchProjectUpdatePhotos(updateId, 'during');
    const afterPhotos = await fetchProjectUpdatePhotos(updateId, 'after');

    const photoGroups = {
        before: beforePhotos,
        during: duringPhotos,
        after: afterPhotos
    };

    let activePhotoType = '';
    let activePhotoIndex = 0;

    container.innerHTML = `
        <style>
            .project-update-card { background:#ffffff; max-width:350px; margin:16px auto; padding:18px; border-radius:14px; box-shadow:0 4px 18px rgba(0,0,0,0.08); text-align:center; }
            .project-update-title { color:#003b73; font-size:24px; font-weight:bold; margin-bottom:2px; }
            .project-update-subtitle { color:#003b73; font-size:13px; font-weight:bold; margin-bottom:16px; letter-spacing:2px; }
            .project-update-info-box { border:1px solid #d6dee8; border-radius:10px; padding:12px; text-align:left; margin-bottom:14px; background:#f8fbff; }
            .project-update-label { color:#003b73; font-size:11px; font-weight:bold; margin-top:8px; }
            .project-update-value { color:#111827; font-size:14px; margin-bottom:8px; white-space:pre-wrap; }
            .project-update-date { color:#667085; font-size:11px; margin-bottom:8px; }
            .project-update-button-row { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:12px; }
            .project-update-action-btn { background:#003b73; color:white; border:none; border-radius:9px; min-height:48px; font-size:14px; font-weight:bold; cursor:pointer; }
            .project-update-delete-btn { background:#dc2626; color:yellow; border:none; border-radius:9px; min-height:48px; font-size:14px; font-weight:bold; cursor:pointer; }
            .project-update-back-btn { background:#747d8c; color:white; border:none; border-radius:9px; width:100%; min-height:48px; font-size:15px; font-weight:bold; cursor:pointer; margin-top:12px; }
            .project-update-version-tag { border-top:1px solid #d6dee8; margin-top:18px; padding-top:10px; font-size:10px; color:#7d8ba0; text-align:center; }

            .project-update-photo-section { border:1px solid #d6dee8; border-radius:10px; padding:10px; background:#f8fbff; margin-bottom:12px; text-align:center; }
            .project-update-section-title { color:#003b73; font-size:13px; font-weight:bold; letter-spacing:2px; margin-bottom:8px; }
            .project-update-add-photo-btn { background:#22a843; color:white; border:none; border-radius:8px; width:100%; min-height:42px; font-size:14px; font-weight:bold; cursor:pointer; margin-bottom:8px; }
            .project-update-see-photo-btn { background:#003b73; color:white; border:none; border-radius:8px; width:100%; min-height:42px; font-size:14px; font-weight:bold; cursor:pointer; margin-bottom:8px; }
            .project-update-photo-count { color:#667085; font-size:13px; padding:4px; }

            .project-update-modal-backdrop,
            .project-update-text-backdrop,
            .project-update-photo-popup-backdrop { position:fixed; inset:0; background:rgba(0,0,0,0.45); display:none; align-items:center; justify-content:center; z-index:9999; }

            .project-update-modal,
            .project-update-text-modal,
            .project-update-photo-popup-modal { background:white; width:90%; max-width:360px; border-radius:12px; padding:18px; box-shadow:0 4px 18px rgba(0,0,0,0.25); text-align:left; max-height:90vh; overflow-y:auto; }

            .project-update-modal h3,
            .project-update-text-modal h3,
            .project-update-photo-popup-modal h3 { margin:0 0 14px; text-align:center; color:#003b73; }

            .project-update-modal label { display:block; font-size:13px; font-weight:bold; margin:10px 0 4px; color:#003b73; }
            .project-update-modal input,
            .project-update-modal textarea { width:100%; padding:9px; border:1px solid #bbb; border-radius:6px; font-size:15px; box-sizing:border-box; }
            .project-update-modal textarea { min-height:80px; resize:vertical; }
            .project-update-checkbox-row { display:flex; align-items:center; gap:8px; margin-top:12px; color:#003b73; font-size:13px; font-weight:bold; }
            .project-update-checkbox-row input { width:auto; }
            .project-update-modal-buttons { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:16px; }
            .project-update-modal-buttons button { padding:11px; border:none; border-radius:7px; font-weight:bold; cursor:pointer; }
            .btn-save-project-update { background:#22a843; color:white; }
            .btn-cancel-project-update { background:#777; color:white; }
            .project-update-error { color:red; font-size:13px; text-align:center; margin-top:10px; min-height:16px; }

            .project-update-text-box { border:1px solid #d6dee8; border-radius:10px; padding:12px; text-align:left; background:#f8fbff; }
            .project-update-text-close-btn,
            .project-update-photo-popup-close-btn { background:#747d8c; color:white; border:none; border-radius:8px; width:100%; min-height:42px; font-size:14px; font-weight:bold; cursor:pointer; margin-top:12px; }

            .project-update-popup-photo-grid { display:grid; grid-template-columns:1fr 1fr; gap:9px; }
            .project-update-popup-photo-box { border:1px solid #d6dee8; border-radius:8px; padding:6px; background:#ffffff; text-align:center; }
            .project-update-popup-photo-box img { width:100%; height:105px; object-fit:cover; border-radius:7px; cursor:pointer; }
            .project-update-photo-date { font-size:10px; color:#667085; margin-top:4px; }
            .project-update-photo-delete-btn { background:#dc2626; color:yellow; border:none; border-radius:6px; width:100%; padding:7px; margin-top:6px; font-size:11px; font-weight:bold; cursor:pointer; }
            .project-update-no-photos { color:#667085; font-size:13px; padding:10px; text-align:center; }

            .project-update-viewer-backdrop { position:fixed; inset:0; background:rgba(0,0,0,0.92); display:none; align-items:center; justify-content:center; z-index:10000; }
            .project-update-viewer-box { width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:12px; box-sizing:border-box; }
            .project-update-viewer-image { width:100%; max-width:520px; max-height:82vh; object-fit:contain; border-radius:8px; background:#ffffff; }
            .project-update-viewer-controls { display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; width:100%; max-width:350px; margin-top:12px; }
            .project-update-viewer-controls button { border:none; border-radius:8px; padding:11px; font-size:13px; font-weight:bold; cursor:pointer; }
            .project-update-viewer-prev,
            .project-update-viewer-next { background:#003b73; color:white; }
            .project-update-viewer-close { background:#dc2626; color:white; }
        </style>

        <div class="project-update-card">
            <div class="project-update-title">${escapeHtml(update.update_title || 'Project Update')}</div>
            <div class="project-update-subtitle">${escapeHtml(projectName)} UPDATE</div>

            <div class="project-update-info-box">
                <div class="project-update-date">${escapeHtml(formatDate(update.created_at))}</div>

                <div class="project-update-label">STATUS</div>
                <div class="project-update-value">${escapeHtml(update.status || '')}</div>

                <div class="project-update-label">WORK DONE TODAY</div>
                <div class="project-update-value">${escapeHtml(update.work_done || '')}</div>

                <div class="project-update-label">WHERE I LEFT OFF</div>
                <div class="project-update-value">${escapeHtml(update.left_off_at || '')}</div>

                <div class="project-update-label">MATERIALS NEEDED</div>
                <div class="project-update-value">${escapeHtml(update.materials_needed || '')}</div>

                <div class="project-update-label">NEXT STEP</div>
                <div class="project-update-value">${escapeHtml(update.next_step || '')}</div>

                <div class="project-update-label">VENDOR NEEDED</div>
                <div class="project-update-value">${update.vendor_needed ? 'Yes' : 'No'}</div>

                <div class="project-update-label">NOTES</div>
                <div class="project-update-value">${escapeHtml(update.notes || '')}</div>
            </div>

            <div class="project-update-button-row">
                <button id="btn-text-project-update" class="project-update-action-btn">TEXT</button>
                <button id="btn-edit-project-update" class="project-update-action-btn">⚙️ Edit</button>
            </div>

            ${renderPhotoSection('before', beforePhotos)}
            ${renderPhotoSection('during', duringPhotos)}
            ${renderPhotoSection('after', afterPhotos)}

            <div class="project-update-button-row" style="margin-top:12px;">
                <button id="btn-delete-project-update" class="project-update-delete-btn">🗑 Delete</button>
                <button id="btn-back-project-detail" class="project-update-back-btn" style="margin-top:0;">⬅️ BACK</button>
            </div>

            <div class="project-update-version-tag">facilities_views/project-update/grid.js<br>v2026_06_23_text_photo_popup_fix</div>
        </div>

        <div id="project-update-text-backdrop" class="project-update-text-backdrop">
            <div class="project-update-text-modal">
                <h3>Project Update Text</h3>

                <div class="project-update-text-box">
                    <div class="project-update-date">${escapeHtml(formatDate(update.created_at))}</div>

                    <div class="project-update-label">STATUS</div>
                    <div class="project-update-value">${escapeHtml(update.status || '')}</div>

                    <div class="project-update-label">WORK DONE TODAY</div>
                    <div class="project-update-value">${escapeHtml(update.work_done || '')}</div>

                    <div class="project-update-label">WHERE I LEFT OFF</div>
                    <div class="project-update-value">${escapeHtml(update.left_off_at || '')}</div>

                    <div class="project-update-label">MATERIALS NEEDED</div>
                    <div class="project-update-value">${escapeHtml(update.materials_needed || '')}</div>

                    <div class="project-update-label">NEXT STEP</div>
                    <div class="project-update-value">${escapeHtml(update.next_step || '')}</div>

                    <div class="project-update-label">VENDOR NEEDED</div>
                    <div class="project-update-value">${update.vendor_needed ? 'Yes' : 'No'}</div>

                    <div class="project-update-label">NOTES</div>
                    <div class="project-update-value">${escapeHtml(update.notes || '')}</div>
                </div>

                <button id="btn-close-project-update-text" class="project-update-text-close-btn">CLOSE</button>

                <div class="project-update-version-tag">facilities_views/project-update/grid.js<br>v2026_06_23_text_photo_popup_fix</div>
            </div>
        </div>

        <div id="project-update-photo-popup-backdrop" class="project-update-photo-popup-backdrop">
            <div class="project-update-photo-popup-modal">
                <h3 id="project-update-photo-popup-title">Photos</h3>
                <div id="project-update-photo-popup-grid" class="project-update-popup-photo-grid"></div>
                <button id="btn-close-project-update-photo-popup" class="project-update-photo-popup-close-btn">CLOSE</button>

                <div class="project-update-version-tag">facilities_views/project-update/grid.js<br>v2026_06_23_text_photo_popup_fix</div>
            </div>
        </div>

        <div id="project-update-modal-backdrop" class="project-update-modal-backdrop">
            <div class="project-update-modal">
                <h3>Edit Project Update</h3>

                <label>Update Title</label>
                <input id="project-update-title-input" type="text" list="project-update-title-options" value="${escapeHtml(update.update_title || '')}">

                <datalist id="project-update-title-options">
                    <option value="General Update"></option>
                    <option value="Carpet Update"></option>
                    <option value="AC Update"></option>
                    <option value="Plumbing Update"></option>
                    <option value="Electrical Update"></option>
                    <option value="Painting Update"></option>
                    <option value="Materials Update"></option>
                    <option value="Vendor Update"></option>
                    <option value="Room Flip Update"></option>
                </datalist>

                <label>Status Today</label>
                <input id="project-update-status-input" type="text" list="project-update-status-options" value="${escapeHtml(update.status || '')}">

                <datalist id="project-update-status-options">
                    <option value="Not Started"></option>
                    <option value="In Progress"></option>
                    <option value="Waiting on Materials"></option>
                    <option value="Waiting on Vendor"></option>
                    <option value="On Hold"></option>
                    <option value="Completed"></option>
                </datalist>

                <label>Work Done Today</label>
                <textarea id="project-update-work-done-input">${escapeHtml(update.work_done || '')}</textarea>

                <label>Where I Left Off</label>
                <textarea id="project-update-left-off-input">${escapeHtml(update.left_off_at || '')}</textarea>

                <label>Materials Needed</label>
                <textarea id="project-update-materials-input">${escapeHtml(update.materials_needed || '')}</textarea>

                <label>Next Step</label>
                <textarea id="project-update-next-step-input">${escapeHtml(update.next_step || '')}</textarea>

                <div class="project-update-checkbox-row">
                    <input id="project-update-vendor-needed-input" type="checkbox" ${update.vendor_needed ? 'checked' : ''}>
                    <span>Vendor Needed</span>
                </div>

                <label>Notes</label>
                <textarea id="project-update-notes-input">${escapeHtml(update.notes || '')}</textarea>

                <div class="project-update-modal-buttons">
                    <button id="btn-save-project-update" class="btn-save-project-update">Save</button>
                    <button id="btn-cancel-project-update" class="btn-cancel-project-update">Cancel</button>
                </div>

                <div id="project-update-error" class="project-update-error"></div>

                <div class="project-update-version-tag">facilities_views/project-update/grid.js<br>v2026_06_23_text_photo_popup_fix</div>
            </div>
        </div>

        <div id="project-update-viewer-backdrop" class="project-update-viewer-backdrop">
            <div class="project-update-viewer-box">
                <img id="project-update-viewer-image" class="project-update-viewer-image" src="" alt="Project update photo">

                <div class="project-update-viewer-controls">
                    <button id="project-update-viewer-prev" class="project-update-viewer-prev">⬅️ PREV</button>
                    <button id="project-update-viewer-close" class="project-update-viewer-close">CLOSE</button>
                    <button id="project-update-viewer-next" class="project-update-viewer-next">NEXT ➡️</button>
                </div>
            </div>
        </div>
    `;

    const modalBackdrop = document.getElementById('project-update-modal-backdrop');
    const textBackdrop = document.getElementById('project-update-text-backdrop');
    const photoPopupBackdrop = document.getElementById('project-update-photo-popup-backdrop');
    const photoPopupTitle = document.getElementById('project-update-photo-popup-title');
    const photoPopupGrid = document.getElementById('project-update-photo-popup-grid');
    const errorBox = document.getElementById('project-update-error');
    const viewerBackdrop = document.getElementById('project-update-viewer-backdrop');
    const viewerImage = document.getElementById('project-update-viewer-image');

    function showViewer(photoType, index) {
        const photos = photoGroups[photoType] || [];
        if (!photos.length) return;

        activePhotoType = photoType;
        activePhotoIndex = index;

        viewerImage.src = photos[activePhotoIndex].image_url;
        viewerBackdrop.style.display = 'flex';
    }

    function moveViewer(direction) {
        const photos = photoGroups[activePhotoType] || [];
        if (!photos.length) return;

        activePhotoIndex += direction;

        if (activePhotoIndex < 0) {
            activePhotoIndex = photos.length - 1;
        }

        if (activePhotoIndex >= photos.length) {
            activePhotoIndex = 0;
        }

        viewerImage.src = photos[activePhotoIndex].image_url;
    }

    function openPhotoPopup(photoType) {
        const photos = photoGroups[photoType] || [];

        photoPopupTitle.textContent = getPhotoTitle(photoType);
        photoPopupGrid.innerHTML = renderPhotoPopupGrid(photoType, photos);
        photoPopupBackdrop.style.display = 'flex';

        document.querySelectorAll('.project-update-popup-photo-img').forEach(image => {
            image.addEventListener('click', () => {
                showViewer(image.dataset.type, Number(image.dataset.index || 0));
            });
        });

        document.querySelectorAll('.project-update-photo-delete-btn').forEach(button => {
            button.addEventListener('click', async () => {
                const photoId = button.dataset.id;

                if (!confirm('Delete this image?')) return;

                const { error } = await deleteProjectUpdatePhoto(photoId);

                if (error) {
                    console.error('Delete project update photo error:', error);
                    alert('Could not delete image.');
                    return;
                }

                await renderProjectUpdateGrid(containerId, context);
            });
        });
    }

    document.querySelectorAll('.project-update-add-photo-btn').forEach(button => {
        button.addEventListener('click', () => {
            const photoType = button.dataset.type;
            const input = document.querySelector(`.project-update-photo-input[data-type="${photoType}"]`);

            if (input) {
                input.click();
            }
        });
    });

    document.querySelectorAll('.project-update-photo-input').forEach(input => {
        input.addEventListener('change', async event => {
            const photoType = input.dataset.type;
            const files = Array.from(event.target.files || []);

            for (const file of files) {
                try {
                    const imageUrl = await uploadImage(
                        file,
                        'locations-images',
                        `project_update_photos/project_${projectId}/update_${updateId}/${photoType}`
                    );

                    const { error } = await createProjectUpdatePhoto({
                        project_id: projectId,
                        project_update_id: updateId,
                        facilities_id: facilityId,
                        photo_type: photoType,
                        image_url: imageUrl,
                        caption: ''
                    });

                    if (error) {
                        console.error('Create project update photo error:', error);
                        alert('Could not save photo record.');
                        return;
                    }
                } catch (err) {
                    console.error('Upload project update photo error:', err);
                    alert('Could not upload image.');
                    return;
                }
            }

            await renderProjectUpdateGrid(containerId, context);
        });
    });

    document.querySelectorAll('.project-update-see-photo-btn').forEach(button => {
        button.addEventListener('click', () => {
            openPhotoPopup(button.dataset.type);
        });
    });

    document.getElementById('btn-close-project-update-photo-popup').addEventListener('click', () => {
        photoPopupBackdrop.style.display = 'none';
        photoPopupGrid.innerHTML = '';
    });

    document.getElementById('project-update-viewer-prev').addEventListener('click', () => {
        moveViewer(-1);
    });

    document.getElementById('project-update-viewer-next').addEventListener('click', () => {
        moveViewer(1);
    });

    document.getElementById('project-update-viewer-close').addEventListener('click', () => {
        viewerBackdrop.style.display = 'none';
        viewerImage.src = '';
    });

    viewerBackdrop.addEventListener('touchstart', event => {
        viewerBackdrop.dataset.touchStartX = String(event.changedTouches[0].screenX);
    });

    viewerBackdrop.addEventListener('touchend', event => {
        const startX = Number(viewerBackdrop.dataset.touchStartX || 0);
        const endX = event.changedTouches[0].screenX;
        const difference = endX - startX;

        if (Math.abs(difference) < 50) return;

        if (difference > 0) {
            moveViewer(-1);
        } else {
            moveViewer(1);
        }
    });

    document.getElementById('btn-text-project-update').addEventListener('click', () => {
        textBackdrop.style.display = 'flex';
    });

    document.getElementById('btn-close-project-update-text').addEventListener('click', () => {
        textBackdrop.style.display = 'none';
    });

    document.getElementById('btn-edit-project-update').addEventListener('click', () => {
        modalBackdrop.style.display = 'flex';
    });

    document.getElementById('btn-cancel-project-update').addEventListener('click', () => {
        modalBackdrop.style.display = 'none';
    });

    document.getElementById('btn-delete-project-update').addEventListener('click', async () => {
        if (!confirm('Are you sure you want to delete this project update?')) return;

        const { error } = await deleteProjectUpdate(updateId);

        if (error) {
            console.error('Delete project update error:', error);
            alert('Could not delete project update.');
            return;
        }

        if (window.navigateTo) {
            window.navigateTo('facility-project-detail', {
                ...context,
                project_id: projectId
            });
        }
    });

    document.getElementById('btn-back-project-detail').addEventListener('click', () => {
        if (window.navigateTo) {
            window.navigateTo('facility-project-detail', {
                ...context,
                project_id: projectId
            });
        }
    });

    document.getElementById('btn-save-project-update').addEventListener('click', async () => {
        const updateTitle = document.getElementById('project-update-title-input').value.trim();
        const status = document.getElementById('project-update-status-input').value.trim();
        const workDone = document.getElementById('project-update-work-done-input').value.trim();
        const leftOffAt = document.getElementById('project-update-left-off-input').value.trim();
        const materialsNeeded = document.getElementById('project-update-materials-input').value.trim();
        const nextStep = document.getElementById('project-update-next-step-input').value.trim();
        const vendorNeeded = document.getElementById('project-update-vendor-needed-input').checked;
        const notes = document.getElementById('project-update-notes-input').value.trim();

        if (!updateTitle && !status && !workDone && !leftOffAt && !materialsNeeded && !nextStep && !notes) {
            errorBox.textContent = 'Enter at least one update detail.';
            return;
        }

        const payload = {
            update_title: updateTitle,
            status,
            work_done: workDone,
            left_off_at: leftOffAt,
            materials_needed: materialsNeeded,
            next_step: nextStep,
            vendor_needed: vendorNeeded,
            notes
        };

        const { error } = await updateProjectUpdate(updateId, payload);

        if (error) {
            console.error('Update project update error:', error);
            errorBox.textContent = 'Could not update project update.';
            return;
        }

        modalBackdrop.style.display = 'none';

        await renderProjectUpdateGrid(containerId, context);
    });
}
