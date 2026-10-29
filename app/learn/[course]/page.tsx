import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import { Suspense } from "react";
import { ArrowRight, Clock, Layers, Route } from "lucide-react";
import { Constellation } from "@/components/brand/Constellation";
import { Breadcrumbs } from "@/components/learn/Breadcrumbs";
import { LessonIcon } from "@/components/learn/LessonIcon";
import { ProgressMeter } from "@/components/learn/ProgressMeter";
import { Lift } from "@/components/motion/Lift";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { Tag } from "@/components/ui/Card";
import { getLessons } from "@/lib/content";
import { findLessonHome, getCourse, getCourses, trackStats } from "@/lib/courses";
import { hueStyle } from "@/lib/levels";

type Props = PageProps<"/learn/[course]">;

export function generateStaticParams() {
  const courses = getCourses();
  // Old lesson addresses (/learn/<lesson>) are prerendered too, so they redirect right away.
  const oldLessonUrls = getLessons()
    .filter((l) => !courses.some((c) => c.slug === l.slug) && findLessonHome(l.slug))
    .map((l) => ({ course: l.slug }));
  return [...courses.map((course) => ({ course: course.slug })), ...oldLessonUrls];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const course = getCourse((await params).course);
  return course ? { title: course.title, description: course.description } : {};
}

export default function CoursePage(props: Props) {
  return (
    <Suspense>
      <CourseView params={props.params} />
    </Suspense>
  );
}

async function CourseView({ params }: Pick<Props, "params">) {
  const { course: slug } = await params;
  const course = getCourse(slug);

  if (!course) {
    // Old lesson addresses (/learn/<lesson>) move to the lesson's first track.
    const home = findLessonHome(slug);
    if (home) permanentRedirect(`/learn/${home.course.slug}/${home.track.slug}/${slug}`);
    notFound();
  }
  // A course with one track has nothing to choose: go straight to it.
  if (course.tracks.length === 1) redirect(`/learn/${course.slug}/${course.tracks[0].slug}`);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-12 sm:px-6" style={hueStyle(course.accent)}>
      <header className="relative">
        <Reveal
          still
          delay={0.2}
          className="pointer-events-none absolute -inset-x-4 inset-y-0 -z-10 [mask-image:linear-gradient(to_left,black,transparent_75%)] sm:-inset-x-6"
        >
          {/* Opacity lives on the inner element: the fade-in animates the outer one. */}
          <Constellation className="size-full opacity-35" />
        </Reveal>
        <Stagger className="pt-10 pb-12 sm:pt-14 sm:pb-16">
          <StaggerItem>
            <Breadcrumbs course={course} />
          </StaggerItem>
          <StaggerItem>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-level/10 text-level">
                <LessonIcon name={course.icon} className="size-6" />
              </span>
              {course.status === "draft" && (
                <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted">Draft</span>
              )}
              {course.tags.map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </div>
          </StaggerItem>
          <StaggerItem>
            <h1 className="mt-5 max-w-3xl text-5xl leading-[1.02] font-bold text-foreground sm:text-6xl">{course.title}</h1>
          </StaggerItem>
          <StaggerItem>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">{course.description}</p>
          </StaggerItem>
        </Stagger>
      </header>

      <Reveal>
        <h2 className="flex items-center gap-2 text-3xl font-bold text-foreground">
          <Route className="size-7 text-level" aria-hidden /> Choose your path
        </h2>
        <p className="mt-2 text-muted">
          {course.tracks.length} tracks, each climbing from Level 0 to Level 3. Start with whichever fits you.
        </p>
      </Reveal>

      <Stagger className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {course.tracks.map((track, i) => {
          const stats = trackStats(course, track);
          return (
            <StaggerItem key={track.slug}>
              <Lift>
                <Link
                  href={`/learn/${course.slug}/${track.slug}`}
                  className="group flex h-full flex-col rounded-3xl border border-border bg-surface p-6 transition-[border-color,box-shadow] hover:border-level/60 hover:ring-4 hover:ring-level/10"
                >
                  <span className="font-display text-sm font-bold text-level">Track {i + 1}</span>
                  <span className="mt-2 flex items-center justify-between gap-3 font-display text-2xl font-bold text-foreground">
                    {track.title}
                    <ArrowRight
                      className="size-5 shrink-0 text-muted transition-transform group-hover:translate-x-1 group-hover:text-level"
                      aria-hidden
                    />
                  </span>
                  <span className="mt-2 flex-1 text-sm leading-relaxed text-muted">{track.description}</span>
                  {/* The four levels, filled where the track has lessons. */}
                  <span className="mt-6 flex gap-1" aria-hidden>
                    {track.levels.map((l) => (
                      <span
                        key={l.level}
                        className={`h-1.5 flex-1 rounded-full ${l.lessons.length ? "bg-level" : "bg-level/15"}`}
                      />
                    ))}
                  </span>
                  <span className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                    <span className="inline-flex items-center gap-1">
                      <Layers className="size-3.5" aria-hidden /> Levels 0–3
                    </span>
                    {stats.lessons > 0 ? (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3.5" aria-hidden /> {stats.lessons}{" "}
                        {stats.lessons === 1 ? "lesson" : "lessons"} · {stats.minutes} min
                      </span>
                    ) : (
                      <span>Lessons coming soon</span>
                    )}
                  </span>
                  <ProgressMeter ids={stats.ids} className="mt-4" />
                </Link>
              </Lift>
            </StaggerItem>
          );
        })}
      </Stagger>
    </div>
  );
}
