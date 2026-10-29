"use client";

/*
 * Remembers which lessons this visitor has finished, in their browser only
 * (localStorage). Real accounts will replace this later.
 */
import { useSyncExternalStore } from "react";

const KEY = "completed-lessons";
const CHANGE = "completed-lessons-change";
const none: string[] = [];

let lastRaw: string | null = null;
let lastValue: string[] = none;

function read(): string[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    return none;
  }
  // Only parse when the stored text changed, so React sees a stable list.
  if (raw !== lastRaw) {
    lastRaw = raw;
    try {
      const parsed = JSON.parse(raw ?? "[]");
      lastValue = Array.isArray(parsed) ? parsed.map(String) : none;
    } catch {
      lastValue = none;
    }
  }
  return lastValue;
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange); // other tabs
  window.addEventListener(CHANGE, onChange); // this tab
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE, onChange);
  };
}

/** Slugs of the lessons this visitor has marked complete. Empty until the page has loaded. */
export function useCompletedLessons(): string[] {
  return useSyncExternalStore(subscribe, read, () => none);
}

export function setLessonComplete(slug: string, complete: boolean) {
  const current = read().filter((s) => s !== slug);
  try {
    localStorage.setItem(KEY, JSON.stringify(complete ? [...current, slug] : current));
  } catch {
    // Storage unavailable (e.g. private mode): nothing to remember.
  }
  window.dispatchEvent(new Event(CHANGE));
}
