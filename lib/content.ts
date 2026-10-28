/**
 * Reads the files in /content. Pages call these functions; content authors
 * never need to touch this file. Field rules are documented in content/README.md.
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "content");

export type Lesson = {
  slug: string;
  title: string;
  summary: string;
  level: "beginner" | "intermediate" | "advanced";
  order: number;
  duration?: number;
  tags: string[];
  body: string;
};

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

/** Reads every .md or .json file in a content folder, skipping names that start with "_". */
function readFolder(folder: string, ext: ".md" | ".json"): RawFile[] {
  const dir = path.join(CONTENT_DIR, folder);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(ext) && !name.startsWith("_"))
    .map((name) => {
      const file = `content/${folder}/${name}`;
      const raw = fs.readFileSync(path.join(dir, name), "utf8");
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

export function getLessons(): Lesson[] {
  return readFolder("lessons", ".md")
    .filter((f) => f.data.draft !== true)
    .map((f) => {
      requireFields(f, ["title", "summary", "level", "order"]);
      return {
        slug: f.slug,
        title: String(f.data.title),
        summary: String(f.data.summary),
        level: f.data.level as Lesson["level"],
        order: Number(f.data.order),
        duration: f.data.duration ? Number(f.data.duration) : undefined,
        tags: list(f.data.tags),
        body: f.body,
      };
    })
    .sort((a, b) => a.order - b.order);
}

export function getGlossary(): GlossaryTerm[] {
  return readFolder("glossary", ".json")
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

export function getNews(): NewsItem[] {
  return readFolder("news", ".md")
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
  return readFolder("tools", ".json")
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
