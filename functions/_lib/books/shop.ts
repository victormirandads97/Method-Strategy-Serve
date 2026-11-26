/**
 * Little Plot Books shop logic shared by the route files.
 */
import {
  DEFAULT_SETTINGS, STATUS_LABEL, euro, mergeSettings, sanitiseBrief, storyTitle, styleInfo,
  type Brief, type OrderStatus, type Quote, type ShopSettings,
} from "../../../shared/books/catalog";
import {
  BooksEnv, Ctx, HttpError, bucket, changes, cookie, fromB64, hmacHex, now, orderUrl, randomToken, readCookie, ready,
  safeEqual, secret, sha256Hex, baseUrl, b64url,
} from "./core";
import { sendMail } from "./email";

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export async function loadSettings(env: BooksEnv): Promise<ShopSettings> {
  const d = await ready(env);
  const row = await d.prepare("SELECT data FROM lpb_settings WHERE id = 1").first<{ data: string }>();
  return row ? mergeSettings(JSON.parse(row.data)) : mergeSettings(DEFAULT_SETTINGS);
}
export async function saveSettings(env: BooksEnv, s: ShopSettings): Promise<void> {
  const d = await ready(env);
  await d.prepare("INSERT INTO lpb_settings (id, data, updated_at) VALUES (1, ?, ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at")
    .bind(JSON.stringify(s), now()).run();
}

// ---------------------------------------------------------------------------
// Drafts (the builder's private, expiring session)
// ---------------------------------------------------------------------------

export const DRAFT_COOKIE = "lpb_brief";

export interface DraftRow { id: string; token_hash: string; brief: string; created_at: number; updated_at: number; expires_at: number }
export interface UploadRow { id: string; draft_id: string | null; order_id: string | null; character_id: string; r2_key: string; type: string; size: number; created_at: number; deleted_at: number | null }

export async function currentDraft(c: Ctx): Promise<DraftRow | null> {
  const token = readCookie(c.request, DRAFT_COOKIE);
  if (!token) return null;
  const d = await ready(c.env);
  const row = await d.prepare("SELECT * FROM lpb_drafts WHERE token_hash = ?").bind(await sha256Hex(token)).first<DraftRow>();
  if (!row || row.expires_at < now()) return null;
  return row;
}

export async function ensureDraft(c: Ctx): Promise<{ row: DraftRow; setCookie?: string }> {
  const existing = await currentDraft(c);
  if (existing) return { row: existing };
  const s = await loadSettings(c.env);
  const ms = s.draftRetentionDays * 86_400_000;
  const token = randomToken();
  const t = now();
  const row: DraftRow = { id: crypto.randomUUID(), token_hash: await sha256Hex(token), brief: "{}", created_at: t, updated_at: t, expires_at: t + ms };
  const d = await ready(c.env);
  await d.prepare("INSERT INTO lpb_drafts (id, token_hash, brief, created_at, updated_at, expires_at) VALUES (?, ?, ?, ?, ?, ?)")
    .bind(row.id, row.token_hash, row.brief, t, t, row.expires_at).run();
  return { row, setCookie: cookie(c.request, DRAFT_COOKIE, token, ms / 1000, "/api/books") };
}

export async function draftUploads(env: BooksEnv, draftId: string): Promise<UploadRow[]> {
  const d = await ready(env);
  const { results } = await d.prepare("SELECT * FROM lpb_uploads WHERE draft_id = ? AND deleted_at IS NULL ORDER BY created_at").bind(draftId).all<UploadRow>();
  return results;
}

/** The brief with server-side photo facts attached to each character. */
export async function draftBrief(env: BooksEnv, row: DraftRow): Promise<Brief> {
  const b = sanitiseBrief(JSON.parse(row.brief));
  const ups = await draftUploads(env, row.id);
  for (const ch of b.characters) {
    const u = [...ups].reverse().find((x) => x.character_id === ch.id);
    ch.photo = u ? { id: u.id, type: u.type, size: u.size } : null;
  }
  return b;
}

export async function deleteUpload(env: BooksEnv, u: UploadRow) {
  const d = await ready(env);
  await bucket(env).delete(u.r2_key);
  await d.prepare("UPDATE lpb_uploads SET deleted_at = ? WHERE id = ?").bind(now(), u.id).run();
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

export interface OrderRow {
  id: string; draft_id: string | null; brief: string; brief_hash: string; email: string; route: string; story: string | null;
  style: string; format: string; quote: string; total_cents: number; currency: string; status: OrderStatus; mode: string;
  provider: string; provider_ref: string | null; checkout_url: string | null; payment_ref: string | null; shipping: string | null;
  ebook_key: string | null; ebook_uploaded_at: number | null; carrier: string | null; tracking: string | null;
  delivered_at: number | null; photos_deleted_at: number | null; created_at: number; updated_at: number; paid_at: number | null;
}

export async function getOrder(env: BooksEnv, id: string): Promise<OrderRow> {
  const d = await ready(env);
  const row = await d.prepare("SELECT * FROM lpb_orders WHERE id = ?").bind(id).first<OrderRow>();
  if (!row) throw new HttpError(404, "We couldn't find that order.");
  return row;
}

export function orderTitle(o: OrderRow, b: Brief): string {
  const lead = b.characters[0]?.name || "Your child";
  return o.route === "preset" && b.story ? storyTitle(b.story, lead) : `${lead}’s story`;
}

/** Marks an order paid once. Repeated or late notifications change nothing the second time. */
export async function markPaid(env: BooksEnv, orderId: string, info: { paymentRef: string; shipping: unknown; amountCents: number; currency: string }, request?: Request): Promise<boolean> {
  const d = await ready(env);
  const o = await getOrder(env, orderId);
  if (info.amountCents !== o.total_cents || info.currency.toUpperCase() !== o.currency) {
    await addNote(env, orderId, `Payment received for ${info.amountCents} ${info.currency}, but the order total is ${o.total_cents} ${o.currency}. Check the payment before making the book.`);
    return false;
  }
  const r = await d
    .prepare(`UPDATE lpb_orders SET status = 'paid', paid_at = ?, payment_ref = ?, shipping = ?, updated_at = ?
              WHERE id = ? AND status IN ('awaiting_payment', 'payment_failed', 'cancelled')`)
    .bind(now(), info.paymentRef, JSON.stringify(info.shipping ?? null), now(), orderId)
    .run();
  if (changes(r) !== 1) return false;
  // The draft has done its job. Its uploads stay, now owned by the order.
  if (o.draft_id) await d.prepare("DELETE FROM lpb_drafts WHERE id = ?").bind(o.draft_id).run();
  const b = JSON.parse(o.brief) as Brief;
  const q = JSON.parse(o.quote) as Quote;
  const link = await orderUrl(env, orderId, request);
  await sendMail(env, {
    to: o.email,
    subject: `Order ${orderId} confirmed: thank you!`,
    kind: "receipt",
    orderId,
    lines: [
      `Thank you! We've received your payment of ${euro(o.total_cents)} for order ${orderId}.`,
      `What happens next: we write and illustrate your book from the details you gave us. If we need anything else, we'll email you at this address.`,
      o.format === "ebook" ? "When it's ready, we'll email you a private link to download your ebook." : "We’ll email you a private PDF to review before printing. Once you approve it, the PDF is yours to keep and we’ll prepare your book for shipping.",
      `Order summary: ${q.saleLabel ? `book ${euro(q.bookCents)} (${q.saleLabel})` : `book ${euro(q.bookCents)}`}${q.extraCharacters ? `, ${q.extraCharacters} extra character${q.extraCharacters > 1 ? "s" : ""} ${euro(q.extrasCents)}` : ""}${q.shippingCents ? `, shipping ${euro(q.shippingCents)}` : ""}. Style: ${styleInfo(b.style)?.name ?? ""}.`,
    ],
    button: { label: "View your order", url: link },
  });
  if (env.BOOKS_OWNER_NOTIFY_EMAIL) {
    await sendMail(env, {
      to: env.BOOKS_OWNER_NOTIFY_EMAIL,
      subject: `New paid order ${orderId} (${o.format}${o.mode === "test" ? ", TEST" : ""})`,
      kind: "owner_paid",
      orderId,
      lines: [`${euro(o.total_cents)} paid. Open the dashboard to see the brief and photos.`],
      button: { label: "Open the order", url: `${baseUrl(env, request)}/books/owner/orders/${orderId}` },
      footer: "Owner notification. Customer details stay in the dashboard.",
    });
  }
  return true;
}

export async function addNote(env: BooksEnv, orderId: string, body: string) {
  const d = await ready(env);
  await d.prepare("INSERT INTO lpb_notes (order_id, body, created_at) VALUES (?, ?, ?)").bind(orderId, body.slice(0, 2000), now()).run();
}

export async function orderUploads(env: BooksEnv, orderId: string): Promise<UploadRow[]> {
  const d = await ready(env);
  const { results } = await d.prepare("SELECT * FROM lpb_uploads WHERE order_id = ? AND deleted_at IS NULL ORDER BY created_at").bind(orderId).all<UploadRow>();
  return results;
}

export async function deleteOrderPhotos(env: BooksEnv, orderId: string) {
  for (const u of await orderUploads(env, orderId)) await deleteUpload(env, u);
  const d = await ready(env);
  await d.prepare("UPDATE lpb_orders SET photos_deleted_at = ?, updated_at = ? WHERE id = ?").bind(now(), now(), orderId).run();
}

/**
 * Retention clean-up. Runs opportunistically (owner dashboard, draft loads):
 * - expired drafts and their photos when no paid order uses them;
 * - photos of delivered or cancelled orders older than photoRetentionDays;
 * - photos of orders never paid within draftRetentionDays.
 */
export async function sweep(env: BooksEnv) {
  const d = await ready(env);
  const s = await loadSettings(env);
  const t = now();
  const { results: drafts } = await d.prepare("SELECT id FROM lpb_drafts WHERE expires_at < ? LIMIT 25").bind(t).all<{ id: string }>();
  for (const dr of drafts) {
    const { results: ups } = await d.prepare("SELECT * FROM lpb_uploads WHERE draft_id = ? AND deleted_at IS NULL AND (order_id IS NULL OR order_id IN (SELECT id FROM lpb_orders WHERE status IN ('awaiting_payment','payment_failed','cancelled')))").bind(dr.id).all<UploadRow>();
    for (const u of ups) await deleteUpload(env, u);
    await d.prepare("DELETE FROM lpb_drafts WHERE id = ?").bind(dr.id).run();
  }
  const cutoff = t - s.photoRetentionDays * 86_400_000;
  const { results: done } = await d
    .prepare("SELECT id FROM lpb_orders WHERE photos_deleted_at IS NULL AND ((status = 'delivered' AND delivered_at < ?) OR (status = 'cancelled' AND updated_at < ?)) LIMIT 25")
    .bind(cutoff, cutoff).all<{ id: string }>();
  for (const o of done) await deleteOrderPhotos(env, o.id);
  const unpaid = t - s.draftRetentionDays * 86_400_000;
  const { results: stale } = await d
    .prepare("SELECT id FROM lpb_orders WHERE photos_deleted_at IS NULL AND status IN ('awaiting_payment','payment_failed') AND created_at < ? LIMIT 25")
    .bind(unpaid).all<{ id: string }>();
  for (const o of stale) await deleteOrderPhotos(env, o.id);
}

export function statusLabel(s: OrderStatus) {
  return STATUS_LABEL[s] ?? s;
}

// ---------------------------------------------------------------------------
// Owner sign-in: PBKDF2 password hash, HMAC-signed session cookie
// ---------------------------------------------------------------------------

export const OWNER_COOKIE = "lpb_owner";
const SESSION_HOURS = 12;

/** Format: pbkdf2$<iterations>$<salt b64url>$<hash b64url> (SHA-256, 32 bytes). */
export async function hashPassword(password: string, iterations = 100_000, salt = crypto.getRandomValues(new Uint8Array(16))): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations }, key, 256);
  return `pbkdf2$${iterations}$${b64url(salt)}$${b64url(bits)}`;
}
async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [alg, it, salt, hash] = stored.split("$");
  if (alg !== "pbkdf2" || !it || !salt || !hash) return false;
  const again = await hashPassword(password, Number(it), fromB64(salt));
  return safeEqual(again.split("$")[3], hash);
}

const attempts = new Map<string, { n: number; at: number }>();

export async function ownerLogin(c: Ctx, email: string, password: string): Promise<string> {
  const { BOOKS_OWNER_EMAIL: want, BOOKS_OWNER_PASSWORD_HASH: hash } = c.env;
  if (!want || !hash) throw new HttpError(503, "Owner sign-in isn't configured (BOOKS_OWNER_EMAIL and BOOKS_OWNER_PASSWORD_HASH).");
  const ip = c.request.headers.get("CF-Connecting-IP") || "local";
  const a = attempts.get(ip);
  if (a && a.n >= 8 && now() - a.at < 15 * 60_000) throw new HttpError(429, "Too many attempts. Try again in 15 minutes.");
  const ok = email.trim().toLowerCase() === want.trim().toLowerCase() && (await verifyPassword(password, hash));
  if (!ok) {
    attempts.set(ip, { n: (a && now() - a.at < 15 * 60_000 ? a.n : 0) + 1, at: now() });
    await new Promise((r) => setTimeout(r, 400));
    throw new HttpError(401, "That email and password don't match.");
  }
  attempts.delete(ip);
  const exp = now() + SESSION_HOURS * 3600_000;
  const payload = `owner.${exp}`;
  return cookie(c.request, OWNER_COOKIE, `${payload}.${await hmacHex(secret(c.env), `session:${payload}`)}`, SESSION_HOURS * 3600, "/api/books/owner", "Strict");
}

export async function requireOwner(c: Ctx): Promise<void> {
  const v = readCookie(c.request, OWNER_COOKIE) || "";
  const [who, exp, sig] = v.split(".");
  if (who !== "owner" || !exp || !sig || Number(exp) < now()) throw new HttpError(401, "Please sign in.");
  const want = await hmacHex(secret(c.env), `session:owner.${exp}`);
  if (!safeEqual(want, sig)) throw new HttpError(401, "Please sign in.");
}

/** Short-lived signed link for one private file. Still requires the owner session. */
export async function signedFileUrl(env: BooksEnv, uploadId: string, minutes = 5): Promise<string> {
  const exp = now() + minutes * 60_000;
  const sig = (await hmacHex(secret(env), `file:${uploadId}:${exp}`)).slice(0, 32);
  return `/api/books/owner/file?u=${encodeURIComponent(uploadId)}&exp=${exp}&sig=${sig}`;
}
export async function checkFileSig(env: BooksEnv, uploadId: string, exp: string, sig: string) {
  if (!uploadId || !exp || !sig || Number(exp) < now()) throw new HttpError(403, "This link has expired. Refresh the order to get a new one.");
  const want = (await hmacHex(secret(env), `file:${uploadId}:${exp}`)).slice(0, 32);
  if (!safeEqual(want, sig)) throw new HttpError(403, "This link isn't valid.");
}

export { statusLabel as label, STATUS_LABEL };
