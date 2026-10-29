"use client";

import { useState } from "react";
import { GraduationCap } from "lucide-react";
import { LAB_KINDS, type LabEntry } from "@/lib/lab/model";
import { yamlString } from "@/lib/yaml";
import { Button } from "@/components/ui/Button";
import { FileDraftDialog, type FileDraft } from "@/components/ui/FileDraftDialog";

const icons: Record<LabEntry["kind"], string> = {
  experiment: "flask-conical",
  tip: "lightbulb",
  note: "notebook-pen",
  snippet: "code",
};

/** The first paragraph of plain text in the body, as a starting point for the lesson summary. */
function firstParagraph(body: string) {
  const paragraph = body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .find((p) => p && !/^(#|<|-|\*|\d+\.|```|>)/.test(p));
  const text = (paragraph ?? "").replace(/[*_`[\]]/g, "").replace(/\s+/g, " ");
  return text.length > 220 ? `${text.slice(0, 217)}…` : text;
}

/** A lesson file (content/lessons/<slug>.mdx) made from a Lab entry. */
export function lessonDraft(entry: LabEntry): FileDraft {
  const words = entry.body.split(/\s+/).filter(Boolean).length;
  const content = `---
title: ${yamlString(entry.title)}
slug: ${entry.slug}
duration: ${Math.max(1, Math.round(words / 200))} # minutes to read
summary: ${yamlString(firstParagraph(entry.body))} # one or two sentences for the learning path
tags: [${entry.tags.map(yamlString).join(", ")}]
prerequisites: []
icon: ${icons[entry.kind]}
---

${entry.body.trim()}
`;
  return { filename: `content/lessons/${entry.slug}.mdx`, content };
}

/** "Promote to lesson" (owner only): shows a ready-to-save lesson file for this entry. */
export function PromoteToLesson({ entry }: { entry: LabEntry }) {
  const [draft, setDraft] = useState<FileDraft | null>(null);
  return (
    <>
      <Button variant="secondary" className="px-4 py-2" onClick={() => setDraft(lessonDraft(entry))}>
        <GraduationCap className="size-4" aria-hidden /> Promote to lesson
      </Button>
      <FileDraftDialog
        draft={draft}
        title="Promote to lesson"
        intro={
          <>
            Save this as a new lesson file and check the summary and reading time. Then list the slug{" "}
            <code className="rounded bg-background px-1">{entry.slug}</code> in a track&apos;s level in a{" "}
            <code className="rounded bg-background px-1">course.json</code> so it appears on the site.
            {entry.kind === "experiment" && ` (${LAB_KINDS.experiment.label} sections become the lesson's headings.)`}
          </>
        }
        onClose={() => setDraft(null)}
      />
    </>
  );
}
