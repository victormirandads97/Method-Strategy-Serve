// Shared brand system for the ad and sales-post generators: Inter type, the
// navy, green and white palette, the logo, and the layout helpers.
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const { chromium } = createRequire(import.meta.url)("playwright");
export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
export const prev = (f) => pathToFileURL(path.join(root, "client/public/landing-pages/previews", f)).href;

export const FORMATS = { "1x1": [1080, 1080], "4x5": [1080, 1350], "9x16": [1080, 1920] };

export const MARK = `<svg class="mark" viewBox="0 0 160 112" aria-hidden="true"><defs><linearGradient id="mg" gradientUnits="userSpaceOnUse" x1="80" y1="85.2" x2="160" y2="0"><stop offset="0" stop-color="#0F8A54"/><stop offset=".55" stop-color="#22D87A"/><stop offset="1" stop-color="#4BF59A"/></linearGradient></defs><path d="M0 0L80 63.2V85.2L29 44.91V112H0Z" fill="#fff"/><path d="M160 0L80 63.2V85.2L131 44.91V112H160Z" fill="url(#mg)"/></svg>`;
export const LOGO = `<div class="logo">${MARK}<span class="word">The Method Co<i>.</i></span></div>`;
export const ARROW = `<svg class="arr" viewBox="0 0 20 20"><path d="M4 10h12M11 5l5 5-5 5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
export const WA = `<svg class="wa" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2.2a9.8 9.8 0 0 0-8.4 14.8L2.3 21.7l4.8-1.3A9.8 9.8 0 1 0 12 2.2Zm0 17.8c-1.5 0-3-.4-4.2-1.2l-.3-.2-2.8.8.8-2.8-.2-.3A8 8 0 1 1 12 20Zm4.4-6c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.5.1l-.8 1c-.1.2-.3.2-.5.1a6.6 6.6 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.5-.4h-.5a.9.9 0 0 0-.7.3 2.8 2.8 0 0 0-.9 2.1c0 1.2.9 2.4 1 2.6.1.2 1.8 2.7 4.3 3.8 1.6.7 2.2.7 3 .6.5-.1 1.4-.6 1.6-1.2.2-.6.2-1 .1-1.2l-.5-.2Z"/></svg>`;

export const CSS = `
* { box-sizing: border-box; margin: 0; padding: 0; }
html { font-size: calc(100vw / 100); }
body { width: 100vw; height: 100vh; overflow: hidden; background: #0A0F14; color: #fff; font-family: Inter, system-ui, sans-serif; -webkit-font-smoothing: antialiased; position: relative; }
.glow { position: absolute; inset: 0; background: radial-gradient(60rem 60rem at 88% 8%, rgba(34,216,122,.24), transparent 70%), radial-gradient(50rem 40rem at 0% 100%, rgba(15,138,84,.18), transparent 70%); }
.grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px); background-size: 6rem 6rem; -webkit-mask-image: radial-gradient(70% 60% at 70% 30%, #000, transparent); }
.frame { position: absolute; inset: 0; padding: 6.5rem; display: flex; flex-direction: column; gap: 4rem; }
.f9x16 .frame { padding: calc(14vh + 2rem) 6.5rem calc(14vh + 2rem); gap: 5rem; }
.logo { display: flex; align-items: center; gap: 2rem; flex: none; }
.mark { width: 8.4rem; height: 5.9rem; }
.word { font-weight: 700; font-size: 2.6rem; letter-spacing: .09em; text-transform: uppercase; padding-left: 2rem; border-left: 2px solid rgba(255,255,255,.3); line-height: 1; }
.word i { font-style: normal; color: #22D87A; }
h1 { font-weight: 800; letter-spacing: -.055em; line-height: .96; font-size: 8.6rem; }
h1 em { font-style: normal; color: #22D87A; }
.sub { font-size: 3.4rem; line-height: 1.32; color: #C9CED6; letter-spacing: -.01em; }
.sub b { color: #fff; font-weight: 600; }
.kicker { display: inline-flex; align-items: center; gap: 1.4rem; font-weight: 700; font-size: 2.5rem; color: #22D87A; letter-spacing: .02em; }
.kicker::before { content: ""; width: 4rem; height: .5rem; border-radius: 1rem; background: #22D87A; }
.cta { display: inline-flex; align-items: center; gap: 1.6rem; background: #22D87A; color: #052E16; font-weight: 800; font-size: 3.3rem; padding: 2.6rem 4rem; border-radius: 2.4rem; letter-spacing: -.01em; box-shadow: 0 2rem 4rem -2rem rgba(34,216,122,.8); white-space: nowrap; }
.cta .arr { width: 3.4rem; height: 3.4rem; }
.cta .wa { width: 3.8rem; height: 3.8rem; }
.foot { display: flex; align-items: center; justify-content: space-between; gap: 3rem; flex: none; }
.tag { font-size: 2.7rem; color: #C9CED6; line-height: 1.3; }
.tag b { color: #fff; font-weight: 700; display: block; font-size: 3.1rem; }
.tag s { color: #9CA3AF; text-decoration-thickness: .35rem; text-decoration-color: rgba(255,255,255,.55); }
.tag .g { color: #22D87A; font-weight: 800; }
.stage { flex: 1; min-height: 0; display: flex; align-items: center; justify-content: center; position: relative; }
.row { flex: 1; min-height: 0; display: flex; gap: 5rem; align-items: center; }
.row > .copy { flex: 1.15; display: flex; flex-direction: column; gap: 3.4rem; }
.row > .stage { flex: .85; align-self: stretch; }

/* Phone */
.phone { position: relative; height: 100%; max-height: 100%; aspect-ratio: 9 / 18.6; border-radius: 6rem; background: #05080B; padding: 1.5rem; box-shadow: 0 5rem 9rem -3rem rgba(0,0,0,.9), 0 0 0 .35rem rgba(255,255,255,.14); flex: none; }
.phone .scr { width: 100%; height: 100%; border-radius: 4.6rem; overflow: hidden; background: #F4F7F5; position: relative; }
.phone .notch { position: absolute; top: 2.6rem; left: 50%; transform: translateX(-50%); width: 28%; height: 3.4rem; border-radius: 2rem; background: #05080B; z-index: 3; }
.phone img { width: 100%; height: 100%; object-fit: cover; object-position: top; display: block; }

/* Calculator UI inside the phone (sized in phone-relative em) */
.calc { position: absolute; inset: 0; padding: 18% 8% 7%; display: flex; flex-direction: column; gap: .55em; color: #1B2B4B; font-size: var(--pf); }
.calc .biz { display: flex; align-items: center; gap: .4em; font-weight: 700; font-size: .9em; }
.calc .biz i { width: 1.2em; height: 1.2em; border-radius: 50%; background: #0FA37F; display: inline-block; }
.calc h3 { font-size: 1.7em; font-weight: 800; letter-spacing: -.03em; line-height: 1.05; margin-top: .2em; }
.calc .lab { font-size: .72em; font-weight: 700; color: #5A6478; text-transform: uppercase; letter-spacing: .08em; margin-top: .3em; }
.chips { display: flex; flex-wrap: wrap; gap: .35em; }
.chips span { font-size: .78em; font-weight: 700; padding: .45em .8em; border-radius: 99em; background: #fff; box-shadow: inset 0 0 0 .08em #DCE3EA; }
.chips span.on { background: #0FA37F; color: #fff; box-shadow: none; }
.extras { display: grid; gap: .35em; }
.extras div { display: flex; align-items: center; justify-content: space-between; background: #fff; border-radius: .6em; padding: .55em .7em; font-size: .78em; font-weight: 600; }
.extras div b { color: #0FA37F; }
.result { margin-top: auto; background: #fff; border-radius: 1em; padding: .9em; text-align: center; box-shadow: 0 .6em 1.4em -.6em rgba(15,40,60,.25); }
.result small { display: block; font-size: .72em; color: #5A6478; font-weight: 600; }
.result b { display: block; font-size: 3em; font-weight: 800; letter-spacing: -.04em; color: #0FA37F; line-height: 1.05; }
.result span { font-size: .72em; color: #5A6478; }
.wabtn { display: flex; align-items: center; justify-content: center; gap: .4em; background: #25D366; color: #052E16; border-radius: .8em; padding: .75em; font-weight: 800; font-size: .9em; }
.wabtn .wa { width: 1.2em; height: 1.2em; }

/* WhatsApp chat card */
.chat { width: 100%; max-width: 74rem; border-radius: 4rem; overflow: hidden; background: #EFE7DD; box-shadow: 0 5rem 9rem -3rem rgba(0,0,0,.85), 0 0 0 .3rem rgba(255,255,255,.1); }
.chat .top { background: #075E54; display: flex; align-items: center; gap: 2rem; padding: 2.6rem 3rem; }
.chat .top i { width: 6rem; height: 6rem; border-radius: 50%; background: #25D366; color: #052E16; display: grid; place-items: center; font-style: normal; font-weight: 800; font-size: 2.8rem; }
.chat .top b { font-size: 3rem; display: block; }
.chat .top small { font-size: 2.2rem; opacity: .8; }
.chat .body { padding: 3rem; display: flex; flex-direction: column; gap: 2rem; }
.chat .day { align-self: center; background: #fff; color: #54656F; font-size: 2rem; border-radius: 1.4rem; padding: .8rem 2rem; }
.bub { max-width: 88%; background: #D9FDD3; color: #111B21; font-size: 3rem; line-height: 1.38; padding: 2rem 2.4rem 1.2rem; border-radius: 2rem; align-self: flex-end; box-shadow: 0 .3rem .4rem rgba(0,0,0,.08); }
.bub b { font-weight: 700; }
.bub time { display: block; text-align: right; font-size: 2rem; color: #667781; margin-top: .6rem; }
.notif { position: absolute; display: flex; align-items: center; gap: 1.8rem; background: rgba(17,24,39,.94); border: .2rem solid rgba(34,216,122,.5); border-radius: 2.6rem; padding: 2rem 2.6rem; font-size: 2.5rem; color: #E5E7EB; box-shadow: 0 2rem 4rem -1rem rgba(0,0,0,.7); }
.notif i { width: 5.4rem; height: 5.4rem; border-radius: 1.4rem; background: #22D87A; color: #052E16; display: grid; place-items: center; flex: none; }
.notif i .wa { width: 3.4rem; height: 3.4rem; }
.notif b { color: #fff; display: block; font-size: 2.6rem; }

/* Price poster */
.price { display: flex; align-items: baseline; gap: 3.6rem; flex-wrap: wrap; }
.price s { font-size: 11rem; font-weight: 700; color: #6B7280; letter-spacing: -.04em; text-decoration-thickness: .9rem; text-decoration-color: rgba(242,107,107,.9); }
.price b { font-size: 25rem; font-weight: 800; color: #22D87A; letter-spacing: -.06em; line-height: .82; }
.checks { display: grid; gap: 2.2rem; }
.checks div { display: flex; align-items: center; gap: 2rem; font-size: 3.2rem; font-weight: 500; color: #E5E7EB; }
.checks div::before { content: ""; width: 4.6rem; height: 4.6rem; flex: none; border-radius: 50%; background: #22D87A url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M4 8.5l2.5 2.5L12 5.5' fill='none' stroke='%23052E16' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") center/100% no-repeat; }
.ribbon { display: inline-flex; align-self: flex-start; align-items: center; gap: 1.4rem; background: rgba(34,216,122,.12); border: .2rem solid rgba(34,216,122,.45); color: #22D87A; font-weight: 700; font-size: 2.6rem; padding: 1.4rem 2.4rem; border-radius: 99rem; }

/* Laptop and phone with real demo previews */
.devices { position: relative; width: 100%; height: 100%; }
.laptop { position: absolute; left: 0; top: 0; width: 86%; border-radius: 2.4rem; overflow: hidden; background: #1F2937; box-shadow: 0 5rem 9rem -3rem rgba(0,0,0,.85), 0 0 0 .25rem rgba(255,255,255,.1); }
.laptop .bar { display: flex; align-items: center; gap: 1rem; padding: 1.6rem 2rem; background: #161E2B; }
.laptop .bar i { width: 1.6rem; height: 1.6rem; border-radius: 50%; background: #374151; }
.laptop .bar span { margin-left: 1.4rem; flex: 1; background: #0F1620; border-radius: 1rem; padding: 1rem 1.6rem; font-size: 2rem; color: #9CA3AF; }
.laptop .view { aspect-ratio: 16 / 10; overflow: hidden; background: #fff; }
.laptop .view img { width: 100%; display: block; }
.devices .phone { position: absolute; right: 0; bottom: 0; height: auto; width: 31%; }

/* Comparison */
.cmp { display: grid; gap: 3rem; width: 100%; }
.f1x1 .cmp { grid-template-columns: 1fr 1fr; }
.box { border-radius: 3.4rem; padding: 3.6rem; background: #111827; border: .25rem solid #1F2937; display: flex; flex-direction: column; gap: 2.4rem; }
.box.good { background: linear-gradient(160deg, #0F2A1E, #0D1A14); border-color: rgba(34,216,122,.55); }
.box h4 { font-size: 3.2rem; font-weight: 800; letter-spacing: -.03em; }
.box h4 small { display: block; font-size: 2.3rem; font-weight: 500; color: #9CA3AF; letter-spacing: 0; margin-top: .6rem; }
.pills { display: flex; flex-wrap: wrap; gap: 1.4rem; }
.pills span { font-size: 2.5rem; font-weight: 600; padding: 1.2rem 2rem; border-radius: 1.4rem; background: #1F2937; color: #9CA3AF; }
.path { display: flex; align-items: center; gap: 1.2rem; flex-wrap: wrap; }
.path span { font-size: 2.5rem; font-weight: 700; padding: 1.3rem 2rem; border-radius: 1.4rem; background: #172131; color: #E5E7EB; border: .2rem solid #374151; }
.path em { font-style: normal; color: #22D87A; font-size: 3rem; font-weight: 800; }
.path span.go { background: #22D87A; color: #052E16; border-color: #22D87A; }

/* Stories: the canvas is tall, so the type grows to match */
.f9x16 h1 { font-size: 10.6rem; }
.f9x16 .sub { font-size: 4rem; }
.f9x16 .mark { width: 10rem; height: 7rem; }
.f9x16 .word { font-size: 3.1rem; }
.f9x16 .cta { font-size: 3.9rem; padding: 3rem 4.6rem; }
.f9x16 .tag { font-size: 3.2rem; }
.f9x16 .tag b { font-size: 3.7rem; }
.f9x16 .checks div { font-size: 3.9rem; }
.f9x16 .ribbon { font-size: 3rem; }
.f9x16 .price s { font-size: 9.5rem; }
.f9x16 .price b { font-size: 21rem; }
.f9x16 .box h4 { font-size: 3.9rem; }
.f9x16 .box h4 small { font-size: 2.8rem; }
.f9x16 .pills span, .f9x16 .path span { font-size: 3rem; }
.f9x16 .bub { font-size: 3.6rem; }
.f9x16 .chat .top b { font-size: 3.6rem; }
.f9x16 .notif { font-size: 3rem; }
.f9x16 .notif b { font-size: 3.2rem; }
.f1x1 .bub { font-size: 2.5rem; padding: 1.6rem 2rem 1rem; }
.f1x1 .chat .top { padding: 2rem 2.4rem; }
.f1x1 .chat .top b { font-size: 2.6rem; }
.f1x1 .chat .body { padding: 2.2rem; gap: 1.4rem; }

/* Fan of demo phones */
.fan { position: relative; width: 100%; height: 100%; }
.fan .phone { position: absolute; bottom: 7rem; height: auto; width: var(--pw); transform-origin: 50% 120%; }
.f1x1 .fan .phone { bottom: 2rem; }
.fan .lbl { position: absolute; left: 50%; bottom: -5.2rem; transform: translateX(-50%); white-space: nowrap; font-size: 2.2rem; font-weight: 700; color: #C9CED6; }
`;

// Runs in the page before the screenshot: fits each visual to its stage.
export const FIT = `
function fit() {
  var rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
  document.querySelectorAll('.calc').forEach(function (c) {
    var f = c.clientHeight / 22;
    c.style.fontSize = f + 'px';
    while (c.scrollHeight > c.clientHeight + 1 && f > 4) { f *= 0.96; c.style.fontSize = f + 'px'; }
  });
  document.querySelectorAll('.fit-devices').forEach(function (d) {
    var s = d.parentElement, W = Math.min(s.clientWidth, (s.clientHeight - 2 * rem) / 0.6);
    d.style.width = W + 'px'; d.style.height = (W * 0.6) + 'px';
  });
  document.querySelectorAll('.fan').forEach(function (f) {
    var s = f.parentElement, H = s.clientHeight, room = H - (f.dataset.labels ? 9 : 4) * rem;
    var pw = Math.min(s.clientWidth * 0.205, room / 2.2);
    f.style.height = H + 'px';
    f.querySelectorAll('.phone').forEach(function (p, i) {
      var k = i - 2; p.style.width = pw + 'px';
      p.style.left = (s.clientWidth / 2 + k * pw * 0.86 - pw / 2) + 'px';
    });
  });
  // Anything marked .scale-fit shrinks to the room its stage really has.
  document.querySelectorAll('.scale-fit').forEach(function (el) {
    var s = el.parentElement, cs = getComputedStyle(s);
    var room = s.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) - rem;
    var r = Math.min(1, room / el.offsetHeight);
    if (r < 1) { el.style.transformOrigin = cs.alignItems === 'flex-start' ? '50% 0' : '50% 50%'; el.style.transform = 'scale(' + r + ')'; }
  });
}`;

export function page(fmt, body) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body class="f${fmt}"><div class="glow"></div><div class="grid"></div><div class="frame">${body}</div><script>${FIT}</script></body></html>`;
}

export function calcPhone(pf) {
  return `<div class="phone"><div class="notch"></div><div class="scr"><div class="calc" style="--pf:${pf}">
    <div class="biz"><i></i>Spruce Cleaning</div>
    <h3>Your cleaning price</h3>
    <div class="lab">Type of clean</div>
    <div class="chips"><span>Regular</span><span class="on">Deep clean</span><span>End of tenancy</span></div>
    <div class="lab">Your home</div>
    <div class="chips"><span class="on">3 bed</span><span class="on">2 bath</span></div>
    <div class="lab">Extras</div>
    <div class="extras"><div>Inside oven <b>+ €45</b></div><div>Inside windows <b>+ €30</b></div></div>
    <div class="result"><small>Your price</small><b>€237</b><span>per clean, all supplies included</span></div>
    <div class="wabtn">${WA}Book on WhatsApp</div>
  </div></div></div>`;
}

