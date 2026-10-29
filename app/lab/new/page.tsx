import type { Metadata } from "next";
import { Suspense } from "react";
import { LabEditor } from "@/components/lab/LabEditor";
import { getLabFacets, requireLabOwner } from "@/lib/lab/server";
import { LAB_KINDS, type LabKind } from "@/lib/lab/model";
import "@/components/learn/lesson.css";
import "@/components/lab/lab.css";

export const metadata: Metadata = { title: "New Lab entry" };

export default function NewLabEntryPage(props: PageProps<"/lab/new">) {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
      <Suspense fallback={<div className="mt-14 h-96 rounded-3xl border border-border bg-surface" />}>
        <NewEntry searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}

async function NewEntry({ searchParams }: Pick<PageProps<"/lab/new">, "searchParams">) {
  const access = await requireLabOwner("/lab/new");
  const { collections } = await getLabFacets(access.supabase);
  const kind = (await searchParams).kind;
  return (
    <LabEditor
      entry={null}
      collections={collections.map((c) => c.name)}
      initialKind={typeof kind === "string" && kind in LAB_KINDS ? (kind as LabKind) : "note"}
    />
  );
}
