"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { MotionConfig, useReducedMotion } from "framer-motion";
import { defaultTheme, themeIds } from "@/lib/themes";

export function Providers({ children }: { children: React.ReactNode }) {
  // Visitors with "reduce motion" turned on get every animation finished instantly.
  const reduceMotion = useReducedMotion() ?? false;

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
      <MotionConfig reducedMotion="user" skipAnimations={reduceMotion}>
        {children}
      </MotionConfig>
    </NextThemesProvider>
  );
}
