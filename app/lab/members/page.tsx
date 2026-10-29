import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { MembersManager } from "@/components/lab/MembersManager";
import { PageHeader } from "@/components/ui/PageHeader";
import { getMembers, requireLabOwner } from "@/lib/lab/server";

export const metadata: Metadata = { title: "Lab members" };

export default function LabMembersPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 sm:px-6">
      <div className="pt-10 sm:pt-14">
        <Link href="/lab" className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden /> The Lab
        </Link>
      </div>
      <PageHeader eyebrow="Lab" title="Members" description="Who can use the Lab, and requests to join." />
      <Suspense fallback={<div className="h-64 rounded-3xl border border-border bg-surface" />}>
        <Members />
      </Suspense>
    </div>
  );
}

async function Members() {
  const access = await requireLabOwner("/lab/members");
  const { allowlist, requests } = await getMembers(access.supabase);
  return <MembersManager allowlist={allowlist} requests={requests} ownEmail={access.user.email ?? ""} />;
}
