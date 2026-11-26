/** GET /api/books/settings: prices, formats, sale, Christmas treatment, and the approved review summary. */
import { publicSettings } from "../../../shared/books/catalog";
import { handle, json, ready, testMode, type Ctx } from "../../_lib/books/core";
import { loadSettings } from "../../_lib/books/shop";
import { availableMethods } from "../../_lib/books/payments";

export const onRequestGet = handle(async (c: Ctx) => {
  const s = await loadSettings(c.env);
  const d = await ready(c.env);
  const r = await d.prepare("SELECT COUNT(*) AS n, AVG(rating) AS avg FROM lpb_reviews AS r WHERE r.status = 'approved' AND r.publish_ok = 1 AND ((r.order_id IS NULL AND r.verified = 0) OR EXISTS (SELECT 1 FROM lpb_orders AS o WHERE o.id = r.order_id AND o.mode = 'live'))").first<{ n: number; avg: number | null }>();
  const settings = publicSettings(s);
  const methods = c.env.BOOKS_BUCKET && settings.formats.length ? await availableMethods(c.env) : [];
  return json({
    ...settings,
    reviews: r && r.n > 0 ? { count: r.n, average: Math.round((r.avg ?? 0) * 10) / 10 } : null,
    methods,
    photoUploads: !!c.env.BOOKS_BUCKET && methods.length > 0,
    testMode: testMode(c.env),
  });
});
