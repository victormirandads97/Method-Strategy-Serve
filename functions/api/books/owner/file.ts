/** GET /api/books/owner/file?u=&exp=&sig=: one customer photo. Needs the owner session AND a 5-minute signature. */
import { HttpError, bucket, handle, ready, type Ctx } from "../../../_lib/books/core";
import { checkFileSig, requireOwner, type UploadRow } from "../../../_lib/books/shop";

export const onRequestGet = handle(async (c: Ctx) => {
  await requireOwner(c);
  const u = new URL(c.request.url);
  const id = u.searchParams.get("u") || "";
  await checkFileSig(c.env, id, u.searchParams.get("exp") || "", u.searchParams.get("sig") || "");
  const d = await ready(c.env);
  const row = await d.prepare("SELECT * FROM lpb_uploads WHERE id = ? AND deleted_at IS NULL").bind(id).first<UploadRow>();
  const obj = row ? await bucket(c.env).get(row.r2_key) : null;
  if (!row || !obj) throw new HttpError(404, "That photo has been deleted.");
  const ext = row.type.split("/")[1];
  const dl = u.searchParams.get("download") === "1";
  return new Response(await obj.arrayBuffer(), {
    headers: { "Content-Type": row.type, "Cache-Control": "private, no-store", "Content-Disposition": `${dl ? "attachment" : "inline"}; filename="${row.order_id ?? "photo"}-${row.character_id}.${ext}"` },
  });
});
