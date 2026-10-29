import { explainers } from "@/components/explainers/registry";
import { findGlossaryTerm, getTool } from "@/lib/content";

/*
 * "Safe" MDX, for text written on the site (Lab entries) rather than in files.
 * MDX can normally run JavaScript ({…} expressions, import/export) and render any
 * HTML tag, which is fine for lesson files you write yourself but not for text
 * stored in a database. In safe mode only these are allowed:
 *   - plain Markdown;
 *   - the lesson blocks below, with plain text values (name="…", not name={…}).
 * Anything else is rejected with a message saying which line to fix.
 * (Quiz needs a {…} list of questions, so it isn't available here.)
 */

export const SAFE_BLOCKS = ["Definition", "Example", "TryIt", "KeyPoint", "Explainer", "Term", "ToolCard"] as const;

type Node = {
  type: string;
  name?: string | null;
  attributes?: { type: string; name?: string; value?: unknown }[];
  children?: Node[];
  position?: { start: { line: number } };
};

function problem(node: Node, message: string): never {
  const line = node.position?.start.line;
  throw new Error(line ? `Line ${line}: ${message}` : message);
}

function textOf(node: Node): string {
  return (node as { value?: string }).value ?? (node.children ?? []).map(textOf).join("");
}

function check(node: Node) {
  switch (node.type) {
    case "mdxjsEsm":
      problem(node, "import/export lines aren't allowed in the Lab.");
    case "mdxFlowExpression":
    case "mdxTextExpression":
      problem(node, "{curly-brace} code isn't allowed in the Lab. Use `{` in backticks to show a brace.");
    case "mdxJsxFlowElement":
    case "mdxJsxTextElement": {
      const name = node.name ?? "";
      if (!(SAFE_BLOCKS as readonly string[]).includes(name)) {
        problem(node, `<${name || "…"}> isn't available in the Lab. You can use: ${SAFE_BLOCKS.join(", ")}.`);
      }
      const props: Record<string, string> = {};
      for (const attr of node.attributes ?? []) {
        if (attr.type !== "mdxJsxAttribute" || (attr.value !== null && typeof attr.value !== "string")) {
          problem(node, `<${name}> values must be plain text in quotes, like name="tokenization".`);
        }
        props[attr.name ?? ""] = (attr.value as string | null) ?? "";
      }
      // Catch mistakes that would otherwise break the page.
      if (name === "Explainer" && !explainers[props.name]) {
        problem(node, `no explainer called "${props.name ?? ""}". Available: ${Object.keys(explainers).join(", ")}.`);
      }
      if (name === "ToolCard" && !getTool(props.slug ?? "")) {
        problem(node, `no tool "${props.slug ?? ""}" in content/tools.`);
      }
      if (name === "Term") {
        const term = props.slug ?? textOf(node);
        if (!findGlossaryTerm(term) && !findGlossaryTerm(term.replace(/s$/i, ""))) {
          problem(node, `"${term}" isn't in the glossary.`);
        }
      }
      break;
    }
  }
  node.children?.forEach(check);
}

/** The remark plugin that enforces the rules above. */
export function remarkSafeMdx() {
  return (tree: Node) => check(tree);
}
