/**
 * POST /api/books/stripe-webhook: signed Stripe events. Configure in Stripe with
 * checkout.session.completed, .async_payment_succeeded, .async_payment_failed
 * and .expired; put the signing secret in STRIPE_WEBHOOK_SECRET.
 */
import { handle, type Ctx } from "../../_lib/books/core";
import { processStripeEvent } from "../../_lib/books/events";

export const onRequestPost = handle(async (c: Ctx) => processStripeEvent(c, await c.request.text(), c.request.headers.get("Stripe-Signature")));
