/**
 * MOTION PRESETS
 * --------------
 * Every animation on the site comes from this file, so the whole site moves
 * the same way. Use the ready-made wrappers in components/motion/ (Reveal,
 * Stagger, Lift) rather than these values directly where you can.
 *
 * Rules: subtle and fast (0.2–0.5s), no parallax, no 3D, no page transitions.
 * "Reduce motion" is handled globally in components/theme/ThemeProvider.tsx.
 */
import type { TargetAndTransition, Transition, Variants } from "framer-motion";

/** Durations in seconds. Nothing on the site should be slower than `slow`. */
export const duration = { fast: 0.2, base: 0.3, slow: 0.45 } as const;

/** A soft "ease out": quick start, gentle landing. */
export const ease = [0.22, 1, 0.36, 1] as const;

/** Reveal-on-scroll settings: animate once, slightly before fully in view. */
export const viewportOnce = { once: true, margin: "0px 0px -60px 0px" } as const;

// An explicit delay would override a parent Stagger's timing, so only add one when given.
const enter = (delay?: number): Transition => ({ duration: duration.slow, ease, ...(delay ? { delay } : {}) });

/** Fade and slide up a little. The site's standard entrance. Pass a delay via `custom`. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: (delay?: number) => ({ opacity: 1, y: 0, transition: enter(delay) }),
};

/** Fade only, for backgrounds and things that shouldn't move. */
export const fade: Variants = {
  hidden: { opacity: 0 },
  show: (delay?: number) => ({ opacity: 1, transition: enter(delay) }),
};

/** Parent of a list: shows its children one after another. */
export const stagger = (gap = 0.06, delay = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: gap, delayChildren: delay } },
});

/** Gentle lift on hover, slight press on click. For cards and buttons. */
export const hoverLift = {
  whileHover: { y: -3 },
  whileTap: { y: 0, scale: 0.98 },
  transition: { duration: duration.fast, ease },
} as const;

/** Things that slide between positions, like the active-link indicator. */
export const slide: Transition = { type: "spring", bounce: 0, duration: duration.base };

/** Opening and closing small panels (menus, dropdowns, answers). */
export const popover: Transition = { duration: duration.fast, ease: "easeOut" };

/** Number counters (token count, quiz score, reading %). */
export const count: Transition = { duration: duration.slow, ease };

/** Wrong answer: a small side-to-side shake. */
export const shake: { animate: TargetAndTransition; transition: Transition } = {
  animate: { x: [0, -6, 6, -4, 4, 0] },
  transition: { duration: duration.slow, ease: "easeInOut" },
};

/** Right answer: a soft ring that grows and fades. Use on an absolutely placed outline. */
export const pulse: { initial: TargetAndTransition; animate: TargetAndTransition; transition: Transition } = {
  initial: { opacity: 0.7, scale: 1 },
  animate: { opacity: 0, scale: 1.04 },
  transition: { duration: duration.slow, ease },
};

/** Card flip (the only 3D motion on the site: tokenizer chips). Combine with `cascade` for a ripple. */
export const flip: Transition = { duration: duration.slow, ease };

/** A small, slightly springy pop for chips appearing. */
export const pop: Transition = { type: "spring", bounce: 0.35, duration: duration.base };

/** Delay for item `i` in a ripple (chips appearing or flipping one after another), capped so long lists stay quick. */
export const cascade = (i: number) => Math.min(i * 0.035, 0.5);

/**
 * Ambient background motion (the constellation motif). The one exception to
 * the 0.2–0.5s rule: very slow, continuous, and only for decoration.
 * `cycle` is the seconds for one full drift; `distance` is how far nodes wander (in SVG units).
 */
export const ambient = { cycle: 18, distance: 2.2 } as const;

/**
 * Cross-fades the whole page while `update` changes the theme.
 * Uses the browser's View Transitions; falls back to an instant change when
 * they aren't supported or the visitor prefers reduced motion.
 * The fade length is set in globals.css (::view-transition-*).
 */
export function crossFade(update: () => void) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !document.startViewTransition) {
    update();
    return;
  }
  // The browser may skip the fade (e.g. while the page is still loading); the theme still changes.
  document.startViewTransition(update).ready.catch(() => {});
}
