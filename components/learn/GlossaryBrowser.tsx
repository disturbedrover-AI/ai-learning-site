"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { GlossaryTerm } from "@/lib/content";
import { duration, ease } from "@/lib/motion";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

/** Searchable, A–Z filterable list of glossary terms. Each term has an #id so lessons can link to it. */
export function GlossaryBrowser({ terms }: { terms: GlossaryTerm[] }) {
  const [query, setQuery] = useState("");
  const [letter, setLetter] = useState<string | null>(null);

  const firstLetter = (t: GlossaryTerm) => t.term[0].toUpperCase();
  const available = new Set(terms.map(firstLetter));
  const q = query.trim().toLowerCase();
  const shown = terms.filter(
    (t) =>
      (!letter || firstLetter(t) === letter) &&
      (!q || [t.term, t.definition, ...t.aliases].some((text) => text.toLowerCase().includes(q))),
  );
  const nameOf = (slug: string) => terms.find((t) => t.slug === slug)?.term;

  return (
    <div>
      <label htmlFor="glossary-search" className="sr-only">
        Search the glossary
      </label>
      <div className="relative">
        <svg
          viewBox="0 0 24 24"
          className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          id="glossary-search"
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setLetter(null);
          }}
          placeholder="Search terms, e.g. token"
          className="w-full rounded-full border border-border bg-surface py-3 pr-4 pl-11 text-foreground outline-none transition-colors placeholder:text-muted focus:border-accent"
        />
      </div>

      <div role="group" aria-label="Filter by first letter" className="mt-4 flex flex-wrap gap-1">
        <LetterButton active={letter === null} onClick={() => setLetter(null)}>
          All
        </LetterButton>
        {LETTERS.map((l) => (
          <LetterButton
            key={l}
            active={letter === l}
            disabled={!available.has(l)}
            onClick={() => {
              setLetter(l);
              setQuery("");
            }}
          >
            {l}
          </LetterButton>
        ))}
      </div>

      <p className="mt-6 text-sm text-muted" aria-live="polite">
        {shown.length === terms.length ? `${terms.length} terms` : `${shown.length} of ${terms.length} terms`}
      </p>

      <motion.dl layout className="mt-3 space-y-3">
        <AnimatePresence initial={false} mode="popLayout">
          {shown.map((t) => (
            <motion.div
              key={t.slug}
              id={t.slug}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: duration.base, ease }}
              className="relative scroll-mt-24 overflow-hidden rounded-3xl border border-border bg-surface p-6 transition-colors target:border-accent target:ring-4 target:ring-accent/10 sm:p-7"
            >
              {/* A large, faint first letter in the corner. */}
              <span
                aria-hidden
                className="pointer-events-none absolute -right-1 -bottom-10 font-display text-[10rem] leading-none font-extrabold text-foreground/[0.05] select-none"
              >
                {t.term[0]}
              </span>
              <dt className="relative font-display text-2xl font-bold text-foreground">
                {t.term}
                {t.aliases.length > 0 && <span className="ml-2 text-sm font-normal text-muted">({t.aliases.join(", ")})</span>}
              </dt>
              <dd className="relative mt-2 max-w-[60ch] leading-relaxed text-muted">{t.definition}</dd>
              {t.related.length > 0 && (
                <dd className="relative mt-4 flex flex-wrap items-center gap-1.5 text-xs text-muted">
                  Related:
                  {t.related.map((slug) => (
                    <a
                      key={slug}
                      href={`#${slug}`}
                      onClick={() => {
                        setQuery("");
                        setLetter(null);
                      }}
                      className="rounded-full border border-border bg-background px-2.5 py-0.5 transition-colors hover:border-accent hover:text-foreground"
                    >
                      {nameOf(slug) ?? slug}
                    </a>
                  ))}
                </dd>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.dl>

      {shown.length === 0 && (
        <p className="mt-6 rounded-2xl border border-dashed border-border px-5 py-8 text-center text-muted">
          No terms match “{query}”.
        </p>
      )}
    </div>
  );
}

function LetterButton({
  active,
  disabled,
  onClick,
  children,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      // Letters that have terms are bold with a small dot; the rest are faint and can't be picked.
      className={`relative h-9 min-w-9 rounded-full px-2 text-sm transition-colors disabled:cursor-default disabled:font-normal disabled:text-muted disabled:opacity-35 ${
        active
          ? "bg-accent font-semibold text-accent-foreground"
          : "font-semibold text-foreground enabled:hover:bg-surface"
      }`}
    >
      {children}
      {!disabled && !active && children !== "All" && (
        <span aria-hidden className="absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full bg-accent" />
      )}
    </button>
  );
}
