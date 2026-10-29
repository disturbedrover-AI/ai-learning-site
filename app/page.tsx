import Link from "next/link";
import { ArrowRight, BookOpen, Newspaper, Wrench } from "lucide-react";
import { Constellation } from "@/components/brand/Constellation";
import { Lift } from "@/components/motion/Lift";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { ButtonLink } from "@/components/ui/Button";
import { getLearningPath } from "@/lib/content";
import { levelStyle } from "@/lib/levels";

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
  const levels = getLearningPath();
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
            <Lift>
              <Link
                href={learn.href}
                className="group flex h-full flex-col justify-between gap-10 rounded-3xl border border-border bg-surface p-8 transition-colors hover:border-accent sm:p-10"
              >
                <div>
                  <learn.icon className="size-7 text-accent" strokeWidth={1.75} aria-hidden />
                  <h2 className="mt-6 flex items-center gap-3 text-3xl font-bold text-foreground sm:text-4xl">
                    {learn.title}
                    <ArrowRight
                      className="size-6 text-muted transition-transform group-hover:translate-x-1 group-hover:text-accent"
                      aria-hidden
                    />
                  </h2>
                  <p className="mt-3 max-w-md leading-relaxed text-muted">{learn.text}</p>
                </div>
                <ol className="grid gap-2 sm:grid-cols-4">
                  {levels.map((level) => (
                    <li
                      key={level.level}
                      style={levelStyle(level.level)}
                      className="rounded-2xl border border-level/25 bg-level/[0.06] px-4 py-3"
                    >
                      <span className="font-display text-2xl font-bold text-level">{level.level}</span>
                      <span className="mt-0.5 block text-sm font-medium text-foreground">{level.title}</span>
                    </li>
                  ))}
                </ol>
              </Link>
            </Lift>
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
