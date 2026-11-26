/** GET /api/books/owner/reviews: the moderation queue. */
import { handle, json, ready, type Ctx } from "../../../_lib/books/core";
import { requireOwner } from "../../../_lib/books/shop";

export const onRequestGet = handle(async (c: Ctx) => {
  await requireOwner(c);
  const d = await ready(c.env);
  const { results } = await d.prepare("SELECT * FROM lpb_reviews ORDER BY CASE status WHEN 'pending' THEN 0 ELSE 1 END, created_at DESC LIMIT 200").all();
  return json({ reviews: results });
});
