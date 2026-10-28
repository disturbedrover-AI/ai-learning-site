import type { Metadata } from "next";
import { Figtree, Geist, Geist_Mono, Inter } from "next/font/google";
import { Providers } from "@/components/theme/ThemeProvider";
import { Header } from "@/components/layout/Header";
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

// Fonts used only by some themes (see app/themes.css). Not preloaded, so
// visitors only download them when a theme that uses them is active.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  preload: false,
});

const figtree = Figtree({
  variable: "--font-figtree",
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
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${figtree.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
