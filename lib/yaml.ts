/** A value for a frontmatter field, in double quotes (safe for text with colons or quotes). */
export const yamlString = (text: string) => `"${text.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
