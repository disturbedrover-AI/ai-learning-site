"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { flushSync } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "next-themes";
import { crossFade, popover } from "@/lib/motion";
import { defaultTheme, themes } from "@/lib/themes";

const options = [{ id: "system", label: "System" }, ...themes];

// True only in the browser, so we never render a theme name the server couldn't know.
const subscribe = () => () => {};
function useMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

/** A small circle painted with a theme's own colours. */
function Swatch({ id }: { id: string }) {
  if (id === "system") {
    return (
      <span className="relative inline-flex size-5 overflow-hidden rounded-full border border-border">
        <span data-theme="light" className="h-full w-1/2 bg-background" />
        <span data-theme="dark" className="h-full w-1/2 bg-background" />
      </span>
    );
  }
  return (
    <span
      data-theme={id}
      className="inline-flex size-5 items-center justify-center rounded-full border border-border bg-background"
    >
      <span className="size-2 rounded-full bg-accent" />
    </span>
  );
}

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // A saved theme that no longer exists (e.g. it was removed) falls back to the default.
  useEffect(() => {
    if (theme && !options.some((o) => o.id === theme)) setTheme(defaultTheme);
  }, [theme, setTheme]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const current = options.find((o) => o.id === theme);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Change theme"
        className="flex h-9 items-center gap-2 rounded-full border border-border bg-surface px-2.5 text-sm text-foreground transition-colors hover:border-accent"
      >
        {mounted && current ? (
          <Swatch id={current.id} />
        ) : (
          <span className="size-5 rounded-full border border-border" />
        )}
        <span className="hidden min-w-16 text-left sm:inline">
          {mounted ? current?.label : "Theme"}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            aria-label="Themes"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={popover}
            className="absolute right-0 z-50 mt-2 w-52 origin-top-right rounded-2xl border border-border bg-surface p-1.5 shadow-lg shadow-black/5"
          >
            {options.map((option) => {
              const selected = mounted && theme === option.id;
              return (
                <li key={option.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => {
                      setOpen(false);
                      // flushSync applies the new theme inside the cross-fade.
                      crossFade(() => flushSync(() => setTheme(option.id)));
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left text-sm text-foreground transition-colors hover:bg-background"
                  >
                    <Swatch id={option.id} />
                    <span className="flex-1">{option.label}</span>
                    {selected && (
                      <svg viewBox="0 0 20 20" className="size-4 text-accent" fill="currentColor" aria-hidden>
                        <path d="M7.7 13.3 4.4 10l-1.1 1.1 4.4 4.4 9-9-1.1-1.1z" />
                      </svg>
                    )}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
