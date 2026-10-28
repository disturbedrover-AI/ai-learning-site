import type { Metadata } from "next";
import { FadeIn } from "@/components/motion/FadeIn";
import { Card, Tag } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { getGlossary, getLessons } from "@/lib/content";

export const metadata: Metadata = { title: "Learn" };

export default function LearnPage() {
  const lessons = getLessons();
  const glossary = getGlossary();

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <PageHeader
        eyebrow="Learn"
        title="Lessons"
        description="Start at the beginning and work your way up. Each lesson is short and builds on the one before."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {lessons.map((lesson, i) => (
          <FadeIn key={lesson.slug} onScroll delay={i * 0.06}>
            <Card>
              <div className="flex items-center gap-2 text-xs text-muted">
                <span className="capitalize">{lesson.level}</span>
                {lesson.duration && <span>· {lesson.duration} min</span>}
              </div>
              <h2 className="mt-2 text-lg font-semibold text-foreground">{lesson.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{lesson.summary}</p>
              {lesson.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {lesson.tags.map((t) => (
                    <Tag key={t}>{t}</Tag>
                  ))}
                </div>
              )}
            </Card>
          </FadeIn>
        ))}
        {lessons.length === 0 && <p className="text-muted">Lessons are on their way.</p>}
      </div>

      <FadeIn onScroll>
        <h2 className="mt-20 text-2xl font-semibold tracking-tight text-foreground">Glossary</h2>
        <p className="mt-2 text-muted">Key terms, explained simply.</p>
      </FadeIn>
      <dl className="mt-6 divide-y divide-border rounded-2xl border border-border bg-surface">
        {glossary.map((item) => (
          <div key={item.slug} className="p-6">
            <dt className="font-semibold text-foreground">
              {item.term}
              {item.aliases.length > 0 && (
                <span className="ml-2 text-sm font-normal text-muted">({item.aliases.join(", ")})</span>
              )}
            </dt>
            <dd className="mt-1 text-sm leading-relaxed text-muted">{item.definition}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
