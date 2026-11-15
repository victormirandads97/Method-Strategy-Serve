/**
 * Minimal Stripe client for Cloudflare Pages Functions.
 *
 * The Node Stripe SDK expects Node's http stack, so these routes talk to the
 * Stripe REST API with fetch instead. Behaviour mirrors server/routes.ts, the
 * Express implementation used in local development.
 *
 * Secrets come from the Pages project's environment variables and never leave
 * the server side.
 */

export interface Env {
  /** Stripe secret key, set in the Pages project settings. */
  STRIPE_SECRET_KEY?: string;
  /** The existing price for The Last Human Job. Never created here. */
  STRIPE_PRICE_ID?: string;
  /** Public origin used in Stripe redirect URLs. */
  BASE_URL?: string;
  /** Overrides the Stripe API origin. Only for local tests against a mock. */
  STRIPE_API_BASE?: string;
}

/** The handler shape Pages Functions call. Kept local so no extra types package is needed. */
export type Handler = (context: {
  request: Request;
  env: Env;
  params: Record<string, string | string[]>;
}) => Promise<Response> | Response;

/** Same API version the Express server pins. */
const STRIPE_VERSION = "2026-05-27.dahlia";

export const DEFAULT_BASE_URL = "https://themethodco.co";

export class StripeError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

export function baseUrl(env: Env): string {
  return (env.BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, "");
}

/** Calls the Stripe REST API. `form` is sent as application/x-www-form-urlencoded. */
export async function stripe<T>(
  env: Env,
  method: "GET" | "POST",
  path: string,
  form?: Record<string, string>,
): Promise<T> {
  const key = env.STRIPE_SECRET_KEY;
  if (!key) throw new StripeError("STRIPE_SECRET_KEY env var is not set", 500);

  const origin = (env.STRIPE_API_BASE || "https://api.stripe.com").replace(/\/+$/, "");
  const res = await fetch(`${origin}/v1/${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      "Stripe-Version": STRIPE_VERSION,
      ...(form ? { "Content-Type": "application/x-www-form-urlencoded" } : {}),
    },
    body: form ? new URLSearchParams(form).toString() : undefined,
  });

  const body = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
  if (!res.ok) {
    throw new StripeError(body.error?.message || `Stripe responded ${res.status}`, res.status);
  }
  return body as T;
}

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}
