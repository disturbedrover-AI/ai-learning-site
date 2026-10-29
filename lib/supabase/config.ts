/**
 * Supabase settings, read from .env.local (see .env.example).
 * Until both keys are set, the site runs without accounts: no sign-in button,
 * and progress stays in the visitor's browser.
 */
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
