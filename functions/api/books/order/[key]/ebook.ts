/** GET /api/books/order/<key>/ebook: the finished ebook, once the owner has delivered it. */
import { HttpError, bucket, checkOrderKey, handle, type Ctx } from "../../../../_lib/books/core";
import { getOrder } from "../../../../_lib/books/shop";

export const onRequestGet = handle(async (c: Ctx<"key">) => {
  const o = await getOrder(c.env, await checkOrderKey(c.env, c.params.key));
  if (o.status !== "delivered" || !o.ebook_key) throw new HttpError(404, "Your ebook isn't ready yet. We'll email you as soon as it is.");
  const obj = await bucket(c.env).get(o.ebook_key);
  if (!obj) throw new HttpError(404, "We couldn't find the file. Please contact us.");
  return new Response(await obj.arrayBuffer(), {
    headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="little-plot-books-${o.id}.pdf"`, "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex" },
  });
});
