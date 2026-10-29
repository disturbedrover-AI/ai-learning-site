import type { Metadata } from "next";

// The Lab is private: never in search engines (see also robots.ts and proxy.ts).
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default function LabLayout({ children }: LayoutProps<"/lab">) {
  return children;
}
