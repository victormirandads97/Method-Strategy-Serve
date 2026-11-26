/**
 * /api/books/draft/photo?character=<id>: one reference photo per character.
 * POST takes the raw image. Type is checked from the bytes; EXIF/XMP/IPTC
 * (including location) is stripped before storage. Only this draft's browser
 * can view it; after payment only the signed-in owner can.
 */
import { LIMITS } from "../../../../shared/books/catalog";
import { HttpError, bucket, handle, json, now, ready, sameOrigin, type Ctx } from "../../../_lib/books/core";
import { cleanPhoto } from "../../../_lib/books/photo";
import { currentDraft, deleteUpload, draftUploads, ensureDraft } from "../../../_lib/books/shop";

const charId = (c: Ctx) => {
  const id = new URL(c.request.url).searchParams.get("character") || "";
  if (!/^[a-z0-9-]{3,40}$/.test(id)) throw new HttpError(400, "Which character is this photo for?");
  return id;
};

export const onRequestPost = handle(async (c: Ctx) => {
  sameOrigin(c);
  const character = charId(c);
  if (Number(c.request.headers.get("Content-Length") || 0) > LIMITS.photoBytes) throw new HttpError(413, "That photo is over 12 MB. Could you try a smaller one?");
  const { type, bytes } = cleanPhoto(new Uint8Array(await c.request.arrayBuffer()));
  const { row, setCookie } = await ensureDraft(c);
  const id = crypto.randomUUID();
  const key = `uploads/${row.id}/${id}`;
  await bucket(c.env).put(key, bytes, { httpMetadata: { contentType: type } });
  const d = await ready(c.env);
  // Replace: older photos for this character that no paid order uses are deleted.
  for (const u of await draftUploads(c.env, row.id)) if (u.character_id === character && !u.order_id) await deleteUpload(c.env, u);
  await d.prepare("INSERT INTO lpb_uploads (id, draft_id, character_id, r2_key, type, size, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .bind(id, row.id, character, key, type, bytes.length, now()).run();
  return json({ ok: true, photo: { id, type, size: bytes.length } }, 200, setCookie ? { "Set-Cookie": setCookie } : {});
});

export const onRequestGet = handle(async (c: Ctx) => {
  const character = charId(c);
  const row = await currentDraft(c);
  const u = row ? [...(await draftUploads(c.env, row.id))].reverse().find((x) => x.character_id === character) : null;
  const obj = u ? await bucket(c.env).get(u.r2_key) : null;
  if (!u || !obj) return new Response("Not found", { status: 404 });
  return new Response(await obj.arrayBuffer(), { headers: { "Content-Type": u.type, "Cache-Control": "private, no-store" } });
});

export const onRequestDelete = handle(async (c: Ctx) => {
  sameOrigin(c);
  const character = charId(c);
  const row = await currentDraft(c);
  if (row) {
    const d = await ready(c.env);
    for (const u of await draftUploads(c.env, row.id)) {
      if (u.character_id !== character) continue;
      if (u.order_id) await d.prepare("UPDATE lpb_uploads SET draft_id = NULL WHERE id = ?").bind(u.id).run();
      else await deleteUpload(c.env, u);
    }
  }
  return json({ ok: true });
});
