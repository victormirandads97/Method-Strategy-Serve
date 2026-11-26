/** GET /api/books/reviews: approved reviews with permission to publish. Critical ones included. */
import { handle, json, ready, type Ctx } from "../../_lib/books/core";

export const onRequestGet = handle(async (c: Ctx) => {
  const d = await ready(c.env);
  const { results } = await d.prepare("SELECT id, rating, body, display_name, verified, created_at FROM lpb_reviews AS r WHERE r.status = 'approved' AND r.publish_ok = 1 AND ((r.order_id IS NULL AND r.verified = 0) OR EXISTS (SELECT 1 FROM lpb_orders AS o WHERE o.id = r.order_id AND o.mode = 'live')) ORDER BY created_at DESC LIMIT 30").all();
  return json({ reviews: results.map((r) => ({ ...r, display_name: r.display_name || "A customer", verified: r.verified === 1 })) });
});
