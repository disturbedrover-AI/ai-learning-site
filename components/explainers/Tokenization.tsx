"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Binary, Type } from "lucide-react";
import { cascade, flip, pop, popover } from "@/lib/motion";
import { levelStyle } from "@/lib/levels";
import { Counter } from "@/components/motion/Counter";

/*
 * A simplified tokenizer, for learning. Real tokenizers learn their pieces
 * from huge amounts of text; this one copies their main habits:
 *   - a space is glued to the start of the word after it,
 *   - common words stay whole, longer or rarer words break into pieces,
 *   - punctuation and numbers get their own tokens.
 */
const COMMON = new Set(
  (
    "the a an and or but if so is are was were be been to of in on at for with as by from it its this that " +
    "these those i you he she we they me my your our their not no yes do does did have has had can will would " +
    "could should what how why when where who which up out about into than then just like all some any one two " +
    "new good great make made word words model models language learn learning computer people time day read " +
    "write text think know see use used very much more most many each every other only also hello world"
  ).split(" "),
);
const SUFFIXES = ["ization", "ation", "tion", "sion", "ness", "ment", "able", "ible", "ing", "ful", "less", "ous", "ive", "est", "ed", "ly", "er", "s"];

function splitWord(word: string): string[] {
  const lower = word.toLowerCase();
  if (word.length <= 7 || COMMON.has(lower)) return [word];
  for (const suffix of SUFFIXES) {
    if (lower.endsWith(suffix) && word.length - suffix.length >= 3) {
      return [...splitWord(word.slice(0, -suffix.length)), word.slice(-suffix.length)];
    }
  }
  const pieces = word.match(/.{1,4}/g) ?? [word];
  // Fold a tiny last piece into the one before it.
  if (pieces.length > 1 && pieces[pieces.length - 1].length < 3) {
    pieces[pieces.length - 2] += pieces.pop();
  }
  return pieces;
}

function tokenize(text: string): string[] {
  const chunks = text.match(/ ?\p{L}+| ?\p{N}{1,3}| ?[^\s\p{L}\p{N}]+|\s+(?!\S)|\s+/gu) ?? [];
  return chunks.flatMap((chunk) => {
    const space = chunk.startsWith(" ") && chunk.trim() ? " " : "";
    const body = chunk.slice(space.length);
    if (!/^\p{L}+$/u.test(body)) return [chunk];
    const [first, ...rest] = splitWord(body);
    return [space + first, ...rest];
  });
}

/** A stable made-up ID per token, standing in for the model's vocabulary number. */
function tokenId(token: string) {
  let hash = 2166136261;
  for (const char of token) hash = Math.imul(hash ^ char.codePointAt(0)!, 16777619);
  return (hash >>> 0) % 50000;
}

const SAMPLES = [
  "Tokenization turns your words into numbers!",
  "I'm learning how language models read text.",
  "Unbelievably, 2026 chatbots predict one token at a time.",
];

/** One token: a coloured chip that flips over to show its ID. */
function Chip({ token, index, flipped, ripple }: { token: string; index: number; flipped: boolean; ripple: boolean }) {
  const face =
    "[grid-area:1/1] flex items-center justify-center rounded-lg border px-2 py-1 font-mono text-sm whitespace-pre [backface-visibility:hidden]";
  return (
    <motion.span
      layout
      initial={{ opacity: 0, y: 10, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85, transition: popover }}
      transition={{ ...pop, delay: ripple ? cascade(index) : 0 }}
      // Chips cycle through the four level colours.
      style={levelStyle(index)}
      className="[perspective:600px]"
    >
      <motion.span
        className="grid [transform-style:preserve-3d]"
        initial={false}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ ...flip, delay: cascade(index) }}
      >
        <span className={`${face} border-level/30 bg-level/12 text-foreground`}>
          {token.startsWith(" ") && (
            <span className="mr-0.5 text-level" aria-hidden>
              ·
            </span>
          )}
          {token.replace(/^ /, "").replace(/\n/g, "↵")}
        </span>
        <span className={`${face} border-level bg-level font-semibold text-background [transform:rotateY(180deg)]`}>
          {tokenId(token)}
        </span>
      </motion.span>
    </motion.span>
  );
}

export default function Tokenization() {
  const inputId = useId();
  const [text, setText] = useState(SAMPLES[0]);
  const [showIds, setShowIds] = useState(false);
  // Picking a sample ripples all chips in one after another; typing just adds the new ones.
  const [ripple, setRipple] = useState(true);
  const tokens = tokenize(text);

  return (
    <div>
      <p className="font-display text-xl font-bold text-foreground">Watch a sentence turn into tokens</p>
      <p className="mt-1 text-sm text-muted">Type anything below. Each coloured chip is one token.</p>

      <label htmlFor={inputId} className="sr-only">
        Text to split into tokens
      </label>
      <textarea
        id={inputId}
        value={text}
        maxLength={200}
        rows={2}
        onChange={(e) => {
          setRipple(false);
          setText(e.target.value);
        }}
        className="mt-5 w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground outline-none transition-colors focus:border-accent"
      />

      <div className="mt-2 flex flex-wrap gap-2">
        {SAMPLES.map((sample) => (
          <button
            key={sample}
            type="button"
            onClick={() => {
              setRipple(true);
              setText(sample);
            }}
            className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted transition-colors hover:border-accent hover:text-foreground"
          >
            {sample.length > 28 ? `${sample.slice(0, 26)}…` : sample}
          </button>
        ))}
      </div>

      <div
        aria-live="polite"
        aria-label={`${tokens.length} tokens`}
        className="mt-5 flex min-h-15 flex-wrap content-start gap-1.5 rounded-2xl border border-border bg-background p-4"
      >
        <AnimatePresence mode="popLayout">
          {tokens.map((token, i) => (
            <Chip key={`${i}:${token}`} token={token} index={i} flipped={showIds} ripple={ripple} />
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-baseline gap-4 text-sm text-muted">
          <p>
            <Counter value={text.length} className="font-display text-2xl font-bold text-foreground" /> characters
          </p>
          <span aria-hidden>→</span>
          <p>
            <Counter value={tokens.length} className="font-display text-2xl font-bold text-foreground" /> tokens
          </p>
        </div>
        <button
          type="button"
          aria-pressed={showIds}
          onClick={() => setShowIds((v) => !v)}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:border-accent"
        >
          {showIds ? <Type className="size-4" aria-hidden /> : <Binary className="size-4" aria-hidden />}
          {showIds ? "Show as text" : "Show what the model sees"}
        </button>
      </div>

      <p className="mt-4 text-xs text-muted">
        A dot (·) marks a space that belongs to the token. This is a simplified tokenizer: real models learn their own
        pieces from data, so their exact splits differ, but the idea is the same.
      </p>
    </div>
  );
}
