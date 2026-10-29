/**
 * Reads the files in /content. Pages call these functions; content authors
 * never need to touch this file. Field rules are documented in content/README.md.
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "content");

export type Level = {
  level: number;
  title: string;
  description: string;
};

export type Lesson = {
  slug: string;
  title: string;
  summary: string;
  level: number;
  order: number;
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

export type LevelWithLessons = Level & { lessons: Lesson[] };

export type GlossaryTerm = {
  slug: string;
  term: string;
  definition: string;
  aliases: string[];
  related: string[];
};

export type NewsItem = {
  slug: string;
  title: string;
  summary: string;
  date: string;
  source?: string;
  sourceUrl?: string;
  tags: string[];
  body: string;
};

export type Tool = {
  slug: string;
  name: string;
  description: string;
  url: string;
  category: string;
  pricing?: "free" | "freemium" | "paid";
  tags: string[];
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
      const { data, content } = matter(raw);
      return { slug, file, data, body: content.trim() };
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

/** The learning-path levels, from content/lessons/_levels.json. */
export function getLevels(): Level[] {
  const file = "content/lessons/_levels.json";
  let raw: unknown;
  try {
    raw = JSON.parse(fs.readFileSync(path.join(process.cwd(), file), "utf8"));
  } catch {
    throw new Error(`${file} is missing or is not valid JSON.`);
  }
  if (!Array.isArray(raw)) throw new Error(`${file} must be a list of levels.`);
  return raw
    .map((l, i) => {
      if (typeof l?.level !== "number" || !l?.title) {
        throw new Error(`${file}: level #${i + 1} needs a "level" number and a "title".`);
      }
      return { level: l.level, title: String(l.title), description: String(l.description ?? "") };
    })
    .sort((a, b) => a.level - b.level);
}

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const RESERVED_SLUGS = ["glossary"];

/** All published lessons, in learning-path order (by level, then order). */
export function getLessons(): Lesson[] {
  const levels = getLevels().map((l) => l.level);
  const lessons = readFolder("lessons", [".mdx", ".md"])
    .filter((f) => f.data.draft !== true)
    .map((f) => {
      requireFields(f, ["title", "summary", "level", "order", "duration"]);
      const slug = f.data.slug ? String(f.data.slug) : f.slug;
      const level = Number(f.data.level);
      if (!SLUG.test(slug) || RESERVED_SLUGS.includes(slug)) {
        throw new Error(`${f.file}: slug "${slug}" must be lowercase words joined by hyphens (and not "glossary").`);
      }
      if (!levels.includes(level)) {
        throw new Error(`${f.file}: level ${f.data.level} doesn't exist. Use one of: ${levels.join(", ")}.`);
      }
      return {
        slug,
        title: String(f.data.title),
        summary: String(f.data.summary),
        level,
        order: Number(f.data.order),
        duration: Number(f.data.duration),
        tags: list(f.data.tags),
        prerequisites: list(f.data.prerequisites),
        icon: optional(f.data.icon),
        body: f.body,
        file: f.file,
      };
    })
    .sort((a, b) => a.level - b.level || a.order - b.order);

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

/** Every level with its lessons, in order. Levels without lessons are kept (shown as "coming soon"). */
export function getLearningPath(): LevelWithLessons[] {
  const lessons = getLessons();
  return getLevels().map((level) => ({ ...level, lessons: lessons.filter((l) => l.level === level.level) }));
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

export function getNews(): NewsItem[] {
  return readFolder("news", [".md"])
    .map((f) => {
      requireFields(f, ["title", "summary", "date"]);
      // Unquoted YAML dates arrive as Date objects; normalise to "YYYY-MM-DD".
      const date = f.data.date instanceof Date ? f.data.date.toISOString().slice(0, 10) : String(f.data.date);
      return {
        slug: f.slug,
        title: String(f.data.title),
        summary: String(f.data.summary),
        date,
        source: optional(f.data.source),
        sourceUrl: optional(f.data.sourceUrl),
        tags: list(f.data.tags),
        body: f.body,
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getTools(): Tool[] {
  return readFolder("tools", [".json"])
    .map((f) => {
      requireFields(f, ["name", "description", "url", "category"]);
      return {
        slug: f.slug,
        name: String(f.data.name),
        description: String(f.data.description),
        url: String(f.data.url),
        category: String(f.data.category),
        pricing: f.data.pricing as Tool["pricing"],
        tags: list(f.data.tags),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}
