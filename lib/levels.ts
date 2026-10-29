import type { CSSProperties } from "react";

/**
 * Picks one of the four level colours (--level-0 … --level-3 in themes.css)
 * for an element and everything inside it. Then use the Tailwind classes
 * text-level, bg-level/10, border-level, ring-level/20, etc.
 *
 * The same four hues are the palette for lesson blocks and explainers, so
 * pass any whole number: it wraps around (4 → level 0's colour).
 */
export function levelStyle(level: number): CSSProperties {
  const hue = ((level % 4) + 4) % 4;
  return { "--level": `var(--level-${hue})` } as CSSProperties;
}

/** Colours a course can use as its accent: the four level hues, or the theme's accent. */
export const HUES = ["teal", "blue", "amber", "rose", "accent"] as const;
export type Hue = (typeof HUES)[number];

/** Like levelStyle, but for a course's accent colour (so text-level, bg-level/10, … use it). */
export function hueStyle(hue: Hue): CSSProperties {
  return { "--level": hue === "accent" ? "var(--accent)" : `var(--level-${HUES.indexOf(hue)})` } as CSSProperties;
}
