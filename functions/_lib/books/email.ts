/**
 * Transactional email for Little Plot Books.
 *
 * Sends through Resend when RESEND_API_KEY and BOOKS_EMAIL_FROM are set.
 * Without them (local and test mode) each email is kept in the lpb_outbox
 * table and shown at /books/dev/outbox, so the whole flow can be followed
 * without a mail provider. In live mode only the subject and status are kept.
 */
import { BooksEnv, now, ready, testMode } from "./core";

export interface Mail {
  to: string;
  subject: string;
  kind: string;
  orderId?: string;
  /** Short paragraphs. Plain text, escaped here. */
  lines: string[];
  button?: { label: string; url: string };
  footer?: string;
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export function renderMail(m: Mail): { html: string; text: string } {
  const html = `<!doctype html><html><body style="margin:0;background:#FFF8ED;font-family:Helvetica,Arial,sans-serif;color:#35263D">
<div style="max-width:520px;margin:0 auto;padding:32px 24px">
<p style="font-family:Georgia,serif;font-size:22px;margin:0 0 28px"><strong>Little Plot Books</strong></p>
${m.lines.map((l) => `<p style="font-size:16px;line-height:1.5;margin:0 0 14px">${esc(l)}</p>`).join("\n")}
${m.button ? `<p style="margin:26px 0"><a href="${esc(m.button.url)}" style="background:#9B3652;color:#fff;text-decoration:none;padding:14px 22px;border-radius:999px;font-weight:bold;display:inline-block">${esc(m.button.label)}</a></p>
<p style="font-size:13px;color:#6b5a72;word-break:break-all">Or copy this private link: ${esc(m.button.url)}</p>` : ""}
<p style="font-size:13px;color:#6b5a72;margin-top:28px">${esc(m.footer ?? "This link is private to your order. Please don't share it.")}</p>
</div></body></html>`;
  const text = [...m.lines, m.button ? `${m.button.label}: ${m.button.url}` : "", m.footer ?? ""].filter(Boolean).join("\n\n");
  return { html, text };
}

export async function sendMail(env: BooksEnv, m: Mail): Promise<"sent" | "outbox" | "failed"> {
  const d = await ready(env);
  const { html, text } = renderMail(m);
  let status: "sent" | "outbox" | "failed" = "outbox";
  let error: string | null = null;
  if (env.RESEND_API_KEY && env.BOOKS_EMAIL_FROM) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from: env.BOOKS_EMAIL_FROM, to: [m.to], subject: m.subject, html, text }),
      });
      status = res.ok ? "sent" : "failed";
      if (!res.ok) error = `Resend responded ${res.status}`;
    } catch (e) {
      status = "failed";
      error = e instanceof Error ? e.message : "send failed";
    }
  }
  // Full content is kept only in test mode, where /books/dev/outbox shows it.
  const keepBody = testMode(env);
  await d
    .prepare("INSERT INTO lpb_outbox (order_id, kind, to_addr, subject, html, status, error, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
    .bind(m.orderId ?? null, m.kind, keepBody ? m.to : "(hidden)", m.subject, keepBody ? html : null, status, error, now())
    .run();
  if (status === "failed") console.error("books email failed:", m.kind, m.orderId ?? "", error);
  return status;
}

export async function notifyOperator(env: BooksEnv, subject: string, lines: string[], orderId?: string) {
  if (!env.BOOKS_OWNER_NOTIFY_EMAIL) return;
  await sendMail(env, { to: env.BOOKS_OWNER_NOTIFY_EMAIL, subject, kind: "operator", orderId, lines, footer: "Operator notification." });
}
