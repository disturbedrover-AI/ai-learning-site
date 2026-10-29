"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, X } from "lucide-react";

export type FileDraft = { filename: string; content: string };

/**
 * A dialog showing a ready-to-save file (its suggested name and contents) with
 * copy buttons. Used by "Make this a post" (Radar) and "Promote to lesson" (Lab).
 * Open it by passing a draft; `null` closes it.
 */
export function FileDraftDialog({
  draft,
  title,
  intro,
  onClose,
}: {
  draft: FileDraft | null;
  title: string;
  intro: React.ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [copied, setCopied] = useState<"file" | "name" | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (draft && !dialog.open) dialog.showModal();
    if (!draft && dialog.open) dialog.close();
  }, [draft]);

  const copy = async (what: "file" | "name") => {
    if (!draft) return;
    await navigator.clipboard.writeText(what === "file" ? draft.content : draft.filename);
    setCopied(what);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby="file-draft-title"
      className="m-auto w-[min(42rem,calc(100vw-2rem))] rounded-3xl border border-border bg-surface p-0 text-foreground shadow-2xl backdrop:bg-black/40 backdrop:backdrop-blur-sm"
    >
      {draft && (
        <div className="p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="file-draft-title" className="font-display text-2xl font-bold">
                {title}
              </h2>
              <div className="mt-1 text-sm text-muted">{intro}</div>
            </div>
            <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-1.5 text-muted hover:bg-background hover:text-foreground">
              <X className="size-5" aria-hidden />
            </button>
          </div>

          <p className="mt-5 text-xs font-semibold tracking-wide text-muted uppercase">Suggested file name</p>
          <div className="mt-1.5 flex items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded-xl border border-border bg-background px-3 py-2 font-mono text-sm">
              {draft.filename}
            </code>
            <CopyButton done={copied === "name"} onClick={() => copy("name")} label="Copy name" />
          </div>

          <p className="mt-5 text-xs font-semibold tracking-wide text-muted uppercase">File contents</p>
          <pre className="mt-1.5 max-h-80 overflow-auto rounded-xl border border-border bg-background p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap">
            {draft.content}
          </pre>
          <div className="mt-4 flex justify-end">
            <CopyButton done={copied === "file"} onClick={() => copy("file")} label="Copy file" primary />
          </div>
        </div>
      )}
    </dialog>
  );
}

function CopyButton({ done, onClick, label, primary = false }: { done: boolean; onClick: () => void; label: string; primary?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
        primary ? "bg-accent text-accent-foreground hover:opacity-90" : "border border-border hover:border-accent"
      }`}
    >
      {done ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
      {done ? "Copied" : label}
    </button>
  );
}
