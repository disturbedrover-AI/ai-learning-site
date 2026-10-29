import { KeyRound, Lock, Settings } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { RequestAccessButton } from "./RequestAccessButton";

function Panel({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <Reveal className="mx-auto max-w-lg rounded-3xl border border-border bg-surface px-6 py-12 text-center sm:px-10">
      <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">{icon}</span>
      <h2 className="mt-5 text-3xl font-bold text-foreground">{title}</h2>
      <div className="mt-3 space-y-5 text-muted">{children}</div>
    </Reveal>
  );
}

/** Supabase keys aren't set, so there are no accounts yet. */
export function LabNotConfigured() {
  return (
    <Panel icon={<Settings className="size-6" aria-hidden />} title="The Lab isn't set up yet">
      <p>The Lab needs accounts, which haven&apos;t been switched on for this site yet.</p>
    </Panel>
  );
}

export function LabSignedOut() {
  return (
    <Panel icon={<Lock className="size-6" aria-hidden />} title="Members only">
      <p>The Lab is a private space for experiments and notes. Sign in to see whether you have access.</p>
      <ButtonLink href="/login?next=/lab">Sign in</ButtonLink>
    </Panel>
  );
}

/** Signed in, but not a member: they can ask to join. */
export function LabByInvitation({ request }: { request: { status: string; created_at: string } | null }) {
  return (
    <Panel icon={<KeyRound className="size-6" aria-hidden />} title="Access is by invitation">
      <p>The Lab is open to people the owner has invited. You can ask for access below.</p>
      {request?.status === "pending" ? (
        <p className="rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground" role="status">
          Your request was sent. You&apos;ll have access as soon as it&apos;s approved.
        </p>
      ) : (
        <>
          {request?.status === "declined" && (
            <p className="text-sm">Your last request wasn&apos;t approved. You can ask again.</p>
          )}
          <RequestAccessButton />
        </>
      )}
    </Panel>
  );
}
