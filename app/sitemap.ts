import type { MetadataRoute } from "next";
import { getNews, getTools } from "@/lib/content";
import { getCourses, trackLessons } from "@/lib/courses";
import { site } from "@/lib/site";

/**
 * /sitemap.xml: the public pages, built from the content files. Draft courses
 * (unless SHOW_DRAFTS is on) and the private Lab are never listed.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => `${site.url}${path}`;
  const courses = getCourses();
  return [
    ...["/", "/learn", "/learn/glossary", "/news", "/tools"].map((path) => ({ url: url(path) })),
    ...courses.flatMap((course) => [
      // A one-track course's own page just redirects to its track.
      ...(course.tracks.length > 1 ? [{ url: url(`/learn/${course.slug}`) }] : []),
      ...course.tracks.flatMap((track) => [
        { url: url(`/learn/${course.slug}/${track.slug}`) },
        ...trackLessons(track).map(({ lesson }) => ({ url: url(`/learn/${course.slug}/${track.slug}/${lesson.slug}`) })),
      ]),
    ]),
    ...getNews().map((item) => ({ url: url(`/news/${item.slug}`), lastModified: item.date })),
    ...getTools().map((tool) => ({ url: url(`/tools/${tool.slug}`), lastModified: tool.dateAdded })),
  ];
}
