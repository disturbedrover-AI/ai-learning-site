"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, RotateCcw, X } from "lucide-react";
import { popover, pulse, shake } from "@/lib/motion";
import { Counter } from "@/components/motion/Counter";
import { Button } from "@/components/ui/Button";

export type QuizQuestion = {
  question: string;
  options: string[];
  /** Position of the right option, counting from 1. */
  answer: number;
  explanation?: string;
};

/** The interactive part of a Quiz: pick an option, get instant feedback, see a score at the end. */
export function QuizQuestions({ questions }: { questions: QuizQuestion[] }) {
  // The option picked for each question (0-based), or null if not answered yet.
  const [picked, setPicked] = useState<(number | null)[]>(() => questions.map(() => null));

  const isRight = (p: number | null, i: number) => p === questions[i].answer - 1;
  const answered = picked.filter((p) => p !== null).length;
  const correct = picked.filter(isRight).length;
  const done = answered === questions.length;

  return (
    <div className="mt-6 space-y-8">
      {questions.map((q, qi) => {
        const choice = picked[qi];
        const right = q.answer - 1;
        const gotIt = choice === right;
        return (
          <fieldset key={qi}>
            <legend className="font-medium text-foreground">
              <span className="mr-1 font-display font-bold text-level">{qi + 1}.</span>
              {q.question}
            </legend>
            <div className="mt-3 grid gap-2">
              {q.options.map((option, oi) => {
                const isPicked = choice === oi;
                const isAnswered = choice !== null;
                const state = !isAnswered
                  ? "border-border bg-background hover:border-level/60"
                  : oi === right
                    ? "border-success bg-success/10 text-foreground"
                    : isPicked
                      ? "border-border bg-background text-muted line-through"
                      : "border-border bg-background text-muted opacity-70";
                return (
                  <motion.button
                    key={oi}
                    type="button"
                    disabled={isAnswered}
                    aria-pressed={isPicked}
                    onClick={() => setPicked((prev) => prev.map((p, i) => (i === qi ? oi : p)))}
                    // Wrong pick: a gentle shake.
                    animate={isAnswered && isPicked && !gotIt ? shake.animate : { x: 0 }}
                    transition={shake.transition}
                    className={`relative flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors disabled:cursor-default ${state}`}
                  >
                    {/* Right pick: a soft green pulse. */}
                    {isAnswered && gotIt && oi === right && (
                      <motion.span aria-hidden className="pointer-events-none absolute inset-0 rounded-xl border-2 border-success" {...pulse} />
                    )}
                    <span
                      className={`flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                        isAnswered && oi === right ? "border-success bg-success text-background" : "border-border"
                      }`}
                    >
                      {isAnswered && oi === right ? (
                        <Check className="size-3.5" strokeWidth={3} aria-label="Correct answer" />
                      ) : isAnswered && isPicked ? (
                        <X className="size-3.5" strokeWidth={3} aria-label="Your answer" />
                      ) : (
                        String.fromCharCode(65 + oi)
                      )}
                    </span>
                    {option}
                  </motion.button>
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
                    <strong className={gotIt ? "text-success" : "text-foreground"}>
                      {gotIt ? "Correct. " : "Not quite. "}
                    </strong>
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
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={popover}
            className="flex flex-wrap items-center gap-5 rounded-2xl border border-level/30 bg-background p-5"
          >
            <p className="font-display text-4xl font-bold text-level" aria-label={`${correct} out of ${questions.length}`}>
              <Counter value={correct} />
              <span className="text-2xl text-muted">/{questions.length}</span>
            </p>
            <div className="min-w-40 flex-1">
              <div className="flex gap-1" aria-hidden>
                {picked.map((p, i) => (
                  <span key={i} className={`h-1.5 flex-1 rounded-full ${isRight(p, i) ? "bg-success" : "bg-border"}`} />
                ))}
              </div>
              <p className="mt-2 text-sm text-foreground">
                {correct === questions.length ? "Perfect score. Nicely done." : "Have another look at the sections above."}
              </p>
            </div>
            <Button variant="secondary" className="px-4 py-2" onClick={() => setPicked(questions.map(() => null))}>
              <RotateCcw className="size-4" aria-hidden /> Try again
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
