/** POST /api/books/order/<key>/pay: recover a failed or abandoned payment with a fresh checkout for the same order. */
import { euro, type FormatId } from "../../../../../shared/books/catalog";
import { HttpError, baseUrl, checkOrderKey, handle, json, now, ready, sameOrigin, testMode, type Ctx } from "../../../../_lib/books/core";
import { getOrder, loadSettings } from "../../../../_lib/books/shop";
import { checkoutLines, createPaypalOrder, createStripeSession, paypalUsable, stripeUsable } from "../../../../_lib/books/payments";
import type { Quote } from "../../../../../shared/books/catalog";

export const onRequestPost = handle(async (c: Ctx<"key">) => {
  sameOrigin(c);
  const key = c.params.key;
  const id = await checkOrderKey(c.env, key);
  const o = await getOrder(c.env, id);
  if (o.paid_at || !["awaiting_payment", "payment_failed"].includes(o.status)) throw new HttpError(409, "This order doesn't need paying.");
  if (o.format === "ebook") throw new HttpError(409, "Choose softcover or hardcover to place a new order.");
  const q = JSON.parse(o.quote) as Quote;
  const s = await loadSettings(c.env);
  const base = baseUrl(c.env, c.request);
  const success = `${base}/books/order/${key}?from=checkout`;
  let url: string, ref: string;
  if (o.provider === "stripe" && stripeUsable(c.env)) {
    const sess = await createStripeSession(c.env, `${id}`, o.email, checkoutLines(q, s.formats[o.format as FormatId].label), true, { success, cancel: `${base}/books/order/${key}` });
    url = sess.url; ref = sess.id;
  } else if (o.provider === "paypal" && paypalUsable(c.env)) {
    const p = await createPaypalOrder(c.env, id, o.total_cents, true, { ret: `${base}/api/books/paypal/return?key=${encodeURIComponent(key)}`, cancel: `${base}/books/order/${key}` });
    url = p.url; ref = p.id;
  } else if (o.provider === "test" && testMode(c.env)) {
    url = `${base}/books/test-checkout/${key}`; ref = `cs_test_lpb_${crypto.randomUUID().slice(0, 18)}`;
  } else throw new HttpError(503, "Payments aren't available right now. Please contact us.");
  const d = await ready(c.env);
  await d.prepare("UPDATE lpb_orders SET status = 'awaiting_payment', provider_ref = ?, checkout_url = ?, updated_at = ? WHERE id = ? AND paid_at IS NULL").bind(ref, url, now(), id).run();
  return json({ url, total: euro(o.total_cents) });
});
