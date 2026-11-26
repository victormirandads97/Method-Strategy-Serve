import { HttpError, bucket, changes, handle, json, now, ready, sameOrigin, type Ctx } from "../../../../../_lib/books/core";
import { getProof, proofFile, sendProofLink } from "../../../../../_lib/books/proofs";
import { getOrder, requireOwner } from "../../../../../_lib/books/shop";

export const onRequestGet = handle(async (c: Ctx<"id">) => {
  await requireOwner(c);
  const order = await getOrder(c.env, c.params.id);
  const proof = await getProof(c.env, order.id);
  if (!proof) throw new HttpError(404, "There is no proof for this order.");
  return proofFile(c.env, order.id, proof.file_key, false);
});

export const onRequestPut = handle(async (c: Ctx<"id">) => {
  sameOrigin(c);
  await requireOwner(c);
  const order = await getOrder(c.env, c.params.id);
  if (!order.paid_at || order.format === "ebook" || ["cancelled", "delivered"].includes(order.status)) {
    throw new HttpError(409, "Print proofs are only available for active, paid print orders.");
  }
  const previous = await getProof(c.env, order.id);
  if (previous?.state === "approved") throw new HttpError(409, "The customer has already approved this proof.");

  const limit = 80 * 1024 * 1024;
  if (Number(c.request.headers.get("Content-Length")) > limit) throw new HttpError(413, "The PDF is over 80 MB.");
  const bytes = await c.request.arrayBuffer();
  if (bytes.byteLength > limit) throw new HttpError(413, "The PDF is over 80 MB.");
  if (new TextDecoder().decode(bytes.slice(0, 5)) !== "%PDF-") throw new HttpError(415, "Please upload a PDF.");

  const version = crypto.randomUUID();
  const fileKey = `proofs/${order.id}/${version}.pdf`;
  const storage = bucket(c.env);
  await storage.put(fileKey, bytes, { httpMetadata: { contentType: "application/pdf" } });
  const d = await ready(c.env);
  const saved = await d.prepare(`
    INSERT INTO lpb_book_proofs (order_id, version, file_key, state, message, updated_at)
      SELECT id, ?, ?, 'awaiting_approval', NULL, ? FROM lpb_orders
      WHERE id = ? AND paid_at IS NOT NULL AND status NOT IN ('cancelled', 'delivered') AND delivered_at IS NULL
      AND COALESCE((SELECT version FROM lpb_book_proofs WHERE order_id = ?), '') = ?
    ON CONFLICT(order_id) DO UPDATE SET version = excluded.version, file_key = excluded.file_key,
      state = excluded.state, message = NULL, updated_at = excluded.updated_at
    WHERE lpb_book_proofs.state = ? AND lpb_book_proofs.state <> 'approved'`)
    .bind(version, fileKey, now(), order.id, order.id, previous?.version ?? "", previous?.state ?? "").run();
  if (!changes(saved)) {
    await storage.delete(fileKey);
    throw new HttpError(409, "The order or proof changed. Refresh the order and try again.");
  }
  if (previous) c.waitUntil(storage.delete(previous.file_key));
  return json({ ok: true, email: await sendProofLink(c.env, order, c.request) });
});
