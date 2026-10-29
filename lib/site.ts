export const site = {
  name: "AI Learning",
  description:
    "Learn artificial intelligence step by step: clear lessons, curated news, and useful tools.",
  /** The site's public address, used for full links (e.g. in the RSS feed). Set NEXT_PUBLIC_SITE_URL when it goes live. */
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
};

export const navItems = [
  { href: "/", label: "Home" },
  { href: "/learn", label: "Learn" },
  { href: "/news", label: "News" },
  { href: "/tools", label: "Tools" },
  { href: "/lab", label: "Lab" },
] as const;
