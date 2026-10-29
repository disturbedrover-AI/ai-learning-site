import "server-only";
import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { getSupabaseServer } from "@/lib/supabase/server";
import { hasRole, isRole, type Role } from "./roles";

/** The signed-in user (checked with Supabase), or null. Makes the page dynamic: use inside <Suspense>. */
export async function getUser(): Promise<User | null> {
  const supabase = await getSupabaseServer();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user;
}

/** The signed-in user's role, or null when signed out. */
export async function getRole(): Promise<Role | null> {
  const supabase = await getSupabaseServer();
  const user = supabase && (await supabase.auth.getUser()).data.user;
  if (!supabase || !user) return null;
  const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
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
