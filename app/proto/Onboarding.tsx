"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Avatar, BookOpen, Moon, Pen, Screen, Sheet, Sun, TopBar, ease, useMotionSafe } from "./ui";
import LandingArt from "./LandingArt";

export type UserProfile = {
  name: string;
  initials: string;
  contact: string;
  notifications: boolean;
};

const WRITERS = [
  { name: "Jane Austen", initials: "JA" },
  { name: "James Baldwin", initials: "JB" },
  { name: "Mary Shelley", initials: "MS" },
  { name: "Langston Hughes", initials: "LH" },
  { name: "Emily Dickinson", initials: "ED" },
  { name: "William Shakespeare", initials: "WS" },
  { name: "Zora Neale Hurston", initials: "ZH" },
  { name: "Oscar Wilde", initials: "OW" },
  { name: "Charles Dickens", initials: "CD" },
];

const SUGGESTIONS = ["lanternhours", "sparrowkept", "mildweather"];

export function isValidPenName(value: string) {
  const compact = value.toLowerCase().replace(/[^a-z0-9]/g, "");
  const authorNames = WRITERS.map((writer) => writer.name.toLowerCase().replace(/[^a-z0-9]/g, ""));
  return /^[a-z0-9_]{3,20}$/i.test(value.trim()) && !authorNames.includes(compact);
}

export default function Onboarding({ onComplete }: { onComplete: (profile: UserProfile) => void }) {
  const ok = useMotionSafe();
  const [step, setStep] = useState(0);
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [year, setYear] = useState("");
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [contact, setContact] = useState("");
  const [code, setCode] = useState("");
  const [penName, setPenName] = useState("quietharbor");
  const [writerIndex, setWriterIndex] = useState(0);
  const [agreements, setAgreements] = useState([false, false, false]);
  const [notice, setNotice] = useState("");
  const [showRules, setShowRules] = useState(false);
  const [flying, setFlying] = useState(false);

  const numericYear = Number(year);
  const numericMonth = Number(month);
  const numericDay = Number(day);
  const leapYear = numericYear % 4 === 0 && (numericYear % 100 !== 0 || numericYear % 400 === 0);
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][numericMonth - 1] ?? 0;
  const dateIsValid = /^\d{4}$/.test(year) && numericMonth >= 1 && numericMonth <= 12 && numericDay >= 1 && numericDay <= daysInMonth;
  const contactIsValid = method === "email"
    ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.trim())
    : contact.replace(/\D/g, "").length >= 10;
  const penNameIsValid = isValidPenName(penName);

  const next = () => {
    setNotice("");
    if (step === 1) {
      if (!dateIsValid) {
        setNotice("Enter a valid birth date to continue.");
        return;
      }
      const now = new Date();
      const age = now.getFullYear() - numericYear -
        (now.getMonth() < numericMonth - 1 || (now.getMonth() === numericMonth - 1 && now.getDate() < numericDay) ? 1 : 0);
      if (age < 18) {
        setNotice("You need to be 18 or older to use Silver Lining.");
        return;
      }
    }
    if (step === 2 && !contactIsValid) {
      setNotice(method === "email" ? "Enter a valid email address." : "Enter a valid phone number.");
      return;
    }
    if (step === 3 && !/^\d{6}$/.test(code)) {
      setNotice("Enter six digits to continue the preview.");
      return;
    }
    if (step === 4 && !penNameIsValid) {
      setNotice(/^[a-z0-9_]{3,20}$/i.test(penName.trim()) ? "That’s a real author’s name. Choose another." : "Use 3–20 letters, numbers, or underscores.");
      return;
    }
    if (step === 10 && !agreements.every(Boolean)) return;
    if (step < 12) {
      setStep(step + 1);
      return;
    }
    const selected = WRITERS[writerIndex];
    onComplete({ name: penName.trim(), initials: selected.initials, contact: contact.trim(), notifications: notice === "notifications-on" });
  };

  const back = () => {
    setNotice("");
    setStep((current) => Math.max(0, current - 1));
  };

  const heading = [
    "A title for your day",
    "When were you born?",
    "Make your account",
    "Check your contact",
    "Every story here has an author. What should yours be called?",
    "Pick a writer to stand in for you",
    "This is how your stories will look",
    "People will read you. Nobody can follow you.",
    "Your day might look something like these",
    "How a day works",
    "Before you read anyone else’s day",
    "If things ever get heavy",
    "One notification a day. That’s it.",
  ][step];

  return (
    <Screen ground="g-default">
      {step === 0 && <LandingArt flying={flying} />}
      {step > 0 && <TopBar onBack={back} />}
      <div className="screen-body" style={{ paddingTop: step === 0 ? 440 : 10, position: step === 0 ? "relative" : undefined, zIndex: step === 0 ? 1 : undefined }}>
        {step > 0 && (
          <div className="onboarding-progress" role="progressbar" aria-label="Account setup progress" aria-valuemin={1} aria-valuemax={12} aria-valuenow={step} aria-valuetext="Account setup progress" style={{ height: 4, margin: "2px 0 18px", overflow: "hidden", borderRadius: 2, background: "var(--line-hairline)" }}>
            <motion.div style={{ height: "100%", borderRadius: 2, background: "var(--turn-accent)" }} animate={{ width: `${(step / 12) * 100}%` }} transition={{ duration: ok ? 0.25 : 0.01, ease }} />
          </div>
        )}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={ok ? { opacity: 0, y: 8 } : false}
            animate={{ opacity: 1, y: 0 }}
            exit={ok ? { opacity: 0, y: -6 } : { opacity: 0 }}
            transition={{ duration: ok ? 0.22 : 0.01, ease }}
          >
        {step === 0 ? (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span className="t-eyebrow">silver lining</span>
            <h1 className="t-display" style={{ margin: "12px 0" }}>{heading}</h1>
            <p className="t-story hinge" style={{ margin: 0 }}>And still…</p>
            <p className="t-caption" style={{ marginTop: 22 }}>One story a day about your day. Read a few others. Stories disappear at midnight unless you keep them in your shoebox.</p>
            <div className="stack" style={{ gap: 8, marginTop: 40 }}>
              <button
                className="btn btn-primary btn-full"
                onClick={() => {
                  if (flying) return;
                  // let the crow fly off, then move on
                  setFlying(true);
                  setTimeout(() => {
                    setStep(1);
                    setFlying(false);
                  }, ok ? 2300 : 300);
                }}
              >
                Get started
              </button>
              <button className="link center" onClick={() => setNotice("Sign-in is not connected in this preview.")}>I already have an account</button>
              {notice && <p className="t-caption" role="status" style={{ textAlign: "center" }}>{notice}</p>}
            </div>
          </div>
        ) : (
          <>
            <h1 className="t-title" style={{ margin: "8px 0 12px" }}>{heading}</h1>
            {step === 1 && (
              <>
                <p className="t-caption">This app is for people 18 and older. Your birthday is never shown to anyone.</p>
                <div className="row" style={{ alignItems: "flex-start", gap: 8 }}>
                  {[
                    { label: "Month", value: month, set: setMonth, max: 2, placeholder: "MM" },
                    { label: "Day", value: day, set: setDay, max: 2, placeholder: "DD" },
                    { label: "Year", value: year, set: setYear, max: 4, placeholder: "YYYY" },
                  ].map((field) => (
                    <label key={field.label} className="stack grow" style={{ gap: 5 }}>
                      <span className="t-byline">{field.label}</span>
                      <input className="textarea-box" style={{ minHeight: 48, padding: "10px 12px" }} inputMode="numeric" aria-label={field.label} value={field.value} maxLength={field.max} placeholder={field.placeholder} onChange={(event) => field.set(event.target.value.replace(/\D/g, ""))} />
                    </label>
                  ))}
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <p className="t-caption">We need an email or phone number so people who know the real you can get this account back. Nobody else ever sees it.</p>
                <label className="stack" style={{ gap: 6, margin: "16px 0" }}>
                  <span className="t-byline">Contact method</span>
                  <select className="textarea-box" style={{ minHeight: 48, padding: "10px 12px" }} aria-label="Contact method" value={method} onChange={(event) => { setMethod(event.target.value as "email" | "phone"); setContact(""); }}>
                    <option value="email">Email</option>
                    <option value="phone">Phone</option>
                  </select>
                </label>
                <label className="stack" style={{ gap: 6 }}>
                  <span className="t-byline">{method === "email" ? "Email" : "Phone"}</span>
                  <input className="textarea-box" style={{ minHeight: 48, padding: "10px 12px" }} type={method === "email" ? "email" : "tel"} autoComplete={method === "email" ? "email" : "tel"} aria-label={method === "email" ? "Email address" : "Phone number"} value={contact} onChange={(event) => setContact(event.target.value)} placeholder={method === "email" ? "name@example.com" : "(555) 555-0100"} />
                </label>
                <p className="t-caption">Contact details stay private. Verification is not connected in this preview.</p>
              </>
            )}
            {step === 3 && (
              <>
                <p className="t-caption">Code delivery is not connected in this preview. Enter any six digits to continue.</p>
                <label className="stack" style={{ gap: 6 }}>
                  <span className="t-byline">Six-digit code</span>
                  <input className="textarea-box" style={{ minHeight: 48, padding: "10px 12px" }} inputMode="numeric" autoComplete="one-time-code" aria-label="Six-digit code" value={code} maxLength={6} onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} />
                </label>
              </>
            )}
            {step === 4 && (
              <>
                <p className="t-caption">Shown on your stories and comments. It can’t be a real author’s name, and you can change it every 30 days.</p>
                <label className="stack" style={{ gap: 6 }}>
                  <span className="t-byline">Pen name</span>
                  <input className="textarea-box" style={{ minHeight: 48, padding: "10px 12px" }} autoComplete="nickname" aria-label="Pen name" value={penName} maxLength={20} onChange={(event) => setPenName(event.target.value.replace(/\s/g, ""))} />
                </label>
                <span className="t-caption" role="status">{penNameIsValid ? "✓ Available in this preview" : /^[a-z0-9_]{3,20}$/i.test(penName.trim()) ? "That’s a real author’s name. Choose another." : "Use 3–20 letters, numbers, or underscores."}</span>
                <span className="t-eyebrow" style={{ display: "block", marginTop: 20 }}>Need ideas?</span>
                <div className="row" style={{ flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                  {SUGGESTIONS.map((name) => <button key={name} className="chip" onClick={() => setPenName(name)}>{name}</button>)}
                </div>
              </>
            )}
            {step === 5 && (
              <>
                <p className="t-caption">Lots of people share each portrait, so it never points to you.</p>
                <div className="writer-grid" role="group" aria-label="Choose a writer portrait" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "10px 6px", marginTop: 16 }}>
                  {WRITERS.map((writer, index) => (
                    <button key={writer.initials} className="writer-option" aria-pressed={writerIndex === index} style={{ minWidth: 0, minHeight: 96, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, padding: "6px 3px", border: `1.5px solid ${writerIndex === index ? "var(--turn-accent)" : "transparent"}`, borderRadius: 12, background: writerIndex === index ? "var(--turn-wash)" : "transparent", color: "var(--text-ink)", cursor: "pointer" }} onClick={() => setWriterIndex(index)}>
                      <Avatar initials={writer.initials} size={54} />
                      <span className="t-caption" style={{ textAlign: "center", lineHeight: "15px" }}>{writer.name}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
            {step === 6 && (
              <>
                <div className="card card-soft" style={{ marginTop: 20 }}>
                  <span className="t-eyebrow">Preview</span>
                  <h2 className="t-title-sm" style={{ margin: "12px 0 8px" }}>The title you give your day</h2>
                  <p className="t-story" style={{ margin: 0 }}>What happened, in your words. However it went. And still… a few more words, if you find them.</p>
                  <div className="row" style={{ marginTop: 14 }}><Avatar initials={WRITERS[writerIndex].initials} size={22} /><span className="t-byline">{penName}</span></div>
                </div>
                <p className="t-caption">Your name and portrait aren’t tappable. Nobody can see your other stories.</p>
              </>
            )}
            {step === 7 && (
              <div className="stack" style={{ gap: 16, marginTop: 20 }}>
                {["No followers", "No counts", "Nothing stays"].map((title, index) => (
                  <div className="listrow stack" key={title} style={{ alignItems: "flex-start", gap: 4 }}>
                    <span className="t-title-sm">{title}</span>
                    <span className="t-caption">{[
                      "There’s no one to perform for, and no one to keep up with.",
                      "No likes, no views, no numbers on anything, ever.",
                      "No public profile or history. Stories disappear at midnight unless you keep them in your shoebox.",
                    ][index]}</span>
                  </div>
                ))}
              </div>
            )}
            {step === 8 && (
              <div className="onboarding-examples" style={{ display: "grid", gap: 10, marginTop: 16 }}>
                <article className="card card-soft category-turned example-turned" style={{ minHeight: 186, background: "var(--ground-turned)" }}>
                  <span className="t-eyebrow">Clearing up</span>
                  <p className="t-story" style={{ margin: "12px 0" }}>My flight got cancelled and I slept in the airport. Even so… a stranger shared her charger with me.</p>
                  <span className="t-byline">lanternhours</span>
                </article>
                <div className="example-small-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
                  <article className="card card-soft category-vent example-small" style={{ minWidth: 0, minHeight: 142, padding: 14, background: "var(--ground-vent)" }}>
                    <span className="t-eyebrow">Rainy day</span>
                    <p className="t-comment" style={{ margin: "8px 0 0" }}>Everything went wrong today. I don’t want to look on the bright side.</p>
                  </article>
                  <article className="card card-soft category-good example-small" style={{ minWidth: 0, minHeight: 142, padding: 14, background: "var(--ground-good)" }}>
                    <span className="t-eyebrow">Little win</span>
                    <p className="t-comment" style={{ margin: "8px 0 0" }}>My sister called just to say she missed me.</p>
                  </article>
                </div>
              </div>
            )}
            {step === 9 && (
              <ol className="day-timeline" style={{ position: "relative", display: "grid", gap: 18, margin: "24px 0", padding: 0, listStyle: "none" }}>
                <span aria-hidden="true" style={{ position: "absolute", top: 22, bottom: 22, left: 20, width: 1, background: "var(--line-hairline)" }} />
                {[
                  { icon: <Pen />, title: "Write an entry", body: "One story today. Give it a title." },
                  { icon: <BookOpen />, title: "Read a few others", body: "Clearing up, rainy days, and little wins." },
                  { icon: <Moon />, title: "Everything disappears", body: "At midnight, today’s stories are gone." },
                  { icon: <Sun />, title: "A new day", body: "Morning. People wrote back." },
                ].map((item, index) => (
                  <motion.li key={item.title} className="timeline-step" style={{ position: "relative", display: "grid", gridTemplateColumns: "42px minmax(0, 1fr)", alignItems: "center", gap: 12, minHeight: 48 }} initial={ok ? { opacity: 0, x: 10 } : false} animate={{ opacity: 1, x: 0 }} transition={{ duration: ok ? 0.3 : 0.01, delay: ok ? index * 0.08 : 0, ease }}>
                    <span className="timeline-icon" style={{ zIndex: 1, width: 42, height: 42, display: "grid", placeItems: "center", border: "1px solid var(--line-hairline)", borderRadius: "50%", background: "var(--surface-default)", color: "var(--text-ink)" }}>{item.icon}</span>
                    <span className="stack" style={{ gap: 4 }}><span className="t-label">{item.title}</span><span className="t-caption">{item.body}</span></span>
                  </motion.li>
                ))}
              </ol>
            )}
            {step === 10 && (
              <>
                <p className="t-caption">Tap each one to agree.</p>
                <div className="stack" style={{ gap: 12, marginTop: 16 }}>
                  {["These are real people’s days. I’ll treat them that way.", "I’ll write back to the person, not just the problem.", "I understand that being cruel can cost me access to vents or my account."].map((text, index) => (
                    <label className="row" key={text} style={{ alignItems: "flex-start", gap: 12, padding: "8px 0" }}>
                      <input type="checkbox" checked={agreements[index]} onChange={(event) => setAgreements((values) => values.map((value, item) => item === index ? event.target.checked : value))} />
                      <span className="t-body">{text}</span>
                    </label>
                  ))}
                </div>
                <button className="link" onClick={() => setShowRules(true)}>Read the full community rules</button>
              </>
            )}
            {step === 11 && (
              <>
                <p className="t-body muted">Writing here helps a lot of people, but it isn’t a replacement for talking to someone. Help is always one tap away.</p>
                <div className="card card-good" style={{ marginTop: 24 }}>
                  <span className="t-byline">Get support now</span>
                  <p className="t-caption">In the US, call or text 988 any time, for free.</p>
                  <a className="btn btn-care btn-full" href="tel:988">Call or text 988</a>
                </div>
              </>
            )}
            {step === 12 && (
              <>
                <p className="t-caption">We’ll let you know when your story’s conversation is ready. No reminders, no streaks, nothing else.</p>
                <p className="t-caption">Notification delivery isn’t connected in this preview.</p>
                <div className="row" style={{ marginTop: 24 }}>
                  <button className="btn btn-secondary grow" onClick={() => { setNotice("notifications-off"); onComplete({ name: penName.trim(), initials: WRITERS[writerIndex].initials, contact: contact.trim(), notifications: false }); }}>Not now</button>
                  <button className="btn btn-primary grow" onClick={() => { setNotice("notifications-on"); onComplete({ name: penName.trim(), initials: WRITERS[writerIndex].initials, contact: contact.trim(), notifications: true }); }}>Allow it</button>
                </div>
              </>
            )}
            {notice && step !== 12 && <p className="t-caption" role="alert" style={{ color: "var(--blocked-ink)" }}>{notice}</p>}
          </>
        )}
          </motion.div>
        </AnimatePresence>
      </div>
      {step > 0 && step < 12 && (
        <div className="screen-foot">
          <button className="btn btn-primary btn-full" disabled={step === 10 && !agreements.every(Boolean)} onClick={next}>
            {step === 2 ? "Send me a code" : step === 5 ? `Continue as ${WRITERS[writerIndex].name}` : step === 10 ? "I agree to all three" : step === 6 ? "Looks right" : "Continue"}
          </button>
          {step === 6 && <div className="row" style={{ justifyContent: "center", gap: 20 }}><button className="link" onClick={() => setStep(4)}>Change name</button><button className="link" onClick={() => setStep(5)}>Change portrait</button></div>}
        </div>
      )}
      {showRules && (
        <Sheet label="Community rules" onClose={() => setShowRules(false)}>
          <span className="t-title">Community rules</span>
          <p className="t-body">Treat people’s stories with care. Don’t identify real people, use slurs, or judge someone for what happened to them. Reports and account actions are only previews here.</p>
          <button className="btn btn-primary" onClick={() => setShowRules(false)}>Back to setup</button>
        </Sheet>
      )}
    </Screen>
  );
}