@AGENTS.md

# silver lining — prototype handoff

Read this before you change anything. It's the context from the design work that happened outside this repo.

## What this is
A coded, clickable prototype of **silver lining**, made for a design competition (theme: storytelling, judged on product thinking, depth/communication, and craft). It gets screen-recorded for a ≤7-minute video, so polish and motion matter more than real backend logic. **There is no backend.** All data is hardcoded in `app/proto/data.ts`.

**The product:** an anti-audience, anti-performance daily storytelling app for overthinkers and quiet sufferers in their late teens and twenties. You write one titled story a day under a pen name. You can optionally add a "turn" (a hinge word such as "And still…" plus a second part, so the story reads 1a → 1b in the same box). People read a few stories, give one rose a day, and write back. You only see responses the next day, after midnight.

## Product rules (don't break these)
- **No counts anywhere.** No likes, follower numbers, view counts or streaks. Progress dots for the reading cap are the only "numbers."
- **The accent color (`--turn-accent`) is used only for the turn**: the hinge word, the 1b text, the rose, and selected chips. Don't use it for generic buttons.
- **Reading is capped.** Stories that turned: about 5 in the product (3 in the demo). Vents: one at a time, and you unlock the next by writing back. Good days: uncapped.
- **One rose per day.**
- **Responses are revealed after midnight**, one at a time, and the writer privately tags each one Helped / Didn't land / Unkind.
- **Honest empty states.** Never fake activity.
- **Safety:** first names get redacted to "[someone]", slurs are blocked, unkind replies trigger a reread pause, and crisis language sends you to a care screen (988) before posting.
- **Tone:** quiet, warm, plain. Copy is in sentence case, with no exclamation marks and no growth-hacky nudges.

## Code map
- `app/proto/App.tsx`: the view state machine (locked → compose → letgo → home → reader/vent/good → today → midnight → reveal → next day). It also holds the dev panel: theme toggle, "Type the sample story" demo typer, and jump links. The dev panel is hidden below 860px wide.
- `app/proto/Compose.tsx`: writing, the hinge/turn expansion, the class sheet (turned/vent/good day), name redaction, slur block, and the crisis screen.
- `app/proto/Screens.tsx`: LockedHome, LetGo, Home, Reader (rose, write back, reread, comments), GoodDays, VentDoor, ThatsToday, Midnight, TabBar.
- `app/proto/Reveal.tsx`: the next-day reveal (yesterday's story, responses, rose moment, keep/let go).
- `app/proto/ui.tsx`: shared pieces (Screen, TopBar, Sheet, StoryText, Avatar/Author, icons) and motion tokens (`ease`, `spring`, `useMotionSafe`).
- `app/proto/data.ts`: sample content and the fake moderation checks.
- `app/globals.css`: all design tokens (Day/Night under `[data-theme]` on `.phone`) plus component classes. Prefer these classes over one-off Tailwind.

## Design system (from Figma file RcFsXNXVQrZMzXLTfPceNb; the "Design system" and "hi-fi v2" pages)
- **Fonts:** Literata is the story voice (titles, story body, comments). Atkinson Hyperlegible is the app voice (UI, labels, buttons).
- **Type:** Display 32/38 · Title 24/30 · Title-sm 19/25 · Story body 19/29.5 · Hinge 19 semibold italic in accent · Comment 17/26 · UI body 16/24 · Label bold 16/20 · Caption 13/18 · Eyebrow bold 12 uppercase.
- **Grounds:** default, turned (pale blue), vent, good (warm, with dashed cards), and reveal.
- **Radii:** 8, 12, 16, 24 and pill. Buttons are pills. Text links are underlined.
- **Motion:** a soft ease of `[0.22,1,0.36,1]` and springs. Respect reduced motion (`useMotionSafe`).

## Running it
```
npm install
npm run dev   # http://localhost:3000
```
It's designed as a 390×844 phone frame on desktop, and it goes full-bleed on a real phone. It's deployed on Vercel.
