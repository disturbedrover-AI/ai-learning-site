"use client";

import { useEffect } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { count } from "@/lib/motion";

/** A number that counts up or down to its new value. */
export function Counter({ value, className }: { value: number; className?: string }) {
  const reduce = useReducedMotion();
  const current = useMotionValue(value);
  const rounded = useTransform(current, (v) => Math.round(v));

  useEffect(() => {
    if (reduce) {
      current.set(value);
      return;
    }
    const controls = animate(current, value, count);
    return () => controls.stop();
  }, [value, reduce, current]);

  return <motion.span className={`tabular-nums ${className ?? ""}`}>{rounded}</motion.span>;
}
