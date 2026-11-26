/**
 * Little Plot Books: catalogue, art styles, shop settings and pricing.
 *
 * One source of truth for the storefront, the builder, checkout, receipts and
 * the owner dashboard. Prices are integer cents. The server recomputes every
 * quote from the stored settings; the browser never sends a price.
 *
 * Business facts (delivery times, cutoffs, print specs, shipping, reference
 * prices) default to null/unverified. Anything unverified is hidden from
 * customers instead of being guessed.
 */

export const BRAND = "Little Plot Books";

// ---------------------------------------------------------------------------
// Stories (the five preset adventures) and art styles
// ---------------------------------------------------------------------------

export type StoryId = "snow-globe" | "sock-dragon" | "moonlight-delivery" | "little-wonders" | "small-parade";
export type StyleId = "pastel" | "cartoon" | "comic" | "watercolour" | "collage" | "pencil" | "gouache";

export interface StoryInfo {
  id: StoryId;
  /** Title pattern; {name} is the lead character. */
  titlePattern: string;
  sampleTitle: string;
  hook: string;
  blurb: string;
  ages: string;
  sampleStyle: StyleId;
  /** Colour for spines, shelves and cards. */
  colour: string;
  christmas?: boolean;
}

export const STORIES: StoryInfo[] = [
  {
    id: "snow-globe",
    titlePattern: "{name} and the Midnight Snow Globe",
    sampleTitle: "Mila and the Midnight Snow Globe",
    hook: "Tiny footprints in the snow, and a star that needs to get home before morning.",
    blurb: "On Christmas Eve, a trail of tiny footprints leads out of the snow globe on the windowsill. Your child and their pet follow it to return a lost star before Christmas morning.",
    ages: "Ages 3–6",
    sampleStyle: "pastel",
    colour: "#3E5C76",
    christmas: true,
  },
  {
    id: "sock-dragon",
    titlePattern: "{name} and the Sock-Stealing Dragon",
    sampleTitle: "Theo and the Sock-Stealing Dragon",
    hook: "Somebody keeps stealing one sock from every pair. Somebody with very cold feet.",
    blurb: "A trail of odd socks leads your child up the hill to a shivering dragon. It turns out the thief just needed a friend, and something warm to wear.",
    ages: "Ages 4–7",
    sampleStyle: "cartoon",
    colour: "#2E7D6B",
  },
  {
    id: "moonlight-delivery",
    titlePattern: "{name} and the Moonlight Delivery",
    sampleTitle: "Aisha and the Moonlight Delivery",
    hook: "One parcel. One cat. Address: The Moon.",
    blurb: "A parcel arrives with a very unusual address: The Moon. Your child and their cat race across the rooftops and up a ladder of moonbeams to deliver it on time.",
    ages: "Ages 5–8",
    sampleStyle: "comic",
    colour: "#2B2F5B",
  },
  {
    id: "little-wonders",
    titlePattern: "{name} and the Map of Little Wonders",
    sampleTitle: "Finn and the Map of Little Wonders",
    hook: "Their favourite saying turns out to be the clue everyone needed.",
    blurb: "When a friend loses something precious in the park, your child unfolds a map of little wonders. Their favourite phrase becomes the clue that finds it.",
    ages: "Ages 4–7",
    sampleStyle: "watercolour",
    colour: "#6B8F5E",
  },
  {
    id: "small-parade",
    titlePattern: "{name} and the Very Small Parade",
    sampleTitle: "Nia and the Very Small Parade",
    hook: "The whole street is in the parade. Except the shy neighbour at number nine.",
    blurb: "Your child and their pet help a shy neighbour find just the right part in the street's celebration. A small story about a big kindness.",
    ages: "Ages 3–6",
    sampleStyle: "collage",
    colour: "#C0573E",
  },
];

export interface StyleInfo { id: StyleId; name: string; line: string }

export const STYLES: StyleInfo[] = [
  { id: "pastel", name: "Soft pastel", line: "Chalky, gentle colours. Lovely for bedtime." },
  { id: "cartoon", name: "Bold cartoon", line: "Thick outlines and bright, flat colour." },
  { id: "comic", name: "Comic book", line: "Ink lines, dot shading and lots of action." },
  { id: "watercolour", name: "Watercolour", line: "Loose washes with paper showing through." },
  { id: "collage", name: "Cut-paper collage", line: "Layered paper shapes with soft shadows." },
  { id: "pencil", name: "Coloured-pencil storybook", line: "Hand-drawn lines and pencil texture." },
  { id: "gouache", name: "Textured gouache", line: "Rich, opaque paint with a brushy finish." },
];

export function storyInfo(id: StoryId | undefined): StoryInfo | undefined {
  return STORIES.find((s) => s.id === id);
}
export function storyTitle(id: StoryId, name: string): string {
  return (storyInfo(id)?.titlePattern ?? "{name}'s story").replace("{name}", name || "Your child");
}
export function styleInfo(id: StyleId | undefined): StyleInfo | undefined {
  return STYLES.find((s) => s.id === id);
}

// ---------------------------------------------------------------------------
// Shop settings (editable in the owner dashboard, stored in D1)
// ---------------------------------------------------------------------------

export interface PrintProof {
  version: string;
  state: "awaiting_approval" | "changes_requested" | "approved";
  message: string | null;
}

export type FormatId = "ebook" | "softcover" | "hardback";
export const FORMAT_IDS: FormatId[] = ["ebook", "softcover", "hardback"];
export const PRINT_FORMAT_IDS = ["softcover", "hardback"] as const;

export function availablePrintFormats(settings: ShopSettings) {
  return PRINT_FORMAT_IDS.filter((id) => settings.formats[id].enabled && settings.formats[id].shippingCents != null);
}

export interface FormatSettings {
  enabled: boolean;
  label: string;
  /** Current selling price, VAT included. */
  priceCents: number;
  /** Price used to show a sale. Must be a genuine prior price. */
  referencePriceCents: number | null;
  /** Owner has confirmed the reference price is valid (e.g. lowest price in the prior 30 days). */
  referenceVerified: boolean;
  /** Shipping charged per order (physical formats). null = not set; the format can't be enabled. */
  shippingCents: number | null;
  /** Customer-facing specs, one per line. Empty = hidden. */
  specs: string[];
  /** e.g. "Ready within 5 working days". null = hidden. */
  turnaround: string | null;
  /** e.g. "Ships in 2–4 working days within Ireland". null = hidden. */
  shipping: string | null;
  /** YYYY-MM-DD: last order date for Christmas. null = no claim. */
  christmasCutoff: string | null;
}

export interface ShopSettings {
  christmas: { enabled: boolean; announcement: string };
  formats: Record<FormatId, FormatSettings>;
  extraCharacterCents: number;
  maxExtraCharacters: number;
  campaign: {
    enabled: boolean;
    label: string;
    percentOff: number;
    /** ISO datetimes. Both required for the campaign to run. */
    startsAt: string | null;
    endsAt: string | null;
    formats: FormatId[];
  };
  /** e.g. "Prices include VAT." Shown only when set. */
  taxNote: string | null;
  contactEmail: string | null;
  /** Days after delivery when customer photos are deleted. */
  photoRetentionDays: number;
  /** Days before an unpaid draft and its uploads are deleted. */
  draftRetentionDays: number;
  /** Outside providers that receive customer photos. Empty = only the owner. */
  photoProcessors: string[];
}

export const DEFAULT_SETTINGS: ShopSettings = {
  christmas: { enabled: true, announcement: "Give a story with their name in it this Christmas." },
  formats: {
    ebook: {
      enabled: false,
      label: "Ebook (PDF)",
      priceCents: 4799,
      referencePriceCents: 4799,
      referenceVerified: false,
      shippingCents: null,
      specs: ["Full-colour PDF with square pages", "Read on a tablet, phone or computer, or print at home"],
      turnaround: null,
      shipping: "Sent by private download link. No shipping.",
      christmasCutoff: null,
    },
    softcover: {
      enabled: false,
      label: "Printed softcover",
      priceCents: 4799,
      referencePriceCents: 4799,
      referenceVerified: false,
      shippingCents: null,
      specs: [],
      turnaround: null,
      shipping: null,
      christmasCutoff: null,
    },
    hardback: {
      enabled: false,
      label: "Printed hardcover",
      priceCents: 4799,
      referencePriceCents: null,
      referenceVerified: false,
      shippingCents: null,
      specs: [],
      turnaround: null,
      shipping: null,
      christmasCutoff: null,
    },
  },
  extraCharacterCents: 500,
  maxExtraCharacters: 5,
  campaign: { enabled: true, label: "Black Friday · 20% off", percentOff: 20, startsAt: "2026-11-27T00:00:00Z", endsAt: "2026-12-01T00:00:00Z", formats: ["softcover", "hardback"] },
  taxNote: null,
  contactEmail: null,
  photoRetentionDays: 30,
  draftRetentionDays: 30,
  photoProcessors: [],
};

/** Merges stored settings over defaults so new fields always exist. */
export function mergeSettings(stored: unknown): ShopSettings {
  const s = (stored && typeof stored === "object" ? stored : {}) as Partial<ShopSettings>;
  const formats = { ...DEFAULT_SETTINGS.formats };
  for (const f of FORMAT_IDS) formats[f] = { ...formats[f], ...(s.formats?.[f] ?? {}) };
  return {
    ...DEFAULT_SETTINGS,
    ...s,
    christmas: { ...DEFAULT_SETTINGS.christmas, ...(s.christmas ?? {}) },
    campaign: { ...DEFAULT_SETTINGS.campaign, ...(s.campaign ?? {}) },
    formats,
  };
}

/** Validates settings sent by the owner. Throws a readable message. */
export function validateSettings(input: unknown): ShopSettings {
  const s = mergeSettings(input);
  const cents = (n: unknown, what: string, nullable = false) => {
    if (nullable && (n === null || n === undefined)) return;
    if (!Number.isInteger(n) || (n as number) < 0 || (n as number) > 100_000) throw new Error(`${what} must be a whole number of cents.`);
  };
  for (const f of FORMAT_IDS) {
    const x = s.formats[f];
    cents(x.priceCents, `${x.label} price`);
    cents(x.referencePriceCents, `${x.label} reference price`, true);
    cents(x.shippingCents, `${x.label} shipping`, true);
    if (f !== "ebook" && x.enabled && x.shippingCents === null) throw new Error(`Set ${x.label} shipping before switching it on.`);
    if (x.christmasCutoff && !/^\d{4}-\d{2}-\d{2}$/.test(x.christmasCutoff)) throw new Error(`${x.label} Christmas cutoff must be a date.`);
  }
  s.formats.ebook.enabled = false;
  s.campaign.formats = s.campaign.formats.filter((format) => format === "softcover" || format === "hardback");
  cents(s.extraCharacterCents, "Extra character price");
  if (!(s.campaign.percentOff >= 0 && s.campaign.percentOff <= 90)) throw new Error("Discount must be between 0 and 90%.");
  for (const d of [s.campaign.startsAt, s.campaign.endsAt]) if (d && Number.isNaN(Date.parse(d))) throw new Error("Campaign dates must be valid dates.");
  if (s.campaign.startsAt && s.campaign.endsAt && Date.parse(s.campaign.endsAt) <= Date.parse(s.campaign.startsAt)) throw new Error("The campaign must end after it starts.");
  return s;
}

// ---------------------------------------------------------------------------
// Pricing
// ---------------------------------------------------------------------------

export function campaignLive(s: ShopSettings, now = Date.now()): boolean {
  const c = s.campaign;
  if (!c.enabled || c.percentOff <= 0 || !c.startsAt || !c.endsAt) return false;
  return now >= Date.parse(c.startsAt) && now < Date.parse(c.endsAt);
}

export interface FormatPrice {
  format: FormatId;
  priceCents: number;
  /** Set only when a verified sale applies. */
  wasCents: number | null;
  saleLabel: string | null;
}

/** The book price for one format now. A sale shows only against a verified reference price. */
export function formatPrice(s: ShopSettings, format: FormatId, now = Date.now()): FormatPrice {
  const f = s.formats[format];
  const eligible =
    campaignLive(s, now) && s.campaign.formats.includes(format) && f.referenceVerified && f.referencePriceCents !== null && f.referencePriceCents >= f.priceCents;
  if (!eligible) return { format, priceCents: f.priceCents, wasCents: null, saleLabel: null };
  const ref = f.referencePriceCents!;
  return { format, priceCents: ref - Math.round((ref * s.campaign.percentOff) / 100), wasCents: ref, saleLabel: s.campaign.label };
}

export interface Quote {
  format: FormatId;
  currency: "EUR";
  bookCents: number;
  wasCents: number | null;
  saleLabel: string | null;
  extraCharacters: number;
  extraCharacterCents: number;
  extrasCents: number;
  shippingCents: number;
  totalCents: number;
}

export function quote(s: ShopSettings, format: FormatId, extraCharacters: number, now = Date.now()): Quote {
  const p = formatPrice(s, format, now);
  const extras = Math.max(0, Math.min(s.maxExtraCharacters, extraCharacters));
  const extrasCents = extras * s.extraCharacterCents; // never discounted
  const shippingCents = format === "ebook" ? 0 : s.formats[format].shippingCents ?? 0; // never discounted
  return {
    format,
    currency: "EUR",
    bookCents: p.priceCents,
    wasCents: p.wasCents,
    saleLabel: p.saleLabel,
    extraCharacters: extras,
    extraCharacterCents: s.extraCharacterCents,
    extrasCents,
    shippingCents,
    totalCents: p.priceCents + extrasCents + shippingCents,
  };
}

export function euro(cents: number): string {
  return `€${(cents / 100).toFixed(2)}`;
}

/** What the sale covers, shown wherever the promotion is. */
export const SALE_SCOPE = "The discount applies to the book price only. Extra characters and shipping are charged at full price.";

/** Customer-safe view of the settings. */
export function publicSettings(s: ShopSettings, now = Date.now()) {
  const formats = availablePrintFormats(s).map((f) => {
    const x = s.formats[f];
    return {
      id: f,
      label: x.label,
      ...formatPrice(s, f, now),
      shippingCents: x.shippingCents,
      specs: x.specs,
      turnaround: x.turnaround,
      shipping: x.shipping,
      christmasCutoff: x.christmasCutoff,
    };
  });
  const anySale = formats.some((f) => f.wasCents);
  return {
    christmas: s.christmas,
    formats,
    extraCharacterCents: s.extraCharacterCents,
    maxExtraCharacters: s.maxExtraCharacters,
    sale: anySale ? { label: s.campaign.label, percentOff: s.campaign.percentOff, endsAt: s.campaign.endsAt, scope: SALE_SCOPE } : null,
    taxNote: s.taxNote,
    contactEmail: s.contactEmail,
    photoProcessors: s.photoProcessors,
    photoRetentionDays: s.photoRetentionDays,
  };
}
export type PublicSettings = ReturnType<typeof publicSettings>;

// ---------------------------------------------------------------------------
// The builder brief
// ---------------------------------------------------------------------------

export type Route = "preset" | "custom";
export type Role = "child" | "adult" | "pet" | "fictional";

export interface Character {
  id: string;
  role: Role;
  name?: string;
  ageRange?: string;
  description?: string;
  species?: string;
  markings?: string;
  personality?: string;
  /** Hair, glasses, clothes, markings: anything visual. */
  appearance?: string;
  /** Set by the server when a reference photo is stored. Never trusted from the browser. */
  photo?: { id: string; type: string; size: number } | null;
}

export interface Brief {
  route?: Route;
  story?: StoryId;
  custom?: { happen?: string; where?: string; tone?: string; include?: string; thatsMe?: string };
  characters: Character[];
  touches: { phrases?: string; interests?: string; places?: string; mustInclude?: string; leaveOut?: string; dedication?: string };
  style?: StyleId;
  format?: FormatId;
  contact: { email?: string; name?: string };
  photoConsent?: boolean;
  marketing?: boolean;
}

export const emptyBrief = (): Brief => ({ characters: [{ id: "lead", role: "child" }], touches: {}, contact: {} });

export const LIMITS = { name: 30, short: 60, medium: 240, long: 600, dedication: 300, email: 200, photoBytes: 12 * 1024 * 1024, characters: 6 } as const;

export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const AGE_RANGES = ["Baby or toddler", "3–5", "6–8", "9–12", "Teenager", "Grown-up"] as const;
export const TONES = ["Funny and silly", "Cosy and gentle", "Big adventure", "Magical", "Heart-warming"] as const;
export const ROLES: { id: Role; label: string }[] = [
  { id: "child", label: "Child" },
  { id: "adult", label: "Grown-up" },
  { id: "pet", label: "Pet" },
  { id: "fictional", label: "Made-up character" },
];

const BLOCKED = ["peppa", "paw patrol", "bluey", "elsa", "disney", "marvel", "spider-man", "spiderman", "batman", "pokemon", "pokémon", "pikachu", "minecraft", "fortnite", "barbie", "mickey", "sonic", "mario", "harry potter", "gruffalo", "paddington", "cocomelon"];
const UNSAFE = ["kill", "blood", "gun", "knife", "murder", "sex", "drunk", "vodka", "bomb"];

export function contentProblem(text: string | undefined): string | null {
  if (!text) return null;
  const t = ` ${text.toLowerCase()} `;
  if (BLOCKED.some((n) => t.includes(n))) return "We can only draw original characters, so please leave out characters from TV, films, games and toy brands.";
  if (UNSAFE.some((w) => new RegExp(`[^a-z]${w}[^a-z]`).test(t))) return "Let's keep it gentle. Could you use different words?";
  if (/https?:|www\./.test(t)) return "Please leave out links.";
  return null;
}

export function clean(s: unknown, max: number, multiline = false): string | undefined {
  if (typeof s !== "string") return undefined;
  let out = s.normalize("NFC").replace(/[\u0000-\u0009\u000B-\u001F\u007F\u200B-\u200F\u2028-\u202E]/g, "").replace(/[ \t]+/g, " ").trim();
  if (!multiline) out = out.replace(/\n+/g, " ");
  out = out.slice(0, max);
  return out || undefined;
}

const ID_RE = /^[a-z0-9-]{3,40}$/;

/** Sanitises an untrusted brief. Photo metadata is never accepted from the browser. */
export function sanitiseBrief(input: unknown): Brief {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d = (input && typeof input === "object" ? input : {}) as Record<string, any>;
  const out: Brief = { characters: [], touches: {}, contact: {} };
  if (d.route === "preset" || d.route === "custom") out.route = d.route;
  if (STORIES.some((s) => s.id === d.story)) out.story = d.story;
  if (d.custom && typeof d.custom === "object") {
    out.custom = {
      happen: clean(d.custom.happen, LIMITS.long, true),
      where: clean(d.custom.where, LIMITS.medium),
      tone: (TONES as readonly string[]).includes(d.custom.tone) ? d.custom.tone : undefined,
      include: clean(d.custom.include, LIMITS.long, true),
      thatsMe: clean(d.custom.thatsMe, LIMITS.medium, true),
    };
  }
  const chars = Array.isArray(d.characters) ? d.characters.slice(0, LIMITS.characters) : [];
  for (const c of chars) {
    if (!c || typeof c !== "object") continue;
    const role: Role = ROLES.some((r) => r.id === c.role) ? c.role : "child";
    out.characters.push({
      id: typeof c.id === "string" && ID_RE.test(c.id) ? c.id : `c-${Math.random().toString(36).slice(2, 10)}`,
      role,
      name: clean(c.name, LIMITS.name),
      ageRange: (AGE_RANGES as readonly string[]).includes(c.ageRange) ? c.ageRange : undefined,
      description: clean(c.description, LIMITS.medium, true),
      species: role === "pet" ? clean(c.species, LIMITS.short) : undefined,
      markings: role === "pet" ? clean(c.markings, LIMITS.medium) : undefined,
      personality: clean(c.personality, LIMITS.medium),
      appearance: clean(c.appearance, LIMITS.medium, true),
    });
  }
  if (!out.characters.length) out.characters.push({ id: "lead", role: "child" });
  const t = d.touches && typeof d.touches === "object" ? d.touches : {};
  out.touches = {
    phrases: clean(t.phrases, LIMITS.medium, true),
    interests: clean(t.interests, LIMITS.medium, true),
    places: clean(t.places, LIMITS.medium, true),
    mustInclude: clean(t.mustInclude, LIMITS.long, true),
    leaveOut: clean(t.leaveOut, LIMITS.medium, true),
    dedication: clean(t.dedication, LIMITS.dedication, true),
  };
  if (STYLES.some((s) => s.id === d.style)) out.style = d.style;
  if ((FORMAT_IDS as string[]).includes(d.format)) out.format = d.format;
  const ct = d.contact && typeof d.contact === "object" ? d.contact : {};
  out.contact = { email: clean(ct.email, LIMITS.email)?.toLowerCase(), name: clean(ct.name, LIMITS.name) };
  out.photoConsent = d.photoConsent === true;
  out.marketing = d.marketing === true;
  return out;
}

export type Errors = Record<string, string>;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Steps: 1 story, 2 characters, 3 photos and personal touches, 4 art and format, 5 review. */
export function validateBrief(b: Brief, step?: number, enabledFormats?: FormatId[]): Errors {
  const e: Errors = {};
  const want = (n: number) => step === undefined || step === n;
  if (want(1)) {
    if (!b.route) e.route = "Choose Pick a story or Dream up a story.";
    else if (b.route === "preset" && !b.story) e.story = "Choose a story to personalise.";
    else if (b.route === "custom") {
      if (!b.custom?.happen || b.custom.happen.length < 10) e["custom.happen"] = "Tell us a little about what should happen. A sentence or two is plenty.";
      for (const k of ["happen", "where", "include", "thatsMe"] as const) {
        const p = contentProblem(b.custom?.[k]);
        if (p) e[`custom.${k}`] = p;
      }
    }
  }
  if (want(2)) {
    if (!b.characters.length) e.characters = "Add the star of the story.";
    b.characters.forEach((c, i) => {
      if (!c.name) e[`characters.${i}.name`] = i === 0 ? "Add their first name or nickname." : "Add a name for this character.";
      else if (contentProblem(c.name)) e[`characters.${i}.name`] = contentProblem(c.name)!;
      if (c.role === "pet" && !c.species) e[`characters.${i}.species`] = "What kind of animal are they?";
      const p = contentProblem(c.description) || contentProblem(c.personality) || contentProblem(c.markings) || contentProblem(c.appearance);
      if (p) e[`characters.${i}.description`] = p;
    });
  }
  if (want(3)) {
    for (const k of Object.keys(b.touches) as (keyof Brief["touches"])[]) {
      const p = contentProblem(b.touches[k]);
      if (p) e[`touches.${k}`] = p;
    }
    if (b.characters.some((c) => c.photo) && !b.photoConsent) e.photoConsent = "Please confirm you're allowed to share these photos.";
  }
  if (want(4)) {
    if (!b.style) e.style = "Choose an illustration style.";
    if (!b.format) e.format = "Choose a format.";
    else if (enabledFormats && !enabledFormats.includes(b.format)) e.format = "That format isn't available right now. Please choose another.";
  }
  if (want(5)) {
    if (!b.contact.email) e["contact.email"] = "We need an email for your order and delivery.";
    else if (!EMAIL_RE.test(b.contact.email)) e["contact.email"] = "That email doesn't look quite right.";
  }
  return e;
}

export function extraCount(b: Brief): number {
  return Math.max(0, b.characters.length - 1);
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

export type OrderStatus = "awaiting_payment" | "payment_failed" | "paid" | "awaiting_details" | "in_production" | "ready" | "delivered" | "cancelled";

export const STATUS_LABEL: Record<OrderStatus, string> = {
  awaiting_payment: "Awaiting payment",
  payment_failed: "Payment failed",
  paid: "Paid",
  awaiting_details: "Awaiting details",
  in_production: "In production",
  ready: "Ready to deliver",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

/** Statuses the owner can set by hand. Paid comes from the payment provider only. */
export const OWNER_STATUSES: OrderStatus[] = ["paid", "awaiting_details", "in_production", "ready", "delivered", "cancelled"];
