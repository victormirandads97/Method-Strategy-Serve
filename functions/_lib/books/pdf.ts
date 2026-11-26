/** Render the same 20-page illustrated edition as the web reader, with selectable text. */
import { PDFDocument, PDFFont, PDFName, PDFPage, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { hexToRgb01, C } from "../../../shared/books/art";
import { coverUsesLightTitle } from "../../../shared/books/illustrations";
import { sampleEdition } from "../../../shared/books/sample-edition";
import type { SampleBook } from "../../../shared/books/story";
import { BRAND } from "../../../shared/books/catalog";
import serif from "../../_generated/fonts/young-serif-400-latin.bin";
import serifExt from "../../_generated/fonts/young-serif-400-latin-ext.bin";
import sans from "../../_generated/fonts/figtree-400-latin.bin";
import sansExt from "../../_generated/fonts/figtree-400-latin-ext.bin";
import sansBold from "../../_generated/fonts/figtree-600-latin.bin";
import sansBoldExt from "../../_generated/fonts/figtree-600-latin-ext.bin";

const SIZE = 576;
const M = 44;

interface Face { main: PDFFont; ext: PDFFont; a: Set<number>; b: Set<number> }
async function face(doc: PDFDocument, x: ArrayBuffer, y: ArrayBuffer): Promise<Face> {
  const main = await doc.embedFont(new Uint8Array(x), { subset: true });
  const ext = await doc.embedFont(new Uint8Array(y), { subset: true });
  return { main, ext, a: new Set(main.getCharacterSet()), b: new Set(ext.getCharacterSet()) };
}
function runs(f: Face, text: string) {
  const out: { font: PDFFont; text: string }[] = [];
  for (const ch of text) {
    const cp = ch.codePointAt(0)!;
    const font = f.a.has(cp) ? f.main : f.b.has(cp) ? f.ext : null;
    if (!font) continue;
    const last = out[out.length - 1];
    if (last && last.font === font) last.text += ch;
    else out.push({ font, text: ch });
  }
  return out;
}
const width = (f: Face, t: string, s: number) => runs(f, t).reduce((w, r) => w + r.font.widthOfTextAtSize(r.text, s), 0);
function draw(page: PDFPage, f: Face, t: string, x: number, y: number, s: number, colour = C.ink) {
  const [r, g, b] = hexToRgb01(colour);
  let cx = x;
  for (const run of runs(f, t)) {
    page.drawText(run.text, { x: cx, y, size: s, font: run.font, color: rgb(r, g, b) });
    cx += run.font.widthOfTextAtSize(run.text, s);
  }
}
function wrap(f: Face, text: string, s: number, maxW: number): string[] {
  const lines: string[] = [];
  for (const para of text.split("\n")) {
    let line = "";
    for (const w of para.split(/\s+/).filter(Boolean)) {
      const t = line ? `${line} ${w}` : w;
      if (width(f, t, s) <= maxW || !line) line = t;
      else { lines.push(line); line = w; }
    }
    lines.push(line);
  }
  return lines;
}
function fit(f: Face, text: string, max: number, min: number, maxW: number, maxH: number, lead = 1.45) {
  for (let s = max; s >= min; s -= 0.5) {
    const lines = wrap(f, text, s, maxW);
    if (lines.length * s * lead <= maxH) return { lines, size: s };
  }
  return { lines: wrap(f, text, min, maxW), size: min };
}
export async function renderSample(book: SampleBook, loadIllustration: (image: string) => Promise<ArrayBuffer>): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const fs = { serif: await face(doc, serif, serifExt), sans: await face(doc, sans, sansExt), bold: await face(doc, sansBold, sansBoldExt) };
  doc.setTitle(`${book.title} (sample)`);
  doc.setAuthor(BRAND);
  doc.setSubject("Sample book with a fictional child.");
  doc.setCreator(BRAND);
  doc.catalog.set(PDFName.of("PageLayout"), PDFName.of("TwoPageRight"));

  const edition = sampleEdition(book).flat();
  const paths = [...new Set(edition.map((page) => page.image))];
  const pictures = new Map(await Promise.all(paths.map(async (path) =>
    [path, await doc.embedJpg(await loadIllustration(path))] as const,
  )));
  for (const leaf of edition) {
    const page = doc.addPage([SIZE, SIZE]);
    page.drawImage(pictures.get(leaf.image)!, { x: 0, y: 0, width: SIZE, height: SIZE });
    if (leaf.kind === "cover") {
      drawCoverTitle(page, book, fs.serif, fs.bold);
    } else if ("text" in leaf) {
      const font = leaf.kind === "back" ? fs.sans : fs.serif;
      const isStory = leaf.kind === "story";
      const { left, width: area, center, maxSize } = leaf.placement;
      const f = fit(font, leaf.text, maxSize, 16, SIZE * area / 100, SIZE * 0.32, 1.48);
      const lead = f.size * 1.48;
      const height = (f.lines.length - 1) * lead + (leaf.heading ? 53 : 0);
      const centerX = SIZE * (left + area / 2) / 100;
      let y = SIZE * (100 - center) / 100 + (height - f.size) / 2;
      if (leaf.heading) {
        draw(page, fs.serif, leaf.heading, centerX - width(fs.serif, leaf.heading, 35) / 2, y, 35, "#241E28");
        y -= 53;
      }
      for (const line of f.lines) {
        const x = isStory ? SIZE * left / 100 : centerX - width(font, line, f.size) / 2;
        draw(page, font, line, x, y, f.size, "#241E28");
        y -= lead;
      }
    }
  }
  return doc.save();
}

function drawCoverTitle(p: PDFPage, book: SampleBook, titleFont: Face, labelFont: Face) {
  const light = coverUsesLightTitle(book.story);
  const [pr, pg, pb] = hexToRgb01(light ? "#171D36" : "#FFF4DF");
  p.drawRectangle({ x: 0, y: SIZE - 166, width: SIZE, height: 166, color: rgb(pr, pg, pb), opacity: 0.86 });
  const name = book.child.name;
  const rest = book.title.slice(name.length).trim();
  let ns = 58;
  while (ns > 26 && width(titleFont, name, ns) > SIZE - 2 * M - 20) ns--;
  draw(p, titleFont, name, SIZE / 2 - width(titleFont, name, ns) / 2, SIZE - 50 - ns * 0.8, ns, light ? "#FFD992" : "#762D36");
  const rf = fit(titleFont, rest, 22, 13, SIZE - 2 * M - 20, 48, 1.15);
  rf.lines.forEach((l, i) => draw(p, titleFont, l, SIZE / 2 - width(titleFont, l, rf.size) / 2, SIZE - 82 - ns * 0.8 - i * rf.size * 1.15, rf.size, light ? C.paper : C.ink));
  const badge = "SAMPLE BOOK";
  p.drawRectangle({ x: SIZE - 132, y: 18, width: 116, height: 24, color: rgb(0.64, 0.16, 0.25) });
  draw(p, labelFont, badge, SIZE - 74 - width(labelFont, badge, 10) / 2, 26, 10, "#FFFFFF");
}
