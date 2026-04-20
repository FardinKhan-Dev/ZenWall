import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Browser-side Supabase client.
 * Use this in Client Components and client-side hooks.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,       // Keep session across page refreshes
    autoRefreshToken: true,     // Auto-renew tokens before they expire
    detectSessionInUrl: true,   // Handle OAuth redirects automatically
  },
});
