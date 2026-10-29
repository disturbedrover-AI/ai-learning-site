import type { Metadata } from "next";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { Card, Tag } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { getNews } from "@/lib/content";

export const metadata: Metadata = { title: "News" };

const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(
    new Date(date),
  );

export default function NewsPage() {
  const news = getNews();

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6">
      <PageHeader
        eyebrow="News"
        title="What's new in AI"
        description="Short, clear updates on what's happening and why it matters."
      />

      <Stagger className="flex flex-col gap-4">
        {news.map((item) => (
          <StaggerItem key={item.slug}>
            <Card>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                <time dateTime={item.date}>{formatDate(item.date)}</time>
                {item.source && <span>· {item.source}</span>}
              </div>
              <h2 className="mt-2 text-lg font-semibold text-foreground">
                {item.sourceUrl ? (
                  <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="hover:text-accent">
                    {item.title}
                  </a>
                ) : (
                  item.title
                )}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.summary}</p>
              {item.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {item.tags.map((t) => (
                    <Tag key={t}>{t}</Tag>
                  ))}
                </div>
              )}
            </Card>
          </StaggerItem>
        ))}
        {news.length === 0 && <p className="text-muted">No news yet.</p>}
      </Stagger>
    </div>
  );
}
