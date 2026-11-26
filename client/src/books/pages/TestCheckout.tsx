import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { euro, type Quote } from "@shared/books/catalog";
import { api, useTitle } from "../lib/api";

/** Built-in TEST checkout. Exists only when the server runs with BOOKS_TEST_CHECKOUT=on. */
export default function TestCheckout() {
  const { key } = useParams<{ key: string }>();
  useTitle("Test checkout · Little Plot Books");
  const [o, setO] = useState<{ id: string; status: string; total: string; format: string; email: string; quote: Quote } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [ship, setShip] = useState({ name: "Test Parent", line1: "1 Test Street", line2: "", city: "Dublin 8", county: "Co. Dublin", eircode: "D08 TEST" });
  const [busy, setBusy] = useState(false);
  useEffect(() => { api<typeof o>(`/api/books/test-checkout/${key}`).then(setO).catch((e) => setErr(e.message)); }, [key]);
  const act = async (action: "pay" | "fail") => {
    setBusy(true); setErr(null);
    try { const r = await api<{ redirect: string }>(`/api/books/test-checkout/${key}`, { method: "POST", json: { action, shipping: ship } }); location.assign(r.redirect); }
    catch (e) { setErr(e instanceof Error ? e.message : "Failed"); setBusy(false); }
  };
  return (
    <main className="wrap narrow" style={{ padding: "24px var(--gutter) 80px" }}>
      <div className="note note-info"><strong>TEST CHECKOUT.</strong> No real payment. Stands in for Stripe in test environments and sends a signed test event through the real webhook code.</div>
      {err ? <div className="note note-err" role="alert">{err}</div> : null}
      {o ? (
        <div className="card" style={{ marginTop: 16 }}>
          <p className="kicker">Order {o.id}</p>
          <div className="lines">
            <div><span>Book</span><span>{euro(o.quote.bookCents)}</span></div>
            {o.quote.extraCharacters ? <div><span>{o.quote.extraCharacters} extra character(s)</span><span>{euro(o.quote.extrasCents)}</span></div> : null}
            {o.quote.shippingCents ? <div><span>Shipping</span><span>{euro(o.quote.shippingCents)}</span></div> : null}
            <div className="total"><span>Total</span><span>{o.total}</span></div>
          </div>
          <p className="hint">Receipt to {o.email} · status <span className="code">{o.status}</span></p>
          {o.format !== "ebook" ? (
            <div className="row2">
              {(Object.keys(ship) as (keyof typeof ship)[]).map((k) => (
                <div className="field" key={k}><label htmlFor={`s-${k}`}>{k}</label><input id={`s-${k}`} className="input" value={ship[k]} onChange={(e) => setShip({ ...ship, [k]: e.target.value })} /></div>
              ))}
            </div>
          ) : null}
          <div style={{ display: "grid", gap: 10, marginTop: 18 }}>
            <button className="btn btn-primary btn-block" disabled={busy} onClick={() => act("pay")}>Pay {o.total} with test card</button>
            <button className="btn btn-line btn-block" disabled={busy} onClick={() => act("fail")}>Simulate a failed payment</button>
            <a className="btn-link" href="/books/create?step=5&cancelled=1" style={{ textAlign: "center" }}>Cancel and go back</a>
          </div>
        </div>
      ) : null}
    </main>
  );
}
