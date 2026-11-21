/**
 * /api/book-checkout: Stripe Checkout for a Little Plot Books pre-order.
 *
 * Uses the site's existing Stripe account (STRIPE_SECRET_KEY). The price is
 * set here, so no Stripe price needs creating: €39.95 including delivery in
 * Ireland, one hardback. Card, Apple Pay and Google Pay are offered by Stripe
 * Checkout itself when they are switched on in the Stripe dashboard.
 *
 * POST { story, attribution } -> { url }   (the page redirects to Stripe)
 * GET  ?story=...                -> 303 to Stripe (works without JavaScript)
 * GET  ?session_id=cs_...        -> { paid, story } so the page can confirm an
 *                                   order with Stripe before showing success.
 *
 * Child details are not collected here. After payment the buyer is emailed
 * to set up the hero and the dedication.
 *
 * SWITCHED OFF until BOOK_CHECKOUT_ENABLED is "true" in the Pages project
 * settings. While off it answers 404 and never talks to Stripe, so nobody can
 * pay for a book before orders open, even by calling this URL directly.
 * Turn on together with OFFER.mode = "preorder" in client/src/books/config.ts.
 */
import { baseUrl, json, stripe, type Env as StripeEnv } from "../_lib/stripe";

type Env = StripeEnv & { BOOK_CHECKOUT_ENABLED?: string };
const off = (env: Env) => env.BOOK_CHECKOUT_ENABLED !== "true";

/** One place to change the offer. Amount is in cent. */
const PRODUCT = {
  name: "Little Plot Books personalised hardback (pre-order)",
  amount: 3995,
  currency: "eur",
  countries: ["IE"],
};

/** Keep in step with STORIES in client/src/books/config.ts. */
const STORIES: Record<string, string> = {
  "dinosaur-next-door": "The Dinosaur Next Door",
  "moonlight-express": "The Moonlight Express",
  "secret-garden-door": "The Secret Garden Door",
};

const UTM = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

type Ctx = { request: Request; env: Env };

function clean(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

async function createSession(env: Env, storyId: string, attribution: Record<string, unknown>): Promise<string> {
  const story = STORIES[storyId] || STORIES["dinosaur-next-door"];
  const base = baseUrl(env);
  const form: Record<string, string> = {
    mode: "payment",
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": PRODUCT.currency,
    "line_items[0][price_data][unit_amount]": String(PRODUCT.amount),
    "line_items[0][price_data][product_data][name]": PRODUCT.name,
    "line_items[0][price_data][product_data][description]": `${story}. Illustrated, personalised hardback for ages 4 to 7. Delivery in Ireland included.`,
    success_url: `${base}/books?order=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/books?order=cancelled#buy`,
    billing_address_collection: "auto",
    customer_creation: "always",
    locale: "en-GB",
    "custom_text[submit][message]":
      "After payment we’ll email you to set up your child’s look and your dedication. You approve a proof before anything is printed.",
    "metadata[product]": "little-plot-books",
    "metadata[story]": story,
    "payment_intent_data[metadata][product]": "little-plot-books",
    "payment_intent_data[metadata][story]": story,
  };
  PRODUCT.countries.forEach((c, i) => (form[`shipping_address_collection[allowed_countries][${i}]`] = c));
  for (const k of UTM) {
    const v = clean(attribution?.[k], 150);
    if (v) form[`metadata[${k}]`] = v;
  }
  const session = await stripe<{ url: string }>(env, "POST", "checkout/sessions", form);
  return session.url;
}

function failure(err: unknown): Response {
  const message = err instanceof Error ? err.message : String(err);
  console.error("Book checkout error:", message);
  const notSet = /STRIPE_SECRET_KEY/.test(message);
  return json({ ok: false, error: notSet ? "not_configured" : "checkout_failed" }, notSet ? 503 : 502);
}

export async function onRequestPost({ request, env }: Ctx): Promise<Response> {
  if (off(env)) return json({ ok: false, error: "not_open" }, 404);
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return json({ ok: false, error: "origin_not_allowed" }, 403);
  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    /* an empty body still buys the default story */
  }
  try {
    const url = await createSession(env, clean(body.story, 40), (body.attribution as Record<string, unknown>) || {});
    return json({ ok: true, url });
  } catch (err) {
    return failure(err);
  }
}

export async function onRequestGet({ request, env }: Ctx): Promise<Response> {
  if (off(env)) return json({ ok: false, error: "not_open" }, 404);
  const url = new URL(request.url);
  const sessionId = url.searchParams.get("session_id");

  if (sessionId) {
    if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId)) return json({ ok: false, error: "bad_session" }, 400);
    try {
      const s = await stripe<{ payment_status: string; metadata?: Record<string, string> }>(
        env, "GET", `checkout/sessions/${encodeURIComponent(sessionId)}`,
      );
      const ours = s.metadata?.product === "little-plot-books";
      return json({ ok: true, paid: ours && s.payment_status === "paid", story: ours ? s.metadata?.story || null : null });
    } catch (err) {
      return failure(err);
    }
  }

  try {
    const target = await createSession(env, clean(url.searchParams.get("story"), 40), Object.fromEntries(url.searchParams));
    return new Response(null, { status: 303, headers: { Location: target, "Cache-Control": "no-store" } });
  } catch (err) {
    return failure(err);
  }
}
