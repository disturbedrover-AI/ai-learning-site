import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "@/lib/supabase/config";

/**
 * Runs before each page request: keeps the visitor's Supabase sign-in fresh by
 * refreshing its cookies, and marks private pages as not for search engines.
 * It doesn't block or redirect anything (pages check access themselves).
 */
export async function proxy(request: NextRequest) {
  const response = isSupabaseConfigured ? await refreshSession(request) : NextResponse.next();
  // The Lab and account pages are private: tell search engines not to index them.
  if (/^\/(lab|account|login)(\/|$)/.test(request.nextUrl.pathname)) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return response;
}

async function refreshSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
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
  // Validates the session and refreshes it if it has expired.
  await supabase.auth.getClaims();
  return response;
}

export const config = {
  // Skip Next's own files and images.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
