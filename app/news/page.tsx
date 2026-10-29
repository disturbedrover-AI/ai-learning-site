import type { Metadata } from "next";
import { Rss } from "lucide-react";
import { NewsBrowser } from "@/components/news/NewsBrowser";
import { NewsCard, type NewsSummary } from "@/components/news/NewsCard";
import { Lift } from "@/components/motion/Lift";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { ButtonLink } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { withoutBody } from "@/lib/content";
import { getCheckedNews } from "@/lib/related";

export const metadata: Metadata = {
  title: "News",
  alternates: { types: { "application/rss+xml": "/news/rss.xml" } },
};

export default function NewsPage() {
  // Only what the cards need, so the full text isn't sent to the browser.
  const items: NewsSummary[] = getCheckedNews().map(withoutBody);
  const featured = items.filter((i) => i.featured);

  return (
    <div className="mx-auto max-w-5xl px-4 pb-12 sm:px-6">
      <PageHeader
        eyebrow="News"
        title="What's new in AI"
        description="Short, clear updates on what's happening, with a line on why each one matters if you're just starting out."
      />
      <Reveal className="-mt-6 mb-12">
        <ButtonLink href="/news/rss.xml" variant="secondary" className="px-4 py-2">
          <Rss className="size-4" aria-hidden /> RSS feed
        </ButtonLink>
      </Reveal>

      {featured.length > 0 && (
        <section aria-labelledby="featured-news" className="mb-16">
          <Reveal>
            <h2 id="featured-news" className="text-2xl font-bold text-foreground">
              Featured
            </h2>
          </Reveal>
          <Stagger className="mt-5 grid gap-5 md:grid-cols-2">
            {featured.map((item) => (
              <StaggerItem key={item.slug}>
                <Lift>
                  <NewsCard item={item} large />
                </Lift>
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      )}

      <Reveal>
        <h2 className="mb-5 text-2xl font-bold text-foreground">All news</h2>
      </Reveal>
      <NewsBrowser items={items} />
    </div>
  );
}
