import { timingSafeEqual } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "@/lib/supabase/config";

/**
 * GET /api/keep-alive: called once a day by Vercel Cron (see vercel.json) so the
 * Supabase project never counts as inactive and gets paused.
 *
 * Protected the way Vercel recommends: Vercel sends "Authorization: Bearer <CRON_SECRET>"
 * with each cron call, and anything without that exact header is refused.
 * It runs one tiny read (how many profiles exist, no rows returned) using the
 * server-side SUPABASE_SECRET_KEY if set, otherwise the public key.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return Response.json({ ok: false, error: "CRON_SECRET isn't set." }, { status: 500 });
  }
  if (!matches(request.headers.get("authorization") ?? "", `Bearer ${secret}`)) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  if (!isSupabaseConfigured) {
    return Response.json({ ok: false, error: "Supabase isn't set up." }, { status: 500 });
  }

  // Server-side only: never sent to the browser. No session, nothing stored.
  const supabase = createClient(supabaseUrl, process.env.SUPABASE_SECRET_KEY || supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { count, error } = await supabase.from("profiles").select("id", { count: "exact", head: true });
  if (error) {
    console.error("[keep-alive] Supabase read failed:", error.message);
    return Response.json({ ok: false, error: error.message }, { status: 502 });
  }
  return Response.json({ ok: true, profiles: count, at: new Date().toISOString() });
}

/** Compares two strings in constant time, so the secret can't be guessed from response timing. */
function matches(given: string, expected: string) {
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
