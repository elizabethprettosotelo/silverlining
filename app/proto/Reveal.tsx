"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Post } from "./Compose";
import { REVEAL } from "./data";
import ReportSheet from "./ReportSheet";
import { Avatar, EyeOff, Rose, Screen, StoryText, TopBar, ease, useMotionSafe } from "./ui";

type Stage = "yesterday" | "response" | "rose" | "keep" | "release" | "preserve";
type Tag = "Helped" | "Didn't land" | "Unkind";

export default function Reveal({ post, dateLabel, onFinish }: { post: Post; dateLabel: string; onFinish: (kept: boolean) => void }) {
  const ok = useMotionSafe();
  const [stage, setStage] = useState<Stage>("yesterday");
  const [i, setI] = useState(0);
  const [tags, setTags] = useState<Record<number, Tag>>({});
  const [flagChoice, setFlagChoice] = useState<null | "read" | "skip">(null);
  const [hidden, setHidden] = useState<Record<number, boolean>>({});
  const [reporting, setReporting] = useState(false);
  const [thanksSent, setThanksSent] = useState(false);

  const r = REVEAL[i];
  const next = () => {
    setFlagChoice(null);
    if (i < REVEAL.length - 1) setI(i + 1);
    else setStage("rose");
  };

  if (stage === "release" || stage === "preserve") {
    const keeping = stage === "preserve";
    return (
      <Screen ground={keeping ? "g-reveal" : "g-default"}>
        <div className="screen-body outcome-motion" style={{ display: "grid", placeItems: "center", textAlign: "center" }}>
          <motion.div
            className={keeping ? "card card-soft" : "card"}
            initial={ok ? (keeping ? { opacity: 0, y: -24, scale: 0.96 } : { opacity: 1, y: 0, scale: 1 }) : false}
            animate={ok ? (keeping ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: -110, rotate: -7, scale: 0.86 }) : { opacity: 1 }}
            transition={{ duration: ok ? 0.75 : 0.01, ease }}
            onAnimationComplete={() => onFinish(keeping)}
          >
            <span className="t-title">{keeping ? "Keeping this day close." : "Sending yesterday off."}</span>
            <p className="t-caption" style={{ margin: "8px 0 0" }}>{keeping ? "Your entry is settling into your shoebox." : "The day has passed. What you shared is gone."}</p>
          </motion.div>
        </div>
      </Screen>
    );
  }

  if (stage === "yesterday") {
    return (
      <Screen ground="g-default">
        <TopBar onBack={() => onFinish(false)} icon="close" />
        <div className="screen-body">
          <motion.div className="card" style={{ padding: 22 }} initial={ok ? { opacity: 0, y: 12 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}>
            <span className="t-eyebrow">Yesterday you wrote</span>
            <h1 className="t-title" style={{ margin: "10px 0 10px" }}>{post.title}</h1>
            <StoryText a={post.a} hinge={post.hinge} b={post.b} size="t-comment" />
          </motion.div>
          <motion.p className="t-story" style={{ margin: "26px 0 0", fontSize: 22 }} initial={ok ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.6 }}>
            Morning. People wrote back.
          </motion.p>
        </div>
        <div className="screen-foot">
          <button className="btn btn-primary" style={{ alignSelf: "center" }} onClick={() => setStage("response")}>See what people wrote</button>
          <button className="link center" onClick={() => onFinish(false)}>Not today</button>
        </div>
      </Screen>
    );
  }

  if (stage === "response") {
    const isFlagged = r.flagged && flagChoice !== "read";
    return (
      <Screen ground="g-default" key={`resp-${i}`}>
        <TopBar onBack={() => onFinish(false)} icon="close" title={<span className="t-title-sm">{post.title}</span>} right={<button className="link" onClick={() => setReporting(true)}>Report</button>} />
        <div className="screen-body" style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 20 }}>
          <AnimatePresence mode="wait">
            {hidden[i] ? (
              <motion.div key="hidden" className="card card-sunken" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="row muted" style={{ gap: 8 }}><EyeOff /> <span className="t-label">Response hidden</span></div>
                <p className="t-body" style={{ margin: "10px 0 0" }}>Thanks for telling us. This response is hidden for you in this preview.</p>
              </motion.div>
            ) : isFlagged ? (
              <motion.div key="flag" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="stack" style={{ gap: 14 }}>
                <div className="card card-sunken" style={{ filter: "blur(0px)" }}>
                  <div className="row muted" style={{ gap: 8, alignItems: "flex-start" }}>
                    <EyeOff />
                    <span className="t-body" style={{ fontSize: 15 }}>This one may be unkind. It got past our filter, but it might not be what you want to read today. You decide.</span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key={`r-${i}`} initial={ok ? { opacity: 0, y: 14 } : false} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease }}>
                <div className="row" style={{ gap: 10, marginBottom: 14, justifyContent: r.flagged ? "center" : "flex-start", flexDirection: r.flagged ? "column" : "row", textAlign: r.flagged ? "center" : "left" }}>
                  <Avatar initials={r.initials} size={30} />
                  <span className="t-byline">{r.flagged ? "Someone wrote" : `${r.name} wrote`}</span>
                </div>
                <p className="t-story" style={{ margin: 0, fontSize: 22, lineHeight: "33px" }}>
                  {r.flagged ? "Honestly you should have seen this coming. Presentations aren't hard." : r.text}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {!isFlagged && !hidden[i] && (
            <div className="reaction-options" role="group" aria-label="How the response landed" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 }}>
              <span className="t-caption" style={{ gridColumn: "1 / -1" }}>How did this land? Only you&apos;ll know.</span>
              {([
                { value: "Helped", label: "This helped" },
                { value: "Didn't land", label: "Not for me" },
                { value: "Unkind", label: "That stung" },
              ] as const).map(({ value, label }) => (
                <button
                  key={value}
                  className="option reaction-option"
                  style={{ minWidth: 0, minHeight: 58, justifyContent: "center", gap: 5, padding: "6px 4px", fontSize: 12, lineHeight: "15px" }}
                  aria-pressed={tags[i] === value}
                  onClick={() => {
                    setTags({ ...tags, [i]: value });
                    if (value === "Unkind") setTimeout(() => setHidden((h) => ({ ...h, [i]: true })), 350);
                  }}
                >
                  <span className="radio" /> {label}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="screen-foot">
          {isFlagged ? (
            <div className="row">
              <button className="btn btn-secondary grow" onClick={() => setFlagChoice("read")}>Read it</button>
              <button className="btn btn-primary grow" onClick={next}>Skip it</button>
            </div>
          ) : (
            <button className="btn btn-primary" style={{ alignSelf: "flex-end" }} onClick={next}>
              Next
            </button>
          )}
        </div>
        <AnimatePresence>
          {reporting && <ReportSheet target="response" onClose={() => setReporting(false)} onSubmit={() => setHidden((items) => ({ ...items, [i]: true }))} onNext={() => { setReporting(false); next(); }} onBreak={() => onFinish(false)} />}
        </AnimatePresence>
      </Screen>
    );
  }

  if (stage === "rose") {
    return (
      <Screen ground="g-reveal">
        <div className="screen-body" style={{ display: "grid", placeItems: "center", textAlign: "center" }}>
          <div>
            <div style={{ position: "relative", width: 140, height: 140, margin: "0 auto 26px" }}>
              {ok &&
                Array.from({ length: 8 }).map((_, k) => {
                  const ang = (k / 8) * Math.PI * 2;
                  return (
                    <motion.span
                      key={k}
                      style={{ position: "absolute", left: 66, top: 66, width: 7, height: 7, borderRadius: 4, background: "var(--turn-accent)" }}
                      initial={{ opacity: 0, x: 0, y: 0, scale: 0.4 }}
                      animate={{ opacity: [0, 1, 0.6], x: Math.cos(ang) * 62, y: Math.sin(ang) * 62, scale: 1 }}
                      transition={{ delay: 0.5, duration: 1.2, ease }}
                    />
                  );
                })}
              <motion.div
                className="turned"
                style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}
                initial={ok ? { scale: 0.4, opacity: 0, rotate: -12 } : false}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 180, damping: 14, delay: 0.15 }}
              >
                <Rose filled size={72} />
              </motion.div>
            </div>
            <motion.h1 className="t-title" style={{ margin: "0 0 10px" }} initial={ok ? { opacity: 0, y: 8 } : false} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.6, ease }}>
              Someone gave “{post.title}” their nod.
            </motion.h1>
            <motion.p className="t-body muted" style={{ margin: 0 }} initial={ok ? { opacity: 0 } : false} animate={{ opacity: 1 }} transition={{ delay: 1.3, duration: 0.6 }}>
              Out of everything they read yesterday, your entry resonated with them.
            </motion.p>
            <button className="btn btn-secondary" style={{ marginTop: 16 }} disabled={thanksSent} onClick={() => setThanksSent(true)}>{thanksSent ? "Thanks noted" : "Send thanks"}</button>
            <p className="t-caption" role="status" style={{ margin: "6px 0 0" }}>{thanksSent ? "Thanks noted in this preview. No message was sent." : "This preview won’t send a message."}</p>
          </div>
        </div>
        <div className="screen-foot">
          <button className="btn btn-primary" style={{ alignSelf: "center" }} onClick={() => setStage("keep")}>Continue</button>
        </div>
      </Screen>
    );
  }

  return (
    <Screen ground="g-default">
      <TopBar onBack={() => setStage("rose")} />
      <div className="screen-body entry-decision-body" style={{ justifyContent: "center" }}>
        <div className="entry-decision-content" style={{ width: "100%", maxWidth: "100%", margin: "auto", textAlign: "center" }}>
          <div className="card card-soft entry-preview">
            <span className="t-eyebrow">{dateLabel}</span>
            <h1 className="t-title-sm" style={{ margin: "8px 0" }}>{post.title}</h1>
            <StoryText a={post.a} hinge={post.hinge} b={post.b} size="t-comment" />
          </div>
          <h2 className="t-title" style={{ margin: "22px 0 8px" }}>Let it go, or keep it in your shoebox?</h2>
          <p className="t-body muted" style={{ margin: 0 }}>
            Most people send their stories off. If you keep this one, it goes in your shoebox, where only you can see it. The responses aren&apos;t kept either way.
          </p>
        </div>
      </div>
      <div className="screen-foot">
        <div className="row">
          <button className="btn btn-primary grow" onClick={() => setStage("release")}>Send it off</button>
          <button className="btn btn-secondary grow" onClick={() => setStage("preserve")}>Keep it in my shoebox</button>
        </div>
      </div>
    </Screen>
  );
}
