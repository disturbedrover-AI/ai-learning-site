/**
 * Supabase settings, read from .env.local (see .env.example).
 * Until both keys are set, the site runs without accounts: no sign-in button,
 * and progress stays in the visitor's browser.
 */
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/** No Supabase request may take longer than this, so pages never hang on it. */
export const SUPABASE_TIMEOUT_MS = 3000;

/**
 * fetch with the time limit above. Every Supabase client uses it (passed as
 * `global: { fetch: supabaseFetch }`). A request that runs out of time fails like
 * a network error, which the site treats as "accounts temporarily unavailable".
 */
export const supabaseFetch: typeof fetch = (input, init) => {
  const timeout = AbortSignal.timeout(SUPABASE_TIMEOUT_MS);
  const signal = init?.signal && "any" in AbortSignal ? AbortSignal.any([init.signal, timeout]) : (init?.signal ?? timeout);
  return fetch(input, { ...init, signal });
};

/**
 * Is Supabase answering right now? Asks its auth service's health check (quick, no
 * data). Used to show "accounts are temporarily unavailable" instead of errors when
 * the project is paused, the network is down or it's too slow.
 */
export async function pingSupabase(): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  try {
    const response = await supabaseFetch(`${supabaseUrl}/auth/v1/health`, { headers: { apikey: supabaseAnonKey } });
    return response.ok;
  } catch {
    return false;
  }
}
