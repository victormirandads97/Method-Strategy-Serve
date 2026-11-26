/** PUT /api/books/owner/orders/<id>/ebook: upload the finished ebook (PDF, up to 80 MB). Sets Ready to deliver. */
import { HttpError, bucket, handle, json, now, ready, sameOrigin, type Ctx } from "../../../../../_lib/books/core";
import { addNote, getOrder, requireOwner } from "../../../../../_lib/books/shop";

export const onRequestPut = handle(async (c: Ctx<"id">) => {
  sameOrigin(c);
  await requireOwner(c);
  const o = await getOrder(c.env, c.params.id);
  if (o.format !== "ebook") throw new HttpError(409, "Use the print proof workflow for this order.");
  if (!o.paid_at) throw new HttpError(409, "This order hasn't been paid.");
  const bytes = new Uint8Array(await c.request.arrayBuffer());
  if (bytes.length > 80 * 1024 * 1024) throw new HttpError(413, "That file is over 80 MB.");
  if (String.fromCharCode(...bytes.slice(0, 5)) !== "%PDF-") throw new HttpError(415, "Please upload a PDF.");
  const key = `ebooks/${o.id}/${crypto.randomUUID()}.pdf`;
  await bucket(c.env).put(key, bytes, { httpMetadata: { contentType: "application/pdf" } });
  if (o.ebook_key) await bucket(c.env).delete(o.ebook_key);
  const d = await ready(c.env);
  await d.prepare(`UPDATE lpb_orders SET ebook_key = ?, ebook_uploaded_at = ?, status = CASE WHEN status = 'delivered' THEN 'delivered' ELSE 'ready' END, updated_at = ? WHERE id = ?`).bind(key, now(), now(), o.id).run();
  await addNote(c.env, o.id, `Ebook uploaded (${Math.round(bytes.length / 1024)} KB).`);
  return json({ ok: true });
});
