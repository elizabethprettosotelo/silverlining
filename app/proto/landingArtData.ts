/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/*
 * The crow landing art (first onboarding screen), built as SVG in the same
 * engraved line style as the scenes. Ported from the approved preview.
 * Styles and motion live in globals.css under `.landing-art`; add the
 * `flying` class to the <svg> to make the crow take off.
 */
export function buildLandingArt(svg: SVGSVGElement) {
  svg.innerHTML = "";
  const u = Math.random().toString(36).slice(2, 7); // unique ids per drawing
  const NS = "http://www.w3.org/2000/svg";
  const el = (t, a = {}, p) => { const n = document.createElementNS(NS, t); for (const k in a) n.setAttribute(k, a[k]); if (p) p.appendChild(n); return n; };
  const r1 = n => Math.round(n * 10) / 10;
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const W = 390, H = 580;
  const defs = el("defs", {}, svg);

  // plate: surface fading to the ground at the bottom
  const lg = el("linearGradient", { id: "ln" + u + "-plate", x1: 0, y1: 0, x2: 0, y2: H, gradientUnits: "userSpaceOnUse" }, defs);
  el("stop", { offset: 0, style: "stop-color:var(--surface)" }, lg); el("stop", { offset: .6, style: "stop-color:var(--surface)" }, lg); el("stop", { offset: 1, style: "stop-color:var(--ground)" }, lg);
  const fade = el("linearGradient", { id: "ln" + u + "-fade", x1: 0, y1: 0, x2: 0, y2: H, gradientUnits: "userSpaceOnUse" }, defs);
  el("stop", { offset: 0, "stop-color": "#fff" }, fade); el("stop", { offset: .82, "stop-color": "#fff" }, fade); el("stop", { offset: 1, "stop-color": "#000" }, fade);
  const mask = el("mask", { id: "ln" + u + "-m", maskUnits: "userSpaceOnUse", x: 0, y: 0, width: W, height: H }, defs); el("rect", { width: W, height: H, fill: `url(#ln${u}-fade)` }, mask);
  el("rect", { width: W, height: H, fill: `url(#ln${u}-plate)` }, svg);
  const P = `url(#ln${u}-plate)`;
  const art = el("g", { mask: `url(#ln${u}-m)` }, svg);

  /* ---------- sky ---------- */
  const horizon = 330;
  const sky = el("g", { class: "land", "stroke-width": .6, opacity: .22 }, art);
  for (let y = horizon; y > 210;) { el("path", { d: `M-10 ${r1(y)}H${W + 10}` }, sky); y -= 5 + (horizon - y) * .12; }

  // the sun, on the upper-right third
  const sun = { x: 270, y: 150, r: 30 };
  const rays = el("g", { class: "land rays", "stroke-width": .8, opacity: .55 }, art);
  for (let i = 0; i < 52; i++) { const a = i / 52 * Math.PI * 2, r0 = sun.r + 8, len = (i % 2 ? .5 : 1) * 64; el("path", { d: `M${r1(sun.x + Math.cos(a) * r0)} ${r1(sun.y + Math.sin(a) * r0)}L${r1(sun.x + Math.cos(a) * (r0 + len))} ${r1(sun.y + Math.sin(a) * (r0 + len))}` }, rays); }
  const glow = el("g", { class: "land shine", "stroke-width": .5 }, art);
  for (const k of [1.6, 2.1, 2.7]) el("circle", { cx: sun.x, cy: sun.y, r: sun.r * k }, glow);
  el("circle", { cx: sun.x, cy: sun.y, r: sun.r + 3, fill: P, stroke: "none" }, art);
  el("circle", { cx: sun.x, cy: sun.y, r: sun.r, class: "land", "stroke-width": 1.2 }, art);
  for (const k of [.72, .46, .22]) el("circle", { cx: sun.x, cy: sun.y, r: sun.r * k, class: "land", "stroke-width": .6, opacity: .4 }, art);

  // clouds: union outline (fat stroke under a plate fill) + underside hatch; they drift across
  function cloud(parent, cx, cy, w, seed, cls) {
    const rand = rng(seed), g = el("g", { class: cls }, parent), circles = [];
    for (let i = 0; i < 6; i++) { const t = i / 5, b = Math.sin(t * Math.PI); circles.push([cx - w / 2 + t * w, cy - b * w * .1 + rand() * 4, w * (.12 + .13 * b) * (.85 + rand() * .3)]); }
    circles.push([cx, cy + w * .06, w * .2]);
    const id = "c" + seed; const cp = el("clipPath", { id: "ln" + u + "-" + id }, defs); circles.forEach(([x, y, r]) => el("circle", { cx: r1(x), cy: r1(y), r: r1(r) }, cp));
    circles.forEach(([x, y, r]) => el("circle", { cx: r1(x), cy: r1(y), r: r1(r), class: "land", "stroke-width": 2.2, opacity: .7 }, g));
    circles.forEach(([x, y, r]) => el("circle", { cx: r1(x), cy: r1(y), r: r1(r), fill: P }, g));
    const h = el("g", { class: "land", "stroke-width": .7, opacity: .4, "clip-path": `url(#ln${u}-${id})` }, g);
    for (let y = cy + w * .28; y > cy - w * .02; y -= 3.2) el("path", { d: `M${r1(cx - w)} ${r1(y)}H${r1(cx + w)}` }, h);
  }
  cloud(art, 60, 95, 120, 5, "drift-a");
  cloud(art, 200, 205, 150, 9, "drift-b");

  /* ---------- hills ---------- */
  function hill(base, waves, gap, op) {
    const ridge = x => waves.reduce((y, [a, f, p]) => y + a * Math.sin(x * f + p), base);
    let d = ""; for (let x = -10; x <= W + 10; x += 5) d += `${x === -10 ? "M" : "L"}${x} ${r1(ridge(x))}`;
    el("path", { d: d + `L${W + 10} ${H + 10}L-10 ${H + 10}Z`, fill: P }, art);
    const lines = el("g", { class: "land", "stroke-width": .75, opacity: op }, art);
    for (let i = 1; i < 40; i++) { const off = i * gap; let l = "", minY = 1e9; for (let x = -10; x <= W + 10; x += 6) { const y = ridge(x) + off * (1 + .1 * Math.sin(x * .018 + i * .6)); minY = Math.min(minY, y); l += `${x === -10 ? "M" : "L"}${x} ${r1(y)}`; } if (minY > H) break; el("path", { d: l }, lines); }
    el("path", { d, class: "land", "stroke-width": 1.1, opacity: Math.min(1, op + .15) }, art);
  }
  hill(horizon - 14, [[16, .011, 1.2], [6, .031, .4]], 7, .38);
  hill(horizon + 28, [[20, .008, 3.1], [7, .027, 2.2]], 5.6, .5);

  /* ---------- contour helpers: lines that follow a form ---------- */
  function cubic([x0, y0], [x1, y1], [x2, y2], [x3, y3], n = 24) { const pts = []; for (let i = 0; i <= n; i++) { const t = i / n, u = 1 - t; pts.push([u*u*u*x0 + 3*u*u*t*x1 + 3*u*t*t*x2 + t*t*t*x3, u*u*u*y0 + 3*u*u*t*y1 + 3*u*t*t*y2 + t*t*t*y3]); } return pts; }
  const poly = pts => "M" + pts.map(([x, y]) => `${r1(x)} ${r1(y)}`).join("L");
  // copies of a guide curve, stepped along (dx, dy) and clipped to a shape
  function contours(parent, guide, steps, dx, dy, clipId, attrs) {
    const g = el("g", Object.assign({ class: "crow", "clip-path": `url(#ln${u}-${clipId})` }, attrs), parent);
    for (let k = 0; k < steps; k++) el("path", { d: poly(guide.map(([x, y]) => [x + dx * k, y + dy * k])) }, g);
    return g;
  }
  const clip = (id, d) => { const c = el("clipPath", { id: "ln" + u + "-" + id }, defs); el("path", { d }, c); };

  /* ---------- the rock: nested domes, darker on the shaded right ---------- */
  const rock = "M6 506C4 482 14 458 36 442C54 428 72 416 98 410C124 404 152 406 174 416C198 426 214 446 222 468C228 484 230 496 228 506Z";
  const pebble = "M214 506C214 490 226 482 240 482C254 482 264 492 264 506Z";
  clip("rock", rock); clip("pebble", pebble);
  el("path", { d: rock, fill: P }, art); el("path", { d: pebble, fill: P }, art);
  const rockTop = cubic([2, 500], [12, 440], [70, 404], [126, 406]).concat(cubic([126, 406], [176, 408], [218, 440], [232, 506]).slice(1));
  contours(art, rockTop, 30, 0, 3.6, "rock", { class: "land", "stroke-width": .75, opacity: .5 });
  contours(art, cubic([210, 506], [214, 486], [240, 476], [266, 506]), 7, 0, 3.4, "pebble", { class: "land", "stroke-width": .7, opacity: .5 });
  const cracks = el("g", { class: "land", "stroke-width": 1, opacity: .75 }, art);
  ["M124 410C128 430 140 446 158 456", "M72 428C76 446 88 460 104 470"].forEach(d => el("path", { d }, cracks));
  el("path", { d: rock.replace(/Z$/, ""), class: "land", "stroke-width": 1.5, opacity: .9 }, art);
  el("path", { d: pebble.replace(/Z$/, ""), class: "land", "stroke-width": 1.3, opacity: .85 }, art);

  /* ---------- the crow ----------
     Facing right, toes at y = 12. Shaded only with lines that follow its form:
     the back, the folded wing and the head each get their own run of contours. */
  const C = {
    body: "M34 -93C30 -104 14 -108 4 -102C-4 -96 -8 -86 -10 -76C-22 -66 -40 -48 -52 -30C-55 -25 -57 -21 -58 -18L-94 12L-88 20L-50 -4C-36 4 -14 6 4 0C20 -6 30 -24 30 -44C30 -60 32 -72 34 -79Z",
    head: "M34 -93C30 -104 14 -108 4 -102C-4 -96 -8 -86 -10 -76C2 -70 20 -72 34 -79Z",
    wing: "M14 -72C-2 -66 -24 -52 -42 -30C-54 -16 -64 -4 -72 6C-56 2 -38 -4 -22 -12C-4 -22 10 -36 16 -52C18 -60 18 -68 14 -72Z",
    beak: "M33 -94C46 -95 56 -92 63 -86C55 -83 45 -80 33 -79C35 -84 35 -89 33 -94Z",
  };
  clip("crowBody", C.body); clip("crowHead", C.head); clip("crowWing", C.wing); clip("crowBeak", C.beak);
  const flight = el("g", { class: "flight" }, art);
  const crow = el("g", { transform: "translate(150 404) scale(1.45)" }, flight);
  // legs and toes
  const legs = el("g", { class: "crow legs", "stroke-width": 1.5 }, crow);
  ["M-4 2L-6 12", "M8 -1L8 12", "M-6 12l-9 2", "M-6 12l6 3", "M8 12l-6 3", "M8 12l9 1"].forEach(d => el("path", { d }, legs));
  const farWing = el("g", { class: "wing-open far" }, crow);
  const body = el("g", { class: "breathe" }, crow);
  el("path", { d: C.body, fill: P }, body);
  // back and belly: contours that run the length of the bird, packed tight so it reads dark
  const back = [[46, -130], [16, -100]].concat(cubic([-12, -82], [-26, -66], [-46, -44], [-64, -14])).concat([[-100, 16]]);
  contours(body, back, 62, 1.22, 1.47, "crowBody", { "stroke-width": .85, opacity: .95 });
  // head: rounder contours that follow the crown, a little looser
  const headG = el("g", { class: "head", style: "transform-origin: 8px -78px" }, body);
  el("path", { d: C.head, fill: P }, headG);
  contours(headG, cubic([-14, -80], [-12, -104], [16, -114], [38, -96]), 12, .5, 2.3, "crowHead", { "stroke-width": .8, opacity: .9 });
  // folded wing: contours along the wing, then the long primaries and a few coverts
  const wingFold = el("g", { class: "wing-fold" }, body);
  el("path", { d: C.wing, fill: P }, wingFold);
  const wingTop = cubic([16, -74], [-2, -66], [-24, -52], [-42, -30]).concat(cubic([-42, -30], [-54, -16], [-64, -4], [-76, 8]).slice(1));
  contours(wingFold, wingTop, 36, -.75, 1.7, "crowWing", { "stroke-width": .75, opacity: .9 });
  const feathers = el("g", { class: "crow", "stroke-width": 1 }, wingFold);
  ["M10 -56C-6 -44 -26 -28 -44 -12", "M4 -46C-12 -34 -32 -18 -54 -4", "M-2 -36C-18 -24 -40 -10 -64 2"].forEach(d => el("path", { d }, feathers));
  for (const [x, y] of [[6, -64], [-1, -59], [-8, -53], [-2, -67], [-9, -61]]) el("path", { d: `M${x} ${y}q-4 5 -9 4`, "stroke-width": .8 }, feathers);
  el("path", { d: C.wing, class: "crow", "stroke-width": 1.2 }, wingFold);
  // light on the crown and along the back: gaps left in the lines
  const sheen = el("g", { stroke: "var(--surface)", fill: "none", "stroke-linecap": "round" }, body);
  [["M24 -99C16 -103 8 -102 0 -97", 2.2], ["M-14 -72C-26 -60 -38 -46 -48 -32", 1.8], ["M26 -56C26 -44 22 -32 16 -22", 1.6]].forEach(([d, w]) => el("path", { d, "stroke-width": w }, sheen));
  // throat feathers, outline
  const throat = el("g", { class: "crow", "stroke-width": .9 }, body);
  ["M31 -74l4 4", "M30 -68l5 3", "M30 -62l4 4"].forEach(d => el("path", { d }, throat));
  el("path", { d: C.body, class: "crow", "stroke-width": 1.6 }, body);
  // beak: three lines along its length, a lit upper edge
  el("path", { d: C.beak, fill: P }, headG);
  contours(headG, cubic([33, -93], [45, -94], [55, -91], [63, -86]), 6, 0, 2.6, "crowBeak", { "stroke-width": .8, opacity: .9 });
  el("path", { d: C.beak, class: "crow", "stroke-width": 1.4 }, headG);
  el("path", { d: "M33 -86L54 -86", class: "crow", "stroke-width": .8 }, headG);
  // open wings for the flight: a raised wing with a feathered trailing edge
  C.open = "M10 -66C-4 -92 -34 -122 -76 -132C-70 -122 -66 -116 -62 -110C-74 -112 -88 -110 -98 -104C-86 -98 -74 -94 -66 -92C-76 -88 -86 -82 -90 -74C-70 -74 -54 -76 -40 -74C-44 -68 -46 -62 -44 -56C-28 -58 -8 -60 4 -54Z";
  clip("crowOpen", C.open);
  function openWing(parent) {
    const g = el("g", { class: "flap" }, parent);
    el("path", { d: C.open, fill: P }, g);
    contours(g, cubic([12, -70], [-6, -94], [-36, -122], [-80, -134]), 22, -1.2, 2.2, "crowOpen", { "stroke-width": .75, opacity: .9 });
    const pr = el("g", { class: "crow", "stroke-width": .9 }, g);
    ["M-20 -66L-62 -110", "M-26 -64L-86 -100", "M-30 -62L-84 -78", "M-24 -58L-44 -58"].forEach(d => el("path", { d }, pr));
    el("path", { d: C.open, class: "crow", "stroke-width": 1.3 }, g);
    return g;
  }
  openWing(farWing);
  const nearWing = el("g", { class: "wing-open near" }, crow); openWing(nearWing);
  // eye
  el("circle", { cx: 16, cy: -92, r: 3.4, fill: P }, headG);
  el("circle", { cx: 16.3, cy: -92, r: 2.2, fill: "var(--land)" }, headG);
  el("circle", { cx: 17.1, cy: -92.8, r: .75, fill: "var(--surface)" }, headG);
  el("ellipse", { cx: 16, cy: -92, rx: 3.6, ry: 3.6, fill: "var(--land)", class: "lid" }, headG);
  el("circle", { cx: 16, cy: -92, r: 3.4, class: "crow", "stroke-width": .8 }, headG);

  /* ---------- foreground foliage (sways) ---------- */
  const fg = el("g", {}, art);
  const rand = rng(42);
  function clump(cx, base, n, hMin, hMax, spread, t, d, a) {
    const g = el("g", { class: "land sway", style: `--t:${t}s;--d:${d}s;--a:${a}deg`, "stroke-width": 1 }, fg);
    for (let i = 0; i < n; i++) { const x = cx + (rand() - .5) * spread, h = hMin + rand() * (hMax - hMin), lean = (rand() - .5) * 30; el("path", { d: `M${r1(x)} ${base}q${r1(lean * .2)} ${r1(-h * .6)} ${r1(lean)} ${r1(-h)}` }, g); }
    return g;
  }
  function fern(x, base, h, dir, t, d) {
    const g = el("g", { class: "land sway", style: `--t:${t}s;--d:${d}s;--a:4deg`, "stroke-width": 1.1 }, fg);
    const tipX = x + dir * h * .45, tipY = base - h;
    el("path", { d: `M${x} ${base}Q${r1(x + dir * h * .05)} ${r1(base - h * .6)} ${r1(tipX)} ${r1(tipY)}` }, g);
    for (let i = 1; i < 12; i++) { const t2 = i / 12, px = x + (tipX - x) * t2 * t2 * .9 + dir * h * .02 * t2, py = base - h * t2, len = (1 - t2) * h * .28 + 3;
      el("path", { d: `M${r1(px)} ${r1(py)}q${r1(dir * len * .5)} ${r1(-len * .2)} ${r1(dir * len)} ${r1(len * .3)}` }, g);
      el("path", { d: `M${r1(px)} ${r1(py)}q${r1(-dir * len * .4)} ${r1(-len * .3)} ${r1(-dir * len * .8)} ${r1(len * .1)}` }, g); }
  }
  // low ground band to tuck stems into
  el("path", { d: `M-10 520C80 508 160 516 250 508C310 504 360 510 400 506L400 600L-10 600Z`, fill: P }, fg);
  const gl = el("g", { class: "land", "stroke-width": .6, opacity: .35 }, fg);
  for (let y = 522; y < 580; y += 6) el("path", { d: `M-10 ${y}C100 ${y - 4} 220 ${y + 3} 400 ${y - 2}` }, gl);
  fern(352, 560, 150, -1, 5.2, 0); fern(372, 560, 110, -1, 4.4, -1.4);
  clump(300, 556, 7, 40, 90, 44, 3.8, -.6, 3); clump(36, 556, 6, 34, 64, 44, 4.6, -2, 3.5); fern(10, 560, 120, 1, 5.6, -2.2);
  // tall stalks with seed heads on the right
  for (const [x, h, t, d] of [[318, 170, 5, 0], [336, 196, 5.8, -1.2]]) {
    const g = el("g", { class: "land sway", style: `--t:${t}s;--d:${d}s;--a:3deg`, "stroke-width": 1 }, fg);
    el("path", { d: `M${x} 560q-6 ${-h * .5} ${-14} ${-h}` }, g);
    for (let i = 0; i < 7; i++) { const y = 560 - h + i * 7, xx = x - 14 + i * .6; el("path", { d: `M${r1(xx)} ${r1(y)}l-6 -5M${r1(xx)} ${r1(y)}l6 -5` }, g); }
  }
}
