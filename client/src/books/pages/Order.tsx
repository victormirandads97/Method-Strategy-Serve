import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import { euro, SALE_SCOPE, type PrintProof, type Quote } from "@shared/books/catalog";
import { api, useShop, useTitle } from "../lib/api";
import { Footer, Header, DrawnStar } from "../components/Chrome";

interface OrderView {
  id: string; status: string; statusLabel: string; test: boolean; email: string; title: string; route: string; style?: string;
  format: string; formatLabel: string; turnaround: string | null; quote: Quote; characters: { name?: string; role: string; hasPhoto: boolean }[];
  dedication: string | null; paidAt: number | null; canPay: boolean; ebookReady: boolean; tracking: { carrier: string; number: string } | null;
  proof: PrintProof | null;
  canReview: boolean; review: { rating: number; status: string } | null;
}

const FLOW = ["paid", "in_production", "ready", "delivered"];

function ReviewForm({ k, onDone }: { k: string; onDone: () => void }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [body, setBody] = useState("");
  const [name, setName] = useState("");
  const [publish, setPublish] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!rating) { setErr("Choose a star rating."); return; }
    setBusy(true);
    try { await api(`/api/books/order/${k}/review`, { method: "POST", json: { rating, body, displayName: name, publish } }); onDone(); }
    catch (x) { setErr(x instanceof Error ? x.message : "That didn't send."); }
    finally { setBusy(false); }
  };
  return (
    <form onSubmit={send} className="card" style={{ marginTop: 18 }} aria-labelledby="rv">
      <h2 id="rv" style={{ fontSize: 24 }}>Leave a review</h2>
      <p className="muted small" style={{ marginTop: 4 }}>Honest is best, including what we could do better. We read every review before it appears.</p>
      <fieldset className="field">
        <legend>Your rating</legend>
        <div className="rating" role="radiogroup" aria-label="Star rating" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} star${n > 1 ? "s" : ""}`} className={(hover || rating) >= n ? "lit" : ""} onMouseEnter={() => setHover(n)} onClick={() => setRating(n)}>★</button>
          ))}
        </div>
      </fieldset>
      <div className="field"><label htmlFor="rv-body">Your review</label><textarea id="rv-body" className="textarea" maxLength={2000} value={body} onChange={(e) => setBody(e.target.value)} placeholder="What did your reader think? What did you like, or not?" /></div>
      <div className="field"><label htmlFor="rv-name">Name to show <span className="opt">(optional, e.g. “Sarah, Galway”)</span></label><input id="rv-name" className="input" maxLength={40} value={name} onChange={(e) => setName(e.target.value)} /></div>
      <label className="check field"><input type="checkbox" checked={publish} onChange={(e) => setPublish(e.target.checked)} /><span>You can publish my review on the website. <span className="opt">(Without this, only we see it.)</span></span></label>
      {err ? <p className="err" role="alert">{err}</p> : null}
      <button className="btn btn-dark" style={{ marginTop: 14 }} disabled={busy}>{busy ? "Sending…" : "Send review"}</button>
    </form>
  );
}

function ProofReview({ proof, orderKey, onDone }: { proof: PrintProof; orderKey: string; onDone: () => void }) {
  const [opened, setOpened] = useState(false);
  const [showChanges, setShowChanges] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const endpoint = `/api/books/order/${orderKey}/proof`;
  const pdf = `${endpoint}?version=${encodeURIComponent(proof.version)}`;

  async function respond(action: "approve" | "changes") {
    setBusy(true);
    setError("");
    try {
      await api(endpoint, { method: "POST", json: { action, version: proof.version, message } });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn’t save your response. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="field" aria-labelledby="proof-title">
      <h2 id="proof-title" style={{ fontSize: 24 }}>{proof.state === "approved" ? "Your book is approved" : "Review your book before printing"}</h2>
      <p style={{ marginTop: 6 }}>
        {proof.state === "approved" ? "Your included PDF is ready to keep."
          : proof.state === "changes_requested" ? "We’ve got your notes. We’ll email you when the revised proof is ready."
          : "Check the illustrations, spelling and dedication. We’ll wait for your approval before we print."}
      </p>
      <div className="toolbar" style={{ marginTop: 12 }}>
        {proof.state === "approved"
          ? <a className="btn btn-primary btn-sm" href={`${pdf}&download=1`}>Download your included PDF</a>
          : <a className="btn btn-line btn-sm" href={pdf} target="_blank" rel="noreferrer" onClick={() => setOpened(true)}>Open proof PDF</a>}
        {proof.state === "awaiting_approval" && (
          <>
            <button className="btn btn-primary btn-sm" disabled={busy || !opened} onClick={() => respond("approve")}>Approve for print</button>
            <button className="btn btn-link" disabled={busy} aria-expanded={showChanges} onClick={() => setShowChanges(!showChanges)}>Request changes</button>
          </>
        )}
      </div>
      {proof.state === "awaiting_approval" && showChanges && (
        <form className="field" onSubmit={(e) => { e.preventDefault(); void respond("changes"); }}>
          <label htmlFor="proof-changes">What should we change?</label>
          <textarea id="proof-changes" className="textarea" value={message} minLength={4} maxLength={1000} required onChange={(e) => setMessage(e.target.value)} />
          <button className="btn btn-dark btn-sm" disabled={busy} style={{ marginTop: 8 }}>Send requested changes</button>
        </form>
      )}
      {error && <p className="err" role="alert">{error}</p>}
    </section>
  );
}

export default function Order() {
  const { key } = useParams<{ key: string }>();
  const info = useShop();
  const [o, setO] = useState<OrderView | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [polls, setPolls] = useState(0);
  const [retrying, setRetrying] = useState(false);
  const [thanks, setThanks] = useState(false);
  const fromCheckout = new URLSearchParams(location.search).get("from") === "checkout";
  useTitle(o ? `Order ${o.id} · Little Plot Books` : "Your order · Little Plot Books");

  const load = useCallback(async () => {
    try { const r = await api<OrderView>(`/api/books/order/${key}`); setO(r); setErr(null); return r; }
    catch (e) { setErr(e instanceof Error ? e.message : "We couldn't load this order."); return null; }
  }, [key]);

  useEffect(() => {
    let stop = false, n = 0;
    const tick = async () => {
      const r = await load();
      n++; setPolls(n);
      if (!stop && r && r.status === "awaiting_payment" && n < 60) setTimeout(tick, n < 15 ? 1500 : 4000);
    };
    tick();
    return () => { stop = true; };
  }, [load]);

  const retry = async () => {
    setRetrying(true);
    try { const r = await api<{ url: string }>(`/api/books/order/${key}/pay`, { method: "POST" }); location.assign(r.url); }
    catch (e) { setErr(e instanceof Error ? e.message : "Couldn't start payment."); setRetrying(false); }
  };

  const step = o ? FLOW.indexOf(o.status === "awaiting_details" ? "paid" : o.status) : -1;
  const progress = o && o.format !== "ebook" && o.status !== "delivered"
    ? o.proof?.state === "approved" ? 2 : o.proof ? 1 : Math.min(step, 1)
    : step;
  return (
    <>
      <Header info={info} />
      <main id="main" className="wrap narrow" style={{ padding: "28px var(--gutter) 80px" }}>
        {err ? <div className="note note-err" role="alert">{err}</div> : null}
        {!o && !err ? <p aria-live="polite">Loading your order…</p> : null}
        {o ? (
          <>
            <div className="card">
              {o.paidAt && fromCheckout ? <DrawnStar size={60} style={{ position: "static" }} /> : null}
              <p className="kicker" style={{ marginTop: 6 }}>Order {o.id}{o.test ? " · TEST" : ""}</p>
              <h1 style={{ fontSize: "clamp(26px,4.6vw,36px)" }}>{o.title}</h1>
              <p role="status" aria-live="polite" style={{ marginTop: 10, fontWeight: 600, fontSize: 18 }}>
                {o.status === "awaiting_payment" ? (polls > 10 ? "Still waiting for the payment to be confirmed. This page updates by itself." : "Confirming your payment…") : o.paidAt ? `Payment received. ${o.statusLabel}.` : o.statusLabel}
              </p>
              {o.status === "awaiting_payment" ? <p className="hint">We only show “received” when our payment provider confirms it to our server.</p> : null}
              {o.canPay && o.status !== "awaiting_payment" ? (
                <div className="note note-err">
                  The payment didn’t go through, so nothing was charged. Your book details and photos are saved.
                  <div style={{ marginTop: 10 }}><button type="button" className="btn btn-primary btn-sm" onClick={retry} disabled={retrying}>{retrying ? "Opening checkout…" : `Try payment again · ${euro(o.quote.bookCents + o.quote.extrasCents + o.quote.shippingCents)}`}</button></div>
                </div>
              ) : null}
              {o.status === "awaiting_details" ? <div className="note note-info">We’ve emailed you a quick question about your book. Just reply to that email.</div> : null}
              {o.paidAt ? (
                <>
                  <p style={{ marginTop: 14 }}>We’ve sent a receipt to <strong>{o.email}</strong>.</p>
                  <ol className="timeline">
                    {["Paid", "We’re writing and illustrating", o.format === "ebook" ? "Ebook ready" : "Proof approved", o.format === "ebook" ? "Delivered to you" : "Posted to you"].map((t, i) => (
                      <li key={t} className={i <= progress ? "on" : ""}><span className="dot" aria-hidden="true" />{t}</li>
                    ))}
                  </ol>
                  {!o.proof && o.status !== "delivered" && o.status !== "cancelled" ? <p className="note note-plain small"><strong>What happens next</strong><br />{o.format === "ebook" ? "We’ll email you when your PDF is ready." : "We’ll write and illustrate your book, then email a private PDF for you to check before we print."}</p> : null}
                </>
              ) : null}
              {o.proof && <ProofReview key={`${o.proof.version}:${o.proof.state}`} proof={o.proof} orderKey={key} onDone={load} />}
              {o.ebookReady ? <a className="btn btn-primary" style={{ marginTop: 16 }} href={`/api/books/order/${key}/ebook`}>Download your ebook (PDF)</a> : null}
              {o.tracking ? <p style={{ marginTop: 14 }}>Posted with {o.tracking.carrier}. Tracking number: <span className="code">{o.tracking.number}</span></p> : null}
            </div>

            <div className="card" style={{ marginTop: 18 }}>
              <h2 style={{ fontSize: 22 }}>Your order</h2>
              <dl className="kv">
                <dt>Book</dt><dd>{o.route === "custom" ? "Your own story idea" : o.title}</dd>
                <dt>Characters</dt><dd>{o.characters.map((c) => `${c.name ?? "?"}${c.hasPhoto ? " (photo)" : ""}`).join(", ")}</dd>
                <dt>Style</dt><dd>{o.style}</dd>
                <dt>Format</dt><dd>{o.formatLabel}</dd>
                <dt>Book price</dt><dd>{euro(o.quote.bookCents)}{o.quote.wasCents ? ` (${o.quote.saleLabel}, was ${euro(o.quote.wasCents)})` : ""}</dd>
                {o.quote.extraCharacters ? <><dt>Extra characters</dt><dd>{o.quote.extraCharacters} × {euro(o.quote.extraCharacterCents)}</dd></> : null}
                {o.quote.shippingCents ? <><dt>Shipping</dt><dd>{euro(o.quote.shippingCents)}</dd></> : null}
                <dt>Total</dt><dd><strong>{euro(o.quote.totalCents)}</strong></dd>
              </dl>
              {o.quote.wasCents ? <p className="sale-note">{SALE_SCOPE}</p> : null}
            </div>

            {o.canReview && !thanks ? <ReviewForm k={key} onDone={() => { setThanks(true); load(); }} /> : null}
            {thanks || o.review ? <div className="note note-ok">Thank you for your review. We’ll read it soon.</div> : null}
            <p className="hint" style={{ marginTop: 18 }}>This page is private to your order. Questions? <Link href="/contact">Contact us</Link> and include your order number.</p>
          </>
        ) : null}
      </main>
      <Footer />
    </>
  );
}
