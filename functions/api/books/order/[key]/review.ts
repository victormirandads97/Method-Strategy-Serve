/** POST /api/books/order/<key>/review: a verified review from a delivered order. Goes to moderation. */
import { clean } from "../../../../../shared/books/catalog";
import { HttpError, checkOrderKey, handle, json, now, ready, readJson, sameOrigin, type Ctx } from "../../../../_lib/books/core";
import { getOrder } from "../../../../_lib/books/shop";

export const onRequestPost = handle(async (c: Ctx<"key">) => {
  sameOrigin(c);
  const o = await getOrder(c.env, await checkOrderKey(c.env, c.params.key));
  if (o.status !== "delivered") throw new HttpError(409, "You can review your book once it's been delivered.");
  const b = await readJson<{ rating?: number; body?: string; displayName?: string; publish?: boolean }>(c.request);
  const rating = Number(b.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new HttpError(400, "Choose a star rating from 1 to 5.");
  const body = clean(b.body, 2000, true);
  if (!body || body.length < 10) throw new HttpError(400, "Tell us a little more (at least a sentence).");
  const looksSpammy = /https?:|www\.|<a\s/i.test(body);
  const d = await ready(c.env);
  const ins = await d.prepare("INSERT OR IGNORE INTO lpb_reviews (order_id, rating, body, display_name, publish_ok, status, verified, created_at) VALUES (?, ?, ?, ?, ?, ?, 1, ?)")
    .bind(o.id, rating, body, clean(b.displayName, 40) ?? null, b.publish ? 1 : 0, looksSpammy ? "spam" : "pending", now()).run();
  if (!ins.meta?.changes) throw new HttpError(409, "You've already reviewed this order. Thank you!");
  return json({ ok: true });
});
