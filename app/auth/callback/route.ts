import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { getSupabaseServer } from "@/lib/supabase/server";

/** Only send people back to pages on this site. */
function safeNext(next: string | null) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/learn";
}

/**
 * Where sign-in links and Google/LinkedIn send people back to. Finishes the
 * sign-in (sets the session cookies), then continues to `next`.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const next = safeNext(url.searchParams.get("next"));

  const supabase = await getSupabaseServer();
  if (supabase) {
    // OAuth and magic links (PKCE) arrive with a code; custom email templates may send a token hash.
    const { error } = code
      ? await supabase.auth.exchangeCodeForSession(code)
      : tokenHash && type
        ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
        : { error: new Error("No sign-in code in the link.") };
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
    console.error("Sign-in failed:", error.message);
  }
  return NextResponse.redirect(new URL(`/login?error=link&next=${encodeURIComponent(next)}`, url.origin));
}
