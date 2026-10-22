"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import type { Post } from "./Compose";
import { GOOD, ME, TURNED, VENTS, isLowEffort, isUnkind, type Comment, type Story } from "./data";
import {
  Author,
  Avatar,
  Chevron,
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
  useMotionSafe,
} from "./ui";

/* ------------------------------------------------------------------ */
/* Mood tab bar: good days · stories that turned · vents               */
/* ------------------------------------------------------------------ */
export type Tab = "good" | "turned" | "vent";
export function TabBar({ current, onChange }: { current: Tab; onChange: (t: Tab) => void }) {
  return (
    <nav className="tabbar" aria-label="Today's reading">
      <button className="good" aria-current={current === "good" ? "page" : undefined} aria-label="Good days" onClick={() => onChange("good")}>
        <Sun />
      </button>
      <button aria-current={current === "turned" ? "page" : undefined} aria-label="Stories that turned" onClick={() => onChange("turned")}>
        <CloudSun />
      </button>
      <button className="vent" aria-current={current === "vent" ? "page" : undefined} aria-label="One vent" onClick={() => onChange("vent")}>
        <Rain />
      </button>
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/* HM-01 · Locked home                                                 */
/* ------------------------------------------------------------------ */
export function LockedHome({ onWrite, dateLabel }: { onWrite: () => void; dateLabel: string }) {
  const ok = useMotionSafe();
  const titles = ["The group project", "Burnt the rice twice", "First day back"];
  return (
    <Screen ground="g-surface">
      <div style={{ height: 150, padding: "18px 24px 0" }}>
        <span className="t-eyebrow">{dateLabel}</span>
      </div>
      <div className="g-turned" style={{ flex: 1, display: "flex", flexDirection: "column", borderTop: "1px solid var(--line-hairline)" }}>
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
/* ------------------------------------------------------------------ */
export function LetGo({ post, onDone }: { post: Post; onDone: () => void }) {
  const ok = useMotionSafe();
  useEffect(() => {
    const t = setTimeout(onDone, ok ? 3600 : 1200);
    return () => clearTimeout(t);
  }, [onDone, ok]);

  const card = (
    <div className="card" style={{ width: 290, padding: 20 }}>
      <Author name={ME.name} initials={ME.initials} size={24} />
      <div className="t-title-sm" style={{ marginTop: 12, textAlign: "center" }}>{post.title}</div>
      {post.hinge ? (
        <div className="hinge" style={{ textAlign: "center", marginTop: 6, fontSize: 17 }}>{post.hinge}</div>
      ) : (
        <div className="t-caption" style={{ textAlign: "center", marginTop: 6 }}>{post.kind === "good" ? "A good day" : "Left as it was"}</div>
      )}
    </div>
  );

  return (
    <Screen ground="g-default">
      <div style={{ flex: 1, position: "relative", display: "grid", placeItems: "center" }}>
        {/* faint trail */}
        {ok &&
          [0.12, 0.22].map((o, i) => (
            <motion.div
              key={i}
              style={{ position: "absolute", opacity: 0 }}
              animate={{ opacity: [0, o, 0], y: [0, -140 - i * 90], scale: [1, 0.86 - i * 0.08] }}
              transition={{ delay: 1.0 + i * 0.12, duration: 1.4, ease }}
            >
              {card}
            </motion.div>
          ))}
        <motion.div
          initial={ok ? { scale: 1.06, opacity: 0 } : { opacity: 1 }}
          animate={
            ok
              ? { scale: [1.06, 1, 0.92, 0.8], opacity: [0, 1, 1, 0], y: [0, 0, -40, -360], rotate: [0, 0, -1, -4] }
              : { opacity: 1 }
          }
          transition={ok ? { duration: 2.4, times: [0, 0.25, 0.5, 1], ease } : { duration: 0.01 }}
        >
          {card}
        </motion.div>
      </div>
      <motion.div
        style={{ padding: "0 32px 120px", textAlign: "center" }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: ok ? 1.9 : 0, duration: 0.6, ease }}
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
/* HM-02 / PO-10 · Today's reading                                     */
/* ------------------------------------------------------------------ */
export function Home({
  post,
  roseGiven,
  readCount,
  onOpen,
  onTab,
  onMenuEnd,
}: {
  post: Post;
  roseGiven: boolean;
  readCount: number;
  onOpen: (t: Tab) => void;
  onTab: (t: Tab) => void;
  onMenuEnd: () => void;
}) {
  const left = Math.max(0, TURNED.length - readCount);
  return (
    <Screen ground="g-turned">
      <div className="g-surface" style={{ padding: "26px 24px 0", borderBottom: "1px solid var(--line-hairline)" }}>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <h1 className="t-display" style={{ margin: 0 }}>Today</h1>
          <button className="link" style={{ fontSize: 13 }} onClick={onMenuEnd}>End for today</button>
        </div>
        <div className="card" style={{ marginTop: 16, marginBottom: -36, position: "relative" }}>
          <div className="t-title-sm">“{post.title}” is out there</div>
          <div className="t-caption" style={{ marginTop: 4 }}>Until 11:59 PM. Its conversation will be here tomorrow.</div>
        </div>
      </div>
      <div className="screen-body" style={{ paddingTop: 50 }}>
        <AnimatePresence>
          {roseGiven && (
            <motion.div className="row" style={{ gap: 8, marginBottom: 20 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <span className="turned"><Rose filled size={16} /></span>
              <span className="t-body" style={{ fontSize: 15 }}>You gave today&apos;s rose</span>
            </motion.div>
          )}
        </AnimatePresence>
        <span className="t-eyebrow" style={{ color: "var(--mood-turned)" }}>Today&apos;s reading</span>
        <div style={{ marginTop: 8 }}>
          <button className="listrow" onClick={() => onOpen("turned")}>
            <span className="stack" style={{ gap: 4 }}>
              <span className="t-body" style={{ fontWeight: 700 }}>Stories that turned</span>
              <span className="t-caption">
                {left === 0 ? "You've read them all today." : readCount === 0 ? "Someone's hard day, and how they saw it after." : "Pick up where you left off."}
              </span>
              <span className="dots" aria-label={`${left} left`} style={{ marginTop: 4 }}>
                {TURNED.map((s, i) => (
                  <span key={s.id} className={`dot ${i < readCount ? "done" : ""}`} />
                ))}
              </span>
            </span>
            <Chevron />
          </button>
          <button className="listrow" onClick={() => onOpen("vent")}>
            <span className="stack" style={{ gap: 4 }}>
              <span className="t-body" style={{ fontWeight: 700 }}>One vent</span>
              <span className="t-caption">Someone who didn&apos;t find a bright side today. Write back to hear the next one.</span>
            </span>
            <Chevron />
          </button>
          <button className="listrow" onClick={() => onOpen("good")}>
            <span className="stack" style={{ gap: 4 }}>
              <span className="t-body" style={{ fontWeight: 700 }}>Good days</span>
              <span className="t-caption">Read as many as are left today.</span>
            </span>
            <Chevron />
          </button>
        </div>
        <p className="t-caption" style={{ textAlign: "center", marginTop: 28 }}>Everything here is gone at midnight</p>
        <div style={{ height: 110 }} />
      </div>
      <TabBar current="turned" onChange={onTab} />
    </Screen>
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
/* RD-04 · Good days                                                   */
/* ------------------------------------------------------------------ */
export function GoodDays({ onBack, onTab }: { onBack: () => void; onTab: (t: Tab) => void }) {
  const ok = useMotionSafe();
  return (
    <Screen ground="g-good">
      <TopBar onBack={onBack} />
      <div className="screen-body">
        <h1 className="t-display" style={{ margin: "0 0 18px" }}>Good days</h1>
        <div className="stack" style={{ gap: 14 }}>
          {GOOD.map((s, i) => (
            <motion.div key={s.id} initial={ok ? { opacity: 0, y: 10 } : false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.1, duration: 0.4, ease }}>
              <div className="card card-good">
                <div className="t-title-sm" style={{ marginBottom: 8 }}>{s.title}</div>
                <p className="t-story" style={{ margin: 0, fontSize: 17, lineHeight: "26px" }}>{s.a}</p>
                <div className="row" style={{ justifyContent: "space-between", marginTop: 14 }}>
                  <div className="row" style={{ gap: 8 }}>
                    <Avatar initials={s.initials} size={22} />
                    <span className="t-byline" style={{ fontSize: 13 }}>{s.name}</span>
                  </div>
                  <span className="t-eyebrow" style={{ fontSize: 11, color: "var(--mood-good)" }}>A good day</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="stack" style={{ alignItems: "center", margin: "28px 0 130px", gap: 4 }}>
          <span className="t-label" style={{ fontSize: 14 }}>That&apos;s every good day so far</span>
          <span className="t-caption">More may come in before midnight.</span>
        </div>
      </div>
      <TabBar current="good" onChange={onTab} />
    </Screen>
  );
}

/* ------------------------------------------------------------------ */
/* VT-01..04 · The vent door                                           */
/* ------------------------------------------------------------------ */
export function VentDoor({ onBack, onTab }: { onBack: () => void; onTab: (t: Tab) => void }) {
  const ok = useMotionSafe();
  const [stage, setStage] = useState<"care" | "vent" | "responses" | "done">("care");
  const [idx, setIdx] = useState(0);
  const [reply, setReply] = useState("");
  const [nudges, setNudges] = useState(0);
  const [nudge, setNudge] = useState(false);
  const vent = VENTS[idx];

  const send = () => {
    if (isLowEffort(reply) && nudges < 2) {
      setNudge(true);
      setNudges(nudges + 1);
      return;
    }
    setNudge(false);
    setStage("responses");
  };

  if (stage === "care") {
    return (
      <Screen ground="g-vent">
        <TopBar onBack={onBack} />
        <div className="screen-body" style={{ paddingTop: 60 }}>
          <span className="t-eyebrow" style={{ color: "var(--mood-vent)" }}>Before you open a vent</span>
          <h1 className="t-display" style={{ margin: "14px 0 16px" }}>This is someone&apos;s real day.</h1>
          <p className="t-story" style={{ margin: 0, color: "var(--text-muted)" }}>
            They didn&apos;t find a bright side, and they&apos;re not asking you to. You don&apos;t have to fix it. Just let them know someone read it.
          </p>
        </div>
        <div className="screen-foot" style={{ paddingBottom: 110 }}>
          <div className="row">
            <button className="btn btn-secondary grow" onClick={onBack}>Not today</button>
            <button className="btn btn-primary grow" onClick={() => setStage("vent")}>I&apos;m ready</button>
          </div>
        </div>
        <TabBar current="vent" onChange={onTab} />
      </Screen>
    );
  }

  if (stage === "done") {
    return (
      <Screen ground="g-vent">
        <TopBar onBack={onBack} />
        <div className="screen-body" style={{ display: "grid", placeItems: "center", textAlign: "center" }}>
          <div>
            <div className="row" style={{ justifyContent: "center", gap: 8, marginBottom: 22 }}>
              {[0, 1, 2].map((i) => (
                <motion.span key={i} style={{ width: 12, height: 12, borderRadius: 6, background: "var(--text-ink)" }} initial={ok ? { scale: 0 } : false} animate={{ scale: 1 }} transition={{ delay: 0.1 * i, type: "spring", stiffness: 400, damping: 18 }} />
              ))}
            </div>
            <h1 className="t-display" style={{ margin: "0 0 12px" }}>You&apos;ve heard everyone who needed it today.</h1>
            <p className="t-body muted" style={{ margin: 0 }}>Every vent so far has someone&apos;s words waiting for it. Thank you for being one of them.</p>
          </div>
        </div>
        <div className="screen-foot">
          <button className="btn btn-primary btn-full" onClick={onBack}>Back to today</button>
        </div>
      </Screen>
    );
  }

  if (stage === "responses") {
    return (
      <Screen ground="g-vent" key={`r-${idx}`}>
        <TopBar onBack={onBack} title={<span className="t-title-sm">{vent.title}</span>} />
        <div className="screen-body">
          <div className="card" style={{ boxShadow: "inset 0 0 0 1.5px var(--turn-accent)" }}>
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
            <button className="btn btn-secondary grow" onClick={onBack}>Stop here</button>
            <button
              className="btn btn-primary grow"
              onClick={() => {
                setReply("");
                setNudges(0);
                if (idx < VENTS.length - 1) {
                  setIdx(idx + 1);
                  setStage("vent");
                } else setStage("done");
              }}
            >
              Hear another
            </button>
          </div>
        </div>
      </Screen>
    );
  }

  return (
    <Screen ground="g-vent" key={`v-${idx}`}>
      <TopBar onBack={onBack} title={<span className="t-eyebrow" style={{ color: "var(--mood-vent)" }}>A vent</span>} />
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
          <button className="link" onClick={onBack}>Not this one</button>
          <button className="btn btn-primary" disabled={!reply.trim()} onClick={send}>Send</button>
        </div>
      </div>
    </Screen>
  );
}

/* ------------------------------------------------------------------ */
/* HM-04 · That's today                                                */
/* ------------------------------------------------------------------ */
export function ThatsToday({ post, onDone, onGood }: { post: Post; onDone: () => void; onGood: () => void }) {
  const ok = useMotionSafe();
  return (
    <Screen ground="g-turned">
      <div className="g-surface" style={{ height: 230, borderBottom: "1px solid var(--line-hairline)" }} />
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
