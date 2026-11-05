import { CloudOff } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";

/**
 * Shown on account pages (sign-in, account, the Lab) while Supabase is configured
 * but not answering: paused, a network problem, or too slow.
 */
export function AccountsUnavailable({ className = "" }: { className?: string }) {
  return (
    <div role="status" className={`mx-auto max-w-lg rounded-3xl border border-border bg-surface px-6 py-12 text-center sm:px-10 ${className}`}>
      <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
        <CloudOff className="size-6" aria-hidden />
      </span>
      <h2 className="mt-5 text-3xl font-bold text-foreground">Accounts are temporarily unavailable</h2>
      <p className="mt-3 text-muted">
        Everything else still works: lessons, news, tools and the glossary are all here, and your progress is saved
        in this browser for now. Please try again in a few minutes.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/learn">Keep learning</ButtonLink>
        <ButtonLink href="/" variant="secondary">
          Home
        </ButtonLink>
      </div>
    </div>
  );
}
