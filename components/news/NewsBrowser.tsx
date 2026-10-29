"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";
import { duration, ease } from "@/lib/motion";
import { NEWS_TYPES, type NewsType } from "@/lib/taxonomy";
import { Chip } from "@/components/ui/Chip";
import { formatMonth, NewsCard, type NewsSummary } from "./NewsCard";

/** All news, grouped by month (newest first), with type, tag and text filters. */
export function NewsBrowser({ items }: { items: NewsSummary[] }) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<NewsType | null>(null);
  const [tag, setTag] = useState<string | null>(null);

  const types = (Object.keys(NEWS_TYPES) as NewsType[]).filter((t) => items.some((i) => i.type === t));
  const tags = [...new Set(items.flatMap((i) => i.tags))].sort();
  const q = query.trim().toLowerCase();
  const shown = items.filter(
    (i) =>
      (!type || i.type === type) &&
      (!tag || i.tags.includes(tag)) &&
      (!q || [i.title, i.summary, i.whyItMatters, i.source, ...i.tags].some((t) => t.toLowerCase().includes(q))),
  );

  // Items are already newest first, so months come out in order.
  const months: { label: string; items: NewsSummary[] }[] = [];
  for (const item of shown) {
    const label = formatMonth(item.date);
    if (months.at(-1)?.label !== label) months.push({ label, items: [] });
    months.at(-1)!.items.push(item);
  }

  return (
    <div>
      <div className="space-y-3">
        <div className="relative max-w-md">
          <label htmlFor="news-search" className="sr-only">
            Search news
          </label>
          <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted" aria-hidden />
          <input
            id="news-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search news"
            className="w-full rounded-full border border-border bg-surface py-3 pr-4 pl-11 text-foreground outline-none transition-colors placeholder:text-muted focus:border-accent"
          />
        </div>
        <div role="group" aria-label="Filter by type" className="flex flex-wrap gap-1.5">
          <Chip active={type === null} onClick={() => setType(null)}>
            All types
          </Chip>
          {types.map((t) => (
            <Chip key={t} active={type === t} onClick={() => setType(type === t ? null : t)}>
              {NEWS_TYPES[t].label}
            </Chip>
          ))}
        </div>
        <div role="group" aria-label="Filter by tag" className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs font-semibold text-muted">Tags</span>
          {tags.map((t) => (
            <Chip key={t} small active={tag === t} onClick={() => setTag(tag === t ? null : t)}>
              {t}
            </Chip>
          ))}
        </div>
      </div>

      <p className="mt-8 text-sm text-muted" aria-live="polite">
        {shown.length === items.length ? `${items.length} items` : `${shown.length} of ${items.length} items`}
      </p>

      <div className="mt-2 space-y-12">
        <AnimatePresence initial={false} mode="popLayout">
          {months.map((month) => (
            <motion.section
              key={month.label}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: duration.base, ease }}
              aria-label={month.label}
            >
              {/* Stays at the top while you scroll through the month. */}
              <h2 className="sticky top-16 z-20 -mx-4 bg-background/90 px-4 py-3 font-display text-lg font-bold text-foreground backdrop-blur-md sm:-mx-6 sm:px-6">
                {month.label}
              </h2>
              <div className="mt-3 grid gap-4">
                {month.items.map((item) => (
                  <motion.div key={item.slug} layout transition={{ duration: duration.base, ease }}>
                    <NewsCard item={item} />
                  </motion.div>
                ))}
              </div>
            </motion.section>
          ))}
        </AnimatePresence>
      </div>

      {shown.length === 0 && (
        <p className="mt-6 rounded-3xl border border-dashed border-border px-5 py-10 text-center text-muted">
          Nothing matches. Try another word, type or tag.
        </p>
      )}
    </div>
  );
}

