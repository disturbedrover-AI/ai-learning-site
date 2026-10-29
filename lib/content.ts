/**
 * Reads the files in /content. Pages call these functions; content authors
 * never need to touch this file. Field rules are documented in content/README.md.
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import {
  DIFFICULTIES,
  NEWS_TYPES,
  PLATFORMS,
  PRICING,
  TOOL_CATEGORIES,
  type Difficulty,
  type NewsType,
  type Platform,
  type Pricing,
  type ToolCategory,
} from "./taxonomy";

const CONTENT_DIR = path.join(process.cwd(), "content");

/**
 * A lesson. Lessons are a shared pool: which course, track and level they
 * belong to is set in content/courses (see lib/courses.ts), not here.
 */
export type Lesson = {
  slug: string;
  title: string;
  summary: string;
  /** Reading time in minutes. */
  duration: number;
  tags: string[];
  /** Slugs of lessons to read first. */
  prerequisites: string[];
  /** A lucide.dev icon name, e.g. "brain-circuit". */
  icon?: string;
  body: string;
  /** Where the lesson lives, for error messages. */
  file: string;
};


export type GlossaryTerm = {
  slug: string;
  term: string;
  definition: string;
  aliases: string[];
  related: string[];
};

export type NewsItem = {
  /** From the file name, without the date: 2024-07-23-llama-3-1.md → "llama-3-1". */
  slug: string;
  title: string;
  /** "YYYY-MM-DD". */
  date: string;
  source: string;
  sourceUrl: string;
  type: NewsType;
  tags: string[];
  summary: string;
  whyItMatters: string;
  relatedLesson?: string;
  relatedTool?: string;
  featured: boolean;
  body: string;
  file: string;
};

export type Tool = {
  slug: string;
  name: string;
  url: string;
  category: ToolCategory;
  pricing: Pricing;
  openSource: boolean;
  platforms: Platform[];
  tagline: string;
  goodFor: string[];
  notGoodFor: string[];
  difficulty: Difficulty;
  tags: string[];
  featured: boolean;
  ownerNote?: string;
  /** "YYYY-MM-DD". */
  dateAdded: string;
  body: string;
  file: string;
};

type RawFile = { slug: string; file: string; data: Record<string, unknown>; body: string };

type Extension = ".md" | ".mdx" | ".json";

/** Reads every file with one of the given extensions in a content folder, skipping names that start with "_". */
function readFolder(folder: string, extensions: Extension[]): RawFile[] {
  const dir = path.join(CONTENT_DIR, folder);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => extensions.includes(path.extname(name) as Extension) && !name.startsWith("_"))
    .map((name) => {
      const file = `content/${folder}/${name}`;
      const raw = fs.readFileSync(path.join(dir, name), "utf8");
      const ext = path.extname(name);
      const slug = name.slice(0, -ext.length);
      if (ext === ".json") {
        try {
          return { slug, file, data: JSON.parse(raw), body: "" };
        } catch {
          throw new Error(`${file} is not valid JSON. Check for missing commas or quotes.`);
        }
      }
      let parsed;
      try {
        parsed = matter(raw);
      } catch (error) {
        throw new Error(
          `${file}: the details between the --- lines couldn't be read (${(error as Error).message.split("\n")[0]}). ` +
            `If a value contains ": " or starts with a quote, wrap the whole value in double quotes.`,
        );
      }
      return { slug, file, data: parsed.data, body: parsed.content.trim() };
    });
}

function requireFields(file: RawFile, fields: string[]) {
  const missing = fields.filter((f) => file.data[f] === undefined || file.data[f] === "");
  if (missing.length) {
    throw new Error(`${file.file} is missing required field(s): ${missing.join(", ")}`);
  }
}

const list = (value: unknown): string[] => (Array.isArray(value) ? value.map(String) : []);
const optional = (value: unknown) => (value ? String(value) : undefined);

/** A copy of a news item or tool without its long text, for lists sent to the browser. */
export function withoutBody<T extends { body: string; file: string }>(item: T): Omit<T, "body" | "file"> {
  const copy: Partial<T> = { ...item };
  delete copy.body;
  delete copy.file;
  return copy as Omit<T, "body" | "file">;
}

/** A value that must be one of a fixed set (e.g. a news type). */
function oneOf<T extends string>(file: RawFile, field: string, allowed: Record<T, unknown>): T {
  const value = String(file.data[field]);
  if (!(value in allowed)) {
    throw new Error(`${file.file}: "${field}" is "${value}". Use one of: ${Object.keys(allowed).join(", ")}.`);
  }
  return value as T;
}

/** Unquoted YAML dates arrive as Date objects; normalise to "YYYY-MM-DD" and check the format. */
function dateField(file: RawFile, field: string): string {
  const raw = file.data[field];
  const value = raw instanceof Date ? raw.toISOString().slice(0, 10) : String(raw);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error(`${file.file}: "${field}" must be a date like 2026-10-29.`);
  return value;
}

function unique<T extends { slug: string; file: string }>(items: T[], what: string): T[] {
  const seen = new Set<string>();
  for (const item of items) {
    if (seen.has(item.slug)) throw new Error(`${item.file}: another ${what} already uses the name "${item.slug}".`);
    seen.add(item.slug);
  }
  return items;
}

export const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** All lessons that aren't drafts (or all of them, with `drafts: true`), sorted by slug. Courses decide their order. */
export function getLessons({ drafts = false } = {}): Lesson[] {
  const lessons = readFolder("lessons", [".mdx", ".md"])
    .filter((f) => drafts || f.data.draft !== true)
    .map((f) => {
      requireFields(f, ["title", "summary", "duration"]);
      const slug = f.data.slug ? String(f.data.slug) : f.slug;
      if (!SLUG.test(slug)) {
        throw new Error(`${f.file}: slug "${slug}" must be lowercase words joined by hyphens.`);
      }
      return {
        slug,
        title: String(f.data.title),
        summary: String(f.data.summary),
        duration: Number(f.data.duration),
        tags: list(f.data.tags),
        prerequisites: list(f.data.prerequisites),
        icon: optional(f.data.icon),
        body: f.body,
        file: f.file,
      };
    })
    .sort((a, b) => a.slug.localeCompare(b.slug));

  const slugs = new Set<string>();
  for (const lesson of lessons) {
    if (slugs.has(lesson.slug)) throw new Error(`${lesson.file}: another lesson already uses slug "${lesson.slug}".`);
    slugs.add(lesson.slug);
  }
  for (const lesson of lessons) {
    const unknown = lesson.prerequisites.filter((p) => !slugs.has(p));
    if (unknown.length) {
      throw new Error(`${lesson.file}: prerequisites not found: ${unknown.join(", ")}. Use other lessons' slugs.`);
    }
  }
  return lessons;
}

export function getLesson(slug: string): Lesson | undefined {
  return getLessons().find((l) => l.slug === slug);
}

export function getGlossary(): GlossaryTerm[] {
  return readFolder("glossary", [".json"])
    .map((f) => {
      requireFields(f, ["term", "definition"]);
      return {
        slug: f.slug,
        term: String(f.data.term),
        definition: String(f.data.definition),
        aliases: list(f.data.aliases),
        related: list(f.data.related),
      };
    })
    .sort((a, b) => a.term.localeCompare(b.term));
}

/** Finds a glossary entry by file name, term or alias (any capitalisation). */
export function findGlossaryTerm(name: string): GlossaryTerm | undefined {
  const key = name.trim().toLowerCase();
  return getGlossary().find(
    (t) => t.slug === key || t.term.toLowerCase() === key || t.aliases.some((a) => a.toLowerCase() === key),
  );
}

/** All news items, newest first. */
export function getNews(): NewsItem[] {
  const items = readFolder("news", [".md"]).map((f) => {
    requireFields(f, ["title", "date", "source", "sourceUrl", "type", "summary", "whyItMatters"]);
    return {
      slug: f.slug.replace(/^\d{4}-\d{2}-\d{2}-/, ""),
      title: String(f.data.title),
      date: dateField(f, "date"),
      source: String(f.data.source),
      sourceUrl: String(f.data.sourceUrl),
      type: oneOf(f, "type", NEWS_TYPES),
      tags: list(f.data.tags),
      summary: String(f.data.summary),
      whyItMatters: String(f.data.whyItMatters),
      relatedLesson: optional(f.data.relatedLesson),
      relatedTool: optional(f.data.relatedTool),
      featured: f.data.featured === true,
      body: f.body,
      file: f.file,
    };
  });
  return unique(items, "news item").sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
}

export function getNewsItem(slug: string): NewsItem | undefined {
  return getNews().find((n) => n.slug === slug);
}

/** All tools, by name. */
export function getTools(): Tool[] {
  const tools = readFolder("tools", [".md"]).map((f) => {
    requireFields(f, ["name", "url", "category", "pricing", "platforms", "tagline", "goodFor", "difficulty", "dateAdded"]);
    const platforms = list(f.data.platforms);
    const unknown = platforms.filter((p) => !(p in PLATFORMS));
    if (unknown.length) {
      throw new Error(`${f.file}: unknown platform(s) ${unknown.join(", ")}. Use: ${Object.keys(PLATFORMS).join(", ")}.`);
    }
    return {
      slug: f.slug,
      name: String(f.data.name),
      url: String(f.data.url),
      category: oneOf(f, "category", TOOL_CATEGORIES),
      pricing: oneOf(f, "pricing", PRICING),
      openSource: f.data.openSource === true,
      platforms: platforms as Platform[],
      tagline: String(f.data.tagline),
      goodFor: list(f.data.goodFor),
      notGoodFor: list(f.data.notGoodFor),
      difficulty: oneOf(f, "difficulty", DIFFICULTIES),
      tags: list(f.data.tags),
      featured: f.data.featured === true,
      ownerNote: optional(f.data.ownerNote),
      dateAdded: dateField(f, "dateAdded"),
      body: f.body,
      file: f.file,
    };
  });
  return unique(tools, "tool").sort((a, b) => a.name.localeCompare(b.name));
}

export function getTool(slug: string): Tool | undefined {
  return getTools().find((t) => t.slug === slug);
}
