import { useEffect, useState } from "react";
import { api, useTitle } from "../lib/api";

/** Test mode only: emails the server kept instead of sending. */
export default function Outbox() {
  useTitle("Test outbox · Little Plot Books");
  const [emails, setEmails] = useState<{ id: number; order_id: string; kind: string; to_addr: string; subject: string; html: string | null; status: string; created_at: number }[]>([]);
  const [open, setOpen] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    const load = () => api<{ emails: typeof emails }>("/api/books/dev/outbox").then((r) => setEmails(r.emails)).catch((e) => setErr(e.message));
    load(); const t = setInterval(load, 3000); return () => clearInterval(t);
  }, []);
  return (
    <main className="wrap" style={{ padding: "24px var(--gutter) 80px" }}>
      <h1 className="h2">Test outbox</h1>
      <p className="muted">Emails kept by the server because no mail provider is set. Newest first.</p>
      {err ? <div className="note note-err">{err}</div> : null}
      <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
        {emails.map((m) => (
          <div key={m.id} className="side-card">
            <button className="btn-link" style={{ textAlign: "left" }} onClick={() => setOpen(open === m.id ? null : m.id)} aria-expanded={open === m.id}>{m.subject}</button>
            <div className="hint">{new Date(m.created_at).toLocaleString("en-IE")} · {m.kind} · {m.order_id} · to {m.to_addr} · {m.status}</div>
            {open === m.id && m.html ? <iframe title={m.subject} srcDoc={m.html} sandbox="allow-popups allow-top-navigation-by-user-activation" style={{ width: "100%", height: 480, border: "1px solid var(--line)", borderRadius: 10, marginTop: 8, background: "#fff" }} /> : null}
          </div>
        ))}
      </div>
    </main>
  );
}
