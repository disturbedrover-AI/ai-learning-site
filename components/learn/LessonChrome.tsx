"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import type { Heading } from "@/lib/headings";
import { hoverLift, popover } from "@/lib/motion";
import { markLessonOpened, setLessonComplete, useCompletedLessons } from "./progress";

/** A thin bar under the header that fills as you read down the page. */
export function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      aria-hidden
      style={{ scaleX: scrollYProgress }}
      className="fixed inset-x-0 top-16 z-30 h-0.5 origin-left bg-level"
    />
  );
}

/** "On this page" links. Highlights the section you're reading. */
export function TableOfContents({ headings }: { headings: Heading[] }) {
  const [active, setActive] = useState(headings[0]?.id);

  useEffect(() => {
    // The current section is the last heading that has scrolled past the top of the screen.
    const update = () => {
      let current = headings[0]?.id;
      for (const h of headings) {
        const el = document.getElementById(h.id);
        if (el && el.getBoundingClientRect().top < 140) current = h.id;
      }
      setActive(current);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav aria-label="On this page">
      <p className="text-xs font-semibold tracking-wide text-muted uppercase">On this page</p>
      <ul className="mt-3 space-y-1 border-l border-border">
        {headings.map((h) => (
          <li key={h.id} className="relative">
            {active === h.id && (
              <motion.span layoutId="toc-active" className="absolute inset-y-0 -left-px w-0.5 bg-level" transition={popover} />
            )}
            <a
              href={`#${h.id}`}
              className={`block py-1 text-sm transition-colors ${h.depth === 3 ? "pl-7" : "pl-4"} ${
                active === h.id ? "text-foreground" : "text-muted hover:text-foreground"
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Toggles this lesson's "done" state for the visitor. */
export function CompleteButton({ id }: { id: string }) {
  const done = useCompletedLessons().includes(id);
  return (
    <motion.button
      type="button"
      onClick={() => setLessonComplete(id, !done)}
      aria-pressed={done}
      {...hoverLift}
      className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-colors ${
        done ? "border border-level bg-level/10 text-foreground" : "bg-accent text-accent-foreground hover:opacity-90"
      }`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={done ? "done" : "todo"}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={popover}
          className="inline-flex items-center gap-2"
        >
          {done ? (
            <>
              <Check className="size-4 text-level" strokeWidth={3} aria-hidden />
              Completed · Undo
            </>
          ) : (
            "Mark as complete"
          )}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}

type Neighbour = { href: string; title: string } | undefined;

/** A ring that fills as you read, with the percentage in the middle. */
function ReadingRing() {
  const { scrollYProgress } = useScroll();
  const percent = useTransform(scrollYProgress, (p) => `${Math.round(p * 100)}%`);
  return (
    <div className="relative size-20">
      <svg viewBox="0 0 40 40" className="size-full -rotate-90" aria-hidden>
        <circle cx="20" cy="20" r="17" fill="none" stroke="var(--border)" strokeWidth="3" />
        <motion.circle
          cx="20"
          cy="20"
          r="17"
          fill="none"
          stroke="var(--level)"
          strokeWidth="3"
          strokeLinecap="round"
          style={{ pathLength: scrollYProgress }}
        />
      </svg>
      <motion.span className="absolute inset-0 flex items-center justify-center font-display text-lg font-bold text-foreground tabular-nums">
        {percent}
      </motion.span>
    </div>
  );
}

/**
 * The lesson's side panel: reading progress, "Mark as complete", and the
 * previous / next lessons. On small screens it sits below the lesson.
 */
export function LessonPanel({
  id,
  position,
  prev,
  next,
}: {
  /** Progress id, "course/track/lesson". */
  id: string;
  /** Where this lesson sits in its track, e.g. "Lesson 2 of 3 in AI from Zero". */
  position: string;
  prev: Neighbour;
  next: Neighbour;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-border bg-surface p-5">
        <div className="flex items-center gap-4">
          <ReadingRing />
          <div>
            <p className="text-sm font-medium text-foreground">Reading progress</p>
            <p className="mt-0.5 text-xs text-muted">How far through this lesson you are.</p>
          </div>
        </div>
        <div className="mt-5">
          <CompleteButton id={id} />
        </div>
        <p className="mt-3 text-center text-xs text-muted">{position}</p>
      </div>

      <nav aria-label="More lessons" className="grid gap-3">
        {prev && <NeighbourLink lesson={prev} direction="prev" />}
        {next && <NeighbourLink lesson={next} direction="next" />}
      </nav>
    </div>
  );
}

function NeighbourLink({ lesson, direction }: { lesson: NonNullable<Neighbour>; direction: "prev" | "next" }) {
  const Arrow = direction === "prev" ? ArrowLeft : ArrowRight;
  return (
    <motion.div {...hoverLift}>
      <Link
        href={lesson.href}
        className="group block rounded-2xl border border-border p-4 transition-colors hover:border-level/60"
      >
        <span className="flex items-center gap-1 text-xs text-muted">
          {direction === "prev" && <Arrow className="size-3.5" aria-hidden />}
          {direction === "prev" ? "Previous" : "Next"}
          {direction === "next" && <Arrow className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />}
        </span>
        <span className="mt-1 block text-sm font-semibold text-foreground group-hover:text-level">{lesson.title}</span>
      </Link>
    </motion.div>
  );
}

/** Remembers this lesson as the last one opened in its course (for "Continue" links). Renders nothing. */
export function RememberLesson({ id }: { id: string }) {
  useEffect(() => markLessonOpened(id), [id]);
  return null;
}
