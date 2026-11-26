import { clean } from "../../../../../shared/books/catalog";
import { HttpError, changes, checkOrderKey, handle, json, now, readJson, ready, sameOrigin, type Ctx } from "../../../../_lib/books/core";
import { getProof, proofFile } from "../../../../_lib/books/proofs";
import { notifyOperator } from "../../../../_lib/books/email";
import { getOrder } from "../../../../_lib/books/shop";

export const onRequestGet = handle(async (c: Ctx<"key">) => {
  const order = await getOrder(c.env, await checkOrderKey(c.env, c.params.key));
  if (!order.paid_at || order.status === "cancelled") throw new HttpError(404, "Your proof isn't available.");
  const proof = await getProof(c.env, order.id);
  const url = new URL(c.request.url);
  if (!proof || url.searchParams.get("version") !== proof.version) {
    throw new HttpError(404, "Open your order page to see the latest proof.");
  }
  return proofFile(c.env, order.id, proof.file_key, url.searchParams.get("download") === "1");
});

export const onRequestPost = handle(async (c: Ctx<"key">) => {
  sameOrigin(c);
  const id = await checkOrderKey(c.env, c.params.key);
  const data = await readJson<{ action?: string; version?: string; message?: string }>(c.request);
  if (data.action !== "approve" && data.action !== "changes") throw new HttpError(400, "Choose to approve the book or request changes.");
  const approved = data.action === "approve";
  const message = approved ? null : clean(data.message, 1000, true);
  if (!approved && (!message || message.length < 4)) throw new HttpError(400, "Tell us what to change before we print your book.");
  const d = await ready(c.env);
  const result = await d.prepare(`UPDATE lpb_book_proofs SET state = ?, message = ?, updated_at = ?
    WHERE order_id = ? AND version = ? AND state = 'awaiting_approval'
    AND EXISTS (SELECT 1 FROM lpb_orders WHERE id = ? AND paid_at IS NOT NULL AND status NOT IN ('cancelled', 'delivered'))`)
    .bind(approved ? "approved" : "changes_requested", message, now(), id, data.version ?? "", id).run();
  if (!changes(result)) throw new HttpError(409, "This proof has changed or already has a response. Refresh your order to see the latest version.");
  c.waitUntil(notifyOperator(c.env, `${approved ? "Print proof approved" : "Changes requested"} (${id})`, ["Open the order in the Little Plot Books dashboard."], id));
  return json({ ok: true });
});
