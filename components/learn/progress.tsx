"use client";

/*
 * LEARNING PROGRESS
 * -----------------
 * Pages only ever use `useProgress()`. Behind it are two places to keep progress:
 *   - signed out: this browser (localStorage), as before accounts existed;
 *   - signed in: the visitor's account (Supabase table lesson_progress).
 * On sign-in, anything saved in this browser is copied into the account, then
 * cleared from the browser (only after the copy succeeds, so nothing is lost).
 *
 * Lessons are tracked per track, by id "course/track/lesson" (the same as the
 * lesson's address after /learn/), so finishing a lesson in one track doesn't
 * tick it off in another.
 */
import { createContext, useCallback, useContext, useEffect, useState, useSyncExternalStore } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/AuthProvider";

type State = {
  /** Ids of completed lessons. */
  completed: string[];
  /** The last lesson opened in each course: { course: id }. */
  lastOpened: Record<string, string>;
};

export type Progress = State & {
  isComplete: (id: string) => boolean;
  setComplete: (id: string, complete: boolean) => void;
  markOpened: (id: string) => void;
  /** Share of `ids` completed, 0–100. */
  percent: (ids: string[]) => number;
  /** Forget all progress (this browser, or the account when signed in). */
  clearAll: () => Promise<void>;
  /** True when progress is saved to an account rather than this browser. */
  synced: boolean;
};

// ---------------------------------------------------------------------------
// This browser (localStorage)
// ---------------------------------------------------------------------------
const COMPLETED = "learn-completed"; // list of lesson ids
const LAST_OPENED = "learn-last-opened"; // { course: lesson id }
const CHANGE = "learn-progress-change";

// Parsed values are cached per key so React sees a stable value until the stored text changes.
const cache = new Map<string, { raw: string | null; value: unknown }>();

function read<T>(key: string, fallback: T, valid: (v: unknown) => boolean): T {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(key);
  } catch {
    return fallback;
  }
  const hit = cache.get(key);
  if (hit && hit.raw === raw) return hit.value as T;
  let value: T = fallback;
  try {
    const parsed = JSON.parse(raw ?? "null");
    if (valid(parsed)) value = parsed as T;
  } catch {}
  cache.set(key, { raw, value });
  return value;
}

function write(key: string, value: unknown) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable (e.g. private mode): nothing to remember.
  }
  window.dispatchEvent(new Event(CHANGE));
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange); // other tabs
  window.addEventListener(CHANGE, onChange); // this tab
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE, onChange);
  };
}

const noIds: string[] = [];
const noLast: Record<string, string> = {};
const readCompleted = () => read(COMPLETED, noIds, Array.isArray);
const readLastOpened = () => read(LAST_OPENED, noLast, (v) => !!v && typeof v === "object" && !Array.isArray(v));

const local = {
  setComplete(id: string, complete: boolean) {
    const current = readCompleted().filter((i) => i !== id);
    write(COMPLETED, complete ? [...current, id] : current);
  },
  markOpened(id: string) {
    const course = id.split("/")[0];
    if (readLastOpened()[course] !== id) write(LAST_OPENED, { ...readLastOpened(), [course]: id });
  },
  clear() {
    write(COMPLETED, null);
    write(LAST_OPENED, null);
  },
};

// ---------------------------------------------------------------------------
// The visitor's account (Supabase)
// ---------------------------------------------------------------------------
type Row = {
  course_slug: string;
  track_slug: string;
  lesson_slug: string;
  completed_at: string | null;
  last_opened_at: string | null;
};

const keysOf = (id: string) => {
  const [course_slug, track_slug, lesson_slug] = id.split("/");
  return { course_slug, track_slug, lesson_slug };
};
const idOf = (r: Row) => `${r.course_slug}/${r.track_slug}/${r.lesson_slug}`;
const ON_CONFLICT = "user_id,course_slug,track_slug,lesson_slug";

function toState(rows: Row[]): State {
  const newest: Record<string, Row> = {};
  for (const r of rows) {
    if (r.last_opened_at && (!newest[r.course_slug] || r.last_opened_at > newest[r.course_slug].last_opened_at!)) {
      newest[r.course_slug] = r;
    }
  }
  return {
    completed: rows.filter((r) => r.completed_at).map(idOf),
    lastOpened: Object.fromEntries(Object.entries(newest).map(([course, r]) => [course, idOf(r)])),
  };
}

async function fetchRows(supabase: SupabaseClient): Promise<Row[]> {
  const { data, error } = await supabase
    .from("lesson_progress")
    .select("course_slug, track_slug, lesson_slug, completed_at, last_opened_at");
  if (error) throw error;
  return data ?? [];
}

/**
 * Copies this browser's progress into the account, then clears it from the browser.
 * Completions are added where the account doesn't have them; a course's
 * last-opened lesson is added only if the account has none for that course.
 * Each kind is written separately so neither can blank out the other's column.
 */
async function mergeLocalInto(supabase: SupabaseClient, userId: string, rows: Row[]) {
  const completed = readCompleted();
  const lastOpened = readLastOpened();
  if (completed.length === 0 && Object.keys(lastOpened).length === 0) return false;

  const now = new Date().toISOString();
  const doneRemotely = new Set(rows.filter((r) => r.completed_at).map(idOf));
  const completions = completed
    .filter((id) => !doneRemotely.has(id))
    .map((id) => ({ user_id: userId, ...keysOf(id), completed_at: now }));
  const opens = Object.entries(lastOpened)
    .filter(([course]) => !rows.some((r) => r.course_slug === course && r.last_opened_at))
    .map(([, id]) => ({ user_id: userId, ...keysOf(id), last_opened_at: now }));

  const batches: Record<string, unknown>[][] = [completions, opens];
  for (const batch of batches) {
    if (batch.length === 0) continue;
    const { error } = await supabase.from("lesson_progress").upsert(batch, { onConflict: ON_CONFLICT });
    if (error) throw error; // Keep the browser copy; we'll try again next time.
  }
  local.clear();
  return true;
}

// ---------------------------------------------------------------------------
// The one hook pages use
// ---------------------------------------------------------------------------
const ProgressContext = createContext<Progress | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id;

  const localState: State = {
    completed: useSyncExternalStore(subscribe, readCompleted, () => noIds),
    lastOpened: useSyncExternalStore(subscribe, readLastOpened, () => noLast),
  };

  // The account's progress, tagged with whose it is so a previous user's never shows.
  const [remote, setRemote] = useState<(State & { userId: string }) | null>(null);

  const load = useCallback(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase || !userId) return () => {};
    let cancelled = false;
    (async () => {
      let rows = await fetchRows(supabase);
      if (await mergeLocalInto(supabase, userId, rows)) rows = await fetchRows(supabase);
      return toState(rows);
    })().then(
      (state) => !cancelled && setRemote({ userId, ...state }),
      (error) => console.error("Couldn't load your progress:", error),
    );
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Load (and merge this browser's progress) whenever someone signs in.
  useEffect(load, [load]);

  const signedIn = !!userId;
  const state: State = signedIn
    ? remote?.userId === userId
      ? remote
      : { completed: noIds, lastOpened: noLast }
    : localState;

  const save = useCallback(
    async (row: Record<string, unknown>) => {
      const supabase = getSupabaseBrowser();
      if (!supabase || !userId) return;
      const { error } = await supabase
        .from("lesson_progress")
        .upsert({ user_id: userId, ...row }, { onConflict: ON_CONFLICT });
      if (error) {
        console.error("Couldn't save your progress:", error);
        void load(); // Show what's really saved.
      }
    },
    [userId, load],
  );

  const setComplete = (id: string, complete: boolean) => {
    if (!signedIn) return local.setComplete(id, complete);
    // Update the screen straight away, then save.
    setRemote((r) =>
      r && {
        ...r,
        completed: complete ? [...r.completed.filter((i) => i !== id), id] : r.completed.filter((i) => i !== id),
      },
    );
    void save({ ...keysOf(id), completed_at: complete ? new Date().toISOString() : null });
  };

  const markOpened = (id: string) => {
    if (!signedIn) return local.markOpened(id);
    const course = id.split("/")[0];
    setRemote((r) => (r && r.lastOpened[course] !== id ? { ...r, lastOpened: { ...r.lastOpened, [course]: id } } : r));
    void save({ ...keysOf(id), last_opened_at: new Date().toISOString() });
  };

  const clearAll = async () => {
    const supabase = getSupabaseBrowser();
    if (!signedIn || !supabase) return local.clear();
    const { error } = await supabase.from("lesson_progress").delete().eq("user_id", userId);
    if (error) throw error;
    setRemote({ userId, completed: noIds, lastOpened: noLast });
  };

  const value: Progress = {
    ...state,
    isComplete: (id) => state.completed.includes(id),
    setComplete,
    markOpened,
    percent: (ids) =>
      ids.length ? Math.round((ids.filter((id) => state.completed.includes(id)).length / ids.length) * 100) : 0,
    clearAll,
    synced: signedIn,
  };

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

/** The visitor's learning progress. The only way pages read or change progress. */
export function useProgress(): Progress {
  const progress = useContext(ProgressContext);
  if (!progress) throw new Error("useProgress must be used inside <ProgressProvider>.");
  return progress;
}
