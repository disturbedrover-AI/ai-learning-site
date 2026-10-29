"use client";

import { useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, FilePlus2, Search, WifiOff } from "lucide-react";
import type { Radar, RadarItem } from "@/lib/radar";
import { hueStyle } from "@/lib/levels";
import { duration, ease } from "@/lib/motion";
import { RADAR_CATEGORIES, type RadarCategory } from "@/lib/taxonomy";
import { Chip } from "@/components/ui/Chip";
import { MakePostDialog } from "./MakePostDialog";

// "Now", refreshed every minute. Null while rendering on the server, so times
// like "5 min ago" are only worked out in the visitor's browser (and timezone).
let now: number | null = null;
function subscribeToClock(onChange: () => void) {
  const timer = setInterval(() => {
    now = Date.now();
    onChange();
  }, 60_000);
  return () => clearInterval(timer);
}
const useNow = () => useSyncExternalStore(subscribeToClock, () => (now ??= Date.now()), () => null);

export function timeAgo(iso: string, current: number) {
  const minutes = Math.max(0, Math.round((current - new Date(iso).getTime()) / 60_000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? "yesterday" : `${days} days ago`;
}

function dayLabel(iso: string, current: number) {
  const day = new Date(iso);
  const today = new Date(current);
  const yesterday = new Date(current - 86_400_000);
  const same = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  if (same(day, today)) return "Today";
  if (same(day, yesterday)) return "Yesterday";
  return new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" }).format(day);
}

/** Radar: automatic headlines grouped by day, with source, category and text filters. */
export function RadarList({ radar, canDraft }: { radar: Radar; canDraft: boolean }) {
  const current = useNow();
  const [query, setQuery] = useState("");
  const [source, setSource] = useState<string | null>(null);
  const [category, setCategory] = useState<RadarCategory | null>(null);
  const [drafting, setDrafting] = useState<RadarItem | null>(null);

  if (radar.items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border px-6 py-12 text-center">
        <WifiOff className="mx-auto size-8 text-muted" aria-hidden />
        <p className="mt-4 font-display text-xl font-bold text-foreground">We couldn&apos;t reach the news sources</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
          The Radar collects headlines from AI blogs and feeds, and none of them answered just now. It tries again
          automatically; meanwhile the curated Posts are all still here.
        </p>
      </div>
    );
  }

  const sources = radar.sources.filter((s) => s.ok && s.count > 0);
  const categories = (Object.keys(RADAR_CATEGORIES) as RadarCategory[]).filter((c) => sources.some((s) => s.category === c));
  const q = query.trim().toLowerCase();
  const shown = radar.items.filter(
    (i) =>
      (!source || i.source === source) &&
      (!category || i.category === category) &&
      (!q || [i.title, i.snippet, i.source].some((t) => t.toLowerCase().includes(q))),
  );

  // Group by day in the visitor's timezone (items are already newest first).
  const days: { label: string; items: RadarItem[] }[] = [];
  if (current) {
    for (const item of shown) {
      const label = dayLabel(item.publishedAt, current);
      if (days.at(-1)?.label !== label) days.push({ label, items: [] });
      days.at(-1)!.items.push(item);
    }
  }
  const failed = radar.sources.filter((s) => !s.ok);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
        <p aria-live="polite">
          {current ? `Last updated ${timeAgo(radar.fetchedAt, current)}` : " "} · {radar.items.length} headlines from{" "}
          {sources.length} sources
        </p>
        {failed.length > 0 && <p className="text-xs">Couldn&apos;t reach: {failed.map((s) => s.name).join(", ")}</p>}
      </div>

      <div className="mt-4 space-y-3">
        <div className="relative max-w-md">
          <label htmlFor="radar-search" className="sr-only">
            Search the Radar
          </label>
          <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted" aria-hidden />
          <input
            id="radar-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search headlines"
            className="w-full rounded-full border border-border bg-surface py-3 pr-4 pl-11 text-foreground outline-none transition-colors placeholder:text-muted focus:border-accent"
          />
        </div>
        <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-1.5">
          <Chip active={category === null} onClick={() => setCategory(null)}>
            All kinds
          </Chip>
          {categories.map((c) => (
            <Chip key={c} active={category === c} onClick={() => setCategory(category === c ? null : c)}>
              {RADAR_CATEGORIES[c].label}
            </Chip>
          ))}
        </div>
        <div role="group" aria-label="Filter by source" className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs font-semibold text-muted">Sources</span>
          {sources.map((s) => (
            <Chip key={s.name} small active={source === s.name} onClick={() => setSource(source === s.name ? null : s.name)}>
              {s.name}
            </Chip>
          ))}
        </div>
      </div>

      <div className="mt-8 space-y-8">
        {days.map((day) => (
          <section key={day.label} aria-label={day.label}>
            <h3 className="sticky top-16 z-20 -mx-4 bg-background/90 px-4 py-2 font-display text-base font-bold text-foreground backdrop-blur-md sm:-mx-6 sm:px-6">
              {day.label}
            </h3>
            <ul className="mt-1 divide-y divide-border rounded-2xl border border-border bg-surface">
              <AnimatePresence initial={false}>
                {day.items.map((item) => (
                  <motion.li
                    key={item.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: duration.base, ease }}
                    className="flex gap-4 px-4 py-3.5 sm:px-5"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
                        <span
                          style={hueStyle(RADAR_CATEGORIES[item.category].hue)}
                          className="rounded-full bg-level/10 px-2 py-0.5 font-semibold text-level"
                        >
                          {item.source}
                        </span>
                        {current && <time dateTime={item.publishedAt}>{timeAgo(item.publishedAt, current)}</time>}
                      </div>
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group mt-1 flex items-start gap-1 font-medium leading-snug text-foreground hover:text-accent"
                      >
                        {item.title}
                        <ArrowUpRight className="mt-0.5 size-3.5 shrink-0 text-muted group-hover:text-accent" aria-hidden />
                        <span className="sr-only">(opens {item.source} in a new tab)</span>
                      </a>
                      {item.snippet && <p className="mt-1 line-clamp-2 text-sm text-muted">{item.snippet}</p>}
                    </div>
                    {canDraft && (
                      <button
                        type="button"
                        onClick={() => setDrafting(item)}
                        className="h-fit shrink-0 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted transition-colors hover:border-accent hover:text-foreground"
                      >
                        <FilePlus2 className="mr-1 inline size-3.5 align-[-2px]" aria-hidden />
                        Make this a post
                      </button>
                    )}
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </section>
        ))}
      </div>

      {current && shown.length === 0 && (
        <p className="mt-6 rounded-3xl border border-dashed border-border px-5 py-10 text-center text-muted">
          No headlines match. Try another word or source.
        </p>
      )}

      {canDraft && <MakePostDialog item={drafting} onClose={() => setDrafting(null)} />}
    </div>
  );
}
