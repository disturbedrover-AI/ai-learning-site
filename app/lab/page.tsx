import type { Metadata } from "next";
import { Suspense } from "react";
import { LabByInvitation, LabNotConfigured, LabSignedOut } from "@/components/lab/LabGate";
import { LabHome } from "@/components/lab/LabHome";
import { PageHeader } from "@/components/ui/PageHeader";
import { getLabAccess } from "@/lib/lab/server";

export const metadata: Metadata = { title: "Lab" };

export default function LabPage(props: PageProps<"/lab">) {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
      <PageHeader
        eyebrow="Lab"
        title="The Lab"
        description="A private workspace for experiments, tips, notes and snippets."
      />
      {/* Who's signed in decides what shows, so this part is rendered per request. */}
      <Suspense fallback={<div className="h-64 rounded-3xl border border-border bg-surface" />}>
        <LabIndex searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}

async function LabIndex({ searchParams }: Pick<PageProps<"/lab">, "searchParams">) {
  const access = await getLabAccess();
  if (access.state === "unconfigured") return <LabNotConfigured />;
  if (access.state === "signed-out") return <LabSignedOut />;
  if (access.state === "user") return <LabByInvitation request={access.request} />;

  const params = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || undefined;
  return (
    <LabHome
      supabase={access.supabase}
      role={access.role}
      filters={{ q: one(params.q), kind: one(params.kind), collection: one(params.collection) }}
    />
  );
}
