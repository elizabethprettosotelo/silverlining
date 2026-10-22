"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import type { Post } from "./Compose";
import { GOOD, ME, TURNED, VENTS, isLowEffort, isUnkind, type Comment, type Story } from "./data";
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
  StoryText,
  Sun,
  TopBar,
  ease,
  slide,
  spring,
  useMotionSafe,
} from "./ui";
import Scene from "./Scene";
import RoseTakeover from "./RoseTakeover";

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
    { t: "good", label: "Good days", icon: <Sun /> },
    { t: "turned", label: "Turned days", icon: <CloudSun /> },
    { t: "vent", label: "Vents", icon: <Rain /> },
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
export function LockedHome({ onWrite, dateLabel }: { onWrite: () => void; dateLabel: string }) {
  const ok = useMotionSafe();
  const titles = ["The group project", "Burnt the rice twice", "First day back"];
  return (
    <Screen ground="g-turned">
      <Scene mood="turned" height={240} />
      <div style={{ height: 150, padding: "18px 24px 0" }}>
        <span className="t-eyebrow">{dateLabel}</span>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div className="screen-body" style={{ paddingTop: 28 }}>
          <h1 className="t-display" style={{ margin: "0 0 18px" }}>Today</h1>
          {titles.map((t, i) => (
            <motion.div
              key={t}
              className="row"
              style={{ justifyContent: "space-between", padding: "14px 0", borderBottom: "1px solid var(--line-hairline)" }}
              initial={ok ? { opacity: 0, y: 6 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.08, duration: 0.4, ease }}
            >
              <span className="t-title-sm muted">{t}</span>
              <span className="muted"><Lock /></span>
            </motion.div>
          ))}
          <p className="t-body" style={{ margin: "32px 0 6px" }}>Other people wrote about their day.</p>
          <p className="t-body muted" style={{ margin: 0 }}>Write yours to read theirs.</p>
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
      setTimeout(() => setPhase(1), 1000),
      setTimeout(() => setPhase(2), 1700),
      setTimeout(() => setPhase(3), 2350),
      setTimeout(onDone, 4300),
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
                <div className="t-caption" style={{ marginTop: 4 }}>{post.kind === "good" ? "A good day" : "Left as it was"}</div>
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
        <h1 className="t-display" style={{ margin: "0 0 10px" }}>There it goes.</h1>
        <p className="t-caption" style={{ margin: 0, fontSize: 15, lineHeight: "22px" }}>
          It&apos;s out there until midnight. Now see how other people&apos;s days went.
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
  read,
  onOpenStory,
}: {
  tab: Tab;
  dir: number;
  onTab: (t: Tab) => void;
  post: Post;
  roseGiven: boolean;
  read: string[];
  onOpenStory: (index: number) => void;
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
          {tab === "good" && <GoodPane />}
          {tab === "turned" && <TurnedPane post={post} roseGiven={roseGiven} read={read} onOpen={onOpenStory} />}
          {tab === "vent" && <VentPane onLeave={() => onTab("turned")} onImmersive={setImmersive} />}
        </motion.div>
      </AnimatePresence>
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
function TurnedPane({ post, roseGiven, read, onOpen }: { post: Post; roseGiven: boolean; read: string[]; onOpen: (i: number) => void }) {
  const ok = useMotionSafe();
  return (
    <>
      <Scene mood="turned" height={210} />
      <div className="screen-body" style={{ paddingTop: 122 }}>
        <h1 className="t-display" style={{ margin: "0 0 6px" }}>Turned days</h1>
        <p className="t-caption" style={{ margin: "0 0 18px" }}>
          “{post.title}” is out there until 11:59 PM.
        </p>
        <div className="stack" style={{ gap: 14 }}>
          {TURNED.map((s, i) => {
            const done = read.includes(s.id);
            return (
              <motion.button key={s.id} className="card card-soft card-tap" onClick={() => onOpen(i)} whileTap={{ scale: 0.985 }} {...cardIn(ok, i)}>
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
                    {done ? "Read" : "A day that turned"}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
        <PaneEnd
          title="That's every day that turned so far"
          sub={
            roseGiven ? (
              <span className="row" style={{ gap: 6, justifyContent: "center" }}>
                <span className="turned"><Rose filled size={14} /></span> You gave today&apos;s rose
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
function GoodPane() {
  const ok = useMotionSafe();
  return (
    <>
      <Scene mood="good" height={210} />
      <div className="screen-body" style={{ paddingTop: 122 }}>
        <h1 className="t-display" style={{ margin: "0 0 18px" }}>Good days</h1>
        <div className="stack" style={{ gap: 14 }}>
          {GOOD.map((s, i) => (
            <motion.article key={s.id} className="card card-soft" {...cardIn(ok, i)}>
              <div className="t-title-sm" style={{ marginBottom: 8 }}>{s.title}</div>
              <p className="t-story" style={{ margin: 0, fontSize: 17, lineHeight: "26px" }}>{s.a}</p>
              <div className="row" style={{ justifyContent: "space-between", marginTop: 14 }}>
                <div className="row" style={{ gap: 8 }}>
                  <Avatar initials={s.initials} size={22} />
                  <span className="t-byline" style={{ fontSize: 13 }}>{s.name}</span>
                </div>
                <span className="t-eyebrow" style={{ fontSize: 11, color: "var(--mood-good)" }}>A good day</span>
              </div>
            </motion.article>
          ))}
        </div>
        <PaneEnd title="That's every good day so far" sub="More may come in before midnight." />
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* VT-01..04 · Vents                                                   */
/* ------------------------------------------------------------------ */
type VentStage = "care" | "vent" | "responses" | "done";
const ventSlide = slide(70, ["vEnter", "vCenter", "vExit"]);

function VentPane({ onLeave, onImmersive }: { onLeave: () => void; onImmersive: (on: boolean) => void }) {
  const ok = useMotionSafe();
  const [stage, setStage] = useState<VentStage>("care");
  const [vdir, setVdir] = useState(1);
  const [idx, setIdx] = useState(0);
  const [reply, setReply] = useState("");
  const [nudges, setNudges] = useState(0);
  const [nudge, setNudge] = useState(false);
  const vent = VENTS[idx];

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

  const send = () => {
    if (isLowEffort(reply) && nudges < 2) {
      setNudge(true);
      setNudges(nudges + 1);
      return;
    }
    setNudge(false);
    to("responses");
  };

  let body: ReactNode;
  if (stage === "care") {
    body = (
      <>
        <Scene mood="vent" height={320} />
        <div className="screen-body" style={{ paddingTop: 252 }}>
          <span className="t-eyebrow" style={{ color: "var(--mood-vent)" }}>Before you open a vent</span>
          <h1 className="t-display" style={{ margin: "14px 0 16px" }}>This is someone&apos;s real day.</h1>
          <p className="t-story" style={{ margin: 0, color: "var(--text-muted)" }}>
            They didn&apos;t find a bright side, and they&apos;re not asking you to. You don&apos;t have to fix it. Just let them know someone read it.
          </p>
        </div>
        <div className="screen-foot" style={{ paddingBottom: 110 }}>
          <div className="row">
            <button className="btn btn-secondary grow" onClick={leave}>Not today</button>
            <button className="btn btn-primary grow" onClick={() => to("vent")}>I&apos;m ready</button>
          </div>
        </div>
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
            <h1 className="t-display" style={{ margin: "0 0 12px" }}>You&apos;ve heard everyone who needed it today.</h1>
            <p className="t-body muted" style={{ margin: 0 }}>Every vent so far has someone&apos;s words waiting for it. Thank you for being one of them.</p>
          </div>
        </div>
        <div className="screen-foot">
          <button className="btn btn-primary btn-full" onClick={leave}>Back to today</button>
        </div>
      </>
    );
  } else if (stage === "responses") {
    body = (
      <>
        <TopBar onBack={leave} icon="close" title={<span className="t-title-sm">{vent.title}</span>} />
        <div className="screen-body">
          <div className="card card-soft" style={{ boxShadow: "inset 0 0 0 1.5px var(--turn-accent)" }}>
            <span className="t-eyebrow" style={{ color: "var(--turn-accent)" }}>You wrote</span>
            <p className="t-comment" style={{ margin: "8px 0 0" }}>{reply}</p>
          </div>
          <p className="t-caption" style={{ margin: "18px 0 10px" }}>Others wrote, in no particular order</p>
          <div className="stack" style={{ gap: 12 }}>
            {vent.comments.map((c, i) => (
              <CommentCard key={c.name} c={c} delay={0.2 + i * 0.1} />
            ))}
          </div>
        </div>
        <div className="screen-foot">
          <span className="t-caption" style={{ textAlign: "center" }}>
            {idx < VENTS.length - 1 ? "Someone else is waiting to be heard." : "That was the last one waiting."}
          </span>
          <div className="row">
            <button className="btn btn-secondary grow" onClick={leave}>Stop here</button>
            <button
              className="btn btn-primary grow"
              onClick={() => {
                setReply("");
                setNudges(0);
                if (idx < VENTS.length - 1) {
                  setIdx(idx + 1);
                  to("vent");
                } else to("done");
              }}
            >
              Hear another
            </button>
          </div>
        </div>
      </>
    );
  } else {
    body = (
      <>
        <TopBar onBack={() => to("care", -1)} title={<span className="t-eyebrow" style={{ color: "var(--mood-vent)" }}>A vent</span>} />
        <div className="screen-body">
          <Author name={vent.name} initials={vent.initials} sub="earlier today" />
          <h1 className="t-title" style={{ margin: "18px 0 12px" }}>{vent.title}</h1>
          <StoryText a={vent.a} />
        </div>
        <div className="g-surface" style={{ borderRadius: "22px 22px 0 0", padding: "16px 20px 34px", display: "flex", flexDirection: "column", gap: 10 }}>
          <span className="t-byline" style={{ fontSize: 13 }}>Write back to {vent.name}</span>
          <textarea
            className="textarea-box"
            style={{ minHeight: 90 }}
            value={reply}
            onChange={(e) => {
              setReply(e.target.value);
              setNudge(false);
            }}
            placeholder="Have you ever felt like this? Tell them."
          />
          <AnimatePresence>
            {nudge && (
              <motion.div className="banner banner-held" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                Say a bit more? One sentence about a time you felt this way means a lot to them.
              </motion.div>
            )}
          </AnimatePresence>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <button className="link" onClick={() => to("care", -1)}>Not this one</button>
            <button className="btn btn-primary" disabled={!reply.trim()} onClick={send}>Send</button>
          </div>
        </div>
      </>
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
      </motion.div>
    </AnimatePresence>
  );
}


/* ------------------------------------------------------------------ */
/* RD-01..05 · Reading a story that turned                             */
/* ------------------------------------------------------------------ */
export function Reader({
  index,
  roseGiven,
  onGiveRose,
  onNext,
  onBack,
  onEnd,
}: {
  index: number;
  roseGiven: boolean;
  onGiveRose: (id: string) => void;
  onNext: () => void;
  onBack: () => void;
  onEnd: () => void;
}) {
  const story = TURNED[index];
  const [sheet, setSheet] = useState<null | "rose" | "break" | "write" | "reread">(null);
  const [comment, setComment] = useState("");
  const [sent, setSent] = useState<string | null>(null);
  const [rosedThis, setRosedThis] = useState(false);

  if (sent) {
    return <Comments story={story} mine={sent} onBack={() => setSent(null)} onNext={onNext} last={index === TURNED.length - 1} />;
  }

  const send = (force = false) => {
    if (!force && isUnkind(comment)) {
      setSheet("reread");
      return;
    }
    setSheet(null);
    setSent(comment.trim());
  };

  return (
    <Screen ground="g-turned">
      <TopBar
        onBack={onBack}
        right={<button className="link" style={{ fontSize: 14 }} onClick={() => setSheet("break")}>I need a break</button>}
      />
      <div className="screen-body">
        <div className="dots" style={{ margin: "4px 0 22px" }} aria-label={`Story ${index + 1} of ${TURNED.length}`}>
          {TURNED.map((s, i) => (
            <span key={s.id} className={`dot ${i === index ? "on" : i < index ? "done" : ""}`} />
          ))}
        </div>
        <Author name={story.name} initials={story.initials} sub="earlier today" />
        <h1 className="t-title" style={{ margin: "18px 0 12px" }}>{story.title}</h1>
        <StoryText a={story.a} hinge={story.hinge} b={story.b} animateTurn key={story.id} />
        <div style={{ marginTop: 22 }}>
          {rosedThis ? (
            <span className="row turned t-label" style={{ gap: 8 }}>
              <Rose filled /> You gave this story your rose
            </span>
          ) : roseGiven ? (
            <span className="t-caption">You&apos;ve given today&apos;s rose.</span>
          ) : (
            <button className="btn btn-accent btn-sm" onClick={() => setSheet("rose")}>
              <Rose /> Give a rose
            </button>
          )}
        </div>
        <div style={{ height: 24 }} />
      </div>
      {rosedThis && <RoseTakeover />}
      <div className="screen-foot">
        <div className="row">
          <button className="btn btn-secondary grow" onClick={() => setSheet("write")}>Write back</button>
          <button className="btn btn-primary grow" onClick={onNext}>Next</button>
        </div>
      </div>

      <AnimatePresence>
        {sheet === "rose" && (
          <Sheet key="rose" label="Give your rose" onClose={() => setSheet(null)}>
            <span className="t-title">Give your one rose today to this story?</span>
            <span className="t-caption" style={{ fontSize: 14 }}>You get one a day. They&apos;ll find it tomorrow, with no name attached.</span>
            <button
              className="btn btn-accent"
              style={{ alignSelf: "flex-start" }}
              onClick={() => {
                onGiveRose(story.id);
                setRosedThis(true);
                setSheet(null);
              }}
            >
              <Rose filled /> Give my rose
            </button>
            <button className="link" onClick={() => setSheet(null)}>Save it for another story</button>
          </Sheet>
        )}
        {sheet === "break" && (
          <Sheet key="break" label="Take a break" onClose={() => setSheet(null)}>
            <span className="t-title">Stopping here is fine</span>
            <span className="t-caption" style={{ fontSize: 14 }}>
              Other people&apos;s days can be a lot. Your stories aren&apos;t going anywhere until midnight.
            </span>
            <button className="btn btn-primary" style={{ alignSelf: "flex-start" }} onClick={onEnd}>End for today</button>
            <a className="btn btn-secondary" style={{ alignSelf: "flex-start" }} href="tel:988">Get support now</a>
            <button className="link" onClick={() => setSheet(null)}>Keep reading</button>
          </Sheet>
        )}
        {sheet === "write" && (
          <Sheet key="write" label={`Write back to ${story.name}`} onClose={() => setSheet(null)}>
            <span className="t-byline">Write back to {story.name}</span>
            <textarea
              className="textarea-box"
              autoFocus
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Talk to the person, not just the problem."
            />
            <div className="row" style={{ justifyContent: "space-between" }}>
              <button className="link" onClick={() => setSheet(null)}>Not now</button>
              <button className="btn btn-primary" disabled={!comment.trim()} onClick={() => send()}>Send</button>
            </div>
          </Sheet>
        )}
        {sheet === "reread" && (
          <Sheet key="reread" label="Reread before sending" onClose={() => setSheet("write")}>
            <span className="t-title">This might land harder than you mean it to</span>
            <span className="t-caption" style={{ fontSize: 14 }}>They shared something real. Try writing back to how they felt, not what they should have done.</span>
            <button className="btn btn-primary btn-full" onClick={() => setSheet("write")}>Reread it</button>
            <button className="link center" onClick={() => send(true)}>Send anyway</button>
          </Sheet>
        )}
      </AnimatePresence>
    </Screen>
  );
}

/* RD-03 · Comments unlock after you write back */
function Comments({ story, mine, onBack, onNext, last }: { story: Story; mine: string; onBack: () => void; onNext: () => void; last: boolean }) {
  const ok = useMotionSafe();
  return (
    <Screen ground="g-turned">
      <TopBar onBack={onBack} />
      <div className="screen-body">
        <h1 className="t-title-sm" style={{ margin: "0 0 14px" }}>{story.title}</h1>
        <motion.div className="card card-ink" layout initial={ok ? { opacity: 0, y: 10 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }}>
          <span className="t-eyebrow">You wrote</span>
          <p className="t-comment" style={{ margin: "8px 0 0" }}>{mine}</p>
        </motion.div>
        <p className="t-caption" style={{ margin: "18px 0 10px" }}>Others wrote, in no particular order</p>
        <div className="stack" style={{ gap: 12 }}>
          {story.comments.map((c, i) => (
            <CommentCard key={c.name} c={c} delay={0.25 + i * 0.12} />
          ))}
        </div>
        <div style={{ height: 24 }} />
      </div>
      <div className="screen-foot">
        <button className="btn btn-primary" style={{ alignSelf: "flex-start" }} onClick={onNext}>
          {last ? "That's the last one" : "Next story"}
        </button>
      </div>
    </Screen>
  );
}

function CommentCard({ c, delay = 0 }: { c: Comment; delay?: number }) {
  const ok = useMotionSafe();
  return (
    <motion.div className="card" initial={ok ? { opacity: 0, y: 10 } : false} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.4, ease }}>
      <div className="row" style={{ gap: 8, marginBottom: 8 }}>
        <Avatar initials={c.initials} size={22} />
        <span className="t-byline" style={{ fontSize: 13 }}>{c.name}</span>
      </div>
      <p className="t-comment" style={{ margin: 0 }}>{c.text}</p>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
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
          <motion.div
            className="muted"
            style={{ display: "inline-block" }}
            initial={ok ? { opacity: 0, rotate: -40, scale: 0.8 } : false}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            transition={{ duration: 1.1, ease }}
          >
            <Moon size={30} />
          </motion.div>
          <motion.h1 className="t-display" style={{ margin: "14px 0 12px", fontSize: 36, lineHeight: "42px" }} initial={ok ? { opacity: 0, y: 8 } : false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.6, ease }}>
            That&apos;s today.
          </motion.h1>
          <motion.p className="t-body muted" style={{ margin: 0 }} initial={ok ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.6 }}>
            “{post.title}” is out there until 11:59 PM. Next time you open the app, you&apos;ll see what it started.
          </motion.p>
        </div>
      </div>
      <div className="screen-foot">
        <button className="btn btn-primary btn-full" onClick={onDone}>Done for today</button>
        <button className="link center" onClick={onGood}>Read the good days</button>
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
            Midnight. Everything from today is gone.
          </motion.p>
          <motion.p className="t-caption" style={{ margin: "8px 0 0", color: "#aeb0c7" }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3, duration: 0.8 }}>
            The next morning…
          </motion.p>
        </div>
      </div>
    </Screen>
  );
}
