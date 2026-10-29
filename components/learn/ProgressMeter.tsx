"use client";

import { useProgress } from "./progress";

/** A small progress bar and percentage for a set of lessons (a course or a track). Uses the current --level colour. */
export function ProgressMeter({
  ids,
  onlyIfStarted = false,
  className = "",
}: {
  ids: string[];
  /** Hide the meter until at least one lesson is complete. */
  onlyIfStarted?: boolean;
  className?: string;
}) {
  const percent = useProgress().percent(ids);
  if (ids.length === 0 || (onlyIfStarted && percent === 0)) return null;
  return (
    <div className={className}>
      <div className="flex items-center justify-between text-xs text-muted">
        <span>{percent === 0 ? "Not started" : percent === 100 ? "Completed" : "Your progress"}</span>
        <span className="font-semibold text-foreground tabular-nums">{percent}%</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-level/15">
        <div
          className="h-full origin-left rounded-full bg-level transition-transform duration-500 ease-out"
          style={{ transform: `scaleX(${percent / 100})` }}
        />
      </div>
    </div>
  );
}
