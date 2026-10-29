"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Eye, Loader2, Plus, Save, Trash2, X } from "lucide-react";
import { deleteEntry, previewBody, saveEntry } from "@/app/lab/actions";
import {
  EXPERIMENT_SECTIONS,
  EXPERIMENT_TEMPLATE,
  LAB_KINDS,
  LAB_STATUSES,
  type LabEntry,
  type LabEntryInput,
  type LabKind,
  type LabStatus,
} from "@/lib/lab/model";
import { Button } from "@/components/ui/Button";

const AUTOSAVE_MS = 3000;
const PREVIEW_MS = 600;

type Draft = Omit<LabEntryInput, "id">;

const blank = (kind: LabKind): Draft => ({
  kind,
  title: "",
  body: kind === "experiment" ? EXPERIMENT_TEMPLATE : "",
  status: "draft",
  tags: [],
  collection: "",
  pinned: false,
  links: [],
});

/**
 * The Lab editor (owner only): Markdown on the left, live preview on the right.
 * Saves automatically a few seconds after you stop typing, and straight away with
 * Ctrl/Cmd+S. A new entry is created on its first save (as a draft unless you
 * pick another status).
 */
export function LabEditor({
  entry,
  collections,
  initialKind = "note",
}: {
  entry: LabEntry | null;
  collections: string[];
  initialKind?: LabKind;
}) {
  const router = useRouter();
  const [id, setId] = useState(entry?.id);
  const [slug, setSlug] = useState(entry?.slug);
  const [draft, setDraft] = useState<Draft>(() =>
    entry
      ? {
          kind: entry.kind,
          title: entry.title,
          body: entry.body,
          status: entry.status,
          tags: entry.tags,
          collection: entry.collection ?? "",
          pinned: entry.pinned,
          links: entry.links,
        }
      : blank(initialKind),
  );
  // Each edit bumps the version; the version last saved tells us whether there are unsaved changes.
  const [version, setVersion] = useState(0);
  const [savedVersion, setSavedVersion] = useState(0);
  const [saveState, setSaveState] = useState<{ status: "idle" | "saving" | "saved" | "error"; message?: string; at?: string }>(
    entry ? { status: "saved", at: entry.updated_at } : { status: "idle" },
  );
  const [preview, setPreview] = useState<React.ReactNode>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const saving = useRef(false);
  const dirty = version !== savedVersion;

  const update = (patch: Partial<Draft>) => {
    setDraft((d) => ({ ...d, ...patch }));
    setVersion((v) => v + 1);
  };

  const save = useCallback(async () => {
    if (saving.current) return;
    saving.current = true;
    const savingVersion = version;
    setSaveState({ status: "saving" });
    const result = await saveEntry({ ...draft, id });
    saving.current = false;
    if (!result.ok) {
      setSaveState({ status: "error", message: result.error });
      return;
    }
    setSavedVersion(savingVersion);
    setSaveState({ status: "saved", at: result.updatedAt });
    if (!id) {
      // First save of a new entry: from now on, edit it at its own address.
      setId(result.id);
      setSlug(result.slug);
      window.history.replaceState(null, "", `/lab/${result.slug}/edit`);
    }
  }, [draft, id, version]);

  // Autosave a few seconds after the last change.
  useEffect(() => {
    if (!dirty) return;
    const timer = setTimeout(save, AUTOSAVE_MS);
    return () => clearTimeout(timer);
  }, [dirty, save]);

  // Ctrl/Cmd+S saves now.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void save();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [save]);

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const onLeave = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onLeave);
    return () => window.removeEventListener("beforeunload", onLeave);
  }, [dirty]);

  // Live preview, rendered on the server exactly like the entry page.
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      previewBody(draft.body).then((node) => !cancelled && setPreview(node));
    }, PREVIEW_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [draft.body]);

  /** Insert text at the cursor in the Markdown box. */
  const insert = (text: string) => {
    const box = bodyRef.current;
    const start = box?.selectionStart ?? draft.body.length;
    const end = box?.selectionEnd ?? draft.body.length;
    const before = draft.body.slice(0, start);
    const spacer = before && !before.endsWith("\n\n") ? (before.endsWith("\n") ? "\n" : "\n\n") : "";
    const body = before + spacer + text + draft.body.slice(end);
    update({ body });
    requestAnimationFrame(() => {
      const caret = (before + spacer + text).length;
      box?.focus();
      box?.setSelectionRange(caret, caret);
    });
  };

  return (
    <div className="pt-8">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href={slug ? `/lab/${slug}` : "/lab"} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden /> {slug ? "Back to entry" : "The Lab"}
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <SaveIndicator state={saveState} dirty={dirty} />
          {slug && (
            <Link
              href={`/lab/${slug}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground hover:border-accent"
            >
              <Eye className="size-4" aria-hidden /> View
            </Link>
          )}
          <Button onClick={() => void save()} className="px-4 py-2" title="Save (Ctrl/Cmd+S)">
            <Save className="size-4" aria-hidden /> Save
          </Button>
        </div>
      </div>

      {/* Details */}
      <input
        aria-label="Title"
        value={draft.title}
        onChange={(e) => update({ title: e.target.value })}
        placeholder="Untitled"
        maxLength={200}
        className="mt-6 w-full bg-transparent font-display text-4xl font-bold text-foreground outline-none placeholder:text-muted/60"
      />
      <div className="mt-5 grid gap-3 rounded-2xl border border-border bg-surface p-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Kind">
          <select
            value={draft.kind}
            onChange={(e) => {
              const kind = e.target.value as LabKind;
              // An empty experiment starts with its sections.
              update(kind === "experiment" && !draft.body.trim() ? { kind, body: EXPERIMENT_TEMPLATE } : { kind });
            }}
            className="field"
          >
            {(Object.keys(LAB_KINDS) as LabKind[]).map((k) => (
              <option key={k} value={k}>
                {LAB_KINDS[k].label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Status">
          <select value={draft.status} onChange={(e) => update({ status: e.target.value as LabStatus })} className="field">
            {(Object.keys(LAB_STATUSES) as LabStatus[]).map((s) => (
              <option key={s} value={s}>
                {LAB_STATUSES[s].label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Collection">
          <input
            list="lab-collections"
            value={draft.collection}
            onChange={(e) => update({ collection: e.target.value })}
            placeholder="e.g. Prompting"
            maxLength={80}
            className="field"
          />
          <datalist id="lab-collections">
            {collections.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </Field>
        <Field label="Pinned">
          <label className="flex h-10 items-center gap-2 text-sm text-foreground">
            <input type="checkbox" checked={draft.pinned} onChange={(e) => update({ pinned: e.target.checked })} className="size-4 accent-[var(--accent)]" />
            Show at the top
          </label>
        </Field>
        <div className="sm:col-span-2 lg:col-span-4">
          <Field label="Tags">
            <TagInput tags={draft.tags} onChange={(tags) => update({ tags })} />
          </Field>
        </div>
      </div>

      {/* Templates */}
      <div className="mt-6 flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-xs font-semibold text-muted">Insert</span>
        <TemplateButton onClick={() => insert(EXPERIMENT_TEMPLATE)}>Experiment template</TemplateButton>
        {EXPERIMENT_SECTIONS.map((s) => (
          <TemplateButton key={s} onClick={() => insert(`## ${s}\n\n`)}>
            {s}
          </TemplateButton>
        ))}
        <TemplateButton onClick={() => insert("<KeyPoint>\n  \n</KeyPoint>\n")}>KeyPoint</TemplateButton>
        <TemplateButton onClick={() => insert('<Example title="">\n  \n</Example>\n')}>Example</TemplateButton>
      </div>

      {/* Editor and preview */}
      <div className="mt-3 grid gap-4 lg:grid-cols-2">
        <textarea
          ref={bodyRef}
          aria-label="Text (Markdown)"
          value={draft.body}
          onChange={(e) => update({ body: e.target.value })}
          spellCheck
          className="min-h-[60vh] w-full resize-y rounded-2xl border border-border bg-surface p-5 font-mono text-sm leading-relaxed text-foreground outline-none focus:border-accent"
          placeholder="Write in Markdown. Lesson blocks like <KeyPoint> work too."
        />
        <div aria-label="Preview" className="min-h-[60vh] overflow-auto rounded-2xl border border-dashed border-border p-5">
          <p className="mb-4 text-xs font-semibold tracking-wide text-muted uppercase">Preview</p>
          <div className="lesson-body">{preview ?? <p className="text-muted">The preview appears here.</p>}</div>
        </div>
      </div>

      {/* Links */}
      <section className="mt-8">
        <h2 className="text-lg font-bold text-foreground">Links</h2>
        <div className="mt-3 space-y-2">
          {draft.links.map((link, i) => (
            <div key={i} className="flex flex-wrap gap-2">
              <input
                aria-label="Link label"
                value={link.label}
                placeholder="Label"
                onChange={(e) => update({ links: draft.links.map((l, j) => (j === i ? { ...l, label: e.target.value } : l)) })}
                className="field min-w-40 flex-1"
              />
              <input
                aria-label="Link address"
                value={link.url}
                placeholder="https://…"
                type="url"
                onChange={(e) => update({ links: draft.links.map((l, j) => (j === i ? { ...l, url: e.target.value } : l)) })}
                className="field min-w-56 flex-[2]"
              />
              <button
                type="button"
                aria-label="Remove link"
                onClick={() => update({ links: draft.links.filter((_, j) => j !== i) })}
                className="rounded-full p-2 text-muted hover:bg-surface hover:text-foreground"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => update({ links: [...draft.links, { label: "", url: "" }] })}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm text-muted hover:border-accent hover:text-foreground"
          >
            <Plus className="size-4" aria-hidden /> Add link
          </button>
        </div>
      </section>

      {id && (
        <section className="mt-12 flex items-center justify-between gap-4 border-t border-border pt-6">
          <p className="text-sm text-muted">Deleting removes this entry and its links for good.</p>
          <Button
            variant="secondary"
            className="px-4 py-2"
            onClick={async () => {
              if (!window.confirm("Delete this entry? This can't be undone.")) return;
              const result = await deleteEntry(id);
              if (result.ok) router.push("/lab");
              else setSaveState({ status: "error", message: result.error });
            }}
          >
            <Trash2 className="size-4" aria-hidden /> Delete entry
          </Button>
        </section>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-semibold tracking-wide text-muted uppercase">{label}</p>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function TemplateButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-border px-2.5 py-1 text-xs font-medium text-muted transition-colors hover:border-accent hover:text-foreground"
    >
      {children}
    </button>
  );
}

function SaveIndicator({ state, dirty }: { state: { status: string; message?: string; at?: string }; dirty: boolean }) {
  const time = state.at && new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" }).format(new Date(state.at));
  return (
    <span role="status" className="inline-flex items-center gap-1.5 text-sm text-muted">
      {state.status === "saving" ? (
        <>
          <Loader2 className="size-4 animate-spin" aria-hidden /> Saving…
        </>
      ) : state.status === "error" ? (
        <span className="text-foreground">{state.message}</span>
      ) : dirty ? (
        "Unsaved changes"
      ) : state.status === "saved" ? (
        <>
          <Check className="size-4 text-success" aria-hidden /> Saved {time}
        </>
      ) : (
        "Not saved yet"
      )}
    </span>
  );
}

/** Tags as chips: type and press Enter or comma to add, Backspace on an empty box to remove the last. */
function TagInput({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
  const [text, setText] = useState("");
  const add = () => {
    const tag = text.trim().toLowerCase().replace(/,$/, "");
    if (tag && !tags.includes(tag)) onChange([...tags, tag]);
    setText("");
  };
  return (
    <div className="field flex min-h-10 flex-wrap items-center gap-1.5 py-1.5">
      {tags.map((t) => (
        <span key={t} className="inline-flex items-center gap-1 rounded-full bg-background px-2.5 py-0.5 text-xs text-foreground">
          {t}
          <button type="button" aria-label={`Remove tag ${t}`} onClick={() => onChange(tags.filter((x) => x !== t))} className="text-muted hover:text-foreground">
            <X className="size-3" aria-hidden />
          </button>
        </span>
      ))}
      <input
        aria-label="Add a tag"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add();
          } else if (e.key === "Backspace" && !text && tags.length) {
            onChange(tags.slice(0, -1));
          }
        }}
        onBlur={add}
        placeholder={tags.length ? "" : "Type a tag, press Enter"}
        className="min-w-32 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted"
      />
    </div>
  );
}
