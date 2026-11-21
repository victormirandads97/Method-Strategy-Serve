/**
 * /api/book-waitlist: the Little Plot Books launch list (themethodco.co/books).
 *
 * Shares the site's existing infrastructure: the same D1 database bound as
 * LEADS_DB (its own `book_waitlist` table, created on first use) and the same
 * Formspree form that emails new enquiries to the owner. No new settings are
 * needed once LEADS_DB is bound.
 *
 * POST stores one adult's email and an optional story choice. It never takes
 * child details, photos or payments. It answers { ok: true } only once the
 * signup was saved or emailed, so the page never shows a success it did not
 * achieve. Signing up twice with the same email updates the first row.
 *
 * Only this site's own pages may post (same origin). Campaign attribution
 * (utm_* and, when the visitor accepted ad cookies, fbclid) is stored with
 * the signup when the page sends it.
 *
 * GET lists the launch list as CSV for the owner, behind LEADS_ADMIN_TOKEN:
 *   curl -H "Authorization: Bearer <token>" https://themethodco.co/api/book-waitlist
 */
import { json } from "../_lib/stripe";

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
  FORMSPREE_FORM_ID?: string;
  FORMSPREE_API_BASE?: string;
}

type Ctx = { request: Request; env: Env };

const DEFAULT_FORMSPREE_FORM = "xkovloyk";

/** Keep in step with STORIES in client/src/books/config.ts. */
const STORIES: Record<string, string> = {
  "dinosaur-next-door": "The Dinosaur Next Door",
  "moonlight-express": "The Moonlight Express",
  "secret-garden-door": "The Secret Garden Door",
};

const ATTRIBUTION = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid"] as const;
type AttributionKey = (typeof ATTRIBUTION)[number];

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PAGE_HOSTS = /^(themethodco\.co|www\.themethodco\.co|([a-z0-9-]+\.)?method-portfolio-preview\.pages\.dev|localhost|127\.0\.0\.1)$/;

const SCHEMA = `CREATE TABLE IF NOT EXISTS book_waitlist (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT,
  email TEXT NOT NULL UNIQUE,
  story TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_content TEXT,
  utm_term TEXT,
  fbclid TEXT,
  source_page TEXT
)`;

function clean(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function cleanPage(value: string, fallback: string): string {
  try {
    const url = new URL(value);
    if (!/^https?:$/.test(url.protocol) || !PAGE_HOSTS.test(url.hostname)) return fallback;
    url.hash = "";
    url.search = ""; // campaign tags are stored in their own columns; click ids only with consent
    return url.toString().slice(0, 300);
  } catch {
    return fallback;
  }
}

export async function onRequestPost({ request, env }: Ctx): Promise<Response> {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return json({ ok: false, error: "origin_not_allowed" }, 403);
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ ok: false, error: "Could not read the form." }, 400);
  }

  // Honeypot: hidden from people. Answer like a success, store nothing.
  if (clean(body.company_fax, 50)) return json({ ok: true });

  const email = clean(body.email, 200).toLowerCase();
  const storyId = clean(body.story, 40);
  const errors: Record<string, string> = {};
  if (!EMAIL.test(email)) errors.email = "Please add a valid email address.";
  if (storyId && !STORIES[storyId]) errors.story = "Please choose one of the stories, or leave it blank.";
  if (Object.keys(errors).length) return json({ ok: false, errors }, 422);

  const attribution = {} as Record<AttributionKey, string>;
  const given = (body.attribution && typeof body.attribution === "object" ? body.attribution : {}) as Record<string, unknown>;
  for (const key of ATTRIBUTION) attribution[key] = clean(given[key], key === "fbclid" ? 500 : 150);

  const signup = {
    email,
    story: storyId ? STORIES[storyId] : "",
    attribution,
    source_page: cleanPage(clean(body.page, 2000), new URL(request.url).origin + "/books"),
  };

  const [saved, emailed] = await Promise.all([save(env, signup), notify(env, signup)]);
  if (saved || emailed) return json({ ok: true, saved, emailed }, 201);
  return json({ ok: false, error: env.LEADS_DB ? "save_failed" : "not_configured" }, env.LEADS_DB ? 500 : 503);
}

type Signup = { email: string; story: string; attribution: Record<AttributionKey, string>; source_page: string };

let schemaReady = false;

async function save(env: Env, s: Signup): Promise<boolean> {
  if (!env.LEADS_DB) {
    console.error("LEADS_DB binding is missing: book waitlist signup not stored");
    return false;
  }
  try {
    if (!schemaReady) {
      await env.LEADS_DB.prepare(SCHEMA).run();
      schemaReady = true;
    }
    const a = s.attribution;
    // A repeat signup keeps the first row and its first-touch attribution,
    // and only updates the story when a new one was chosen.
    await env.LEADS_DB.prepare(
      `INSERT INTO book_waitlist (email, story, utm_source, utm_medium, utm_campaign, utm_content, utm_term, fbclid, source_page)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(email) DO UPDATE SET
         story = COALESCE(excluded.story, book_waitlist.story),
         updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')`,
    )
      .bind(s.email, s.story || null, a.utm_source || null, a.utm_medium || null, a.utm_campaign || null,
        a.utm_content || null, a.utm_term || null, a.fbclid || null, s.source_page)
      .run();
    return true;
  } catch (err) {
    console.error("Book waitlist insert failed:", err instanceof Error ? err.message : String(err));
    return false;
  }
}

async function notify(env: Env, s: Signup): Promise<boolean> {
  const form = (env.FORMSPREE_FORM_ID || DEFAULT_FORMSPREE_FORM).trim();
  if (!form || form === "off") return false;
  const base = (env.FORMSPREE_API_BASE || "https://formspree.io").replace(/\/+$/, "");
  const a = s.attribution;
  try {
    const res = await fetch(`${base}/f/${encodeURIComponent(form)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        _subject: "New Little Plot Books launch list signup",
        email: s.email,
        "enquiry type": "Little Plot Books launch list",
        story: s.story || "Not chosen",
        campaign: [a.utm_source, a.utm_medium, a.utm_campaign, a.utm_content].filter(Boolean).join(" / ") || "None",
        "source page": s.source_page,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) console.error("Formspree refused the signup:", res.status, (await res.text()).slice(0, 300));
    return res.ok;
  } catch (err) {
    console.error("Formspree request failed:", err instanceof Error ? err.message : String(err));
    return false;
  }
}

function csvCell(value: unknown): string {
  const text = value === null || value === undefined ? "" : String(value);
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

export async function onRequestGet({ request, env }: Ctx): Promise<Response> {
  const token = env.LEADS_ADMIN_TOKEN;
  const given = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token || given.length !== token.length || given !== token) return json({ ok: false, error: "unauthorised" }, 401);
  if (!env.LEADS_DB) return json({ ok: false, error: "not_configured" }, 503);
  await env.LEADS_DB.prepare(SCHEMA).run();
  const { results } = await env.LEADS_DB.prepare("SELECT * FROM book_waitlist ORDER BY id DESC LIMIT 5000").all<Record<string, unknown>>();
  const cols = ["id", "created_at", "updated_at", "email", "story", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid", "source_page"];
  const csv = [cols.join(","), ...results.map((r) => cols.map((c) => csvCell(r[c])).join(","))].join("\n");
  return new Response(csv, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Cache-Control": "no-store", "Content-Disposition": 'attachment; filename="book-waitlist.csv"' },
  });
}
