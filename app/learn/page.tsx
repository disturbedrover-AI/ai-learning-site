import type { Metadata } from "next";
import { BookA } from "lucide-react";
import { Constellation } from "@/components/brand/Constellation";
import { CourseCatalogue, type CatalogueCourse } from "@/components/learn/CourseCatalogue";
import { LessonIcon } from "@/components/learn/LessonIcon";
import { Reveal } from "@/components/motion/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { courseStats, getCourses, showDrafts, trackLessons } from "@/lib/courses";

export const metadata: Metadata = { title: "Learn" };

export default function LearnPage() {
  const courses: CatalogueCourse[] = getCourses().map((course) => {
    const stats = courseStats(course);
    const firstTrack = course.tracks.find((t) => trackLessons(t).length > 0);
    const firstLesson = firstTrack && trackLessons(firstTrack)[0].lesson;
    return {
      slug: course.slug,
      title: course.title,
      description: course.description,
      icon: <LessonIcon name={course.icon} />,
      accent: course.accent,
      tags: course.tags,
      status: course.status,
      tracks: course.tracks.length,
      levels: stats.levels,
      lessons: stats.lessons,
      minutes: stats.minutes,
      ids: stats.ids,
      // Single-track courses go straight to their track.
      href:
        course.tracks.length === 1 ? `/learn/${course.slug}/${course.tracks[0].slug}` : `/learn/${course.slug}`,
      firstLessonHref: firstTrack && firstLesson && `/learn/${course.slug}/${firstTrack.slug}/${firstLesson.slug}`,
    };
  });

  return (
    <div className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
      <header className="relative">
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
          title="Courses"
          description="Pick a course and climb its four levels, from Foundations to building things yourself. Each lesson is short and builds on the one before."
        />
      </header>

      <CourseCatalogue courses={courses} showStatus={showDrafts()} />

      <Reveal className="mt-16 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border bg-surface p-6">
        <div>
          <p className="font-display text-xl font-bold text-foreground">Glossary</p>
          <p className="mt-1 text-sm text-muted">Every term used in the lessons, explained in plain English.</p>
        </div>
        <ButtonLink href="/learn/glossary" variant="secondary">
          <BookA className="size-4" aria-hidden /> Open the glossary
        </ButtonLink>
      </Reveal>
    </div>
  );
}
