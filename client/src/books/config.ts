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
  /**
   * "launch-list": email signup only (current brief, no payments).
   * "preorder": also shows the Stripe and PayPal buy box. Only switch this on
   * together with BOOK_CHECKOUT_ENABLED=true in Cloudflare (see DEPLOY.md).
   */
  mode: "launch-list" as "launch-list" | "preorder",
  price: "€39.95",
  productLine: "Personalised hardback · Ages 4–7",
  priceLine: "Planned price · €39.95 including delivery in Ireland",
  primaryCta: "Join the first print run",
  secondaryCta: "Read a sample",
  stripeCta: "Pre-order with card",
  stripeNote: "Card, Apple Pay or Google Pay · secure checkout by Stripe",
  listCta: "Join the first print run",
  formNote: "We’ll tell you when the first books are ready to order.",
};

/** PayPal payment link for pre-order mode. Hidden while empty. */
export const PAYPAL_LINK = "";

/** Stripe pre-order checkout (pre-order mode only). functions/api/book-checkout.ts */
export const CHECKOUT_ENDPOINT = "/api/book-checkout";

/** Pre-order terms for pre-order mode. Confirm before switching it on. */
export const PREORDER_TERMS = [
  "This is a pre-order for the first print run.",
  "After payment we email you to set up their name, look and your dedication.",
  "You approve a digital proof before anything is printed.",
  "Changed your mind? Full refund any time before you approve the proof.",
  "Delivery estimate sent by email when the first print run is scheduled.",
];

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
    hook: "Something has left enormous footprints in the garden. It’s looking for its egg.",
    hasSample: true,
  },
  {
    id: "moonlight-express",
    art: "moonlight",
    title: "The Moonlight Express",
    hook: "A midnight train pulls up with one very small passenger: a star that’s lost its way home.",
    hasSample: false,
  },
  {
    id: "secret-garden-door",
    art: "garden",
    title: "The Secret Garden Door",
    hook: "A door in the garden wall opens onto a place where spring needs a little help getting started.",
    hasSample: false,
  },
];

export type Hero = { name: string; label: string; their: string; thing: string; look: Look };

/** Fictional example heroes. The public demo never asks for a name, photo, account or email. */
export const HEROES: Hero[] = [
  {
    name: "Ava",
    label: "Curls and yellow wellies",
    their: "her",
    thing: "yellow wellies",
    look: { skin: "#F2C6A0", cheek: "#F29C8F", hair: "#6B3E26", hairStyle: "curls", top: "#FFF8ED", stripe: "#9B3652", bottoms: "#6E9B68", outfit: "dungarees", boots: "#F3C230" },
  },
  {
    name: "Finn",
    label: "Freckles and red wellies",
    their: "his",
    thing: "red wellies",
    look: { skin: "#F6D6BE", cheek: "#F29C8F", hair: "#C8622B", hairStyle: "short", top: "#4C6FA8", bottoms: "#35263D", outfit: "trousers", boots: "#C2413B", freckles: true },
  },
  {
    name: "Zara",
    label: "Puffs and teal wellies",
    their: "her",
    thing: "teal wellies",
    look: { skin: "#8D5A3B", cheek: "#C0574F", hair: "#2A1A14", hairStyle: "puffs", top: "#F8D5BE", bottoms: "#7A4F9A", outfit: "dress", boots: "#3F9E9A" },
  },
];

export const AVA = HEROES[0];

/** The first spread, carried from the hero's favourite thing. For Ava this is the exact sample text. */
export function spread1Text(h: Hero) {
  return `${h.name} pulled on ${h.their} ${h.thing}. Three enormous footprints crossed the garden. At the end of the trail, a dinosaur whispered, ‘Have you seen my egg?’`;
}

export const SAMPLE = {
  dedication: { line1: "For Ava,", line2: "our favourite adventurer.", sign: "Love, Mum and Dad" },
  spread1: spread1Text(HEROES[0]),
  spread2:
    "They searched under the hedge and behind the shed. Then Ava spotted something speckled and mint in the old wheelbarrow. ‘Found it!’ she cried, and the dinosaur did a very happy, very wobbly dance.",
};

export type Faq = { q: string; a: string };

export const FAQS: Faq[] = [
  {
    q: "What ages is it for?",
    a: "Children aged 4 to 7. Each story is short enough for one bedtime, with pictures on every page to talk about together.",
  },
  {
    q: "How are the stories made?",
    a: "Every book starts from one of our preset adventures. We use AI-assisted writing and illustration to personalise it with your child’s name, look and favourite thing, and a person checks it before you see your proof.",
  },
  {
    q: "Do I need to send a photo?",
    a: "No. When orders open you’ll be able to upload one photo so we can match their look, or choose their features yourself. The photo is optional, and this page never asks for one.",
  },
  {
    q: "Will I see the book before it’s printed?",
    a: "Yes. When ordering opens you’ll get a personalised proof to check, and nothing goes to print until you approve it.",
  },
  {
    q: "How much is it, and how does delivery work?",
    a: "The planned price is €39.95 including delivery in Ireland. Delivery estimates will be available when orders open.",
  },
  {
    q: "What happens when I join the list?",
    a: "We’ll email you when the first books are ready to order. It’s free, there’s nothing to pay, and we only use your email for Little Plot Books.",
  },
];
