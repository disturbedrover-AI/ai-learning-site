import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, ExternalLink, Folder, Pencil, Pin } from "lucide-react";
import { LessonBody } from "@/components/learn/LessonBody";
import { formatLabDate, KindBadge, StatusBadge } from "@/components/lab/LabBadges";
import { PromoteToLesson } from "@/components/lab/PromoteToLesson";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { ButtonLink } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Card";
import { getEntry, getLabAccess } from "@/lib/lab/server";
import "@/components/learn/lesson.css";

export const metadata: Metadata = { title: "Lab entry" };

export default function LabEntryPage(props: PageProps<"/lab/[slug]">) {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
      {/* Private: rendered per request for whoever is signed in. */}
      <Suspense fallback={<div className="mt-14 h-64 rounded-3xl border border-border bg-surface" />}>
        <LabEntry params={props.params} />
      </Suspense>
    </div>
  );
}

async function LabEntry({ params }: Pick<PageProps<"/lab/[slug]">, "params">) {
  const access = await getLabAccess();
  // Anyone who isn't a member or the owner sees the /lab gate instead.
  if (access.state !== "member" && access.state !== "owner") redirect("/lab");
  const { slug } = await params;
  const entry = await getEntry(access.supabase, slug);
  if (!entry) notFound();
  const owner = access.state === "owner";

  return (
    <>
      <Stagger className="pt-10 sm:pt-14">
        <StaggerItem>
          <Link href="/lab" className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground">
            <ArrowLeft className="size-4" aria-hidden /> The Lab
          </Link>
        </StaggerItem>
        <StaggerItem>
          <div className="mt-10 flex flex-wrap items-center gap-2 text-sm text-muted">
            <KindBadge kind={entry.kind} />
            <StatusBadge status={entry.status} />
            {entry.pinned && (
              <span className="inline-flex items-center gap-1 text-xs">
                <Pin className="size-3.5" aria-hidden /> Pinned
              </span>
            )}
            {entry.collection && (
              <Link
                href={`/lab?collection=${encodeURIComponent(entry.collection)}`}
                className="inline-flex items-center gap-1 text-xs hover:text-foreground"
              >
                <Folder className="size-3.5" aria-hidden /> {entry.collection}
              </Link>
            )}
            <span className="text-xs">Updated {formatLabDate(entry.updated_at)}</span>
          </div>
        </StaggerItem>
        <StaggerItem>
          <h1 className="mt-4 text-4xl leading-[1.05] font-bold text-foreground sm:text-5xl">{entry.title}</h1>
          {entry.tags.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-1.5">
              {entry.tags.map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </div>
          )}
          {owner && (
            <div className="mt-6 flex flex-wrap gap-2">
              <ButtonLink href={`/lab/${entry.slug}/edit`} className="px-4 py-2">
                <Pencil className="size-4" aria-hidden /> Edit
              </ButtonLink>
              <PromoteToLesson entry={entry} />
            </div>
          )}
        </StaggerItem>
      </Stagger>

      <Reveal delay={0.15} className="mt-12">
        {entry.body.trim() ? (
          <article className="lesson-body">
            <LessonBody source={entry.body} file="this entry" safe />
          </article>
        ) : (
          <p className="text-muted">No text yet.</p>
        )}
      </Reveal>

      {entry.links.length > 0 && (
        <Reveal className="mt-12">
          <h2 className="text-xl font-bold text-foreground">Links</h2>
          <ul className="mt-3 divide-y divide-border rounded-2xl border border-border bg-surface">
            {entry.links.map((link) => (
              <li key={link.url}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-3 px-4 py-3 text-sm transition-colors hover:bg-background"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-foreground">{link.label || link.url}</span>
                    {link.label && <span className="block truncate text-xs text-muted">{link.url}</span>}
                  </span>
                  <ExternalLink className="size-4 shrink-0 text-muted" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      )}
    </>
  );
}
