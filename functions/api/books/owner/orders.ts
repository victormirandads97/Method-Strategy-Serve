/** GET /api/books/owner/orders?q=&status=&mode=: search and filter orders. Owner only. */
import { handle, json, ready, type Ctx } from "../../../_lib/books/core";
import { requireOwner, sweep } from "../../../_lib/books/shop";

export const onRequestGet = handle(async (c: Ctx) => {
  await requireOwner(c);
  c.waitUntil(sweep(c.env).catch(() => undefined));
  const u = new URL(c.request.url);
  const q = (u.searchParams.get("q") || "").trim().slice(0, 80);
  const status = u.searchParams.get("status") || "";
  const mode = u.searchParams.get("mode") || "";
  const where: string[] = [];
  const args: unknown[] = [];
  if (status === "open") where.push("status IN ('paid','awaiting_details','in_production','ready')");
  else if (status) { where.push("status = ?"); args.push(status); }
  if (mode) { where.push("mode = ?"); args.push(mode); }
  if (q) { where.push("(id LIKE ? OR email LIKE ? OR brief LIKE ?)"); args.push(`%${q}%`, `%${q.toLowerCase()}%`, `%${q}%`); }
  const d = await ready(c.env);
  const { results } = await d
    .prepare(`SELECT id, status, mode, route, story, style, format, total_cents, email, created_at, paid_at, json_extract(brief, '$.characters[0].name') AS lead,
              (SELECT COUNT(*) FROM lpb_uploads WHERE order_id = lpb_orders.id AND deleted_at IS NULL) AS photos
              FROM lpb_orders ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY COALESCE(paid_at, created_at) DESC LIMIT 200`)
    .bind(...args).all();
  const counts = await d.prepare("SELECT status, COUNT(*) AS n FROM lpb_orders GROUP BY status").all<{ status: string; n: number }>();
  return json({ orders: results, counts: Object.fromEntries(counts.results.map((r) => [r.status, r.n])) });
});
