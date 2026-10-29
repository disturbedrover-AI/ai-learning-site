"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Inbox, Loader2, UserMinus, UserPlus, X } from "lucide-react";
import { decideRequest, inviteMember, removeMember } from "@/app/lab/actions";
import { Button } from "@/components/ui/Button";
import { formatLabDate } from "./LabBadges";

type Member = { email: string; role: "member" | "owner"; invited_at: string; accepted: boolean; accepted_at: string | null };
type Request = { user_id: string; email: string; message: string | null; created_at: string };

/** /lab/members (owner only): invite people, change or remove access, answer requests. */
export function MembersManager({ allowlist, requests, ownEmail }: { allowlist: Member[]; requests: Request[]; ownEmail: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"member" | "owner">("member");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  /** Run a server action, then reload the lists (or show its error). */
  const run = (action: () => Promise<{ ok: boolean; error?: string }>, after?: () => void) =>
    startTransition(async () => {
      setError("");
      const result = await action();
      if (!result.ok) return setError(result.error ?? "Something went wrong.");
      after?.();
      router.refresh();
    });

  return (
    <div className="space-y-12">
      {error && (
        <p role="alert" className="rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-foreground">
          {error}
        </p>
      )}

      <section aria-labelledby="requests-title">
        <h2 id="requests-title" className="flex items-center gap-2 text-2xl font-bold text-foreground">
          <Inbox className="size-5 text-accent" aria-hidden /> Access requests
        </h2>
        {requests.length === 0 ? (
          <p className="mt-3 text-sm text-muted">No pending requests.</p>
        ) : (
          <ul className="mt-4 divide-y divide-border rounded-2xl border border-border bg-surface">
            {requests.map((r) => (
              <li key={r.user_id} className="flex flex-wrap items-center gap-4 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">{r.email}</p>
                  <p className="text-xs text-muted">Asked {formatLabDate(r.created_at)}</p>
                  {r.message && <p className="mt-1.5 text-sm text-muted">“{r.message}”</p>}
                </div>
                <div className="flex gap-2">
                  <Button className="px-4 py-2" disabled={pending} onClick={() => run(() => decideRequest(r.user_id, true))}>
                    <Check className="size-4" aria-hidden /> Approve
                  </Button>
                  <Button variant="secondary" className="px-4 py-2" disabled={pending} onClick={() => run(() => decideRequest(r.user_id, false))}>
                    <X className="size-4" aria-hidden /> Decline
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="members-title">
        <h2 id="members-title" className="text-2xl font-bold text-foreground">
          Members
        </h2>
        <p className="mt-1 text-sm text-muted">
          People on this list get their role as soon as they sign in with this email (straight away if they already have an account).
        </p>

        <form
          className="mt-5 flex flex-wrap gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            run(() => inviteMember(email, role), () => setEmail(""));
          }}
        >
          <label htmlFor="invite-email" className="sr-only">
            Email to invite
          </label>
          <input
            id="invite-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            className="min-w-60 flex-1 rounded-full border border-border bg-surface px-4 py-2.5 text-foreground outline-none focus:border-accent"
          />
          <label htmlFor="invite-role" className="sr-only">
            Role
          </label>
          <select
            id="invite-role"
            value={role}
            onChange={(e) => setRole(e.target.value as "member" | "owner")}
            className="rounded-full border border-border bg-surface px-4 py-2.5 text-sm text-foreground outline-none focus:border-accent"
          >
            <option value="member">Member (read-only)</option>
            <option value="owner">Owner (can edit)</option>
          </select>
          <Button type="submit" disabled={pending} className="py-2.5">
            {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <UserPlus className="size-4" aria-hidden />}
            Add
          </Button>
        </form>

        <div className="mt-5 overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="bg-surface text-xs tracking-wide text-muted uppercase">
              <tr>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Invited</th>
                <th className="px-4 py-3 font-semibold">Accepted</th>
                <th className="px-4 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {allowlist.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-muted">
                    Nobody yet.
                  </td>
                </tr>
              )}
              {allowlist.map((m) => {
                const self = m.email === ownEmail.toLowerCase();
                return (
                  <tr key={m.email}>
                    <td className="px-4 py-3 font-medium text-foreground">
                      {m.email} {self && <span className="text-xs font-normal text-muted">(you)</span>}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        aria-label={`Role for ${m.email}`}
                        value={m.role}
                        disabled={pending || self}
                        onChange={(e) => run(() => inviteMember(m.email, e.target.value as "member" | "owner"))}
                        className="rounded-lg border border-border bg-background px-2 py-1 text-sm text-foreground disabled:opacity-60"
                      >
                        <option value="member">Member</option>
                        <option value="owner">Owner</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-muted">{formatLabDate(m.invited_at)}</td>
                    <td className="px-4 py-3 text-muted">
                      {m.accepted ? (
                        <span className="inline-flex items-center gap-1 text-success">
                          <Check className="size-4" aria-hidden /> {m.accepted_at ? formatLabDate(m.accepted_at) : "Yes"}
                        </span>
                      ) : (
                        "Not yet"
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {!self && (
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() => {
                            if (window.confirm(`Remove ${m.email}? They'll lose access to the Lab.`)) run(() => removeMember(m.email));
                          }}
                          className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted hover:border-accent hover:text-foreground disabled:opacity-60"
                        >
                          <UserMinus className="size-3.5" aria-hidden /> Remove
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
