import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { LabEditor } from "@/components/lab/LabEditor";
import { getEntry, getLabFacets, requireLabOwner } from "@/lib/lab/server";
import "@/components/learn/lesson.css";
import "@/components/lab/lab.css";

export const metadata: Metadata = { title: "Edit Lab entry" };

export default function EditLabEntryPage(props: PageProps<"/lab/[slug]/edit">) {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
      <Suspense fallback={<div className="mt-14 h-96 rounded-3xl border border-border bg-surface" />}>
        <EditEntry params={props.params} />
      </Suspense>
    </div>
  );
}

async function EditEntry({ params }: Pick<PageProps<"/lab/[slug]/edit">, "params">) {
  const { slug } = await params;
  const access = await requireLabOwner(`/lab/${slug}/edit`);
  const [entry, { collections }] = await Promise.all([getEntry(access.supabase, slug), getLabFacets(access.supabase)]);
  if (!entry) notFound();
  return <LabEditor entry={entry} collections={collections.map((c) => c.name)} />;
}
