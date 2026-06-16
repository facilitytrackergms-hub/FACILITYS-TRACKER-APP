
/* ================================================================
NAME     : 02_supabase_client.js
PURPOSE  : Securely initializes the Supabase client.
================================================================ */
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Access these via your environment configuration instead of hard-coding
const SUPABASE_URL = 'https://uqrgjmzptliursudexbx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_GxgV4Nol1OZy6ApbwgeARA_I0YrfyPX';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
