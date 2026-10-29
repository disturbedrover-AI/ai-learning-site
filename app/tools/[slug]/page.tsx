import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Check, Minus, Quote } from "lucide-react";
import { LessonBody } from "@/components/learn/LessonBody";
import { Lift } from "@/components/motion/Lift";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { NewsCard } from "@/components/news/NewsCard";
import { categoryStyle, PlatformIcons, ToolBadges, ToolLogo } from "@/components/tools/ToolParts";
import { ButtonLink } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Card";
import { getTool, getTools, withoutBody } from "@/lib/content";
import { lessonsForTool, newsForTool } from "@/lib/related";
import { DIFFICULTIES, PLATFORMS, TOOL_CATEGORIES } from "@/lib/taxonomy";
import "@/components/learn/lesson.css";

type Props = PageProps<"/tools/[slug]">;

export function generateStaticParams() {
  return getTools().map((tool) => ({ slug: tool.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const tool = getTool((await params).slug);
  return tool ? { title: tool.name, description: tool.tagline } : {};
}

export default function ToolPage(props: Props) {
  return (
    <Suspense>
      <ToolView params={props.params} />
    </Suspense>
  );
}

async function ToolView({ params }: Pick<Props, "params">) {
  const tool = getTool((await params).slug);
  if (!tool) notFound();
  const news = newsForTool(tool);
  const lessons = lessonsForTool(tool);
  const added = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(tool.dateAdded),
  );

  return (
    <div style={categoryStyle(tool)} className="mx-auto max-w-4xl px-4 pb-16 sm:px-6">
      <Stagger className="pt-10 sm:pt-14">
        <StaggerItem>
          <Link href="/tools" className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground">
            <ArrowLeft className="size-4" aria-hidden /> All tools
          </Link>
        </StaggerItem>
        <StaggerItem>
          <div className="mt-10 flex flex-wrap items-center gap-5">
            <ToolLogo tool={tool} size="lg" />
            <div className="min-w-0">
              <p className="text-xs font-semibold tracking-[0.14em] text-level uppercase">
                {TOOL_CATEGORIES[tool.category].label}
              </p>
              <h1 className="mt-1 text-4xl leading-[1.05] font-bold text-foreground sm:text-5xl">{tool.name}</h1>
            </div>
          </div>
        </StaggerItem>
        <StaggerItem>
          <p className="mt-6 text-lg leading-relaxed text-muted sm:text-xl">{tool.tagline}</p>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-muted">
            <ToolBadges tool={tool} />
            <span className="flex items-center gap-2">
              <PlatformIcons platforms={tool.platforms} />
              {tool.platforms.map((p) => PLATFORMS[p]).join(", ")}
            </span>
            <span>{DIFFICULTIES[tool.difficulty]}</span>
            <span>Added {added}</span>
          </div>
          <div className="mt-8">
            <ButtonLink href={tool.url}>
              Visit {tool.name} <ArrowUpRight className="size-4" aria-hidden />
            </ButtonLink>
          </div>
        </StaggerItem>
      </Stagger>

      {tool.ownerNote && (
        <Reveal className="mt-14">
          <figure className="relative rounded-3xl border-l-4 border-level bg-level/[0.07] p-6 sm:p-8">
            <Quote className="size-6 text-level" aria-hidden />
            <blockquote className="mt-3 font-display text-xl leading-snug font-semibold text-foreground sm:text-2xl">
              {tool.ownerNote}
            </blockquote>
            <figcaption className="mt-4 text-sm text-muted">Owner’s note</figcaption>
          </figure>
        </Reveal>
      )}

      <Stagger className="mt-12 grid gap-5 md:grid-cols-2">
        <StaggerItem className="rounded-3xl border border-border bg-surface p-6">
          <h2 className="text-lg font-bold text-foreground">Good for</h2>
          <ul className="mt-3 space-y-2">
            {tool.goodFor.map((g) => (
              <li key={g} className="flex gap-2 text-sm text-foreground">
                <Check className="mt-0.5 size-4 shrink-0 text-success" strokeWidth={2.5} aria-hidden /> {g}
              </li>
            ))}
          </ul>
        </StaggerItem>
        {tool.notGoodFor.length > 0 && (
          <StaggerItem className="rounded-3xl border border-border bg-surface p-6">
            <h2 className="text-lg font-bold text-foreground">Not so good for</h2>
            <ul className="mt-3 space-y-2">
              {tool.notGoodFor.map((g) => (
                <li key={g} className="flex gap-2 text-sm text-foreground">
                  <Minus className="mt-0.5 size-4 shrink-0 text-muted" strokeWidth={2.5} aria-hidden /> {g}
                </li>
              ))}
            </ul>
          </StaggerItem>
        )}
      </Stagger>

      {tool.body && (
        <Reveal className="mt-12">
          <h2 className="text-2xl font-bold text-foreground">About {tool.name}</h2>
          <article className="lesson-body mt-4">
            <LessonBody source={tool.body} file={tool.file} />
          </article>
        </Reveal>
      )}

      {tool.tags.length > 0 && (
        <Reveal className="mt-8 flex flex-wrap gap-1.5">
          {tool.tags.map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </Reveal>
      )}

      {lessons.length > 0 && (
        <section aria-labelledby="tool-lessons" className="mt-16">
          <Reveal>
            <h2 id="tool-lessons" className="text-2xl font-bold text-foreground">
              Lessons that mention it
            </h2>
          </Reveal>
          <Stagger className="mt-5 grid gap-4">
            {lessons.map((lesson) => (
              <StaggerItem key={lesson.slug}>
                <Lift>
                  <Link
                    href={lesson.href}
                    className="group flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-accent"
                  >
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                      <BookOpen className="size-5" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-lg font-bold text-foreground">{lesson.title}</span>
                      <span className="line-clamp-1 text-sm text-muted">{lesson.summary}</span>
                    </span>
                    <ArrowRight className="size-5 text-muted transition-transform group-hover:translate-x-1" aria-hidden />
                  </Link>
                </Lift>
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      )}

      {news.length > 0 && (
        <section aria-labelledby="tool-news" className="mt-16">
          <Reveal>
            <h2 id="tool-news" className="text-2xl font-bold text-foreground">
              In the news
            </h2>
          </Reveal>
          <Stagger className="mt-5 grid gap-4">
            {news.map((item) => (
              <StaggerItem key={item.slug}>
                <NewsCard item={withoutBody(item)} />
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      )}
    </div>
  );
}
