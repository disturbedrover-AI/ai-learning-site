"use client";

import { motion } from "framer-motion";

type FadeInProps = {
  children: React.ReactNode;
  delay?: number;
  /** How far (px) the element slides up while fading in. */
  y?: number;
  /** Animate when scrolled into view instead of on page load. */
  onScroll?: boolean;
  className?: string;
};

/** The site's standard entrance: a short, gentle fade and slide up. */
export function FadeIn({ children, delay = 0, y = 16, onScroll = false, className }: FadeInProps) {
  const visible = { opacity: 1, y: 0 };
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      {...(onScroll
        ? { whileInView: visible, viewport: { once: true, margin: "-60px" } }
        : { animate: visible })}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
