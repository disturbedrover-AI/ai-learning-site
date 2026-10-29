import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono, Inter } from "next/font/google";
import { Providers } from "@/components/theme/ThemeProvider";
import { Suspense } from "react";
import { Header, HeaderFrame } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { site } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Display font for headings in every theme. "opsz" makes big sizes tighter and bolder-looking.
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  axes: ["opsz"],
});

// Fonts used only by some themes (see app/themes.css). Not preloaded, so
// visitors only download them when a theme that uses them is active.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  preload: false,
});

export const metadata: Metadata = {
  title: { default: site.name, template: `%s · ${site.name}` },
  description: site.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: the saved theme is applied to <html> before React loads.
    <html
      lang="en"
      suppressHydrationWarning
      // Lets Next turn off smooth scrolling while it changes pages.
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Providers>
          {/* Pages rendered per request (e.g. the Lab) learn their address later; meanwhile the header shows unhighlighted. */}
          <Suspense fallback={<HeaderFrame pathname={null} />}>
            <Header />
          </Suspense>
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
