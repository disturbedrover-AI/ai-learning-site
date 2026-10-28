import type { Metadata } from "next";
import { FadeIn } from "@/components/motion/FadeIn";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "Lab" };

// Placeholder. Sign-in and permissions will be added here later.
export default function LabPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <PageHeader
        eyebrow="Lab"
        title="The Lab"
        description="A space for hands-on experiments. Coming soon."
      />
      <FadeIn delay={0.1}>
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-surface px-6 py-16 text-center">
          <span className="flex size-12 items-center justify-center rounded-full border border-border bg-background text-accent">
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
              <rect x="5" y="11" width="14" height="9" rx="2" />
              <path d="M8 11V8a4 4 0 0 1 8 0v3" />
            </svg>
          </span>
          <p className="mt-4 font-medium text-foreground">Members only, coming soon</p>
          <p className="mt-1 max-w-sm text-sm text-muted">
            Sign-in and access controls will be added before the Lab opens.
          </p>
        </div>
      </FadeIn>
    </div>
  );
}
