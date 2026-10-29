"use client";

import { motion } from "framer-motion";
import { hoverLift } from "@/lib/motion";

/** Lifts its content slightly on hover. Wrap linked cards in this. */
export function Lift({ children, className = "h-full" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div className={className} {...hoverLift}>
      {children}
    </motion.div>
  );
}
