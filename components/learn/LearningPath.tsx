"use client";

import Link from "next/link";
import { ArrowRight, BookA, Check, Clock, Wrench } from "lucide-react";
import type { Lesson } from "@/lib/content";
import type { Level } from "@/lib/courses";
import { levelStyle } from "@/lib/levels";
import { Counter } from "@/components/motion/Counter";
import { Lift } from "@/components/motion/Lift";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { ButtonLink } from "@/components/ui/Button";
import { useProgress } from "./progress";

export type PathLesson = Pick<Lesson, "slug" | "title" | "summary" | "duration" | "tags"> & {
  /** Progress id, "course/track/lesson". */
  id: string;
  href: string;
  level: number;
  /** The lesson's icon, already rendered on the server. */
  icon: React.ReactNode;
};
export type PathLevel = Level & { lessons: PathLesson[] };

/** Completion state shared by the path and its side panel. */
function usePathProgress(levels: PathLevel[]) {
  const { isComplete: isDone } = useProgress();
  const all = levels.flatMap((l) => l.lessons);
  return {
    all,
    isDone,
    doneCount: all.filter((l) => isDone(l.id)).length,
    nextUp: all.find((l) => !isDone(l.id)),
  };
}

/** The learning path: levels in order, each with lesson steps joined by a line that fills as lessons are completed. */
export function LearningPath({ levels }: { levels: PathLevel[] }) {
  const { all, isDone, nextUp } = usePathProgress(levels);
  const stepOf = (slug: string) => all.findIndex((l) => l.slug === slug) + 1;

  return (
    <div className="space-y-20">
      {levels.map((level) => {
        const minutes = level.lessons.reduce((sum, l) => sum + l.duration, 0);
        const empty = level.lessons.length === 0;
        return (
          <section key={level.level} aria-labelledby={`level-${level.level}`} style={levelStyle(level.level)}>
            <Reveal>
              <div className="flex items-end gap-5">
                <span
                  aria-hidden
                  className={`font-display text-8xl leading-[0.8] font-extrabold sm:text-9xl ${
                    empty ? "text-transparent opacity-60 [-webkit-text-stroke:1.5px_var(--level)]" : "text-level"
                  }`}
                >
                  {level.level}
                </span>
                <div className="pb-1">
                  <p className="text-xs font-semibold tracking-[0.14em] text-level uppercase">Level {level.level}</p>
                  <h2 id={`level-${level.level}`} className="mt-1 text-3xl font-bold text-foreground sm:text-4xl">
                    {level.title}
                  </h2>
                </div>
              </div>
              <p className="mt-5 max-w-xl leading-relaxed text-muted">{level.description}</p>
              <p className="mt-2 text-sm font-medium text-foreground">
                {empty
                  ? "Coming soon"
                  : `${level.lessons.length} ${level.lessons.length === 1 ? "lesson" : "lessons"} · ${minutes} min`}
              </p>
            </Reveal>

            {!empty && (
              <Stagger as="ol" className="mt-8">
                {level.lessons.map((lesson, i) => {
                  const done = isDone(lesson.id);
                  const isNext = lesson.slug === nextUp?.slug;
                  const last = i === level.lessons.length - 1;
                  return (
                    <StaggerItem as="li" key={lesson.slug} className="relative flex gap-4 pb-5 sm:gap-6">
                      {/* The line to the next step: grey, filling with the level colour once this lesson is done. */}
                      {!last && (
                        <span
                          aria-hidden
                          className="absolute top-12 bottom-0 left-[1.1875rem] w-0.5 overflow-hidden rounded-full bg-border"
                        >
                          <span
                            className={`block size-full origin-top bg-level transition-transform duration-500 ease-out ${
                              done ? "scale-y-100" : "scale-y-0"
                            }`}
                          />
                        </span>
                      )}
                      <span
                        className={`relative z-10 mt-2 flex size-10 shrink-0 items-center justify-center rounded-full border-2 font-display text-sm font-bold transition-colors ${
                          done
                            ? "border-level bg-level text-background"
                            : isNext
                              ? "border-level bg-background text-level ring-4 ring-level/15"
                              : "border-border bg-background text-muted"
                        }`}
                      >
                        {done ? <Check className="size-4" strokeWidth={3} aria-label="Completed" /> : stepOf(lesson.slug)}
                      </span>

                      <Lift className="min-w-0 flex-1">
                        <Link
                          href={lesson.href}
                          className={`group flex gap-4 rounded-2xl border bg-surface p-5 transition-[border-color,box-shadow,opacity] hover:border-level/60 hover:ring-4 hover:ring-level/10 sm:p-6 ${
                            isNext ? "border-level/40" : "border-border"
                          } ${done ? "opacity-70 hover:opacity-100" : ""}`}
                        >
                          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-level/10 text-level [&_svg]:size-5">
                            {lesson.icon}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
                              <span className="inline-flex items-center gap-1">
                                <Clock className="size-3.5" aria-hidden /> {lesson.duration} min
                              </span>
                              {done && <span className="font-semibold text-level">· Completed</span>}
                              {isNext && (
                                <span className="rounded-full bg-level/10 px-2 py-0.5 font-semibold text-level">Up next</span>
                              )}
                            </span>
                            <span className="mt-1.5 flex items-center justify-between gap-3 font-display text-xl font-bold text-foreground">
                              {lesson.title}
                              <ArrowRight
                                className="size-5 shrink-0 text-muted transition-transform group-hover:translate-x-1 group-hover:text-level"
                                aria-hidden
                              />
                            </span>
                            <span className="mt-1.5 block text-sm leading-relaxed text-muted">{lesson.summary}</span>
                          </span>
                        </Link>
                      </Lift>
                    </StaggerItem>
                  );
                })}
              </Stagger>
            )}
          </section>
        );
      })}
    </div>
  );
}

/** The Learn page's side panel: progress, "continue where you left off", quick links. */
export function LearnPanel({ levels }: { levels: PathLevel[] }) {
  const { all, isDone, doneCount, nextUp } = usePathProgress(levels);
  const percent = all.length ? Math.round((doneCount / all.length) * 100) : 0;

  return (
    <Stagger className="space-y-4">
      <StaggerItem className="rounded-3xl border border-border bg-surface p-6">
        <p className="text-sm font-medium text-muted">Your progress</p>
        <p className="mt-2 flex items-baseline gap-1 font-display text-5xl font-bold text-foreground">
          <Counter value={percent} />
          <span className="text-2xl text-muted">%</span>
        </p>
        <p className="mt-1 text-sm text-muted">
          {doneCount} of {all.length} lessons complete
        </p>
        {/* One segment per lesson, in its level's colour. */}
        <div className="mt-5 flex gap-1" aria-hidden>
          {all.map((lesson) => (
            <span
              key={lesson.slug}
              style={levelStyle(lesson.level)}
              className="h-2 flex-1 overflow-hidden rounded-full bg-level/15"
            >
              <span
                className={`block size-full origin-left rounded-full bg-level transition-transform duration-500 ease-out ${
                  isDone(lesson.id) ? "scale-x-100" : "scale-x-0"
                }`}
              />
            </span>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted">Saved in this browser only. Accounts are coming later.</p>
      </StaggerItem>

      <StaggerItem>
        <div
          className="rounded-3xl border border-border bg-surface p-6"
          style={nextUp ? levelStyle(nextUp.level) : undefined}
        >
          {nextUp ? (
            <>
              <p className="text-sm font-medium text-muted">
                {doneCount ? "Continue where you left off" : "Start here"}
              </p>
              <div className="mt-4 flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-level/10 text-level [&_svg]:size-5">
                  {nextUp.icon}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-level">
                    Level {nextUp.level} · {nextUp.duration} min
                  </p>
                  <p className="mt-0.5 font-display text-lg leading-snug font-bold text-foreground">{nextUp.title}</p>
                </div>
              </div>
              <ButtonLink href={nextUp.href} className="mt-5 w-full">
                {doneCount ? "Continue" : "Start the first lesson"} <ArrowRight className="size-4" aria-hidden />
              </ButtonLink>
            </>
          ) : all.length === 0 ? (
            <>
              <p className="font-display text-lg font-bold text-foreground">Lessons coming soon</p>
              <p className="mt-1 text-sm text-muted">This track is ready; its lessons are being written.</p>
            </>
          ) : (
            <>
              <p className="font-display text-lg font-bold text-foreground">All caught up</p>
              <p className="mt-1 text-sm text-muted">You&apos;ve completed every lesson so far. New ones are on the way.</p>
            </>
          )}
        </div>
      </StaggerItem>

      <StaggerItem className="grid grid-cols-2 gap-3">
        <QuickLink href="/learn/glossary" icon={<BookA className="size-5" aria-hidden />} label="Glossary" />
        <QuickLink href="/tools" icon={<Wrench className="size-5" aria-hidden />} label="Tools" />
      </StaggerItem>
    </Stagger>
  );
}

function QuickLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Lift>
      <Link
        href={href}
        className="flex h-full flex-col gap-3 rounded-2xl border border-border bg-surface p-4 text-sm font-semibold text-foreground transition-colors hover:border-accent"
      >
        <span className="text-accent">{icon}</span>
        {label}
      </Link>
    </Lift>
  );
}
