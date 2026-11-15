// Renders The Method Co. Meta ad creatives to PNG at Meta's sizes.
//
//   node script/ads/render-ads.mjs
//
// Writes brand/ads/<concept>-<format>.png for every concept in three formats:
// 1x1 (1080x1080 feed), 4x5 (1080x1350 feed) and 9x16 (1080x1920 Stories and
// Reels, key content kept out of the top and bottom 14%). Text is real type
// (Inter, installed locally) and the logo is the brand SVG, so prices and
// spelling are always exact. Needs Playwright with Chromium.
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium, root, prev, FORMATS, LOGO, ARROW, WA, page, calcPhone } from "./shared.mjs";

const out = path.join(root, "brand", "ads");
const tmp = path.join(out, ".tmp");
const CONCEPTS = {
  // ── Instant Pricing Tool ────────────────────────────────────────────────
  "pricing-1-wont-ring": (fmt) => {
    const head = `<h1>Most people won't ring for a <em>quote.</em></h1><p class="sub">Show them a price instead. <b>An instant price on your website, sent to your WhatsApp.</b></p>`;
    const foot = `<div class="foot"><div class="tag"><b>Instant Pricing Tool</b><s>€299</s> <span class="g">€150</span> launch price</div><div class="cta">Free preview ${ARROW}</div></div>`;
    if (fmt === "1x1") return page(fmt, `${LOGO}<div class="row"><div class="copy">${head}</div><div class="stage">${calcPhone("2rem")}</div></div>${foot}`);
    return page(fmt, `${LOGO}<div style="display:flex;flex-direction:column;gap:3rem">${head}</div><div class="stage">${calcPhone("2rem")}</div>${foot}`);
  },
  "pricing-2-whatsapp": (fmt) => {
    const head = `<h1>Wake up to enquiries <em>like this.</em></h1>`;
    const sub = `<p class="sub">Customers see their price on your website, then send you <b>every detail on WhatsApp.</b> No back and forth.</p>`;
    const chat = `<div class="chat scale-fit"><div class="top"><i>S</i><div><b>Spruce Cleaning</b><small>Business account</small></div></div><div class="body"><span class="day">Today</span><div class="bub">Hi! I'd like to book:<br><b>Deep clean</b>, 3 bed, 2 bath<br>Extras: inside oven<br><b>Price: €237 per clean</b><br>What days are free next week?<time>07:42</time></div></div></div>`;
    const notif = `<div class="notif" style="right:0;top:0;z-index:2"><i>${WA}</i><div><b>New enquiry</b>Sent from your pricing tool</div></div>`;
    const foot = `<div class="foot"><div class="tag"><b>Instant Pricing Tool</b><s>€299</s> <span class="g">€150</span> one-off</div><div class="cta">Free preview ${ARROW}</div></div>`;
    if (fmt === "1x1") return page(fmt, `${LOGO}<div class="row"><div class="copy">${head}${sub}</div><div class="stage chat-stage" style="flex:1">${chat}</div></div>${foot}`);
    return page(fmt, `${LOGO}<div style="display:flex;flex-direction:column;gap:3rem">${head}${sub}</div><div class="stage chat-stage" style="padding-top:${fmt === "9x16" ? "11rem" : "8rem"};align-items:flex-start">${notif}${chat}</div>${foot}`);
  },
  "pricing-3-offer": (fmt) => {
    const body = `<span class="ribbon">Launch offer · first 5 Irish businesses</span>
      <h1 style="font-size:${fmt === "1x1" ? "7rem" : fmt === "9x16" ? "10rem" : "8rem"}">Instant <em>Pricing Tool</em></h1>
      <div class="price"><s>€299</s><b>€150</b></div>
      <div class="checks"><div>An instant price on your own website</div><div>Enquiries straight to your WhatsApp</div><div>Free preview before you pay</div><div>One-off. No monthly fees.</div></div>`;
    const foot = `<div class="foot"><div class="tag">Ends <b style="display:inline;font-size:inherit">30 November</b><br>or when 5 spots are gone</div><div class="cta">${WA} Claim your spot</div></div>`;
    return page(fmt, `${LOGO}<div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:${fmt === "1x1" ? "2.6rem" : "4rem"}">${body}</div>${foot}`);
  },
  // ── High-Conversion Landing Pages ───────────────────────────────────────
  "landing-1-more-than-clicks": (fmt) => {
    const head = `<h1>Your business deserves more than <em>just clicks.</em></h1>`;
    const sub = `<p class="sub">Fast, beautiful landing pages built to turn visitors into <b>enquiries and bookings.</b></p>`;
    const devices = `<div class="devices"><div class="laptop"><div class="bar"><i></i><i></i><i></i><span>maisonaurelle.ie</span></div><div class="view"><img src="${prev("beauty.jpg")}"></div></div><div class="phone"><div class="notch"></div><div class="scr"><img src="${prev("beauty-mobile.jpg")}"></div></div></div>`;
    const foot = `<div class="foot"><div class="tag"><b>Landing pages</b>from <span class="g" style="font-size:4.2rem">€250</span></div><div class="cta">See 5 live demos ${ARROW}</div></div>`;
    return page(fmt, `${LOGO}<div style="display:flex;flex-direction:column;gap:3rem">${head}${fmt === "1x1" ? "" : sub}</div><div class="stage"><div class="fit-devices" style="position:relative">${devices}</div></div>${foot}`);
  },
  "landing-2-one-page": (fmt) => {
    const head = `<h1>One page. One offer. <em>One next step.</em></h1>`;
    const sub = `<p class="sub">Your homepage gives visitors ten places to go. A landing page gives them <b>one: your enquiry form.</b></p>`;
    const cmp = `<div class="cmp scale-fit"><div class="box"><h4>Your homepage<small>Lots of choices. The offer is one of them.</small></h4><div class="pills"><span>About</span><span>Gallery</span><span>Blog</span><span>Services</span><span>News</span><span>Leave site</span></div></div><div class="box good"><h4>A landing page<small>Built around one action.</small></h4><div class="path"><span>Headline</span><em>→</em><span>Offer</span><em>→</em><span class="go">Enquire</span></div></div></div>`;
    const foot = `<div class="foot"><div class="tag"><b>High-Conversion Landing Pages</b>from <span class="g">€250</span> · preview before you pay</div><div class="cta">See demos ${ARROW}</div></div>`;
    return page(fmt, `${LOGO}<div style="display:flex;flex-direction:column;gap:3rem">${head}${fmt === "4x5" ? sub : ""}</div><div class="stage">${cmp}</div>${foot}`);
  },
  "landing-3-five-demos": (fmt) => {
    const head = `<h1>Which one looks like <em>your business?</em></h1>`;
    const sub = `<p class="sub">Five working landing pages you can try on your phone. <b>Yours from €250.</b></p>`;
    const demos = [["cleaning", "Cleaning"], ["beauty", "Beauty"], ["renovation", "Renovation"], ["fitness", "Fitness"], ["restaurant", "Restaurant"]];
    const pw = fmt === "1x1" ? 19 : fmt === "4x5" ? 21 : 24;
    const spread = fmt === "1x1" ? 17 : fmt === "4x5" ? 17.5 : 17.2;
    const phones = demos.map(([id, label], i) => {
      const k = i - 2, rot = k * 6, lift = Math.abs(k) * 2.4, left = 50 + k * spread - pw / 2, z = 10 - Math.abs(k);
      return `<div class="phone" style="--pw:${pw}rem;left:calc(${left}% );transform:translateY(${-6 + lift}rem) rotate(${rot}deg);z-index:${z}"><div class="notch"></div><div class="scr"><img src="${prev(id + "-mobile.jpg")}"></div></div>`;
    }).join("");
    const labels = fmt === "1x1" ? "" : `<div style="position:absolute;left:0;right:0;bottom:0;display:flex;justify-content:center;gap:3.2rem;font-size:2.3rem;font-weight:600;color:#9CA3AF">${demos.map((d) => `<span>${d[1]}</span>`).join("<span style='color:#22D87A'>·</span>")}</div>`;
    const foot = `<div class="foot"><div class="tag"><b>5 live demos</b>Landing pages from <span class="g">€250</span></div><div class="cta">Try the demos ${ARROW}</div></div>`;
    return page(fmt, `${LOGO}<div style="display:flex;flex-direction:column;gap:3rem">${head}${fmt === "1x1" ? "" : sub}</div><div class="stage"><div class="fan"${fmt === "1x1" ? "" : ' data-labels="1"'}>${phones}${labels}</div></div>${foot}`);
  },
};

await mkdir(tmp, { recursive: true });
const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
const only = process.argv.slice(2);
for (const [name, make] of Object.entries(CONCEPTS)) {
  if (only.length && !only.some((o) => name.includes(o))) continue;
  for (const [fmt, [w, h]] of Object.entries(FORMATS)) {
    const file = path.join(tmp, `${name}-${fmt}.html`);
    await writeFile(file, make(fmt));
    const p = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    await p.goto(pathToFileURL(file).href, { waitUntil: "load" });
    await p.evaluate(() => document.fonts.ready);
    await p.evaluate(() => fit());
    await p.waitForTimeout(150);
    await p.screenshot({ path: path.join(out, `${name}-${fmt}.png`) });
    await p.close();
    console.log(`wrote brand/ads/${name}-${fmt}.png`);
  }
}
await browser.close();
