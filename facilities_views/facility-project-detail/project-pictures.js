/*================================================================
FACILITY-PROJECT-DETAIL PROJECT PICTURES POPUP
LOCATION: /facilities_views/facility-project-detail/project-pictures.js
VERSION: v2026_06_22_project_pictures_popup_new
UPDATED: 2026-06-22 @ 9:45 AM EDT
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
                grid-template-columns: 1fr 1fr;
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
                <button id="btn-popup-see-project-pictures" class="project-pictures-btn">SEE PICTURES</button>
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
                project-pictures.js | v2026_06_22_project_pictures_popup_new | 2026-06-22 @ 9:45 AM EDT
            </div>
        </div>
    `;

    document.body.appendChild(popup);

    const fileInput = document.getElementById('project-picture-file-input');
    const messageBox = document.getElementById('project-pictures-message');
    const picturesList = document.getElementById('project-pictures-list');

    async function loadPictures() {
        messageBox.textContent = 'Loading pictures...';
        picturesList.innerHTML = '';

        const pictures = await fetchProjectPictures(projectId);

        if (!pictures.length) {
            messageBox.textContent = 'No pictures yet.';
            return;
        }

        messageBox.textContent = '';

        picturesList.innerHTML = pictures.map(picture => `
            <div class="project-picture-card">
                <img
                    class="project-picture-img"
                    src="${escapeHtml(picture.image_url)}"
                    alt="Project picture"
                    data-url="${escapeHtml(picture.image_url)}"
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

        document.querySelectorAll('.project-picture-img').forEach(img => {
            img.addEventListener('click', () => {
                window.open(img.dataset.url, '_blank');
            });
        });

        document.querySelectorAll('.project-picture-delete-btn').forEach(button => {
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

    document.getElementById('btn-popup-see-project-pictures').addEventListener('click', async () => {
        await loadPictures();
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
}

