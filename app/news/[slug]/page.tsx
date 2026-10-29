import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Lightbulb } from "lucide-react";
import { LessonBody } from "@/components/learn/LessonBody";
import { Lift } from "@/components/motion/Lift";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { formatDate, NewsCard, TypeBadge } from "@/components/news/NewsCard";
import { ToolCompact } from "@/components/tools/ToolParts";
import { Tag } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { getTool, withoutBody } from "@/lib/content";
import { hueStyle } from "@/lib/levels";
import { getCheckedNews, lessonLink, relatedNews } from "@/lib/related";
import { NEWS_TYPES } from "@/lib/taxonomy";
import "@/components/learn/lesson.css";

type Props = PageProps<"/news/[slug]">;

export function generateStaticParams() {
  return getCheckedNews().map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = getCheckedNews().find((n) => n.slug === slug);
  return item ? { title: item.title, description: item.summary } : {};
}

export default function NewsItemPage(props: Props) {
  return (
    <Suspense>
      <NewsItemView params={props.params} />
    </Suspense>
  );
}

async function NewsItemView({ params }: Pick<Props, "params">) {
  const { slug } = await params;
  const item = getCheckedNews().find((n) => n.slug === slug);
  if (!item) notFound();

  const lesson = item.relatedLesson ? lessonLink(item.relatedLesson) : undefined;
  const tool = item.relatedTool ? getTool(item.relatedTool) : undefined;
  const more = relatedNews(item);
  const hue = NEWS_TYPES[item.type].hue;

  return (
    <div style={hue === "neutral" ? undefined : hueStyle(hue)} className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
      <Stagger className="pt-10 sm:pt-14">
        <StaggerItem>
          <Link href="/news" className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground">
            <ArrowLeft className="size-4" aria-hidden /> All news
          </Link>
        </StaggerItem>
        <StaggerItem>
          <div className="mt-10 flex flex-wrap items-center gap-2 text-sm text-muted">
            <TypeBadge type={item.type} />
            <time dateTime={item.date}>{formatDate(item.date, "long")}</time>
            <span aria-hidden>·</span>
            <span>{item.source}</span>
          </div>
        </StaggerItem>
        <StaggerItem>
          <h1 className="mt-4 text-4xl leading-[1.05] font-bold text-foreground sm:text-5xl">{item.title}</h1>
        </StaggerItem>
        <StaggerItem>
          <p className="mt-5 text-lg leading-relaxed text-muted sm:text-xl">{item.summary}</p>
          <div className="mt-6 flex gap-3 rounded-2xl border-l-4 border-level bg-level/[0.07] p-5">
            <Lightbulb className="mt-0.5 size-5 shrink-0 text-level" aria-hidden />
            <p className="text-foreground">
              <span className="font-semibold">Why it matters: </span>
              {item.whyItMatters}
            </p>
          </div>
          {item.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-1.5">
              {item.tags.map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </div>
          )}
        </StaggerItem>
      </Stagger>

      {item.body && (
        <Reveal delay={0.15} className="mt-12">
          <article className="lesson-body">
            <LessonBody source={item.body} file={item.file} />
          </article>
        </Reveal>
      )}

      <Reveal className="mt-10">
        <ButtonLink href={item.sourceUrl} variant="secondary">
          Read the original at {item.source} <ArrowUpRight className="size-4" aria-hidden />
        </ButtonLink>
      </Reveal>

      {(lesson || tool) && (
        <section aria-labelledby="related" className="mt-16">
          <Reveal>
            <h2 id="related" className="text-2xl font-bold text-foreground">
              Learn more here
            </h2>
          </Reveal>
          <Stagger className="mt-5 grid gap-4">
            {lesson && (
              <StaggerItem>
                <Lift>
                  <Link
                    href={lesson.href}
                    className="group flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-accent"
                  >
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                      <BookOpen className="size-5" aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="text-xs font-semibold text-muted">Lesson</span>
                      <span className="block font-display text-lg font-bold text-foreground">{lesson.title}</span>
                    </span>
                    <ArrowRight className="size-5 text-muted transition-transform group-hover:translate-x-1" aria-hidden />
                  </Link>
                </Lift>
              </StaggerItem>
            )}
            {tool && (
              <StaggerItem>
                <Lift>
                  <ToolCompact tool={tool} />
                </Lift>
              </StaggerItem>
            )}
          </Stagger>
        </section>
      )}

      {more.length > 0 && (
        <section aria-labelledby="more-news" className="mt-16">
          <Reveal>
            <h2 id="more-news" className="text-2xl font-bold text-foreground">
              More like this
            </h2>
          </Reveal>
          <Stagger className="mt-5 grid gap-4">
            {more.map((n) => (
              <StaggerItem key={n.slug}>
                <NewsCard item={withoutBody(n)} />
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      )}
    </div>
  );
}
