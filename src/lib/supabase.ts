import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Supabase URL + anon key are PUBLIC by design (RLS enforces access), so they
// belong in the client bundle via VITE_ env vars — same as the Firebase web
// config was. The SERVICE_ROLE key is NEVER referenced here.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
// Supabase's public client key. Supports both the newer "publishable" key name
// and the legacy "anon" name — either works; both are public (RLS enforces access).
const supabaseKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
  || import.meta.env.VITE_SUPABASE_ANON_KEY) as string;

if (!supabaseUrl || !supabaseKey) {
  // Surfaces a clear message instead of an opaque network error if env vars
  // aren't set on the host (a common cPanel deploy gotcha).
  console.error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY environment variables.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export default supabase;
