"use client";

import { useState } from "react";
import type { Post } from "./Compose";
import { isValidPenName, type UserProfile } from "./Onboarding";
import { Avatar, Chevron, Screen, StoryText, TopBar } from "./ui";

export type KeptStory = Post & { dateLabel: string };
type Page = "menu" | "support" | "profile" | "contact" | "rules" | "strikes" | "past-intro" | "past-stories" | "story" | "delete";

export default function Account({
  profile,
  keptStories,
  onClose,
  onProfileChange,
  onDelete,
}: {
  profile: UserProfile;
  keptStories: KeptStory[];
  onClose: () => void;
  onProfileChange: (profile: UserProfile) => void;
  onDelete: () => void;
}) {
  const [page, setPage] = useState<Page>("menu");
  const [name, setName] = useState(profile.name);
  const [deleteText, setDeleteText] = useState("");
  const [selectedStory, setSelectedStory] = useState<KeptStory | null>(null);
  const [notice, setNotice] = useState("");

  const go = (next: Page) => {
    setNotice("");
    setPage(next);
  };
  const back = () => {
    setNotice("");
    if (page === "story") setPage("past-stories");
    else if (page === "past-stories") setPage("past-intro");
    else setPage("menu");
  };
  const title: Partial<Record<Page, string>> = {
    support: "Get support now",
    profile: "Pen name and portrait",
    contact: "Account and email",
    rules: "Your strikes and the rules",
    strikes: "Example: a comment was removed",
    "past-intro": "Your shoebox",
    "past-stories": "Your shoebox",
    story: selectedStory?.title ?? "Kept story",
    delete: "Delete everything?",
  };

  return (
    <Screen ground="g-default">
      <TopBar
        onBack={page === "menu" ? onClose : back}
        icon={page === "menu" ? "close" : "back"}
        title={page === "menu" ? undefined : <span className="t-eyebrow">{title[page]}</span>}
      />
      <div className="screen-body" style={{ paddingTop: 10 }}>
        {page === "menu" && (
          <>
            <h1 className="t-display" style={{ margin: "4px 0 18px" }}>Menu</h1>
            <button className="listrow" onClick={() => go("support")}>
              <span className="t-body" style={{ color: "var(--care-ink)" }}>Get support now</span><Chevron />
            </button>
            <div className="row" style={{ gap: 10, padding: "14px 0", borderBottom: "1px solid var(--line-hairline)" }}>
              <Avatar initials={profile.initials} size={28} />
              <div className="stack"><span className="t-byline">{profile.name}</span><span className="t-caption">Your pen name today</span></div>
            </div>
            <button className="listrow" onClick={() => go("profile")}><span>Pen name and portrait</span><Chevron /></button>
            <div className="listrow">
              <span>End-of-day notification</span>
              <button
                type="button"
                role="switch"
                aria-label="End-of-day notification"
                aria-checked={profile.notifications}
                onClick={() => onProfileChange({ ...profile, notifications: !profile.notifications })}
                style={{ appearance: "none", position: "relative", flex: "0 0 44px", width: 44, height: 26, padding: 0, border: 0, borderRadius: "var(--r-pill)", background: profile.notifications ? "var(--action-fill)" : "var(--line-control)", cursor: "pointer" }}
              >
                <span aria-hidden="true" style={{ position: "absolute", top: 3, left: 3, width: 20, height: 20, borderRadius: "50%", background: profile.notifications ? "var(--action-on)" : "var(--surface-default)", transform: profile.notifications ? "translateX(18px)" : "none", transition: "transform 0.15s ease" }} />
              </button>
            </div>
            <button className="listrow" onClick={() => go("rules")}><span>Your strikes and the rules</span><span className="row t-caption">None <Chevron /></span></button>
            <button className="listrow" onClick={() => go("contact")}><span>Account and email</span><Chevron /></button>
            <button className="listrow" onClick={() => go("past-intro")}><span>Your shoebox</span><Chevron /></button>
            <button className="link" style={{ marginTop: 32 }} onClick={() => go("delete")}>Delete my account</button>
          </>
        )}

        {page === "support" && (
          <>
            <h1 className="t-title" style={{ marginTop: 6 }}>If things feel heavy, you don’t have to carry them alone.</h1>
            <p className="t-body muted">In the US, call or text 988 any time, for free. If you’re in immediate danger, call emergency services.</p>
            <div className="card card-good stack" style={{ gap: 10, marginTop: 22 }}>
              <a className="btn btn-care btn-full" href="tel:988">Call or text 988</a>
              <a className="btn btn-care-outline btn-full" href="sms:741741&body=HOME">Text HOME to 741741</a>
            </div>
          </>
        )}

        {page === "profile" && (
          <>
            <h1 className="t-title" style={{ marginTop: 6 }}>Choose the name people see</h1>
            <p className="t-caption">Pen names can be changed once every 30 days. This preview doesn’t enforce that limit.</p>
            <label className="stack" style={{ gap: 6, marginTop: 18 }}>
              <span className="t-byline">Pen name</span>
              <input className="textarea-box" style={{ minHeight: 48, padding: "10px 12px" }} aria-label="Pen name" value={name} maxLength={20} onChange={(event) => setName(event.target.value.replace(/\s/g, ""))} />
            </label>
            <span className="t-caption" role="status">Use 3–20 letters, numbers, or underscores. Real authors’ names aren’t available.</span>
            <div className="row" style={{ marginTop: 20 }}><Avatar initials={profile.initials} size={44} /><span className="t-caption">Portraits are shared by many people and don’t identify you.</span></div>
            <button className="btn btn-primary btn-full" style={{ marginTop: 24 }} disabled={!isValidPenName(name)} onClick={() => { onProfileChange({ ...profile, name: name.trim() }); setPage("menu"); }}>Save pen name</button>
          </>
        )}

        {page === "contact" && (
          <>
            <h1 className="t-title" style={{ marginTop: 6 }}>Private account details</h1>
            <div className="listrow"><span>Email or phone</span><span className="t-caption">{profile.contact || "Not set"}</span></div>
            <p className="t-caption">Your contact details are never shown on your stories. Editing and verification aren’t connected in this preview.</p>
          </>
        )}

        {page === "rules" && (
          <>
            <h1 className="t-title" style={{ marginTop: 6 }}>Care for the person behind the story.</h1>
            <p className="t-body muted">Don’t identify real people, use hateful language, or judge someone for what happened to them. On vents, write back to how someone feels, not what they should have done.</p>
            <button className="card card-soft card-tap" style={{ marginTop: 20 }} onClick={() => go("strikes")}>
              <span className="t-title-sm">Example: a comment was removed</span>
              <span className="t-caption" style={{ display: "block", marginTop: 6 }}>See what happens when a comment is removed.</span>
            </button>
          </>
        )}

        {page === "strikes" && (
          <>
            <span className="t-eyebrow">Example · on “Napkin math”</span>
            <div className="card card-sunken" style={{ marginTop: 12 }}><p className="t-comment" style={{ margin: 0 }}>“Honestly you should have seen this coming with rent where it is.”</p></div>
            <p className="t-body muted">The writer and our team both found this unkind. On vents, write back to how someone feels, not to judge what they did.</p>
            <div className="banner" style={{ background: "var(--strike-bg)", color: "var(--strike-ink)" }}>
              <span aria-hidden="true">ⓘ</span><span><b>Example strike 1 of 3</b><br />A second strike pauses vents for 7 days. A third closes your account.</span>
            </div>
            {notice && <p className="t-caption" role="status">{notice}</p>}
          </>
        )}

        {page === "past-intro" && (
          <div style={{ minHeight: "80%", display: "flex", flexDirection: "column", justifyContent: "center", textAlign: "center" }}>
            <h1 className="t-display">These are days you chose to keep.</h1>
            <p className="t-body muted">Some of them were hard. Ready to look back?</p>
            <div className="row" style={{ marginTop: 28 }}>
              <button className="btn btn-secondary grow" onClick={() => setPage("menu")}>Not now</button>
              <button className="btn btn-primary grow" onClick={() => setPage("past-stories")}>Look back</button>
            </div>
          </div>
        )}

        {page === "past-stories" && (
          <>
            <p className="t-caption">Your shoebox is available only in this preview session.</p>
            {keptStories.length === 0 ? (
              <div className="card card-sunken"><p className="t-body" style={{ margin: 0 }}>Your shoebox is empty. You can keep an entry after seeing what it started.</p></div>
            ) : (
              <>
                {[...new Set(keptStories.map((story) => story.dateLabel))].map((date) => (
                  <section key={date} style={{ marginBottom: 18 }}>
                    <h2 className="t-eyebrow">{date}</h2>
                    <div className="stack" style={{ gap: 10 }}>
                      {keptStories.filter((story) => story.dateLabel === date).map((story) => (
                        <button key={`${story.dateLabel}-${story.title}`} className="card card-soft card-tap" onClick={() => { setSelectedStory(story); setPage("story"); }}>
                          <span className="t-title-sm">{story.title}</span>
                          {story.hinge ? <p className="t-story turned" style={{ margin: "8px 0 0" }}>{story.hinge} {story.b}</p> : <p className="t-caption" style={{ margin: "8px 0 0" }}>Kept as a {story.kind === "vent" ? "rainy day" : "little win"}.</p>}
                        </button>
                      ))}
                    </div>
                  </section>
                ))}
              </>
            )}
          </>
        )}

        {page === "story" && selectedStory && (
          <>
            <span className="t-eyebrow">{selectedStory.dateLabel}</span>
            <div className="card card-soft" style={{ marginTop: 12 }}>
              <h1 className="t-title-sm" style={{ margin: "0 0 10px" }}>{selectedStory.title}</h1>
              <StoryText a={selectedStory.a} hinge={selectedStory.hinge} b={selectedStory.b} />
            </div>
          </>
        )}

        {page === "delete" && (
          <>
            <span className="t-eyebrow">This permanently erases</span>
            <ul className="t-body" style={{ paddingLeft: 22, lineHeight: "2.2em" }}>
              <li>Your pen name and portrait</li><li>Today’s story, if it’s still up</li><li>Every story in your shoebox</li><li>Every comment you’ve written</li><li>Your email and account</li>
            </ul>
            <p className="t-caption">This preview has no connected account. Confirming clears only the local session; no server account is deleted.</p>
            <label className="stack" style={{ gap: 6, marginTop: 18 }}>
              <span className="t-byline">Type DELETE to confirm</span>
              <input className="textarea-box" style={{ minHeight: 48, padding: "10px 12px" }} aria-label="Type DELETE to confirm" value={deleteText} onChange={(event) => setDeleteText(event.target.value)} />
            </label>
            <button className="btn btn-primary btn-full" style={{ marginTop: 18 }} disabled={deleteText !== "DELETE"} onClick={onDelete}>Delete my account</button>
            <button className="link" onClick={() => setPage("menu")}>Keep my account</button>
          </>
        )}
      </div>
      {page === "strikes" && (
        <div className="screen-foot">
          <button className="btn btn-primary btn-full" onClick={() => setPage("menu")}>I understand</button>
          <button className="link center" onClick={() => setNotice("Review requests are not connected in this preview.")}>I think this was a mistake</button>
        </div>
      )}
    </Screen>
  );
}