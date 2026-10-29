import { site } from "@/lib/site";
import { getCheckedNews } from "@/lib/related";
import { NEWS_TYPES } from "@/lib/taxonomy";

const escape = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** /news/rss.xml: the news as an RSS feed, built from content/news when the site is built. */
export function GET() {
  const items = getCheckedNews()
    .map((item) => {
      const link = `${site.url}/news/${item.slug}`;
      return `    <item>
      <title>${escape(item.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${new Date(`${item.date}T00:00:00Z`).toUTCString()}</pubDate>
      <category>${escape(NEWS_TYPES[item.type].label)}</category>
      <description>${escape(`${item.summary} Why it matters: ${item.whyItMatters}`)}</description>
      <source url="${escape(item.sourceUrl)}">${escape(item.source)}</source>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(site.name)}: News</title>
    <link>${site.url}/news</link>
    <atom:link href="${site.url}/news/rss.xml" rel="self" type="application/rss+xml" />
    <description>${escape("Short, clear updates on what's happening in AI.")}</description>
    <language>en</language>
${items}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
