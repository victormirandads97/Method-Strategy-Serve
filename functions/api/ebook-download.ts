/**
 * GET /api/ebook-download?session_id=cs_...
 *
 * Confirms with Stripe that the Checkout session is paid, and that it bought
 * The Last Human Job, then streams the PDF. Mirrors server/routes.ts.
 *
 * The PDF is bundled into the Function as binary data (script/build.ts copies
 * it from private/), so it has no public URL that could bypass this check.
 */
import ebook from "../_generated/ebook.bin";
import { json, stripe, StripeError, type Handler } from "../_lib/stripe";

interface Session {
  payment_status: string;
  line_items?: { data: { price?: { id: string } | null }[] };
}

export const onRequestGet: Handler = async ({ request, env }) => {
  const sessionId = new URL(request.url).searchParams.get("session_id");
  if (!sessionId) return json({ error: "Missing session_id" }, 400);
  // Checkout session ids look like cs_test_... or cs_live_...; anything else
  // is not worth a round trip to Stripe.
  if (!/^cs_[A-Za-z0-9_]{8,255}$/.test(sessionId)) {
    return json({ error: "Payment not completed" }, 403);
  }

  try {
    const session = await stripe<Session>(
      env,
      "GET",
      `checkout/sessions/${encodeURIComponent(sessionId)}?expand[]=line_items`,
    );

    if (session.payment_status !== "paid") {
      return json({ error: "Payment not completed" }, 403);
    }
    // A paid session for some other product on the same Stripe account must
    // not unlock the book.
    const priceId = env.STRIPE_PRICE_ID;
    if (priceId && !session.line_items?.data.some((item) => item.price?.id === priceId)) {
      return json({ error: "Payment not completed" }, 403);
    }

    return new Response(ebook, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="The_Last_Human_Job.pdf"',
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Download verification error:", message);
    // An unknown session id is a 404 from Stripe: treat it as unpaid.
    if (err instanceof StripeError && err.status === 404) {
      return json({ error: "Payment not completed" }, 403);
    }
    return json({ error: "Verification failed, contact support@themethodco.co" }, 500);
  }
};
