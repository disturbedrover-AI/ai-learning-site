/**
 * The Lab's content model, shared by the server (pages, actions) and the
 * browser (editor). The data itself lives in Supabase (see
 * supabase/migrations/20261030120000_lab.sql), not in content/, because it's private.
 */
import type { Hue } from "@/lib/levels";

export const LAB_KINDS = {
  experiment: { label: "Experiment", hue: "teal" },
  tip: { label: "Tip", hue: "amber" },
  note: { label: "Note", hue: "blue" },
  snippet: { label: "Snippet", hue: "rose" },
} as const satisfies Record<string, { label: string; hue: Hue }>;
export type LabKind = keyof typeof LAB_KINDS;

/** In the order they're shown on /lab. Members never see drafts. */
export const LAB_STATUSES = {
  active: { label: "Active", hue: "teal" },
  draft: { label: "Draft", hue: "accent" },
  done: { label: "Done", hue: "blue" },
  archived: { label: "Archived", hue: "accent" },
} as const satisfies Record<string, { label: string; hue: Hue }>;
export type LabStatus = keyof typeof LAB_STATUSES;

export type LabLink = { url: string; label: string };

export type LabEntry = {
  id: string;
  kind: LabKind;
  title: string;
  slug: string;
  body: string;
  status: LabStatus;
  tags: string[];
  collection: string | null;
  pinned: boolean;
  created_at: string;
  updated_at: string;
  links: LabLink[];
};

/** What the editor sends to save. `id` is missing for a new entry. */
export type LabEntryInput = {
  id?: string;
  kind: LabKind;
  title: string;
  body: string;
  status: LabStatus;
  tags: string[];
  collection: string;
  pinned: boolean;
  links: LabLink[];
};

/** Sections every experiment uses, in order. */
export const EXPERIMENT_SECTIONS = ["Goal", "Setup", "What I tried", "Result", "Learnings", "Next"] as const;

export const EXPERIMENT_TEMPLATE = EXPERIMENT_SECTIONS.map((s) => `## ${s}\n\n`).join("");

/** Words that can't be entry slugs, because /lab/<word> is already a page. */
export const RESERVED_SLUGS = ["new", "members"];
