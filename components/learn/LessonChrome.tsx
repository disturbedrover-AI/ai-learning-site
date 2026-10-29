"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useScroll } from "framer-motion";
import type { Heading } from "@/lib/headings";
import { hoverLift, popover } from "@/lib/motion";
import { setLessonComplete, useCompletedLessons } from "./progress";

/** A thin bar under the header that fills as you read down the page. */
export function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      aria-hidden
      style={{ scaleX: scrollYProgress }}
      className="fixed inset-x-0 top-16 z-30 h-0.5 origin-left bg-accent"
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
              <motion.span layoutId="toc-active" className="absolute inset-y-0 -left-px w-0.5 bg-accent" transition={popover} />
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
export function CompleteButton({ slug }: { slug: string }) {
  const done = useCompletedLessons().includes(slug);
  return (
    <motion.button
      type="button"
      onClick={() => setLessonComplete(slug, !done)}
      aria-pressed={done}
      {...hoverLift}
      className={`inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-colors ${
        done ? "border border-accent bg-accent/10 text-foreground" : "bg-accent text-accent-foreground hover:opacity-90"
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
              <svg viewBox="0 0 20 20" className="size-4 text-accent" fill="currentColor" aria-hidden>
                <path d="M7.7 13.3 4.4 10l-1.1 1.1 4.4 4.4 9-9-1.1-1.1z" />
              </svg>
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
