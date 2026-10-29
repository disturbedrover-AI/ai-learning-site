import { Reveal } from "@/components/motion/Reveal";

type Tone = "plain" | "accent" | "highlight";

const tones: Record<Tone, string> = {
  plain: "border border-border bg-surface",
  accent: "border border-accent/30 bg-accent/[0.04]",
  highlight: "border border-border border-l-4 border-l-accent bg-accent/[0.06]",
};

/** The shared frame for every lesson block: a small label, then the content. */
export function Block({
  label,
  icon,
  tone = "plain",
  children,
}: {
  label: string;
  icon: React.ReactNode;
  tone?: Tone;
  children: React.ReactNode;
}) {
  return (
    <Reveal className={`lesson-block my-8 rounded-2xl p-5 sm:p-6 ${tones[tone]}`}>
      <p className="flex items-center gap-2 text-xs font-semibold tracking-wide text-accent uppercase">
        <span aria-hidden className="flex size-5 items-center justify-center">
          {icon}
        </span>
        {label}
      </p>
      <div className="lesson-block-content mt-3">{children}</div>
    </Reveal>
  );
}

/** Small line icons for the block labels (24×24, drawn in the current text colour). */
export function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}
