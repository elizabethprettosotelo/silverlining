"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { createContext, useContext, type ReactNode, type CSSProperties } from "react";

/* ------------------------------------------------------------------ */
/* Motion tokens (mirrors the Figma "Motion" section)                 */
/* ------------------------------------------------------------------ */
export const ease = [0.22, 1, 0.36, 1] as const;
export const spring = { type: "spring", stiffness: 320, damping: 32 } as const;

export function useMotionSafe() {
  const reduce = useReducedMotion();
  return !reduce;
}

/* Navigation direction: 1 = forward (slides in from the right), -1 = back. */
export const NavDir = createContext(1);

/* Side-to-side slide + fade. `d` is the direction, passed as `custom`. */
export function slide(dist: number, names: readonly [string, string, string] = ["enter", "center", "exit"]): Variants {
  const [enter, center, exit] = names;
  return {
    [enter]: (d: number) => ({ opacity: 0, x: dist * d }),
    [center]: { opacity: 1, x: 0 },
    [exit]: (d: number) => ({ opacity: 0, x: -dist * d }),
  };
}
const screenSlide = slide(36);
const screenFade: Variants = { enter: { opacity: 0 }, center: { opacity: 1 }, exit: { opacity: 0 } };

/* A full-phone screen that slides and fades in, in the direction of travel. */
export function Screen({
  children,
  ground = "g-default",
  className = "",
  style,
}: {
  children: ReactNode;
  ground?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const ok = useMotionSafe();
  const dir = useContext(NavDir);
  return (
    <motion.div
      className={`screen ${ground} ${className}`}
      style={style}
      custom={dir}
      variants={ok ? screenSlide : screenFade}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: ok ? 0.34 : 0.01, ease }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Icons (stroke icons, currentColor)                                 */
/* ------------------------------------------------------------------ */
type IconProps = { size?: number; className?: string };
const svg = (size: number) => ({
  width: size,
  height: size,
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
});

export const Back = ({ size = 22 }: IconProps) => (
  <svg viewBox="0 0 24 24" {...svg(size)}><path d="M15 5l-7 7 7 7" /></svg>
);
export const Close = ({ size = 22 }: IconProps) => (
  <svg viewBox="0 0 24 24" {...svg(size)}><path d="M6 6l12 12M18 6L6 18" /></svg>
);
export const Chevron = ({ size = 18 }: IconProps) => (
  <svg viewBox="0 0 24 24" {...svg(size)}><path d="M9 5l7 7-7 7" /></svg>
);
export const Lock = ({ size = 18 }: IconProps) => (
  <svg viewBox="0 0 24 24" {...svg(size)}><rect x="6" y="11" width="12" height="9" rx="2" /><path d="M9 11V8a3 3 0 016 0v3" /></svg>
);
export const Moon = ({ size = 24 }: IconProps) => (
  <svg viewBox="0 0 24 24" {...svg(size)}><path d="M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z" /></svg>
);
export const Rose = ({ size = 18, filled = false }: IconProps & { filled?: boolean }) => (
  <svg viewBox="0 0 24 24" {...svg(size)}>
    <path d="M12 3.5c3.4 0 5.6 2.3 5.6 5S15 13.5 12 13.5 6.4 11.2 6.4 8.5 8.6 3.5 12 3.5z" fill={filled ? "currentColor" : "none"} />
    <path d="M12 13.5v7M12 17c-1.9-.3-3.2-1.2-3.9-2.7" />
  </svg>
);
export const Sun = ({ size = 22 }: IconProps) => (
  <svg viewBox="0 0 24 24" {...svg(size)}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
  </svg>
);
export const CloudSun = ({ size = 22 }: IconProps) => (
  <svg viewBox="0 0 24 24" {...svg(size)}>
    <path d="M8 4.5v1.3M3.8 6.3l.9.9M12.2 6.3l-.9.9M2.5 10.5h1.3" />
    <path d="M5.4 12.4A3.5 3.5 0 0111 8.6" />
    <path d="M7.5 19.5h9.8a3.7 3.7 0 00.4-7.4 5 5 0 00-9.5 1.1 3.2 3.2 0 00-.7 6.3z" />
  </svg>
);
export const Rain = ({ size = 22 }: IconProps) => (
  <svg viewBox="0 0 24 24" {...svg(size)}>
    <path d="M7 15.5h10a4 4 0 00.4-8 5.5 5.5 0 00-10.6 1.3A3.4 3.4 0 007 15.5z" />
    <path d="M9 18.5l-.8 2M13 18.5l-.8 2M17 18.5l-.8 2" />
  </svg>
);
export const Hand = ({ size = 22 }: IconProps) => (
  <svg viewBox="0 0 24 24" {...svg(size)}>
    <path d="M7 12V6.5a1.5 1.5 0 013 0V11M10 10.5V5a1.5 1.5 0 013 0v5.5M13 10.5V6a1.5 1.5 0 013 0v6M16 9.5a1.5 1.5 0 013 0V14a7 7 0 01-7 7h-.5A6.5 6.5 0 015 14.5L4 12a1.5 1.5 0 012.6-1.4L7 12" />
  </svg>
);
export const EyeOff = ({ size = 18 }: IconProps) => (
  <svg viewBox="0 0 24 24" {...svg(size)}>
    <path d="M3 12s3.3-6 9-6 9 6 9 6-3.3 6-9 6-9-6-9-6z" />
    <circle cx="12" cy="12" r="2.5" />
    <path d="M4 20L20 4" />
  </svg>
);
export const Pause = ({ size = 22 }: IconProps) => (
  <svg viewBox="0 0 24 24" {...svg(size)}><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 018 0v3" /></svg>
);

/* ------------------------------------------------------------------ */
/* Bits                                                                */
/* ------------------------------------------------------------------ */
export function Avatar({ initials, size = 32 }: { initials: string; size?: number }) {
  return (
    <span className="avatar" style={{ width: size, height: size, fontSize: Math.round(size * 0.34) }} aria-hidden>
      {initials}
    </span>
  );
}

export function Author({
  name,
  initials,
  sub,
  size = 32,
  right,
}: {
  name: string;
  initials: string;
  sub?: string;
  size?: number;
  right?: ReactNode;
}) {
  return (
    <div className="row" style={{ gap: 10 }}>
      <Avatar initials={initials} size={size} />
      <div className="stack grow">
        <span className="t-byline">{name}</span>
        {sub && <span className="t-caption">{sub}</span>}
      </div>
      {right}
    </div>
  );
}

export function TopBar({
  onBack,
  icon = "back",
  title,
  right,
}: {
  onBack?: () => void;
  icon?: "back" | "close";
  title?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="topbar">
      <div className="row" style={{ gap: 4, minWidth: 0 }}>
        {onBack && (
          <button className="iconbtn" onClick={onBack} aria-label={icon === "back" ? "Back" : "Close"}>
            {icon === "back" ? <Back /> : <Close />}
          </button>
        )}
        {title}
      </div>
      {right}
    </div>
  );
}

/* Bottom sheet with scrim. Render inside <AnimatePresence>. */
export function Sheet({ children, onClose, label }: { children: ReactNode; onClose?: () => void; label: string }) {
  const ok = useMotionSafe();
  return (
    <>
      <motion.div
        className="scrim"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.45 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
      />
      <motion.div
        className="sheet"
        role="dialog"
        aria-label={label}
        initial={ok ? { y: "100%" } : { opacity: 0 }}
        animate={ok ? { y: 0 } : { opacity: 1 }}
        exit={ok ? { y: "100%" } : { opacity: 0 }}
        transition={ok ? spring : { duration: 0.01 }}
      >
        <div className="sheet-handle" />
        {children}
      </motion.div>
    </>
  );
}

/* A finished story: title, the raw part, and the turn in accent. */
export function StoryText({
  a,
  hinge,
  b,
  size = "t-story",
  animateTurn = false,
}: {
  a: string;
  hinge?: string;
  b?: string;
  size?: string;
  animateTurn?: boolean;
}) {
  const ok = useMotionSafe();
  const delay = animateTurn && ok ? 0.9 : 0;
  return (
    <p className={size} style={{ margin: 0 }}>
      {a}
      {hinge && (
        <>
          {" "}
          <motion.span
            className="hinge"
            initial={animateTurn && ok ? { opacity: 0, filter: "blur(4px)" } : false}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ delay, duration: 0.6, ease }}
          >
            {hinge}
          </motion.span>{" "}
          <motion.span
            className="turned"
            initial={animateTurn && ok ? { opacity: 0 } : false}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.45, duration: 0.7, ease }}
          >
            {b}
          </motion.span>
        </>
      )}
    </p>
  );
}
