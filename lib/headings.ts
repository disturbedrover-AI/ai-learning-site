/** Turns heading text into a web-address-friendly id: "What is AI?" → "what-is-ai". */
export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export type Heading = { id: string; text: string; depth: 2 | 3 };

/** Finds the ## and ### headings in a lesson's text, for the table of contents. */
export function getHeadings(markdown: string): Heading[] {
  const headings: Heading[] = [];
  let inCode = false;
  for (const line of markdown.split("\n")) {
    if (line.trimStart().startsWith("```")) inCode = !inCode;
    const match = !inCode && /^(##|###)\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match) continue;
    // Drop markdown formatting: **bold**, `code`, [links](url).
    const text = match[2].replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/[*_`]/g, "");
    headings.push({ id: slugify(text), text, depth: match[1].length as 2 | 3 });
  }
  return headings;
}

/** The plain text inside some React children (used to give rendered headings the same ids). */
export function textOf(node: React.ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (node && typeof node === "object" && "props" in node) {
    return textOf((node.props as { children?: React.ReactNode }).children);
  }
  return "";
}
