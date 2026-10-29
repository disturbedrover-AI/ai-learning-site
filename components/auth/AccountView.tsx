"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, LogOut, Trash2 } from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { popover } from "@/lib/motion";
import { useProgress } from "@/components/learn/progress";
import { Button, ButtonLink } from "@/components/ui/Button";
import { avatarUrl, displayName, useAuth } from "./AuthProvider";
import { Avatar } from "./Avatar";

const roleNames = { user: "Learner", member: "Member", owner: "Owner" } as const;

/** /account: name, avatar, sign out, and deleting your data. */
export function AccountView() {
  const router = useRouter();
  const params = useSearchParams();
  const { configured, loading, user, profile, refreshProfile, signOut } = useAuth();
  const progress = useProgress();

  // Signed out: go to sign-in, then come back here.
  useEffect(() => {
    if (configured && !loading && !user) router.replace("/login?next=/account");
  }, [configured, loading, user, router]);

  if (!configured) {
    return <Panel>Accounts aren&apos;t set up on this site yet.</Panel>;
  }
  if (loading || !user) {
    return (
      <Panel>
        <Loader2 className="size-5 animate-spin text-muted" aria-label="Loading" />
      </Panel>
    );
  }

  const name = displayName(user, profile);
  const needs = params.get("needs");

  return (
    <div className="space-y-6">
      {needs && (
        <p className="rounded-2xl border border-accent/40 bg-accent/10 px-5 py-4 text-sm text-foreground" role="status">
          That area is for <strong>{needs}s</strong>. Your account doesn&apos;t have access yet.
        </p>
      )}

      <section className="rounded-3xl border border-border bg-surface p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-5">
          <Avatar name={name} src={avatarUrl(user, profile)} size={72} />
          <div className="min-w-0">
            <p className="truncate font-display text-2xl font-bold text-foreground">{name}</p>
            <p className="truncate text-sm text-muted">{user.email}</p>
            <p className="mt-2 inline-flex rounded-full border border-border bg-background px-2.5 py-0.5 text-xs font-semibold text-foreground">
              {roleNames[profile?.role ?? "user"]}
            </p>
          </div>
        </div>
        <NameForm
          key={profile?.display_name ?? ""}
          initial={profile?.display_name ?? ""}
          onSave={async (displayName) => {
            const supabase = getSupabaseBrowser();
            const { error } = await supabase!.from("profiles").update({ display_name: displayName }).eq("id", user.id);
            if (error) throw error;
            await refreshProfile();
          }}
        />
      </section>

      <section className="rounded-3xl border border-border bg-surface p-6 sm:p-8">
        <h2 className="text-xl font-bold text-foreground">Your progress</h2>
        <p className="mt-1 text-sm text-muted">
          {progress.completed.length} {progress.completed.length === 1 ? "lesson" : "lessons"} completed, saved to your
          account.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <ButtonLink href="/learn" variant="secondary">
            Go to courses
          </ButtonLink>
          <Button
            variant="secondary"
            onClick={async () => {
              await signOut();
              router.push("/");
            }}
          >
            <LogOut className="size-4" aria-hidden /> Sign out
          </Button>
        </div>
      </section>

      <section className="rounded-3xl border border-border p-6 sm:p-8">
        <h2 className="text-xl font-bold text-foreground">Delete my data</h2>
        <p className="mt-1 text-sm text-muted">These can&apos;t be undone.</p>
        <div className="mt-5 space-y-4">
          <DangerAction
            label="Delete my progress"
            detail="Clears every completed lesson and “continue” point. Your account stays."
            onConfirm={() => progress.clearAll()}
          />
          <DangerAction
            label="Delete my account"
            detail="Removes your account, profile and progress for good, and signs you out."
            onConfirm={async () => {
              const supabase = getSupabaseBrowser();
              const { error } = await supabase!.rpc("delete_my_account");
              if (error) throw error;
              await signOut();
              router.push("/");
            }}
          />
        </div>
      </section>
    </div>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-48 items-center justify-center rounded-3xl border border-border bg-surface p-8 text-muted">
      {children}
    </div>
  );
}

function NameForm({ initial, onSave }: { initial: string; onSave: (name: string) => Promise<void> }) {
  const [value, setValue] = useState(initial);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  return (
    <form
      className="mt-8"
      onSubmit={async (e) => {
        e.preventDefault();
        setState("saving");
        try {
          await onSave(value.trim());
          setState("saved");
        } catch {
          setState("error");
        }
      }}
    >
      <label htmlFor="display-name" className="text-sm font-medium text-foreground">
        Display name
      </label>
      <div className="mt-2 flex flex-wrap gap-3">
        <input
          id="display-name"
          value={value}
          maxLength={80}
          onChange={(e) => {
            setValue(e.target.value);
            setState("idle");
          }}
          className="min-w-0 flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-foreground outline-none transition-colors focus:border-accent"
        />
        <Button type="submit" disabled={state === "saving" || value.trim() === initial} className="py-2.5 disabled:opacity-50">
          {state === "saved" ? <Check className="size-4" aria-hidden /> : null}
          {state === "saved" ? "Saved" : "Save"}
        </Button>
      </div>
      {state === "error" && <p className="mt-2 text-sm text-foreground">Couldn&apos;t save. Please try again.</p>}
    </form>
  );
}

/** A destructive button that asks "Are you sure?" before acting. */
function DangerAction({ label, detail, onConfirm }: { label: string; detail: string; onConfirm: () => Promise<void> }) {
  const [step, setStep] = useState<"idle" | "confirm" | "working" | "done" | "error">("idle");
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-surface px-5 py-4">
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-foreground">{label}</p>
        <p className="mt-0.5 text-sm text-muted">{detail}</p>
        {step === "error" && <p className="mt-1 text-sm text-foreground">Something went wrong. Please try again.</p>}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        {step === "confirm" || step === "working" ? (
          <motion.div key="confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={popover} className="flex gap-2">
            <Button variant="secondary" className="px-4 py-2" onClick={() => setStep("idle")} disabled={step === "working"}>
              Cancel
            </Button>
            <Button
              className="px-4 py-2"
              disabled={step === "working"}
              onClick={async () => {
                setStep("working");
                try {
                  await onConfirm();
                  setStep("done");
                } catch {
                  setStep("error");
                }
              }}
            >
              {step === "working" ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Trash2 className="size-4" aria-hidden />}
              Yes, delete
            </Button>
          </motion.div>
        ) : step === "done" ? (
          <motion.p key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={popover} className="text-sm font-semibold text-success">
            Done
          </motion.p>
        ) : (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={popover}>
            <Button variant="secondary" className="px-4 py-2" onClick={() => setStep("confirm")}>
              <Trash2 className="size-4" aria-hidden /> {label}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
