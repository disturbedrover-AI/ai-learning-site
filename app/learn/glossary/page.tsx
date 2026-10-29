import type { Metadata } from "next";
import Link from "next/link";
import { GlossaryBrowser } from "@/components/learn/GlossaryBrowser";
import { PageHeader } from "@/components/ui/PageHeader";
import { getGlossary } from "@/lib/content";
import { getCourses, getTermCourses } from "@/lib/courses";

export const metadata: Metadata = { title: "Glossary" };

export default function GlossaryPage() {
  const termCourses = getTermCourses();
  const used = new Set(Object.values(termCourses).flat());
  const courses = getCourses()
    .filter((c) => used.has(c.slug))
    .map(({ slug, title }) => ({ slug, title }));

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
      <div className="pt-10 sm:pt-14">
        <Link href="/learn" className="text-sm text-muted transition-colors hover:text-foreground">
          ← All courses
        </Link>
      </div>
      <PageHeader
        eyebrow="Learn"
        title="Glossary"
        description="Every AI term used in the lessons, explained in plain English. Search, jump to a letter, or pick a course."
      />
      <GlossaryBrowser terms={getGlossary()} courses={courses} termCourses={termCourses} />
    </div>
  );
}
