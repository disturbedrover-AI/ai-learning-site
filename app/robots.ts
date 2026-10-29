import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/** /robots.txt: everything public may be indexed; private areas may not. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/lab", "/account", "/login", "/auth", "/api"] },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
