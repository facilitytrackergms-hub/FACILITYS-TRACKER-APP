/* ================================================================
   NAME      : supabaseClient.js
   PURPOSE   : Supabase Database Connection
   LOCATION  : /FACILITYS-TRACKER-APP/00_global_engine/
   ================================================================ */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'YOUR_SUPABASE_URL_HERE';
const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
