/** GET /api/books/dev/outbox: emails kept instead of sent. Test mode only. */
import { HttpError, handle, json, ready, testMode, type Ctx } from "../../../_lib/books/core";

export const onRequestGet = handle(async (c: Ctx) => {
  if (!testMode(c.env)) throw new HttpError(404, "Not found");
  const d = await ready(c.env);
  const { results } = await d.prepare("SELECT id, order_id, kind, to_addr, subject, html, status, created_at FROM lpb_outbox ORDER BY id DESC LIMIT 60").all();
  return json({ emails: results });
});
