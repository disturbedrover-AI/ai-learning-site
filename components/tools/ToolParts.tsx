import Link from "next/link";
import { AppWindow, Apple, ArrowRight, Globe, Smartphone, Terminal } from "lucide-react";
import type { Tool } from "@/lib/content";
import { hueStyle } from "@/lib/levels";
import { initials, PLATFORMS, PRICING, TOOL_CATEGORIES, type Platform } from "@/lib/taxonomy";

/** What tool cards need (no body text, so lists stay small). */
export type ToolSummary = Omit<Tool, "body" | "file">;

/** Sets --level to the tool's category colour for everything inside. */
export const categoryStyle = (tool: Pick<Tool, "category">) => {
  const hue = TOOL_CATEGORIES[tool.category].hue;
  return hue === "neutral" ? undefined : hueStyle(hue);
};

/** Logo placeholder: the tool's initials in its category colour. */
export function ToolLogo({ tool, size = "md" }: { tool: Pick<Tool, "name" | "category">; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "size-9 rounded-xl text-xs", md: "size-12 rounded-2xl text-sm", lg: "size-20 rounded-3xl text-2xl" };
  return (
    <span
      aria-hidden
      style={categoryStyle(tool)}
      className={`flex shrink-0 items-center justify-center bg-level/12 font-display font-extrabold text-level ${sizes[size]}`}
    >
      {initials(tool.name)}
    </span>
  );
}

/** Pricing and open-source badges. */
export function ToolBadges({ tool }: { tool: Pick<Tool, "pricing" | "openSource"> }) {
  return (
    <span className="flex flex-wrap gap-1.5">
      <span
        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
          tool.pricing === "free" ? "bg-success/12 text-success" : "border border-border text-muted"
        }`}
      >
        {PRICING[tool.pricing]}
      </span>
      {tool.openSource && (
        <span className="rounded-full bg-foreground/[0.06] px-2.5 py-0.5 text-xs font-semibold text-foreground">
          Open source
        </span>
      )}
    </span>
  );
}

const platformIcons: Record<Platform, typeof Globe> = {
  web: Globe,
  mac: Apple,
  windows: AppWindow,
  linux: Terminal,
  mobile: Smartphone,
};

/** Small icons for where a tool runs, with names for screen readers and on hover. */
export function PlatformIcons({ platforms }: { platforms: Platform[] }) {
  return (
    <span className="flex items-center gap-1.5 text-muted" aria-label={`Runs on: ${platforms.map((p) => PLATFORMS[p]).join(", ")}`}>
      {platforms.map((p) => {
        const Icon = platformIcons[p];
        return (
          <span key={p} title={PLATFORMS[p]} className="flex">
            <Icon className="size-4" aria-hidden />
          </span>
        );
      })}
    </span>
  );
}

/** A compact, linked tool card: used inside lessons and news items. */
export function ToolCompact({ tool }: { tool: ToolSummary }) {
  return (
    <Link
      href={`/tools/${tool.slug}`}
      style={categoryStyle(tool)}
      className="group flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 transition-[border-color,box-shadow] hover:border-level/50 hover:ring-4 hover:ring-level/10"
    >
      <ToolLogo tool={tool} />
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-display text-lg font-bold text-foreground">{tool.name}</span>
          <ToolBadges tool={tool} />
        </span>
        <span className="mt-0.5 block text-sm leading-snug text-muted">{tool.tagline}</span>
      </span>
      <ArrowRight className="size-5 shrink-0 text-muted transition-transform group-hover:translate-x-1 group-hover:text-level" aria-hidden />
    </Link>
  );
}
