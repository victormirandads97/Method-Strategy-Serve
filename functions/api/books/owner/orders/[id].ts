/**
 * /api/books/owner/orders/<id>: everything needed to make and deliver one order.
 *   GET  → order, brief, quote, payment, shipping, photos by character (5-minute signed links), notes, review
 *   POST { action } → status | note | request_details | ship | deliver_ebook | delete_photos
 */
import { OWNER_STATUSES, STATUS_LABEL, clean, storyInfo, styleInfo, type Brief, type OrderStatus } from "../../../../../shared/books/catalog";
import { HttpError, changes, handle, json, now, orderUrl, ready, readJson, sameOrigin, type Ctx } from "../../../../_lib/books/core";
import { addNote, deleteOrderPhotos, getOrder, orderTitle, orderUploads, requireOwner, signedFileUrl } from "../../../../_lib/books/shop";
import { getProof, proofDetails, sendProofLink } from "../../../../_lib/books/proofs";
import { sendMail } from "../../../../_lib/books/email";

export const onRequestGet = handle(async (c: Ctx<"id">) => {
  await requireOwner(c);
  const o = await getOrder(c.env, c.params.id);
  const b = JSON.parse(o.brief) as Brief;
  const d = await ready(c.env);
  const ups = await orderUploads(c.env, o.id);
  const photos: Record<string, { id: string; type: string; size: number; url: string }[]> = {};
  for (const u of ups) (photos[u.character_id] ??= []).push({ id: u.id, type: u.type, size: u.size, url: await signedFileUrl(c.env, u.id) });
  const notes = await d.prepare("SELECT body, created_at FROM lpb_notes WHERE order_id = ? ORDER BY id DESC").bind(o.id).all();
  const events = await d.prepare("SELECT type, received_at FROM lpb_events WHERE order_id = ? ORDER BY received_at").bind(o.id).all();
  const emails = await d.prepare("SELECT kind, subject, status, created_at FROM lpb_outbox WHERE order_id = ? ORDER BY id").bind(o.id).all();
  const review = await d.prepare("SELECT id, rating, status FROM lpb_reviews WHERE order_id = ?").bind(o.id).first();
  return json({
    order: { ...o, brief: undefined, quote: JSON.parse(o.quote), shipping: o.shipping ? JSON.parse(o.shipping) : null, statusLabel: STATUS_LABEL[o.status] },
    title: orderTitle(o, b),
    story: b.story ? storyInfo(b.story)?.sampleTitle.replace(/^\S+/, "{name}") : null,
    styleName: styleInfo(b.style)?.name,
    brief: b,
    photos,
    notes: notes.results,
    events: events.results,
    emails: emails.results,
    review,
    proof: proofDetails(await getProof(c.env, o.id)),
    customerLink: await orderUrl(c.env, o.id, c.request),
  });
});

export const onRequestPost = handle(async (c: Ctx<"id">) => {
  sameOrigin(c);
  await requireOwner(c);
  const o = await getOrder(c.env, c.params.id);
  const b = await readJson<Record<string, unknown>>(c.request);
  const d = await ready(c.env);
  const setStatus = async (s: OrderStatus, extra = "") =>
    d.prepare(`UPDATE lpb_orders SET status = ?, updated_at = ?${extra} WHERE id = ?`).bind(s, now(), o.id).run();
  const link = await orderUrl(c.env, o.id, c.request);
  switch (b.action) {
    case "status": {
      const s = b.status as OrderStatus;
      if (!OWNER_STATUSES.includes(s)) throw new HttpError(400, "Unknown status.");
      if (s !== "cancelled" && !o.paid_at) throw new HttpError(409, "This order hasn't been paid. Only Cancelled is possible.");
      if (s === "delivered") throw new HttpError(400, "Use Deliver ebook or Record shipping, so the customer gets their email.");
      await setStatus(s);
      await addNote(c.env, o.id, `Status set to ${STATUS_LABEL[s]}.`);
      return json({ ok: true });
    }
    case "note": {
      const body = clean(b.body, 2000, true);
      if (!body) throw new HttpError(400, "Write a note.");
      await addNote(c.env, o.id, body);
      return json({ ok: true });
    }
    case "request_details": {
      const msg = clean(b.message, 1500, true);
      if (!msg) throw new HttpError(400, "Write what you need from the customer.");
      await setStatus("awaiting_details");
      await addNote(c.env, o.id, `Asked the customer: ${msg}`);
      await sendMail(c.env, { to: o.email, kind: "request_details", orderId: o.id, subject: `A quick question about order ${o.id}`, lines: [msg, "Just reply to this email with your answer."], button: { label: "View your order", url: link } });
      return json({ ok: true });
    }
    case "resend_proof": {
      const proof = await getProof(c.env, o.id);
      if (proof?.state !== "awaiting_approval" || !o.paid_at || ["cancelled", "delivered"].includes(o.status)) {
        throw new HttpError(409, "There is no proof awaiting approval.");
      }
      const email = await sendProofLink(c.env, o, c.request);
      if (email === "failed") throw new HttpError(503, "The proof is saved, but the email could not be sent. Try again or copy the private customer link.");
      return json({ ok: true });
    }
    case "ship": {
      if (o.format === "ebook") throw new HttpError(400, "This is an ebook order. Upload the ebook instead.");
      const carrier = clean(b.carrier, 60), tracking = clean(b.tracking, 80);
      if (!carrier || !tracking) throw new HttpError(400, "Add the carrier and tracking number.");
      const shipped = await d.prepare(`UPDATE lpb_orders SET carrier = ?, tracking = ?, status = 'delivered', delivered_at = ?, updated_at = ?
        WHERE id = ? AND paid_at IS NOT NULL AND status NOT IN ('cancelled', 'delivered')
        AND delivered_at IS NULL AND EXISTS (SELECT 1 FROM lpb_book_proofs WHERE order_id = ? AND state = 'approved')`)
        .bind(carrier, tracking, now(), now(), o.id, o.id).run();
      if (!changes(shipped)) throw new HttpError(409, "Only an active order with a customer-approved proof can be marked as shipped.");
      await sendMail(c.env, { to: o.email, kind: "shipped", orderId: o.id, subject: `Your book is on its way (order ${o.id})`, lines: [`It's posted! ${carrier} tracking number: ${tracking}.`, "You can download your included PDF from your order page.", "Once your book arrives and you’ve read it together, you can leave a review from the same page."], button: { label: "View your order", url: link } });
      return json({ ok: true });
    }
    case "deliver_ebook": {
      if (o.format !== "ebook") throw new HttpError(409, "Use the print proof workflow for this order.");
      if (!o.ebook_key) throw new HttpError(409, "Upload the finished ebook first.");
      await d.prepare("UPDATE lpb_orders SET status = 'delivered', delivered_at = COALESCE(delivered_at, ?), updated_at = ? WHERE id = ?").bind(now(), now(), o.id).run();
      await sendMail(c.env, { to: o.email, kind: "ebook_delivered", orderId: o.id, subject: `Your book is ready (order ${o.id})`, lines: ["Your personalised ebook is ready to download from your private order page.", "Once you've read it together, we'd love to hear what you think. There's a review link on the same page."], button: { label: "Download your ebook", url: link } });
      return json({ ok: true });
    }
    case "delete_photos":
      await deleteOrderPhotos(c.env, o.id);
      await addNote(c.env, o.id, "Reference photos deleted.");
      return json({ ok: true });
    default:
      throw new HttpError(400, "Unknown action.");
  }
});
