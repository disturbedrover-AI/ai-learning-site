/** A toggle pill for filters. `aria-pressed` tells screen readers whether it's on. */
export function Chip({
  active,
  small = false,
  onClick,
  children,
}: {
  active: boolean;
  small?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-full border font-semibold whitespace-nowrap transition-colors ${
        small ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-xs"
      } ${active ? "border-accent bg-accent text-accent-foreground" : "border-border text-muted hover:text-foreground"}`}
    >
      {children}
    </button>
  );
}
