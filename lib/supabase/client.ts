import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "./config";

/**
 * Supabase for client components (one shared instance), or null when accounts
 * aren't set up. Also null during server rendering: call it in effects and
 * event handlers, not while rendering.
 */
export function getSupabaseBrowser(): SupabaseClient | null {
  if (!isSupabaseConfigured || typeof window === "undefined") return null;
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
