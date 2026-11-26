/** /api/books/owner/settings: prices, formats, campaign, Christmas treatment, retention. Owner only. */
import { validateSettings } from "../../../../shared/books/catalog";
import { HttpError, handle, json, readJson, sameOrigin, type Ctx } from "../../../_lib/books/core";
import { loadSettings, requireOwner, saveSettings } from "../../../_lib/books/shop";

export const onRequestGet = handle(async (c: Ctx) => {
  await requireOwner(c);
  return json({ settings: await loadSettings(c.env) });
});

export const onRequestPut = handle(async (c: Ctx) => {
  sameOrigin(c);
  await requireOwner(c);
  const b = await readJson<{ settings?: unknown }>(c.request);
  let s;
  try { s = validateSettings(b.settings); } catch (e) { throw new HttpError(400, e instanceof Error ? e.message : "Invalid settings."); }
  await saveSettings(c.env, s);
  return json({ ok: true, settings: s });
});
