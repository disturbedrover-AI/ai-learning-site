"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { AccountsUnavailable } from "@/components/auth/AccountsUnavailable";
import { Button } from "@/components/ui/Button";

/**
 * If loading Lab data fails part-way (usually Supabase not answering in time),
 * show the friendly "temporarily unavailable" message instead of an error page.
 */
export default function LabError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error("Lab couldn't load:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <AccountsUnavailable />
      <div className="mt-6 flex justify-center">
        <Button variant="secondary" onClick={retry} className="px-4 py-2">
          <RotateCcw className="size-4" aria-hidden /> Try again
        </Button>
      </div>
    </div>
  );
}
