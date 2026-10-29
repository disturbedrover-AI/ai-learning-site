import Link from "next/link";
import { ArrowUpRight, Lightbulb } from "lucide-react";
import type { NewsItem } from "@/lib/content";
import { hueStyle } from "@/lib/levels";
import { NEWS_TYPES, type NewsType } from "@/lib/taxonomy";

/** What a news card needs (no body text, so lists stay small). */
export type NewsSummary = Omit<NewsItem, "body" | "file">;

export const formatDate = (date: string, month: "short" | "long" = "short") =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month, year: "numeric", timeZone: "UTC" }).format(new Date(date));

export const formatMonth = (date: string) =>
  new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(date));

/** A small pill in the news type's own colour. */
export function TypeBadge({ type }: { type: NewsType }) {
  const { label, hue } = NEWS_TYPES[type];
  return (
    <span
      style={hue === "neutral" ? undefined : hueStyle(hue)}
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        hue === "neutral" ? "border border-border text-muted" : "bg-level/10 text-level"
      }`}
    >
      {label}
    </span>
  );
}

/** A news item in a list. The whole card opens the item; the source link opens the original. */
export function NewsCard({ item, large = false }: { item: NewsSummary; large?: boolean }) {
  const hue = NEWS_TYPES[item.type].hue;
  return (
    <article
      style={hue === "neutral" ? undefined : hueStyle(hue)}
      className={`group relative flex h-full flex-col rounded-3xl border border-border bg-surface transition-[border-color,box-shadow] hover:border-level/50 hover:ring-4 hover:ring-level/10 ${
        large ? "p-7" : "p-6"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
        <TypeBadge type={item.type} />
        <time dateTime={item.date}>{formatDate(item.date)}</time>
      </div>
      <h3 className={`mt-3 font-display font-bold text-foreground ${large ? "text-2xl" : "text-xl"}`}>
        {/* The title link covers the whole card; the source link sits on top of it. */}
        <Link href={`/news/${item.slug}`} className="after:absolute after:inset-0 after:rounded-3xl">
          {item.title}
        </Link>
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{item.summary}</p>
      <p className="mt-4 flex gap-2 rounded-xl bg-level/[0.07] px-3 py-2 text-sm text-foreground">
        <Lightbulb className="mt-0.5 size-4 shrink-0 text-level" aria-hidden />
        <span>
          <span className="font-semibold">Why it matters: </span>
          {item.whyItMatters}
        </span>
      </p>
      <a
        href={item.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="relative z-10 mt-4 inline-flex w-fit items-center gap-1 text-xs font-medium text-muted transition-colors hover:text-foreground"
      >
        {item.source} <ArrowUpRight className="size-3.5" aria-hidden />
        <span className="sr-only">(opens in a new tab)</span>
      </a>
    </article>
  );
}
