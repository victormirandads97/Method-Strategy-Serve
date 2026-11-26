import { handle, json, type Ctx } from "../../../_lib/books/core";
import { requireOwner } from "../../../_lib/books/shop";

export const onRequestGet = handle(async (c: Ctx) => {
  await requireOwner(c);
  return json({ ok: true, email: c.env.BOOKS_OWNER_EMAIL });
});
