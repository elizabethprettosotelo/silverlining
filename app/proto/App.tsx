"use client";

import { AnimatePresence } from "motion/react";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import Account, { type KeptStory } from "./Account";
import Compose, { type Post } from "./Compose";
import Onboarding, { type UserProfile } from "./Onboarding";
import ReaderFlow from "./ReaderFlow";
import Reveal from "./Reveal";
import { GOOD, SAMPLE, TURNED, VENTS, type Comment } from "./data";
import { LetGo, LockedHome, Midnight, Reading, TABS, ThatsToday, type Tab } from "./Screens";
import { NavDir } from "./ui";

type View = "onboarding" | "account" | "locked" | "compose" | "letgo" | "reading" | "reader" | "today" | "midnight" | "reveal";

const DAYS = ["Wed, Oct 21", "Thu, Oct 22", "Fri, Oct 23"];

const FALLBACK_POST: Post = { title: SAMPLE.title, a: SAMPLE.a, hinge: "And still…", b: SAMPLE.b, kind: "turned" };

export default function App() {
  const [view, setView] = useState<View>("onboarding");
  const [dir, setDir] = useState(1);
  const [tab, setTab] = useState<Tab>("turned");
  const [tabDir, setTabDir] = useState(1);
  const [day, setDay] = useState(0);
  const [post, setPost] = useState<Post | null>(null);
  const [readIdx, setReadIdx] = useState(0);
  const [readerCategory, setReaderCategory] = useState<Tab>("turned");
  const [read, setRead] = useState<string[]>([]);
  const [roseGiven, setRoseGiven] = useState(false);
  const [theme, setTheme] = useState<"day" | "night">("day");
  const [demoSignal, setDemoSignal] = useState(0);
  const [composeKey, setComposeKey] = useState(0);
  const [onboardingKey, setOnboardingKey] = useState(0);
  const [accountReturn, setAccountReturn] = useState<View>("locked");
  const [profile, setProfile] = useState<UserProfile>({ name: "quietharbor", initials: "JA", contact: "", notifications: false });
  const [keptStories, setKeptStories] = useState<KeptStory[]>([]);
  const [hiddenStoryIds, setHiddenStoryIds] = useState<string[]>([]);
  const [commentsByStory, setCommentsByStory] = useState<Record<string, Comment[]>>({});
  const [rainyReady, setRainyReady] = useState(false);
  const [unlockedVentCount, setUnlockedVentCount] = useState(1);

  // Night mode follows the clock by default, like the product would.
  useEffect(() => {
    const h = new Date().getHours();
    if (h >= 21 || h < 6) setTheme("night");
  }, []);

  const p = post ?? FALLBACK_POST;
  const dateLabel = DAYS[Math.min(day, DAYS.length - 1)];

  // d = 1 slides the next screen in from the right, -1 from the left.
  const go = useCallback((v: View, d = 1) => {
    setDir(d);
    setView(v);
  }, []);
  const openAccount = () => {
    setAccountReturn(view === "account" ? "locked" : view);
    go("account");
  };

  const changeTab = (t: Tab) => {
    setTabDir(TABS.indexOf(t) >= TABS.indexOf(tab) ? 1 : -1);
    setTab(t);
  };
  const openReading = (t: Tab, d = 1) => {
    changeTab(t);
    go("reading", d);
  };

  const openStory = (i: number, category: Tab = "turned") => {
    setReadIdx(i);
    setReaderCategory(category);
    if (category === "turned") setRead((r) => (r.includes(TURNED[i].id) ? r : [...r, TURNED[i].id]));
    go("reader");
  };

  const clearDay = () => {
    setPost(null);
    setReadIdx(0);
    setRead([]);
    setRoseGiven(false);
    setHiddenStoryIds([]);
    setCommentsByStory({});
    setRainyReady(false);
    setUnlockedVentCount(1);
    setTab("turned");
    setComposeKey((k) => k + 1);
    go("locked");
  };
  const newDay = () => {
    setDay((d) => d + 1);
    clearDay();
  };
  const reset = () => {
    setDay(0);
    setKeptStories([]);
    setHiddenStoryIds([]);
    setCommentsByStory({});
    setRainyReady(false);
    setUnlockedVentCount(1);
    setProfile({ name: "quietharbor", initials: "JA", contact: "", notifications: false });
    setOnboardingKey((key) => key + 1);
    clearDay();
    go("onboarding");
  };

  const deleteLocalAccount = () => {
    setDay(0);
    setPost(null);
    setReadIdx(0);
    setRead([]);
    setRoseGiven(false);
    setKeptStories([]);
    setCommentsByStory({});
    setHiddenStoryIds([]);
    setRainyReady(false);
    setUnlockedVentCount(1);
    setProfile({ name: "quietharbor", initials: "JA", contact: "", notifications: false });
    setComposeKey((key) => key + 1);
    setOnboardingKey((key) => key + 1);
    go("onboarding");
  };

  const jump = (v: View, t?: Tab) => {
    if (v === "account") setAccountReturn(view);
    if (v === "reader") {
      setReadIdx(0);
      setReaderCategory(t ?? "turned");
    }
    if (!post && v !== "locked" && v !== "compose" && v !== "account" && v !== "onboarding") setPost(FALLBACK_POST);
    if (v === "compose") setComposeKey((k) => k + 1);
    if (t) changeTab(t);
    go(v);
  };

  let screen: ReactNode = null;
  switch (view) {
    case "onboarding":
      screen = <Onboarding key={`onboarding-${onboardingKey}`} onComplete={(nextProfile) => { setProfile(nextProfile); go("locked"); }} />;
      break;
    case "account":
      screen = <Account profile={profile} keptStories={keptStories} onClose={() => go(accountReturn, -1)} onProfileChange={setProfile} onDelete={deleteLocalAccount} />;
      break;
    case "locked":
      screen = <LockedHome key="locked" dateLabel={dateLabel} isNewDay={day > 0} onWrite={() => go("compose")} onMenu={openAccount} />;
      break;
    case "compose":
      screen = (
        <Compose
          key={`compose-${composeKey}`}
          dateLabel={dateLabel}
          profile={profile}
          demoSignal={demoSignal}
          onBack={() => go("locked", -1)}
          onPosted={(np) => {
            setPost(np);
            go("letgo");
          }}
        />
      );
      break;
    case "letgo":
      screen = <LetGo key="letgo" post={p} onDone={() => openReading("turned")} />;
      break;
    case "reading":
      screen = (
        <Reading
          key="reading"
          tab={tab}
          dir={tabDir}
          onTab={changeTab}
          post={p}
          roseGiven={roseGiven}
          onGiveRose={() => setRoseGiven(true)}
          profile={profile}
          read={read}
          onOpenStory={openStory}
          onOpenGoodStory={(index) => openStory(index, "good")}
          onMenu={openAccount}
          hiddenStoryIds={hiddenStoryIds}
          onReportStory={(id) => setHiddenStoryIds((ids) => ids.includes(id) ? ids : [...ids, id])}
          commentsByStory={commentsByStory}
          onAddComment={(id, comment) => setCommentsByStory((items) => ({ ...items, [id]: [...(items[id] ?? []), comment] }))}
          rainyReady={rainyReady}
          onRainyReady={() => setRainyReady(true)}
          unlockedVentCount={unlockedVentCount}
          onUnlockNext={() => setUnlockedVentCount((count) => Math.min(VENTS.length, count + 1))}
        />
      );
      break;
    case "reader": {
      const readerStories = readerCategory === "good" ? GOOD : TURNED;
      const story = readerStories[readIdx];
      const ownComments = commentsByStory[story.id] ?? [];
      screen = (
        <ReaderFlow
          key={`reader-${readIdx}`}
          story={story}
          index={readIdx}
          total={readerCategory === "good" ? GOOD.length : TURNED.length}
          profile={profile}
          category={readerCategory}
          roseGiven={roseGiven}
          comments={[...ownComments, ...(ownComments.length > 0 ? story.comments : [])]}
          commentsLocked={ownComments.length === 0 && story.comments.length > 0}
          onGiveRose={() => setRoseGiven(true)}
          onAddComment={(id, comment) => setCommentsByStory((items) => ({ ...items, [id]: [...(items[id] ?? []), comment] }))}
          onBack={() => openReading(readerCategory, -1)}
          onEnd={() => go("today")}
          onReport={(id) => setHiddenStoryIds((ids) => ids.includes(id) ? ids : [...ids, id])}
          onNext={() => {
            const n = readIdx + 1;
            const total = readerCategory === "good" ? GOOD.length : TURNED.length;
            if (n >= total) {
              if (readerCategory === "turned") go("today");
              else openReading(readerCategory, -1);
            } else openStory(n, readerCategory);
          }}
        />
      );
      break;
    }
    case "today":
      screen = <ThatsToday key="today" post={p} onDone={() => go("midnight")} onGood={() => openReading("good")} />;
      break;
    case "midnight":
      screen = <Midnight key="midnight" onDone={() => go("reveal")} />;
      break;
    case "reveal":
      screen = <Reveal key="reveal" post={p} dateLabel={DAYS[Math.min(day, DAYS.length - 1)]} onFinish={(kept) => { if (kept) setKeptStories((items) => [{ ...p, dateLabel }, ...items]); newDay(); }} />;
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
        <NavDir.Provider value={dir}>
          <AnimatePresence mode="wait" custom={dir}>
            {screen}
          </AnimatePresence>
        </NavDir.Provider>
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
          <button aria-pressed={view === "onboarding"} onClick={() => jump("onboarding")}>Set up account</button>
          <button aria-pressed={view === "locked"} onClick={() => jump("locked")}>Locked home</button>
          <button aria-pressed={view === "compose"} onClick={() => jump("compose")}>Write</button>
          <button aria-pressed={view === "letgo"} onClick={() => jump("letgo")}>Send it off</button>
          <button aria-pressed={view === "reading" && tab === "turned"} onClick={() => jump("reading", "turned")}>Clearing up</button>
          <button aria-pressed={view === "reader"} onClick={() => jump("reader")}>Clearing up story</button>
          <button aria-pressed={view === "reading" && tab === "vent"} onClick={() => jump("reading", "vent")}>Rainy days</button>
          <button aria-pressed={view === "reading" && tab === "good"} onClick={() => jump("reading", "good")}>Little wins</button>
          <button aria-pressed={view === "today"} onClick={() => jump("today")}>That&apos;s today</button>
          <button aria-pressed={view === "reveal"} onClick={() => jump("reveal")}>Morning replies</button>
          <button aria-pressed={view === "account"} onClick={() => jump("account")}>Account menu</button>
        </div>

        <button onClick={reset}>Reset everything</button>
      </aside>
    </main>
  );
}
