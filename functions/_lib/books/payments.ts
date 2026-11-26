/**
 * Payments for Little Plot Books.
 *
 * - Stripe Checkout, created on the server with the amount from
 *   shared/books/catalog.ts. PayPal shows inside Stripe Checkout when it is
 *   switched on in the Stripe account.
 * - PayPal Orders v2, direct, for a PayPal Business account when PayPal is not
 *   available inside Stripe.
 * - A built-in test checkout (BOOKS_TEST_CHECKOUT=on) that sends
 *   Stripe-shaped, signed events through the same webhook code.
 *
 * Only the order ID, the amount, the buyer's email and the product name go to
 * the providers. Nothing about the child.
 */
import { euro, type Quote } from "../../../shared/books/catalog";
import { BooksEnv, HttpError, hmacHex, safeEqual, testMode } from "./core";

const STRIPE_VERSION = "2026-05-27.dahlia";

export async function stripe<T>(env: BooksEnv, method: "GET" | "POST", path: string, form?: Record<string, string>, idem?: string): Promise<T> {
  if (!env.STRIPE_SECRET_KEY) throw new HttpError(503, "Card payments are not configured.");
  const origin = (env.STRIPE_API_BASE || "https://api.stripe.com").replace(/\/+$/, "");
  const res = await fetch(`${origin}/v1/${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      "Stripe-Version": STRIPE_VERSION,
      ...(form ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
      ...(idem ? { "Idempotency-Key": idem } : {}),
    },
    body: form ? new URLSearchParams(form).toString() : undefined,
  });
  const body = (await res.json().catch(() => ({}))) as { error?: { message?: string; code?: string } };
  if (!res.ok) throw new HttpError(502, body.error?.message || `Stripe responded ${res.status}`, { code: body.error?.code });
  return body as T;
}

const isLive = (k?: string) => !!k && (k.startsWith("sk_live") || k.startsWith("rk_live"));

/** Live checkout requires payment confirmation via a signed webhook. */
export function stripeUsable(env: BooksEnv): boolean {
  if (!env.STRIPE_SECRET_KEY) return false;
  if (isLive(env.STRIPE_SECRET_KEY) && (env.BOOKS_LIVE_SALES !== "on" || !env.STRIPE_WEBHOOK_SECRET)) return false;
  return true;
}
export function paypalUsable(env: BooksEnv): boolean {
  if (!env.PAYPAL_CLIENT_ID || !env.PAYPAL_CLIENT_SECRET) return false;
  if (env.PAYPAL_ENV === "live" && env.BOOKS_LIVE_SALES !== "on") return false;
  return true;
}

let paypalInStripeCache: { at: number; value: boolean } | null = null;

/** Whether Stripe Checkout will offer PayPal. Asks Stripe, cached for 10 minutes. */
export async function stripeHasPaypal(env: BooksEnv): Promise<boolean> {
  if (!stripeUsable(env)) return false;
  if (env.BOOKS_STRIPE_PAYPAL === "on") return true;
  if (env.BOOKS_STRIPE_PAYPAL === "off") return false;
  if (paypalInStripeCache && Date.now() - paypalInStripeCache.at < 600_000) return paypalInStripeCache.value;
  let value = false;
  try {
    const r = await stripe<{ data: { active: boolean; is_default: boolean; paypal?: { available?: boolean } }[] }>(
      env, "GET", "payment_method_configurations?limit=20",
    );
    value = r.data.some((c) => c.active && c.is_default && c.paypal?.available === true);
  } catch {
    value = false;
  }
  paypalInStripeCache = { at: Date.now(), value };
  return value;
}

export interface PaymentMethodInfo { id: "stripe" | "paypal" | "test"; label: string; note: string }

export async function availableMethods(env: BooksEnv): Promise<PaymentMethodInfo[]> {
  const out: PaymentMethodInfo[] = [];
  if (stripeUsable(env)) {
    const pp = await stripeHasPaypal(env);
    out.push({ id: "stripe", label: pp ? "Pay by card or PayPal" : "Pay by card", note: "Secure checkout by Stripe" });
    if (!pp && paypalUsable(env)) out.push({ id: "paypal", label: "Pay with PayPal", note: "You'll finish on PayPal" });
  } else if (paypalUsable(env)) {
    out.push({ id: "paypal", label: "Pay with PayPal", note: "You'll finish on PayPal" });
  }
  if (testMode(env)) out.push({ id: "test", label: "Continue to test checkout", note: "Test mode: no real payment is taken" });
  return out;
}

export interface StripeSession {
  id: string;
  url: string;
  status: string;
  payment_status: string;
  amount_total: number;
  currency: string;
  client_reference_id?: string;
  metadata?: Record<string, string>;
  payment_intent?: string | null;
  customer_details?: { email?: string; name?: string; phone?: string; address?: Record<string, string> } | null;
  shipping_details?: { name?: string; address?: Record<string, string> } | null;
  collected_information?: { shipping_details?: { name?: string; address?: Record<string, string> } | null } | null;
}

export interface CheckoutLine { name: string; unitCents: number; quantity: number }

/** Builds the line items for a quote. Names never include the child's details. */
export function checkoutLines(q: Quote, formatLabel: string): CheckoutLine[] {
  const lines: CheckoutLine[] = [{ name: `Personalised book: ${formatLabel}${q.saleLabel ? ` (${q.saleLabel}, was ${euro(q.wasCents!)})` : ""}`, unitCents: q.bookCents, quantity: 1 }];
  if (q.extraCharacters) lines.push({ name: "Extra character", unitCents: q.extraCharacterCents, quantity: q.extraCharacters });
  if (q.shippingCents) lines.push({ name: "Shipping", unitCents: q.shippingCents, quantity: 1 });
  return lines;
}

export async function createStripeSession(
  env: BooksEnv,
  orderId: string,
  email: string,
  lines: CheckoutLine[],
  physical: boolean,
  urls: { success: string; cancel: string },
): Promise<StripeSession> {
  const paypal = await stripeHasPaypal(env);
  const form: Record<string, string> = {
    mode: "payment",
    success_url: urls.success,
    cancel_url: urls.cancel,
    customer_email: email,
    client_reference_id: orderId,
    "metadata[order_id]": orderId,
    "payment_intent_data[metadata][order_id]": orderId,
    locale: "en",
  };
  lines.forEach((l, i) => {
    form[`line_items[${i}][quantity]`] = String(l.quantity);
    form[`line_items[${i}][price_data][currency]`] = "eur";
    form[`line_items[${i}][price_data][unit_amount]`] = String(l.unitCents);
    form[`line_items[${i}][price_data][product_data][name]`] = l.name;
  });
  if (physical) {
    form["shipping_address_collection[allowed_countries][0]"] = "IE";
    form["phone_number_collection[enabled]"] = "true";
  }
  // Without payment_method_types Stripe shows every method switched on in the
  // dashboard (card, PayPal, wallets). Restrict to card when PayPal is off.
  if (!paypal) form["payment_method_types[0]"] = "card";
  return stripe<StripeSession>(env, "POST", "checkout/sessions", form, `lpb-session-${orderId}-${Math.floor(Date.now() / 60_000)}`);
}

export async function expireStripeSession(env: BooksEnv, sessionId: string): Promise<"expired" | "complete" | "error"> {
  try {
    await stripe(env, "POST", `checkout/sessions/${sessionId}/expire`, {});
    return "expired";
  } catch {
    try {
      const s = await stripe<StripeSession>(env, "GET", `checkout/sessions/${sessionId}`);
      return s.status === "complete" ? "complete" : s.status === "expired" ? "expired" : "error";
    } catch {
      return "error";
    }
  }
}

/** Verifies a Stripe-Signature header (v1 scheme, 5 minute tolerance). */
export async function verifyStripeSignature(payload: string, header: string | null, secrets: string[], toleranceS = 300): Promise<boolean> {
  if (!header) return false;
  const parts = Object.fromEntries(
    header.split(",").map((kv) => kv.split("=") as [string, string]).filter((p) => p.length === 2).map(([k, v]) => [k.trim(), v]),
  );
  const t = Number(parts.t);
  const sigs = header.split(",").filter((p) => p.trim().startsWith("v1=")).map((p) => p.trim().slice(3));
  if (!t || !sigs.length) return false;
  if (Math.abs(Date.now() / 1000 - t) > toleranceS) return false;
  for (const secret of secrets) {
    const want = await hmacHex(secret, `${t}.${payload}`);
    if (sigs.some((s) => safeEqual(s, want))) return true;
  }
  return false;
}

export async function signStripePayload(secret: string, payload: string): Promise<string> {
  const t = Math.floor(Date.now() / 1000);
  return `t=${t},v1=${await hmacHex(secret, `${t}.${payload}`)}`;
}

export function webhookSecrets(env: BooksEnv): string[] {
  const s: string[] = [];
  if (env.STRIPE_WEBHOOK_SECRET) s.push(env.STRIPE_WEBHOOK_SECRET);
  if (testMode(env) && env.BOOKS_TEST_WEBHOOK_SECRET) s.push(env.BOOKS_TEST_WEBHOOK_SECRET);
  return s;
}

export function sessionShipping(s: StripeSession) {
  const sd = s.collected_information?.shipping_details ?? s.shipping_details ?? null;
  return {
    name: sd?.name ?? s.customer_details?.name ?? null,
    address: sd?.address ?? null,
    phone: s.customer_details?.phone ?? null,
  };
}

// ---------------------------------------------------------------------------
// PayPal Orders v2 (direct)
// ---------------------------------------------------------------------------

function paypalBase(env: BooksEnv) {
  return env.PAYPAL_ENV === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
}

async function paypalToken(env: BooksEnv): Promise<string> {
  const res = await fetch(`${paypalBase(env)}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${env.PAYPAL_CLIENT_ID}:${env.PAYPAL_CLIENT_SECRET}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const body = (await res.json().catch(() => ({}))) as { access_token?: string };
  if (!res.ok || !body.access_token) throw new HttpError(502, "PayPal is not reachable right now.");
  return body.access_token;
}

async function paypal<T>(env: BooksEnv, method: string, path: string, body?: unknown, requestId?: string): Promise<T> {
  const token = await paypalToken(env);
  const res = await fetch(`${paypalBase(env)}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(requestId ? { "PayPal-Request-Id": requestId } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const out = (await res.json().catch(() => ({}))) as T & { message?: string; name?: string };
  if (!res.ok) throw new HttpError(502, `PayPal: ${out.message || out.name || res.status}`, { paypal: out.name });
  return out;
}

export async function createPaypalOrder(env: BooksEnv, orderId: string, totalCents: number, physical: boolean, urls: { ret: string; cancel: string }) {
  const value = (totalCents / 100).toFixed(2);
  const r = await paypal<{ id: string; links: { rel: string; href: string }[] }>(
    env, "POST", "/v2/checkout/orders",
    {
      intent: "CAPTURE",
      purchase_units: [{
        reference_id: orderId,
        custom_id: orderId,
        description: "Little Plot Books personalised book",
        amount: { currency_code: "EUR", value },
      }],
      payment_source: {
        paypal: {
          experience_context: {
            brand_name: "Little Plot Books",
            shipping_preference: physical ? "GET_FROM_FILE" : "NO_SHIPPING",
            user_action: "PAY_NOW",
            locale: "en-IE",
            return_url: urls.ret,
            cancel_url: urls.cancel,
          },
        },
      },
    },
    `lpb-order-${orderId}`,
  );
  const approve = r.links.find((l) => l.rel === "payer-action" || l.rel === "approve");
  if (!approve) throw new HttpError(502, "PayPal didn't return an approval link.");
  return { id: r.id, url: approve.href };
}

export interface PaypalCapture {
  id: string;
  status: string;
  purchase_units: {
    custom_id?: string;
    reference_id?: string;
    shipping?: { name?: { full_name?: string }; address?: Record<string, string> };
    payments?: { captures?: { id: string; status: string; custom_id?: string; amount: { currency_code: string; value: string } }[] };
  }[];
  payer?: { email_address?: string };
}

export async function capturePaypalOrder(env: BooksEnv, paypalOrderId: string, orderId: string): Promise<PaypalCapture> {
  try {
    return await paypal<PaypalCapture>(env, "POST", `/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}/capture`, {}, `lpb-capture-${orderId}`);
  } catch (e) {
    // Already captured (e.g. the buyer refreshed the return page): read it instead.
    if (e instanceof HttpError && e.extra.paypal === "UNPROCESSABLE_ENTITY") {
      return paypal<PaypalCapture>(env, "GET", `/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}`);
    }
    throw e;
  }
}
