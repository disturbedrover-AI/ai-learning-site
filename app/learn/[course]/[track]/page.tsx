import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Constellation } from "@/components/brand/Constellation";
import { Breadcrumbs } from "@/components/learn/Breadcrumbs";
import { LearnPanel, LearningPath, type PathLevel } from "@/components/learn/LearningPath";
import { LessonIcon } from "@/components/learn/LessonIcon";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { getCourse, getCourses, lessonId } from "@/lib/courses";
import { hueStyle } from "@/lib/levels";

type Props = PageProps<"/learn/[course]/[track]">;

export function generateStaticParams() {
  return getCourses().flatMap((course) => course.tracks.map((track) => ({ course: course.slug, track: track.slug })));
}

function find({ course: courseSlug, track: trackSlug }: Awaited<Props["params"]>) {
  const course = getCourse(courseSlug);
  const track = course?.tracks.find((t) => t.slug === trackSlug);
  return course && track ? { course, track } : undefined;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = find(await params);
  if (!found) return {};
  const { course, track } = found;
  return { title: course.tracks.length > 1 ? `${track.title} · ${course.title}` : course.title };
}

export default function TrackPage(props: Props) {
  return (
    <Suspense>
      <TrackView params={props.params} />
    </Suspense>
  );
}

/** One track: its levels and lessons as a path, with progress on the side. */
async function TrackView({ params }: Pick<Props, "params">) {
  const found = find(await params);
  if (!found) notFound();
  const { course, track } = found;

  // Only what the path needs, so lesson text isn't sent to the browser.
  const levels: PathLevel[] = track.levels.map(({ lessons, ...level }) => ({
    ...level,
    lessons: lessons.map(({ slug, title, summary, duration, tags, icon }) => ({
      slug,
      title,
      summary,
      duration,
      tags,
      level: level.level,
      id: lessonId(course.slug, track.slug, slug),
      href: `/learn/${course.slug}/${track.slug}/${slug}`,
      icon: <LessonIcon name={icon} />,
    })),
  }));

  return (
    <div className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
      <header className="relative" style={hueStyle(course.accent)}>
        {/* The constellation motif, very faint, behind the title. */}
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
            <p className="mt-10 flex items-center gap-2 text-xs font-semibold tracking-[0.14em] text-level uppercase">
              <LessonIcon name={course.icon} className="size-4" />
              {course.tracks.length > 1 ? `${course.title} · Track` : "Course"}
            </p>
          </StaggerItem>
          <StaggerItem>
            <h1 className="mt-3 max-w-3xl text-5xl leading-[1.02] font-bold text-foreground sm:text-6xl">{track.title}</h1>
          </StaggerItem>
          <StaggerItem>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted">{track.description}</p>
          </StaggerItem>
        </Stagger>
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
