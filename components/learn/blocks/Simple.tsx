import { Block, Icon } from "./Block";

/** <Example title="…">A concrete, worked example.</Example> */
export function Example({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <Block label="Example" icon={<Icon d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" />}>
      {title && <p className="font-semibold text-foreground">{title}</p>}
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
    <Block tone="accent" label="Try it yourself" icon={<Icon d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9z" />}>
      {title && <p className="font-semibold text-foreground">{title}</p>}
      {children}
      <p className="mt-5 border-t border-border pt-3 text-xs text-muted">
        Free and open-source tools only. Works on a normal laptop, no special hardware.
      </p>
    </Block>
  );
}

/** <KeyPoint>The one thing to remember.</KeyPoint> */
export function KeyPoint({ children }: { children: React.ReactNode }) {
  return (
    <Block tone="highlight" label="Key point" icon={<Icon d="M12 2l3 6.9 7 .6-5.3 4.7 1.6 7L12 17.3 5.7 21.2l1.6-7L2 9.5l7-.6z" />}>
      <div className="text-lg font-medium text-foreground">{children}</div>
    </Block>
  );
}
