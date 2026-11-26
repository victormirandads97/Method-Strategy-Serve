/** GET /api/books/paypal/return?key=&token=: capture on the server, check amount and reference, mark paid once. */
import { checkOrderKey, handle, now, orderUrl, ready, type Ctx } from "../../../_lib/books/core";
import { getOrder, markPaid } from "../../../_lib/books/shop";
import { capturePaypalOrder } from "../../../_lib/books/payments";

export const onRequestGet = handle(async (c: Ctx) => {
  const url = new URL(c.request.url);
  const id = await checkOrderKey(c.env, url.searchParams.get("key") ?? undefined);
  const o = await getOrder(c.env, id);
  const back = `${await orderUrl(c.env, id, c.request)}?from=checkout`;
  const token = url.searchParams.get("token") || "";
  if (o.provider !== "paypal" || o.provider_ref !== token) return Response.redirect(back, 303);
  const cap = await capturePaypalOrder(c.env, token, id);
  const unit = cap.purchase_units?.[0];
  const capture = unit?.payments?.captures?.[0];
  const ok = cap.status === "COMPLETED" && capture?.status === "COMPLETED" && (unit?.custom_id === id || capture?.custom_id === id) && capture.amount.currency_code === "EUR";
  if (!ok) {
    const d = await ready(c.env);
    await d.prepare("UPDATE lpb_orders SET status = 'payment_failed', updated_at = ? WHERE id = ? AND status = 'awaiting_payment'").bind(now(), id).run();
    return Response.redirect(back, 303);
  }
  await markPaid(c.env, id, {
    paymentRef: capture!.id,
    shipping: unit?.shipping ? { name: unit.shipping.name?.full_name ?? null, address: unit.shipping.address ?? null } : null,
    amountCents: Math.round(Number(capture!.amount.value) * 100),
    currency: capture!.amount.currency_code,
  }, c.request);
  return Response.redirect(back, 303);
});
