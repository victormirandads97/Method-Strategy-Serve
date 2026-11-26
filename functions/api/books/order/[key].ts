/** GET /api/books/order/<key>: the customer's private order page data. */
import { STATUS_LABEL, styleInfo, type Brief, type Quote, type OrderStatus } from "../../../../shared/books/catalog";
import { checkOrderKey, handle, json, ready, type Ctx } from "../../../_lib/books/core";
import { getProof, proofDetails } from "../../../_lib/books/proofs";
import { getOrder, loadSettings, orderTitle } from "../../../_lib/books/shop";

export const onRequestGet = handle(async (c: Ctx<"key">) => {
  const o = await getOrder(c.env, await checkOrderKey(c.env, c.params.key));
  const b = JSON.parse(o.brief) as Brief;
  const s = await loadSettings(c.env);
  const d = await ready(c.env);
  const review = await d.prepare("SELECT rating, status FROM lpb_reviews WHERE order_id = ?").bind(o.id).first<{ rating: number; status: string }>();
  const f = s.formats[o.format as keyof typeof s.formats];
  return json({
    id: o.id,
    status: o.status,
    statusLabel: STATUS_LABEL[o.status as OrderStatus],
    test: o.mode === "test",
    email: o.email,
    title: orderTitle(o, b),
    route: o.route,
    style: styleInfo(b.style)?.name,
    format: o.format,
    formatLabel: f?.label ?? o.format,
    turnaround: f?.turnaround ?? null,
    quote: JSON.parse(o.quote) as Quote,
    characters: b.characters.map((x) => ({ name: x.name, role: x.role, hasPhoto: !!x.photo })),
    dedication: b.touches.dedication ?? null,
    paidAt: o.paid_at,
    proof: o.paid_at && o.status !== "cancelled" ? proofDetails(await getProof(c.env, o.id)) : null,
    canPay: o.format !== "ebook" && (o.status === "awaiting_payment" || o.status === "payment_failed") && !o.paid_at,
    ebookReady: o.status === "delivered" && !!o.ebook_key,
    tracking: o.tracking ? { carrier: o.carrier, number: o.tracking } : null,
    canReview: o.status === "delivered" && !review,
    review: review ? { rating: review.rating, status: review.status } : null,
  });
});
