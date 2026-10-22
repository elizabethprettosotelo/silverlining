"use client";

/*
 * The rose, as an engraved mark: same linework as the scene headers.
 * It blooms onto a story when you give it your rose: the outlines draw in,
 * then the hatching settles, like ink pressed onto the page.
 * Colored with currentColor; put it inside `.turned` so it uses the accent.
 */

import { motion } from "motion/react";
import { useMotionSafe } from "./ui";

const r1 = (n: number) => Math.round(n * 10) / 10;

// A loose spiral for the heart of the bloom.
function spiral(cx: number, cy: number, turns: number, maxR: number) {
  let d = "";
  const steps = 60;
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * turns * Math.PI * 2;
    const r = 1.2 + (maxR * i) / steps;
    const x = cx + Math.cos(t) * r * 1.15; // a little wider than tall
    const y = cy + Math.sin(t) * r * 0.8;
    d += `${i ? "L" : "M"}${r1(x)} ${r1(y)}`;
  }
  return d;
}

// Parallel diagonal strokes, clipped later to a shape.
function hatch(x0: number, y0: number, x1: number, y1: number, gap: number, slant: number) {
  const out: string[] = [];
  for (let x = x0 - (y1 - y0); x < x1; x += gap) out.push(`M${r1(x)} ${r1(y1)}l${r1((y1 - y0) * slant)} ${r1(-(y1 - y0))}`);
  return out;
}

const BLOOM = [
  // outer petals, curling back at the top
  "M60 88C44 86 30 72 30 54C30 45 33 39 38 35C40 43 44 49 51 53",
  "M60 88C76 86 90 72 90 54C90 45 87 39 82 35C80 43 76 49 69 53",
  // the front petal wrapping across the cup
  "M35 57C43 64 51 66 60 66C69 66 77 64 85 57",
  // back petals and the rim
  "M38 35C42 26 50 22 58 26",
  "M82 35C78 26 70 22 62 26",
  "M50 26C54 18 66 18 70 26",
  // the inner cup
  "M44 46C46 56 74 56 76 46",
  "M44 46C46 36 54 32 60 34",
  "M76 46C74 36 66 32 60 34",
];
const CENTER = spiral(60, 42, 2.1, 9);
const CUP_SHADE = "M35 57C43 64 51 66 60 66C69 66 77 64 85 57C85 72 74 86 60 88C46 86 35 72 35 57Z";
const STEM = "M60 88C57 110 65 132 58 166";
const THORNS = ["M60.5 106l7 -5", "M60 145l-7 -4"];
const LEAF = "M61 122C73 108 92 107 102 115C92 127 74 131 61 122Z";
const VEIN = "M61 122C76 117 89 114 102 115";
const LEAF_VEINS = ["M70 119l4 -7", "M79 117l4 -7", "M88 115.5l3 -6", "M72 121l5 5", "M82 119l5 5"];
const CUP_HATCH = hatch(33, 56, 88, 90, 3.2, 0.35);
const LEAF_HATCH = hatch(60, 116, 104, 130, 3, 0.4);
const RAYS = Array.from({ length: 10 }, (_, i) => {
  const a = -Math.PI * 0.95 + (i / 9) * Math.PI * 0.9;
  const r0 = 46;
  const r = i % 2 ? 6 : 10;
  return `M${r1(60 + Math.cos(a) * r0)} ${r1(48 + Math.sin(a) * r0 * 0.9)}l${r1(Math.cos(a) * r)} ${r1(Math.sin(a) * r * 0.9)}`;
});

export default function RoseMark({ size = 110, rotate = -12 }: { size?: number; rotate?: number }) {
  const ok = useMotionSafe();
  const draw = (delay: number, duration = 0.9) =>
    ok
      ? {
          initial: { pathLength: 0, opacity: 0 },
          animate: { pathLength: 1, opacity: 1 },
          transition: { pathLength: { delay, duration, ease: [0.22, 1, 0.36, 1] as const }, opacity: { delay, duration: 0.01 } },
        }
      : {};
  const fade = (delay: number, to = 1) =>
    ok ? { initial: { opacity: 0 }, animate: { opacity: to }, transition: { delay, duration: 0.6 } } : { style: { opacity: to } };

  return (
    <motion.div
      className="rose-mark turned"
      aria-hidden
      style={{ width: size, height: size * (170 / 120) }}
      initial={ok ? { opacity: 0, scale: 0.82, rotate: rotate - 10, y: 10 } : false}
      animate={{ opacity: 1, scale: 1, rotate, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 160, damping: 16 }}
    >
      <svg viewBox="0 0 120 170" width="100%" height="100%" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <defs>
          <clipPath id="rose-cup">
            <path d={CUP_SHADE} />
          </clipPath>
          <clipPath id="rose-leaf">
            <path d={LEAF} />
          </clipPath>
        </defs>

        {/* a few short rays, like the sun in the scenes */}
        <motion.g strokeWidth={0.9} {...fade(1.1, 0.55)}>
          {RAYS.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </motion.g>

        {/* stem, thorns, leaf */}
        <motion.path d={STEM} strokeWidth={1.6} {...draw(0.05, 0.8)} />
        {THORNS.map((d, i) => (
          <motion.path key={i} d={d} strokeWidth={1.2} {...draw(0.5 + i * 0.1, 0.3)} />
        ))}
        <motion.path d={LEAF} strokeWidth={1.3} {...draw(0.35, 0.7)} />
        <motion.path d={VEIN} strokeWidth={0.9} {...draw(0.6, 0.5)} />
        <motion.g strokeWidth={0.7} {...fade(0.9, 0.75)}>
          {LEAF_VEINS.map((d, i) => (
            <path key={i} d={d} />
          ))}
          <g clipPath="url(#rose-leaf)" opacity={0.7}>
            {LEAF_HATCH.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </g>
        </motion.g>

        {/* bloom */}
        {BLOOM.map((d, i) => (
          <motion.path key={i} d={d} strokeWidth={i === 0 ? 1.7 : 1.3} {...draw(0.25 + i * 0.07, 0.8)} />
        ))}
        <motion.path d={CENTER} strokeWidth={1.1} {...draw(0.55, 1.1)} />
        <motion.g clipPath="url(#rose-cup)" strokeWidth={0.75} {...fade(1.0, 0.6)}>
          {CUP_HATCH.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </motion.g>
      </svg>
    </motion.div>
  );
}
