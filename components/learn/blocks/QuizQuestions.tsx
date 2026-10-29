"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { popover } from "@/lib/motion";
import { Button } from "@/components/ui/Button";

export type QuizQuestion = {
  question: string;
  options: string[];
  /** Position of the right option, counting from 1. */
  answer: number;
  explanation?: string;
};

/** The interactive part of a Quiz: pick an option, get instant feedback. */
export function QuizQuestions({ questions }: { questions: QuizQuestion[] }) {
  // The option picked for each question (0-based), or null if not answered yet.
  const [picked, setPicked] = useState<(number | null)[]>(() => questions.map(() => null));

  const answered = picked.filter((p) => p !== null).length;
  const correct = picked.filter((p, i) => p === questions[i].answer - 1).length;
  const done = answered === questions.length;

  return (
    <div className="mt-4 space-y-6">
      {questions.map((q, qi) => {
        const choice = picked[qi];
        const right = q.answer - 1;
        return (
          <fieldset key={qi}>
            <legend className="font-medium text-foreground">
              <span className="text-muted">{qi + 1}. </span>
              {q.question}
            </legend>
            <div className="mt-3 grid gap-2">
              {q.options.map((option, oi) => {
                const isPicked = choice === oi;
                const state =
                  choice === null
                    ? "border-border bg-background hover:border-accent"
                    : oi === right
                      ? "border-accent bg-accent/10 text-foreground"
                      : isPicked
                        ? "border-border bg-background text-muted line-through"
                        : "border-border bg-background text-muted";
                return (
                  <button
                    key={oi}
                    type="button"
                    disabled={choice !== null}
                    aria-pressed={isPicked}
                    onClick={() => setPicked((prev) => prev.map((p, i) => (i === qi ? oi : p)))}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 text-left text-sm transition-colors disabled:cursor-default ${state}`}
                  >
                    <span
                      className={`flex size-6 shrink-0 items-center justify-center rounded-full border text-xs ${
                        choice !== null && oi === right ? "border-accent bg-accent text-accent-foreground" : "border-border"
                      }`}
                    >
                      {choice !== null && oi === right ? "✓" : choice !== null && isPicked ? "✕" : String.fromCharCode(65 + oi)}
                    </span>
                    {option}
                  </button>
                );
              })}
            </div>
            <AnimatePresence>
              {choice !== null && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={popover}
                  className="overflow-hidden text-sm text-muted"
                  role="status"
                >
                  <span className="mt-3 block">
                    <strong className="text-foreground">{choice === right ? "Correct. " : "Not quite. "}</strong>
                    {q.explanation}
                  </span>
                </motion.p>
              )}
            </AnimatePresence>
          </fieldset>
        );
      })}

      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={popover}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3"
          >
            <p className="text-sm text-foreground">
              You got <strong>{correct}</strong> of {questions.length} right.
              {correct === questions.length ? " Nicely done." : " Have another look at the sections above."}
            </p>
            <Button variant="secondary" className="px-4 py-2" onClick={() => setPicked(questions.map(() => null))}>
              Try again
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
