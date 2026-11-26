/**
 * Little Plot Books: shared server code for the Pages Functions under
 * functions/api/books.
 *
 * Storage: D1 (BOOKS_DB) for settings, drafts, orders, reviews and messages;
 * R2 (BOOKS_BUCKET) for customer reference photos and finished ebooks. Both are
 * private: nothing in R2 is ever served without a server-side check. Tables
 * create themselves on first use.
 *
 * Privacy: children's names, photos, story details and dedications never go to
 * console logs, payment providers, analytics or email attachments. Logs carry
 * order IDs and error messages only.
 */

export interface D1Result { meta?: { changes?: number } }
export interface D1Stmt {
  bind(...v: unknown[]): D1Stmt;
  run(): Promise<D1Result>;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
}
export interface D1 {
  prepare(sql: string): D1Stmt;
  batch(stmts: D1Stmt[]): Promise<D1Result[]>;
}
export interface R2Obj { arrayBuffer(): Promise<ArrayBuffer>; httpMetadata?: { contentType?: string }; size: number }
export interface R2 {
  put(key: string, value: ArrayBuffer | Uint8Array | string, opts?: { httpMetadata?: { contentType?: string } }): Promise<unknown>;
  get(key: string): Promise<R2Obj | null>;
  head(key: string): Promise<{ size: number } | null>;
  delete(key: string | string[]): Promise<void>;
}

export interface BooksEnv {
  ASSETS?: { fetch(url: URL): Promise<Response> };
  BOOKS_DB?: D1;
  BOOKS_BUCKET?: R2;
  BASE_URL?: string;
  /** Signs customer order links and owner sessions. Long random string. */
  BOOKS_TOKEN_SECRET?: string;
  /** Owner sign-in. Create the hash with `npm run books:owner-password`. */
  BOOKS_OWNER_EMAIL?: string;
  BOOKS_OWNER_PASSWORD_HASH?: string;
  STRIPE_SECRET_KEY?: string;
  STRIPE_WEBHOOK_SECRET?: string;
  STRIPE_API_BASE?: string;
  BOOKS_STRIPE_PAYPAL?: string;
  PAYPAL_CLIENT_ID?: string;
  PAYPAL_CLIENT_SECRET?: string;
  PAYPAL_ENV?: string;
  /** "on" enables the built-in test checkout. Never in production. */
  BOOKS_TEST_CHECKOUT?: string;
  BOOKS_TEST_WEBHOOK_SECRET?: string;
  /** "on" allows live (real money) keys. */
  BOOKS_LIVE_SALES?: string;
  RESEND_API_KEY?: string;
  BOOKS_EMAIL_FROM?: string;
  /** Where paid-order notifications go. */
  BOOKS_OWNER_NOTIFY_EMAIL?: string;
}

export interface Ctx<P extends string = string> {
  request: Request;
  env: BooksEnv;
  params: Record<P, string>;
  waitUntil: (p: Promise<unknown>) => void;
}

export const now = () => Date.now();

export function json(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store", "X-Robots-Tag": "noindex", ...headers },
  });
}

export class HttpError extends Error {
  constructor(readonly status: number, message: string, readonly extra: Record<string, unknown> = {}) {
    super(message);
  }
}

/** Wraps a handler: HttpError becomes JSON; anything else logs only the path and message. */
export function handle<P extends string>(fn: (c: Ctx<P>) => Promise<Response>) {
  return async (c: Ctx<P>) => {
    try {
      return await fn(c);
    } catch (err) {
      if (err instanceof HttpError) return json({ error: err.message, ...err.extra }, err.status);
      console.error("books error:", new URL(c.request.url).pathname, err instanceof Error ? err.message : String(err));
      return json({ error: "Something went wrong on our side. Please try again." }, 500);
    }
  };
}

export function baseUrl(env: BooksEnv, request?: Request): string {
  if (env.BASE_URL) return env.BASE_URL.replace(/\/+$/, "");
  if (request) return new URL(request.url).origin;
  return "https://little-plot-books.pages.dev";
}

export const testMode = (env: BooksEnv) => env.BOOKS_TEST_CHECKOUT === "on";

export function db(env: BooksEnv): D1 {
  if (!env.BOOKS_DB) throw new HttpError(503, "The shop isn't switched on yet (no database).");
  return env.BOOKS_DB;
}
export function bucket(env: BooksEnv): R2 {
  if (!env.BOOKS_BUCKET) throw new HttpError(503, "File storage isn't switched on yet.");
  return env.BOOKS_BUCKET;
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS lpb_settings (id INTEGER PRIMARY KEY CHECK (id = 1), data TEXT NOT NULL, updated_at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS lpb_drafts (
    id TEXT PRIMARY KEY, token_hash TEXT UNIQUE NOT NULL, brief TEXT NOT NULL,
    created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, expires_at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS lpb_cart_items (
    token_hash TEXT NOT NULL, draft_id TEXT NOT NULL, brief TEXT NOT NULL,
    created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL,
    PRIMARY KEY (token_hash, draft_id))`,
  `CREATE INDEX IF NOT EXISTS lpb_cart_expiry ON lpb_cart_items(expires_at)`,
  `CREATE TABLE IF NOT EXISTS lpb_uploads (
    id TEXT PRIMARY KEY, draft_id TEXT, order_id TEXT, character_id TEXT NOT NULL,
    r2_key TEXT NOT NULL, type TEXT NOT NULL, size INTEGER NOT NULL,
    created_at INTEGER NOT NULL, deleted_at INTEGER)`,
  `CREATE INDEX IF NOT EXISTS lpb_uploads_draft ON lpb_uploads(draft_id)`,
  `CREATE INDEX IF NOT EXISTS lpb_uploads_order ON lpb_uploads(order_id)`,
  `CREATE TABLE IF NOT EXISTS lpb_orders (
    id TEXT PRIMARY KEY, draft_id TEXT, brief TEXT NOT NULL, brief_hash TEXT NOT NULL,
    email TEXT NOT NULL, route TEXT NOT NULL, story TEXT, style TEXT NOT NULL, format TEXT NOT NULL,
    quote TEXT NOT NULL, total_cents INTEGER NOT NULL, currency TEXT NOT NULL,
    status TEXT NOT NULL, mode TEXT NOT NULL, provider TEXT NOT NULL, provider_ref TEXT, checkout_url TEXT, payment_ref TEXT,
    shipping TEXT, ebook_key TEXT, ebook_uploaded_at INTEGER, carrier TEXT, tracking TEXT,
    delivered_at INTEGER, photos_deleted_at INTEGER,
    created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, paid_at INTEGER)`,
  `CREATE INDEX IF NOT EXISTS lpb_orders_draft ON lpb_orders(draft_id)`,
  `CREATE INDEX IF NOT EXISTS lpb_orders_status ON lpb_orders(status)`,
  `CREATE TABLE IF NOT EXISTS lpb_events (id TEXT PRIMARY KEY, provider TEXT NOT NULL, type TEXT NOT NULL, order_id TEXT, received_at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS lpb_book_proofs (
    order_id TEXT PRIMARY KEY, version TEXT NOT NULL, file_key TEXT NOT NULL,
    state TEXT NOT NULL, message TEXT, updated_at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS lpb_notes (id INTEGER PRIMARY KEY AUTOINCREMENT, order_id TEXT NOT NULL, body TEXT NOT NULL, created_at INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS lpb_reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT, order_id TEXT, rating INTEGER NOT NULL, body TEXT NOT NULL,
    display_name TEXT, publish_ok INTEGER NOT NULL, status TEXT NOT NULL, verified INTEGER NOT NULL,
    created_at INTEGER NOT NULL, moderated_at INTEGER)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS lpb_reviews_order ON lpb_reviews(order_id) WHERE order_id IS NOT NULL`,
  `CREATE TABLE IF NOT EXISTS lpb_messages (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT NOT NULL, order_ref TEXT, body TEXT NOT NULL, created_at INTEGER NOT NULL, handled INTEGER NOT NULL DEFAULT 0)`,
  `CREATE TABLE IF NOT EXISTS lpb_outbox (
    id INTEGER PRIMARY KEY AUTOINCREMENT, order_id TEXT, kind TEXT NOT NULL, to_addr TEXT NOT NULL,
    subject TEXT NOT NULL, html TEXT, status TEXT NOT NULL, error TEXT, created_at INTEGER NOT NULL)`,
];

let schemaReady: Promise<void> | null = null;
export async function ready(env: BooksEnv): Promise<D1> {
  const d = db(env);
  if (!schemaReady) {
    schemaReady = d.batch(SCHEMA.map((s) => d.prepare(s))).then(() => undefined);
    schemaReady.catch(() => (schemaReady = null));
  }
  await schemaReady;
  return d;
}

export function changes(r: D1Result): number {
  return r.meta?.changes ?? 0;
}

// ---------------------------------------------------------------------------
// Crypto and tokens
// ---------------------------------------------------------------------------

const enc = new TextEncoder();

export function b64url(bytes: ArrayBuffer | Uint8Array): string {
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = "";
  for (const x of b) s += String.fromCharCode(x);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
export function fromB64(s: string): Uint8Array {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}
export function randomToken(bytes = 24): string {
  return b64url(crypto.getRandomValues(new Uint8Array(bytes)));
}
export async function sha256Hex(data: string | ArrayBuffer | Uint8Array): Promise<string> {
  const h = await crypto.subtle.digest("SHA-256", typeof data === "string" ? enc.encode(data) : data);
  return [...new Uint8Array(h)].map((x) => x.toString(16).padStart(2, "0")).join("");
}
export async function hmacHex(secret: string, msg: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(msg));
  return [...new Uint8Array(sig)].map((x) => x.toString(16).padStart(2, "0")).join("");
}
export function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

export function secret(env: BooksEnv): string {
  if (!env.BOOKS_TOKEN_SECRET || env.BOOKS_TOKEN_SECRET.length < 24) throw new HttpError(503, "Private links aren't configured (BOOKS_TOKEN_SECRET).");
  return env.BOOKS_TOKEN_SECRET;
}

/** The customer's private order key: "<orderId>.<signature>". Derived, so it can be re-sent. */
export async function orderKey(env: BooksEnv, orderId: string): Promise<string> {
  return `${orderId}.${(await hmacHex(secret(env), `order:${orderId}`)).slice(0, 40)}`;
}
export async function checkOrderKey(env: BooksEnv, key: string | undefined): Promise<string> {
  const [id, sig] = (key || "").split(".");
  const bad = new HttpError(404, "This link isn't valid. Check you copied all of it.");
  if (!id || !sig || !/^LPB-[A-Z0-9]{6}$/.test(id)) throw bad;
  const want = (await hmacHex(secret(env), `order:${id}`)).slice(0, 40);
  if (!safeEqual(want, sig)) throw bad;
  return id;
}
export async function orderUrl(env: BooksEnv, orderId: string, request?: Request): Promise<string> {
  return `${baseUrl(env, request)}/books/order/${await orderKey(env, orderId)}`;
}

export function newOrderId(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return "LPB-" + [...crypto.getRandomValues(new Uint8Array(6))].map((x) => alphabet[x % alphabet.length]).join("");
}

// ---------------------------------------------------------------------------
// Cookies and request helpers
// ---------------------------------------------------------------------------

export function readCookie(request: Request, name: string): string | undefined {
  for (const part of (request.headers.get("Cookie") || "").split(/;\s*/)) {
    const i = part.indexOf("=");
    if (i > 0 && part.slice(0, i) === name) return decodeURIComponent(part.slice(i + 1));
  }
  return undefined;
}
export function cookie(request: Request, name: string, value: string, maxAge: number, path: string, sameSite: "Lax" | "Strict" = "Lax"): string {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${name}=${encodeURIComponent(value)}; Path=${path}; HttpOnly; SameSite=${sameSite}; Max-Age=${maxAge}${secure}`;
}

/** Same-origin check for state-changing browser requests. */
export function sameOrigin(c: Ctx): void {
  const origin = c.request.headers.get("Origin");
  if (origin && origin !== new URL(c.request.url).origin && origin !== baseUrl(c.env)) throw new HttpError(403, "Requests from other sites are not allowed.");
}

export async function readJson<T = Record<string, unknown>>(request: Request, maxBytes = 48_000): Promise<T> {
  const text = await request.text();
  if (text.length > maxBytes) throw new HttpError(413, "That's more text than we expected.");
  try {
    return (text ? JSON.parse(text) : {}) as T;
  } catch {
    throw new HttpError(400, "We couldn't read that request.");
  }
}

export function maskEmail(e: string): string {
  const [u, d] = e.split("@");
  return `${u.slice(0, 2)}${"•".repeat(Math.max(1, Math.min(6, u.length - 2)))}@${d}`;
}
