/** Stripe events: used by the real webhook and by the built-in test checkout. */
import { Ctx, changes, json, now, ready } from "./core";
import { markPaid } from "./shop";
import { sessionShipping, verifyStripeSignature, webhookSecrets, type StripeSession } from "./payments";

interface StripeEvent { id: string; type: string; data: { object: StripeSession } }

export async function processStripeEvent(c: Ctx, payload: string, signature: string | null): Promise<Response> {
  const secrets = webhookSecrets(c.env);
  if (!secrets.length) return json({ error: "Webhook secret not configured" }, 503);
  if (!(await verifyStripeSignature(payload, signature, secrets))) return json({ error: "Bad signature" }, 400);
  const event = JSON.parse(payload) as StripeEvent;
  const s = event.data?.object;
  const orderId = s?.metadata?.order_id || s?.client_reference_id;
  const d = await ready(c.env);
  const ins = await d.prepare("INSERT OR IGNORE INTO lpb_events (id, provider, type, order_id, received_at) VALUES (?, 'stripe', ?, ?, ?)")
    .bind(event.id, event.type, orderId ?? null, now()).run();
  if (changes(ins) !== 1) return json({ received: true, duplicate: true });
  if (!orderId || !/^LPB-/.test(orderId)) return json({ received: true, ignored: "not a book order" });
  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
        if (s.payment_status !== "paid") return json({ received: true, waiting: s.payment_status });
        return json({ received: true, paid: await markPaid(c.env, orderId, { paymentRef: s.payment_intent || s.id, shipping: sessionShipping(s), amountCents: s.amount_total, currency: s.currency }, c.request) });
      case "checkout.session.async_payment_failed":
        await d.prepare("UPDATE lpb_orders SET status = 'payment_failed', updated_at = ? WHERE id = ? AND status = 'awaiting_payment'").bind(now(), orderId).run();
        return json({ received: true });
      case "checkout.session.expired":
        // Stays recoverable: the customer can pay again from the order page.
        await d.prepare("UPDATE lpb_orders SET status = 'payment_failed', updated_at = ? WHERE id = ? AND status = 'awaiting_payment'").bind(now(), orderId).run();
        return json({ received: true });
      default:
        return json({ received: true, ignored: event.type });
    }
  } catch (err) {
    await d.prepare("DELETE FROM lpb_events WHERE id = ?").bind(event.id).run(); // let Stripe retry
    throw err;
  }
}
