"use client";

import { motion } from "framer-motion";
import { fade, fadeUp, viewportOnce } from "@/lib/motion";

type RevealProps = {
  children?: React.ReactNode;
  /** Extra wait (seconds) before starting. Keep it small. */
  delay?: number;
  /** Fade without sliding (for backgrounds). */
  still?: boolean;
  className?: string;
};

/** Fades a block in (and up) the first time it scrolls into view. */
export function Reveal({ children, delay = 0, still = false, className }: RevealProps) {
  return (
    <motion.div
      className={className}
      variants={still ? fade : fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
      custom={delay}
    >
      {children}
    </motion.div>
  );
}
