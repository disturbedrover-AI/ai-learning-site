"use client";

import Link from "next/link";
import type { Lesson, Level } from "@/lib/content";
import { Lift } from "@/components/motion/Lift";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { Tag } from "@/components/ui/Card";
import { useCompletedLessons } from "./progress";

export type PathLesson = Pick<Lesson, "slug" | "title" | "summary" | "duration" | "tags">;
export type PathLevel = Level & { lessons: PathLesson[] };

/** The whole learning path: levels in order, each with numbered lesson steps joined by a line. */
export function LearningPath({ levels }: { levels: PathLevel[] }) {
  const completed = useCompletedLessons();
  const all = levels.flatMap((l) => l.lessons);
  const doneCount = all.filter((l) => completed.includes(l.slug)).length;
  const nextUp = all.find((l) => !completed.includes(l.slug))?.slug;
  // Steps are numbered across the whole path, not per level.
  const stepOf = (slug: string) => all.findIndex((l) => l.slug === slug) + 1;

  return (
    <div>
      <Reveal className="rounded-2xl border border-border bg-surface p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
          <p className="font-medium text-foreground">Your progress</p>
          <p className="text-muted">
            {doneCount} of {all.length} lessons complete
          </p>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-background">
          <div
            className="h-full origin-left rounded-full bg-accent transition-transform duration-500 ease-out"
            style={{ transform: `scaleX(${all.length ? doneCount / all.length : 0})` }}
          />
        </div>
        <p className="mt-3 text-xs text-muted">Saved in this browser only. Accounts are coming later.</p>
      </Reveal>

      <div className="mt-12 space-y-14">
        {levels.map((level) => (
          <section key={level.level} aria-labelledby={`level-${level.level}`}>
            <Reveal>
              <p className="text-sm font-medium text-accent">Level {level.level}</p>
              <h2 id={`level-${level.level}`} className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
                {level.title}
              </h2>
              <p className="mt-2 max-w-2xl text-muted">{level.description}</p>
            </Reveal>

            {level.lessons.length === 0 ? (
              <Reveal className="mt-6 rounded-2xl border border-dashed border-border px-5 py-6 text-sm text-muted">
                Lessons for this level are coming soon.
              </Reveal>
            ) : (
              <Stagger as="ol" className="mt-6">
                {level.lessons.map((lesson, i) => {
                  const done = completed.includes(lesson.slug);
                  const isNext = lesson.slug === nextUp;
                  const last = i === level.lessons.length - 1;
                  return (
                    <StaggerItem as="li" key={lesson.slug} className="relative flex gap-4 pb-4 sm:gap-6">
                      {/* The line joining this step to the next one. */}
                      {!last && (
                        <span
                          aria-hidden
                          className={`absolute top-10 bottom-0 left-[1.125rem] w-px ${done ? "bg-accent" : "bg-border"}`}
                        />
                      )}
                      <span
                        className={`relative z-10 mt-1 flex size-9 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-colors ${
                          done
                            ? "border-accent bg-accent text-accent-foreground"
                            : isNext
                              ? "border-accent bg-background text-accent ring-4 ring-accent/15"
                              : "border-border bg-background text-muted"
                        }`}
                      >
                        {done ? (
                          <svg viewBox="0 0 20 20" className="size-4" fill="currentColor" aria-label="Completed">
                            <path d="M7.7 13.3 4.4 10l-1.1 1.1 4.4 4.4 9-9-1.1-1.1z" />
                          </svg>
                        ) : (
                          stepOf(lesson.slug)
                        )}
                      </span>

                      <Lift className="min-w-0 flex-1">
                        <Link
                          href={`/learn/${lesson.slug}`}
                          className="group block rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-accent"
                        >
                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                            <span>{lesson.duration} min read</span>
                            {done && <span className="font-medium text-accent">· Done</span>}
                            {isNext && <span className="font-medium text-accent">· Up next</span>}
                          </div>
                          <h3 className="mt-1.5 flex items-center justify-between gap-3 text-lg font-semibold text-foreground">
                            {lesson.title}
                            <span className="text-muted transition-transform group-hover:translate-x-1 group-hover:text-accent">
                              →
                            </span>
                          </h3>
                          <p className="mt-1.5 text-sm leading-relaxed text-muted">{lesson.summary}</p>
                          {lesson.tags.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {lesson.tags.map((t) => (
                                <Tag key={t}>{t}</Tag>
                              ))}
                            </div>
                          )}
                        </Link>
                      </Lift>
                    </StaggerItem>
                  );
                })}
              </Stagger>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
