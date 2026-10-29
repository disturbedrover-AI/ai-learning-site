"use server";

/*
 * Everything the Lab changes goes through these server actions. Each one checks
 * the visitor's role on the server, and the database's row level security checks
 * again, so hiding a button is never the only protection.
 */
import { revalidatePath } from "next/cache";
import { LessonBody } from "@/components/learn/LessonBody";
import { slugify } from "@/lib/headings";
import { getLabAccess } from "@/lib/lab/server";
import { LAB_KINDS, LAB_STATUSES, RESERVED_SLUGS, type LabEntryInput } from "@/lib/lab/model";

type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };

/** The owner's Supabase session, or an error result for anyone else. */
async function ownerOnly() {
  const access = await getLabAccess();
  if (access.state !== "owner") return null;
  return access;
}

const NOT_OWNER = { ok: false as const, error: "Only the Lab owner can do that." };

function cleanInput(input: LabEntryInput): LabEntryInput | string {
  const title = input.title.trim().slice(0, 200) || "Untitled";
  if (!(input.kind in LAB_KINDS)) return "Unknown kind.";
  if (!(input.status in LAB_STATUSES)) return "Unknown status.";
  const tags = [...new Set(input.tags.map((t) => t.trim().toLowerCase()).filter(Boolean))].slice(0, 20);
  const links = input.links
    .map((l) => ({ url: l.url.trim(), label: l.label.trim().slice(0, 200) }))
    .filter((l) => l.url);
  const badLink = links.find((l) => !/^https?:\/\/\S+$/i.test(l.url));
  if (badLink) return `Links must start with http:// or https:// ("${badLink.url}").`;
  return {
    ...input,
    title,
    body: input.body.slice(0, 200_000),
    tags,
    collection: input.collection.trim().slice(0, 80),
    links,
  };
}

/** A slug from the title that no other entry (or Lab page) uses. */
async function uniqueSlug(supabase: NonNullable<Awaited<ReturnType<typeof ownerOnly>>>["supabase"], title: string) {
  const base = slugify(title).split("-").slice(0, 8).join("-") || "entry";
  const { data } = await supabase.from("lab_entries").select("slug").like("slug", `${base}%`);
  const taken = new Set([...(data ?? []).map((r) => r.slug), ...RESERVED_SLUGS]);
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

/** Create or update an entry (used by autosave and Ctrl/Cmd+S). */
export async function saveEntry(raw: LabEntryInput): Promise<Result<{ id: string; slug: string; updatedAt: string }>> {
  const access = await ownerOnly();
  if (!access) return NOT_OWNER;
  const input = cleanInput(raw);
  if (typeof input === "string") return { ok: false, error: input };
  const { supabase, user } = access;

  const fields = {
    kind: input.kind,
    title: input.title,
    body: input.body,
    status: input.status,
    tags: input.tags,
    collection: input.collection || null,
    pinned: input.pinned,
  };
  const saved = input.id
    ? await supabase.from("lab_entries").update(fields).eq("id", input.id).select("id, slug, updated_at").single()
    : await supabase
        .from("lab_entries")
        .insert({ ...fields, owner_id: user.id, slug: await uniqueSlug(supabase, input.title) })
        .select("id, slug, updated_at")
        .single();
  if (saved.error) return { ok: false, error: `Couldn't save: ${saved.error.message}` };

  // Links: replace the whole list.
  const id = saved.data.id as string;
  const removed = await supabase.from("lab_entry_links").delete().eq("entry_id", id);
  if (removed.error) return { ok: false, error: `Couldn't save links: ${removed.error.message}` };
  if (input.links.length) {
    const added = await supabase
      .from("lab_entry_links")
      .insert(input.links.map((l, position) => ({ entry_id: id, url: l.url, label: l.label || null, position })));
    if (added.error) return { ok: false, error: `Couldn't save links: ${added.error.message}` };
  }

  revalidatePath("/lab");
  return { ok: true, id, slug: saved.data.slug as string, updatedAt: saved.data.updated_at as string };
}

export async function deleteEntry(id: string): Promise<Result> {
  const access = await ownerOnly();
  if (!access) return NOT_OWNER;
  const { error } = await access.supabase.from("lab_entries").delete().eq("id", id);
  if (error) return { ok: false, error: `Couldn't delete: ${error.message}` };
  revalidatePath("/lab");
  return { ok: true };
}

/** The editor's live preview: the body rendered exactly as the entry page will show it. */
export async function previewBody(body: string) {
  if (!(await ownerOnly())) return null;
  return <LessonBody source={body} file="this entry" safe />;
}

// ---- Access and members ---------------------------------------------------

export async function requestAccess(message: string): Promise<Result> {
  const access = await getLabAccess();
  if (access.state !== "user") return { ok: false, error: "Sign in first." };
  const { error } = await access.supabase.rpc("lab_request_access", { p_message: message.trim() || null });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/lab");
  return { ok: true };
}

export async function inviteMember(email: string, role: "member" | "owner"): Promise<Result> {
  const access = await ownerOnly();
  if (!access) return NOT_OWNER;
  const { error } = await access.supabase.rpc("lab_invite", { p_email: email, p_role: role });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/lab/members");
  return { ok: true };
}

export async function removeMember(email: string): Promise<Result> {
  const access = await ownerOnly();
  if (!access) return NOT_OWNER;
  const { error } = await access.supabase.rpc("lab_remove", { p_email: email });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/lab/members");
  return { ok: true };
}

export async function decideRequest(userId: string, approve: boolean): Promise<Result> {
  const access = await ownerOnly();
  if (!access) return NOT_OWNER;
  const { error } = await access.supabase.rpc("lab_decide_request", { p_user_id: userId, p_approve: approve });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/lab/members");
  return { ok: true };
}
