import { hueStyle } from "@/lib/levels";
import { LAB_KINDS, LAB_STATUSES, type LabKind, type LabStatus } from "@/lib/lab/model";

/** The entry's kind (Experiment, Tip, …) in its own colour. */
export function KindBadge({ kind }: { kind: LabKind }) {
  return (
    <span
      style={hueStyle(LAB_KINDS[kind].hue)}
      className="inline-flex items-center rounded-full bg-level/10 px-2 py-0.5 text-xs font-semibold text-level"
    >
      {LAB_KINDS[kind].label}
    </span>
  );
}

/** Draft, Active, Done or Archived. */
export function StatusBadge({ status }: { status: LabStatus }) {
  const muted = status === "archived" || status === "draft";
  return (
    <span
      style={hueStyle(LAB_STATUSES[status].hue)}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-semibold ${
        muted ? "border-dashed border-border text-muted" : "border-level/40 text-level"
      }`}
    >
      <span aria-hidden className={`size-1.5 rounded-full ${muted ? "bg-border" : "bg-level"}`} />
      {LAB_STATUSES[status].label}
    </span>
  );
}

export const formatLabDate = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));
