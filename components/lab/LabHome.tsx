import Link from "next/link";
import { Folder, Pin, Plus, Search, Users, X } from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Role } from "@/lib/auth/roles";
import { hueStyle } from "@/lib/levels";
import { LAB_KINDS, LAB_STATUSES } from "@/lib/lab/model";
import { getLabFacets, listEntries, visibleStatuses, type LabFilters, type LabListItem } from "@/lib/lab/server";
import { Reveal } from "@/components/motion/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { formatLabDate, KindBadge, StatusBadge } from "./LabBadges";

/** /lab with filters applied: a link that changes one filter and keeps the others. */
function filterHref(current: LabFilters, change: Partial<LabFilters>) {
  const next = { ...current, ...change };
  const params = new URLSearchParams(
    Object.entries(next).filter((entry): entry is [string, string] => !!entry[1]),
  ).toString();
  return params ? `/lab?${params}` : "/lab";
}

/** The Lab for members (read-only) and the owner (with editing). */
export async function LabHome({
  supabase,
  role,
  filters,
}: {
  supabase: SupabaseClient;
  role: Role;
  filters: LabFilters;
}) {
  const [entries, facets] = await Promise.all([listEntries(supabase, filters), getLabFacets(supabase)]);
  const owner = role === "owner";
  const pinned = entries.filter((e) => e.pinned);
  const rest = entries.filter((e) => !e.pinned);
  const filtered = !!(filters.q || filters.kind || filters.collection);

  return (
    <div className="grid gap-10 lg:grid-cols-[14rem_minmax(0,1fr)]">
      <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
        {owner && (
          <div className="flex gap-2 lg:flex-col">
            <ButtonLink href="/lab/new" className="flex-1 px-4 py-2.5">
              <Plus className="size-4" aria-hidden /> New entry
            </ButtonLink>
            <ButtonLink href="/lab/members" variant="secondary" className="flex-1 px-4 py-2.5">
              <Users className="size-4" aria-hidden /> Members
            </ButtonLink>
          </div>
        )}

        <nav aria-label="Kinds">
          <p className="text-xs font-semibold tracking-wide text-muted uppercase">Kinds</p>
          <ul className="mt-2 space-y-0.5 text-sm">
            <SideLink href={filterHref(filters, { kind: undefined })} active={!filters.kind} count={facets.total}>
              All entries
            </SideLink>
            {facets.kinds.map(({ kind, count }) => (
              <SideLink key={kind} href={filterHref(filters, { kind })} active={filters.kind === kind} count={count}>
                <span style={hueStyle(LAB_KINDS[kind].hue)} className="mr-2 inline-block size-2 rounded-full bg-level" />
                {LAB_KINDS[kind].label}
              </SideLink>
            ))}
          </ul>
        </nav>

        <nav aria-label="Collections">
          <p className="text-xs font-semibold tracking-wide text-muted uppercase">Collections</p>
          {facets.collections.length === 0 ? (
            <p className="mt-2 text-sm text-muted">None yet.</p>
          ) : (
            <ul className="mt-2 space-y-0.5 text-sm">
              {facets.collections.map(({ name, count }) => (
                <SideLink
                  key={name}
                  href={filterHref(filters, { collection: filters.collection === name ? undefined : name })}
                  active={filters.collection === name}
                  count={count}
                >
                  <Folder className="mr-2 inline size-3.5 text-muted" aria-hidden />
                  {name}
                </SideLink>
              ))}
            </ul>
          )}
        </nav>
      </aside>

      <div className="min-w-0">
        <form action="/lab" className="relative">
          <label htmlFor="lab-search" className="sr-only">
            Search the Lab
          </label>
          <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted" aria-hidden />
          <input
            id="lab-search"
            name="q"
            type="search"
            defaultValue={filters.q}
            placeholder="Search titles, text and tags"
            className="w-full rounded-full border border-border bg-surface py-3 pr-4 pl-11 text-foreground outline-none transition-colors placeholder:text-muted focus:border-accent"
          />
          {filters.kind && <input type="hidden" name="kind" value={filters.kind} />}
          {filters.collection && <input type="hidden" name="collection" value={filters.collection} />}
        </form>

        {filtered && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted">
            <span>
              {entries.length} {entries.length === 1 ? "entry" : "entries"}
            </span>
            <Link
              href="/lab"
              className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-0.5 text-xs font-semibold hover:text-foreground"
            >
              <X className="size-3" aria-hidden /> Clear filters
            </Link>
          </div>
        )}

        {entries.length === 0 ? (
          <Reveal className="mt-8 rounded-3xl border border-dashed border-border px-6 py-12 text-center text-muted">
            {filtered ? "Nothing matches these filters." : owner ? "No entries yet. Start with “New entry”." : "Nothing here yet."}
          </Reveal>
        ) : (
          <div className="mt-8 space-y-10">
            {pinned.length > 0 && (
              <EntryGroup title="Pinned" icon={<Pin className="size-4" aria-hidden />} entries={pinned} />
            )}
            {visibleStatuses(role).map((status) => {
              const group = rest.filter((e) => e.status === status);
              return group.length ? <EntryGroup key={status} title={LAB_STATUSES[status].label} entries={group} /> : null;
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function SideLink({
  href,
  active,
  count,
  children,
}: {
  href: string;
  active: boolean;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 transition-colors ${
          active ? "bg-surface font-semibold text-foreground" : "text-muted hover:text-foreground"
        }`}
      >
        <span className="flex min-w-0 items-center truncate">{children}</span>
        <span className="text-xs tabular-nums">{count}</span>
      </Link>
    </li>
  );
}

function EntryGroup({ title, icon, entries }: { title: string; icon?: React.ReactNode; entries: LabListItem[] }) {
  return (
    <Reveal>
      <section aria-label={title}>
        <h2 className="flex items-center gap-2 text-sm font-bold tracking-wide text-muted uppercase">
          {icon}
          {title} <span className="font-normal">{entries.length}</span>
        </h2>
        <ul className="mt-3 divide-y divide-border rounded-2xl border border-border bg-surface">
          {entries.map((entry) => (
            <li key={entry.id}>
              <Link
                href={`/lab/${entry.slug}`}
                className="flex flex-col gap-1.5 px-4 py-3 transition-colors hover:bg-background sm:flex-row sm:items-center sm:gap-4 sm:px-5"
              >
                <span className="flex min-w-0 flex-1 items-center gap-2.5">
                  <KindBadge kind={entry.kind} />
                  <span className="truncate font-medium text-foreground">{entry.title}</span>
                  {entry.pinned && <Pin className="size-3.5 shrink-0 text-muted" aria-label="Pinned" />}
                </span>
                <span className="flex shrink-0 flex-wrap items-center gap-2 text-xs text-muted">
                  {entry.collection && (
                    <span className="inline-flex items-center gap-1">
                      <Folder className="size-3.5" aria-hidden /> {entry.collection}
                    </span>
                  )}
                  {entry.tags.slice(0, 3).map((t) => (
                    <span key={t} className="rounded-full bg-background px-2 py-0.5">
                      {t}
                    </span>
                  ))}
                  <StatusBadge status={entry.status} />
                  <time dateTime={entry.updated_at}>{formatLabDate(entry.updated_at)}</time>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </Reveal>
  );
}
