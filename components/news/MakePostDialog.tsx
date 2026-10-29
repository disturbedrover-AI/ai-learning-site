"use client";

import { FileDraftDialog, type FileDraft } from "@/components/ui/FileDraftDialog";
import type { RadarItem } from "@/lib/radar";
import { slugify } from "@/lib/headings";
import { yamlString as quoted } from "@/lib/yaml";


/** A ready-to-save news post for a Radar item. Summary and "why it matters" are left for you to write. */
export function draftPost(item: RadarItem): FileDraft {
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
  return { filename: `content/news/${date}-${slug}.md`, content: markdown };
}

/** "Make this a post": a ready-to-save news file for a Radar item. */
export function MakePostDialog({ item, onClose }: { item: RadarItem | null; onClose: () => void }) {
  return (
    <FileDraftDialog
      draft={item && draftPost(item)}
      title="Make this a post"
      intro="Save this as a new file, then fill in the summary, why it matters, type and tags."
      onClose={onClose}
    />
  );
}
