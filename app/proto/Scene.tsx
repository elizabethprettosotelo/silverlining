"use client";

/*
 * Scene headers: the illustrated plates at the top of a screen.
 * In Figma these are the "Scene header" component (Mood = Good / Turned / Vent).
 *
 * Style: engraved linework, after the inspo board's etchings, fading into the
 * screen's ground the way the misty landscape headers do. Everything is drawn
 * in the mood color and the plate is a gradient from the surface to the ground,
 * so it follows Day and Night without separate art.
 *
 * The art is generated (seeded, so the server and client render the same lines).
 */

import { useId, useMemo } from "react";

export type Mood = "turned" | "good" | "vent";

type Props = {
  mood: Mood;
  height: number;
  /** "dusk" swaps the sun for a moon and a few stars (That's today). */
  time?: "day" | "dusk";
};

const W = 390;

const GROUND: Record<Mood, string> = {
  turned: "var(--ground-turned)",
  good: "var(--ground-good)",
  vent: "var(--ground-vent)",
};
const INK: Record<Mood, string> = {
  turned: "var(--mood-turned)",
  good: "var(--mood-good)",
  vent: "var(--mood-vent)",
};

/* ---------- small helpers ---------- */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const r1 = (n: number) => Math.round(n * 10) / 10;

type Ridge = (x: number) => number;
function makeRidge(base: number, waves: [number, number, number][]): Ridge {
  return (x) => waves.reduce((y, [amp, freq, phase]) => y + amp * Math.sin(x * freq + phase), base);
}
function polyline(fn: Ridge, step = 5, x0 = -10, x1 = W + 10) {
  let d = "";
  for (let x = x0; x <= x1; x += step) d += `${x === x0 ? "M" : "L"}${r1(x)} ${r1(fn(x))}`;
  return d;
}

type Hill = { fill: string; lines: string[]; ridge: string; gap: number; opacity: number };

function hill(ridge: Ridge, h: number, gap: number, opacity: number, wobble: number): Hill {
  const fill = `${polyline(ridge)}L${W + 10} ${h + 10}L-10 ${h + 10}Z`;
  const lines: string[] = [];
  // Contour lines that follow the ridge, loosening as they go down: the woodcut look.
  for (let i = 1; i < 40; i++) {
    const off = i * gap;
    const fn: Ridge = (x) => ridge(x) + off * (1 + wobble * Math.sin(x * 0.018 + i * 0.6));
    if (Math.min(fn(0), fn(W / 2), fn(W)) > h + 4) break;
    lines.push(polyline(fn, 6));
  }
  return { fill, lines, ridge: polyline(ridge), gap, opacity };
}

type Cloud = { circles: [number, number, number][]; hatch: string[]; shade: number };
function cloud(cx: number, cy: number, w: number, seed: number, shade: number): Cloud {
  const rand = rng(seed);
  const circles: [number, number, number][] = [];
  const n = 6;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const x = cx - w / 2 + t * w;
    const bump = Math.sin(t * Math.PI); // taller in the middle
    const r = w * (0.12 + 0.13 * bump) * (0.85 + rand() * 0.3);
    circles.push([r1(x), r1(cy - bump * w * 0.1 + rand() * 4), r1(r)]);
  }
  // a flat base so it sits like a real cumulus
  circles.push([r1(cx), r1(cy + w * 0.06), r1(w * 0.2)]);
  const top = cy - w * 0.36;
  const bottom = cy + w * 0.28;
  const hatch: string[] = [];
  // shading: horizontal hatch on the underside only (shade = 0..1, how far up it reaches)
  const start = bottom - (bottom - top) * shade;
  for (let y = bottom; y > start; y -= 3.2) hatch.push(`M${r1(cx - w)} ${r1(y)}H${r1(cx + w)}`);
  return { circles, hatch, shade };
}

/* ---------- the scene ---------- */
export default function Scene({ mood, height: h, time = "day" }: Props) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const id = (s: string) => `sc-${uid}-${s}`;
  const ink = INK[mood];

  const art = useMemo(() => {
    const rand = rng(mood === "turned" ? 11 : mood === "good" ? 23 : 37);
    const horizon = h * (mood === "vent" ? 0.7 : 0.66);

    // Three layers of hills, far to near.
    const hills: Hill[] = [
      hill(makeRidge(horizon - h * 0.06, [[h * 0.05, 0.011, 1.2], [h * 0.02, 0.031, 0.4]]), h, 5.2, 0.42, 0.18),
      hill(makeRidge(horizon + h * 0.06, [[h * 0.06, 0.008, 3.1], [h * 0.025, 0.027, 2.2]]), h, 4.2, 0.6, 0.22),
      hill(makeRidge(horizon + h * 0.17, [[h * 0.05, 0.012, 5.0], [h * 0.02, 0.04, 1.1]]), h, 3.4, 0.78, 0.25),
    ];

    // Sky hatch: horizontal lines that gather toward the horizon. Kept off the top
    // third so headings stay clean.
    const sky: string[] = [];
    for (let y = horizon; y > h * 0.34; ) {
      sky.push(`M-10 ${r1(y)}H${W + 10}`);
      y -= 4 + (horizon - y) * 0.09;
    }

    // Sun / moon position: right side, away from left-aligned headings.
    const sun = {
      x: mood === "good" ? W * 0.76 : W * 0.72,
      y: mood === "good" ? h * 0.42 : h * 0.4,
      r: mood === "good" ? Math.min(34, h * 0.13) : Math.min(26, h * 0.11),
    };
    const rays: string[] = [];
    const nRays = mood === "good" ? 48 : 36;
    for (let i = 0; i < nRays; i++) {
      const a = (i / nRays) * Math.PI * 2;
      const len = (i % 2 ? 0.55 : 1) * (mood === "good" ? h * 0.2 : h * 0.15);
      const r0 = sun.r + 6;
      rays.push(
        `M${r1(sun.x + Math.cos(a) * r0)} ${r1(sun.y + Math.sin(a) * r0)}L${r1(sun.x + Math.cos(a) * (r0 + len))} ${r1(sun.y + Math.sin(a) * (r0 + len))}`,
      );
    }
    const rings = [0.72, 0.46, 0.22].map((k) => r1(sun.r * k));

    // Clouds
    let clouds: Cloud[] = [];
    if (mood === "turned") {
      // One cloud in front of the sun's lower-left: the light gets around it.
      clouds = [cloud(sun.x - sun.r * 2.3, sun.y + sun.r * 1.25, 136, 5, 0.5)];
      if (time === "dusk") clouds = [cloud(W * 0.3, h * 0.5, 120, 8, 0.35)];
    } else if (mood === "vent") {
      clouds = [
        cloud(W * 0.72, h * 0.3, 210, 3, 0.85),
        cloud(W * 0.32, h * 0.4, 170, 9, 0.75),
      ];
    } else {
      clouds = [cloud(W * 0.14, h * 0.6, 84, 4, 0.25)];
    }

    // Rain (vent): slanted strokes in loose columns. Drawn taller than the plate so
    // the loop can slide one full step without a seam.
    const rain: string[] = [];
    if (mood === "vent") {
      for (let x = -20; x < W + 20; x += 9) {
        const phase = rand() * 22;
        const len = 7 + rand() * 6; // per column, so the loop has no visible jump
        for (let y = h * 0.32 - 22 + phase; y < h + 24; y += 22) {
          rain.push(`M${r1(x)} ${r1(y)}l${r1(-len * 0.28)} ${r1(len)}`);
        }
      }
    }

    // Birds (good days)
    const birds =
      mood === "good"
        ? [
            [W * 0.36, h * 0.3, 7],
            [W * 0.42, h * 0.25, 5],
            [W * 0.31, h * 0.22, 4.5],
          ].map(([x, y, s]) => `M${r1(x - s)} ${r1(y)}q${r1(s / 2)} ${r1(-s * 0.7)} ${r1(s)} 0q${r1(s / 2)} ${r1(-s * 0.7)} ${r1(s)} 0`)
        : [];

    // Stars (dusk)
    const stars: [number, number, number][] = [];
    if (time === "dusk") {
      const srand = rng(77);
      for (let i = 0; i < 14; i++) {
        const x = W * 0.42 + srand() * W * 0.55;
        const y = h * 0.12 + srand() * h * 0.38;
        stars.push([r1(x), r1(y), r1(1.6 + srand() * 2.4)]);
      }
    }

    return { hills, sky, sun, rays, rings, clouds, rain, birds, stars, horizon };
  }, [mood, h, time]);

  const plate = `url(#${id("plate")})`;
  const showSun = mood !== "vent" && time === "day";
  const showMoon = time === "dusk";

  return (
    <div className="scene" aria-hidden style={{ height: h }}>
      <svg width="100%" height={h} viewBox={`0 0 ${W} ${h}`} preserveAspectRatio="xMidYMax slice">
        <defs>
          <linearGradient id={id("plate")} x1="0" y1="0" x2="0" y2={h} gradientUnits="userSpaceOnUse">
            <stop offset="0" style={{ stopColor: "var(--surface-default)" }} />
            <stop offset="0.55" style={{ stopColor: "var(--surface-default)" }} />
            <stop offset="1" style={{ stopColor: GROUND[mood] }} />
          </linearGradient>
          <linearGradient id={id("fade")} x1="0" y1="0" x2="0" y2={h} gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#fff" />
            <stop offset="0.62" stopColor="#fff" />
            <stop offset="1" stopColor="#000" />
          </linearGradient>
          <mask id={id("mask")} maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={h}>
            <rect width={W} height={h} fill={`url(#${id("fade")})`} />
          </mask>
          {art.hills.map((hl, i) => (
            <clipPath id={id(`hill${i}`)} key={i}>
              <path d={hl.fill} />
            </clipPath>
          ))}
          {art.clouds.map((c, i) => (
            <clipPath id={id(`cloud${i}`)} key={i}>
              {c.circles.map(([x, y, r], k) => (
                <circle key={k} cx={x} cy={y} r={r} />
              ))}
            </clipPath>
          ))}
        </defs>

        <rect width={W} height={h} fill={plate} />

        <g mask={`url(#${id("mask")})`} stroke={ink} fill="none" strokeLinecap="round">
          {/* sky hatch */}
          <g opacity={0.22} strokeWidth={0.6}>
            {art.sky.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </g>

          {/* stars */}
          {art.stars.map(([x, y, s], i) => (
            <path
              key={i}
              className="scene-twinkle"
              style={{ animationDelay: `${(i % 5) * 0.8}s` }}
              d={`M${x - s} ${y}H${x + s}M${x} ${y - s}V${y + s}`}
              strokeWidth={0.8}
              opacity={0.7}
            />
          ))}

          {/* sun: rays, then a plate-colored disk that cuts the sky lines, then rings */}
          {showSun && (
            <>
              <g className="scene-rays" opacity={mood === "good" ? 0.55 : 0.45} strokeWidth={0.7}>
                {art.rays.map((d, i) => (
                  <path key={i} d={d} />
                ))}
              </g>
              <circle cx={art.sun.x} cy={art.sun.y} r={art.sun.r + 3} fill={plate} stroke="none" />
              <circle cx={art.sun.x} cy={art.sun.y} r={art.sun.r} strokeWidth={1.1} opacity={0.8} />
              {art.rings.map((r, i) => (
                <circle key={i} cx={art.sun.x} cy={art.sun.y} r={r} strokeWidth={0.6} opacity={0.35} />
              ))}
            </>
          )}

          {/* moon */}
          {showMoon && (
            <g>
              <circle cx={art.sun.x} cy={art.sun.y} r={art.sun.r + 3} fill={plate} stroke="none" />
              <circle cx={art.sun.x} cy={art.sun.y} r={art.sun.r} strokeWidth={1.1} opacity={0.85} />
              <circle cx={art.sun.x + art.sun.r * 0.42} cy={art.sun.y - art.sun.r * 0.22} r={art.sun.r * 0.88} fill={plate} strokeWidth={0.6} opacity={1} strokeOpacity={0.35} />
            </g>
          )}

          {/* birds */}
          <g strokeWidth={1} opacity={0.6}>
            {art.birds.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </g>

          {/* rain sits behind the clouds and hills */}
          {art.rain.length > 0 && (
            <g className="scene-rain" opacity={0.45} strokeWidth={0.8}>
              {art.rain.map((d, i) => (
                <path key={i} d={d} />
              ))}
            </g>
          )}

          {/* clouds: outline of the union (fat stroke under a plate fill), then hatch on the underside */}
          {art.clouds.map((c, i) => (
            <g key={i} className={i % 2 ? "scene-drift-b" : "scene-drift-a"}>
              {c.circles.map(([x, y, r], k) => (
                <circle key={`o${k}`} cx={x} cy={y} r={r} strokeWidth={2.2} opacity={0.75} />
              ))}
              {c.circles.map(([x, y, r], k) => (
                <circle key={`f${k}`} cx={x} cy={y} r={r} fill={plate} stroke="none" />
              ))}
              <g clipPath={`url(#${id(`cloud${i}`)})`} strokeWidth={0.7} opacity={mood === "vent" ? 0.55 : 0.4}>
                {c.hatch.map((d, k) => (
                  <path key={k} d={d} />
                ))}
              </g>
            </g>
          ))}

          {/* hills, far to near; each one hides what's behind it */}
          {art.hills.map((hl, i) => (
            <g key={i}>
              <path d={hl.fill} fill={plate} stroke="none" />
              <g clipPath={`url(#${id(`hill${i}`)})`} opacity={hl.opacity} strokeWidth={0.75}>
                {hl.lines.map((d, k) => (
                  <path key={k} d={d} />
                ))}
              </g>
              <path d={hl.ridge} strokeWidth={1.1} opacity={Math.min(1, hl.opacity + 0.15)} />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
