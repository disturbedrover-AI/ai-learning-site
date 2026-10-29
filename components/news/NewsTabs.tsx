"use client";

import { useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { Newspaper, Radar } from "lucide-react";
import { slide } from "@/lib/motion";

type Tab = "posts" | "radar";

// The open tab lives in the address (#radar), so links and the back button work.
const readTab = (): Tab => (window.location.hash === "#radar" ? "radar" : "posts");
function subscribeToHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

/**
 * "Posts" (curated, the default) and "Radar" (automatic headlines). Both panels
 * are rendered on the server; this only switches which one shows. #radar in the
 * address opens the Radar tab.
 */
export function NewsTabs({
  posts,
  radar,
  radarCount,
}: {
  posts: React.ReactNode;
  radar: React.ReactNode;
  radarCount: number;
}) {
  const tab = useSyncExternalStore(subscribeToHash, readTab, () => "posts" as Tab);

  const choose = (next: Tab) => {
    history.replaceState(null, "", next === "radar" ? "#radar" : window.location.pathname);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  };

  const tabs = [
    { id: "posts" as const, label: "Posts", icon: Newspaper, hint: "Curated, with why each one matters" },
    { id: "radar" as const, label: "Radar", icon: Radar, hint: `${radarCount} fresh headlines from AI sources` },
  ];

  return (
    <div>
      <div role="tablist" aria-label="News views" className="flex flex-wrap gap-2 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            onClick={() => choose(t.id)}
            className={`relative -mb-px flex items-center gap-2 px-4 pt-2 pb-3 text-left transition-colors ${
              tab === t.id ? "text-foreground" : "text-muted hover:text-foreground"
            }`}
          >
            <t.icon className="size-4" aria-hidden />
            <span>
              <span className="block font-display text-lg font-bold">{t.label}</span>
              <span className="hidden text-xs text-muted sm:block">{t.hint}</span>
            </span>
            {tab === t.id && (
              <motion.span layoutId="news-tab" className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-accent" transition={slide} />
            )}
          </button>
        ))}
      </div>
      <div id="panel-posts" role="tabpanel" aria-labelledby="tab-posts" hidden={tab !== "posts"} className="pt-10">
        {posts}
      </div>
      <div id="panel-radar" role="tabpanel" aria-labelledby="tab-radar" hidden={tab !== "radar"} className="pt-10">
        {radar}
      </div>
    </div>
  );
}
