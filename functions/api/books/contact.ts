/** POST /api/books/contact: a message for the owner. Stored, and emailed when notifications are set up. */
import { clean, STORIES } from "../../../shared/books/catalog";
import { HttpError, handle, json, now, ready, readJson, sameOrigin, type Ctx } from "../../_lib/books/core";
import { sendMail } from "../../_lib/books/email";

export const onRequestPost = handle(async (c: Ctx) => {
  sameOrigin(c);
  const b = await readJson<{ name?: string; email?: string; orderRef?: string; body?: string; website?: string; book?: { format?: string; story?: string } }>(c.request);
  if (b.website) return json({ ok: true }); // honeypot
  const email = clean(b.email, 200)?.toLowerCase();
  let body = clean(b.body, b.book ? 800 : 3000, true);
  if (b.book) {
    const format = b.book.format === "softcover" ? "Softcover" : b.book.format === "hardback" ? "Hardcover" : null;
    const story = b.book.story === "custom" ? "Own story idea" : STORIES.find((item) => item.id === b.book?.story)?.sampleTitle;
    if (!format || !story) throw new HttpError(400, "Choose a cover and a story.");
    body = ["Book request", format, story, body].filter(Boolean).join("\n");
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) throw new HttpError(400, "Add an email so we can reply.");
  if (!body || body.length < 5) throw new HttpError(400, "Write your message.");
  const d = await ready(c.env);
  await d.prepare("INSERT INTO lpb_messages (name, email, order_ref, body, created_at) VALUES (?, ?, ?, ?, ?)").bind(clean(b.name, 60) ?? null, email, clean(b.orderRef, 20) ?? null, body, now()).run();
  if (c.env.BOOKS_OWNER_NOTIFY_EMAIL) {
    await sendMail(c.env, { to: c.env.BOOKS_OWNER_NOTIFY_EMAIL, kind: "contact", subject: b.book ? "New Little Plot Books order request" : "New message from the shop contact page", lines: ["Read it in the owner dashboard under Messages."], footer: "Owner notification." });
  }
  return json({ ok: true });
});
