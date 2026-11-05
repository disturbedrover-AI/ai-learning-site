import type { Metadata } from "next";
import { LegalLayout, LegalLink, LegalSection } from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What this site stores about you, and how to delete it.",
  // Always indexable, even if site-wide indexing is turned off: search engines
  // need to be able to reach the privacy policy.
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
};

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy"
      description="This is a small educational site. Here's exactly what we store, why, and how to remove it — in plain English."
      updated="2026-11-05"
    >
      <LegalSection title="What we store">
        <p>Only what the site needs to work. Nothing is sold or shared for advertising.</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-foreground">Your account details</strong> — your email address, name, and avatar.
            These come from whichever way you sign in: your Google profile, or the name on your email sign-in.
          </li>
          <li>
            <strong className="text-foreground">Your lesson progress</strong> — which lessons you&apos;ve opened and
            completed, so you can pick up where you left off on any device.
          </li>
          <li>
            <strong className="text-foreground">Lab content</strong> — if you&apos;re a member, anything you create in
            the Lab is saved to your account.
          </li>
        </ul>
        <p>
          If you&apos;re not signed in, your progress is kept only in your own browser and never reaches our servers.
        </p>
      </LegalSection>

      <LegalSection title="Signing in with Google">
        <p>
          When you choose &ldquo;Continue with Google&rdquo;, we only read your basic profile information — your name,
          email address, and profile picture. We can&apos;t see your Gmail, contacts, files, or anything else in your
          Google account, and we never post anything on your behalf.
        </p>
      </LegalSection>

      <LegalSection title="Cookies">
        <p>
          We use cookies for one purpose only: to keep you signed in during your session. There are no advertising
          cookies and no third-party tracking cookies.
        </p>
      </LegalSection>

      <LegalSection title="Ads and tracking">
        <p>
          There are currently no ads and no analytics or tracking services on this site. If that ever changes,
          we&apos;ll update this page first.
        </p>
      </LegalSection>

      <LegalSection title="Deleting your data">
        <p>
          You&apos;re in control. On your <LegalLink href="/account">Account page</LegalLink> there&apos;s a delete
          option that permanently removes your account, your profile, and all of your saved progress. Once
          deleted, it can&apos;t be recovered.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Questions about your privacy or your data? Email{" "}
          <LegalLink href="mailto:disturbedrover@gmail.com">disturbedrover@gmail.com</LegalLink>.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
