"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, X } from "lucide-react";
import type { RadarItem } from "@/lib/radar";
import { slugify } from "@/lib/headings";

/** A YAML value in double quotes (safe for titles with colons or quotes). */
const quoted = (text: string) => `"${text.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;

/** A ready-to-save news post for a Radar item. Summary and "why it matters" are left for you to write. */
export function draftPost(item: RadarItem) {
  const date = item.publishedAt.slice(0, 10);
  const slug = slugify(item.title).split("-").slice(0, 8).join("-") || "news";
  const markdown = `---
title: ${quoted(item.title)}
date: ${date}
source: ${quoted(item.source)}
sourceUrl: ${quoted(item.link)}
type: ${item.category === "research" ? "research" : "other"} # model | tool | research | policy | tutorial | other
tags: []
summary: "" # 2–3 plain-English sentences: what happened
whyItMatters: "" # 1–2 sentences for a beginner
featured: false
---

Optional: a few short paragraphs in your own words. Don't paste the original article.
`;
  return { filename: `content/news/${date}-${slug}.md`, markdown };
}

/** "Make this a post": shows the draft file and its suggested name, with copy buttons. */
export function MakePostDialog({ item, onClose }: { item: RadarItem | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [copied, setCopied] = useState<"file" | "name" | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (item && !dialog.open) dialog.showModal();
    if (!item && dialog.open) dialog.close();
  }, [item]);

  const draft = item && draftPost(item);
  const copy = async (what: "file" | "name") => {
    if (!draft) return;
    await navigator.clipboard.writeText(what === "file" ? draft.markdown : draft.filename);
    setCopied(what);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby="make-post-title"
      className="m-auto w-[min(42rem,calc(100vw-2rem))] rounded-3xl border border-border bg-surface p-0 text-foreground shadow-2xl backdrop:bg-black/40 backdrop:backdrop-blur-sm"
    >
      {draft && (
        <div className="p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id="make-post-title" className="font-display text-2xl font-bold">
                Make this a post
              </h2>
              <p className="mt-1 text-sm text-muted">
                Save this as a new file, then fill in the summary, why it matters, type and tags.
              </p>
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
            {draft.markdown}
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
