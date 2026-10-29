/**
 * The fixed lists used by news and tools (types, categories, pricing, …),
 * with their labels and colours. Shared by the server (to check content files)
 * and the browser (filters and badges), so nothing here reads files.
 *
 * Colours are palette names from lib/levels.ts (teal, blue, amber, rose, accent),
 * applied with hueStyle(); "neutral" means plain muted styling.
 */
import type { Hue } from "./levels";

type Option = { label: string; hue: Hue | "neutral" };

// ---- News ----------------------------------------------------------------
export const NEWS_TYPES = {
  model: { label: "Model", hue: "blue" },
  tool: { label: "Tool", hue: "teal" },
  research: { label: "Research", hue: "accent" },
  policy: { label: "Policy", hue: "amber" },
  tutorial: { label: "Tutorial", hue: "rose" },
  other: { label: "Other", hue: "neutral" },
} as const satisfies Record<string, Option>;
export type NewsType = keyof typeof NEWS_TYPES;

// ---- Radar (automatic headlines from feeds) --------------------------------
export const RADAR_CATEGORIES = {
  official: { label: "Official blogs", hue: "blue" },
  community: { label: "Community", hue: "amber" },
  research: { label: "Research papers", hue: "rose" },
} as const satisfies Record<string, Option>;
export type RadarCategory = keyof typeof RADAR_CATEGORIES;

// ---- Tools ---------------------------------------------------------------
export const TOOL_CATEGORIES = {
  chat: { label: "Chat", hue: "blue" },
  coding: { label: "Coding", hue: "teal" },
  images: { label: "Images", hue: "rose" },
  "audio-video": { label: "Audio & video", hue: "amber" },
  research: { label: "Research", hue: "accent" },
  agents: { label: "Agents", hue: "rose" },
  "local-models": { label: "Local models", hue: "teal" },
  learning: { label: "Learning", hue: "amber" },
  productivity: { label: "Productivity", hue: "blue" },
  other: { label: "Other", hue: "neutral" },
} as const satisfies Record<string, Option>;
export type ToolCategory = keyof typeof TOOL_CATEGORIES;

export const PRICING = { free: "Free", freemium: "Freemium", paid: "Paid" } as const;
export type Pricing = keyof typeof PRICING;

export const PLATFORMS = { web: "Web", mac: "Mac", windows: "Windows", linux: "Linux", mobile: "Mobile" } as const;
export type Platform = keyof typeof PLATFORMS;

export const DIFFICULTIES = { beginner: "Beginner", intermediate: "Intermediate", advanced: "Advanced" } as const;
export type Difficulty = keyof typeof DIFFICULTIES;

/** Two-letter logo placeholder: "Open WebUI" → "OW", "Ollama" → "OL". */
export function initials(name: string) {
  const words = name.split(/[\s-]+/).filter(Boolean);
  return (words.length > 1 ? words[0][0] + words[1][0] : name.slice(0, 2)).toUpperCase();
}
