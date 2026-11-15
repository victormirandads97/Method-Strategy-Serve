/**
 * /api/create-checkout-session
 *
 * Starts a Stripe Checkout session for The Last Human Job using the existing
 * STRIPE_PRICE_ID. GET answers with a 303 redirect so plain <a href> buttons
 * work; POST answers with { url }. Mirrors server/routes.ts.
 */
import { baseUrl, json, stripe, type Handler } from "../_lib/stripe";

async function createSession(env: Parameters<Handler>[0]["env"]): Promise<string> {
  const priceId = env.STRIPE_PRICE_ID;
  if (!priceId) throw Object.assign(new Error("STRIPE_PRICE_ID env var is not set"), { config: true });

  const base = baseUrl(env);
  const session = await stripe<{ url: string }>(env, "POST", "checkout/sessions", {
    "payment_method_types[0]": "card",
    "line_items[0][price]": priceId,
    "line_items[0][quantity]": "1",
    mode: "payment",
    // {CHECKOUT_SESSION_ID} is filled in by Stripe, so it stays literal here.
    success_url: `${base}/thank-you-last-human-job?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/last-human-job`,
    billing_address_collection: "auto",
    customer_creation: "always",
  });
  return session.url;
}

const handle: Handler = async ({ request, env }) => {
  try {
    const url = await createSession(env);
    if (request.method === "GET") {
      return new Response(null, { status: 303, headers: { Location: url, "Cache-Control": "no-store" } });
    }
    return json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Stripe checkout error:", message);
    if ((err as { config?: boolean }).config) return json({ error: message }, 500);
    return json({ error: "Failed to create checkout session" }, 500);
  }
};

export const onRequestGet = handle;
export const onRequestPost = handle;
