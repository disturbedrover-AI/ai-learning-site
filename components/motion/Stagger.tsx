"use client";

import { motion } from "framer-motion";
import { fadeUp, stagger, viewportOnce } from "@/lib/motion";

type StaggerProps = {
  children: React.ReactNode;
  /** Seconds between each item. */
  gap?: number;
  /** Seconds before the first item. */
  delay?: number;
  className?: string;
  as?: "div" | "ul" | "ol";
};

/**
 * A list whose items (each wrapped in <StaggerItem>) fade up one after another
 * the first time the list scrolls into view.
 */
export function Stagger({ children, gap, delay, className, as = "div" }: StaggerProps) {
  const Tag = motion[as];
  return (
    <Tag className={className} variants={stagger(gap, delay)} initial="hidden" whileInView="show" viewport={viewportOnce}>
      {children}
    </Tag>
  );
}

export function StaggerItem({
  children,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "li";
}) {
  const Tag = motion[as];
  return (
    <Tag className={className} variants={fadeUp}>
      {children}
    </Tag>
  );
}
