import { FlaskConical, Lightbulb, Sparkles } from "lucide-react";
import { Block } from "./Block";

/** <Example title="…">A concrete, worked example.</Example> */
export function Example({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <Block label="Example" icon={Lightbulb} hue={2} look="tint">
      {title && <p className="font-display text-xl font-bold text-foreground">{title}</p>}
      {children}
    </Block>
  );
}

/**
 * <TryIt title="…">
 * 1. First step
 * 2. Second step
 * </TryIt>
 * Steps written as a numbered list show as numbered circles.
 */
export function TryIt({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <Block label="Try it yourself" icon={FlaskConical} hue={0} look="panel">
      {title && <p className="font-display text-xl font-bold text-foreground">{title}</p>}
      {children}
      <p className="mt-6 border-t border-level/20 pt-3 text-xs text-muted">
        Free and open-source tools only. Works on a normal laptop, no special hardware.
      </p>
    </Block>
  );
}

/** <KeyPoint>The one thing to remember.</KeyPoint> */
export function KeyPoint({ children }: { children: React.ReactNode }) {
  return (
    <Block label="Key point" icon={Sparkles} hue="accent" look="quote">
      <div className="font-display text-xl leading-snug font-semibold text-foreground sm:text-2xl">{children}</div>
    </Block>
  );
}
