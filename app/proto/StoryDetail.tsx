"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Comment, Story } from "./data";
import { isUnkind } from "./data";
import ReportSheet from "./ReportSheet";
import RoseTakeover from "./RoseTakeover";
import { Avatar, Rose, Screen, Sheet, StoryText, TopBar, ease, useMotionSafe } from "./ui";

type Category = "turned" | "vent" | "good";

export default function StoryDetail({
  story,
  category,
  profileName,
  profileInitials,
  roseGiven,
  onGiveRose,
  onBack,
  onNext,
  onBreak,
  comments,
  commentsLocked = false,
  onAddComment,
  onReport,
  validateComment,
  nextLabel = "Next",
  nextDisabled = false,
  nextHint,
  progressLabel,
}: {
  story: Story;
  category: Category;
  profileName: string;
  profileInitials: string;
  roseGiven: boolean;
  onGiveRose: () => void;
  onBack: () => void;
  onNext: () => void;
  onBreak: () => void;
  comments: Comment[];
  commentsLocked?: boolean;
  onAddComment: (comment: Comment) => void;
  onReport: () => void;
  validateComment?: (text: string) => string | null;
  nextLabel?: string;
  nextDisabled?: boolean;
  nextHint?: string;
  progressLabel?: string;
}) {
  const ok = useMotionSafe();
  const commentsRef = useRef<HTMLDivElement>(null);
  const [sheet, setSheet] = useState<null | "options" | "rose" | "write" | "report">(null);
  const [draft, setDraft] = useState("");
  const [warning, setWarning] = useState("");
  const [showRoseAnimation, setShowRoseAnimation] = useState(false);
  const ground = category === "turned" ? "g-turned" : category === "vent" ? "g-vent" : "g-good";
  const label = category === "turned" ? "Clearing up" : category === "vent" ? "Rainy day" : "Little win";

  const submit = () => {
    const text = draft.trim();
    if (!text) return;
    const validationMessage = validateComment?.(text) ?? (isUnkind(text) ? "Try writing back to how they felt, not what they should have done." : null);
    if (validationMessage) {
      setWarning(validationMessage);
      return;
    }
    onAddComment({ name: profileName, initials: profileInitials, text });
    setDraft("");
    setWarning("");
    setSheet(null);
    requestAnimationFrame(() => commentsRef.current?.scrollIntoView({ behavior: ok ? "smooth" : "auto", block: "nearest" }));
  };

  return (
    <Screen ground={ground}>
      <TopBar onBack={onBack} />
      <div className="screen-body story-detail-body">
        {progressLabel && <span className="t-eyebrow" style={{ marginBottom: 12 }}>{progressLabel}</span>}
        <article className={`card card-soft story-detail-card story-${category}`} style={{ padding: 20, background: category === "vent" ? "var(--ground-vent)" : category === "good" ? "var(--ground-good)" : "var(--surface-default)" }}>
          <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", rowGap: 8, marginBottom: 16 }}>
            <div className="row" style={{ gap: 10 }}>
              <Avatar initials={story.initials} size={30} />
              <div className="stack"><span className="t-byline">{story.name}</span><span className="t-caption">earlier today</span></div>
            </div>
            <div className="row" style={{ gap: 4, justifyContent: "flex-end", minWidth: 0, marginLeft: "auto" }}>
              <span className="t-eyebrow" style={{ textAlign: "right" }}>{label}</span>
              <button className="iconbtn" style={{ marginLeft: 0, flex: "0 0 40px" }} aria-label="Story options" onClick={() => setSheet("options")}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.6" /><circle cx="12" cy="12" r="1.6" /><circle cx="19" cy="12" r="1.6" /></svg>
              </button>
            </div>
          </div>
          <h1 className="t-title" style={{ margin: "0 0 12px" }}>{story.title}</h1>
          <StoryText a={story.a} hinge={story.hinge} b={story.b} />
        </article>

        <div className="row story-actions" aria-label="Story actions" style={{ minHeight: 56, gap: 12, padding: "8px 0", borderBottom: "1px solid var(--line-hairline)" }}>
          <button
            className="rose-action"
            style={{ appearance: "none", width: 44, height: 44, flex: "0 0 44px", display: "grid", placeItems: "center", padding: 0, border: `1.5px solid ${roseGiven ? "var(--line-hairline)" : "var(--turn-accent)"}`, borderRadius: "50%", background: roseGiven ? "var(--surface-sunken)" : "var(--turn-wash)", color: roseGiven ? "var(--text-muted)" : "var(--turn-accent)", cursor: roseGiven ? "default" : "pointer" }}
            aria-label={roseGiven ? "You have given today's nod" : "Give a nod"}
            title={roseGiven ? "You have given today's nod" : "Give a nod"}
            disabled={roseGiven}
            onClick={() => setSheet("rose")}
          ><Rose filled={roseGiven} /></button>
          <button className="story-comment-jump" style={{ appearance: "none", minHeight: 44, display: "inline-flex", alignItems: "center", gap: 7, padding: "0 10px", border: 0, borderRadius: 8, background: "transparent", color: "var(--text-ink)", font: "inherit", fontWeight: 700, cursor: "pointer" }} onClick={() => commentsRef.current?.scrollIntoView({ behavior: ok ? "smooth" : "auto", block: "start" })}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 11.5a7.5 7.5 0 01-7.5 7.5 8 8 0 01-4-.9L4 20l1.5-3.5a7.5 7.5 0 117-5z" /></svg>
            Comments
          </button>
          {roseGiven && <span className="t-caption">You gave today’s nod</span>}
        </div>

        <section ref={commentsRef} className="story-comments" aria-label="Comments" style={{ display: "grid", gap: 10, padding: "16px 0 24px", scrollMarginTop: 12 }}>
          <h2 className="t-title-sm" style={{ margin: "0 0 12px" }}>Comments</h2>
          <AnimatePresence initial={false}>
            {comments.map((comment, index) => (
              <motion.article
                key={`${comment.name}-${comment.text}`}
                className="card story-comment-card"
                style={{ padding: 14 }}
                initial={ok ? { opacity: 0, y: 12 } : false}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.2), ease }}
              >
                <div className="row" style={{ gap: 8, marginBottom: 8 }}><Avatar initials={comment.initials} size={22} /><span className="t-byline" style={{ fontSize: 13 }}>{comment.name}</span></div>
                <p className="t-comment" style={{ margin: 0 }}>{comment.text}</p>
              </motion.article>
            ))}
          </AnimatePresence>
          {commentsLocked ? (
            <p className="t-caption">Write back to see the comments.</p>
          ) : comments.length === 0 ? (
            <p className="t-caption">Nobody wrote back this time. You still said it out loud, and that was the point.</p>
          ) : null}
        </section>
        <div style={{ height: 12 }} />
      </div>
      {showRoseAnimation && <RoseTakeover mood={category} />}
      <div className="screen-foot">
        {nextHint && <span className="t-caption" style={{ textAlign: "center" }}>{nextHint}</span>}
        <div className="row">
          <button className="btn btn-secondary grow" onClick={() => setSheet("write")}>Write back</button>
          <button className="btn btn-primary grow" disabled={nextDisabled} onClick={onNext}>{nextLabel}</button>
        </div>
      </div>

      <AnimatePresence>
        {sheet === "options" && (
          <Sheet key="options" label="Story options" onClose={() => setSheet(null)}>
            <span className="t-title">Story options</span>
            <button className="listrow" onClick={() => setSheet("report")}>Report this story</button>
            <button className="listrow" onClick={onBreak}>I need a break</button>
          </Sheet>
        )}
        {sheet === "rose" && (
            <Sheet key="rose" label="Give your nod" onClose={() => setSheet(null)}>
            <div className="sheet-centered" style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 16, textAlign: "center" }}>
              <span className="t-title">Give your nod today to this story?</span>
              <span className="t-caption">You get one nod a day. They’ll see it tomorrow, with no name attached.</span>
              <button className="btn btn-accent" onClick={() => { onGiveRose(); setShowRoseAnimation(true); setSheet(null); }}><Rose filled /> Give a nod</button>
              <button className="link center" onClick={() => setSheet(null)}>Save it for another story</button>
            </div>
          </Sheet>
        )}
        {sheet === "write" && (
          <Sheet key="write" label={`Write back to ${story.name}`} onClose={() => setSheet(null)}>
            <span className="t-byline">Write back to {story.name}</span>
            <textarea className="textarea-box" aria-label={`Your comment for ${story.name}`} value={draft} onChange={(event) => { setDraft(event.target.value); setWarning(""); }} placeholder="Talk to the person, not just the problem." />
            {warning && <p className="t-caption" role="alert">{warning}</p>}
            <div className="row" style={{ justifyContent: "space-between" }}>
              <button className="link" onClick={() => setSheet(null)}>Not now</button>
              <button className="btn btn-primary" disabled={!draft.trim()} onClick={submit}>Send</button>
            </div>
          </Sheet>
        )}
        {sheet === "report" && (
          <ReportSheet target="story" onClose={() => setSheet(null)} onSubmit={onReport} onNext={() => { setSheet(null); onNext(); }} onBreak={onBreak} />
        )}
      </AnimatePresence>
    </Screen>
  );
}
