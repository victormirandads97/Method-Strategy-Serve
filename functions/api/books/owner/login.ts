/** POST /api/books/owner/login { email, password } → owner session cookie (12 h, HttpOnly, SameSite=Strict). */
import { handle, json, readJson, sameOrigin, type Ctx } from "../../../_lib/books/core";
import { ownerLogin } from "../../../_lib/books/shop";

export const onRequestPost = handle(async (c: Ctx) => {
  sameOrigin(c);
  const b = await readJson<{ email?: string; password?: string }>(c.request);
  const set = await ownerLogin(c, String(b.email || ""), String(b.password || ""));
  return json({ ok: true }, 200, { "Set-Cookie": set });
});
