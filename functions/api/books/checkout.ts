/**
 * POST /api/books/checkout { method: "stripe" | "paypal" | "test" }
 * Freezes the brief into an order, prices it on the server in integer cents
 * (format, extra characters, shipping, active campaign) and returns a payment
 * URL. Repeat clicks reuse the open checkout; a changed brief retires it, so a
 * draft can't be charged twice.
 */
import { availablePrintFormats, extraCount, quote, validateBrief } from "../../../shared/books/catalog";
import { HttpError, baseUrl, bucket, handle, json, newOrderId, now, orderKey, ready, readJson, sameOrigin, sha256Hex, testMode, type Ctx } from "../../_lib/books/core";
import { availableMethods, checkoutLines, createPaypalOrder, createStripeSession, expireStripeSession } from "../../_lib/books/payments";
import { currentDraft, draftBrief, draftUploads, loadSettings, type OrderRow } from "../../_lib/books/shop";
import { orderUrl } from "../../_lib/books/core";

export const onRequestPost = handle(async (c: Ctx) => {
  sameOrigin(c);
  const { method } = await readJson<{ method?: string }>(c.request);
  if (!(await availableMethods(c.env)).some((m) => m.id === method)) throw new HttpError(400, "That payment method isn't available right now.");
  bucket(c.env);
  const row = await currentDraft(c);
  if (!row) throw new HttpError(400, "We couldn't find your book details. They may have expired. Please start again.");
  const s = await loadSettings(c.env);
  const enabled = availablePrintFormats(s);
  const brief = await draftBrief(c.env, row);
  const errors = validateBrief(brief, undefined, enabled);
  if (Object.keys(errors).length) throw new HttpError(400, "A few details are missing.", { errors });
  const q = quote(s, brief.format!, extraCount(brief));
  const photoIds = brief.characters.map((x) => x.photo?.id ?? "").join(",");
  const briefJson = JSON.stringify({ ...brief, marketing: undefined });
  const hash = await sha256Hex(`${briefJson}|${photoIds}|${method}|${q.totalCents}`);
  const d = await ready(c.env);

  const { results: prior } = await d.prepare("SELECT * FROM lpb_orders WHERE draft_id = ? ORDER BY created_at DESC").bind(row.id).all<OrderRow>();
  for (const o of prior) {
    if (o.paid_at) throw new HttpError(409, "This book has already been paid for.", { orderUrl: await orderUrl(c.env, o.id, c.request) });
    if (o.status !== "awaiting_payment" && o.status !== "payment_failed") continue;
    if (o.brief_hash === hash && o.status === "awaiting_payment" && o.checkout_url && now() - o.created_at < 23 * 3600_000) {
      return json({ url: o.checkout_url, orderId: o.id, reused: true });
    }
    if (o.provider === "stripe" && o.provider_ref) {
      if ((await expireStripeSession(c.env, o.provider_ref)) === "complete") {
        throw new HttpError(409, "A payment for this book is being confirmed. Please wait a moment.", { orderUrl: await orderUrl(c.env, o.id, c.request) });
      }
    }
    await d.prepare("UPDATE lpb_orders SET status = 'cancelled', updated_at = ? WHERE id = ? AND paid_at IS NULL").bind(now(), o.id).run();
  }

  const id = newOrderId();
  const live = method === "stripe" ? /^(sk|rk)_live/.test(c.env.STRIPE_SECRET_KEY || "") : method === "paypal" ? c.env.PAYPAL_ENV === "live" : false;
  const t = now();
  await d.prepare(`INSERT INTO lpb_orders (id, draft_id, brief, brief_hash, email, route, story, style, format, quote, total_cents, currency, status, mode, provider, created_at, updated_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'EUR', 'awaiting_payment', ?, ?, ?, ?)`)
    .bind(id, row.id, briefJson, hash, brief.contact.email, brief.route, brief.story ?? null, brief.style, brief.format, JSON.stringify(q), q.totalCents, live ? "live" : "test", method, t, t).run();
  // Tie exactly the current photo of each character to this order.
  const keep = new Set(brief.characters.map((x) => x.photo?.id).filter(Boolean) as string[]);
  for (const u of await draftUploads(c.env, row.id)) {
    if (keep.has(u.id)) await d.prepare("UPDATE lpb_uploads SET order_id = ? WHERE id = ?").bind(id, u.id).run();
  }

  const key = await orderKey(c.env, id);
  const base = baseUrl(c.env, c.request);
  const success = `${base}/books/order/${key}?from=checkout`;
  const cancel = `${base}/books/create?step=5&cancelled=1`;
  const physical = brief.format !== "ebook";
  let url: string, ref: string;
  if (method === "stripe") {
    const sess = await createStripeSession(c.env, id, brief.contact.email!, checkoutLines(q, s.formats[brief.format!].label), physical, { success, cancel });
    url = sess.url; ref = sess.id;
  } else if (method === "paypal") {
    const p = await createPaypalOrder(c.env, id, q.totalCents, physical, { ret: `${base}/api/books/paypal/return?key=${encodeURIComponent(key)}`, cancel });
    url = p.url; ref = p.id;
  } else {
    if (!testMode(c.env)) throw new HttpError(400, "Test checkout is off.");
    url = `${base}/books/test-checkout/${key}`; ref = `cs_test_lpb_${crypto.randomUUID().slice(0, 18)}`;
  }
  await d.prepare("UPDATE lpb_orders SET provider_ref = ?, checkout_url = ?, updated_at = ? WHERE id = ?").bind(ref, url, now(), id).run();
  return json({ url, orderId: id });
});
