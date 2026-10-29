/**
 * Links between news, tools and lessons:
 *   - a news item can name a related lesson and tool (relatedLesson, relatedTool);
 *   - a tool page lists news about it and the lessons that mention it.
 * Broken links in content files fail loudly, naming the file.
 */
import { getLessons, getNews, getTools, type NewsItem, type Tool } from "./content";
import { findLessonHome, trackLessons } from "./courses";

export type LessonLink = { slug: string; title: string; summary: string; href: string };

/** Where a lesson can be read (its first track), or undefined if no visible track lists it. */
export function lessonLink(slug: string): LessonLink | undefined {
  const home = findLessonHome(slug);
  const item = home && trackLessons(home.track).find((i) => i.lesson.slug === slug);
  return home && item
    ? {
        slug,
        title: item.lesson.title,
        summary: item.lesson.summary,
        href: `/learn/${home.course.slug}/${home.track.slug}/${slug}`,
      }
    : undefined;
}

/** All news, after checking that every relatedLesson and relatedTool exists. */
export function getCheckedNews(): NewsItem[] {
  const lessons = new Set(getLessons({ drafts: true }).map((l) => l.slug));
  const tools = new Set(getTools().map((t) => t.slug));
  const news = getNews();
  for (const item of news) {
    if (item.relatedLesson && !lessons.has(item.relatedLesson)) {
      throw new Error(`${item.file}: relatedLesson "${item.relatedLesson}" isn't a lesson in content/lessons.`);
    }
    if (item.relatedTool && !tools.has(item.relatedTool)) {
      throw new Error(`${item.file}: relatedTool "${item.relatedTool}" isn't a tool in content/tools.`);
    }
  }
  return news;
}

const sameTag = (a: string[], b: string[]) => a.some((t) => b.some((u) => t.toLowerCase() === u.toLowerCase()));

/** News about a tool: items that name it first, then items sharing a tag. Newest first within each. */
export function newsForTool(tool: Tool): NewsItem[] {
  const news = getCheckedNews();
  const named = news.filter((n) => n.relatedTool === tool.slug);
  const tagged = news.filter((n) => n.relatedTool !== tool.slug && sameTag(n.tags, tool.tags));
  return [...named, ...tagged];
}

/** Lessons that mention a tool by name or show it with <ToolCard slug="…" />. */
export function lessonsForTool(tool: Tool): LessonLink[] {
  const name = new RegExp(`\\b${tool.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
  const card = new RegExp(`<ToolCard\\s+slug="${tool.slug}"`);
  return getLessons()
    .filter((l) => name.test(l.body) || card.test(l.body))
    .flatMap((l) => lessonLink(l.slug) ?? []);
}

/** Other news like this one (same type or a shared tag), newest first. */
export function relatedNews(item: NewsItem, limit = 3): NewsItem[] {
  return getCheckedNews()
    .filter((n) => n.slug !== item.slug && (n.type === item.type || sameTag(n.tags, item.tags)))
    .slice(0, limit);
}
