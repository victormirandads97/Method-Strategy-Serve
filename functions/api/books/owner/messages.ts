/** /api/books/owner/messages: contact-page messages. */
import { handle, json, ready, readJson, sameOrigin, type Ctx } from "../../../_lib/books/core";
import { requireOwner } from "../../../_lib/books/shop";

export const onRequestGet = handle(async (c: Ctx) => {
  await requireOwner(c);
  const d = await ready(c.env);
  const { results } = await d.prepare("SELECT * FROM lpb_messages ORDER BY handled, id DESC LIMIT 200").all();
  return json({ messages: results });
});
export const onRequestPost = handle(async (c: Ctx) => {
  sameOrigin(c);
  await requireOwner(c);
  const { id } = await readJson<{ id?: number }>(c.request);
  const d = await ready(c.env);
  await d.prepare("UPDATE lpb_messages SET handled = 1 WHERE id = ?").bind(Number(id)).run();
  return json({ ok: true });
});
