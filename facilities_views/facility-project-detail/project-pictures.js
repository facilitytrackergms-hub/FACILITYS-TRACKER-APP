/*================================================================
FACILITY-PROJECT-DETAIL PROJECT PICTURES POPUP
LOCATION: /facilities_views/facility-project-detail/project-pictures.js
VERSION: v2026_06_26_project_pictures_phone_slider
UPDATED: 2026-06-26
================================================================*/

import {
    uploadProjectPicture,
    fetchProjectPictures,
    deleteProjectPicture
} from './project-pictures-data.js';

function escapeHtml(value) {
    return String(value || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

export function renderProjectPicturesPopup({ projectId, facilitiesId, projectName }) {
    if (document.getElementById('project-pictures-popup-backdrop')) {
        document.getElementById('project-pictures-popup-backdrop').remove();
    }

    let currentPictures = [];
    let currentPictureIndex = 0;
    let touchStartX = 0;
    let touchEndX = 0;

    const popup = document.createElement('div');
    popup.id = 'project-pictures-popup-backdrop';
    popup.innerHTML = `
        <style>
            .project-pictures-popup-backdrop {
                position: fixed;
                inset: 0;
                background: rgba(0,0,0,0.45);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            }

            .project-pictures-popup {
                background: white;
                width: 90%;
                max-width: 360px;
                max-height: 90vh;
                overflow-y: auto;
                border-radius: 12px;
                padding: 18px;
                box-shadow: 0 4px 18px rgba(0,0,0,0.25);
                text-align: center;
            }

            .project-pictures-title {
                color: #003b73;
                font-size: 20px;
                font-weight: bold;
                margin-bottom: 4px;
            }

            .project-pictures-subtitle {
                color: #003b73;
                font-size: 12px;
                font-weight: bold;
                margin-bottom: 14px;
                letter-spacing: 1px;
            }

            .project-pictures-button-row {
                display: grid;
                grid-template-columns: 1fr;
                gap: 8px;
                margin-bottom: 12px;
            }

            .project-pictures-btn {
                border: none;
                border-radius: 8px;
                min-height: 48px;
                font-size: 13px;
                font-weight: bold;
                cursor: pointer;
                color: white;
                background: #003b73;
            }

            .project-pictures-close-btn {
                border: none;
                border-radius: 8px;
                min-height: 46px;
                font-size: 14px;
                font-weight: bold;
                cursor: pointer;
                color: white;
                background: #777;
                width: 100%;
                margin-top: 12px;
            }

            .project-pictures-file-input {
                display: none;
            }

            .project-pictures-list {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 8px;
                margin-top: 12px;
            }

            .project-picture-card {
                border: 1px solid #d6dee8;
                border-radius: 10px;
                padding: 6px;
                background: #f8fbff;
            }

            .project-picture-img {
                width: 100%;
                height: 110px;
                object-fit: cover;
                border-radius: 8px;
                cursor: pointer;
            }

            .project-picture-delete-btn {
                background: #dc2626;
                color: yellow;
                border: none;
                border-radius: 7px;
                width: 100%;
                padding: 7px;
                font-size: 11px;
                font-weight: bold;
                margin-top: 5px;
                cursor: pointer;
            }

            .project-pictures-message {
                color: #667085;
                font-size: 13px;
                margin-top: 12px;
                min-height: 18px;
            }

            .project-picture-viewer-backdrop {
                position: fixed;
                inset: 0;
                background: rgba(0,0,0,0.92);
                display: none;
                align-items: center;
                justify-content: center;
                z-index: 10001;
            }

            .project-picture-viewer {
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 12px;
                box-sizing: border-box;
            }

            .project-picture-viewer-top {
                position: absolute;
                top: 10px;
                left: 10px;
                right: 10px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                z-index: 10002;
            }

            .project-picture-viewer-count {
                color: white;
                font-size: 13px;
                font-weight: bold;
                background: rgba(0,0,0,0.45);
                border-radius: 8px;
                padding: 8px 10px;
            }

            .project-picture-viewer-close {
                background: #777;
                color: white;
                border: none;
                border-radius: 8px;
                padding: 9px 12px;
                font-size: 13px;
                font-weight: bold;
                cursor: pointer;
            }

            .project-picture-viewer-img {
                max-width: 96%;
                max-height: 76%;
                object-fit: contain;
                border-radius: 10px;
                background: black;
            }

            .project-picture-viewer-bottom {
                position: absolute;
                left: 10px;
                right: 10px;
                bottom: 12px;
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                gap: 8px;
                z-index: 10002;
            }

            .project-picture-viewer-btn {
                border: none;
                border-radius: 8px;
                min-height: 44px;
                font-size: 12px;
                font-weight: bold;
                cursor: pointer;
                color: white;
                background: #003b73;
            }

            .project-picture-viewer-delete {
                background: #dc2626;
                color: yellow;
            }

            .project-pictures-version-tag {
                border-top: 1px solid #d6dee8;
                margin-top: 16px;
                padding-top: 10px;
                font-size: 10px;
                color: #7d8ba0;
                text-align: center;
            }
        </style>

        <div class="project-pictures-popup">
            <div class="project-pictures-title">Project Pictures</div>
            <div class="project-pictures-subtitle">${escapeHtml(projectName || 'Project')}</div>

            <div class="project-pictures-button-row">
                <button id="btn-popup-take-project-picture" class="project-pictures-btn">TAKE PICTURE</button>
            </div>

            <input
                id="project-picture-file-input"
                class="project-pictures-file-input"
                type="file"
                accept="image/*"
                capture="environment"
            >

            <div id="project-pictures-message" class="project-pictures-message"></div>
            <div id="project-pictures-list" class="project-pictures-list"></div>

            <button id="btn-close-project-pictures-popup" class="project-pictures-close-btn">Close</button>

            <div class="project-pictures-version-tag">
                project-pictures.js | v2026_06_26_project_pictures_phone_slider | 2026-06-26
            </div>
        </div>

        <div id="project-picture-viewer-backdrop" class="project-picture-viewer-backdrop">
            <div id="project-picture-viewer" class="project-picture-viewer">
                <div class="project-picture-viewer-top">
                    <div id="project-picture-viewer-count" class="project-picture-viewer-count"></div>
                    <button id="btn-close-project-picture-viewer" class="project-picture-viewer-close">X</button>
                </div>

                <img id="project-picture-viewer-img" class="project-picture-viewer-img" src="" alt="Project picture">

                <div class="project-picture-viewer-bottom">
                    <button id="btn-project-picture-prev" class="project-picture-viewer-btn">⬅ PREV</button>
                    <button id="btn-project-picture-delete" class="project-picture-viewer-btn project-picture-viewer-delete">DELETE</button>
                    <button id="btn-project-picture-next" class="project-picture-viewer-btn">NEXT ➡</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(popup);

    const fileInput = document.getElementById('project-picture-file-input');
    const messageBox = document.getElementById('project-pictures-message');
    const picturesList = document.getElementById('project-pictures-list');
    const viewerBackdrop = document.getElementById('project-picture-viewer-backdrop');
    const viewerImage = document.getElementById('project-picture-viewer-img');
    const viewerCount = document.getElementById('project-picture-viewer-count');

    function showCurrentPicture() {
        const picture = currentPictures[currentPictureIndex];

        if (!picture) return;

        viewerImage.src = picture.image_url;
        viewerCount.textContent = `${currentPictureIndex + 1} / ${currentPictures.length}`;
    }

    function openPictureViewer(index) {
        if (!currentPictures.length) return;

        currentPictureIndex = index;
        viewerBackdrop.style.display = 'flex';
        showCurrentPicture();
    }

    function closePictureViewer() {
        viewerBackdrop.style.display = 'none';
        viewerImage.src = '';
    }

    function showNextPicture() {
        if (!currentPictures.length) return;

        currentPictureIndex += 1;

        if (currentPictureIndex >= currentPictures.length) {
            currentPictureIndex = 0;
        }

        showCurrentPicture();
    }

    function showPreviousPicture() {
        if (!currentPictures.length) return;

        currentPictureIndex -= 1;

        if (currentPictureIndex < 0) {
            currentPictureIndex = currentPictures.length - 1;
        }

        showCurrentPicture();
    }

    async function loadPictures() {
        messageBox.textContent = 'Loading pictures...';
        picturesList.innerHTML = '';

        currentPictures = await fetchProjectPictures(projectId);

        if (!currentPictures.length) {
            messageBox.textContent = 'No pictures yet.';
            closePictureViewer();
            return;
        }

        messageBox.textContent = '';

        picturesList.innerHTML = currentPictures.map((picture, index) => `
            <div class="project-picture-card">
                <img
                    class="project-picture-img"
                    src="${escapeHtml(picture.image_url)}"
                    alt="Project picture"
                    data-index="${index}"
                >
                <button
                    type="button"
                    class="project-picture-delete-btn"
                    data-id="${picture.id}"
                >
                    DELETE
                </button>
            </div>
        `).join('');

        picturesList.querySelectorAll('.project-picture-img').forEach(img => {
            img.addEventListener('click', () => {
                openPictureViewer(Number(img.dataset.index));
            });
        });

        picturesList.querySelectorAll('.project-picture-delete-btn').forEach(button => {
            button.addEventListener('click', async () => {
                if (!confirm('Delete this picture?')) return;

                const { error } = await deleteProjectPicture(button.dataset.id);

                if (error) {
                    console.error('Delete project picture error:', error);
                    messageBox.textContent = 'Could not delete picture.';
                    return;
                }

                await loadPictures();
            });
        });
    }

    document.getElementById('btn-popup-take-project-picture').addEventListener('click', () => {
        fileInput.click();
    });

    document.getElementById('btn-project-picture-next').addEventListener('click', () => {
        showNextPicture();
    });

    document.getElementById('btn-project-picture-prev').addEventListener('click', () => {
        showPreviousPicture();
    });

    document.getElementById('btn-close-project-picture-viewer').addEventListener('click', () => {
        closePictureViewer();
    });

    document.getElementById('btn-project-picture-delete').addEventListener('click', async () => {
        const picture = currentPictures[currentPictureIndex];

        if (!picture) return;
        if (!confirm('Delete this picture?')) return;

        const { error } = await deleteProjectPicture(picture.id);

        if (error) {
            console.error('Delete project picture error:', error);
            messageBox.textContent = 'Could not delete picture.';
            return;
        }

        await loadPictures();

        if (!currentPictures.length) {
            closePictureViewer();
            return;
        }

        if (currentPictureIndex >= currentPictures.length) {
            currentPictureIndex = currentPictures.length - 1;
        }

        showCurrentPicture();
    });

    viewerBackdrop.addEventListener('touchstart', event => {
        touchStartX = event.changedTouches[0].screenX;
    });

    viewerBackdrop.addEventListener('touchend', event => {
        touchEndX = event.changedTouches[0].screenX;

        const swipeDistance = touchEndX - touchStartX;

        if (swipeDistance > 50) {
            showPreviousPicture();
        }

        if (swipeDistance < -50) {
            showNextPicture();
        }
    });

    viewerBackdrop.addEventListener('click', event => {
        if (event.target.id === 'project-picture-viewer-backdrop') {
            closePictureViewer();
        }
    });

    fileInput.addEventListener('change', async () => {
        const file = fileInput.files?.[0];

        if (!file) return;

        messageBox.textContent = 'Uploading picture...';

        const { error } = await uploadProjectPicture({
            file,
            projectId,
            facilitiesId
        });

        if (error) {
            console.error('Upload project picture error:', error);
            messageBox.textContent = 'Could not upload picture.';
            return;
        }

        fileInput.value = '';
        messageBox.textContent = 'Picture uploaded.';
        await loadPictures();
    });

    document.getElementById('btn-close-project-pictures-popup').addEventListener('click', () => {
        popup.remove();
    });

    popup.addEventListener('click', event => {
        if (event.target.id === 'project-pictures-popup-backdrop') {
            popup.remove();
        }
    });

    loadPictures();
}
