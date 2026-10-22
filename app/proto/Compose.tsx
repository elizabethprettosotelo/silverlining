"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { HINGES, PROMPTS, SAMPLE, findName, hasCrisis, hasSlur, redact } from "./data";
import { Author, Hand, Screen, Sheet, StoryText, TopBar, ease, useMotionSafe } from "./ui";
import type { UserProfile } from "./Onboarding";

export type Post = {
  title: string;
  a: string;
  hinge?: string;
  b?: string;
  kind: "turned" | "vent" | "good";
};

type Phase = "write" | "hinge";
type SheetKind = null | "class" | "name" | "blocked";

const MIN_CHARS = 80;

export default function Compose({
  dateLabel,
  profile,
  onBack,
  onPosted,
  demoSignal,
}: {
  dateLabel: string;
  profile: UserProfile;
  onBack: () => void;
  onPosted: (p: Post) => void;
  demoSignal: number;
}) {
  const ok = useMotionSafe();
  const [promptIdx, setPromptIdx] = useState(0);
  const [title, setTitle] = useState("");
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [hingeIdx, setHingeIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("write");
  const [sheet, setSheet] = useState<SheetKind>(null);
  const [crisis, setCrisis] = useState(false);
  const [titleNudge, setTitleNudge] = useState(false);
  const [pendingKind, setPendingKind] = useState<Post["kind"]>("turned");
  const [nameFound, setNameFound] = useState<string | null>(null);

  const titleRef = useRef<HTMLInputElement>(null);
  const aRef = useRef<HTMLTextAreaElement>(null);
  const bRef = useRef<HTMLTextAreaElement>(null);
  const hingeRef = useRef<HTMLSpanElement>(null);
  const [indent, setIndent] = useState(0);

  const hinge = HINGES[hingeIdx];
  const progress = Math.min(1, a.trim().length / MIN_CHARS);
  const canDone = a.trim().length >= MIN_CHARS;

  // Auto-grow textareas.
  const grow = (el: HTMLTextAreaElement | null) => {
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  };
  useLayoutEffect(() => grow(aRef.current), [a]);
  useLayoutEffect(() => grow(bRef.current), [b, indent]);

  // The 1b textarea starts right after the hinge word, on the same line.
  useLayoutEffect(() => {
    if (hingeRef.current) setIndent(hingeRef.current.offsetWidth + 6);
  }, [hinge, phase]);

  /* Demo typewriter, triggered from the side panel. */
  const typing = useRef(false);
  useEffect(() => {
    if (!demoSignal || typing.current) return;
    typing.current = true;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const type = (text: string, set: (s: string) => void, start: number, speed: number) => {
      for (let i = 1; i <= text.length; i++) {
        timers.push(setTimeout(() => set(text.slice(0, i)), start + i * speed));
      }
      return start + text.length * speed;
    };
    let end = 0;
    if (phase === "write") {
      end = type(SAMPLE.title, setTitle, 0, 55);
      end = type(SAMPLE.a, setA, end + 400, 18);
    } else {
      end = type(SAMPLE.b, setB, 200, 30);
    }
    timers.push(setTimeout(() => (typing.current = false), end + 50));
    return () => {
      timers.forEach(clearTimeout);
      typing.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demoSignal]);

  const onDone = () => {
    if (!canDone) return;
    // Crisis language: no hinge is ever offered. Go straight to care.
    if (hasCrisis(`${title} ${a}`)) {
      setCrisis(true);
      return;
    }
    setPhase("hinge");
    setTimeout(() => bRef.current?.focus(), ok ? 450 : 0);
  };

  const finish = (kind: Post["kind"], skipNameCheck = false) => {
    const full = `${title} ${a} ${kind === "turned" ? b : ""}`;
    if (!title.trim()) {
      setSheet(null);
      setTitleNudge(true);
      titleRef.current?.focus();
      return;
    }
    if (hasSlur(full)) {
      setSheet("blocked");
      return;
    }
    if (!skipNameCheck) {
      const n = findName(full);
      if (n) {
        setPendingKind(kind);
        setNameFound(n);
        setSheet("name");
        return;
      }
    }
    post(kind, null);
  };

  const post = (kind: Post["kind"], hideName: string | null) => {
    const clean = (t: string) => (hideName ? redact(t, hideName) : t);
    onPosted({
      title: clean(title.trim()),
      a: clean(a.trim()),
      hinge: kind === "turned" ? hinge : undefined,
      b: kind === "turned" ? clean(b.trim()) : undefined,
      kind,
    });
  };

  if (crisis) {
    return (
      <Crisis
        onShare={() => {
          setCrisis(false);
          post("vent", null);
        }}
        onNotNow={onBack}
        onBack={() => setCrisis(false)}
      />
    );
  }

  return (
    <Screen ground="g-default">
      <TopBar
        onBack={onBack}
        title={<span className="t-eyebrow">{dateLabel} · until midnight</span>}
      />
      <div className="screen-body" style={{ paddingTop: 4 }}>
        <div style={{ marginBottom: 18 }}>
          <Author name={profile.name} initials={profile.initials} size={26} />
        </div>

        <motion.div layout="position" style={{ marginBottom: 18 }}>
          {a.length === 0 && phase === "write" ? (
            <div className="row" style={{ gap: 12, alignItems: "flex-start" }}>
              <span className="t-comment muted grow" style={{ fontStyle: "italic" }}>
                {PROMPTS[promptIdx]}
              </span>
              <button className="iconbtn" style={{ marginLeft: 0, flex: "0 0 44px" }} aria-label="Different question" title="Different question" onClick={() => setPromptIdx((index) => (index + 1) % PROMPTS.length)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 7v5h-5M4 17v-5h5" /><path d="M5.5 9a7 7 0 0112-2L20 9M4 15l2.5 2a7 7 0 0012-2" /></svg>
              </button>
            </div>
          ) : (
            <span className="t-story muted" style={{ fontSize: 17, lineHeight: "25px", fontStyle: "italic" }}>
              {PROMPTS[promptIdx]}
            </span>
          )}
        </motion.div>

        <div className={`title-field ${title ? "filled" : ""} ${titleNudge && !title ? "nudge" : ""}`}>
          <input
            ref={titleRef}
            className="field t-title"
            value={title}
            maxLength={60}
            onChange={(e) => {
              setTitle(e.target.value);
              setTitleNudge(false);
            }}
            placeholder={titleNudge ? "Give it a name" : "Title"}
            aria-label="Title"
          />
        </div>
        <AnimatePresence>
          {titleNudge && !title && (
            <motion.p
              className="t-caption"
              style={{ margin: "8px 0 0", color: "var(--turn-accent)" }}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              Every story gets a name before it goes out. A few words is enough.
            </motion.p>
          )}
        </AnimatePresence>

        <textarea
          ref={aRef}
          className="field t-story"
          style={{ marginTop: 16, overflow: "hidden" }}
          rows={3}
          value={a}
          onChange={(e) => setA(e.target.value)}
          placeholder="Start anywhere."
          aria-label="Your story"
          readOnly={phase !== "write"}
        />

        {/* The hinge: same box, one more line. */}
        <AnimatePresence>
          {phase === "hinge" && (
            <motion.div
              key="hinge"
              initial={ok ? { opacity: 0, height: 0 } : { opacity: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.5, ease }}
              style={{ overflow: "hidden" }}
            >
              <div style={{ position: "relative", marginTop: 14 }}>
                <motion.span
                  ref={hingeRef}
                  className="t-story hinge"
                  role="button"
                  tabIndex={0}
                  title="Change the flip side"
                  onClick={() => setHingeIdx((hingeIdx + 1) % HINGES.length)}
                  onKeyDown={(e) => e.key === "Enter" && setHingeIdx((hingeIdx + 1) % HINGES.length)}
                  style={{ position: "absolute", left: 0, top: 0, cursor: "pointer", whiteSpace: "nowrap" }}
                  key={hinge}
                  initial={ok ? { opacity: 0, filter: "blur(6px)", y: 4 } : { opacity: 0 }}
                  animate={{ opacity: b ? 1 : 0.55, filter: "blur(0px)", y: 0 }}
                  transition={{ duration: 0.55, delay: 0.15, ease }}
                >
                  {hinge}
                </motion.span>
                <textarea
                  ref={bRef}
                  className="field t-story"
                  style={{ textIndent: indent, color: "var(--turn-accent)", overflow: "hidden" }}
                  rows={2}
                  value={b}
                  onChange={(e) => setB(e.target.value)}
                  aria-label={`Continue on the flip side after ${hinge}`}
                />
              </div>

              <AnimatePresence mode="wait">
                {!b ? (
                  <motion.div
                    key="chips"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{ marginTop: 18 }}
                  >
                    <span className="t-eyebrow">Add a flip side</span>
                    <div className="row" style={{ flexWrap: "wrap", gap: 8, marginTop: 10 }}>
                      {HINGES.map((h, i) => (
                        <motion.button
                          key={h}
                          className="chip"
                          aria-pressed={i === hingeIdx}
                          onClick={() => {
                            setHingeIdx(i);
                            bRef.current?.focus();
                          }}
                          initial={ok ? { opacity: 0, y: 6 } : false}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 + i * 0.05, duration: 0.3, ease }}
                        >
                          {h}
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <motion.p
                    key="tip"
                    className="t-caption"
                    style={{ marginTop: 14 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    Tap “{hinge}” to change the flip side
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
        <div style={{ height: 24 }} />
      </div>

      <div className="screen-foot">
        {phase === "write" ? (
          <>
            <div className="row" style={{ gap: 12, marginBottom: 4 }}>
              <div
                className="progress grow"
                role="progressbar"
                aria-label="Minimum story length"
                aria-valuemin={0}
                aria-valuemax={MIN_CHARS}
                aria-valuenow={Math.min(a.trim().length, MIN_CHARS)}
                aria-valuetext={`${Math.min(a.trim().length, MIN_CHARS)} of ${MIN_CHARS} characters`}
              >
                <motion.div animate={{ width: `${Math.max(4, progress * 100)}%` }} transition={{ duration: 0.3, ease }} />
              </div>
            </div>
            <span className="t-caption">{canDone ? "Tap Done when you've said it" : "Keep going, there's no rush"}</span>
            <button className="btn btn-primary btn-full" disabled={!canDone} onClick={onDone}>
              Done
            </button>
          </>
        ) : (
          <div className="row">
            <button className="btn btn-secondary grow" onClick={() => setSheet("class")}>
              Leave it as is
            </button>
            <button className="btn btn-primary grow" disabled={!b.trim()} onClick={() => finish("turned")}>
              Send it off
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {sheet === "class" && (
          <Sheet key="class" label="How was today" onClose={() => setSheet(null)}>
            <div className="stack" style={{ gap: 6 }}>
              <span className="t-title">How was today, overall?</span>
              <span className="t-caption">So your story reaches people who are ready for it.</span>
            </div>
            <div className="stack" style={{ gap: 10 }}>
              <button className="card category-choice category-good" style={{ width: "100%", textAlign: "left", cursor: "pointer", background: "var(--ground-good)" }} onClick={() => finish("good")}>
                <span className="t-title-sm" style={{ display: "block" }}>A little win</span>
                <span className="t-caption" style={{ display: "block", marginTop: 6 }}>Shared with the little wins.</span>
              </button>
              <button className="card category-choice category-vent" style={{ width: "100%", textAlign: "left", cursor: "pointer", background: "var(--ground-vent)" }} onClick={() => finish("vent")}>
                <span className="t-title-sm" style={{ display: "block" }}>A rainy day</span>
                <span className="t-caption" style={{ display: "block", marginTop: 6 }}>
                  Shared with rainy days. Readers write back with care.
                </span>
              </button>
            </div>
            <button className="link center" onClick={() => setSheet(null)}>Back to story</button>
          </Sheet>
        )}

        {sheet === "name" && nameFound && (
          <Sheet key="name" label="We hid a name" onClose={() => setSheet(null)}>
            <span className="t-eyebrow">How readers will see it</span>
            <div className="card" style={{ maxHeight: 260, overflow: "auto" }}>
              <div className="t-title-sm" style={{ marginBottom: 8 }}>{redact(title, nameFound)}</div>
              <StoryText
                size="t-comment"
                a={redact(a, nameFound)}
                hinge={pendingKind === "turned" ? hinge : undefined}
                b={pendingKind === "turned" ? redact(b, nameFound) : undefined}
              />
            </div>
            <div className="banner banner-notice">
              <span aria-hidden>●</span>
              <span>
                <b>We hid a name.</b> So nobody in your story can be recognized, “{nameFound}” will show as “someone.”
              </span>
            </div>
            <button className="btn btn-primary btn-full" onClick={() => post(pendingKind, nameFound)}>
              Looks good, let it go
            </button>
            <button className="link" onClick={() => post(pendingKind, null)}>Keep the first name</button>
          </Sheet>
        )}

        {sheet === "blocked" && (
          <Sheet key="blocked" label="Can't post this" onClose={() => setSheet(null)}>
            <span className="t-title">Anger is fine here. Slurs aren&apos;t.</span>
            <div className="banner banner-blocked">
              Change the highlighted part and you can keep going. Everything else you wrote can stay exactly as it is.
            </div>
            <button className="btn btn-primary btn-full" onClick={() => setSheet(null)}>Edit my story</button>
            <button className="link">What&apos;s allowed here</button>
          </Sheet>
        )}
      </AnimatePresence>
    </Screen>
  );
}

/* PO-08: no warning colors, help first, posting never taken away. */
function Crisis({ onShare, onNotNow, onBack }: { onShare: () => void; onNotNow: () => void; onBack: () => void }) {
  return (
    <Screen ground="g-default">
      <TopBar onBack={onBack} />
      <div className="screen-body">
        <div className="card" style={{ background: "var(--care-bg)", boxShadow: "none", color: "var(--care-ink)", padding: 22 }}>
          <Hand />
          <h1 className="t-title" style={{ margin: "14px 0 8px" }}>That sounds like a lot to carry today.</h1>
          <p className="t-body" style={{ margin: 0 }}>
            Do you want to talk to someone right now? Your story is saved, and you can still share it after.
          </p>
          <div className="stack" style={{ gap: 10, marginTop: 18 }}>
            <a className="btn btn-care btn-full" href="tel:988">Call or text 988</a>
            <a className="btn btn-care-outline btn-full" href="sms:741741&body=HOME">Text HOME to 741741</a>
          </div>
          <p className="t-caption" style={{ margin: "12px 0 0", color: "var(--care-ink)" }}>
            Suicide &amp; Crisis Lifeline. Free, any time.
          </p>
        </div>
        <div className="stack" style={{ gap: 6, marginTop: 28 }}>
          <button className="t-title-sm" style={{ textAlign: "left", background: "none", border: 0, padding: 0, color: "inherit", cursor: "pointer" }} onClick={onShare}>
            Share my story anyway
          </button>
          <span className="t-caption">Someone on our team will read it first, before others see it.</span>
        </div>
      </div>
      <div className="screen-foot">
        <button className="link center" onClick={onNotNow}>Not right now</button>
      </div>
    </Screen>
  );
}
