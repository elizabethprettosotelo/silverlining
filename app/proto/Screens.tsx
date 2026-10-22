"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import type { Post } from "./Compose";
import type { UserProfile } from "./Onboarding";
import { GOOD, ME, TURNED, VENTS, isLowEffort, type Comment } from "./data";
import {
  Author,
  Avatar,
  CloudSun,
  Lock,
  Moon,
  Rain,
  Rose,
  Screen,
  Sheet,
  Sun,
  TopBar,
  ease,
  slide,
  spring,
  useMotionSafe,
} from "./ui";
import Scene from "./Scene";
import RoseTakeover from "./RoseTakeover";
import StoryDetail from "./StoryDetail";

/* ------------------------------------------------------------------ */
/* Mood tab bar: good days · turned days · vents                       */
/* The pill glides between moods; the bar never leaves the page.       */
/* ------------------------------------------------------------------ */
export type Tab = "good" | "turned" | "vent";
export const TABS: Tab[] = ["good", "turned", "vent"];
const TAB_STEP = 66; // button width + gap

export function TabBar({ current, onChange }: { current: Tab; onChange: (t: Tab) => void }) {
  const ok = useMotionSafe();
  const items: { t: Tab; label: string; icon: ReactNode }[] = [
    { t: "good", label: "Little wins", icon: <Sun /> },
    { t: "turned", label: "Clearing up", icon: <CloudSun /> },
    { t: "vent", label: "Rainy days", icon: <Rain /> },
  ];
  return (
    <motion.div
      className="tabbar-wrap"
      initial={ok ? { opacity: 0, y: 28 } : { opacity: 0 }}
      animate={{ opacity: 1, y: 0 }}
      exit={ok ? { opacity: 0, y: 28 } : { opacity: 0 }}
      transition={{ duration: ok ? 0.32 : 0.01, ease }}
    >
      <nav className="tabbar" aria-label="Today's reading">
        <motion.span
          className={`tab-pill ${current}`}
          aria-hidden
          initial={false}
          animate={{ x: TABS.indexOf(current) * TAB_STEP }}
          transition={ok ? { type: "spring", stiffness: 420, damping: 34 } : { duration: 0 }}
        />
        {items.map(({ t, label, icon }) => (
          <button key={t} aria-current={current === t ? "page" : undefined} aria-label={label} onClick={() => onChange(t)}>
            <motion.span style={{ display: "grid" }} animate={{ scale: ok && current === t ? 1.1 : 1 }} transition={spring}>
              {icon}
            </motion.span>
          </button>
        ))}
      </nav>
    </motion.div>
  );
}


/* ------------------------------------------------------------------ */
/* HM-01 · Locked home                                                 */
/* ------------------------------------------------------------------ */
export function LockedHome({ onWrite, onMenu, dateLabel, isNewDay }: { onWrite: () => void; onMenu: () => void; dateLabel: string; isNewDay: boolean }) {
  return (
    <Screen ground="g-turned">
      <Scene mood="turned" height={240} />
      <div className="row" style={{ height: 150, padding: "18px 24px 0", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span className="row t-eyebrow" style={{ gap: 6 }}>{isNewDay && <Sun size={15} aria-hidden />} {dateLabel}</span>
        <button className="link" style={{ padding: "0 0 8px" }} onClick={onMenu}>Menu</button>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div className="screen-body" style={{ paddingTop: 28 }}>
          <h1 className="t-display" style={{ margin: "0 0 18px" }}>Today</h1>
          <div aria-hidden="true" style={{ filter: "blur(3px)", opacity: 0.68, pointerEvents: "none", userSelect: "none" }}>
            <div className="stack" style={{ gap: 12 }}>
              {TURNED.map((story) => (
                <article key={story.id} className="card card-soft">
                  <span className="t-title-sm">{story.title}</span>
                  <p className="t-story clamp-3 muted" style={{ margin: "8px 0 0", fontSize: 16, lineHeight: "24px" }}>{story.a}</p>
                  <p className="t-story" style={{ margin: "8px 0 0", fontSize: 16, lineHeight: "24px" }}><span className="hinge">{story.hinge}</span> <span className="turned">{story.b}</span></p>
                  <div className="row" style={{ justifyContent: "space-between", marginTop: 12 }}><span className="t-byline">{story.name}</span><span className="t-eyebrow">Clearing up</span></div>
                </article>
              ))}
            </div>
          </div>
          <div className="card card-sunken locked-message" style={{ position: "relative", marginTop: -34, textAlign: "center" }}>
            <p className="t-body" style={{ margin: 0 }}>Everyone else already wrote.</p>
            <p className="t-body muted" style={{ margin: "6px 0 0" }}>Your turn.</p>
            <Lock size={18} />
          </div>
        </div>
        <div className="screen-foot">
          <button className="btn btn-primary btn-full" onClick={onWrite}>Write today&apos;s story</button>
        </div>
      </div>
    </Screen>
  );
}

/* ------------------------------------------------------------------ */
/* PO-09 · Let it go                                                   */
/* The story is tucked into an envelope, sealed, and sent off.         */
/* ------------------------------------------------------------------ */
export function LetGo({ post, onDone }: { post: Post; onDone: () => void }) {
  const ok = useMotionSafe();
  // 0 story shown · 1 tucked in · 2 sealed · 3 flying off
  const [phase, setPhase] = useState(ok ? 0 : 2);
  useEffect(() => {
    if (!ok) {
      const t = setTimeout(onDone, 1600);
      return () => clearTimeout(t);
    }
    const ts = [
      setTimeout(() => setPhase(1), 450),
      setTimeout(() => setPhase(2), 850),
      setTimeout(() => setPhase(3), 1200),
      setTimeout(onDone, 2450),
    ];
    return () => ts.forEach(clearTimeout);
  }, [onDone, ok]);

  const flying = ok && phase >= 3;

  return (
    <Screen ground="g-default">
      <div style={{ flex: 1, position: "relative", display: "grid", placeItems: "center", paddingTop: 90 }}>
        <div style={{ position: "relative" }}>
          {/* a little puff where it takes off */}
          {flying &&
            Array.from({ length: 7 }).map((_, k) => {
              const ang = Math.PI * (0.5 + k * 0.09);
              return (
                <motion.span
                  key={k}
                  className="env-spark"
                  initial={{ opacity: 0, x: 0, y: 0, scale: 0.4 }}
                  animate={{ opacity: [0, 0.9, 0], x: Math.cos(ang) * 80, y: Math.sin(ang) * 46 + 20, scale: 1 }}
                  transition={{ duration: 0.9, delay: 0.15, ease }}
                />
              );
            })}

          <motion.div
            className="envelope"
            initial={ok ? { opacity: 0, y: 40, scale: 0.94 } : false}
            animate={
              flying
                ? { opacity: [1, 1, 0], x: [0, -8, 260], y: [0, 16, -480], rotate: [0, -5, 16], scale: [1, 1.03, 0.5] }
                : { opacity: 1, y: 0, scale: 1 }
            }
            transition={
              flying
                ? { duration: 1.25, times: [0, 0.22, 1], ease: ["easeOut", [0.6, 0, 0.9, 0.4]] }
                : { duration: 0.6, delay: ok ? 0.35 : 0, ease }
            }
          >
            {/* back of the envelope, with the flap still open behind the story */}
            <svg className="env-layer" viewBox="0 0 240 150" aria-hidden>
              <rect x="0.5" y="0.5" width="239" height="149" rx="10" className="env-back" />
              {phase < 2 && <polygon points="0.5,0.5 239.5,0.5 120,-89" className="env-flap" strokeLinejoin="round" />}
            </svg>

            <motion.div
              className="env-letter"
              initial={ok ? { y: -176, opacity: 0 } : false}
              animate={{ y: phase >= 1 ? 16 : -176, opacity: 1 }}
              transition={{ duration: phase >= 1 ? 0.6 : 0.5, ease }}
            >
              <Author name={ME.name} initials={ME.initials} size={20} />
              <div className="t-title-sm" style={{ fontSize: 16, lineHeight: "21px", marginTop: 10 }}>{post.title}</div>
              {post.hinge ? (
                <div className="hinge" style={{ fontSize: 15, marginTop: 4 }}>{post.hinge}</div>
              ) : (
                <div className="t-caption" style={{ marginTop: 4 }}>{post.kind === "good" ? "A little win" : "Left as it was"}</div>
              )}
            </motion.div>

            {/* front pocket */}
            <svg className="env-layer" viewBox="0 0 240 150" aria-hidden>
              <path d="M0.5 0.5 L120 86 L239.5 0.5 V140 Q239.5 149.5 230 149.5 H10 Q0.5 149.5 0.5 140 Z" className="env-front" strokeLinejoin="round" />
              <path d="M3 147 L106 78 M237 147 L134 78" className="env-fold" />
            </svg>

            {/* the flap folds down and seals */}
            {phase >= 2 && (
              <motion.svg
                className="env-layer"
                viewBox="0 0 240 150"
                aria-hidden
                style={{ originX: 0.5, originY: 0 }}
                initial={ok ? { scaleY: -1 } : false}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.45, ease }}
              >
                <polygon points="0.5,0.5 239.5,0.5 120,89" className="env-flap" strokeLinejoin="round" />
                <motion.circle
                  cx="120"
                  cy="78"
                  r="9"
                  className="env-seal"
                  initial={ok ? { scale: 0 } : false}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.35, type: "spring", stiffness: 500, damping: 15 }}
                />
              </motion.svg>
            )}
          </motion.div>
        </div>
      </div>
      <motion.div
        style={{ padding: "0 32px 120px", textAlign: "center" }}
        initial={{ opacity: 0, x: ok ? 28 : 0 }}
        animate={flying || !ok ? { opacity: 1, x: 0 } : { opacity: 0, x: ok ? 28 : 0 }}
        transition={{ delay: flying ? 0.5 : 0, duration: 0.6, ease }}
      >
        <h1 className="t-display" style={{ margin: "0 0 10px" }}>Off it goes.</h1>
        <p className="t-caption" style={{ margin: 0, fontSize: 15, lineHeight: "22px" }}>
          It&apos;s out there till midnight.
        </p>
      </motion.div>
    </Screen>
  );
}


/* ------------------------------------------------------------------ */
/* HM-02 · Today's reading                                             */
/* One page, three moods. The tab bar stays put; the panes slide.      */
/* ------------------------------------------------------------------ */
const paneSlide = slide(90, ["pEnter", "pCenter", "pExit"]);
const GROUND_OF: Record<Tab, string> = { good: "g-good", turned: "g-turned", vent: "g-vent" };

/* Cards drift in from the side, one after another. */
const cardIn = (ok: boolean, i: number) => ({
  initial: ok ? { opacity: 0, x: 22 } : false,
  animate: { opacity: 1, x: 0 },
  transition: { delay: 0.14 + i * 0.07, duration: 0.45, ease },
});

export function Reading({
  tab,
  dir,
  onTab,
  post,
  roseGiven,
  onGiveRose,
  profile,
  read,
  onOpenStory,
  onOpenGoodStory,
  onMenu,
  hiddenStoryIds,
  onReportStory,
  commentsByStory,
  onAddComment,
}: {
  tab: Tab;
  dir: number;
  onTab: (t: Tab) => void;
  post: Post;
  roseGiven: boolean;
  onGiveRose: (id: string) => void;
  profile: UserProfile;
  read: string[];
  onOpenStory: (index: number) => void;
  onOpenGoodStory: (index: number) => void;
  onMenu: () => void;
  hiddenStoryIds: string[];
  onReportStory: (id: string) => void;
  commentsByStory: Record<string, Comment[]>;
  onAddComment: (id: string, comment: Comment) => void;
}) {
  const ok = useMotionSafe();
  const [immersive, setImmersive] = useState(false);
  return (
    <Screen ground={GROUND_OF[tab]}>
      <AnimatePresence initial={false} custom={dir}>
        <motion.div
          key={tab}
          className={`screen ${GROUND_OF[tab]}`}
          custom={dir}
          variants={paneSlide}
          initial="pEnter"
          animate="pCenter"
          exit="pExit"
          transition={{ duration: ok ? 0.42 : 0.01, ease }}
        >
          {tab === "good" && <GoodPane onOpen={onOpenGoodStory} hiddenStoryIds={hiddenStoryIds} />}
          {tab === "turned" && <TurnedPane post={post} roseGiven={roseGiven} read={read} onOpen={onOpenStory} hiddenStoryIds={hiddenStoryIds} />}
          {tab === "vent" && <VentPane onLeave={() => onTab("turned")} onImmersive={setImmersive} hiddenStoryIds={hiddenStoryIds} onReport={onReportStory} roseGiven={roseGiven} onGiveRose={onGiveRose} profile={profile} commentsByStory={commentsByStory} onAddComment={onAddComment} />}
        </motion.div>
      </AnimatePresence>
      <button className="link" style={{ position: "absolute", top: 54, right: 24, zIndex: 21 }} onClick={onMenu}>Menu</button>
      <AnimatePresence>{!immersive && <TabBar key="tabs" current={tab} onChange={onTab} />}</AnimatePresence>
    </Screen>
  );
}

function PaneEnd({ title, sub }: { title: string; sub: ReactNode }) {
  return (
    <div className="stack" style={{ alignItems: "center", margin: "28px 0 130px", gap: 4, textAlign: "center" }}>
      <span className="t-label" style={{ fontSize: 14 }}>{title}</span>
      <span className="t-caption">{sub}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Turned days (the default view)                                      */
/* ------------------------------------------------------------------ */
function TurnedPane({ post, roseGiven, read, onOpen, hiddenStoryIds }: { post: Post; roseGiven: boolean; read: string[]; onOpen: (i: number) => void; hiddenStoryIds: string[] }) {
  const ok = useMotionSafe();
  const stories = TURNED.map((story, index) => ({ story, index })).filter(({ story }) => !hiddenStoryIds.includes(story.id));
  return (
    <>
      <Scene mood="turned" height={210} />
      <div className="screen-body" style={{ paddingTop: 122 }}>
        <h1 className="t-display" style={{ margin: "0 0 6px" }}>Clearing up</h1>
        <p className="t-caption" style={{ margin: "0 0 18px" }}>
          <strong><em>“{post.title}”</em></strong> is out there until 11:59 PM.
        </p>
        <div className="stack" style={{ gap: 14 }}>
          {stories.map(({ story: s, index: i }) => {
            const done = read.includes(s.id);
            return (
              <motion.article
                key={s.id}
                className="card card-soft card-tap"
                role="button"
                tabIndex={0}
                onClick={() => onOpen(i)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpen(i))}
                whileTap={{ scale: 0.985 }}
                {...cardIn(ok, i)}
              >
                <div className="t-title-sm" style={{ marginBottom: 8 }}>{s.title}</div>
                <p className="t-story clamp-3 muted" style={{ margin: 0, fontSize: 17, lineHeight: "26px" }}>{s.a}</p>
                <p className="t-story" style={{ margin: "8px 0 0", fontSize: 17, lineHeight: "26px" }}>
                  <span className="hinge">{s.hinge}</span> <span className="turned">{s.b}</span>
                </p>
                <div className="row" style={{ justifyContent: "space-between", marginTop: 14 }}>
                  <div className="row" style={{ gap: 8 }}>
                    <Avatar initials={s.initials} size={22} />
                    <span className="t-byline" style={{ fontSize: 13 }}>{s.name}</span>
                  </div>
                  <span className="t-eyebrow" style={{ fontSize: 11, color: done ? "var(--text-ghost)" : "var(--mood-turned)" }}>
                    {done ? "Read" : "Clearing up"}
                  </span>
                </div>
              </motion.article>
            );
          })}
          {stories.length === 0 && <p className="t-caption">You’ve hidden all of these stories for now.</p>}
        </div>
        <PaneEnd
          title="That's everyone for today."
          sub={
            roseGiven ? (
              <span className="row" style={{ gap: 6, justifyContent: "center" }}>
                <span className="turned"><Rose filled size={14} /></span> You gave today&apos;s nod
              </span>
            ) : (
              "Everything here is gone at midnight."
            )
          }
        />
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* RD-04 · Good days                                                   */
/* ------------------------------------------------------------------ */
function GoodPane({ onOpen, hiddenStoryIds }: { onOpen: (index: number) => void; hiddenStoryIds: string[] }) {
  const ok = useMotionSafe();
  const stories = GOOD.map((story, index) => ({ story, index })).filter(({ story }) => !hiddenStoryIds.includes(story.id));
  return (
    <>
      <Scene mood="good" height={210} />
      <div className="screen-body" style={{ paddingTop: 122 }}>
        <h1 className="t-display" style={{ margin: "0 0 18px" }}>Little wins</h1>
        <div className="stack" style={{ gap: 14 }}>
          {stories.map(({ story: s, index: i }) => (
            <motion.button key={s.id} className="card card-soft card-tap" onClick={() => onOpen(i)} {...cardIn(ok, i)}>
              <div className="t-title-sm" style={{ marginBottom: 8 }}>{s.title}</div>
              <p className="t-story" style={{ margin: 0, fontSize: 17, lineHeight: "26px" }}>{s.a}</p>
              <div className="row" style={{ justifyContent: "space-between", marginTop: 14 }}>
                <div className="row" style={{ gap: 8 }}>
                  <Avatar initials={s.initials} size={22} />
                  <span className="t-byline" style={{ fontSize: 13 }}>{s.name}</span>
                </div>
                <span className="t-eyebrow" style={{ fontSize: 11, color: "var(--mood-good)" }}>A little win</span>
              </div>
            </motion.button>
          ))}
          {stories.length === 0 && <p className="t-caption">No wins yet. Give it a few hours.</p>}
        </div>
        <PaneEnd title="That's every little win so far." sub="More may come in before midnight." />
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* VT-01..04 · Vents                                                   */
/* ------------------------------------------------------------------ */
type VentStage = "care" | "vent" | "done";
const ventSlide = slide(70, ["vEnter", "vCenter", "vExit"]);

function VentPane({ onLeave, onImmersive, hiddenStoryIds, onReport, roseGiven, onGiveRose, profile, commentsByStory, onAddComment }: { onLeave: () => void; onImmersive: (on: boolean) => void; hiddenStoryIds: string[]; onReport: (id: string) => void; roseGiven: boolean; onGiveRose: (id: string) => void; profile: UserProfile; commentsByStory: Record<string, Comment[]>; onAddComment: (id: string, comment: Comment) => void }) {
  const ok = useMotionSafe();
  const [stage, setStage] = useState<VentStage>("care");
  const [vdir, setVdir] = useState(1);
  const [idx, setIdx] = useState(() => Math.max(0, VENTS.findIndex((item) => !hiddenStoryIds.includes(item.id))));
  const [nudges, setNudges] = useState(0);
  const [careRose, setCareRose] = useState(false);
  const [showCareRoseAnimation, setShowCareRoseAnimation] = useState(false);
  const vent = VENTS[idx];
  const availableVents = VENTS.filter((item) => !hiddenStoryIds.includes(item.id));
  const nextAvailableIndex = VENTS.findIndex((item, index) => index > idx && !hiddenStoryIds.includes(item.id));

  const to = (s: VentStage, d = 1) => {
    setVdir(d);
    setStage(s);
  };
  const leave = () => {
    onImmersive(false);
    onLeave();
  };

  // Reading a vent is a focused space: the tab bar steps aside.
  useEffect(() => onImmersive(stage !== "care"), [stage, onImmersive]);
  useEffect(() => () => onImmersive(false), [onImmersive]);

  if (availableVents.length === 0 && stage === "care") {
    return <Screen ground="g-vent"><div className="screen-body" style={{ display: "grid", placeItems: "center", textAlign: "center" }}><p className="t-body muted">No rainy days are waiting right now.</p></div><div className="screen-foot"><button className="btn btn-primary btn-full" onClick={leave}>Back to today</button></div></Screen>;
  }

  const nextVent = () => {
    setNudges(0);
    if (nextAvailableIndex >= 0) {
      setIdx(nextAvailableIndex);
      to("vent");
    } else to("done");
  };
  const validateReply = (text: string) => {
    if (isLowEffort(text) && nudges < 2) {
      setNudges((count) => count + 1);
      return "Say a bit more? One sentence about a time you felt this way means a lot to them.";
    }
    return null;
  };

  let body: ReactNode;
  if (stage === "care") {
    body = (
      <>
        <Scene mood="vent" height={320} />
        <div className="screen-body" style={{ paddingTop: 252 }}>
          <span className="t-eyebrow" style={{ color: "var(--mood-vent)" }}>Before you read a rainy day</span>
          <h1 className="t-display" style={{ margin: "14px 0 16px" }}>This is someone&apos;s real day.</h1>
          <p className="t-story" style={{ margin: 0, color: "var(--text-muted)" }}>
            This one&apos;s a rough day. You don&apos;t have to fix it. Just let them know someone read it.
          </p>
          <article className="card card-soft story-vent" style={{ marginTop: 20, padding: 18, background: "var(--ground-vent)" }}>
            <div className="row" style={{ gap: 8, marginBottom: 10 }}><Avatar initials={vent.initials} size={24} /><span className="t-byline">{vent.name}</span></div>
            <h2 className="t-title-sm" style={{ margin: "0 0 8px" }}>{vent.title}</h2>
            <p className="t-comment clamp-3" style={{ margin: 0 }}>{vent.a}</p>
            <div className="row story-actions" style={{ minHeight: 56, gap: 12, marginTop: 10, padding: "8px 0", borderBottom: "1px solid var(--line-hairline)" }}>
              <button className="rose-action" style={{ appearance: "none", width: 44, height: 44, flex: "0 0 44px", display: "grid", placeItems: "center", padding: 0, border: `1.5px solid ${roseGiven ? "var(--line-hairline)" : "var(--turn-accent)"}`, borderRadius: "50%", background: roseGiven ? "var(--surface-sunken)" : "var(--turn-wash)", color: roseGiven ? "var(--text-muted)" : "var(--turn-accent)", cursor: roseGiven ? "default" : "pointer" }} aria-label={roseGiven ? "You have given today's nod" : "Give a nod"} disabled={roseGiven} onClick={() => setCareRose(true)}><Rose filled={roseGiven} /></button>
              <button className="story-comment-jump" onClick={() => to("vent")}>Comments</button>
            </div>
          </article>
        </div>
        <div className="screen-foot" style={{ paddingBottom: 110 }}>
          <div className="row">
            <button className="btn btn-secondary grow" onClick={leave}>Not today</button>
            <button className="btn btn-primary grow" onClick={() => to("vent")}>I&apos;m ready</button>
          </div>
        </div>
        <AnimatePresence>
          {careRose && <Sheet label="Give your nod" onClose={() => setCareRose(false)}><div className="sheet-centered" style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 16, textAlign: "center" }}><span className="t-title">Give your nod today to this story?</span><span className="t-caption">You get one a day. They’ll see it tomorrow, with no name attached.</span><button className="btn btn-accent" onClick={() => { onGiveRose(vent.id); setCareRose(false); setShowCareRoseAnimation(true); }}><Rose filled /> Give a nod</button><button className="link center" onClick={() => setCareRose(false)}>Save it for another story</button></div></Sheet>}
        </AnimatePresence>
      </>
    );
  } else if (stage === "done") {
    body = (
      <>
        <TopBar onBack={leave} icon="close" />
        <div className="screen-body" style={{ display: "grid", placeItems: "center", textAlign: "center" }}>
          <div>
            <div className="row" style={{ justifyContent: "center", gap: 8, marginBottom: 22 }}>
              {[0, 1, 2].map((i) => (
                <motion.span key={i} style={{ width: 12, height: 12, borderRadius: 6, background: "var(--text-ink)" }} initial={ok ? { scale: 0 } : false} animate={{ scale: 1 }} transition={{ delay: 0.25 + 0.1 * i, type: "spring", stiffness: 400, damping: 18 }} />
              ))}
            </div>
            <h1 className="t-display" style={{ margin: "0 0 12px" }}>Everyone who needed a reply got one.</h1>
            <p className="t-body muted" style={{ margin: 0 }}>Thanks for being there.</p>
          </div>
        </div>
        <div className="screen-foot">
          <button className="btn btn-primary btn-full" onClick={leave}>Back to today</button>
        </div>
      </>
    );
  } else {
    body = (
      <StoryDetail
        story={vent}
        category="vent"
        profileName={profile.name}
        profileInitials={profile.initials}
        roseGiven={roseGiven}
        onGiveRose={() => onGiveRose(vent.id)}
        onBack={() => to("care", -1)}
        onNext={nextVent}
        nextLabel="Next"
        onBreak={leave}
        comments={[...(commentsByStory[vent.id] ?? []), ...vent.comments]}
        onAddComment={(comment) => onAddComment(vent.id, comment)}
        onReport={() => onReport(vent.id)}
        validateComment={validateReply}
      />
    );
  }

  return (
    <AnimatePresence initial={false} custom={vdir}>
      <motion.div
        key={`${stage}-${idx}`}
        className="screen g-vent"
        custom={vdir}
        variants={ventSlide}
        initial="vEnter"
        animate="vCenter"
        exit="vExit"
        transition={{ duration: ok ? 0.4 : 0.01, ease }}
      >
        {body}
        {showCareRoseAnimation && <RoseTakeover mood="vent" />}
      </motion.div>
    </AnimatePresence>
  );
}


/* HM-04 · That's today                                                */
/* ------------------------------------------------------------------ */
export function ThatsToday({ post, onDone, onGood }: { post: Post; onDone: () => void; onGood: () => void }) {
  const ok = useMotionSafe();
  return (
    <Screen ground="g-turned">
      <Scene mood="turned" height={300} time="dusk" />
      <div style={{ height: 230, flexShrink: 0 }} />
      <div className="screen-body" style={{ display: "grid", placeItems: "center", textAlign: "center" }}>
        <div>
          <motion.h1 className="t-display" style={{ margin: "0 0 12px", fontSize: 36, lineHeight: "42px" }} initial={ok ? { opacity: 0, y: 8 } : false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6, ease }}>
            That&apos;s a wrap on today.
          </motion.h1>
          <motion.p className="t-body muted" style={{ margin: 0 }} initial={ok ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.6 }}>
            “{post.title}” is out there until 11:59 PM.<br />Morning. People wrote back.
          </motion.p>
        </div>
      </div>
      <div className="screen-foot">
        <button className="btn btn-primary btn-full" onClick={onDone}>Done for today</button>
        <button className="link center" onClick={onGood}>Read the little wins</button>
      </div>
    </Screen>
  );
}

/* Midnight passes. */
export function Midnight({ onDone }: { onDone: () => void }) {
  const ok = useMotionSafe();
  useEffect(() => {
    const t = setTimeout(onDone, ok ? 2600 : 800);
    return () => clearTimeout(t);
  }, [onDone, ok]);
  return (
    <Screen ground="g-default" style={{ background: "#111220", color: "#ececf5" }}>
      <div style={{ flex: 1, display: "grid", placeItems: "center", textAlign: "center" }}>
        <div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 1] }} transition={{ duration: 1.2 }} style={{ color: "#a9a4ff" }}>
            <Moon size={34} />
          </motion.div>
          <motion.p className="t-story" style={{ margin: "16px 0 0", color: "#ececf5" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.8 }}>
            Midnight. Clean slate.
          </motion.p>
          <motion.p className="t-caption" style={{ margin: "8px 0 0", color: "#aeb0c7" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3, duration: 0.8 }}>
            Morning. People wrote back.
          </motion.p>
        </div>
      </div>
    </Screen>
  );
}
