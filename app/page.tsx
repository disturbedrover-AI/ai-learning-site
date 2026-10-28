import Link from "next/link";
import { FadeIn } from "@/components/motion/FadeIn";
import { Card } from "@/components/ui/Card";

const sections = [
  {
    href: "/learn",
    title: "Learn",
    text: "Short, friendly lessons that build up your understanding of AI from the very first idea.",
  },
  {
    href: "/news",
    title: "News",
    text: "What's happening in AI, explained clearly, without the hype or the jargon.",
  },
  {
    href: "/tools",
    title: "Tools",
    text: "A hand-picked directory of AI tools, with notes on what each one is good for.",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden">
        {/* Background glow, set per theme by --hero-gradient in themes.css. */}
        <FadeIn y={0} className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute inset-0 [background:var(--hero-gradient)] [opacity:var(--hero-opacity)] [mask-image:linear-gradient(to_bottom,black_60%,transparent)] [animation:var(--hero-animation)] motion-reduce:[animation:none]" />
        </FadeIn>

        <div className="mx-auto max-w-6xl px-4 pt-24 pb-20 sm:px-6 sm:pt-32 sm:pb-28">
          <FadeIn>
            <p className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted">
              <span className="size-1.5 rounded-full bg-accent" />
              A calm place to learn about AI
            </p>
          </FadeIn>
          <FadeIn delay={0.08}>
            <h1 className="mt-6 max-w-3xl text-5xl font-semibold tracking-tight text-foreground sm:text-6xl">
              Understand AI, one clear step at a time.
            </h1>
          </FadeIn>
          <FadeIn delay={0.16}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
              Plain-English lessons, a glossary of key terms, the latest news, and the tools worth knowing about.
              No background needed.
            </p>
          </FadeIn>
          <FadeIn delay={0.24}>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/learn"
                className="rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90"
              >
                Start learning
              </Link>
              <Link
                href="/tools"
                className="rounded-full border border-border bg-surface px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-accent"
              >
                Explore tools
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-4 md:grid-cols-3">
          {sections.map((s, i) => (
            <FadeIn key={s.href} onScroll delay={i * 0.08}>
              <Link href={s.href} className="group block h-full">
                <Card className="group-hover:border-accent">
                  <h2 className="flex items-center justify-between text-lg font-semibold text-foreground">
                    {s.title}
                    <span className="text-muted transition-transform group-hover:translate-x-1 group-hover:text-accent">
                      →
                    </span>
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{s.text}</p>
                </Card>
              </Link>
            </FadeIn>
          ))}
        </div>
      </section>
    </>
  );
}
