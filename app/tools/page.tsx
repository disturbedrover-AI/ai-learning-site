import type { Metadata } from "next";
import { ToolsBrowser } from "@/components/tools/ToolsBrowser";
import type { ToolSummary } from "@/components/tools/ToolParts";
import { PageHeader } from "@/components/ui/PageHeader";
import { getTools, withoutBody } from "@/lib/content";

export const metadata: Metadata = { title: "Tools" };

export default function ToolsPage() {
  // Only what the cards need, so the full text isn't sent to the browser.
  const tools: ToolSummary[] = getTools().map(withoutBody);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
      <PageHeader
        eyebrow="Tools"
        title="AI tools worth knowing"
        description="A hand-picked directory with honest notes on what each tool is good for. Most are free, and many are open source."
      />
      <ToolsBrowser tools={tools} />
    </div>
  );
}
