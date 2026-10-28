export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`h-full rounded-2xl border border-border bg-surface p-6 transition-colors ${className}`}>
      {children}
    </div>
  );
}

export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-background px-2.5 py-0.5 text-xs text-muted">
      {children}
    </span>
  );
}
