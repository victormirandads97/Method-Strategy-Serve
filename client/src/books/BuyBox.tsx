/**
 * The pre-order box: Stripe Checkout (card, Apple Pay, Google Pay) and a
 * PayPal link when one is configured. The page never sees card details.
 */
import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { CHECKOUT_ENDPOINT, LINKS, OFFER, PAYPAL_LINK, PREORDER_TERMS, STORIES } from "./config";
import { getAttribution, trackInitiateCheckout } from "./tracking";

export function BuyBox({ story, onStory, name, cancelled }: { story: string; onStory: (id: string) => void; name: string; cancelled: boolean }) {
  const reduce = useReducedMotion();
  const [state, setState] = useState<"idle" | "opening" | "error">("idle");
  const [error, setError] = useState("");
  const pick = story || STORIES[0].id;
  const title = STORIES.find((s) => s.id === pick)!.title;
  const first = name.split(" ")[0] || "Ava";

  async function stripeCheckout() {
    if (state === "opening") return;
    setState("opening");
    setError("");
    trackInitiateCheckout("stripe");
    try {
      const res = await fetch(CHECKOUT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ story: pick, attribution: getAttribution() }),
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok && body?.url) {
        window.location.assign(body.url);
        return; // keep the loading state while the browser leaves
      }
      setError(body?.error === "not_configured"
        ? "Card checkout isn’t switched on yet, so nothing was charged."
        : "We couldn’t open the secure checkout, so nothing was charged.");
    } catch {
      setError("We couldn’t reach the checkout. Check your connection and try again. Nothing was charged.");
    }
    setState("error");
  }

  return (
    <div className="lp-buy">
      {cancelled && (
        <p className="lp-buy-note" role="status">Checkout cancelled. You haven’t been charged, and your story choice is still here.</p>
      )}
      <p className="lp-buy-kicker">Your book</p>
      <p className="lp-buy-title">{first} and the {title.replace(/^The /, "")}</p>

      <fieldset className="lp-seg">
        <legend>Pick the story</legend>
        {STORIES.map((s) => (
          <label key={s.id} className={pick === s.id ? "is-on" : ""}>
            <input type="radio" name="lp-buy-story" value={s.id} checked={pick === s.id} onChange={() => onStory(s.id)} />
            <span>{s.title.replace(/^The /, "")}</span>
          </label>
        ))}
      </fieldset>

      <div className="lp-buy-price">
        <span className="lp-buy-amount">{OFFER.price}</span>
        <span>Hardback · delivery in Ireland included</span>
      </div>

      <motion.button
        type="button"
        className="lp-btn lp-btn-primary lp-btn-xl lp-btn-block"
        onClick={stripeCheckout}
        disabled={state === "opening"}
        whileHover={reduce || state === "opening" ? undefined : { scale: 1.02 }}
        whileTap={reduce ? undefined : { scale: 0.97 }}
      >
        {state === "opening" ? <><span className="lp-spinner" aria-hidden="true" /> Opening secure checkout…</> : <>{OFFER.stripeCta} · {OFFER.price}</>}
      </motion.button>
      <p className="lp-buy-sub">{OFFER.stripeNote}</p>

      {PAYPAL_LINK ? (
        <a
          className="lp-btn lp-btn-paypal lp-btn-block"
          href={PAYPAL_LINK}
          target="_blank"
          rel="noopener"
          onClick={() => trackInitiateCheckout("paypal")}
        >
          Pay with <b>PayPal</b>
        </a>
      ) : import.meta.env.DEV ? (
        <p className="lp-dev-flag">PayPal button appears here once PAYPAL_LINK is set in config.ts (hidden on the live page until then).</p>
      ) : null}

      {state === "error" && (
        <div className="lp-form-error" role="alert">
          <p>{error}</p>
          <p>
            Please try again{PAYPAL_LINK ? ", pay with PayPal," : ""} or <a href={`mailto:${LINKS.contactEmail}?subject=${encodeURIComponent("Little Plot Books pre-order")}`}>email us to order</a>.
          </p>
        </div>
      )}

      <ul className="lp-terms">
        {PREORDER_TERMS.map((t) => <li key={t}>{t}</li>)}
      </ul>
    </div>
  );
}
