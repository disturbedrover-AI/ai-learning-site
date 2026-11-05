import "server-only";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { getSupabaseServer } from "@/lib/supabase/server";
import { isSupabaseReachable } from "@/lib/supabase/health";
import { hasRole, isRole, type Role } from "./roles";

/** The signed-in user (checked with Supabase), or null. Makes the page dynamic: use inside <Suspense>. */
export async function getUser(): Promise<User | null> {
  const supabase = await getSupabaseServer();
  if (!supabase) return null;
  // No sign-in cookie: signed out, no need to ask Supabase anything.
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) return null;
  // While Supabase is unreachable, everyone counts as signed out.
  if (!(await isSupabaseReachable())) return null;
  const { data } = await supabase.auth.getUser();
  return data.user;
}

/** The signed-in user's role, or null when signed out. */
export async function getRole(): Promise<Role | null> {
  const supabase = await getSupabaseServer();
  const user = await getUser();
  if (!supabase || !user) return null;
  const { data, error } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (error && !data) return null; // Unreachable or unreadable: treat as no role.
  return isRole(data?.role) ? data.role : "user";
}

/**
 * For server pages that need a role, e.g. `await requireRole("member", "/lab")`.
 * Signed out → sent to /login (and back to `returnTo` afterwards).
 * Signed in without the role → sent to /account, which explains what's needed.
 */
export async function requireRole(needed: Role, returnTo = "/"): Promise<{ user: User; role: Role }> {
  const user = await getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  const role = (await getRole()) ?? "user";
  if (!hasRole(role, needed)) redirect(`/account?needs=${needed}`);
  return { user, role };
}
