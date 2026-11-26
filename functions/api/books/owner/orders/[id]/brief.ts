/** GET /api/books/owner/orders/<id>/brief: a tidy production brief (text) for the writer or illustrator. No photos inside. */
import { ROLES, STATUS_LABEL, euro, storyInfo, styleInfo, type Brief, type Quote } from "../../../../../../shared/books/catalog";
import { handle, type Ctx } from "../../../../../_lib/books/core";
import { getOrder, orderTitle, orderUploads, requireOwner } from "../../../../../_lib/books/shop";

export const onRequestGet = handle(async (c: Ctx<"id">) => {
  await requireOwner(c);
  const o = await getOrder(c.env, c.params.id);
  const b = JSON.parse(o.brief) as Brief;
  const q = JSON.parse(o.quote) as Quote;
  const ups = await orderUploads(c.env, o.id);
  const L: string[] = [];
  const add = (k: string, v?: string | null) => { if (v) L.push(`${k}: ${v}`); };
  L.push(`PRODUCTION BRIEF · ${o.id}`, `${orderTitle(o, b)}`, "");
  add("Status", STATUS_LABEL[o.status]);
  add("Format", o.format);
  add("Art style", styleInfo(b.style)?.name);
  add("Route", b.route === "preset" ? `Preset story: ${storyInfo(b.story)?.sampleTitle.replace(/^\S+/, b.characters[0]?.name ?? "")}` : "Original story from the customer's idea");
  if (b.route === "custom" && b.custom) {
    L.push("", "THE IDEA");
    add("What happens", b.custom.happen); add("Where", b.custom.where); add("Tone", b.custom.tone);
    add("Would love to see", b.custom.include); add("“That's me!” moment", b.custom.thatsMe);
  }
  L.push("", "CHARACTERS");
  b.characters.forEach((ch, i) => {
    const role = ROLES.find((r) => r.id === ch.role)?.label;
    L.push(`${i === 0 ? "Lead" : `Character ${i + 1}`}: ${ch.name ?? "(no name)"} (${role}${ch.ageRange ? `, age ${ch.ageRange}` : ""})`);
    if (ch.species) L.push(`  Species: ${ch.species}`);
    if (ch.markings) L.push(`  Markings: ${ch.markings}`);
    if (ch.description) L.push(`  About them: ${ch.description}`);
    if (ch.appearance) L.push(`  Looks like: ${ch.appearance}`);
    if (ch.personality) L.push(`  Personality: ${ch.personality}`);
    const n = ups.filter((u) => u.character_id === ch.id).length;
    L.push(`  Reference photo: ${n ? `${n} (download from the dashboard)` : "none, use the description"}`);
  });
  L.push("", "PERSONAL TOUCHES (use exactly as written)");
  add("Favourite phrases", b.touches.phrases); add("Interests", b.touches.interests); add("Meaningful places", b.touches.places);
  add("Must include", b.touches.mustInclude); add("Leave out", b.touches.leaveOut);
  L.push("", "DEDICATION", b.touches.dedication ?? "(none: write a short one)");
  L.push("", `Paid: ${euro(o.total_cents)} (book ${euro(q.bookCents)}${q.extraCharacters ? `, ${q.extraCharacters} extra character(s)` : ""}${q.shippingCents ? `, shipping ${euro(q.shippingCents)}` : ""})`);
  return new Response(L.join("\n") + "\n", {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Content-Disposition": `attachment; filename="${o.id}-brief.txt"`, "Cache-Control": "no-store" },
  });
});
