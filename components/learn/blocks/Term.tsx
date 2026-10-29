import Link from "next/link";
import { findGlossaryTerm } from "@/lib/content";

/**
 * Links a word in running text to its glossary entry:
 *   <Term>tokens</Term>  or  <Term slug="token">pieces of text</Term>
 */
export function Term({ slug, children }: { slug?: string; children: React.ReactNode }) {
  const name = slug ?? (typeof children === "string" ? children : "");
  const entry = findGlossaryTerm(name) ?? findGlossaryTerm(name.replace(/s$/i, ""));
  if (!entry) {
    throw new Error(`<Term>: "${name}" isn't in the glossary. Add content/glossary/<name>.json or pass slug="…".`);
  }
  return (
    <Link
      href={`/learn/glossary#${entry.slug}`}
      title={entry.definition}
      className="glossary-term"
    >
      {children}
    </Link>
  );
}
