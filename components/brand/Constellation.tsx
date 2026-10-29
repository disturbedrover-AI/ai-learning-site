"use client";

import { motion, useMotionValue, useReducedMotion, useTime, useTransform, type MotionValue } from "framer-motion";
import { ambient } from "@/lib/motion";

/*
 * The site's "AI" motif: a soft constellation of connected nodes that drift
 * slowly, with small signals travelling along a few connections.
 * Colours come from the theme (level hues + foreground), so it fits every theme.
 */

// Node positions in a 100 × 60 box.
const NODES: [number, number][] = [
  [8, 12], [21, 6], [33, 15], [46, 7], [60, 13], [74, 5], [88, 12],
  [14, 29], [27, 24], [40, 31], [54, 25], [67, 32], [81, 24], [94, 31],
  [6, 47], [20, 42], [34, 51], [48, 44], [62, 53], [76, 45], [91, 51],
];
// Bigger "hub" nodes with a halo.
const HUBS = new Set([3, 9, 12, 17]);

// Connect nodes that are close to each other.
const EDGES: [number, number][] = [];
NODES.forEach(([x1, y1], a) =>
  NODES.forEach(([x2, y2], b) => {
    if (b > a && Math.hypot(x2 - x1, y2 - y1) < 17) EDGES.push([a, b]);
  }),
);
// A few connections carry a travelling signal.
const SIGNALS = [3, 11, 19, 27, 34].filter((i) => i < EDGES.length);

/** Where node `i` is at time `ms`: its base position plus a slow, unique wobble. */
function position(i: number, ms: number): [number, number] {
  const [x, y] = NODES[i];
  const speed = 0.7 + ((i * 37) % 10) / 20; // 0.7–1.15, different per node
  const t = (ms / 1000 / ambient.cycle) * Math.PI * 2 * speed;
  return [x + Math.sin(t + i) * ambient.distance, y + Math.cos(t * 0.8 + i * 1.7) * ambient.distance];
}

export function Constellation({ className = "" }: { className?: string }) {
  const reduce = useReducedMotion();
  const clock = useTime();
  const frozen = useMotionValue(0);
  const time = reduce ? frozen : clock;

  return (
    <svg viewBox="0 0 100 60" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden>
      <g stroke="var(--foreground)" strokeOpacity={0.16} strokeWidth={1} vectorEffect="non-scaling-stroke">
        {EDGES.map(([a, b]) => (
          <Edge key={`${a}-${b}`} a={a} b={b} time={time} />
        ))}
      </g>
      {SIGNALS.map((edge, i) => (
        <Signal key={edge} edge={EDGES[edge]} time={time} offset={i * 0.37} />
      ))}
      {NODES.map((_, i) => (
        <Node key={i} i={i} time={time} />
      ))}
    </svg>
  );
}

function Edge({ a, b, time }: { a: number; b: number; time: MotionValue<number> }) {
  const x1 = useTransform(time, (t) => position(a, t)[0]);
  const y1 = useTransform(time, (t) => position(a, t)[1]);
  const x2 = useTransform(time, (t) => position(b, t)[0]);
  const y2 = useTransform(time, (t) => position(b, t)[1]);
  return <motion.line x1={x1} y1={y1} x2={x2} y2={y2} vectorEffect="non-scaling-stroke" />;
}

function Node({ i, time }: { i: number; time: MotionValue<number> }) {
  const cx = useTransform(time, (t) => position(i, t)[0]);
  const cy = useTransform(time, (t) => position(i, t)[1]);
  const color = `var(--level-${i % 4})`;
  const hub = HUBS.has(i);
  return (
    <>
      {hub && <motion.circle cx={cx} cy={cy} r={2.6} fill={color} opacity={0.12} />}
      <motion.circle cx={cx} cy={cy} r={hub ? 1.1 : 0.65} fill={color} opacity={hub ? 0.95 : 0.7} />
    </>
  );
}

/** A small dot that travels along a connection, fading in and out. */
function Signal({ edge: [a, b], time, offset }: { edge: [number, number]; time: MotionValue<number>; offset: number }) {
  const progress = useTransform(time, (t) => (t / 1000 / (ambient.cycle / 4) + offset) % 1);
  const cx = useTransform(time, (t) => {
    const p = progress.get();
    return position(a, t)[0] * (1 - p) + position(b, t)[0] * p;
  });
  const cy = useTransform(time, (t) => {
    const p = progress.get();
    return position(a, t)[1] * (1 - p) + position(b, t)[1] * p;
  });
  const opacity = useTransform(progress, (p) => Math.sin(p * Math.PI) * 0.9);
  return <motion.circle cx={cx} cy={cy} r={0.45} fill="var(--accent)" opacity={opacity} />;
}
