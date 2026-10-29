"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Clock, Layers, Search, BookOpen } from "lucide-react";
import { hueStyle, type Hue } from "@/lib/levels";
import { duration, ease } from "@/lib/motion";
import { ButtonLink } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { ProgressMeter } from "./ProgressMeter";
import { useProgress } from "./progress";

export type CatalogueCourse = {
  slug: string;
  title: string;
  description: string;
  /** Already rendered on the server. */
  icon: React.ReactNode;
  accent: Hue;
  tags: string[];
  status: "published" | "draft";
  tracks: number;
  levels: number;
  lessons: number;
  minutes: number;
  /** Every course/track/lesson id in the course, for progress. */
  ids: string[];
  href: string;
  firstLessonHref?: string;
};

type Status = "all" | "published" | "draft";

/** The course list with search, tag and (when drafts are shown) status filters. */
export function CourseCatalogue({ courses, showStatus }: { courses: CatalogueCourse[]; showStatus: boolean }) {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("all");

  const tags = [...new Set(courses.flatMap((c) => c.tags))].sort();
  const q = query.trim().toLowerCase();
  const shown = courses.filter(
    (c) =>
      (!tag || c.tags.includes(tag)) &&
      (status === "all" || c.status === status) &&
      (!q || [c.title, c.description, ...c.tags].some((text) => text.toLowerCase().includes(q))),
  );

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative lg:w-96">
          <label htmlFor="course-search" className="sr-only">
            Search courses
          </label>
          <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted" aria-hidden />
          <input
            id="course-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses"
            className="w-full rounded-full border border-border bg-surface py-3 pr-4 pl-11 text-foreground outline-none transition-colors placeholder:text-muted focus:border-accent"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div role="group" aria-label="Filter by tag" className="flex flex-wrap gap-1.5">
            <Chip active={tag === null} onClick={() => setTag(null)}>
              All topics
            </Chip>
            {tags.map((t) => (
              <Chip key={t} active={tag === t} onClick={() => setTag(tag === t ? null : t)}>
                {t}
              </Chip>
            ))}
          </div>
          {showStatus && (
            <div role="group" aria-label="Filter by status" className="flex gap-1 rounded-full border border-border p-1">
              {(["all", "published", "draft"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={status === s}
                  onClick={() => setStatus(s)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold capitalize transition-colors ${
                    status === s ? "bg-foreground text-background" : "text-muted hover:text-foreground"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <p className="mt-6 text-sm text-muted" aria-live="polite">
        {shown.length === courses.length ? `${courses.length} courses` : `${shown.length} of ${courses.length} courses`}
      </p>

      <motion.div layout className="mt-4 grid gap-5 md:grid-cols-2">
        <AnimatePresence initial={false} mode="popLayout">
          {shown.map((course) => (
            <motion.div
              key={course.slug}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: duration.base, ease }}
            >
              <CourseCard course={course} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {shown.length === 0 && (
        <p className="mt-6 rounded-3xl border border-dashed border-border px-5 py-10 text-center text-muted">
          No courses match. Try another word or topic.
        </p>
      )}
    </div>
  );
}

function CourseCard({ course }: { course: CatalogueCourse }) {
  const last = useProgress().lastOpened[course.slug];
  const continueHref = last && course.ids.includes(last) ? `/learn/${last}` : undefined;

  return (
    <article
      style={hueStyle(course.accent)}
      className="group relative flex h-full flex-col rounded-3xl border border-border bg-surface p-6 transition-[border-color,box-shadow] hover:border-level/60 hover:ring-4 hover:ring-level/10 sm:p-7"
    >
      <div className="flex items-start justify-between gap-4">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-level/10 text-level [&_svg]:size-6">
          {course.icon}
        </span>
        {course.status === "draft" && (
          <span className="rounded-full border border-border px-2.5 py-0.5 text-xs font-semibold text-muted">Draft</span>
        )}
      </div>
      <h2 className="mt-5 font-display text-2xl font-bold text-foreground">
        {/* The title link covers the whole card; the button below sits on top of it. */}
        <Link href={course.href} className="after:absolute after:inset-0 after:rounded-3xl">
          {course.title}
        </Link>
      </h2>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{course.description}</p>

      <p className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
        {course.tracks > 1 && (
          <span className="inline-flex items-center gap-1">
            <BookOpen className="size-3.5" aria-hidden /> {course.tracks} tracks
          </span>
        )}
        <span className="inline-flex items-center gap-1">
          <Layers className="size-3.5" aria-hidden /> {course.levels} {course.levels === 1 ? "level" : "levels"}
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="size-3.5" aria-hidden /> {course.lessons} {course.lessons === 1 ? "lesson" : "lessons"} ·{" "}
          {course.minutes} min
        </span>
      </p>
      {course.tags.length > 0 && (
        <p className="mt-3 flex flex-wrap gap-1.5">
          {course.tags.map((t) => (
            <span key={t} className="rounded-full bg-background px-2.5 py-0.5 text-xs text-muted">
              {t}
            </span>
          ))}
        </p>
      )}

      <ProgressMeter ids={course.ids} className="mt-5" />

      <div className="relative z-10 mt-5">
        {continueHref ? (
          <ButtonLink href={continueHref} className="px-5 py-2.5">
            Continue <ArrowRight className="size-4" aria-hidden />
          </ButtonLink>
        ) : course.firstLessonHref ? (
          <ButtonLink href={course.firstLessonHref} variant="secondary" className="px-5 py-2.5">
            Start <ArrowRight className="size-4" aria-hidden />
          </ButtonLink>
        ) : (
          <span className="text-sm text-muted">Lessons coming soon</span>
        )}
      </div>
    </article>
  );
}

