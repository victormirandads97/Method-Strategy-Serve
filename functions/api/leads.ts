/**
 * /api/leads: enquiries from the High-Conversion Landing Pages funnel.
 *
 * POST stores one enquiry in the D1 database bound as LEADS_DB and emails it
 * to the owner through Formspree (the same form the older pages use). It
 * answers { ok: true } once at least one of the two has worked, with
 * `saved` and `emailed` saying which. If neither worked it answers an error,
 * so the form never shows a success it did not achieve.
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
}

/** The Formspree form already used by the older contact pages. Not a secret: it is in their HTML. */
const DEFAULT_FORMSPREE_FORM = "xkovloyk";

type Ctx = { request: Request; env: Env };

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

const GOALS = [
  "More enquiries or quote requests",
  "More bookings or appointments",
  "Launch a new offer or campaign",
  "Promote an event",
  "Sell a product or service online",
  "Something else",
] as const;

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
  source TEXT
)`;

const LIMITS = { business_name: 120, contact_name: 120, email: 200, website: 300, notes: 2000, source: 200 };
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

export async function onRequestPost({ request, env }: Ctx): Promise<Response> {
  let body: Record<string, unknown>;
  try {
    const type = request.headers.get("content-type") || "";
    body = type.includes("application/json")
      ? ((await request.json()) as Record<string, unknown>)
      : Object.fromEntries((await request.formData()).entries());
  } catch {
    return json({ ok: false, error: "Could not read the form." }, 400);
  }

  // Honeypot: real visitors never see or fill this field. Answer like a
  // success so bots learn nothing, but store nothing.
  if (clean(body.company_fax, 50)) return json({ ok: true });

  const lead = {
    business_name: clean(body.business_name, LIMITS.business_name),
    contact_name: clean(body.contact_name, LIMITS.contact_name),
    email: clean(body.email, LIMITS.email).toLowerCase(),
    website: cleanWebsite(clean(body.website, LIMITS.website)),
    category: clean(body.category, 80),
    goal: clean(body.goal, 80),
    notes: clean(body.notes, LIMITS.notes),
    website_upgrade: body.website_upgrade === true || body.website_upgrade === "on" || body.website_upgrade === "yes" ? 1 : 0,
    source: clean(body.source, LIMITS.source),
  };

  const errors: Record<string, string> = {};
  if (!lead.business_name) errors.business_name = "Please add your business name.";
  if (!lead.contact_name) errors.contact_name = "Please add your name.";
  if (!EMAIL.test(lead.email)) errors.email = "Please add a valid email address.";
  if (lead.website === null) errors.website = "That doesn't look like a web address.";
  if (!(CATEGORIES as readonly string[]).includes(lead.category)) errors.category = "Please choose a category.";
  if (!(GOALS as readonly string[]).includes(lead.goal)) errors.goal = "Please choose the main goal.";
  if (Object.keys(errors).length) return json({ ok: false, errors }, 422);

  const [saved, emailed] = await Promise.all([save(env, lead), email(env, lead)]);
  if (saved.ok || emailed) return json({ ok: true, id: saved.id, saved: saved.ok, emailed }, 201);
  return json({ ok: false, error: env.LEADS_DB ? "save_failed" : "not_configured" }, env.LEADS_DB ? 500 : 503);
}

type Lead = {
  business_name: string; contact_name: string; email: string; website: string | null; category: string;
  goal: string; notes: string; website_upgrade: number; source: string;
};

async function save(env: Env, lead: Lead): Promise<{ ok: boolean; id: number | null }> {
  if (!env.LEADS_DB) {
    console.error("LEADS_DB binding is missing: enquiry not stored");
    return { ok: false, id: null };
  }
  try {
    await env.LEADS_DB.prepare(SCHEMA).run();
    const row = await env.LEADS_DB.prepare(
      `INSERT INTO leads (business_name, contact_name, email, website, category, goal, notes, website_upgrade, source)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
    )
      .bind(lead.business_name, lead.contact_name, lead.email, lead.website || null, lead.category, lead.goal,
        lead.notes || null, lead.website_upgrade, lead.source || null)
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
  try {
    const res = await fetch(`${origin}/f/${encodeURIComponent(form)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        _subject: `New landing page request: ${lead.business_name}`,
        name: lead.contact_name,
        email: lead.email,
        business: lead.business_name,
        website: lead.website || "None",
        category: lead.category,
        goal: lead.goal,
        "full website quote too": lead.website_upgrade ? "Yes" : "No",
        notes: lead.notes || "None",
        source: lead.source || "landing-pages",
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

  await env.LEADS_DB.prepare(SCHEMA).run();
  const { results } = await env.LEADS_DB.prepare("SELECT * FROM leads ORDER BY id DESC LIMIT 1000").all<Record<string, unknown>>();
  const cols = ["id", "created_at", "business_name", "contact_name", "email", "website", "category", "goal", "notes", "website_upgrade", "source"];
  const csv = [cols.join(","), ...results.map((r) => cols.map((c) => csvCell(r[c])).join(","))].join("\n");
  return new Response(csv, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Cache-Control": "no-store", "Content-Disposition": 'attachment; filename="leads.csv"' },
  });
}
