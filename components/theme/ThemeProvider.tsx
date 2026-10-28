"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { MotionConfig } from "framer-motion";
import { defaultTheme, themeIds } from "@/lib/themes";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      themes={themeIds}
      defaultTheme={defaultTheme}
      enableSystem
      storageKey="theme"
      // Run the theme script only from the server HTML (avoids React's
      // "script tag in component" warning on the client).
      scriptProps={{
        type: typeof window === "undefined" ? "text/javascript" : "text/plain",
        suppressHydrationWarning: true,
      }}
    >
      {/* Respect the visitor's "reduce motion" system setting. */}
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </NextThemesProvider>
  );
}
