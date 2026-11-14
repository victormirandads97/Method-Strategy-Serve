// Renders the SVGs from script/brand/build-svgs.py to PNG with the Chromium
// that Playwright drives, and packs favicon.ico. Run build-svgs.py first.
//
//   node script/brand/render-pngs.mjs
//
// Needs the playwright package and a Chromium it can launch. Set CHROMIUM to a
// browser binary to use that one instead.
import { mkdir, readFile, writeFile, copyFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Playwright is not a project dependency. createRequire honours NODE_PATH, so
// a globally installed copy works as well as a local one.
const { chromium } = createRequire(import.meta.url)("playwright");

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const brand = path.join(root, "brand");
const pub = path.join(root, "client", "public");

/** [source svg, output png, output width in px] */
const JOBS = [
  ["logo/method-logo-horizontal-on-dark.svg", "logo/method-logo-horizontal-on-dark.png", 2000],
  ["logo/method-logo-horizontal-on-light.svg", "logo/method-logo-horizontal-on-light.png", 2000],
  ["logo/method-logo-horizontal-navy.svg", "logo/method-logo-horizontal-navy.png", 2000],
  ["logo/method-logo-horizontal-white.svg", "logo/method-logo-horizontal-white.png", 2000],
  ["logo/method-mark-on-dark.svg", "logo/method-mark-on-dark.png", 1024],
  ["logo/method-mark-on-light.svg", "logo/method-mark-on-light.png", 1024],
  ["icon/method-app-icon.svg", "icon/method-app-icon-512.png", 512],
  ["icon/method-app-icon.svg", "icon/method-app-icon-192.png", 192],
  ["icon/method-app-icon.svg", "icon/apple-touch-icon.png", 180],
  ["icon/favicon.svg", "icon/favicon-48.png", 48],
  ["icon/favicon.svg", "icon/favicon-32.png", 32],
  ["icon/favicon.svg", "icon/favicon-16.png", 16],
  ["social/method-whatsapp-profile.svg", "social/method-whatsapp-profile-640.png", 640],
  ["palette/method-palette.svg", "palette/method-palette.png", 2400],
];

const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
const page = await browser.newPage();

for (const [src, out, width] of JOBS) {
  const svg = await readFile(path.join(brand, src), "utf8");
  const [, vw, vh] = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/);
  const height = Math.round((width * Number(vh)) / Number(vw));
  await page.setViewportSize({ width, height });
  const sized = svg.replace(/width="[\d.]+" height="[\d.]+"/, `width="${width}" height="${height}"`);
  await page.setContent(
    `<!doctype html><html><head><style>html,body{margin:0;background:transparent}svg{display:block}</style></head><body>${sized}</body></html>`,
  );
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(brand, out), omitBackground: true, clip: { x: 0, y: 0, width, height } });
  console.log(`wrote brand/${out}`);
}
await browser.close();

// favicon.ico: PNG-compressed entries, which every current browser reads.
const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map((s) => readFile(path.join(brand, `icon/favicon-${s}.png`))));
const header = Buffer.alloc(6 + 16 * sizes.length);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((s, i) => {
  const e = 6 + i * 16;
  header.writeUInt8(s, e);
  header.writeUInt8(s, e + 1);
  header.writeUInt16LE(1, e + 4);
  header.writeUInt16LE(32, e + 6);
  header.writeUInt32LE(images[i].length, e + 8);
  header.writeUInt32LE(offset, e + 12);
  offset += images[i].length;
});
const ico = Buffer.concat([header, ...images]);
await mkdir(path.join(brand, "icon"), { recursive: true });
await writeFile(path.join(brand, "icon", "favicon.ico"), ico);
console.log("wrote brand/icon/favicon.ico");

// Files the site serves directly.
await copyFile(path.join(brand, "icon", "favicon.ico"), path.join(pub, "favicon.ico"));
await copyFile(path.join(brand, "icon", "favicon.ico"), path.join(root, "client", "favicon.ico"));
await copyFile(path.join(brand, "icon", "apple-touch-icon.png"), path.join(pub, "apple-touch-icon.png"));
await copyFile(path.join(brand, "icon", "method-app-icon-192.png"), path.join(pub, "icon-192.png"));
await copyFile(path.join(brand, "icon", "method-app-icon-512.png"), path.join(pub, "icon-512.png"));
console.log("copied favicon.ico, apple-touch-icon.png, icon-192.png, icon-512.png into client/public");
