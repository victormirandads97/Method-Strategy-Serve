import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import {
  PRINT_FORMAT_IDS, OWNER_STATUSES, ROLES, STATUS_LABEL, STYLES, euro, storyInfo, storyTitle,
  type Brief, type FormatId, type OrderStatus, type PrintProof, type Quote, type ShopSettings,
} from "@shared/books/catalog";
import { api, ApiError, useTitle } from "../../lib/api";
import { LogoIcon } from "../../components/Chrome";

const ts = (n?: number | null) => (n ? new Date(n).toLocaleString("en-IE", { dateStyle: "medium", timeStyle: "short" }) : "—");

function useOwner() {
  const [state, setState] = useState<"checking" | "in" | "out">("checking");
  const check = useCallback(() => api("/api/books/owner/me").then(() => setState("in")).catch(() => setState("out")), []);
  useEffect(() => { check(); }, [check]);
  return { state, check, signOut: async () => { await api("/api/books/owner/logout", { method: "POST" }).catch(() => undefined); setState("out"); } };
}

function SignIn({ onDone }: { onDone: () => void }) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  return (
    <main className="wrap narrow" style={{ padding: "56px var(--gutter)" }}>
      <div style={{ width: 48 }}><LogoIcon /></div>
      <h1 className="h2" style={{ marginTop: 12 }}>Owner sign-in</h1>
      <form className="card" style={{ marginTop: 18, maxWidth: 420 }} onSubmit={async (e) => {
        e.preventDefault(); setBusy(true); setErr(null);
        try { await api("/api/books/owner/login", { method: "POST", json: { email, password: pw } }); onDone(); }
        catch (x) { setErr(x instanceof Error ? x.message : "Sign-in failed."); } finally { setBusy(false); }
      }}>
        <div className="field" style={{ marginTop: 0 }}><label htmlFor="o-email">Email</label><input id="o-email" className="input" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div className="field"><label htmlFor="o-pw">Password</label><input id="o-pw" className="input" type="password" autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} /></div>
        {err ? <p className="err" role="alert">{err}</p> : null}
        <button className="btn btn-dark" style={{ marginTop: 16 }} disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
      </form>
    </main>
  );
}

function Shell({ children, signOut }: { children: ReactNode; signOut: () => void }) {
  const [loc] = useLocation();
  const tab = (href: string, label: string) => <Link href={href} aria-current={loc === href || (href === "/owner" && loc.startsWith("/owner/orders")) ? "page" : undefined}>{label}</Link>;
  return (
    <main className="wrap owner">
      <div className="toolbar" style={{ justifyContent: "space-between" }}>
        <Link href="/owner" className="logo"><LogoIcon /><span className="logo-word">Owner dashboard</span></Link>
        <div className="toolbar"><a href="/books/" className="btn-link">View shop</a><button className="btn btn-line btn-sm" onClick={signOut}>Sign out</button></div>
      </div>
      <nav className="owner-tabs" aria-label="Dashboard">{tab("/owner", "Orders")}{tab("/owner/reviews", "Reviews")}{tab("/owner/messages", "Messages")}{tab("/owner/settings", "Prices and settings")}</nav>
      {children}
    </main>
  );
}

// ---------------------------------------------------------------------------

interface ListRow { id: string; status: OrderStatus; mode: string; route: string; story: string | null; style: string; format: string; total_cents: number; email: string; created_at: number; paid_at: number | null; lead: string | null; photos: number }

function Orders() {
  const [, nav] = useLocation();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("open");
  const [mode, setMode] = useState("");
  const [rows, setRows] = useState<ListRow[] | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    const t = setTimeout(() => {
      api<{ orders: ListRow[]; counts: Record<string, number> }>(`/api/books/owner/orders?q=${encodeURIComponent(q)}&status=${status}&mode=${mode}`)
        .then((r) => { setRows(r.orders); setCounts(r.counts); setErr(null); }).catch((e) => setErr(e.message));
    }, 200);
    return () => clearTimeout(t);
  }, [q, status, mode]);
  const open = ["paid", "awaiting_details", "in_production", "ready"].reduce((n, s) => n + (counts[s] ?? 0), 0);
  return (
    <>
      <div className="toolbar">
        <input className="input" style={{ maxWidth: 320 }} placeholder="Search order, email or name" aria-label="Search orders" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="select" style={{ maxWidth: 230 }} aria-label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="open">To make ({open})</option>
          <option value="">All statuses</option>
          {(Object.keys(STATUS_LABEL) as OrderStatus[]).map((s) => <option key={s} value={s}>{STATUS_LABEL[s]} ({counts[s] ?? 0})</option>)}
        </select>
        <select className="select" style={{ maxWidth: 160 }} aria-label="Mode" value={mode} onChange={(e) => setMode(e.target.value)}>
          <option value="">Test and live</option><option value="live">Live only</option><option value="test">Test only</option>
        </select>
      </div>
      {err ? <div className="note note-err">{err}</div> : null}
      <div style={{ overflowX: "auto", marginTop: 14 }}>
        <table className="table">
          <thead><tr><th>Order</th><th>Status</th><th>Star</th><th>Book</th><th>Paid</th><th>Total</th></tr></thead>
          <tbody>
            {rows?.map((r) => (
              <tr key={r.id} onClick={() => nav(`/owner/orders/${r.id}`)}>
                <td><Link href={`/owner/orders/${r.id}`} onClick={(e) => e.stopPropagation()}>{r.id}</Link>{r.mode === "test" ? <> <span className="badge badge-test">TEST</span></> : null}<div className="hint">{r.email}</div></td>
                <td><span className={`badge badge-${r.status}`}>{STATUS_LABEL[r.status]}</span></td>
                <td>{r.lead ?? "—"}{r.photos ? <div className="hint">{r.photos} photo{r.photos > 1 ? "s" : ""}</div> : null}</td>
                <td>{r.route === "custom" ? "Own idea" : storyInfo(r.story as never)?.titlePattern.replace("{name} and the ", "") ?? r.story}<div className="hint">{STYLES.find((s) => s.id === r.style)?.name} · {r.format}</div></td>
                <td className="hint">{ts(r.paid_at)}</td>
                <td>{euro(r.total_cents)}</td>
              </tr>
            ))}
            {rows && !rows.length ? <tr><td colSpan={6} className="muted">No orders match.</td></tr> : null}
          </tbody>
        </table>
      </div>
    </>
  );
}

interface Detail {
  proof: PrintProof | null;
  order: { id: string; status: OrderStatus; statusLabel: string; mode: string; email: string; route: string; format: string; style: string; total_cents: number; quote: Quote; provider: string; payment_ref: string | null; shipping: { name?: string; address?: Record<string, string | null> | null; phone?: string | null } | null; ebook_key: string | null; ebook_uploaded_at: number | null; carrier: string | null; tracking: string | null; created_at: number; paid_at: number | null; delivered_at: number | null; photos_deleted_at: number | null };
  title: string; styleName: string; brief: Brief; photos: Record<string, { id: string; type: string; size: number; url: string }[]>;
  notes: { body: string; created_at: number }[]; events: { type: string; received_at: number }[]; emails: { kind: string; subject: string; status: string; created_at: number }[];
  review: { id: number; rating: number; status: string } | null; customerLink: string;
}

function OrderDetail() {
  const [loc] = useLocation();
  const id = loc.split("/")[3] ?? "";
  const [d, setD] = useState<Detail | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [note, setNote] = useState("");
  const [ask, setAsk] = useState("");
  const [ship, setShip] = useState({ carrier: "", tracking: "" });
  const [uploading, setUploading] = useState(false);
  const load = useCallback(() => api<Detail>(`/api/books/owner/orders/${id}`).then(setD).catch((e) => setMsg({ ok: false, text: e.message })), [id]);
  useEffect(() => { load(); }, [load]);
  const act = async (body: Record<string, unknown>, ok: string) => {
    setMsg(null);
    try { await api(`/api/books/owner/orders/${id}`, { method: "POST", json: body }); setMsg({ ok: true, text: ok }); await load(); }
    catch (e) { setMsg({ ok: false, text: e instanceof Error ? e.message : "Failed" }); }
  };
  const uploadPdf = async (file?: File, print = false) => {
    if (!file) return;
    setUploading(true); setMsg(null);
    try {
      const result = await api<{ email?: "sent" | "outbox" | "failed" }>(`/api/books/owner/orders/${id}/${print ? "proof" : "ebook"}`, {
        method: "PUT", body: file, headers: { "Content-Type": "application/pdf" },
      });
      const text = !print ? "PDF uploaded. Check it, then send it to the customer."
        : result.email === "sent" ? "Proof uploaded and customer emailed."
        : result.email === "outbox" ? "Proof uploaded. The email is in the outbox."
        : "Proof uploaded. Use Resend review link to try the email again.";
      setMsg({ ok: result.email !== "failed", text });
      await load();
    }
    catch (e) { setMsg({ ok: false, text: e instanceof ApiError ? e.message : "Upload failed." }); } finally { setUploading(false); }
  };
  if (!d) return <p>{msg?.text ?? "Loading…"}</p>;
  const o = d.order, b = d.brief, q = o.quote;
  const canUploadProof = !!o.paid_at && o.status !== "cancelled" && o.status !== "delivered" && d.proof?.state !== "approved";
  const canShip = d.proof?.state === "approved" && o.status !== "cancelled" && o.status !== "delivered";
  const addr = o.shipping?.address ? Object.values(o.shipping.address).filter(Boolean).join("\n") : null;
  return (
    <>
      <p><Link href="/owner">← All orders</Link></p>
      <div className="toolbar" style={{ marginTop: 8, justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontSize: 30 }}>{o.id} {o.mode === "test" ? <span className="badge badge-test">TEST</span> : null}</h1>
          <p className="muted">{d.title} · <span className={`badge badge-${o.status}`}>{o.statusLabel}</span></p>
        </div>
        <div className="toolbar">
          <a className="btn btn-line btn-sm" href={`/api/books/owner/orders/${o.id}/brief`}>Export production brief</a>
          <a className="btn btn-line btn-sm" href={d.customerLink} target="_blank" rel="noopener">Customer’s order page</a>
        </div>
      </div>
      {msg ? <div className={`note ${msg.ok ? "note-ok" : "note-err"}`} role="status">{msg.text}</div> : null}
      <div className="o-grid" style={{ marginTop: 16 }}>
        <div style={{ display: "grid", gap: 16 }}>
          <section className="card">
            <h2 style={{ fontSize: 22 }}>The brief</h2>
            <dl className="kv">
              <dt>Route</dt><dd>{b.route === "custom" ? "Dream up a story" : `Pick a story: ${storyTitle(b.story!, b.characters[0]?.name ?? "")}`}</dd>
              {b.route === "custom" && b.custom ? <>
                <dt>What happens</dt><dd>{b.custom.happen}</dd>
                {b.custom.where ? <><dt>Where</dt><dd>{b.custom.where}</dd></> : null}
                {b.custom.tone ? <><dt>Tone</dt><dd>{b.custom.tone}</dd></> : null}
                {b.custom.include ? <><dt>Would love to see</dt><dd>{b.custom.include}</dd></> : null}
                {b.custom.thatsMe ? <><dt>“That’s me!”</dt><dd>{b.custom.thatsMe}</dd></> : null}
              </> : null}
              <dt>Art style</dt><dd><strong>{d.styleName}</strong></dd>
              <dt>Format</dt><dd>{o.format}</dd>
              <dt>Favourite phrases</dt><dd>{b.touches.phrases ?? "—"}</dd>
              <dt>Things they love</dt><dd>{b.touches.interests ?? "—"}</dd>
              <dt>Places</dt><dd>{b.touches.places ?? "—"}</dd>
              <dt>Must include</dt><dd>{b.touches.mustInclude ?? "—"}</dd>
              <dt>Leave out</dt><dd>{b.touches.leaveOut ?? "—"}</dd>
              <dt>Dedication</dt><dd>{b.touches.dedication ?? "(none: write a short one)"}</dd>
              <dt>Photo permission</dt><dd>{b.photoConsent ? "Confirmed by the customer" : "No photos"}</dd>
            </dl>
          </section>
          <section className="card">
            <h2 style={{ fontSize: 22 }}>Characters and photos</h2>
            {o.photos_deleted_at ? <p className="note note-plain small">Photos deleted {ts(o.photos_deleted_at)}.</p> : null}
            {b.characters.map((c, i) => (
              <div key={c.id} style={{ borderTop: i ? "1px solid var(--line)" : 0, paddingTop: i ? 14 : 0, marginTop: 14 }}>
                <h3 style={{ fontSize: 19 }}>{i === 0 ? "★ " : ""}{c.name} <span className="muted small">· {ROLES.find((r) => r.id === c.role)?.label}{c.ageRange ? `, ${c.ageRange}` : ""}{i > 0 ? " · extra" : ""}</span></h3>
                <dl className="kv">
                  {c.species ? <><dt>Species</dt><dd>{c.species}</dd></> : null}
                  {c.markings ? <><dt>Markings</dt><dd>{c.markings}</dd></> : null}
                  {c.personality ? <><dt>Personality</dt><dd>{c.personality}</dd></> : null}
                  {c.description ? <><dt>About them</dt><dd>{c.description}</dd></> : null}
                  {c.appearance ? <><dt>Looks like</dt><dd>{c.appearance}</dd></> : null}
                </dl>
                <div className="photo-grid">
                  {(d.photos[c.id] ?? []).map((p) => (
                    <figure key={p.id}><img src={p.url} alt={`Reference photo of ${c.name}`} /><figcaption><a href={`${p.url}&download=1`}>Download</a> · {Math.round(p.size / 1024)} KB</figcaption></figure>
                  ))}
                  {!(d.photos[c.id] ?? []).length ? <p className="hint">No photo. Use the description.</p> : null}
                </div>
              </div>
            ))}
            {Object.keys(d.photos).length ? <button className="btn-link" style={{ marginTop: 10, color: "var(--err)" }} onClick={() => confirm("Delete all reference photos for this order? This can't be undone.") && act({ action: "delete_photos" }, "Photos deleted.")}>Delete these photos now</button> : null}
          </section>
        </div>
        <div style={{ display: "grid", gap: 16 }}>
          <section className="card">
            <h2 style={{ fontSize: 22 }}>Make and deliver</h2>
            {o.status === "awaiting_payment" || o.status === "payment_failed" ? <p className="note note-info">Not paid. Don’t start this book.</p> : null}
            <div className="field" style={{ marginTop: 10 }}>
              <label htmlFor="st">Status</label>
              <select id="st" className="select" value={o.status} onChange={(e) => act({ action: "status", status: e.target.value }, "Status updated.")}>
                <option value={o.status} disabled>{STATUS_LABEL[o.status]}</option>
                {OWNER_STATUSES.filter((s) => s !== "delivered" && s !== o.status).map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
              </select>
            </div>
            {o.format === "ebook" ? (
              <div className="field">
                <span className="label">Finished ebook</span>
                <p className="small">{o.ebook_key ? `Uploaded ${ts(o.ebook_uploaded_at)}.` : "Not uploaded yet."}</p>
                <div className="toolbar" style={{ marginTop: 6 }}>
                  <label className="btn btn-line btn-sm" style={{ cursor: "pointer" }}>{uploading ? "Uploading…" : o.ebook_key ? "Replace PDF" : "Upload PDF"}<input type="file" accept="application/pdf" className="sr-only" onChange={(e) => uploadPdf(e.target.files?.[0])} disabled={uploading || !o.paid_at} /></label>
                  <button className="btn btn-dark btn-sm" disabled={!o.ebook_key} onClick={() => act({ action: "deliver_ebook" }, "Sent. The customer can download it from their order page.")}>{o.status === "delivered" ? "Send the link again" : "Send to customer"}</button>
                </div>
              </div>
            ) : (
              <>
                <div className="field">
                  <h3 style={{ fontSize: 19 }}>Customer proof</h3>
                  <p className="small">
                    {d.proof?.state === "approved" ? "Approved for print. The customer can download the included PDF."
                      : d.proof?.state === "changes_requested" ? "The customer asked for changes. Upload a revised PDF for approval."
                      : d.proof ? "Waiting for the customer to approve this version."
                      : "Upload the illustrated PDF when it’s ready for the customer to review."}
                  </p>
                  {d.proof?.message && <p className="note note-info" style={{ whiteSpace: "pre-wrap" }}>{d.proof.message}</p>}
                  <div className="toolbar" style={{ marginTop: 8 }}>
                    {canUploadProof && (
                      <label className="btn btn-line btn-sm" style={{ cursor: "pointer" }}>
                        {uploading ? "Uploading…" : d.proof ? "Replace PDF and send for review" : "Upload PDF and send for review"}
                        <input type="file" accept="application/pdf" className="sr-only" disabled={uploading} onChange={(e) => {
                          const file = e.target.files?.[0];
                          e.target.value = "";
                          void uploadPdf(file, true);
                        }} />
                      </label>
                    )}
                    {d.proof && <a href={`/api/books/owner/orders/${id}/proof`} target="_blank" rel="noreferrer" className="btn-link">Open proof PDF</a>}
                    {canUploadProof && d.proof?.state === "awaiting_approval" && (
                      <button className="btn btn-line btn-sm" onClick={() => act({ action: "resend_proof" }, "Review email requested. Check the email log for delivery status.")}>Resend review link</button>
                    )}
                  </div>
                </div>
              <div className="field">
                <span className="label">Ship to</span>
                <p className="small" style={{ whiteSpace: "pre-line" }}>{o.shipping?.name}{addr ? `\n${addr}` : ""}{o.shipping?.phone ? `\n${o.shipping.phone}` : ""}</p>
                {o.tracking ? <p className="small">Shipped: {o.carrier} <span className="code">{o.tracking}</span></p> : null}
                <div className="row2">
                  <div className="field"><label htmlFor="carrier">Carrier</label><input id="carrier" className="input" value={ship.carrier} onChange={(e) => setShip({ ...ship, carrier: e.target.value })} placeholder="e.g. An Post" /></div>
                  <div className="field"><label htmlFor="trk">Tracking number</label><input id="trk" className="input" value={ship.tracking} onChange={(e) => setShip({ ...ship, tracking: e.target.value })} /></div>
                </div>
                {!o.tracking && <button className="btn btn-dark btn-sm" style={{ marginTop: 10 }} disabled={!canShip} onClick={() => act({ action: "ship", ...ship }, "Marked as shipped. Check the email log for tracking notification.")}>Record shipping and email customer</button>}
                {!canShip && !o.tracking && <p className="hint">The customer must approve the proof before shipping.</p>}
              </div>
              </>
            )}
            <div className="field">
              <label htmlFor="ask">Ask the customer for details</label>
              <textarea id="ask" className="textarea" value={ask} onChange={(e) => setAsk(e.target.value)} placeholder="e.g. Could you tell us what colour Biscuit's collar is?" />
              <button className="btn btn-line btn-sm" style={{ marginTop: 8 }} onClick={() => act({ action: "request_details", message: ask }, "Email sent. Status is Awaiting details.").then(() => setAsk(""))}>Email question</button>
            </div>
          </section>
          <section className="card">
            <h2 style={{ fontSize: 22 }}>Customer and payment</h2>
            <dl className="kv">
              <dt>Email</dt><dd><a href={`mailto:${o.email}`}>{o.email}</a></dd>
              <dt>Name</dt><dd>{b.contact.name ?? "—"}</dd>
              <dt>Paid</dt><dd>{o.paid_at ? `${euro(o.total_cents)} on ${ts(o.paid_at)}` : "Not paid"}</dd>
              <dt>Breakdown</dt><dd>Book {euro(q.bookCents)}{q.wasCents ? ` (${q.saleLabel}, ref. ${euro(q.wasCents)})` : ""}{q.extraCharacters ? `\n${q.extraCharacters} extra × ${euro(q.extraCharacterCents)}` : ""}{q.shippingCents ? `\nShipping ${euro(q.shippingCents)}` : ""}</dd>
              <dt>Provider</dt><dd>{o.provider} · <span className="code">{o.payment_ref ?? "—"}</span></dd>
              <dt>Marketing</dt><dd>{b.marketing ? "Opted in" : "No"}</dd>
              <dt>Ordered</dt><dd>{ts(o.created_at)}</dd>
              {o.delivered_at ? <><dt>Delivered</dt><dd>{ts(o.delivered_at)}</dd></> : null}
              {d.review ? <><dt>Review</dt><dd>{"★".repeat(d.review.rating)} · {d.review.status}</dd></> : null}
            </dl>
          </section>
          <section className="card">
            <h2 style={{ fontSize: 22 }}>Production notes</h2>
            <textarea className="textarea" aria-label="New note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Private to you" />
            <button className="btn btn-line btn-sm" style={{ marginTop: 8 }} onClick={() => act({ action: "note", body: note }, "Note added.").then(() => setNote(""))}>Add note</button>
            <ul style={{ paddingLeft: 18, marginTop: 12, fontSize: 14.5 }}>
              {d.notes.map((n, i) => <li key={i} style={{ marginTop: 6 }}><span className="hint">{ts(n.created_at)}</span><br />{n.body}</li>)}
            </ul>
            <details style={{ marginTop: 10 }}><summary className="small">Emails and payment events</summary>
              <ul className="small" style={{ paddingLeft: 18 }}>{d.events.map((e, i) => <li key={`e${i}`}>{ts(e.received_at)} · {e.type}</li>)}{d.emails.map((e, i) => <li key={`m${i}`}>{ts(e.created_at)} · {e.subject} ({e.status})</li>)}</ul>
            </details>
          </section>
        </div>
      </div>
    </>
  );
}

function Reviews() {
  const [rows, setRows] = useState<{ id: number; order_id: string | null; rating: number; body: string; display_name: string | null; publish_ok: number; status: string; verified: number; created_at: number }[]>([]);
  const load = () => api<{ reviews: typeof rows }>("/api/books/owner/reviews").then((r) => setRows(r.reviews));
  useEffect(() => { load(); }, []);
  const act = async (id: number, action: string) => { await api(`/api/books/owner/reviews/${id}`, { method: "POST", json: { action } }); load(); };
  return (
    <>
      <p className="muted">Approve genuine reviews, critical ones included. Only approved reviews with the customer’s permission appear on the site, and only then do the rating and count show.</p>
      <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
        {rows.map((r) => (
          <div key={r.id} className="card">
            <div className="toolbar" style={{ justifyContent: "space-between" }}>
              <span><span className="stars">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span> <span className={`badge badge-${r.status}`}>{r.status}</span> {r.verified ? <span className="verified">Verified · <Link href={`/owner/orders/${r.order_id}`}>{r.order_id}</Link></span> : null}</span>
              <span className="hint">{ts(r.created_at)}</span>
            </div>
            <p style={{ marginTop: 8, whiteSpace: "pre-line" }}>{r.body}</p>
            <p className="hint">Shown as: {r.display_name || "A customer"} · {r.publish_ok ? "May be published" : "Customer did NOT allow publishing"}</p>
            <div className="toolbar" style={{ marginTop: 8 }}>
              <button className="btn btn-dark btn-sm" onClick={() => act(r.id, "approve")} disabled={r.status === "approved"}>Approve</button>
              <button className="btn btn-line btn-sm" onClick={() => act(r.id, "reject")}>Reject</button>
              <button className="btn btn-line btn-sm" onClick={() => act(r.id, "spam")}>Spam</button>
            </div>
          </div>
        ))}
        {!rows.length ? <p className="muted">No reviews yet. Customers can leave one from their order page once the book is delivered.</p> : null}
      </div>
    </>
  );
}

function Messages() {
  const [rows, setRows] = useState<{ id: number; name: string | null; email: string; order_ref: string | null; body: string; created_at: number; handled: number }[]>([]);
  const load = () => api<{ messages: typeof rows }>("/api/books/owner/messages").then((r) => setRows(r.messages));
  useEffect(() => { load(); }, []);
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {rows.map((m) => (
        <div key={m.id} className="card" style={{ opacity: m.handled ? 0.6 : 1 }}>
          <p><strong>{m.name ?? "No name"}</strong> · <a href={`mailto:${m.email}`}>{m.email}</a>{m.order_ref ? ` · ${m.order_ref}` : ""} <span className="hint">· {ts(m.created_at)}</span></p>
          <p style={{ marginTop: 6, whiteSpace: "pre-line" }}>{m.body}</p>
          {!m.handled ? <button className="btn btn-line btn-sm" style={{ marginTop: 8 }} onClick={() => api("/api/books/owner/messages", { method: "POST", json: { id: m.id } }).then(load)}>Mark as handled</button> : null}
        </div>
      ))}
      {!rows.length ? <p className="muted">No messages.</p> : null}
    </div>
  );
}

function Settings() {
  const [s, setS] = useState<ShopSettings | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  useEffect(() => { api<{ settings: ShopSettings }>("/api/books/owner/settings").then((r) => setS(r.settings)); }, []);
  if (!s) return <p>Loading…</p>;
  const save = async () => {
    setMsg(null);
    try { const r = await api<{ settings: ShopSettings }>("/api/books/owner/settings", { method: "PUT", json: { settings: s } }); setS(r.settings); setMsg({ ok: true, text: "Saved. The shop uses these prices now." }); }
    catch (e) { setMsg({ ok: false, text: e instanceof Error ? e.message : "Not saved." }); }
  };
  const fmt = (f: FormatId, patch: Partial<ShopSettings["formats"]["ebook"]>) => setS({ ...s, formats: { ...s.formats, [f]: { ...s.formats[f], ...patch } } });
  const centsIn = (v: number | null, on: (n: number | null) => void, nullable = false, id?: string) => (
    <input id={id} className="input" inputMode="decimal" defaultValue={v === null ? "" : (v / 100).toFixed(2)} onBlur={(e) => { const t = e.target.value.trim(); on(t === "" && nullable ? null : Math.round(parseFloat(t.replace(",", ".")) * 100) || 0); }} />
  );
  const toLocal = (iso: string | null) => (iso ? new Date(iso).toISOString().slice(0, 16) : "");
  return (
    <>
      {msg ? <div className={`note ${msg.ok ? "note-ok" : "note-err"}`} role="status">{msg.text}</div> : null}
      <div className="settings-grid" style={{ marginTop: 10 }}>
        <section className="card">
          <h2 style={{ fontSize: 22 }}>Christmas treatment</h2>
          <label className="check field"><input type="checkbox" checked={s.christmas.enabled} onChange={(e) => setS({ ...s, christmas: { ...s.christmas, enabled: e.target.checked } })} /><span>Show the Christmas bar, stars and greenery</span></label>
          <div className="field"><label htmlFor="ann">Announcement bar text</label><input id="ann" className="input" value={s.christmas.announcement} onChange={(e) => setS({ ...s, christmas: { ...s.christmas, announcement: e.target.value } })} /></div>
        </section>
        <section className="card">
          <h2 style={{ fontSize: 22 }}>Black Friday and other promotions</h2>
          <label className="check field"><input type="checkbox" checked={s.campaign.enabled} onChange={(e) => setS({ ...s, campaign: { ...s.campaign, enabled: e.target.checked } })} /><span>Campaign on</span></label>
          <div className="row2">
            <div className="field"><label htmlFor="cl">Label</label><input id="cl" className="input" value={s.campaign.label} onChange={(e) => setS({ ...s, campaign: { ...s.campaign, label: e.target.value } })} /></div>
            <div className="field"><label htmlFor="cp">Discount %</label><input id="cp" className="input" type="number" min={0} max={90} value={s.campaign.percentOff} onChange={(e) => setS({ ...s, campaign: { ...s.campaign, percentOff: Number(e.target.value) } })} /></div>
            <div className="field"><label htmlFor="cs">Starts</label><input id="cs" className="input" type="datetime-local" value={toLocal(s.campaign.startsAt)} onChange={(e) => setS({ ...s, campaign: { ...s.campaign, startsAt: e.target.value ? new Date(e.target.value).toISOString() : null } })} /></div>
            <div className="field"><label htmlFor="ce">Ends</label><input id="ce" className="input" type="datetime-local" value={toLocal(s.campaign.endsAt)} onChange={(e) => setS({ ...s, campaign: { ...s.campaign, endsAt: e.target.value ? new Date(e.target.value).toISOString() : null } })} /></div>
          </div>
          <p className="hint">Runs only between the dates, and only for formats whose reference price is ticked as verified. Extra characters and shipping are never discounted.</p>
        </section>
        {PRINT_FORMAT_IDS.map((f) => {
          const x = s.formats[f];
          return (
            <section className="card" key={f}>
              <h2 style={{ fontSize: 22 }}>{x.label}</h2>
              <label className="check field"><input type="checkbox" checked={x.enabled} onChange={(e) => fmt(f, { enabled: e.target.checked })} /><span>Available to order</span></label>
              <div className="row2">
                <div className="field"><label htmlFor={`p-${f}`}>Price (€)</label>{centsIn(x.priceCents, (n) => fmt(f, { priceCents: n ?? 0 }), false, `p-${f}`)}</div>
                <div className="field"><label htmlFor={`r-${f}`}>Reference price (€)</label>{centsIn(x.referencePriceCents, (n) => fmt(f, { referencePriceCents: n }), true, `r-${f}`)}</div>
                <div className="field"><label htmlFor={`sh-${f}`}>Shipping (€)</label>{centsIn(x.shippingCents, (n) => fmt(f, { shippingCents: n }), true, `sh-${f}`)}</div>
                <div className="field"><label htmlFor={`cut-${f}`}>Christmas order-by date</label><input id={`cut-${f}`} className="input" type="date" value={x.christmasCutoff ?? ""} onChange={(e) => fmt(f, { christmasCutoff: e.target.value || null })} /></div>
              </div>
              <label className="check field"><input type="checkbox" checked={x.referenceVerified} onChange={(e) => fmt(f, { referenceVerified: e.target.checked })} /><span>The reference price is genuine (we really sold at it, e.g. the lowest price in the 30 days before the sale)</span></label>
              <div className="field"><label htmlFor={`t-${f}`}>Turnaround shown to customers</label><input id={`t-${f}`} className="input" value={x.turnaround ?? ""} placeholder="Leave blank to promise nothing" onChange={(e) => fmt(f, { turnaround: e.target.value || null })} /></div>
              <div className="field"><label htmlFor={`d-${f}`}>Delivery line</label><input id={`d-${f}`} className="input" value={x.shipping ?? ""} onChange={(e) => fmt(f, { shipping: e.target.value || null })} /></div>
              <div className="field"><label htmlFor={`sp-${f}`}>Specs, one per line</label><textarea id={`sp-${f}`} className="textarea" value={x.specs.join("\n")} onChange={(e) => fmt(f, { specs: e.target.value.split("\n").map((l) => l.trim()).filter(Boolean) })} /></div>
            </section>
          );
        })}
        <section className="card">
          <h2 style={{ fontSize: 22 }}>Extras, contact and privacy</h2>
          <div className="row2">
            <div className="field"><label htmlFor="xc">Extra character (€)</label>{centsIn(s.extraCharacterCents, (n) => setS({ ...s, extraCharacterCents: n ?? 0 }), false, "xc")}</div>
            <div className="field"><label htmlFor="ce2">Contact email shown</label><input id="ce2" className="input" value={s.contactEmail ?? ""} onChange={(e) => setS({ ...s, contactEmail: e.target.value || null })} /></div>
            <div className="field"><label htmlFor="tax">Tax note</label><input id="tax" className="input" value={s.taxNote ?? ""} placeholder="e.g. Prices include VAT." onChange={(e) => setS({ ...s, taxNote: e.target.value || null })} /></div>
            <div className="field"><label htmlFor="ret">Delete photos after delivery (days)</label><input id="ret" className="input" type="number" min={1} value={s.photoRetentionDays} onChange={(e) => setS({ ...s, photoRetentionDays: Number(e.target.value) })} /></div>
          </div>
          <div className="field"><label htmlFor="proc">Outside providers that receive customer photos (one per line; leave empty if none)</label><textarea id="proc" className="textarea" value={s.photoProcessors.join("\n")} onChange={(e) => setS({ ...s, photoProcessors: e.target.value.split("\n").map((l) => l.trim()).filter(Boolean) })} /></div>
        </section>
      </div>
      <div style={{ position: "sticky", bottom: 0, background: "var(--paper)", padding: "12px 0", marginTop: 16 }}><button className="btn btn-primary" onClick={save}>Save settings</button></div>
    </>
  );
}

export default function Owner() {
  useTitle("Owner dashboard · Little Plot Books");
  const { state, check, signOut } = useOwner();
  const [loc] = useLocation();
  if (state === "checking") return <main className="wrap owner"><p>Loading…</p></main>;
  if (state === "out") return <SignIn onDone={check} />;
  const view = loc.startsWith("/owner/orders/") ? <OrderDetail /> : loc === "/owner/reviews" ? <Reviews /> : loc === "/owner/messages" ? <Messages /> : loc === "/owner/settings" ? <Settings /> : <Orders />;
  return <Shell signOut={signOut}>{view}</Shell>;
}
