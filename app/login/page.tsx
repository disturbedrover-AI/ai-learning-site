import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { Constellation } from "@/components/brand/Constellation";
import { Reveal } from "@/components/motion/Reveal";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="relative mx-auto flex max-w-6xl justify-center px-4 py-16 sm:px-6 sm:py-24">
      <Reveal still delay={0.2} className="pointer-events-none absolute inset-0 -z-10">
        {/* Opacity lives on the inner element: the fade-in animates the outer one. */}
        <Constellation className="size-full opacity-25" />
      </Reveal>
      {/* The form reads ?next= and ?error= from the address, so it renders in the browser. */}
      <Suspense fallback={<div className="h-[28rem] w-full max-w-md rounded-3xl border border-border bg-surface" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
