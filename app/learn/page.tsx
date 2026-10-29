import type { Metadata } from "next";
import Link from "next/link";
import { LearningPath } from "@/components/learn/LearningPath";
import { Lift } from "@/components/motion/Lift";
import { Reveal } from "@/components/motion/Reveal";
import { PageHeader } from "@/components/ui/PageHeader";
import { getGlossary, getLearningPath } from "@/lib/content";

export const metadata: Metadata = { title: "Learn" };

export default function LearnPage() {
  // Only what the path needs, so lesson text isn't sent to the browser.
  const levels = getLearningPath().map(({ lessons, ...level }) => ({
    ...level,
    lessons: lessons.map(({ slug, title, summary, duration, tags }) => ({ slug, title, summary, duration, tags })),
  }));
  const termCount = getGlossary().length;

  return (
    <div className="mx-auto max-w-3xl px-4 pb-8 sm:px-6">
      <PageHeader
        eyebrow="Learn"
        title="From zero to confident"
        description="A step-by-step path through AI. Start at the top: each lesson is short and builds on the one before."
      />

      <LearningPath levels={levels} />

      <Reveal className="mt-16">
        <Lift>
          <Link
            href="/learn/glossary"
            className="group flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface p-6 transition-colors hover:border-accent"
          >
            <div>
              <h2 className="text-lg font-semibold text-foreground">Glossary</h2>
              <p className="mt-1 text-sm text-muted">{termCount} key terms, each explained in plain English.</p>
            </div>
            <span className="text-muted transition-transform group-hover:translate-x-1 group-hover:text-accent">→</span>
          </Link>
        </Lift>
      </Reveal>
    </div>
  );
}
