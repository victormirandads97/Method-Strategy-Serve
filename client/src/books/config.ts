/**
 * Little Plot Books: the copy and settings that change most often.
 * Edit here, not in the components.
 */
import type { Look, StoryArt } from "./art";

export const BRAND = {
  name: "Little Plot Books",
  /** Exact endorsement wording. Shown under the wordmark and in the footer. */
  endorsement: "By The Method co",
};

export const OFFER = {
  /** "launch-list" collects emails only. There is no ordering mode yet. */
  mode: "launch-list" as const,
  priceLine: "Planned price · €39.95 delivered in Ireland",
  primaryCta: "Join the first print run",
  secondaryCta: "Read a sample",
  formNote: "We’ll email you when the first print run opens.",
  ages: "Ages 4–7",
  format: "Personalised hardback",
};

export const LINKS = {
  privacy: "/privacy",
  contactEmail: "support@themethodco.co",
};

/** Where the launch-list form posts. functions/api/book-waitlist.ts */
export const WAITLIST_ENDPOINT = "/api/book-waitlist";

export type Story = { id: string; art: StoryArt; title: string; hook: string; hasSample: boolean };

/** Keep ids in step with STORIES in functions/api/book-waitlist.ts. */
export const STORIES: Story[] = [
  {
    id: "dinosaur-next-door",
    art: "dinosaur",
    title: "The Dinosaur Next Door",
    hook: "Giant footprints cross the garden, and the dinosaur at the end of the trail has lost something precious.",
    hasSample: true,
  },
  {
    id: "moonlight-express",
    art: "moonlight",
    title: "The Moonlight Express",
    hook: "A night train stops at the end of the road, and your child helps carry a lost star all the way home.",
    hasSample: false,
  },
  {
    id: "secret-garden-door",
    art: "garden",
    title: "The Secret Garden Door",
    hook: "A hidden door in an old wall opens onto a garden waking up after winter, and it needs a helper.",
    hasSample: false,
  },
];

/** Fictional example heroes. The public demo never asks for real child details. */
export const HEROES: { name: string; look: Look }[] = [
  {
    name: "Ava",
    look: { skin: "#F2C6A0", cheek: "#F29C8F", hair: "#6B3E26", hairStyle: "curls", top: "#FFF8ED", stripe: "#9B3652", bottoms: "#6E9B68", outfit: "dungarees", boots: "#F3C230" },
  },
  {
    name: "Finn",
    look: { skin: "#F6D6BE", cheek: "#F29C8F", hair: "#C8622B", hairStyle: "short", top: "#4C6FA8", bottoms: "#35263D", outfit: "trousers", boots: "#9B3652", freckles: true },
  },
  {
    name: "Zara",
    look: { skin: "#8D5A3B", cheek: "#C0574F", hair: "#2A1A14", hairStyle: "puffs", top: "#F8D5BE", bottoms: "#7A4F9A", outfit: "dress", boots: "#3F9E9A" },
  },
];

export const AVA = HEROES[0];

export const SAMPLE = {
  dedication: { line1: "For Ava,", line2: "our favourite adventurer.", sign: "Love, Mum and Dad" },
  spread1:
    "Ava pulled on her yellow wellies. Three enormous footprints crossed the garden. At the end of the trail, a dinosaur whispered, ‘Have you seen my egg?’",
  spread2:
    "They searched under the hedge and behind the shed. Then Ava spotted something speckled and teal in the old wheelbarrow. ‘Found it!’ she cried, and the dinosaur did a very happy, very wobbly dance.",
};

export type Faq = { q: string; a: string };

export const FAQS: Faq[] = [
  {
    q: "What ages is it for?",
    a: "The stories are written for children aged 4 to 7: short enough for one bedtime, with pictures on every page to talk about together.",
  },
  {
    q: "Do I have to upload a photo?",
    a: "No. When orders open you’ll choose between uploading one photo so we can match their look, or picking illustrated features like hair, skin tone and outfit yourself. The photo is optional. This page doesn’t ask for any child details or photos.",
  },
  {
    q: "Is AI used to make the books?",
    a: "Yes. AI tools help with drafting the story text and the illustrations. A person edits every story and checks every page, and you approve the finished proof before anything is printed.",
  },
  {
    q: "Will I see the book before it’s printed?",
    a: "Yes. You’ll get a digital proof of every page, including the cover and your dedication. Nothing is printed until you approve it, and you can ask for changes first.",
  },
  {
    q: "How does delivery work?",
    a: "The planned price of €39.95 includes delivery in Ireland. Delivery estimates will be available when orders open, so you can check timings before you order.",
  },
  {
    q: "What happens when I join the list?",
    a: "We’ll email you when the first print run opens. Joining is free, there’s nothing to pay now, and we only use your email for Little Plot Books.",
  },
];
