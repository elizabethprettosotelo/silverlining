"use client";

/*
 * The rose takeover: when you give a story your rose, a stem grows out of the
 * bottom-right corner of the screen, vines spread along the bottom and up the
 * right edge, leaves pop out as each vine passes, and a bud opens into the rose.
 * Same engraved linework as the scenes. Vines use the mood color; only the rose
 * uses the accent. Sits above the story, below the footer buttons and sheets.
 *
 * Leaves are placed along the vines with getPointAtLength, so the SVG is built
 * imperatively after mount. Timing lives in CSS (.rt-*), so reduced motion just
 * jumps to the finished state.
 */

import { useEffect, useRef } from "react";

const NS = "http://www.w3.org/2000/svg";
const r1 = (n: number) => Math.round(n * 10) / 10;
type Attrs = Record<string, string | number>;
function el(tag: string, attrs: Attrs = {}, parent?: Element) {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, String(attrs[k]));
  if (parent) parent.appendChild(n);
  return n;
}

/* [path, start delay (s), duration (s), stroke width] */
const VINES: [string, number, number, number][] = [
  ["M404 860C386 830 352 812 344 772C338 742 352 716 340 688C332 668 316 660 318 640", 0.0, 1.5, 2.4],
  ["M396 846C352 836 320 852 280 842C236 830 210 850 168 840C128 830 104 846 66 836C46 830 34 818 40 806C46 796 60 802 56 812", 0.35, 2.2, 1.6],
  ["M392 812C378 760 392 712 378 660C366 612 386 566 374 514C364 470 382 430 372 388C366 360 350 350 356 336C360 326 372 332 366 342", 0.5, 2.4, 1.6],
  ["M350 748C318 742 296 724 268 728C246 731 238 712 252 704C262 700 268 710 260 714", 0.9, 1.3, 1.2],
  ["M376 540C352 528 338 506 316 508C300 510 296 494 308 490C316 488 318 498 312 500", 1.4, 1.1, 1.0],
];
/* [vine index, position along it (0..1), side (+1/-1), size] */
const LEAVES: [number, number, number, number][] = [
  [0, 0.22, 1, 1.15], [0, 0.42, -1, 1.0], [0, 0.62, 1, 0.9], [0, 0.8, -1, 0.75],
  [1, 0.08, -1, 1.1], [1, 0.22, 1, 0.9], [1, 0.36, -1, 0.95], [1, 0.5, 1, 0.8], [1, 0.64, -1, 0.75], [1, 0.78, 1, 0.6],
  [2, 0.1, -1, 1.05], [2, 0.24, 1, 0.85], [2, 0.38, -1, 0.95], [2, 0.52, 1, 0.8], [2, 0.66, -1, 0.7], [2, 0.8, 1, 0.55],
  [3, 0.3, 1, 0.8], [3, 0.6, -1, 0.65],
  [4, 0.35, 1, 0.6],
];

const LEAF = "M0 0C7 -9 23 -11 36 0C23 11 7 9 0 0Z";
const VEIN = "M0 0L33 0";
const SIDE_VEINS = ["M9 0L15 -5", "M17 0L23 -5", "M9 0L15 5", "M17 0L23 5"];

function spiral(cx: number, cy: number, turns: number, maxR: number) {
  let d = "";
  const steps = 60;
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * turns * Math.PI * 2;
    const r = 1.2 + (maxR * i) / steps;
    d += `${i ? "L" : "M"}${r1(cx + Math.cos(t) * r * 1.15)} ${r1(cy + Math.sin(t) * r * 0.8)}`;
  }
  return d;
}
const BLOOM = [
  "M60 88C44 86 30 72 30 54C30 45 33 39 38 35C40 43 44 49 51 53",
  "M60 88C76 86 90 72 90 54C90 45 87 39 82 35C80 43 76 49 69 53",
  "M35 57C43 64 51 66 60 66C69 66 77 64 85 57",
  "M38 35C42 26 50 22 58 26",
  "M82 35C78 26 70 22 62 26",
  "M50 26C54 18 66 18 70 26",
  "M44 46C46 56 74 56 76 46",
  "M44 46C46 36 54 32 60 34",
  "M76 46C74 36 66 32 60 34",
];
const CUP = "M35 57C43 64 51 66 60 66C69 66 77 64 85 57C85 72 74 86 60 88C46 86 35 72 35 57Z";
const BLOOM_FILL = "M60 88C46 86 30 72 30 54C30 30 50 18 60 18C70 18 90 30 90 54C90 72 74 86 60 88Z";
const BUD = "M60 88C50 82 46 70 48 58C50 48 56 42 60 36C64 42 70 48 72 58C74 70 70 82 60 88Z";
const BUD_LINES = ["M60 86C56 74 56 58 60 40", "M60 86C66 76 68 62 64 48"];
const SEPALS = ["M60 88C52 86 44 80 40 72", "M60 88C68 86 76 80 80 72", "M60 88C58 80 54 76 50 74"];

function build(svg: SVGSVGElement, uid: string) {
  svg.innerHTML = "";
  const defs = el("defs", {}, svg);
  const vinesG = el("g", {}, svg);
  const leavesG = el("g", {}, svg);
  const anim = (delay: number, dur?: number) => `--delay:${delay}s${dur ? `;--dur:${dur}s` : ""}`;

  const paths = VINES.map(([d, delay, dur, w]) => ({
    p: el("path", { d, class: "rt-vine rt-draw", pathLength: 1, "stroke-width": w, style: anim(delay, dur) }, vinesG) as SVGPathElement,
    delay,
    dur,
  }));

  const main = paths[0];
  const L0 = main.p.getTotalLength();
  [0.3, 0.55].forEach((t, i) => {
    const a = main.p.getPointAtLength(t * L0);
    const b = main.p.getPointAtLength(t * L0 + 1);
    const ang = Math.atan2(b.y - a.y, b.x - a.x) + (i % 2 ? 1 : -1) * 1.1;
    el("path", { d: `M${r1(a.x)} ${r1(a.y)}l${r1(Math.cos(ang) * 7)} ${r1(Math.sin(ang) * 7)}`, class: "rt-vine rt-draw", pathLength: 1, "stroke-width": 1.4, style: anim(main.delay + t * main.dur, 0.3) }, vinesG);
  });

  LEAVES.forEach(([vi, t, side, size], k) => {
    const { p, delay, dur } = paths[vi];
    const L = p.getTotalLength();
    const a = p.getPointAtLength(t * L);
    const b = p.getPointAtLength(Math.min(L, t * L + 1));
    const ang = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI + side * 52;
    const outer = el("g", { transform: `translate(${r1(a.x)} ${r1(a.y)}) rotate(${r1(ang)})` }, leavesG);
    const g = el("g", { class: "rt-pop", style: `${anim(delay + t * dur + 0.05)};--s:${size}` }, outer);
    const id = `${uid}-leaf${k}`;
    el("path", { d: LEAF }, el("clipPath", { id }, defs));
    el("path", { d: LEAF, class: "rt-vine rt-leaf", "stroke-width": 1.2 }, g);
    el("path", { d: VEIN, class: "rt-vine", "stroke-width": 0.9 }, g);
    const sv = el("g", { class: "rt-vine", "stroke-width": 0.7, opacity: 0.8 }, g);
    SIDE_VEINS.forEach((d) => el("path", { d }, sv));
    const h = el("g", { class: "rt-vine", "stroke-width": 0.6, opacity: 0.55, "clip-path": `url(#${id})` }, g);
    for (let x = 2; x < 34; x += 3) el("path", { d: `M${x} 0.5L${x + 3} 8` }, h);
  });

  // The rose: a bud first, then it opens.
  const tip = main.p.getPointAtLength(L0);
  const anchor = el("g", { transform: `translate(${r1(tip.x)} ${r1(tip.y)})` }, svg);
  const swayG = el("g", { class: "rt-sway" }, anchor);
  const S = 1.15;
  const budStart = main.delay + main.dur - 0.25;
  const bud = el("g", { class: "rt-bud", style: anim(budStart) }, swayG);
  const budInner = el("g", { transform: `scale(${S}) translate(-60 -88)` }, bud);
  el("path", { d: BUD, class: "rt-rose rt-leaf", "stroke-width": 1.5 }, budInner);
  BUD_LINES.forEach((d) => el("path", { d, class: "rt-rose", "stroke-width": 0.9 }, budInner));
  SEPALS.forEach((d) => el("path", { d, class: "rt-vine", "stroke-width": 1.3 }, budInner));

  const openAt = budStart + 1.0;
  const bloom = el("g", { class: "rt-bloom", style: anim(openAt) }, swayG);
  const bi = el("g", { transform: `scale(${S}) translate(-60 -88)` }, bloom);
  const cupId = `${uid}-cup`;
  el("path", { d: CUP }, el("clipPath", { id: cupId }, defs));
  el("path", { d: BLOOM_FILL, class: "rt-leaf", stroke: "none" }, bi);
  SEPALS.forEach((d) => el("path", { d, class: "rt-vine rt-draw", pathLength: 1, "stroke-width": 1.3, style: anim(openAt, 0.5) }, bi));
  BLOOM.forEach((d, i) => el("path", { d, class: "rt-rose rt-draw", pathLength: 1, "stroke-width": i < 2 ? 1.7 : 1.3, style: anim(openAt + i * 0.07, 0.9) }, bi));
  el("path", { d: spiral(60, 42, 2.1, 9), class: "rt-rose rt-draw", pathLength: 1, "stroke-width": 1.1, style: anim(openAt + 0.4, 1.1) }, bi);
  const hatch = el("g", { class: "rt-rose rt-fade", "stroke-width": 0.75, "clip-path": `url(#${cupId})`, style: `${anim(openAt + 0.8)};--o:.65` }, bi);
  for (let x = 4; x < 92; x += 3.2) el("path", { d: `M${r1(x)} 90l12 -34` }, hatch);
  const rays = el("g", { class: "rt-rose rt-fade", "stroke-width": 0.9, style: `${anim(openAt + 1.2)};--o:.6` }, bi);
  for (let i = 0; i < 11; i++) {
    const a = -Math.PI * 0.95 + (i / 10) * Math.PI * 0.9;
    const r = i % 2 ? 6 : 11;
    el("path", { d: `M${r1(60 + Math.cos(a) * 50)} ${r1(48 + Math.sin(a) * 45)}l${r1(Math.cos(a) * r)} ${r1(Math.sin(a) * r * 0.9)}` }, rays);
  }
}

export default function RoseTakeover({ mood = "turned" }: { mood?: "turned" | "good" | "vent" }) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    if (ref.current) build(ref.current, `rt${Math.random().toString(36).slice(2, 7)}`);
  }, []);
  return (
    <div className={`rose-takeover rose-mood-${mood}`} aria-hidden>
      <svg ref={ref} viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice" />
    </div>
  );
}
