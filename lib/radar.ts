/**
 * RADAR
 * -----
 * Automatic headlines from the feeds in content/news-sources.json, shown
 * alongside the curated news posts. Server-side only.
 *
 * - Every enabled source is fetched in parallel, each with a 5-second limit
 *   (a source can allow more with "timeout").
 * - Feeds that fail or don't parse are skipped (and logged); the rest still show.
 * - Only the title, a short snippet (max 200 characters, no HTML) and the link
 *   are kept. Full article text is never stored or shown.
 * - The result is cached and refreshed at most once an hour.
 */
import "server-only";
import fs from "node:fs";
import path from "node:path";
import Parser from "rss-parser";
import { cacheLife } from "next/cache";
import { site } from "./site";
import { RADAR_CATEGORIES, type RadarCategory } from "./taxonomy";

export type RadarSource = {
  name: string;
  /** The RSS or Atom feed address. */
  url: string;
  homepage: string;
  category: RadarCategory;
  enabled: boolean;
  /** Keep only this many of the newest items from this source. */
  limit?: number;
  /** Keep only items whose title or snippet contains one of these words. */
  keywords?: string[];
  /** false: don't show the feed's text (for feeds whose text is just boilerplate). */
  snippets: boolean;
  /** Seconds to wait for this feed (default 5). */
  timeout: number;
};

export type RadarItem = {
  id: string;
  title: string;
  link: string;
  source: string;
  /** ISO date and time. */
  publishedAt: string;
  snippet: string;
  category: RadarCategory;
};

export type Radar = {
  items: RadarItem[];
  /** When the feeds were last fetched (ISO). */
  fetchedAt: string;
  /** How each enabled source did on the last fetch. */
  sources: { name: string; homepage: string; category: RadarCategory; ok: boolean; count: number }[];
};

const DEFAULT_TIMEOUT_SECONDS = 5;
const SNIPPET_LENGTH = 200;

/** The sources listed in content/news-sources.json (checked). */
export function getRadarSources(): RadarSource[] {
  const file = "content/news-sources.json";
  let raw: unknown;
  try {
    raw = JSON.parse(fs.readFileSync(path.join(process.cwd(), "content", "news-sources.json"), "utf8"));
  } catch {
    throw new Error(`${file} is missing or is not valid JSON.`);
  }
  if (!Array.isArray(raw)) throw new Error(`${file} must be a list of sources.`);
  return raw.map((s, i) => {
    if (!s?.name || !s?.url || !s?.homepage) throw new Error(`${file}: source #${i + 1} needs "name", "url" and "homepage".`);
    if (!(s.category in RADAR_CATEGORIES)) {
      throw new Error(`${file}: "${s.name}" has category "${s.category}". Use: ${Object.keys(RADAR_CATEGORIES).join(", ")}.`);
    }
    return {
      name: String(s.name),
      url: String(s.url),
      homepage: String(s.homepage),
      category: s.category,
      enabled: s.enabled !== false,
      limit: typeof s.limit === "number" ? s.limit : undefined,
      keywords: Array.isArray(s.keywords) ? s.keywords.map(String) : undefined,
      snippets: s.snippets !== false,
      timeout: typeof s.timeout === "number" && s.timeout > 0 ? s.timeout : DEFAULT_TIMEOUT_SECONDS,
    };
  });
}

/** Plain text from HTML, cut to `max` characters at a word break. */
export function toSnippet(html: string, max = SNIPPET_LENGTH) {
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ") > max * 0.6 ? cut.lastIndexOf(" ") : cut.length)}…`;
}

/** The same article can be linked with tracking codes or a trailing slash; compare without them. */
function normaliseLink(link: string) {
  try {
    const url = new URL(link);
    [...url.searchParams.keys()].filter((k) => k.startsWith("utm_")).forEach((k) => url.searchParams.delete(k));
    url.hash = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return link;
  }
}

const parser = new Parser();

async function fetchSource(source: RadarSource): Promise<RadarItem[]> {
  const response = await fetch(source.url, {
    signal: AbortSignal.timeout(source.timeout * 1000),
    headers: {
      "User-Agent": `${site.name} Radar (+${site.url})`,
      Accept: "application/rss+xml, application/atom+xml, application/xml;q=0.9, text/xml;q=0.8",
    },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const feed = await parser.parseString(await response.text());

  const words = source.keywords?.map((k) => new RegExp(`\\b${k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i"));
  const items = feed.items
    .map((item): RadarItem | null => {
      const title = toSnippet(item.title ?? "", 300);
      const link = item.link?.trim();
      const date = new Date(item.isoDate ?? item.pubDate ?? "");
      if (!title || !link || Number.isNaN(date.getTime())) return null;
      const snippet = source.snippets ? toSnippet(item.contentSnippet ?? item.summary ?? item.content ?? "") : "";
      return {
        id: normaliseLink(link),
        title,
        link,
        source: source.name,
        publishedAt: date.toISOString(),
        // Don't repeat the title as the snippet (common in link feeds like Hacker News).
        snippet: snippet === title ? "" : snippet,
        category: source.category,
      };
    })
    .filter((item): item is RadarItem => !!item)
    .filter((item) => !words || words.some((w) => w.test(item.title) || w.test(item.snippet)))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  return source.limit ? items.slice(0, source.limit) : items;
}

/** All Radar items, newest first. Cached: fetched again at most once an hour. */
export async function getRadar(): Promise<Radar> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 3600, expire: 86400 });

  const sources = getRadarSources().filter((s) => s.enabled);
  const results = await Promise.allSettled(sources.map(fetchSource));

  const seen = new Set<string>();
  const items: RadarItem[] = [];
  const status = sources.map((source, i) => {
    const result = results[i];
    if (result.status === "rejected") {
      console.warn(`[radar] Skipped "${source.name}" (${source.url}): ${(result.reason as Error)?.message ?? result.reason}`);
      return { name: source.name, homepage: source.homepage, category: source.category, ok: false, count: 0 };
    }
    for (const item of result.value) {
      if (seen.has(item.id)) continue;
      seen.add(item.id);
      items.push(item);
    }
    return { name: source.name, homepage: source.homepage, category: source.category, ok: true, count: result.value.length };
  });

  items.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  return { items, fetchedAt: new Date().toISOString(), sources: status };
}
