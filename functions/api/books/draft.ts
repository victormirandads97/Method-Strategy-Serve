/**
 * /api/books/draft: the builder's private, expiring draft (HttpOnly cookie, D1).
 *   GET → { brief, order }   PUT { brief, step? } → save   DELETE → start again
 */
import { sanitiseBrief, validateBrief, availablePrintFormats, PRINT_FORMAT_IDS } from "../../../shared/books/catalog";
import { cookie, handle, json, now, orderUrl, ready, readJson, sameOrigin, type Ctx } from "../../_lib/books/core";
import { DRAFT_COOKIE, currentDraft, deleteUpload, draftBrief, draftUploads, ensureDraft, loadSettings, sweep } from "../../_lib/books/shop";

export const onRequestGet = handle(async (c: Ctx) => {
  c.waitUntil(sweep(c.env).catch(() => undefined));
  const row = await currentDraft(c);
  if (!row) return json({ brief: null, order: null });
  const d = await ready(c.env);
  const o = await d.prepare("SELECT id, status FROM lpb_orders WHERE draft_id = ? ORDER BY created_at DESC LIMIT 1").bind(row.id).first<{ id: string; status: string }>();
  return json({ brief: await draftBrief(c.env, row), order: o ? { id: o.id, status: o.status, url: await orderUrl(c.env, o.id, c.request) } : null });
});

export const onRequestPut = handle(async (c: Ctx) => {
  sameOrigin(c);
  const body = await readJson<{ brief?: unknown; step?: number }>(c.request);
  const { row, setCookie } = await ensureDraft(c);
  const brief = sanitiseBrief(body.brief);
  const d = await ready(c.env);
  await d.prepare("UPDATE lpb_drafts SET brief = ?, updated_at = ? WHERE id = ?").bind(JSON.stringify(brief), now(), row.id).run();
  // Photos of characters that were removed go too.
  const ids = new Set(brief.characters.map((x) => x.id));
  for (const u of await draftUploads(c.env, row.id)) if (!ids.has(u.character_id) && !u.order_id) await deleteUpload(c.env, u);
  const full = await draftBrief(c.env, { ...row, brief: JSON.stringify(brief) });
  const s = await loadSettings(c.env);
  const live = availablePrintFormats(s);
  const enabled = live.length ? live : [...PRINT_FORMAT_IDS];
  const errors = typeof body.step === "number" ? validateBrief(full, body.step, enabled) : {};
  return json({ ok: true, brief: full, errors }, 200, setCookie ? { "Set-Cookie": setCookie } : {});
});

export const onRequestDelete = handle(async (c: Ctx) => {
  sameOrigin(c);
  const row = await currentDraft(c);
  if (row) {
    for (const u of await draftUploads(c.env, row.id)) if (!u.order_id) await deleteUpload(c.env, u);
    const d = await ready(c.env);
    await d.prepare("DELETE FROM lpb_drafts WHERE id = ?").bind(row.id).run();
  }
  return json({ ok: true }, 200, { "Set-Cookie": cookie(c.request, DRAFT_COOKIE, "", 0, "/api/books") });
});
