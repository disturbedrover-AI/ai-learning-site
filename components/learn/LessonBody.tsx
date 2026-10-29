import Link from "next/link";
import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import type { MDXComponents } from "mdx/types";
import { slugify, textOf } from "@/lib/headings";
import { Definition } from "./blocks/Definition";
import { Explainer } from "./blocks/Explainer";
import { Quiz } from "./blocks/Quiz";
import { Example, KeyPoint, TryIt } from "./blocks/Simple";
import { Term } from "./blocks/Term";
import { ToolCard } from "./blocks/ToolCard";
import { remarkSafeMdx } from "./safeMdx";

/** Everything a lesson file can use. Plain Markdown is styled by lesson.css. */
const components: MDXComponents = {
  // Blocks
  Definition,
  Example,
  TryIt,
  KeyPoint,
  Quiz,
  Explainer,
  Term,
  ToolCard,
  // Headings get ids so the table of contents can link to them.
  h2: ({ children }) => <h2 id={slugify(textOf(children))}>{children}</h2>,
  h3: ({ children }) => <h3 id={slugify(textOf(children))}>{children}</h3>,
  // Links within the site use Next's fast navigation; others open in a new tab.
  a: ({ href = "", children }) =>
    href.startsWith("/") || href.startsWith("#") ? (
      <Link href={href}>{children}</Link>
    ) : (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
};

/**
 * Turns MDX text into page content.
 * - Files (lessons, news, tools): a mistake stops the build with a message naming the file.
 * - `safe` (text stored in the database, e.g. Lab entries): only Markdown and lesson
 *   blocks with plain values are allowed (see safeMdx.ts), and a mistake shows a
 *   notice in place of the text instead of breaking the page.
 */
export async function LessonBody({ source, file, safe = false }: { source: string; file: string; safe?: boolean }) {
  let Content;
  try {
    ({ default: Content } = await evaluate(source, { ...runtime, remarkPlugins: safe ? [remarkSafeMdx] : [] }));
  } catch (error) {
    const message = (error as Error).message.replace(/^\d+:\d+(-\d+:\d+)?: /, "");
    if (!safe) throw new Error(`${file} couldn't be read: ${message}`);
    return (
      <div role="alert" className="rounded-2xl border border-dashed border-border bg-surface px-5 py-4 text-sm text-foreground">
        <p className="font-semibold">This text has a formatting problem</p>
        <p className="mt-1 text-muted">{message}</p>
      </div>
    );
  }
  return <Content components={components} />;
}
