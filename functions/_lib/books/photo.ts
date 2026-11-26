/**
 * Photo checks for Little Plot Books.
 *
 * Accepts JPEG, PNG and WebP up to LIMITS.photoBytes, identified by their
 * bytes, not by the name or the browser's claim. Strips EXIF, XMP, IPTC and
 * text chunks (which is where GPS location lives) before anything is stored.
 */
import { LIMITS } from "../../../shared/books/catalog";
import { HttpError } from "./core";

export type PhotoType = "image/jpeg" | "image/png" | "image/webp";

export function sniff(b: Uint8Array): PhotoType | null {
  if (b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b.length > 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return "image/png";
  if (b.length > 12 && String.fromCharCode(...b.slice(0, 4)) === "RIFF" && String.fromCharCode(...b.slice(8, 12)) === "WEBP") return "image/webp";
  return null;
}

function stripJpeg(b: Uint8Array): Uint8Array {
  const out: Uint8Array[] = [b.slice(0, 2)];
  let i = 2;
  while (i + 4 <= b.length) {
    if (b[i] !== 0xff) throw new HttpError(415, "That photo looks damaged. Could you try another?");
    const marker = b[i + 1];
    if (marker === 0xda) {
      // Start of scan: the rest is image data.
      out.push(b.slice(i));
      break;
    }
    if (marker >= 0xd0 && marker <= 0xd9) {
      out.push(b.slice(i, i + 2));
      i += 2;
      continue;
    }
    const len = (b[i + 2] << 8) | b[i + 3];
    const seg = b.slice(i, i + 2 + len);
    // Drop APP1 (EXIF/XMP), APP12, APP13 (IPTC), and comments. Keep JFIF (APP0), ICC (APP2), Adobe (APP14).
    const drop = marker === 0xe1 || marker === 0xec || marker === 0xed || marker === 0xfe;
    if (!drop) out.push(seg);
    i += 2 + len;
  }
  return concat(out);
}

function stripPng(b: Uint8Array): Uint8Array {
  const out: Uint8Array[] = [b.slice(0, 8)];
  let i = 8;
  const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  while (i + 12 <= b.length) {
    const len = dv.getUint32(i);
    const type = String.fromCharCode(...b.slice(i + 4, i + 8));
    const chunk = b.slice(i, i + 12 + len);
    if (!["eXIf", "tEXt", "iTXt", "zTXt", "tIME"].includes(type)) out.push(chunk);
    i += 12 + len;
    if (type === "IEND") break;
  }
  return concat(out);
}

function stripWebp(b: Uint8Array): Uint8Array {
  const chunks: Uint8Array[] = [];
  let i = 12;
  const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  while (i + 8 <= b.length) {
    const type = String.fromCharCode(...b.slice(i, i + 4));
    const len = dv.getUint32(i + 4, true);
    const total = 8 + len + (len % 2);
    let chunk = b.slice(i, i + total);
    if (type === "VP8X") {
      chunk = chunk.slice();
      chunk[8] &= ~(0x08 | 0x04); // clear EXIF and XMP flags
    }
    if (type !== "EXIF" && type !== "XMP ") chunks.push(chunk);
    i += total;
  }
  const body = concat(chunks);
  const head = new Uint8Array(12);
  head.set(b.slice(0, 12));
  new DataView(head.buffer).setUint32(4, body.length + 4, true);
  return concat([head, body]);
}

function concat(parts: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}

export function cleanPhoto(bytes: Uint8Array): { type: PhotoType; bytes: Uint8Array } {
  if (bytes.length === 0) throw new HttpError(400, "That file is empty.");
  if (bytes.length > LIMITS.photoBytes) throw new HttpError(413, "That photo is over 10 MB. Could you try a smaller one?");
  const type = sniff(bytes);
  if (!type) throw new HttpError(415, "Please use a JPG, PNG or WebP photo.");
  const cleaned = type === "image/jpeg" ? stripJpeg(bytes) : type === "image/png" ? stripPng(bytes) : stripWebp(bytes);
  return { type, bytes: cleaned };
}
