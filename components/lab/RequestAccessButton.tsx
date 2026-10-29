"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";
import { requestAccess } from "@/app/lab/actions";
import { Button } from "@/components/ui/Button";

/** "Request access", with an optional note to the owner. */
export function RequestAccessButton() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="space-y-3 text-left"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          const result = await requestAccess(message);
          if (result.ok) router.refresh();
          else setError(result.error);
        });
      }}
    >
      <label htmlFor="access-message" className="text-sm font-medium text-foreground">
        A note for the owner <span className="font-normal text-muted">(optional)</span>
      </label>
      <textarea
        id="access-message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        maxLength={500}
        rows={3}
        className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-accent"
      />
      <Button type="submit" disabled={pending} className="w-full disabled:opacity-70">
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Send className="size-4" aria-hidden />}
        Request access
      </Button>
      {error && (
        <p role="alert" className="text-sm text-foreground">
          {error}
        </p>
      )}
    </form>
  );
}
