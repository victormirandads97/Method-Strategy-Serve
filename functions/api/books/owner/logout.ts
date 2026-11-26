import { cookie, handle, json, type Ctx } from "../../../_lib/books/core";
import { OWNER_COOKIE } from "../../../_lib/books/shop";

export const onRequestPost = handle(async (c: Ctx) => json({ ok: true }, 200, { "Set-Cookie": cookie(c.request, OWNER_COOKIE, "", 0, "/api/books/owner", "Strict") }));
