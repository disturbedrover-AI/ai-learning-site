import { getTool, getTools } from "@/lib/content";
import { Reveal } from "@/components/motion/Reveal";
import { ToolCompact } from "@/components/tools/ToolParts";

/** <ToolCard slug="ollama" />: a compact card for a tool from content/tools, linking to its page. */
export function ToolCard({ slug }: { slug: string }) {
  const tool = getTool(slug);
  if (!tool) {
    throw new Error(`<ToolCard>: no tool "${slug}" in content/tools. Available: ${getTools().map((t) => t.slug).join(", ")}.`);
  }
  return (
    <Reveal className="my-8">
      <ToolCompact tool={tool} />
    </Reveal>
  );
}
