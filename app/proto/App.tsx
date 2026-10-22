"use client";

import { AnimatePresence } from "motion/react";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import Compose, { type Post } from "./Compose";
import Reveal from "./Reveal";
import { SAMPLE, TURNED } from "./data";
import { GoodDays, Home, LetGo, LockedHome, Midnight, Reader, ThatsToday, VentDoor, type Tab } from "./Screens";

type View =
  | "locked"
  | "compose"
  | "letgo"
  | "home"
  | "reader"
  | "good"
  | "vent"
  | "today"
  | "midnight"
  | "reveal";

const DAYS = ["Wed, Oct 21", "Thu, Oct 22", "Fri, Oct 23"];

const FALLBACK_POST: Post = { title: SAMPLE.title, a: SAMPLE.a, hinge: "And still…", b: SAMPLE.b, kind: "turned" };

export default function App() {
  const [view, setView] = useState<View>("locked");
  const [day, setDay] = useState(0);
  const [post, setPost] = useState<Post | null>(null);
  const [readIdx, setReadIdx] = useState(0);
  const [roseGiven, setRoseGiven] = useState(false);
  const [theme, setTheme] = useState<"day" | "night">("day");
  const [demoSignal, setDemoSignal] = useState(0);
  const [composeKey, setComposeKey] = useState(0);

  // Night mode follows the clock by default, like the product would.
  useEffect(() => {
    const h = new Date().getHours();
    if (h >= 21 || h < 6) setTheme("night");
  }, []);

  const p = post ?? FALLBACK_POST;
  const dateLabel = DAYS[Math.min(day, DAYS.length - 1)];

  const go = useCallback((v: View) => setView(v), []);
  const onTab = (t: Tab) => go(t === "turned" ? "home" : t);
  const openFromHome = (t: Tab) => {
    if (t === "turned") {
      if (readIdx >= TURNED.length) go("today");
      else go("reader");
    } else go(t);
  };

  const newDay = () => {
    setDay((d) => d + 1);
    setPost(null);
    setReadIdx(0);
    setRoseGiven(false);
    setComposeKey((k) => k + 1);
    go("locked");
  };

  const reset = () => {
    setDay(0);
    setPost(null);
    setReadIdx(0);
    setRoseGiven(false);
    setComposeKey((k) => k + 1);
    go("locked");
  };

  const jump = (v: View) => {
    if (!post && v !== "locked" && v !== "compose") setPost(FALLBACK_POST);
    if (v === "compose") setComposeKey((k) => k + 1);
    go(v);
  };

  let screen: ReactNode = null;
  switch (view) {
    case "locked":
      screen = <LockedHome key="locked" dateLabel={dateLabel} onWrite={() => go("compose")} />;
      break;
    case "compose":
      screen = (
        <Compose
          key={`compose-${composeKey}`}
          dateLabel={dateLabel}
          demoSignal={demoSignal}
          onBack={() => go("locked")}
          onPosted={(np) => {
            setPost(np);
            go("letgo");
          }}
        />
      );
      break;
    case "letgo":
      screen = <LetGo key="letgo" post={p} onDone={() => go("home")} />;
      break;
    case "home":
      screen = (
        <Home
          key="home"
          post={p}
          roseGiven={roseGiven}
          readCount={readIdx}
          onOpen={openFromHome}
          onTab={onTab}
          onMenuEnd={() => go("today")}
        />
      );
      break;
    case "reader":
      screen = (
        <Reader
          key={`reader-${readIdx}`}
          index={Math.min(readIdx, TURNED.length - 1)}
          roseGiven={roseGiven}
          onGiveRose={() => setRoseGiven(true)}
          onBack={() => go("home")}
          onEnd={() => go("today")}
          onNext={() => {
            const n = readIdx + 1;
            setReadIdx(n);
            if (n >= TURNED.length) go("today");
          }}
        />
      );
      break;
    case "good":
      screen = <GoodDays key="good" onBack={() => go("home")} onTab={onTab} />;
      break;
    case "vent":
      screen = <VentDoor key="vent" onBack={() => go("home")} onTab={onTab} />;
      break;
    case "today":
      screen = <ThatsToday key="today" post={p} onDone={() => go("midnight")} onGood={() => go("good")} />;
      break;
    case "midnight":
      screen = <Midnight key="midnight" onDone={() => go("reveal")} />;
      break;
    case "reveal":
      screen = <Reveal key="reveal" post={p} dateLabel={DAYS[Math.max(0, day)]} onFinish={newDay} />;
      break;
  }

  return (
    <main className="stage">
      <div className="phone" data-theme={theme}>
        <div className="statusbar" aria-hidden>
          <span>9:41</span>
          <span className="sb-right">
            <svg width="18" height="11" viewBox="0 0 18 11" fill="currentColor"><rect x="0" y="7" width="3" height="4" rx="1" /><rect x="5" y="5" width="3" height="6" rx="1" /><rect x="10" y="2.5" width="3" height="8.5" rx="1" /><rect x="15" y="0" width="3" height="11" rx="1" /></svg>
            <svg width="26" height="12" viewBox="0 0 26 12" fill="none"><rect x="0.5" y="0.5" width="22" height="11" rx="3.5" stroke="currentColor" opacity="0.4" /><rect x="2" y="2" width="19" height="8" rx="2" fill="currentColor" /><rect x="24" y="4" width="1.5" height="4" rx="0.75" fill="currentColor" opacity="0.4" /></svg>
          </span>
        </div>
        <AnimatePresence mode="wait">{screen}</AnimatePresence>
        <div className="home-indicator" aria-hidden />
      </div>

      <aside className="devpanel" aria-label="Prototype controls">
        <h2>silver lining</h2>
        <span className="hint">Prototype controls. Hidden on phones, so they never show up in a mobile recording.</span>

        <div className="group">
          <span className="label">Theme</span>
          <div className="row" style={{ gap: 6 }}>
            <button aria-pressed={theme === "day"} onClick={() => setTheme("day")}>Day</button>
            <button aria-pressed={theme === "night"} onClick={() => setTheme("night")}>Night</button>
          </div>
        </div>

        <div className="group">
          <span className="label">Recording</span>
          <button onClick={() => setDemoSignal((s) => s + 1)} disabled={view !== "compose"}>
            Type the sample story
          </button>
          <span className="hint">On the writing screen: press once to type the title and story, then again after Done to type the turn.</span>
        </div>

        <div className="group">
          <span className="label">Jump to</span>
          <button aria-pressed={view === "locked"} onClick={() => jump("locked")}>1 · Locked home</button>
          <button aria-pressed={view === "compose"} onClick={() => jump("compose")}>2 · Write</button>
          <button aria-pressed={view === "letgo"} onClick={() => jump("letgo")}>3 · Let it go</button>
          <button aria-pressed={view === "home"} onClick={() => jump("home")}>4 · Today&apos;s reading</button>
          <button aria-pressed={view === "reader"} onClick={() => jump("reader")}>5 · Story that turned</button>
          <button aria-pressed={view === "vent"} onClick={() => jump("vent")}>6 · Vent door</button>
          <button aria-pressed={view === "good"} onClick={() => jump("good")}>7 · Good days</button>
          <button aria-pressed={view === "today"} onClick={() => jump("today")}>8 · That&apos;s today</button>
          <button aria-pressed={view === "reveal"} onClick={() => jump("reveal")}>9 · Next-day reveal</button>
        </div>

        <button onClick={reset}>Reset everything</button>
      </aside>
    </main>
  );
}
