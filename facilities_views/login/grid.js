/* ================================================================
   FACILITY TRACKER MODULAR VIEW SYSTEM
   PURPOSE: Login View
   LOCATION: /facilities_views/login/grid.js
   VERSION: v2026_06_24_login_view
   UPDATED: 2026-06-24
================================================================ */

import { supabase } from '../../global_engine/supabaseClient.js';

function escapeHtml(value) {
    return String(value || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

async function fetchLoggedInAppUser(authUserId) {
    return await supabase
        .from('app_users')
        .select('*')
        .eq('auth_user_id', authUserId)
        .eq('active_status', 'active')
        .single();
}

function saveAppUserSession(profile) {
    localStorage.setItem('facility_tracker_app_user', JSON.stringify({
        auth_user_id: profile.auth_user_id,
        display_name: profile.display_name,
        role: profile.role,
        active_status: profile.active_status
    }));
}

export async function render(containerId, context = {}) {
    await renderLoginGrid(containerId, context);
}

export async function renderLoginGrid(containerId, context = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
        <style>
            .login-card {
                background:#ffffff;
                max-width:350px;
                margin:24px auto;
                padding:18px;
                border-radius:14px;
                box-shadow:0 4px 18px rgba(0,0,0,0.08);
                text-align:center;
            }

            .login-title {
                color:#003b73;
                font-size:24px;
                font-weight:bold;
                margin-bottom:2px;
            }

            .login-subtitle {
                color:#003b73;
                font-size:13px;
                font-weight:bold;
                margin-bottom:16px;
                letter-spacing:1px;
            }

            .login-box {
                border:1px solid #d6dee8;
                border-radius:10px;
                padding:12px;
                text-align:left;
                background:#f8fbff;
            }

            .login-label {
                color:#003b73;
                font-size:12px;
                font-weight:bold;
                margin-top:10px;
                margin-bottom:4px;
            }

            .login-input {
                width:100%;
                padding:10px;
                border:1px solid #bbb;
                border-radius:6px;
                font-size:15px;
                box-sizing:border-box;
            }

            .login-main-btn {
                background:#003b73;
                color:white;
                border:none;
                border-radius:4px;
                width:100%;
                min-height:54px;
                font-size:15px;
                font-weight:bold;
                cursor:pointer;
                margin-top:14px;
            }

            .login-main-btn:disabled {
                background:#7d8ba0;
                cursor:not-allowed;
            }

            .login-error {
                color:red;
                font-size:13px;
                text-align:center;
                min-height:18px;
                margin-top:10px;
                font-weight:bold;
            }

            .login-success {
                color:#16a34a;
                font-size:13px;
                text-align:center;
                min-height:18px;
                margin-top:10px;
                font-weight:bold;
            }

            .login-version-tag {
                border-top:1px solid #d6dee8;
                margin-top:18px;
                padding-top:10px;
                font-size:10px;
                color:#7d8ba0;
                text-align:center;
            }
        </style>

        <div class="login-card">
            <div class="login-title">Facility Tracker</div>
            <div class="login-subtitle">LOGIN</div>

            <div class="login-box">
                <div class="login-label">EMAIL</div>
                <input id="login-email" class="login-input" type="email" placeholder="Email">

                <div class="login-label">PASSWORD</div>
                <input id="login-password" class="login-input" type="password" placeholder="Password">

                <button id="btn-login" class="login-main-btn">LOGIN</button>

                <div id="login-success" class="login-success"></div>
                <div id="login-error" class="login-error"></div>
            </div>

            <div class="login-version-tag">login/grid.js | v2026_06_24_login_view</div>
        </div>
    `;

    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const loginButton = document.getElementById('btn-login');
    const successBox = document.getElementById('login-success');
    const errorBox = document.getElementById('login-error');

    async function login() {
        successBox.textContent = '';
        errorBox.textContent = '';

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!email) {
            errorBox.textContent = 'Enter email.';
            return;
        }

        if (!password) {
            errorBox.textContent = 'Enter password.';
            return;
        }

        loginButton.disabled = true;
        loginButton.textContent = 'LOGGING IN...';

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error || !data?.user?.id) {
            console.error('Login error:', error);
            errorBox.textContent = 'Login failed.';
            loginButton.disabled = false;
            loginButton.textContent = 'LOGIN';
            return;
        }

        const profileResponse = await fetchLoggedInAppUser(data.user.id);

        if (profileResponse.error || !profileResponse.data) {
            console.error('App user profile error:', profileResponse.error);
            await supabase.auth.signOut();
            localStorage.removeItem('facility_tracker_app_user');
            errorBox.textContent = 'User is not active in app_users.';
            loginButton.disabled = false;
            loginButton.textContent = 'LOGIN';
            return;
        }

        saveAppUserSession(profileResponse.data);

        successBox.textContent = `Logged in as ${escapeHtml(profileResponse.data.display_name)}.`;

        if (window.navigateTo) {
            window.navigateTo('facilities-home');
        }
    }

    loginButton.addEventListener('click', async () => {
        await login();
    });

    passwordInput.addEventListener('keydown', async (event) => {
        if (event.key === 'Enter') {
            await login();
        }
    });

    emailInput.addEventListener('keydown', async (event) => {
        if (event.key === 'Enter') {
            passwordInput.focus();
        }
    });
}
