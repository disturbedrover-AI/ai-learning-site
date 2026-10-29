"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Loader2, Mail, MailCheck } from "lucide-react";
import { oauthProviders, type OAuthProviderId } from "@/lib/auth/providers";
import { popover } from "@/lib/motion";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { Button, ButtonLink } from "@/components/ui/Button";
import { displayName, useAuth } from "./AuthProvider";

/** Brand marks, drawn in the current text colour so they suit every theme. */
const providerIcons: Record<OAuthProviderId, React.ReactNode> = {
  google: (
    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
      <path d="M21.35 11.1H12v2.98h5.35c-.5 2.43-2.6 3.83-5.35 3.83a5.9 5.9 0 0 1 0-11.82c1.47 0 2.8.53 3.83 1.4l2.24-2.24A9.07 9.07 0 0 0 12 2.9a9.1 9.1 0 1 0 0 18.2c4.55 0 8.68-3.3 8.68-9.1 0-.64-.1-1.33-.24-1.9z" />
    </svg>
  ),
  linkedin_oidc: (
    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
    </svg>
  ),
};

/** Only send people back to pages on this site. */
const safeNext = (next: string | null) => (next && next.startsWith("/") && !next.startsWith("//") ? next : "/learn");

export function LoginForm() {
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const { configured, loading, user, profile } = useAuth();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState(
    params.get("error") ? "That sign-in link didn't work. It may have expired or been used already. Try again." : "",
  );

  const redirectTo = () => `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    setStatus("sending");
    setError("");
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo() } });
    if (error) {
      setStatus("idle");
      setError(error.message);
    } else {
      setStatus("sent");
    }
  }

  async function signInWith(provider: OAuthProviderId) {
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: redirectTo() } });
    if (error) setError(error.message);
  }

  return (
    <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-7 shadow-xl shadow-black/5 sm:p-9">
      <p className="text-xs font-semibold tracking-[0.14em] text-accent uppercase">Your account</p>
      <h1 className="mt-3 text-4xl font-bold text-foreground">Sign in</h1>
      <p className="mt-3 leading-relaxed text-muted">
        Save your progress and pick up where you left off on any device. No password needed.
      </p>

      {!configured ? (
        <p className="mt-8 rounded-2xl border border-dashed border-border px-4 py-5 text-sm text-muted">
          Accounts aren&apos;t set up on this site yet. Your progress is saved in this browser in the meantime.
        </p>
      ) : !loading && user ? (
        <div className="mt-8 space-y-4">
          <p className="text-sm text-foreground">
            You&apos;re signed in as <strong>{displayName(user, profile)}</strong>.
          </p>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href={next}>
              Continue <ArrowRight className="size-4" aria-hidden />
            </ButtonLink>
            <ButtonLink href="/account" variant="secondary">
              Your account
            </ButtonLink>
          </div>
        </div>
      ) : (
        <AnimatePresence mode="wait" initial={false}>
          {status === "sent" ? (
            <motion.div
              key="sent"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={popover}
              className="mt-8 rounded-2xl border border-success/40 bg-success/10 p-5"
              role="status"
            >
              <MailCheck className="size-6 text-success" aria-hidden />
              <p className="mt-3 font-display text-lg font-bold text-foreground">Check your email</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                We sent a sign-in link to <strong className="text-foreground">{email}</strong>. Open it on this device
                to finish signing in.
              </p>
              <button
                type="button"
                onClick={() => setStatus("idle")}
                className="mt-4 text-sm font-semibold text-accent hover:underline"
              >
                Use a different email
              </button>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={popover}>
              <form onSubmit={sendLink} className="mt-8">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none transition-colors placeholder:text-muted focus:border-accent"
                />
                <Button type="submit" disabled={status === "sending"} className="mt-4 w-full disabled:opacity-70">
                  {status === "sending" ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                  ) : (
                    <Mail className="size-4" aria-hidden />
                  )}
                  Email me a sign-in link
                </Button>
              </form>

              {oauthProviders.length > 0 && (
                <>
                  <div className="my-6 flex items-center gap-3 text-xs text-muted" aria-hidden>
                    <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
                  </div>
                  <div className="grid gap-3">
                    {oauthProviders.map((p) => (
                      <Button key={p.id} variant="secondary" onClick={() => signInWith(p.id)} className="w-full">
                        {providerIcons[p.id]} Continue with {p.label}
                      </Button>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {error && (
        <p role="alert" className="mt-5 rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground">
          {error}
        </p>
      )}

      <p className="mt-8 text-xs leading-relaxed text-muted">
        Not ready to sign in? Everything still works: your progress stays in this browser.{" "}
        <Link href={next} className="font-medium text-foreground hover:underline">
          Keep learning
        </Link>
      </p>
    </div>
  );
}
