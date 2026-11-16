/**
 * /api/leads: enquiries from the two sales pages.
 *
 * - High-Conversion Landing Pages, same origin: https://themethodco.co/landing-pages/
 * - Method Instant Quotes, cross origin: https://calculators.themethodco.co/
 *
 * POST stores one enquiry in the D1 database bound as LEADS_DB and emails it
 * to the owner through Formspree (the same form the older pages use). It
 * answers { ok: true } once at least one of the two has worked, with
 * `saved` and `emailed` saying which. If neither worked it answers an error,
 * so the form never shows a success it did not achieve.
 *
 * Browsers may only post from the allowed origins below. CORS headers are
 * sent to those origins alone, and a POST carrying any other Origin header is
 * refused, so another site cannot submit enquiries through a visitor's
 * browser. Formspree and D1 stay server-side; the pages never see them.
 *
 * A claimed discount is sent as an offer code. The server, not the page,
 * decides what that code means for the page it came from, and stores and
 * emails that wording.
 *
 * GET lists enquiries as CSV for the owner, behind LEADS_ADMIN_TOKEN:
 *   curl -H "Authorization: Bearer <token>" https://themethodco.co/api/leads
 */
import { json } from "../_lib/stripe";

/** The parts of the D1 binding this file uses. */
interface D1 {
  prepare(sql: string): {
    bind(...values: unknown[]): { run(): Promise<unknown>; first<T>(): Promise<T | null>; all<T>(): Promise<{ results: T[] }> };
    run(): Promise<unknown>;
    all<T>(): Promise<{ results: T[] }>;
  };
}

interface Env {
  LEADS_DB?: D1;
  LEADS_ADMIN_TOKEN?: string;
  /** Formspree form that emails enquiries to the owner. Set to "off" to stop emails. */
  FORMSPREE_FORM_ID?: string;
  /** Overrides the Formspree origin. Only for local tests against a mock. */
  FORMSPREE_API_BASE?: string;
  /** Extra comma-separated origins allowed to post, e.g. http://localhost:8790 for local tests. */
  LEADS_EXTRA_ORIGINS?: string;
}

/** The Formspree form already used by the older contact pages. Not a secret: it is in their HTML. */
const DEFAULT_FORMSPREE_FORM = "xkovloyk";

type Ctx = { request: Request; env: Env };

/** Origins, other than this site's own, whose pages may post enquiries. */
const ALLOWED_ORIGINS = ["https://calculators.themethodco.co", "https://method-calculators.pages.dev"];
/** Preview deployments of the quote tool, e.g. https://abc123.method-calculators.pages.dev */
const PREVIEW_ORIGIN = /^https:\/\/[a-z0-9-]+\.method-calculators\.pages\.dev$/;

const CATEGORIES = [
  "Trades and home services",
  "Cleaning",
  "Beauty and wellness",
  "Health and fitness",
  "Food and hospitality",
  "Professional services",
  "Retail",
  "Other",
] as const;

const ENQUIRY_TYPES = ["High-Conversion Landing Pages", "Method Instant Quotes", "Both"] as const;

const GOALS = [
  // Landing pages
  "More enquiries or quote requests",
  "More bookings or appointments",
  "Launch a new offer or campaign",
  "Promote an event",
  "Sell a product or service online",
  // Method Instant Quotes
  "Show prices instantly on my website",
  "Get more quote requests",
  "Answer fewer \"how much?\" messages",
  "Qualify leads before I reply",
  "Something else",
] as const;

/** Which page the enquiry came from: stored as `source`. */
const SOURCES = ["landing-pages", "instant-quotes"] as const;
type Source = (typeof SOURCES)[number];

/** Offers a page can attach. The wording stored and emailed comes from here, never from the browser. */
const OFFERS: Record<string, Partial<Record<Source, string>>> = {
  exit20: {
    "instant-quotes": "20% exit offer: Method Instant Quotes for €120 instead of €150",
    "landing-pages": "20% exit offer: landing page from €200 instead of from €250",
  },
};

/** Hosts a stored source page may point at. Anything else is replaced by the request's origin. */
const PAGE_HOSTS = /^(themethodco\.co|www\.themethodco\.co|calculators\.themethodco\.co|([a-z0-9-]+\.)?method-(calculators|portfolio-preview)\.pages\.dev|localhost|127\.0\.0\.1)$/;

const SCHEMA = `CREATE TABLE IF NOT EXISTS leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  business_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  website TEXT,
  category TEXT NOT NULL,
  goal TEXT NOT NULL,
  notes TEXT,
  website_upgrade INTEGER NOT NULL DEFAULT 0,
  source TEXT,
  enquiry_type TEXT,
  offer TEXT,
  source_page TEXT
)`;

/** Columns added after the first version. Added to an older table on first use. */
const ADDED_COLUMNS = ["enquiry_type TEXT", "offer TEXT", "source_page TEXT"];

const LIMITS = { business_name: 120, contact_name: 120, email: 200, website: 300, notes: 2000, page: 300 };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function clean(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/** Accepts "example.ie" as well as full URLs. Returns "" for nothing, null for junk. */
function cleanWebsite(value: string): string | null {
  if (!value) return "";
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    return url.hostname.includes(".") ? url.toString() : null;
  } catch {
    return null;
  }
}

/** The page the visitor was on, if it is one of ours. Drops the fragment. */
function cleanPage(value: string, fallback: string): string {
  try {
    const url = new URL(value);
    if (!/^https?:$/.test(url.protocol) || !PAGE_HOSTS.test(url.hostname)) return fallback;
    url.hash = "";
    return url.toString().slice(0, LIMITS.page);
  } catch {
    return fallback;
  }
}

function originAllowed(origin: string, request: Request, env: Env): boolean {
  if (origin === new URL(request.url).origin) return true;
  if (ALLOWED_ORIGINS.includes(origin) || PREVIEW_ORIGIN.test(origin)) return true;
  const extra = (env.LEADS_EXTRA_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
  return extra.includes(origin);
}

/** CORS headers for an allowed cross-origin caller; none for anyone else. */
function corsHeaders(request: Request, env: Env): Record<string, string> {
  const origin = request.headers.get("origin");
  if (!origin || origin === new URL(request.url).origin || !originAllowed(origin, request, env)) return {};
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function withCors(res: Response, cors: Record<string, string>): Response {
  for (const [k, v] of Object.entries(cors)) res.headers.set(k, v);
  if (!cors.Vary) res.headers.append("Vary", "Origin");
  return res;
}

export async function onRequestOptions({ request, env }: Ctx): Promise<Response> {
  const cors = corsHeaders(request, env);
  if (!cors["Access-Control-Allow-Origin"]) return new Response(null, { status: 403, headers: { Vary: "Origin" } });
  return new Response(null, { status: 204, headers: cors });
}

export async function onRequestPost({ request, env }: Ctx): Promise<Response> {
  const origin = request.headers.get("origin");
  // Browsers always send Origin on a cross-site POST. Refuse the ones that are not ours.
  if (origin && !originAllowed(origin, request, env)) {
    return json({ ok: false, error: "origin_not_allowed" }, 403);
  }
  const cors = corsHeaders(request, env);
  const reply = (data: unknown, status = 200) => withCors(json(data, status), cors);

  let body: Record<string, unknown>;
  try {
    const type = request.headers.get("content-type") || "";
    body = type.includes("application/json")
      ? ((await request.json()) as Record<string, unknown>)
      : Object.fromEntries((await request.formData()).entries());
  } catch {
    return reply({ ok: false, error: "Could not read the form." }, 400);
  }

  // Honeypot: real visitors never see or fill this field. Answer like a
  // success so bots learn nothing, but store nothing.
  if (clean(body.company_fax, 50)) return reply({ ok: true });

  const source = clean(body.source, 40);
  const knownSource = (SOURCES as readonly string[]).includes(source) ? (source as Source) : null;
  const offerCode = clean(body.offer, 20);
  const fallbackPage = origin || new URL(request.url).origin;

  const lead = {
    business_name: clean(body.business_name, LIMITS.business_name),
    contact_name: clean(body.contact_name, LIMITS.contact_name),
    email: clean(body.email, LIMITS.email).toLowerCase(),
    website: cleanWebsite(clean(body.website, LIMITS.website)),
    category: clean(body.category, 80),
    goal: clean(body.goal, 80),
    notes: clean(body.notes, LIMITS.notes),
    website_upgrade: body.website_upgrade === true || body.website_upgrade === "on" || body.website_upgrade === "yes" ? 1 : 0,
    source: knownSource || "landing-pages",
    // Older copies of the landing page send no type: they were always landing page enquiries.
    enquiry_type: clean(body.enquiry_type, 60) || "High-Conversion Landing Pages",
    offer: "",
    source_page: cleanPage(clean(body.page, 2000), fallbackPage),
  };

  const errors: Record<string, string> = {};
  if (!lead.business_name) errors.business_name = "Please add your business name.";
  if (!lead.contact_name) errors.contact_name = "Please add your name.";
  if (!EMAIL.test(lead.email)) errors.email = "Please add a valid email address.";
  if (lead.website === null) errors.website = "That doesn't look like a web address.";
  if (!(CATEGORIES as readonly string[]).includes(lead.category)) errors.category = "Please choose a category.";
  if (!(ENQUIRY_TYPES as readonly string[]).includes(lead.enquiry_type)) errors.enquiry_type = "Please choose what you're asking about.";
  if (!(GOALS as readonly string[]).includes(lead.goal)) errors.goal = "Please choose the main goal.";
  if (offerCode) {
    const wording = OFFERS[offerCode]?.[lead.source];
    if (!wording) errors.offer = "That offer isn't available any more. Remove it and send your request without it.";
    else lead.offer = wording;
  }
  if (Object.keys(errors).length) return reply({ ok: false, errors }, 422);

  const [saved, emailed] = await Promise.all([save(env, lead), email(env, lead)]);
  if (saved.ok || emailed) return reply({ ok: true, id: saved.id, saved: saved.ok, emailed, offer: lead.offer || null }, 201);
  return reply({ ok: false, error: env.LEADS_DB ? "save_failed" : "not_configured" }, env.LEADS_DB ? 500 : 503);
}

type Lead = {
  business_name: string; contact_name: string; email: string; website: string | null; category: string;
  goal: string; notes: string; website_upgrade: number; source: string; enquiry_type: string; offer: string;
  source_page: string;
};

/** Set once this isolate has made sure the table and its newer columns exist. */
let schemaReady = false;

async function ensureSchema(db: D1): Promise<void> {
  if (schemaReady) return;
  await db.prepare(SCHEMA).run();
  for (const col of ADDED_COLUMNS) {
    try {
      await db.prepare(`ALTER TABLE leads ADD COLUMN ${col}`).run();
    } catch (err) {
      // "duplicate column name" means it is already there. Anything else is a real problem.
      if (!/duplicate column/i.test(err instanceof Error ? err.message : String(err))) throw err;
    }
  }
  schemaReady = true;
}

async function save(env: Env, lead: Lead): Promise<{ ok: boolean; id: number | null }> {
  if (!env.LEADS_DB) {
    console.error("LEADS_DB binding is missing: enquiry not stored");
    return { ok: false, id: null };
  }
  try {
    await ensureSchema(env.LEADS_DB);
    const row = await env.LEADS_DB.prepare(
      `INSERT INTO leads (business_name, contact_name, email, website, category, goal, notes, website_upgrade, source,
         enquiry_type, offer, source_page)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
    )
      .bind(lead.business_name, lead.contact_name, lead.email, lead.website || null, lead.category, lead.goal,
        lead.notes || null, lead.website_upgrade, lead.source, lead.enquiry_type, lead.offer || null, lead.source_page)
      .first<{ id: number }>();
    return { ok: true, id: row?.id ?? null };
  } catch (err) {
    console.error("Lead insert failed:", err instanceof Error ? err.message : String(err));
    return { ok: false, id: null };
  }
}

/** Emails the enquiry to the owner via Formspree. True only if Formspree accepted it. */
async function email(env: Env, lead: Lead): Promise<boolean> {
  const form = (env.FORMSPREE_FORM_ID || DEFAULT_FORMSPREE_FORM).trim();
  if (!form || form === "off") return false;
  const origin = (env.FORMSPREE_API_BASE || "https://formspree.io").replace(/\/+$/, "");
  const what = lead.enquiry_type === "Method Instant Quotes" ? "Method Instant Quotes enquiry"
    : lead.enquiry_type === "Both" ? "enquiry (landing page + Instant Quotes)" : "landing page request";
  try {
    const res = await fetch(`${origin}/f/${encodeURIComponent(form)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        _subject: `New ${what}: ${lead.business_name}${lead.offer ? " (20% offer claimed)" : ""}`,
        name: lead.contact_name,
        email: lead.email,
        business: lead.business_name,
        "enquiry type": lead.enquiry_type,
        "discount claimed": lead.offer || "None",
        website: lead.website || "None",
        category: lead.category,
        goal: lead.goal,
        "full website quote too": lead.website_upgrade ? "Yes" : "No",
        notes: lead.notes || "None",
        source: lead.source,
        "source page": lead.source_page,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) console.error("Formspree refused the enquiry:", res.status, (await res.text()).slice(0, 300));
    return res.ok;
  } catch (err) {
    console.error("Formspree request failed:", err instanceof Error ? err.message : String(err));
    return false;
  }
}

function csvCell(value: unknown): string {
  const text = value === null || value === undefined ? "" : String(value);
  // Leading = + - @ would run as a formula in a spreadsheet.
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

export async function onRequestGet({ request, env }: Ctx): Promise<Response> {
  const token = env.LEADS_ADMIN_TOKEN;
  const given = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token || given.length !== token.length || given !== token) {
    return json({ ok: false, error: "unauthorised" }, 401);
  }
  if (!env.LEADS_DB) return json({ ok: false, error: "not_configured" }, 503);

  await ensureSchema(env.LEADS_DB);
  const { results } = await env.LEADS_DB.prepare("SELECT * FROM leads ORDER BY id DESC LIMIT 1000").all<Record<string, unknown>>();
  const cols = ["id", "created_at", "enquiry_type", "offer", "business_name", "contact_name", "email", "website", "category",
    "goal", "notes", "website_upgrade", "source", "source_page"];
  const csv = [cols.join(","), ...results.map((r) => cols.map((c) => csvCell(r[c])).join(","))].join("\n");
  return new Response(csv, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Cache-Control": "no-store", "Content-Disposition": 'attachment; filename="leads.csv"' },
  });
}
