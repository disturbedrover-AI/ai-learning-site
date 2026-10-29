import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountView } from "@/components/auth/AccountView";
import { PageHeader } from "@/components/ui/PageHeader";

export const metadata: Metadata = { title: "Your account" };

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
      <PageHeader eyebrow="Account" title="Your account" description="Your name, your progress, and your data." />
      {/* Who's signed in is known in the browser, so the account details render there. */}
      <Suspense>
        <AccountView />
      </Suspense>
    </div>
  );
}
