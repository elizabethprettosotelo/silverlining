// Seed content for the prototype. Everything is local: no backend.

export type Comment = { name: string; initials: string; text: string };

export type Story = {
  id: string;
  name: string;
  initials: string;
  title: string;
  a: string; // the raw telling (1a)
  hinge?: string; // the hinge word, e.g. "Even so…"
  b?: string; // the turn (1b)
  comments: Comment[];
};

export const PROMPTS = [
  "So, how'd today go?",
  "So, how'd today go? What stayed with you?",
  "So, how'd today go? What are you still thinking about?",
];

export const HINGES = ["And still…", "Even so…", "Right now…", "One small thing…", "Tomorrow…", "But…"];

export const SAMPLE = {
  title: "Three weeks",
  a: "Dana pulled me aside after the meeting and said my part of the presentation wasn't what they were hoping for. I spent three weeks on it. I smiled and said okay, then sat in my car for twenty minutes before I could drive home.",
  b: "the barista on the way home remembered my order, and for a second I felt seen.",
};

export const ME = { name: "quietharbor", initials: "JA" };

export const TURNED: Story[] = [
  {
    id: "group-project",
    name: "lanternhours",
    initials: "JB",
    title: "The group project",
    a: "Two people in my group didn't show up to the final presentation, so I presented their slides too. I hadn't even read them. The professor still graded us all together.",
    hinge: "Even so…",
    b: "I found out I'm better on my feet than I thought.",
    comments: [
      { name: "mildweather", initials: "ED", text: "Presenting slides you haven't read is a real skill. Not everyone could do that." },
      { name: "sparrowkept", initials: "OW", text: "Same thing happened to me sophomore year. I emailed the professor after and they split the grade. Maybe worth a try?" },
    ],
  },
  {
    id: "rice",
    name: "mildweather",
    initials: "ED",
    title: "Burnt the rice twice",
    a: "I tried to cook for my roommates for the first time and burnt the rice. Twice. We ordered pizza and I wanted to disappear into the floor.",
    hinge: "And still…",
    b: "they ate the crispy bits off the bottom of the pot and said it was the best part.",
    comments: [
      { name: "porchlightjune", initials: "LH", text: "The crispy bits ARE the best part. In some kitchens that's the whole point." },
      { name: "kettlesong", initials: "ZH", text: "You cooked for people. That's the part they'll remember." },
    ],
  },
  {
    id: "first-day-back",
    name: "kettlesong",
    initials: "ZH",
    title: "First day back",
    a: "First day back at work after three weeks out. Everyone was kind, but I felt like a stranger at my own desk and I couldn't remember half my passwords.",
    hinge: "Right now…",
    b: "I'm home, the tea is hot, and tomorrow is day two, not day one.",
    comments: [
      { name: "thirdcoffee", initials: "MS", text: "Day two is always easier. The desk starts to feel like yours again." },
      { name: "lanternhours", initials: "JB", text: "Feeling like a stranger after time away is so normal. Be gentle with yourself this week." },
    ],
  },
];

export const GOOD: Story[] = [
  {
    id: "she-called",
    name: "porchlightjune",
    initials: "LH",
    title: "She called just to say it",
    a: "My sister called on her lunch break just to say she missed me. We haven't talked in months.",
    comments: [],
  },
  {
    id: "road-test",
    name: "thirdcoffee",
    initials: "MS",
    title: "Passed the road test",
    a: "Third try. Parallel parked perfectly and the examiner actually smiled.",
    comments: [],
  },
  {
    id: "library",
    name: "sparrowkept",
    initials: "OW",
    title: "Quiet floor, window seat",
    a: "Got the window seat on the quiet floor of the library and finished a whole chapter before it got dark.",
    comments: [],
  },
];

export const VENTS: Story[] = [
  {
    id: "napkin-math",
    name: "nightbus",
    initials: "WS",
    title: "Napkin math",
    a: "Rent went up again and an hour later my roommate told me she's moving out. I've been doing math on napkins all night and none of it works. I'm so tired of being the person who has to figure it out.",
    comments: [
      { name: "kettlesong", initials: "ZH", text: "The napkin math nights are the worst. I hope tonight's the last one for a while." },
    ],
  },
  {
    id: "group-chat",
    name: "mildweather",
    initials: "ED",
    title: "Six hours",
    a: "I sent a long message in the group chat about something that really mattered to me and nobody answered. It's been six hours. I keep checking.",
    comments: [
      { name: "porchlightjune", initials: "LH", text: "I've sent that exact message and stared at the screen the same way. It doesn't mean it didn't matter." },
    ],
  },
];

// Responses waiting at tomorrow's reveal.
export const REVEAL: (Comment & { flagged?: boolean })[] = [
  {
    name: "sparrowkept",
    initials: "OW",
    text: "I spent a month on a pitch once and got that exact line. It wasn't about the work. Three weeks of effort still counts, even if they didn't see it.",
  },
  {
    name: "kettlesong",
    initials: "ZH",
    text: "Sitting in the car for twenty minutes before driving home is so real. I'm glad the barista was there.",
  },
  { name: "unknown", initials: "?", text: "", flagged: true },
];

// Very small, deliberately visible "checks" for the demo.
const NAMES = ["Dana", "Jake", "Maria", "Chris", "Sam", "Alex", "Jordan", "Taylor"];
const CRISIS = [
  "don't want to be here",
  "dont want to be here",
  "want to die",
  "kill myself",
  "end it all",
  "no reason to live",
  "hurt myself",
];
const UNKIND = ["should have seen", "overreacting", "get over it", "your fault", "quit whining", "grow up"];
const SLUR = /\[slur\]/i;

export function findName(text: string): string | null {
  for (const n of NAMES) {
    if (new RegExp(`\\b${n}\\b`).test(text)) return n;
  }
  return null;
}
export const hasCrisis = (t: string) => CRISIS.some((c) => t.toLowerCase().includes(c));
export const isUnkind = (t: string) => UNKIND.some((c) => t.toLowerCase().includes(c));
export const hasSlur = (t: string) => SLUR.test(t);
export const isLowEffort = (t: string) => t.trim().length < 40;
export const redact = (t: string, name: string) => t.replace(new RegExp(`\\b${name}\\b`, "g"), "[someone]");
