import type { Metadata } from "next";
import { Constellation } from "@/components/brand/Constellation";
import { LearnPanel, LearningPath, type PathLevel } from "@/components/learn/LearningPath";
import { LessonIcon } from "@/components/learn/LessonIcon";
import { Reveal } from "@/components/motion/Reveal";
import { PageHeader } from "@/components/ui/PageHeader";
import { getLearningPath } from "@/lib/content";

export const metadata: Metadata = { title: "Learn" };

export default function LearnPage() {
  // Only what the path needs, so lesson text isn't sent to the browser.
  const levels: PathLevel[] = getLearningPath().map(({ lessons, ...level }) => ({
    ...level,
    lessons: lessons.map(({ slug, title, summary, duration, tags, level, icon }) => ({
      slug,
      title,
      summary,
      duration,
      tags,
      level,
      icon: <LessonIcon name={icon} />,
    })),
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
      <header className="relative">
        {/* The constellation motif, very faint, behind the page title. */}
        <Reveal
          still
          delay={0.2}
          className="pointer-events-none absolute -inset-x-4 inset-y-0 -z-10 [mask-image:linear-gradient(to_left,black,transparent_75%)] sm:-inset-x-6"
        >
          {/* Opacity lives on the inner element: the fade-in animates the outer one. */}
          <Constellation className="size-full opacity-35" />
        </Reveal>
        <PageHeader
          eyebrow="Learn"
          title="From zero to confident"
          description="A step-by-step path through AI. Start at the top: each lesson is short and builds on the one before."
        />
      </header>

      <div className="mt-6 grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16">
        <LearningPath levels={levels} />
        <aside aria-label="Your progress" className="order-first lg:order-none">
          <div className="lg:sticky lg:top-24">
            <LearnPanel levels={levels} />
          </div>
        </aside>
      </div>
    </div>
  );
}
