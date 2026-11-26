import { availablePrintFormats, extraCount, PRINT_FORMAT_IDS, quote, validateBrief } from "../../../../shared/books/catalog";
import { HttpError, handle, json, sameOrigin, type Ctx } from "../../../_lib/books/core";
import { currentDraft, draftBrief, loadSettings } from "../../../_lib/books/shop";
import { describeBook, notifyBookRequest, requestInsert } from "../../../_lib/books/requests";

export const onRequestPost = handle(async (c: Ctx) => {
  sameOrigin(c);
  const draft = await currentDraft(c);
  if (!draft) throw new HttpError(400, "Start your book before sending a request.");
  const brief = await draftBrief(c.env, draft);
  const settings = await loadSettings(c.env);
  const formats = availablePrintFormats(settings);
  const errors = validateBrief(brief, undefined, formats.length ? formats : [...PRINT_FORMAT_IDS]);
  if (Object.keys(errors).length) throw new HttpError(400, "A few details are missing.", { errors });

  const price = brief.format && formats.some((format) => format === brief.format)
    ? quote(settings, brief.format, extraCount(brief))
    : undefined;
  const result = await requestInsert(c, brief.contact.name, brief.contact.email!, `draft:${draft.id}`, `Personalised book request\n${describeBook(brief, price)}`);
  if (result.meta?.changes) notifyBookRequest(c);
  return json({ ok: true });
});
