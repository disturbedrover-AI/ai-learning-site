"use client";

/*
 * Remembers this visitor's learning progress, in their browser only
 * (localStorage). Real accounts will replace this later.
 *
 * Lessons are tracked per track, by id "course/track/lesson" (the same as the
 * lesson's address after /learn/), so finishing a lesson in one track doesn't
 * tick it off in another.
 */
import { useSyncExternalStore } from "react";

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
    localStorage.setItem(key, JSON.stringify(value));
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

/** Ids ("course/track/lesson") of the lessons this visitor has completed. Empty until the page has loaded. */
export function useCompletedLessons(): string[] {
  return useSyncExternalStore(subscribe, readCompleted, () => noIds);
}

/** The last lesson opened in each course: { course: "course/track/lesson" }. */
export function useLastOpened(): Record<string, string> {
  return useSyncExternalStore(subscribe, readLastOpened, () => noLast);
}

export function setLessonComplete(id: string, complete: boolean) {
  const current = readCompleted().filter((i) => i !== id);
  write(COMPLETED, complete ? [...current, id] : current);
}

export function markLessonOpened(id: string) {
  const course = id.split("/")[0];
  if (readLastOpened()[course] !== id) write(LAST_OPENED, { ...readLastOpened(), [course]: id });
}

/** Share of `ids` completed, 0–100. */
export function percentDone(ids: string[], completed: string[]) {
  return ids.length ? Math.round((ids.filter((id) => completed.includes(id)).length / ids.length) * 100) : 0;
}
