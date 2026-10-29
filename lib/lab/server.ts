import "server-only";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getSupabaseServer } from "@/lib/supabase/server";
import { isRole, type Role } from "@/lib/auth/roles";
import { LAB_KINDS, LAB_STATUSES, type LabEntry, type LabKind, type LabStatus } from "./model";

/*
 * Reading Lab data. Everything goes through the signed-in visitor's Supabase
 * session, so the database's row level security decides what they can see:
 * these functions can't show anyone more than they're allowed.
 * They read cookies, so they always run per request (never prerendered).
 */

export type LabAccess =
  | { state: "unconfigured" }
  | { state: "signed-out" }
  | {
      state: "user" | "member" | "owner";
      user: User;
      role: Role;
      supabase: SupabaseClient;
      /** For plain users: their access request, if any. */
      request: { status: "pending" | "approved" | "declined"; created_at: string } | null;
    };

/** Who's visiting the Lab and what they may do. */
export async function getLabAccess(): Promise<LabAccess> {
  await connection(); // Never prerender: depends on who's signed in.
  const supabase = await getSupabaseServer();
  if (!supabase) return { state: "unconfigured" };
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { state: "signed-out" };

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
  const role: Role = isRole(profile?.role) ? profile.role : "user";
  let request = null;
  if (role === "user") {
    const { data: row } = await supabase
      .from("lab_access_requests")
      .select("status, created_at")
      .eq("user_id", data.user.id)
      .maybeSingle();
    request = row;
  }
  return { state: role, user: data.user, role, supabase, request };
}

/**
 * For owner-only Lab pages (editor, members). Signed out → /login (then back to
 * `returnTo`); signed in but not the owner → /lab. Always rendered per request.
 */
export async function requireLabOwner(returnTo: string) {
  const access = await getLabAccess();
  if (access.state === "signed-out" || access.state === "unconfigured") {
    redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  }
  if (access.state !== "owner") redirect("/lab");
  return access;
}

export type LabFilters = { q?: string; kind?: string; collection?: string };

const ENTRY_COLUMNS = "id, kind, title, slug, body, status, tags, collection, pinned, created_at, updated_at";
const LIST_COLUMNS = "id, kind, title, slug, status, tags, collection, pinned, created_at, updated_at";

export type LabListItem = Omit<LabEntry, "body" | "links">;

/** Entries matching the filters: pinned first, then most recently updated. */
export async function listEntries(supabase: SupabaseClient, filters: LabFilters): Promise<LabListItem[]> {
  let query = supabase.from("lab_entries").select(LIST_COLUMNS);
  if (filters.kind && filters.kind in LAB_KINDS) query = query.eq("kind", filters.kind);
  if (filters.collection) query = query.eq("collection", filters.collection);
  if (filters.q?.trim()) query = query.textSearch("search", filters.q.trim(), { type: "websearch", config: "english" });
  const { data, error } = await query.order("pinned", { ascending: false }).order("updated_at", { ascending: false });
  if (error) throw new Error(`Couldn't load Lab entries: ${error.message}`);
  return (data ?? []) as LabListItem[];
}

/** Collections and kinds with how many entries each has (of those this visitor can see). */
export async function getLabFacets(supabase: SupabaseClient) {
  const { data, error } = await supabase.from("lab_entries").select("kind, collection");
  if (error) throw new Error(`Couldn't load Lab collections: ${error.message}`);
  const collections = new Map<string, number>();
  const kinds = new Map<LabKind, number>();
  for (const row of data ?? []) {
    if (row.collection) collections.set(row.collection, (collections.get(row.collection) ?? 0) + 1);
    kinds.set(row.kind as LabKind, (kinds.get(row.kind as LabKind) ?? 0) + 1);
  }
  return {
    total: data?.length ?? 0,
    collections: [...collections].sort(([a], [b]) => a.localeCompare(b)).map(([name, count]) => ({ name, count })),
    kinds: (Object.keys(LAB_KINDS) as LabKind[]).map((kind) => ({ kind, count: kinds.get(kind) ?? 0 })),
  };
}

/** One entry with its links, or null if it doesn't exist or this visitor can't see it. */
export async function getEntry(supabase: SupabaseClient, slug: string): Promise<LabEntry | null> {
  const { data, error } = await supabase.from("lab_entries").select(ENTRY_COLUMNS).eq("slug", slug).maybeSingle();
  if (error) throw new Error(`Couldn't load this entry: ${error.message}`);
  if (!data) return null;
  const { data: links } = await supabase
    .from("lab_entry_links")
    .select("url, label")
    .eq("entry_id", data.id)
    .order("position");
  return { ...(data as Omit<LabEntry, "links">), links: (links ?? []).map((l) => ({ url: l.url, label: l.label ?? "" })) };
}

/** Owner's member management: the allowlist and pending requests. */
export async function getMembers(supabase: SupabaseClient) {
  const [allowlist, requests] = await Promise.all([
    supabase.from("lab_allowlist").select("email, role, invited_at, accepted, accepted_at").order("invited_at", { ascending: false }),
    supabase
      .from("lab_access_requests")
      .select("user_id, email, message, status, created_at")
      .eq("status", "pending")
      .order("created_at"),
  ]);
  if (allowlist.error) throw new Error(`Couldn't load members: ${allowlist.error.message}`);
  if (requests.error) throw new Error(`Couldn't load access requests: ${requests.error.message}`);
  return {
    allowlist: allowlist.data as { email: string; role: "member" | "owner"; invited_at: string; accepted: boolean; accepted_at: string | null }[],
    requests: requests.data as { user_id: string; email: string; message: string | null; status: string; created_at: string }[],
  };
}

/** Statuses in display order, without drafts for members. */
export function visibleStatuses(role: Role): LabStatus[] {
  return (Object.keys(LAB_STATUSES) as LabStatus[]).filter((s) => role === "owner" || s !== "draft");
}
