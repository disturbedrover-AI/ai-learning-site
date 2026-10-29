import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { levelStyle } from "@/lib/levels";

/**
 * How a block looks. Each block type uses its own look + hue, so they're
 * easy to tell apart at a glance (see "Block styling" in CLAUDE.md).
 */
const looks = {
  /** Thick coloured rule on the left, plain panel. */
  rule: "border border-border border-l-4 border-l-level bg-surface",
  /** Soft tint with a dashed outline. */
  tint: "border border-dashed border-level/40 bg-level/[0.06]",
  /** Soft tint with a solid outline. */
  panel: "border border-level/30 bg-level/[0.06]",
  /** Pull-quote: coloured rule and a fading tint. */
  quote: "border-l-4 border-level bg-gradient-to-r from-level/[0.12] to-transparent",
  /** Plain card with a coloured outline. */
  card: "border border-level/35 bg-surface",
  /** Dotted "instrument" background. */
  grid: "border border-border bg-surface bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:18px_18px]",
} as const;

/** The shared frame for every lesson block: an icon label, then the content. */
export function Block({
  label,
  icon: Icon,
  hue,
  look,
  children,
}: {
  label: string;
  icon: LucideIcon;
  /** A level-palette number (0–3), or "accent" for the theme's accent colour. */
  hue: number | "accent";
  look: keyof typeof looks;
  children: React.ReactNode;
}) {
  const style = hue === "accent" ? ({ "--level": "var(--accent)" } as CSSProperties) : levelStyle(hue);
  return (
    <Reveal>
      <div style={style} className={`lesson-block my-10 rounded-2xl p-5 sm:p-7 ${looks[look]}`}>
        <p className="inline-flex items-center gap-1.5 rounded-full bg-level/10 px-2.5 py-1 text-[0.7rem] font-semibold tracking-[0.12em] text-level uppercase">
          <Icon className="size-3.5" strokeWidth={2.25} aria-hidden />
          {label}
        </p>
        <div className="lesson-block-content mt-4">{children}</div>
      </div>
    </Reveal>
  );
}
