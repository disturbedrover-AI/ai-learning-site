import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "./config";

/**
 * Supabase for server components, route handlers and server actions, acting as
 * the signed-in visitor (via their cookies). Null when accounts aren't set up.
 * Reading cookies makes a page dynamic: call this inside <Suspense>.
 */
export async function getSupabaseServer(): Promise<SupabaseClient | null> {
  if (!isSupabaseConfigured) return null;
  const store = await cookies();
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (toSet) => {
        try {
          toSet.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Server components can't set cookies; proxy.ts refreshes the session instead.
        }
      },
    },
  });
}
