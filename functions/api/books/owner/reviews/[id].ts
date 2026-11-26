/** POST /api/books/owner/reviews/<id> { action: approve | reject | spam | pending }. Publishing also needs the customer's permission. */
import { HttpError, handle, json, now, ready, readJson, sameOrigin, type Ctx } from "../../../../_lib/books/core";
import { requireOwner } from "../../../../_lib/books/shop";

const MAP: Record<string, string> = { approve: "approved", reject: "rejected", spam: "spam", pending: "pending" };

export const onRequestPost = handle(async (c: Ctx<"id">) => {
  sameOrigin(c);
  await requireOwner(c);
  const { action } = await readJson<{ action?: string }>(c.request);
  const status = MAP[String(action)];
  if (!status) throw new HttpError(400, "Unknown action.");
  const d = await ready(c.env);
  await d.prepare("UPDATE lpb_reviews SET status = ?, moderated_at = ? WHERE id = ?").bind(status, now(), Number(c.params.id)).run();
  return json({ ok: true });
});
