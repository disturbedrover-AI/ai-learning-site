import Link from "next/link";
import { findGlossaryTerm } from "@/lib/content";
import { Block, Icon } from "./Block";

/**
 * <Definition term="Token">A small piece of text…</Definition>
 * Links to the glossary automatically when the term (or one of its aliases) is in it.
 * Use `glossary="file-name"` if the glossary entry has a different name.
 */
export function Definition({
  term,
  glossary,
  children,
}: {
  term: string;
  glossary?: string;
  children: React.ReactNode;
}) {
  const entry = findGlossaryTerm(glossary ?? term);
  return (
    <Block label="Definition" icon={<Icon d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5v14zM20 17v4H6.5A2.5 2.5 0 0 1 4 18.5" />}>
      <p className="text-lg font-semibold text-foreground">{term}</p>
      {children}
      {entry && (
        <Link
          href={`/learn/glossary#${entry.slug}`}
          className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
        >
          See “{entry.term}” in the glossary <span aria-hidden>→</span>
        </Link>
      )}
    </Block>
  );
}
