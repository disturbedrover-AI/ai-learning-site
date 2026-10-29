export const site = {
  name: "AI Learning",
  description:
    "Learn artificial intelligence step by step: clear lessons, curated news, and useful tools.",
  /** The site's public address, used for full links (e.g. the RSS feed, the Radar's user agent). Server-side only. */
  url: siteUrl(),
};

/**
 * NEXT_PUBLIC_SITE_URL if set (use it once you have your own domain). Otherwise, on
 * Vercel, the production address Vercel provides automatically. Only when neither
 * exists (your own computer) does it fall back to the local dev server.
 */
function siteUrl() {
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  const url = process.env.NEXT_PUBLIC_SITE_URL || (vercel ? `https://${vercel}` : `http://localhost:${process.env.PORT ?? 3000}`);
  return url.replace(/\/$/, "");
}

export const navItems = [
  { href: "/", label: "Home" },
  { href: "/learn", label: "Learn" },
  { href: "/news", label: "News" },
  { href: "/tools", label: "Tools" },
  { href: "/lab", label: "Lab" },
] as const;
