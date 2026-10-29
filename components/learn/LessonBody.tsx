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

/** Turns a lesson's MDX text into the page content. */
export async function LessonBody({ source, file }: { source: string; file: string }) {
  let Content;
  try {
    ({ default: Content } = await evaluate(source, runtime));
  } catch (error) {
    throw new Error(`${file} couldn't be read: ${(error as Error).message}`);
  }
  return <Content components={components} />;
}
