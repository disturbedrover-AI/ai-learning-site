import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { LessonBody } from "@/components/learn/LessonBody";
import { CompleteButton, ReadingProgress, TableOfContents } from "@/components/learn/LessonChrome";
import { Lift } from "@/components/motion/Lift";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { Tag } from "@/components/ui/Card";
import { getLessons, getLevels, type Lesson } from "@/lib/content";
import { getHeadings } from "@/lib/headings";
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
  const prev = lessons[index - 1];
  const next = lessons[index + 1];
  const prerequisites = lesson.prerequisites.map((p) => lessons.find((l) => l.slug === p)!);
  const headings = getHeadings(lesson.body);

  return (
    <>
      <ReadingProgress />
      <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <Stagger className="max-w-2xl pt-10 sm:pt-14">
          <StaggerItem>
            <Link href="/learn" className="text-sm text-muted transition-colors hover:text-foreground">
              ← Learning path
            </Link>
          </StaggerItem>
          <StaggerItem>
            <p className="mt-8 text-sm font-medium text-accent">
              Level {lesson.level}
              {level && ` · ${level.title}`} · Lesson {index + 1}
            </p>
          </StaggerItem>
          <StaggerItem>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">{lesson.title}</h1>
          </StaggerItem>
          <StaggerItem>
            <p className="mt-4 text-lg text-muted">{lesson.summary}</p>
            <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-muted">
              <span>{lesson.duration} min read</span>
              {lesson.tags.map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </div>
            {prerequisites.length > 0 && (
              <p className="mt-5 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted">
                Read first:{" "}
                {prerequisites.map((p, i) => (
                  <span key={p.slug}>
                    {i > 0 && ", "}
                    <Link href={`/learn/${p.slug}`} className="font-medium text-accent hover:underline">
                      {p.title}
                    </Link>
                  </span>
                ))}
              </p>
            )}
          </StaggerItem>
        </Stagger>

        <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,42rem)_14rem] lg:justify-between">
          <div className="min-w-0">
            {headings.length > 0 && (
              <details className="mb-8 rounded-xl border border-border bg-surface px-4 py-3 lg:hidden">
                <summary className="cursor-pointer text-sm font-medium text-foreground">On this page</summary>
                <ul className="mt-2 space-y-1">
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

            <Reveal className="mt-14 flex flex-col items-start gap-3 rounded-2xl border border-border bg-surface p-6">
              <p className="font-medium text-foreground">Finished reading?</p>
              <p className="text-sm text-muted">Mark this lesson as complete to track your progress on the path.</p>
              <div className="mt-2">
                <CompleteButton slug={lesson.slug} />
              </div>
            </Reveal>

            <nav aria-label="More lessons" className="mt-8 grid gap-4 sm:grid-cols-2">
              {prev ? <PagerLink lesson={prev} direction="prev" /> : <span />}
              {next && <PagerLink lesson={next} direction="next" />}
            </nav>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <TableOfContents headings={headings} />
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

function PagerLink({ lesson, direction }: { lesson: Lesson; direction: "prev" | "next" }) {
  return (
    <Reveal className={direction === "next" ? "sm:col-start-2" : ""}>
      <Lift>
        <Link
          href={`/learn/${lesson.slug}`}
          className={`group block h-full rounded-2xl border border-border p-5 transition-colors hover:border-accent ${
            direction === "next" ? "sm:text-right" : ""
          }`}
        >
          <p className="text-xs text-muted">{direction === "prev" ? "← Previous lesson" : "Next lesson →"}</p>
          <p className="mt-1 font-semibold text-foreground group-hover:text-accent">{lesson.title}</p>
        </Link>
      </Lift>
    </Reveal>
  );
}
