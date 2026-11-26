import { euro, ROLES, storyInfo, styleInfo, type Brief, type Quote } from "../../../shared/books/catalog";
import { now, ready, type Ctx } from "./core";
import { sendMail } from "./email";

export function describeBook(brief: Brief, price?: Quote): string {
  const lines = [brief.format === "hardback" ? "Hardcover" : "Softcover",
    brief.route === "custom" ? "Original story" : storyInfo(brief.story)?.sampleTitle ?? "",
    styleInfo(brief.style)?.name ?? ""];
  const add = (label: string, value?: string) => { if (value) lines.push(`${label}: ${value}`); };
  if (price) {
    add("Book", euro(price.bookCents));
    if (price.extraCharacters) add("Extra characters", euro(price.extrasCents));
    add("Ireland shipping", price.shippingCents ? euro(price.shippingCents) : "Included");
    add("Total shown at submission", euro(price.totalCents));
  }
  if (brief.route === "custom") {
    add("Story idea", brief.custom?.happen);
    add("Setting", brief.custom?.where);
    add("Tone", brief.custom?.tone);
    add("Would love to include", brief.custom?.include);
    add("That’s me moment", brief.custom?.thatsMe);
  }
  brief.characters.forEach((character, index) => {
    lines.push("", `${index === 0 ? "Lead" : "Extra character"}: ${character.name} · ${ROLES.find((role) => role.id === character.role)?.label}`);
    add("Age range", character.ageRange);
    add("About them", character.description);
    add("Appearance", character.appearance);
    add("Species", character.species);
    add("Markings", character.markings);
    add("Personality", character.personality);
  });
  lines.push("");
  add("Favourite phrases", brief.touches.phrases);
  add("Things they love", brief.touches.interests);
  add("Places", brief.touches.places);
  add("Must include", brief.touches.mustInclude);
  add("Leave out", brief.touches.leaveOut);
  add("Dedication", brief.touches.dedication);
  return lines.join("\n");
}

export function notifyBookRequest(c: Ctx) {
  if (c.env.BOOKS_OWNER_NOTIFY_EMAIL) {
    c.waitUntil(sendMail(c.env, {
      to: c.env.BOOKS_OWNER_NOTIFY_EMAIL,
      kind: "book_request",
      subject: "New personalised book request",
      lines: ["Open Messages in the Little Plot Books owner dashboard to review the request."],
    }).catch(() => undefined));
  }
}

export function requestInsert(c: Ctx, name: string | undefined, email: string, ref: string, body: string) {
  return ready(c.env).then((d) => d.prepare(`INSERT INTO lpb_messages (name, email, order_ref, body, created_at)
    SELECT ?, ?, ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM lpb_messages WHERE order_ref = ?)`)
    .bind(name ?? null, email, ref, body, now(), ref).run());
}
