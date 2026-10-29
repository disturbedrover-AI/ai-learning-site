import Link from "next/link";
import { ArrowRight, BookOpen, Newspaper, Wrench } from "lucide-react";
import { Constellation } from "@/components/brand/Constellation";
import { Lift } from "@/components/motion/Lift";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { ButtonLink } from "@/components/ui/Button";
import { LessonIcon } from "@/components/learn/LessonIcon";
import { ProgressMeter } from "@/components/learn/ProgressMeter";
import { courseStats, getCourses } from "@/lib/courses";
import { hueStyle } from "@/lib/levels";

const sections = [
  {
    href: "/learn",
    title: "Learn",
    text: "Short, friendly lessons that build up your understanding of AI from the very first idea.",
    icon: BookOpen,
  },
  {
    href: "/news",
    title: "News",
    text: "What's happening in AI, explained clearly, without the hype or the jargon.",
    icon: Newspaper,
  },
  {
    href: "/tools",
    title: "Tools",
    text: "A hand-picked directory of AI tools, with notes on what each one is good for.",
    icon: Wrench,
  },
];

export default function HomePage() {
  // Featured: published courses only, even when drafts are being previewed.
  const featured = getCourses({ drafts: false });
  const [learn, ...others] = sections;

  return (
    <>
      {/* Full-screen background that stays put while scrolling, set per theme by --page-gradient. */}
      <Reveal still className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 [background:var(--page-gradient)] [animation:var(--page-animation)] motion-reduce:[animation:none]" />
      </Reveal>

      <section className="relative overflow-hidden">
        {/* Background glow, set per theme by --hero-gradient in themes.css. */}
        <Reveal still className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 [background:var(--hero-gradient)] [opacity:var(--hero-opacity)] [mask-image:linear-gradient(to_bottom,black_60%,transparent)] [animation:var(--hero-animation)] motion-reduce:[animation:none]" />
        </Reveal>

        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 pt-20 pb-20 sm:px-6 sm:pt-28 sm:pb-28 lg:grid-cols-[1.05fr_1fr]">
          <Stagger gap={0.08}>
            <StaggerItem>
              <p className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted">
                <span className="size-1.5 rounded-full bg-accent" />
                A calm place to learn about AI
              </p>
            </StaggerItem>
            <StaggerItem>
              <h1 className="mt-6 text-5xl leading-[1.02] font-bold text-foreground sm:text-7xl">
                Understand AI, one clear step at a time.
              </h1>
            </StaggerItem>
            <StaggerItem>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
                Plain-English lessons, a glossary of key terms, the latest news, and the tools worth knowing about.
                No background needed.
              </p>
            </StaggerItem>
            <StaggerItem>
              <div className="mt-10 flex flex-wrap gap-3">
                <ButtonLink href="/learn">Start learning</ButtonLink>
                <ButtonLink href="/tools" variant="secondary">
                  Explore tools
                </ButtonLink>
              </div>
            </StaggerItem>
          </Stagger>

          {/* The motif: a faint background on small screens, its own column on large ones. */}
          <Reveal
            still
            delay={0.3}
            className="pointer-events-none absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,transparent,black_40%,transparent)] lg:static lg:z-auto lg:aspect-[5/4] lg:[mask-image:radial-gradient(closest-side,black_70%,transparent)]"
          >
            {/* Opacity lives on the inner element: the fade-in animates the outer one. */}
            <Constellation className="size-full opacity-25 lg:opacity-100" />
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <Stagger className="grid gap-4 md:grid-cols-3 md:grid-rows-2">
          {/* Learn is the main thing on the site, so its card is the big one. */}
          <StaggerItem className="md:col-span-2 md:row-span-2">
            <div className="flex h-full flex-col gap-8 rounded-3xl border border-border bg-surface p-8 sm:p-10">
              <div>
                <learn.icon className="size-7 text-accent" strokeWidth={1.75} aria-hidden />
                <h2 className="mt-6 text-3xl font-bold text-foreground sm:text-4xl">
                  <Link href={learn.href} className="group inline-flex items-center gap-3">
                    {learn.title}
                    <ArrowRight
                      className="size-6 text-muted transition-transform group-hover:translate-x-1 group-hover:text-accent"
                      aria-hidden
                    />
                  </Link>
                </h2>
                <p className="mt-3 max-w-md leading-relaxed text-muted">{learn.text}</p>
                <p className="mt-2 text-sm text-muted">
                  Every course climbs four levels: Foundations, Core Concepts, Hands-on and Build Things.
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold tracking-[0.14em] text-muted uppercase">Featured courses</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {featured.map((course) => {
                    const href =
                      course.tracks.length === 1
                        ? `/learn/${course.slug}/${course.tracks[0].slug}`
                        : `/learn/${course.slug}`;
                    return (
                      <Lift key={course.slug}>
                        <Link
                          href={href}
                          style={hueStyle(course.accent)}
                          className="group flex h-full flex-col rounded-2xl border border-border bg-background p-4 transition-[border-color,box-shadow] hover:border-level/60 hover:ring-4 hover:ring-level/10"
                        >
                          <span className="flex items-center gap-3">
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-level/10 text-level">
                              <LessonIcon name={course.icon} className="size-4.5" />
                            </span>
                            <span className="font-display text-lg leading-tight font-bold text-foreground">
                              {course.title}
                            </span>
                          </span>
                          <span className="mt-2 line-clamp-1 text-sm text-muted">{course.description}</span>
                          <ProgressMeter ids={courseStats(course).ids} onlyIfStarted className="mt-3" />
                        </Link>
                      </Lift>
                    );
                  })}
                </div>
                <Link
                  href="/learn"
                  className="group mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent"
                >
                  Browse all courses
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" aria-hidden />
                </Link>
              </div>
            </div>
          </StaggerItem>

          {others.map((s) => (
            <StaggerItem key={s.href}>
              <Lift>
                <Link
                  href={s.href}
                  className="group block h-full rounded-3xl border border-border bg-surface p-6 transition-colors hover:border-accent"
                >
                  <s.icon className="size-5 text-accent" strokeWidth={1.75} aria-hidden />
                  <h2 className="mt-4 flex items-center justify-between text-xl font-semibold text-foreground">
                    {s.title}
                    <ArrowRight
                      className="size-4 text-muted transition-transform group-hover:translate-x-1 group-hover:text-accent"
                      aria-hidden
                    />
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{s.text}</p>
                </Link>
              </Lift>
            </StaggerItem>
          ))}
        </Stagger>
      </section>
    </>
  );
}
