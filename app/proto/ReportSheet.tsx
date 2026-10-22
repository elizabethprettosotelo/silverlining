"use client";

import { useState } from "react";
import { Sheet } from "./ui";

const REASONS = [
  ["Someone may be in danger", "If there’s immediate danger, contact emergency services."],
  ["It’s cruel or hateful", "Hidden for you now."],
  ["It identifies a real person", "Use this for identifying or private information."],
  ["It’s in the wrong place", "Like a vent shared as a good day."],
];

export default function ReportSheet({
  target,
  onClose,
  onSubmit,
  onNext,
  onBreak,
}: {
  target: string;
  onClose: () => void;
  onSubmit: () => void;
  onNext: () => void;
  onBreak: () => void;
}) {
  const [reason, setReason] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  return (
    <Sheet label={submitted ? "Report received" : `Report ${target}`} onClose={onClose}>
      {submitted ? (
        <>
          <span className="t-title">Thanks. It’s hidden for you now.</span>
          <p className="t-caption" style={{ margin: 0 }}>This preview hides the item for you only. Nothing is sent to or reviewed by a team.</p>
          <button className="btn btn-primary btn-full" onClick={onNext}>Next story</button>
          <button className="link" onClick={onBreak}>I need a break</button>
        </>
      ) : (
        <>
          <span className="t-title">What’s wrong with this {target}?</span>
          <div className="stack" style={{ gap: 8 }} role="group" aria-label="Report reason">
            {REASONS.map(([label, detail], index) => (
              <button key={label} className="option" aria-pressed={reason === index} onClick={() => setReason(index)}>
                <span className="radio" />
                <span className="stack" style={{ gap: 2 }}><span>{label}</span><span className="t-caption" style={{ fontWeight: 400 }}>{detail}</span></span>
              </button>
            ))}
          </div>
          <p className="t-caption" style={{ margin: 0 }}>Reports are not sent to or reviewed by a team in this preview.</p>
          <button className="btn btn-primary btn-full" disabled={reason === null} onClick={() => { onSubmit(); setSubmitted(true); }}>Submit report</button>
          <button className="link" onClick={onClose}>Cancel</button>
        </>
      )}
    </Sheet>
  );
}