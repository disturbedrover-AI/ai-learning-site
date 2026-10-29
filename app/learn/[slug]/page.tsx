import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, Clock } from "lucide-react";
import { LessonBody } from "@/components/learn/LessonBody";
import { LessonPanel, ReadingProgress, TableOfContents } from "@/components/learn/LessonChrome";
import { LessonIcon } from "@/components/learn/LessonIcon";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { Tag } from "@/components/ui/Card";
import { getLessons, getLevels } from "@/lib/content";
import { getHeadings } from "@/lib/headings";
import { levelStyle } from "@/lib/levels";
import "@/components/learn/lesson.css";

export function generateStaticParams() {
  return getLessons().map((lesson) => ({ slug: lesson.slug }));
}

export async function generateMetadata({ params }: PageProps<"/learn/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const lesson = getLessons().find((l) => l.slug === slug);
  return lesson ? { title: lesson.title, description: lesson.summary } : {};
}

export default function LessonPage(props: PageProps<"/learn/[slug]">) {
  return (
    <Suspense>
      <Lesson params={props.params} />
    </Suspense>
  );
}

async function Lesson({ params }: Pick<PageProps<"/learn/[slug]">, "params">) {
  const { slug } = await params;
  const lessons = getLessons();
  const index = lessons.findIndex((l) => l.slug === slug);
  if (index === -1) notFound();

  const lesson = lessons[index];
  const level = getLevels().find((l) => l.level === lesson.level);
  const neighbour = (i: number) => lessons[i] && { slug: lessons[i].slug, title: lessons[i].title };
  const prerequisites = lesson.prerequisites.map((p) => lessons.find((l) => l.slug === p)!);
  const headings = getHeadings(lesson.body);

  return (
    // The level's colour tints the progress bar, badges and highlights on this page.
    <div style={levelStyle(lesson.level)}>
      <ReadingProgress />
      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        {/* Single column on small screens; three columns (contents · lesson · panel) from 1024px. */}
        <div className="lg:grid lg:grid-cols-[11rem_minmax(0,68ch)_14rem] lg:justify-between lg:gap-8 xl:grid-cols-[13rem_minmax(0,68ch)_16rem] xl:gap-10">
          <Stagger className="mx-auto max-w-[68ch] pt-10 pb-12 sm:pt-14 lg:col-start-2 lg:mx-0">
            <StaggerItem>
              <Link
                href="/learn"
                className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
              >
                <ArrowLeft className="size-4" aria-hidden /> Learning path
              </Link>
            </StaggerItem>
            <StaggerItem>
              <div className="mt-10 flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-xl bg-level/10 text-level">
                  <LessonIcon name={lesson.icon} className="size-5" />
                </span>
                <span className="rounded-full border border-level/30 bg-level/10 px-3 py-1 text-xs font-semibold text-level">
                  Level {lesson.level}
                  {level && ` · ${level.title}`}
                </span>
                <span className="text-xs text-muted">Lesson {index + 1}</span>
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
                      <Link href={`/learn/${p.slug}`} className="font-medium text-level hover:underline">
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
              <LessonPanel slug={lesson.slug} prev={neighbour(index - 1)} next={neighbour(index + 1)} />
            </Reveal>
          </div>

          <aside className="hidden lg:col-start-3 lg:row-start-2 lg:block">
            <div className="sticky top-28">
              <LessonPanel slug={lesson.slug} prev={neighbour(index - 1)} next={neighbour(index + 1)} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
