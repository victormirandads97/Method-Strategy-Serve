import { useState } from "react";
import { api, useShop, useTitle } from "../lib/api";
import { Footer, Header } from "../components/Chrome";

export default function Contact() {
  useTitle("Contact · Little Plot Books");
  const info = useShop();
  const reviewHelp = new URLSearchParams(window.location.search).get("topic") === "review";
  const [f, setF] = useState({ name: "", email: "", orderRef: "", body: reviewHelp ? "Could you help me find my private order link so I can leave a review?" : "", website: "" });
  const [state, setState] = useState<"idle" | "busy" | "sent">("idle");
  const [err, setErr] = useState<string | null>(null);
  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null); setState("busy");
    try { await api("/api/books/contact", { method: "POST", json: f }); setState("sent"); }
    catch (x) { setErr(x instanceof Error ? x.message : "That didn't send."); setState("idle"); }
  };
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });
  return (
    <>
      <Header info={info} />
      <main id="main" className="wrap narrow" style={{ padding: "40px var(--gutter) 80px" }}>
        <h1 className="h2">{reviewHelp ? "Find your order link" : "Get in touch"}</h1>
        <p className="lede">{reviewHelp ? "Use the email address you ordered with so we can find your book." : "Questions about a story, a photo, an order or a delivery? Send us a message and we’ll reply by email."}{info?.contactEmail ? <> You can also email <a href={`mailto:${info.contactEmail}`}>{info.contactEmail}</a>.</> : null}</p>
        {state === "sent" ? <div className="note note-ok" role="status">Thanks! Your message is with us, and we’ll reply to {f.email}.</div> : (
          <form onSubmit={send} className="card" style={{ marginTop: 24 }}>
            <div className="row2">
              <div className="field"><label htmlFor="c-name">Your name <span className="opt">(optional)</span></label><input id="c-name" className="input" autoComplete="name" value={f.name} onChange={set("name")} maxLength={60} /></div>
              <div className="field"><label htmlFor="c-email">Your email</label><input id="c-email" className="input" type="email" autoComplete="email" required value={f.email} onChange={set("email")} maxLength={200} /></div>
            </div>
            <div className="field"><label htmlFor="c-order">Order number <span className="opt">(optional, e.g. LPB-ABC234)</span></label><input id="c-order" className="input" value={f.orderRef} onChange={set("orderRef")} maxLength={20} /></div>
            <div className="field"><label htmlFor="c-body">Message</label><textarea id="c-body" className="textarea" required value={f.body} onChange={set("body")} maxLength={3000} /></div>
            <div className="sr-only" aria-hidden="true"><label>Website<input tabIndex={-1} value={f.website} onChange={set("website")} autoComplete="off" /></label></div>
            <p className="hint">Please don’t send children’s photos here. If we need one for your book, use the upload in the order form.</p>
            {err ? <p className="err" role="alert">{err}</p> : null}
            <button className="btn btn-dark" style={{ marginTop: 14 }} disabled={state === "busy"}>{state === "busy" ? "Sending…" : "Send message"}</button>
          </form>
        )}
      </main>
      <Footer />
    </>
  );
}
