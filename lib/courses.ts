/**
 * COURSES
 * -------
 * Course → Track → Level (0–3) → Lesson.
 *
 * Each course is one file, content/courses/<course-slug>/course.json, holding
 * the course details and its tracks. A track lists, per level, the slugs of
 * the lessons in it (in order). Lessons themselves live in content/lessons and
 * can appear in any number of tracks. Field rules: content/README.md.
 */
import fs from "node:fs";
import path from "node:path";
import { findGlossaryTerm, getLessons, SLUG, type Lesson } from "./content";
import { HUES, type Hue } from "./levels";

export type Level = {
  level: number;
  title: string;
  description: string;
};

export type TrackLevel = Level & { lessons: Lesson[] };

export type Track = {
  slug: string;
  title: string;
  description: string;
  /** Always levels 0–3, in order (empty ones included). */
  levels: TrackLevel[];
};

export type Course = {
  slug: string;
  title: string;
  description: string;
  icon?: string;
  accent: Hue;
  tags: string[];
  status: "published" | "draft";
  tracks: Track[];
  /** Where the course lives, for error messages. */
  file: string;
};

/** The slug of the track a course gets when its file has no "tracks". */
export const DEFAULT_TRACK = "main";

const COURSES_DIR = path.join(process.cwd(), "content", "courses");
const RESERVED = ["glossary"];

/** Draft courses are shown only when the SHOW_DRAFTS environment setting is "true". */
export function showDrafts() {
  return process.env.SHOW_DRAFTS === "true";
}

/** Reads a JSON file inside content/ (`file` starts with "content/"). */
function readJson(file: string): unknown {
  try {
    // Joined under "content" so the build only bundles that folder.
    return JSON.parse(fs.readFileSync(path.join(process.cwd(), "content", file.replace(/^content\//, "")), "utf8"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") throw new Error(`${file} is missing.`);
    throw new Error(`${file} is not valid JSON. Check for missing commas or quotes.`);
  }
}

/** The default name and description of each level, from content/courses/_levels.json. */
export function getLevelDefaults(): Level[] {
  const file = "content/courses/_levels.json";
  const raw = readJson(file);
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

type RawLevel = { level?: unknown; title?: unknown; description?: unknown; lessons?: unknown };

/** Turns a track's "levels" list into levels 0–3 with their lessons, checking every slug. */
function buildLevels(raw: unknown, where: string): TrackLevel[] {
  const defaults = getLevelDefaults();
  const published = new Map(getLessons().map((l) => [l.slug, l]));
  const all = new Set(getLessons({ drafts: true }).map((l) => l.slug));
  if (raw !== undefined && !Array.isArray(raw)) throw new Error(`${where}: "levels" must be a list.`);

  const given = new Map<number, RawLevel>();
  const seen = new Set<string>();
  for (const level of (raw ?? []) as RawLevel[]) {
    const n = Number(level.level);
    if (!defaults.some((d) => d.level === n)) {
      throw new Error(`${where}: level ${String(level.level)} doesn't exist. Use one of: ${defaults.map((d) => d.level).join(", ")}.`);
    }
    if (given.has(n)) throw new Error(`${where}: level ${n} is listed twice.`);
    for (const slug of Array.isArray(level.lessons) ? level.lessons.map(String) : []) {
      if (!all.has(slug)) throw new Error(`${where}: lesson "${slug}" not found in content/lessons.`);
      if (seen.has(slug)) throw new Error(`${where}: lesson "${slug}" is listed twice in the same track.`);
      seen.add(slug);
    }
    given.set(n, level);
  }

  return defaults.map((d) => {
    const level = given.get(d.level);
    const slugs = Array.isArray(level?.lessons) ? level.lessons.map(String) : [];
    return {
      level: d.level,
      title: level?.title ? String(level.title) : d.title,
      description: level?.description ? String(level.description) : d.description,
      // Lessons marked as drafts are left out quietly.
      lessons: slugs.flatMap((slug) => published.get(slug) ?? []),
    };
  });
}

function readCourse(slug: string): Course {
  const file = `content/courses/${slug}/course.json`;
  const data = readJson(file) as Record<string, unknown>;
  const missing = ["title", "description", "status"].filter((f) => !data[f]);
  if (missing.length) throw new Error(`${file} is missing required field(s): ${missing.join(", ")}`);
  if (!SLUG.test(slug) || RESERVED.includes(slug)) {
    throw new Error(`content/courses/${slug}: folder names must be lowercase words joined by hyphens (and not "glossary").`);
  }
  if (data.status !== "published" && data.status !== "draft") {
    throw new Error(`${file}: "status" must be "published" or "draft".`);
  }
  const accent = (data.accent ?? "accent") as Hue;
  if (!HUES.includes(accent)) throw new Error(`${file}: "accent" must be one of ${HUES.join(", ")}.`);
  if (data.tracks && data.levels) throw new Error(`${file}: use either "tracks" or "levels", not both.`);

  const tracks: Track[] = Array.isArray(data.tracks)
    ? data.tracks.map((t: Record<string, unknown>, i: number) => {
        const where = `${file}, track #${i + 1}`;
        if (!t.slug || !t.title) throw new Error(`${where} needs a "slug" and a "title".`);
        if (!SLUG.test(String(t.slug))) throw new Error(`${where}: slug must be lowercase words joined by hyphens.`);
        return {
          slug: String(t.slug),
          title: String(t.title),
          description: String(t.description ?? ""),
          levels: buildLevels(t.levels, `${where} ("${t.slug}")`),
        };
      })
    : // No tracks: one default track, named after the course.
      [
        {
          slug: DEFAULT_TRACK,
          title: String(data.title),
          description: String(data.description),
          levels: buildLevels(data.levels, file),
        },
      ];
  if (tracks.length === 0) throw new Error(`${file}: "tracks" is empty. Add a track or remove the field.`);
  const trackSlugs = tracks.map((t) => t.slug);
  const duplicate = trackSlugs.find((s, i) => trackSlugs.indexOf(s) !== i);
  if (duplicate) throw new Error(`${file}: two tracks use the slug "${duplicate}".`);

  return {
    slug,
    title: String(data.title),
    description: String(data.description),
    icon: data.icon ? String(data.icon) : undefined,
    accent,
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    status: data.status,
    tracks,
    file,
  };
}

/** Courses to show: published ones, plus drafts when SHOW_DRAFTS is on. Published first, then by title. */
export function getCourses({ drafts = showDrafts() } = {}): Course[] {
  if (!fs.existsSync(COURSES_DIR)) return [];
  return fs
    .readdirSync(COURSES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("_"))
    .map((entry) => readCourse(entry.name))
    .filter((course) => drafts || course.status === "published")
    .sort((a, b) => (a.status === b.status ? a.title.localeCompare(b.title) : a.status === "published" ? -1 : 1));
}

export function getCourse(slug: string): Course | undefined {
  return getCourses().find((c) => c.slug === slug);
}

/** A track's lessons in order, each with the level it sits in. */
export function trackLessons(track: Track) {
  return track.levels.flatMap((level) => level.lessons.map((lesson) => ({ lesson, level: level.level })));
}

/** The id used for progress and in URLs: "course/track/lesson". */
export const lessonId = (course: string, track: string, lesson: string) => `${course}/${track}/${lesson}`;

/** Numbers shown on course and track cards. */
export function courseStats(course: Course) {
  const distinct = new Map<string, Lesson>();
  const levels = new Set<number>();
  for (const track of course.tracks) {
    for (const { lesson, level } of trackLessons(track)) {
      distinct.set(lesson.slug, lesson);
      levels.add(level);
    }
  }
  return {
    levels: levels.size,
    lessons: distinct.size,
    minutes: [...distinct.values()].reduce((sum, l) => sum + l.duration, 0),
    /** Every course/track/lesson id, for progress. */
    ids: course.tracks.flatMap((t) => trackLessons(t).map(({ lesson }) => lessonId(course.slug, t.slug, lesson.slug))),
  };
}

export function trackStats(course: Course, track: Track) {
  const items = trackLessons(track);
  return {
    levels: new Set(items.map((i) => i.level)).size,
    lessons: items.length,
    minutes: items.reduce((sum, i) => sum + i.lesson.duration, 0),
    ids: items.map(({ lesson }) => lessonId(course.slug, track.slug, lesson.slug)),
  };
}

/** Where a lesson can be read: the preferred track if it's there, otherwise the first course/track that has it. */
export function findLessonHome(slug: string, prefer?: { course: string; track: string }) {
  const homes = getCourses().flatMap((course) =>
    course.tracks.filter((t) => trackLessons(t).some((i) => i.lesson.slug === slug)).map((track) => ({ course, track })),
  );
  return homes.find((h) => h.course.slug === prefer?.course && h.track.slug === prefer?.track) ?? homes[0];
}

/**
 * Which courses use each glossary term (via <Definition term="…"> or <Term> in
 * their lessons). Used by the glossary's course filter.
 */
export function getTermCourses(): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const course of getCourses()) {
    for (const track of course.tracks) {
      for (const { lesson } of trackLessons(track)) {
        const names = [
          ...[...lesson.body.matchAll(/<Definition\b[^>]*?\bglossary="([^"]+)"/g)].map((m) => m[1]),
          ...[...lesson.body.matchAll(/<Definition\b[^>]*?\bterm="([^"]+)"/g)].map((m) => m[1]),
          ...[...lesson.body.matchAll(/<Term\s+slug="([^"]+)"/g)].map((m) => m[1]),
          ...[...lesson.body.matchAll(/<Term>([^<]+)<\/Term>/g)].map((m) => m[1]),
        ];
        for (const name of names) {
          const term = findGlossaryTerm(name) ?? findGlossaryTerm(name.replace(/s$/i, ""));
          if (!term) continue;
          result[term.slug] ??= [];
          if (!result[term.slug].includes(course.slug)) result[term.slug].push(course.slug);
        }
      }
    }
  }
  return result;
}
