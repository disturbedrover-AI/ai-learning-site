"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { hoverLift } from "@/lib/motion";

type Variant = "primary" | "secondary";

const styles: Record<Variant, string> = {
  primary: "bg-accent text-accent-foreground hover:opacity-90",
  secondary: "border border-border bg-surface text-foreground hover:border-accent",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-[opacity,border-color,background-color]";

const MotionLink = motion.create(Link);

/** A link styled as a button, with the standard hover lift. */
export function ButtonLink({
  href,
  variant = "primary",
  className = "",
  children,
}: {
  href: string;
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <MotionLink href={href} className={`${base} ${styles[variant]} ${className}`} {...hoverLift}>
      {children}
    </MotionLink>
  );
}

/** A real <button>, with the standard hover lift. */
export function Button({
  variant = "primary",
  className = "",
  ...props
}: React.ComponentProps<typeof motion.button> & { variant?: Variant }) {
  return (
    <motion.button
      type="button"
      className={`${base} ${styles[variant]} ${className}`}
      {...hoverLift}
      {...props}
    />
  );
}
