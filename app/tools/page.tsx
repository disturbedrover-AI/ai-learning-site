import type { Metadata } from "next";
import { FadeIn } from "@/components/motion/FadeIn";
import { Card, Tag } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { getTools } from "@/lib/content";

export const metadata: Metadata = { title: "Tools" };

export default function ToolsPage() {
  const tools = getTools();

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <PageHeader
        eyebrow="Tools"
        title="AI tools worth knowing"
        description="A hand-picked directory, with a short note on what each tool is good for."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool, i) => (
          <FadeIn key={tool.slug} onScroll delay={i * 0.06}>
            <a href={tool.url} target="_blank" rel="noopener noreferrer" className="group block h-full">
              <Card className="group-hover:border-accent">
                <div className="flex items-center justify-between text-xs text-muted">
                  <span>{tool.category}</span>
                  {tool.pricing && <span className="capitalize">{tool.pricing}</span>}
                </div>
                <h2 className="mt-2 flex items-center gap-1.5 text-lg font-semibold text-foreground">
                  {tool.name}
                  <span className="text-muted transition-colors group-hover:text-accent">↗</span>
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">{tool.description}</p>
                {tool.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {tool.tags.map((t) => (
                      <Tag key={t}>{t}</Tag>
                    ))}
                  </div>
                )}
              </Card>
            </a>
          </FadeIn>
        ))}
        {tools.length === 0 && <p className="text-muted">Tools are on their way.</p>}
      </div>
    </div>
  );
}
