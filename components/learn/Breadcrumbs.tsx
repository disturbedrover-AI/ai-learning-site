import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Course, Track } from "@/lib/courses";

/** "Learn › Course › Track". The track is left out for single-track courses (it has the course's name). */
export function Breadcrumbs({ course, track }: { course: Course; track?: Track }) {
  const crumbs = [
    { href: "/learn", label: "Learn" },
    { href: `/learn/${course.slug}`, label: course.title },
    ...(track && course.tracks.length > 1 ? [{ href: `/learn/${course.slug}/${track.slug}`, label: track.title }] : []),
  ];
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-muted">
        {crumbs.map((crumb, i) => (
          <li key={crumb.href} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="size-3.5" aria-hidden />}
            <Link href={crumb.href} className="transition-colors hover:text-foreground">
              {crumb.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
