import "server-only";
import { pingSupabase } from "./config";

// The answer is refreshed in the background every 30 seconds. Only the very first
// check after the server starts is waited for (at most 3 seconds); after that,
// visitors always get the latest known answer straight away.
const REFRESH_MS = 30_000;
let last: { ok: boolean; at: number } | null = null;
let pending: Promise<boolean> | null = null;

function check() {
  pending ??= pingSupabase().then((ok) => {
    last = { ok, at: performance.now() };
    pending = null;
    return ok;
  });
  return pending;
}

/** Server side: is Supabase reachable? */
export async function isSupabaseReachable(): Promise<boolean> {
  if (!last) return check();
  if (performance.now() - last.at > REFRESH_MS) void check();
  return last.ok;
}

/** Call when a Supabase request fails for network reasons, so others skip it for a while. */
export function markSupabaseUnreachable() {
  last = { ok: false, at: performance.now() };
}

/** True for errors that mean "Supabase didn't answer" (not "you're not allowed" or "not found"). */
export function isUnreachableError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as { name?: string; status?: number; message?: string; code?: string };
  return (
    e.name === "AbortError" ||
    e.name === "TimeoutError" ||
    e.name === "AuthRetryableFetchError" ||
    e.status === 0 ||
    (typeof e.status === "number" && e.status >= 500) ||
    /fetch failed|network|timed? ?out|aborted|ECONN|ENOTFOUND/i.test(e.message ?? "")
  );
}
