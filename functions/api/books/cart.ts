import { availablePrintFormats, euro, extraCount, quote, sanitiseBrief, storyTitle, styleInfo, validateBrief, type Brief } from "../../../shared/books/catalog";
import { cookie, handle, HttpError, json, now, randomToken, readCookie, readJson, ready, sameOrigin, sha256Hex, type Ctx } from "../../_lib/books/core";
import { describeBook, notifyBookRequest } from "../../_lib/books/requests";
import { currentDraft, DRAFT_COOKIE, draftBrief, loadSettings } from "../../_lib/books/shop";

const CART_COOKIE = "lpb_cart";
const MAX_BOOKS = 8;
const MAX_AGE = 7 * 86_400;

type CartRow = { draft_id: string; brief: string };
type Shop = Awaited<ReturnType<typeof loadSettings>>;
type CartDb = Awaited<ReturnType<typeof ready>>;

function refFor(hash: string) { return `cart:${hash.slice(0, 24)}`; }

function submitted(d: CartDb, hash: string) {
  return d.prepare("SELECT id FROM lpb_messages WHERE order_ref = ?").bind(refFor(hash)).first();
}

async function entries(d: CartDb, hash: string) {
  const { results } = await d.prepare("SELECT draft_id, brief FROM lpb_cart_items WHERE token_hash = ? AND expires_at > ? ORDER BY created_at, draft_id")
    .bind(hash, now()).all<CartRow>();
  return results;
}

function cartItem(row: CartRow, settings: Shop) {
  const brief = sanitiseBrief(JSON.parse(row.brief));
  const lead = brief.characters[0]?.name || "Your child";
  const title = brief.route === "preset" && brief.story ? storyTitle(brief.story, lead) : `${lead}’s own story`;
  if (!brief.format) throw new HttpError(409, "A cart item no longer has a cover selected. Remove it and start a new book.");
  return { id: row.draft_id, brief, title, style: styleInfo(brief.style)?.name, available: availablePrintFormats(settings).some((format) => format === brief.format),
    price: quote(settings, brief.format, extraCount(brief)) };
}

export const onRequestGet = handle(async (c: Ctx) => {
  const token = readCookie(c.request, CART_COOKIE);
  if (!token) return json({ items: [] });
  const [hash, d, settings] = await Promise.all([sha256Hex(token), ready(c.env), loadSettings(c.env)]);
  c.waitUntil(d.prepare("DELETE FROM lpb_cart_items WHERE expires_at <= ?").bind(now()).run().catch(() => undefined));
  const rows = await entries(d, hash);
  return json({ items: rows.map((row) => {
    const { brief, ...item } = cartItem(row, settings);
    return item;
  }) });
});

export const onRequestPost = handle(async (c: Ctx) => {
  sameOrigin(c);
  const body = await readJson<{ action?: string; id?: string; email?: string; name?: string; items?: string[]; totalCents?: number }>(c.request);
  const d = await ready(c.env);
  let token = readCookie(c.request, CART_COOKIE);
  let hash = token ? await sha256Hex(token) : undefined;

  if (body.action === "add") {
    const draft = await currentDraft(c);
    if (!draft) throw new HttpError(409, "This book is no longer open. Check your cart or start a new book.");
    const [brief, settings] = await Promise.all([draftBrief(c.env, draft), loadSettings(c.env)]);
    if (brief.characters.some((character) => character.photo)) throw new HttpError(409, "Books with reference photos can be ordered individually from the review screen.");
    const errors = Object.assign({}, ...[1, 2, 3, 4].map((step) => validateBrief(brief, step, availablePrintFormats(settings))));
    if (Object.keys(errors).length) throw new HttpError(400, "Complete your story details before adding it to the cart.", { errors });
    if (!hash || await submitted(d, hash)) {
      token = randomToken();
      hash = await sha256Hex(token);
    }
    const time = now();
    const result = await d.prepare(`INSERT OR IGNORE INTO lpb_cart_items (token_hash, draft_id, brief, created_at, expires_at)
      SELECT ?, ?, ?, ?, ? WHERE (SELECT COUNT(*) FROM lpb_cart_items WHERE token_hash = ? AND expires_at > ?) < ?
      AND NOT EXISTS (SELECT 1 FROM lpb_messages WHERE order_ref = ?)`)
      .bind(hash, draft.id, JSON.stringify({ ...brief, contact: {}, marketing: undefined }), time, time + MAX_AGE * 1000, hash, time, MAX_BOOKS, refFor(hash)).run();
    if (!result.meta?.changes && !(await entries(d, hash)).some((row) => row.draft_id === draft.id)) {
      throw new HttpError(409, "The cart is full or was just submitted. Open the cart to continue.");
    }
    const response = json({ ok: true });
    response.headers.append("Set-Cookie", cookie(c.request, CART_COOKIE, token!, MAX_AGE, "/api/books"));
    response.headers.append("Set-Cookie", cookie(c.request, DRAFT_COOKIE, "", 0, "/api/books"));
    return response;
  }

  if (!hash) throw new HttpError(400, "Your cart is empty.");
  if (body.action === "remove") {
    await d.prepare("DELETE FROM lpb_cart_items WHERE token_hash = ? AND draft_id = ?").bind(hash, body.id ?? "").run();
    return json({ ok: true });
  }
  if (body.action !== "submit") throw new HttpError(400, "Choose what to do with your cart.");
  if (await submitted(d, hash)) return json({ ok: true });

  const [rows, settings] = await Promise.all([entries(d, hash), loadSettings(c.env)]);
  if (!rows.length) throw new HttpError(400, "Your cart is empty.");
  const contact = sanitiseBrief({ contact: { name: body.name, email: body.email } }).contact;
  const contactErrors = validateBrief({ contact } as Brief, 5);
  if (Object.keys(contactErrors).length) throw new HttpError(400, contactErrors["contact.email"]);

  const items = rows.map((row) => cartItem(row, settings));
  if (items.some((item) => !item.available)) throw new HttpError(409, "A selected cover is unavailable. Remove that book to continue.");
  const total = items.reduce((sum, item) => sum + item.price.totalCents, 0);
  const ids = items.map((item) => item.id).join(",");
  if (!Array.isArray(body.items) || body.items.join(",") !== ids || body.totalCents !== total) {
    throw new HttpError(409, "Your cart changed. Check the latest books and prices before sending.");
  }
  const content = [`${items.length} personalised book${items.length === 1 ? "" : "s"}`, `Cart total: ${euro(total)}`,
    ...items.map(({ title, brief, price }, i) => `Book ${i + 1} · ${title}\n${describeBook(brief, price)}`)].join("\n\n");
  const ref = refFor(hash);
  const result = await d.prepare(`INSERT INTO lpb_messages (name, email, order_ref, body, created_at)
    SELECT ?, ?, ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM lpb_messages WHERE order_ref = ?)
    AND (SELECT group_concat(draft_id, ',') FROM
      (SELECT draft_id FROM lpb_cart_items WHERE token_hash = ? AND expires_at > ? ORDER BY created_at, draft_id)) = ?`)
    .bind(contact.name ?? null, contact.email!, ref, content, now(), ref, hash, now(), ids).run();
  if (result.meta?.changes) notifyBookRequest(c);
  else if (!(await submitted(d, hash))) throw new HttpError(409, "Your cart changed. Refresh it and try again.");
  await d.prepare("DELETE FROM lpb_cart_items WHERE token_hash = ?").bind(hash).run();
  return json({ ok: true });
});
