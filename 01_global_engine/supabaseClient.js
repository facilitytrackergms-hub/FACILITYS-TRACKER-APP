
// supabaseClient.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://uqrgjmzptliursudexbx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_GxgV4Nol1OZy6ApbwgeARA_I0YrfyPX';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);    
