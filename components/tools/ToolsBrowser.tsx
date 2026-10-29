"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpDown, Search, Sparkles, Star } from "lucide-react";
import { duration, ease, hoverLift, popover, slide } from "@/lib/motion";
import {
  DIFFICULTIES,
  PLATFORMS,
  PRICING,
  TOOL_CATEGORIES,
  type Difficulty,
  type Platform,
  type Pricing,
  type ToolCategory,
} from "@/lib/taxonomy";
import { Chip } from "@/components/ui/Chip";
import { categoryStyle, PlatformIcons, ToolBadges, ToolLogo, type ToolSummary } from "./ToolParts";

type Sort = "newest" | "name";

/** The tool directory: category tabs, filters, search and sorting. */
export function ToolsBrowser({ tools }: { tools: ToolSummary[] }) {
  const [category, setCategory] = useState<ToolCategory | null>(null);
  const [query, setQuery] = useState("");
  const [freeOpenOnly, setFreeOpenOnly] = useState(false);
  const [pricing, setPricing] = useState<Pricing | null>(null);
  const [openSource, setOpenSource] = useState(false);
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [sort, setSort] = useState<Sort>("newest");

  const q = query.trim().toLowerCase();
  const matches = (t: ToolSummary) =>
    (!freeOpenOnly || (t.pricing === "free" && t.openSource)) &&
    (!pricing || t.pricing === pricing) &&
    (!openSource || t.openSource) &&
    (!platform || t.platforms.includes(platform)) &&
    (!difficulty || t.difficulty === difficulty) &&
    (!q || [t.name, t.tagline, ...t.tags, ...t.goodFor].some((text) => text.toLowerCase().includes(q)));

  // Category tabs show how many tools match the other filters.
  const filtered = tools.filter(matches);
  const categories = (Object.keys(TOOL_CATEGORIES) as ToolCategory[]).filter((c) => tools.some((t) => t.category === c));
  const shown = filtered
    .filter((t) => !category || t.category === category)
    .sort((a, b) => (sort === "name" ? a.name.localeCompare(b.name) : b.dateAdded.localeCompare(a.dateAdded)));

  return (
    <div>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1 lg:max-w-md">
          <label htmlFor="tool-search" className="sr-only">
            Search tools
          </label>
          <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted" aria-hidden />
          <input
            id="tool-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools, e.g. transcribe"
            className="w-full rounded-full border border-border bg-surface py-3 pr-4 pl-11 text-foreground outline-none transition-colors placeholder:text-muted focus:border-accent"
          />
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={freeOpenOnly}
          onClick={() => setFreeOpenOnly((v) => !v)}
          className={`inline-flex items-center gap-3 rounded-full border px-4 py-2.5 text-sm font-semibold transition-colors ${
            freeOpenOnly ? "border-success bg-success/10 text-foreground" : "border-border text-muted hover:text-foreground"
          }`}
        >
          <span className={`relative h-5 w-9 rounded-full transition-colors ${freeOpenOnly ? "bg-success" : "bg-border"}`}>
            <motion.span
              className="absolute top-0.5 left-0.5 size-4 rounded-full bg-background shadow"
              animate={{ x: freeOpenOnly ? 16 : 0 }}
              transition={popover}
            />
          </span>
          Free &amp; open source only
        </button>
        <label className="inline-flex items-center gap-2 text-sm text-muted lg:ml-auto">
          <ArrowUpDown className="size-4" aria-hidden />
          <span className="sr-only">Sort by</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            className="rounded-full border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none focus:border-accent"
          >
            <option value="newest">Newest first</option>
            <option value="name">Name (A–Z)</option>
          </select>
        </label>
      </div>

      {/* Category tabs, scrollable on small screens. */}
      <div role="tablist" aria-label="Categories" className="-mx-4 mt-6 flex gap-1 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6">
        <CategoryTab active={category === null} onClick={() => setCategory(null)} count={filtered.length}>
          All
        </CategoryTab>
        {categories.map((c) => (
          <CategoryTab
            key={c}
            active={category === c}
            onClick={() => setCategory(c)}
            count={filtered.filter((t) => t.category === c).length}
          >
            {TOOL_CATEGORIES[c].label}
          </CategoryTab>
        ))}
      </div>

      <div className="mt-4 grid gap-4 rounded-3xl border border-border p-5 sm:grid-cols-2 lg:grid-cols-4">
        <FilterGroup label="Pricing">
          {(Object.keys(PRICING) as Pricing[]).map((p) => (
            <Chip key={p} small active={pricing === p} onClick={() => setPricing(pricing === p ? null : p)}>
              {PRICING[p]}
            </Chip>
          ))}
        </FilterGroup>
        <FilterGroup label="Licence">
          <Chip small active={openSource} onClick={() => setOpenSource((v) => !v)}>
            Open source
          </Chip>
        </FilterGroup>
        <FilterGroup label="Runs on">
          {(Object.keys(PLATFORMS) as Platform[]).map((p) => (
            <Chip key={p} small active={platform === p} onClick={() => setPlatform(platform === p ? null : p)}>
              {PLATFORMS[p]}
            </Chip>
          ))}
        </FilterGroup>
        <FilterGroup label="Difficulty">
          {(Object.keys(DIFFICULTIES) as Difficulty[]).map((d) => (
            <Chip key={d} small active={difficulty === d} onClick={() => setDifficulty(difficulty === d ? null : d)}>
              {DIFFICULTIES[d]}
            </Chip>
          ))}
        </FilterGroup>
      </div>

      <p className="mt-6 text-sm text-muted" aria-live="polite">
        {shown.length === tools.length ? `${tools.length} tools` : `${shown.length} of ${tools.length} tools`}
      </p>

      <motion.div layout className="mt-3 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence initial={false} mode="popLayout">
          {shown.map((tool) => (
            <motion.div
              key={tool.slug}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: duration.base, ease }}
            >
              <ToolCard tool={tool} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {shown.length === 0 && (
        <p className="mt-6 rounded-3xl border border-dashed border-border px-5 py-10 text-center text-muted">
          No tools match these filters.
        </p>
      )}
    </div>
  );
}

function ToolCard({ tool }: { tool: ToolSummary }) {
  return (
    <motion.article
      {...hoverLift}
      style={categoryStyle(tool)}
      className="group relative flex h-full flex-col rounded-3xl border border-border bg-surface p-6 transition-[border-color,box-shadow] hover:border-level/50 hover:ring-4 hover:ring-level/10"
    >
      <div className="flex items-start justify-between gap-3">
        <ToolLogo tool={tool} />
        {tool.featured && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-level">
            <Star className="size-3.5 fill-current" aria-hidden /> Featured
          </span>
        )}
      </div>
      <h3 className="mt-4 font-display text-xl font-bold text-foreground">
        <Link href={`/tools/${tool.slug}`} className="after:absolute after:inset-0 after:rounded-3xl">
          {tool.name}
        </Link>
      </h3>
      <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted">{tool.tagline}</p>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <ToolBadges tool={tool} />
        <PlatformIcons platforms={tool.platforms} />
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-xs text-muted">
        <Sparkles className="size-3.5 text-level" aria-hidden />
        {TOOL_CATEGORIES[tool.category].label} · {DIFFICULTIES[tool.difficulty]}
      </p>
    </motion.article>
  );
}

function CategoryTab({
  active,
  onClick,
  count,
  children,
}: {
  active: boolean;
  onClick: () => void;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`relative shrink-0 rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors ${
        active ? "text-accent-foreground" : "text-muted hover:text-foreground"
      }`}
    >
      {active && (
        <motion.span layoutId="tool-category" className="absolute inset-0 rounded-full bg-accent" transition={slide} />
      )}
      <span className="relative">
        {children} <span className="opacity-70">{count}</span>
      </span>
    </button>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div role="group" aria-label={label}>
      <p className="text-xs font-semibold tracking-wide text-muted uppercase">{label}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}
