/**
 * /api/books/test-checkout/<order key>: built-in TEST checkout (BOOKS_TEST_CHECKOUT=on only).
 * "Pay" signs a Stripe-shaped event with BOOKS_TEST_WEBHOOK_SECRET and sends it
 * through the real webhook code. "Fail" sends an async_payment_failed event.
 */
import { euro } from "../../../../shared/books/catalog";
import { HttpError, checkOrderKey, handle, json, maskEmail, orderUrl, readJson, testMode, type Ctx } from "../../../_lib/books/core";
import { getOrder } from "../../../_lib/books/shop";
import { signStripePayload } from "../../../_lib/books/payments";
import { processStripeEvent } from "../../../_lib/books/events";

const guard = (c: Ctx) => { if (!testMode(c.env) || !c.env.BOOKS_TEST_WEBHOOK_SECRET) throw new HttpError(404, "Test checkout is off."); };

export const onRequestGet = handle(async (c: Ctx<"key">) => {
  guard(c);
  const o = await getOrder(c.env, await checkOrderKey(c.env, c.params.key));
  return json({ id: o.id, status: o.status, total: euro(o.total_cents), quote: JSON.parse(o.quote), format: o.format, email: maskEmail(o.email) });
});

export const onRequestPost = handle(async (c: Ctx<"key">) => {
  guard(c);
  const id = await checkOrderKey(c.env, c.params.key);
  const o = await getOrder(c.env, id);
  if (o.format === "ebook" && !o.paid_at) throw new HttpError(409, "Choose softcover or hardcover to place a new order.");
  const b = await readJson<{ action?: string; via?: string; shipping?: Record<string, string>; resend?: boolean }>(c.request);
  const back = `${await orderUrl(c.env, id, c.request)}?from=checkout`;
  const type = b.action === "fail" ? "checkout.session.async_payment_failed" : "checkout.session.completed";
  const sh = b.shipping || {};
  if (type === "checkout.session.completed" && o.format !== "ebook" && (!sh.name || !sh.line1 || !sh.city)) throw new HttpError(400, "Add a delivery name and address.");
  const event = {
    id: `evt_test_${id}_${type.split(".").pop()}_${o.provider_ref}`,
    type,
    data: { object: {
      id: o.provider_ref, object: "checkout.session", status: "complete",
      payment_status: type === "checkout.session.completed" ? "paid" : "unpaid",
      amount_total: o.total_cents, currency: "eur", client_reference_id: id, metadata: { order_id: id },
      payment_intent: `pi_test_${id}`, payment_method_types: [b.via === "paypal" ? "paypal" : "card"],
      customer_details: { email: o.email, name: sh.name ?? null, phone: null },
      collected_information: o.format === "ebook" ? null : { shipping_details: { name: sh.name, address: { line1: sh.line1, line2: sh.line2 ?? null, city: sh.city, state: sh.county ?? null, postal_code: sh.eircode ?? null, country: "IE" } } },
    } },
  };
  const payload = JSON.stringify(event);
  const res = await processStripeEvent(c, payload, await signStripePayload(c.env.BOOKS_TEST_WEBHOOK_SECRET!, payload));
  return json({ redirect: back, result: await res.json() });
});
