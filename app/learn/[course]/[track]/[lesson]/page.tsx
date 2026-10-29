import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Clock } from "lucide-react";
import { Breadcrumbs } from "@/components/learn/Breadcrumbs";
import { LessonBody } from "@/components/learn/LessonBody";
import { LessonPanel, ReadingProgress, RememberLesson, TableOfContents } from "@/components/learn/LessonChrome";
import { LessonIcon } from "@/components/learn/LessonIcon";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { Tag } from "@/components/ui/Card";
import { findLessonHome, getCourse, getCourses, lessonId, trackLessons } from "@/lib/courses";
import { getHeadings } from "@/lib/headings";
import { levelStyle } from "@/lib/levels";
import "@/components/learn/lesson.css";

type Props = PageProps<"/learn/[course]/[track]/[lesson]">;

export function generateStaticParams() {
  return getCourses().flatMap((course) =>
    course.tracks.flatMap((track) =>
      trackLessons(track).map(({ lesson }) => ({ course: course.slug, track: track.slug, lesson: lesson.slug })),
    ),
  );
}

/** The lesson, its track and course, and where it sits in the track. */
function find(params: Awaited<Props["params"]>) {
  const course = getCourse(params.course);
  const track = course?.tracks.find((t) => t.slug === params.track);
  const items = track ? trackLessons(track) : [];
  const index = items.findIndex((i) => i.lesson.slug === params.lesson);
  return course && track && index !== -1 ? { course, track, items, index } : undefined;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = find(await params);
  if (!found) return {};
  const { lesson } = found.items[found.index];
  return { title: lesson.title, description: lesson.summary };
}

export default function LessonPage(props: Props) {
  return (
    <Suspense>
      <Lesson params={props.params} />
    </Suspense>
  );
}

async function Lesson({ params }: Pick<Props, "params">) {
  const found = find(await params);
  if (!found) notFound();

  // Previous / next and the lesson number all follow this track's order.
  const { course, track, items, index } = found;
  const { lesson, level: levelNumber } = items[index];
  const level = track.levels.find((l) => l.level === levelNumber);
  const trackHref = `/learn/${course.slug}/${track.slug}`;
  const id = lessonId(course.slug, track.slug, lesson.slug);
  const neighbour = (i: number) => items[i] && { href: `${trackHref}/${items[i].lesson.slug}`, title: items[i].lesson.title };
  const position = `Lesson ${index + 1} of ${items.length} in ${track.title}`;
  // Prerequisites link to this track when they're in it, otherwise to wherever they can be read.
  const prerequisites = lesson.prerequisites.flatMap((slug) => {
    const home = findLessonHome(slug, { course: course.slug, track: track.slug });
    const item = home && trackLessons(home.track).find((i) => i.lesson.slug === slug);
    return home && item ? [{ slug, title: item.lesson.title, href: `/learn/${home.course.slug}/${home.track.slug}/${slug}` }] : [];
  });
  const headings = getHeadings(lesson.body);

  return (
    // The level's colour tints the progress bar, badges and highlights on this page.
    <div style={levelStyle(levelNumber)}>
      <ReadingProgress />
      <RememberLesson id={id} />
      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        {/* Single column on small screens; three columns (contents · lesson · panel) from 1024px. */}
        <div className="lg:grid lg:grid-cols-[11rem_minmax(0,68ch)_14rem] lg:justify-between lg:gap-8 xl:grid-cols-[13rem_minmax(0,68ch)_16rem] xl:gap-10">
          <Stagger className="mx-auto max-w-[68ch] pt-10 pb-12 sm:pt-14 lg:col-start-2 lg:mx-0">
            <StaggerItem>
              <Breadcrumbs course={course} track={track} />
            </StaggerItem>
            <StaggerItem>
              <div className="mt-10 flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-xl bg-level/10 text-level">
                  <LessonIcon name={lesson.icon} className="size-5" />
                </span>
                <span className="rounded-full border border-level/30 bg-level/10 px-3 py-1 text-xs font-semibold text-level">
                  Level {levelNumber}
                  {level && ` · ${level.title}`}
                </span>
                <span className="text-xs text-muted">
                  Lesson {index + 1} of {items.length}
                </span>
              </div>
            </StaggerItem>
            <StaggerItem>
              <h1 className="mt-5 text-4xl leading-[1.05] font-bold text-foreground sm:text-6xl">{lesson.title}</h1>
            </StaggerItem>
            <StaggerItem>
              <p className="mt-5 text-lg leading-relaxed text-muted sm:text-xl">{lesson.summary}</p>
              <div className="mt-6 flex flex-wrap items-center gap-2 text-sm text-muted">
                <span className="mr-1 inline-flex items-center gap-1.5">
                  <Clock className="size-4" aria-hidden /> {lesson.duration} min read
                </span>
                {lesson.tags.map((t) => (
                  <Tag key={t}>{t}</Tag>
                ))}
              </div>
              {prerequisites.length > 0 && (
                <p className="mt-6 rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-muted">
                  Read first:{" "}
                  {prerequisites.map((p, i) => (
                    <span key={p.slug}>
                      {i > 0 && ", "}
                      <Link href={p.href} className="font-medium text-level hover:underline">
                        {p.title}
                      </Link>
                    </span>
                  ))}
                </p>
              )}
            </StaggerItem>
          </Stagger>

          <aside className="hidden lg:col-start-1 lg:row-start-2 lg:block">
            <div className="sticky top-28">
              <TableOfContents headings={headings} />
            </div>
          </aside>

          <div className="mx-auto min-w-0 max-w-[68ch] lg:col-start-2 lg:row-start-2 lg:mx-0">
            {headings.length > 0 && (
              <details className="mb-10 rounded-2xl border border-border bg-surface px-5 py-4 lg:hidden">
                <summary className="cursor-pointer text-sm font-semibold text-foreground">On this page</summary>
                <ul className="mt-3 space-y-1">
                  {headings.map((h) => (
                    <li key={h.id} className={h.depth === 3 ? "pl-4" : ""}>
                      <a href={`#${h.id}`} className="block py-1 text-sm text-muted hover:text-foreground">
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </details>
            )}

            <Reveal delay={0.2}>
              <article className="lesson-body">
                <LessonBody source={lesson.body} file={lesson.file} />
              </article>
            </Reveal>

            {/* On small screens the panel follows the lesson. */}
            <Reveal className="mt-16 lg:hidden">
              <LessonPanel id={id} position={position} prev={neighbour(index - 1)} next={neighbour(index + 1)} />
            </Reveal>
          </div>

          <aside className="hidden lg:col-start-3 lg:row-start-2 lg:block">
            <div className="sticky top-28">
              <LessonPanel id={id} position={position} prev={neighbour(index - 1)} next={neighbour(index + 1)} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
