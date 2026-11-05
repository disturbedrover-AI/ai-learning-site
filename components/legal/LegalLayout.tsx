import type { ReactNode } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";

/** Shared shell for the plain-text legal pages (/privacy, /terms). */
export function LegalLayout({
  title,
  description,
  updated,
  children,
}: {
  title: string;
  description: string;
  /** ISO date (YYYY-MM-DD) these terms were last changed. */
  updated: string;
  children: ReactNode;
}) {
  const updatedLabel = new Date(`${updated}T00:00:00`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 sm:px-6">
      <PageHeader eyebrow="Legal" title={title} description={description} />
      <p className="text-sm text-muted">
        Last updated <time dateTime={updated}>{updatedLabel}</time>. We may update this page from time to time.
      </p>
      <div className="mt-10 space-y-10">{children}</div>
    </div>
  );
}

/** One titled block of legal copy. */
export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-bold text-foreground">{title}</h2>
      <div className="space-y-3 leading-relaxed text-muted">{children}</div>
    </section>
  );
}

/** A link styled for inside legal copy — internal (Link) or external/mailto (anchor). */
export function LegalLink({ href, children }: { href: string; children: ReactNode }) {
  const className = "font-medium text-foreground underline underline-offset-2 transition-colors hover:text-accent";
  return href.startsWith("/") ? (
    <Link href={href} className={className}>
      {children}
    </Link>
  ) : (
    <a href={href} className={className}>
      {children}
    </a>
  );
}
