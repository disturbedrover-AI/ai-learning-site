import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isSupabaseConfigured, supabaseAnonKey, supabaseFetch, supabaseUrl } from "@/lib/supabase/config";
import { isSupabaseReachable, markSupabaseUnreachable } from "@/lib/supabase/health";

/**
 * Runs before each page request: keeps the visitor's Supabase sign-in fresh by
 * refreshing its cookies, and marks private pages as not for search engines.
 * It doesn't block or redirect anything (pages check access themselves).
 */
export async function proxy(request: NextRequest) {
  // Only signed-in visitors (who have Supabase cookies) need their session refreshed,
  // and never while Supabase is unreachable: the page should load, not wait for it.
  const signedIn = request.cookies.getAll().some((c) => c.name.startsWith("sb-"));
  const refresh = isSupabaseConfigured && signedIn && (await isSupabaseReachable());
  const response = refresh ? await refreshSession(request) : NextResponse.next();
  // The Lab and account pages are private: tell search engines not to index them.
  if (/^\/(lab|account|login)(\/|$)/.test(request.nextUrl.pathname)) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return response;
}

async function refreshSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    global: { fetch: supabaseFetch },
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (toSet, headers) => {
        toSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers ?? {}).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });
  // Validates the session and refreshes it if it has expired. If Supabase fails
  // mid-way, carry on without refreshing: pages handle the outage themselves.
  try {
    const { error } = await supabase.auth.getClaims();
    if (error?.name === "AuthRetryableFetchError") markSupabaseUnreachable();
  } catch {
    markSupabaseUnreachable();
    return NextResponse.next({ request });
  }
  return response;
}

export const config = {
  // Skip Next's own files and images.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
