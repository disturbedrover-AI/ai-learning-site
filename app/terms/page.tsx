import type { Metadata } from "next";
import { LegalLayout, LegalLink, LegalSection } from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Terms",
  description: "The simple terms for using this site.",
  // Always indexable, even if site-wide indexing is turned off: search engines
  // need to be able to reach the terms of service.
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
};

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms of Service"
      description="The short version: this is a free educational site — use it kindly and at your own discretion."
      updated="2026-11-05"
    >
      <LegalSection title="Free educational content">
        <p>
          Everything here is provided free of charge for learning. There&apos;s no payment, subscription, or
          obligation to use the site.
        </p>
      </LegalSection>

      <LegalSection title="No guarantees of accuracy">
        <p>
          AI moves quickly, and lessons, news, and tools may be incomplete, out of date, or wrong. Content is
          provided &ldquo;as is&rdquo; for general education only — it isn&apos;t professional advice, and you use it
          at your own risk.
        </p>
      </LegalSection>

      <LegalSection title="Don't abuse the service">
        <p>
          Please use the site reasonably. Don&apos;t attempt to break, overload, or disrupt it, misuse accounts or
          other people&apos;s data, or use it for anything unlawful.
        </p>
      </LegalSection>

      <LegalSection title="Accounts">
        <p>
          Accounts exist to save your progress. We may suspend or remove an account that abuses the service or these
          terms. You can delete your own account at any time from your{" "}
          <LegalLink href="/account">Account page</LegalLink>.
        </p>
      </LegalSection>

      <LegalSection title="Content licence">
        <p>
          The lessons and other content on this site are &copy; AI Learning, all rights reserved, unless a page
          states otherwise. Please don&apos;t republish or redistribute them without permission. You&apos;re welcome to
          link to any page and to use what you learn.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Questions about these terms? Email{" "}
          <LegalLink href="mailto:disturbedrover@gmail.com">disturbedrover@gmail.com</LegalLink>.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
