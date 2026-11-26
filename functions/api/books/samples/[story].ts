/** GET /api/books/samples/<story>.pdf: the downloadable sample ebook (fictional child). */
import { STORIES } from "../../../../shared/books/catalog";
import { sampleFor } from "../../../../shared/books/story";
import { HttpError, handle, type Ctx } from "../../../_lib/books/core";
import { renderSample } from "../../../_lib/books/pdf";

const cache = new Map<string, Uint8Array>();

export const onRequestGet = handle(async (c: Ctx<"story">) => {
  const id = (c.params.story || "").replace(/\.pdf$/, "");
  const story = STORIES.find((s) => s.id === id);
  if (!story) throw new HttpError(404, "No sample with that name.");
  let pdf = cache.get(id);
  if (!pdf) {
    const assets = c.env.ASSETS;
    if (!assets) throw new HttpError(503, "Sample illustrations are unavailable.");
    pdf = await renderSample(sampleFor(story.id), async (image) => {
      const res = await assets.fetch(new URL(image, c.request.url));
      if (!res.ok || !res.headers.get("content-type")?.startsWith("image/jpeg")) {
        throw new HttpError(503, "Sample illustrations are unavailable.");
      }
      return res.arrayBuffer();
    });
    cache.set(id, pdf);
  }
  const inline = new URL(c.request.url).searchParams.get("download") !== "1";
  return new Response(pdf.slice().buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${story.sampleTitle.replace(/[^\w]+/g, "-")}-sample.pdf"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
});
