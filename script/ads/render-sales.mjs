// Renders direct-response sales posts for every Method Co. offer.
//
//   node script/ads/render-sales.mjs [offer-id ...]
//
// For each offer it writes, into brand/sales-posts/<offer>/:
//   hook-1.png, hook-2.png, hook-3.png   three single-image ads to test (4:5)
//   hook-1-story.png                     the first hook as a Story (9:16)
//   carousel-1.png ... carousel-6.png    a 6-slide carousel (4:5): hook, what
//                                        you get, before and after, ROI,
//                                        objections, offer and guarantee
// The copy lives in OFFERS below and in brand/sales-posts/SALES-COPY.md.
import { mkdir, writeFile, rm } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium, root, prev, LOGO, ARROW, WA, page, calcPhone } from "./shared.mjs";

const out = path.join(root, "brand", "sales-posts");

const EXTRA = `<style>
.top { display: flex; align-items: center; justify-content: space-between; flex: none; }
.count { font-size: 2.4rem; font-weight: 700; color: #9CA3AF; letter-spacing: .04em; }
.offer-name { display: inline-flex; align-self: flex-start; align-items: center; gap: 1.2rem; font-weight: 700; font-size: 2.5rem; color: #22D87A; background: rgba(34,216,122,.1); border: .2rem solid rgba(34,216,122,.4); padding: 1.1rem 2.2rem; border-radius: 99rem; }
.copy { display: flex; flex-direction: column; gap: 2.6rem; flex: none; }
h2 { font-weight: 800; letter-spacing: -.05em; line-height: .98; font-size: 7.4rem; }
h2 em { font-style: normal; color: #22D87A; }
.ctawrap { display: flex; flex-direction: column; align-items: flex-end; gap: 1.2rem; }
.micro { font-size: 2.2rem; color: #9CA3AF; }
.swipe { font-size: 2.8rem; font-weight: 700; color: #22D87A; display: inline-flex; align-items: center; gap: 1.2rem; }
.swipe .arr { width: 3.2rem; height: 3.2rem; }
.list { display: grid; gap: 2.2rem; }
.item { display: grid; grid-template-columns: 5.4rem 1fr; gap: 2rem; align-items: start; }
.item i { width: 5.4rem; height: 5.4rem; border-radius: 1.6rem; background: rgba(34,216,122,.14); display: grid; place-items: center; font-style: normal; color: #22D87A; font-weight: 800; font-size: 2.6rem; }
.item b { display: block; font-size: 3.2rem; font-weight: 700; letter-spacing: -.02em; line-height: 1.2; }
.item span { display: block; font-size: 2.5rem; color: #9CA3AF; line-height: 1.35; margin-top: .4rem; }
.ready { display: flex; align-items: center; gap: 2rem; background: #22D87A; color: #052E16; border-radius: 2.4rem; padding: 2.6rem 3rem; font-size: 3rem; font-weight: 800; letter-spacing: -.02em; }
.ready small { display: block; font-size: 2.4rem; font-weight: 600; opacity: .8; letter-spacing: 0; margin-top: .4rem; }
.ready svg { width: 6rem; height: 6rem; flex: none; }
.ba { display: grid; grid-template-columns: 1fr 1fr; gap: 2.4rem; }
.col { border-radius: 3rem; padding: 3.4rem 3rem; display: flex; flex-direction: column; gap: 2.4rem; }
.col.before { background: #1A1215; border: .25rem solid rgba(242,107,107,.35); }
.col.after { background: #0F2A1E; border: .25rem solid rgba(34,216,122,.5); }
.col h3 { font-size: 3.4rem; font-weight: 800; letter-spacing: -.03em; }
.col.before h3 { color: #F26B6B; } .col.after h3 { color: #22D87A; }
.col p { display: grid; grid-template-columns: 3.6rem 1fr; gap: 1.4rem; font-size: 2.8rem; line-height: 1.3; color: #E5E7EB; }
.col p::before { width: 3.6rem; height: 3.6rem; border-radius: 50%; display: grid; place-items: center; font-weight: 800; font-size: 2rem; margin-top: .2rem; }
.col.before p::before { content: "✕"; background: rgba(242,107,107,.18); color: #F26B6B; }
.col.after p::before { content: "✓"; background: #22D87A; color: #052E16; }
.punch { font-size: 3.6rem; font-weight: 700; line-height: 1.25; letter-spacing: -.02em; }
.punch em { font-style: normal; color: #22D87A; }
.eq { display: grid; grid-template-columns: 1fr auto 1fr; gap: 2.4rem; align-items: center; }
.eqbox { border-radius: 3rem; padding: 3.6rem 3rem; text-align: center; background: #111827; border: .25rem solid #1F2937; }
.eqbox.win { background: #0F2A1E; border-color: rgba(34,216,122,.6); }
.eqbox b { display: block; font-size: 10rem; font-weight: 800; letter-spacing: -.05em; line-height: .95; }
.eqbox.win b { color: #22D87A; }
.eqbox span { display: block; font-size: 2.7rem; color: #C9CED6; margin-top: 1.4rem; line-height: 1.3; }
.vsign { font-size: 7rem; font-weight: 800; color: #9CA3AF; }
.note { font-size: 2.2rem; color: #6B7280; }
.qa { display: grid; gap: 2.2rem; }
.qa div { background: #111827; border: .25rem solid #1F2937; border-radius: 2.8rem; padding: 3rem 3.2rem; }
.qa b { display: block; font-size: 3.3rem; font-weight: 800; letter-spacing: -.02em; margin-bottom: 1rem; }
.qa span { font-size: 2.8rem; color: #C9CED6; line-height: 1.38; }
.qa span em { font-style: normal; color: #22D87A; font-weight: 700; }
.deal { display: flex; flex-direction: column; gap: 2.8rem; }
.anchor { display: flex; align-items: baseline; gap: 3rem; }
.anchor s { font-size: 9rem; font-weight: 700; color: #6B7280; letter-spacing: -.04em; text-decoration-thickness: .8rem; text-decoration-color: rgba(242,107,107,.9); }
.anchor b { font-size: 19rem; font-weight: 800; color: #22D87A; letter-spacing: -.06em; line-height: .85; }
.anchor small { font-size: 3rem; color: #C9CED6; font-weight: 600; }
.urgent { display: flex; gap: 1.8rem; align-items: center; font-size: 2.8rem; font-weight: 600; color: #FCD34D; background: rgba(252,211,77,.08); border: .2rem solid rgba(252,211,77,.35); border-radius: 2rem; padding: 2rem 2.4rem; line-height: 1.3; }
.guar { display: flex; gap: 2.4rem; align-items: center; background: #111827; border: .25rem solid rgba(34,216,122,.45); border-radius: 2.8rem; padding: 2.8rem 3rem; }
.guar svg { width: 8rem; height: 8rem; flex: none; }
.guar b { display: block; font-size: 3.3rem; font-weight: 800; letter-spacing: -.02em; }
.guar span { font-size: 2.6rem; color: #C9CED6; line-height: 1.35; }
.bigcta { align-self: stretch; justify-content: center; font-size: 3.8rem; padding: 3.2rem; }
.center-micro { text-align: center; font-size: 2.4rem; color: #9CA3AF; }

/* "Their site vs yours" */
.vs { display: grid; grid-template-columns: 1fr 1fr; gap: 2.4rem; width: 100%; }
.site { border-radius: 2.8rem; overflow: hidden; background: #F4F7F5; color: #1B2B4B; display: flex; flex-direction: column; }
.site .lbl { font-size: 2.3rem; font-weight: 800; padding: 1.6rem 2.4rem; color: #fff; }
.site.them .lbl { background: #0F8A54; } .site.you .lbl { background: #374151; }
.site .in { padding: 2.6rem 2.4rem 3rem; display: flex; flex-direction: column; gap: 1.6rem; flex: 1; }
.site .in h5 { font-size: 3rem; font-weight: 800; letter-spacing: -.03em; line-height: 1.1; }
.site .chips span { font-size: 2rem; }
.site .p { font-size: 6.6rem; font-weight: 800; color: #0FA37F; letter-spacing: -.04em; line-height: 1; }
.site .btnw { background: #25D366; color: #052E16; border-radius: 1.4rem; text-align: center; font-weight: 800; font-size: 2.3rem; padding: 1.6rem; margin-top: auto; }
.site .call { margin-top: auto; border: .3rem dashed #9CA3AF; border-radius: 1.6rem; text-align: center; padding: 3rem 1.6rem; font-size: 3rem; font-weight: 800; color: #6B7280; }
.site .meh { font-size: 2.3rem; color: #6B7280; line-height: 1.35; }

/* Lock screen with missed WhatsApp messages */
.lock { width: 100%; max-width: 76rem; display: flex; flex-direction: column; gap: 1.8rem; }
.lock .time { text-align: center; font-size: 13rem; font-weight: 300; letter-spacing: -.04em; line-height: 1; color: #E5E7EB; }
.lock .date { text-align: center; font-size: 2.8rem; color: #9CA3AF; margin-bottom: 1.4rem; }
.nt { display: grid; grid-template-columns: 6rem 1fr auto; gap: 2rem; align-items: center; background: rgba(31,41,55,.9); border-radius: 2.6rem; padding: 2.4rem 2.6rem; }
.nt i { width: 6rem; height: 6rem; border-radius: 1.6rem; background: #25D366; color: #fff; display: grid; place-items: center; }
.nt i .wa { width: 3.8rem; height: 3.8rem; }
.nt b { display: block; font-size: 2.7rem; }
.nt span { font-size: 2.5rem; color: #C9CED6; }
.nt small { font-size: 2.2rem; color: #9CA3AF; align-self: start; }
.nt.missed { opacity: .55; }

/* WhatsApp quick replies */
.qr { width: 100%; max-width: 78rem; background: #111827; border-radius: 3.4rem; border: .25rem solid #1F2937; overflow: hidden; }
.qr .hd { padding: 2.4rem 3rem; font-size: 2.6rem; font-weight: 700; color: #9CA3AF; border-bottom: .2rem solid #1F2937; }
.qr .r { display: grid; grid-template-columns: 19rem 1fr; gap: 2rem; padding: 2.4rem 3rem; border-bottom: .2rem solid #1F2937; align-items: center; }
.qr .r b { font-size: 2.8rem; color: #22D87A; font-family: ui-monospace, monospace; }
.qr .r span { font-size: 2.6rem; color: #E5E7EB; line-height: 1.3; }
.bub.in { align-self: flex-start; background: #fff; }
.fan { transform: scale(.84); transform-origin: 50% 100%; }
.anchor { flex-wrap: wrap; }
.anchor small { flex-basis: 100%; margin-top: -1rem; }
.bub small { display: block; font-size: 2rem; color: #0F8A54; font-weight: 700; margin-bottom: .6rem; }
</style>`;

const SHIELD = `<svg viewBox="0 0 48 48"><path d="M24 4l16 6v11c0 11-7 19-16 23C15 40 8 32 8 21V10z" fill="#22D87A"/><path d="M16 24l6 6 11-12" fill="none" stroke="#052E16" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const CLOCK = `<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="19" fill="none" stroke="#052E16" stroke-width="3.6"/><path d="M24 13v12l8 5" fill="none" stroke="#052E16" stroke-width="3.6" stroke-linecap="round"/></svg>`;

// ── Visuals ──────────────────────────────────────────────────────────────────
const V = {
  calc: () => calcPhone("2rem"),
  chatPrice: () => `<div class="chat scale-fit"><div class="top"><i>S</i><div><b>Spruce Cleaning</b><small>Business account</small></div></div><div class="body"><span class="day">Today</span><div class="bub">Hi! I'd like to book:<br><b>Deep clean</b>, 3 bed, 2 bath<br>Extras: inside oven<br><b>Price: €237 per clean</b><br>What days are free next week?<time>07:42</time></div></div></div>`,
  vs: () => `<div class="vs scale-fit">
      <div class="site them"><div class="lbl">Your competitor's website</div><div class="in"><h5>Your cleaning price</h5><div class="chips"><span class="on">Deep clean</span><span class="on">3 bed</span><span class="on">2 bath</span></div><div class="p">€162</div><div class="btnw">Book on WhatsApp</div></div></div>
      <div class="site you"><div class="lbl">Your website</div><div class="in"><h5>Our services</h5><p class="meh">We offer a wide range of cleaning services across Dublin. Contact us for more information.</p><div class="call">Call us for a quote</div></div></div>
    </div>`,
  devices: (url = "maisonaurelle.ie", id = "beauty") => `<div class="fit-devices" style="position:relative"><div class="devices"><div class="laptop"><div class="bar"><i></i><i></i><i></i><span>${url}</span></div><div class="view"><img src="${prev(id + ".jpg")}"></div></div><div class="phone"><div class="notch"></div><div class="scr"><img src="${prev(id + "-mobile.jpg")}"></div></div></div></div>`,
  cmp: () => `<div class="cmp scale-fit"><div class="box"><h4>Your ad sends people to your homepage<small>Ten places to click. The offer is one of them.</small></h4><div class="pills"><span>About</span><span>Gallery</span><span>Blog</span><span>Services</span><span>News</span><span>Leave site</span></div></div><div class="box good"><h4>Your ad sends people to a landing page<small>One offer. One button.</small></h4><div class="path"><span>Headline</span><em>→</em><span>Offer</span><em>→</em><span class="go">Enquire</span></div></div></div>`,
  fan: () => {
    const ids = ["cleaning", "beauty", "renovation", "fitness", "restaurant"];
    return `<div class="fan">${ids.map((id, i) => `<div class="phone" style="--pw:20rem;transform:translateY(${-6 + Math.abs(i - 2) * 2.4}rem) rotate(${(i - 2) * 6}deg);z-index:${10 - Math.abs(i - 2)}"><div class="notch"></div><div class="scr"><img src="${prev(id + "-mobile.jpg")}"></div></div>`).join("")}</div>`;
  },
  missed: () => `<div class="lock scale-fit"><div class="time">21:47</div><div class="date">Tuesday</div>
      <div class="nt missed"><i>${WA}</i><div><b>+353 87 ••• 4410</b><span>Hi, how much for a full set?</span></div><small>2h ago</small></div>
      <div class="nt missed"><i>${WA}</i><div><b>+353 86 ••• 2093</b><span>Are you open Saturday?</span></div><small>3h ago</small></div>
      <div class="nt missed"><i>${WA}</i><div><b>+353 83 ••• 7781</b><span>Hello?? Anyone there?</span></div><small>5h ago</small></div>
    </div>`,
  autoReply: () => `<div class="chat scale-fit"><div class="top"><i>L</i><div><b>Luna Hair Studio</b><small>Business account · replies instantly</small></div></div><div class="body"><span class="day">Today 21:47</span>
      <div class="bub in">Hi, are you open Saturday?<time>21:47</time></div>
      <div class="bub"><small>Automatic reply</small>Hi! Thanks for messaging Luna 💇 We're closed right now, but you can see prices and book here: <b>wa.me/c/luna</b><br>We'll reply first thing tomorrow.<time>21:47</time></div></div></div>`,
  quickReplies: () => `<div class="qr scale-fit"><div class="hd">Quick replies · type / to send</div>
      <div class="r"><b>/prices</b><span>Full price list, sent in one tap</span></div>
      <div class="r"><b>/book</b><span>Your booking link and free slots</span></div>
      <div class="r"><b>/where</b><span>Address, map pin and parking</span></div>
      <div class="r"><b>/hours</b><span>Opening hours this week</span></div>
      <div class="r" style="border:0"><b>/thanks</b><span>Thank you and review request</span></div></div>`,
  bundle: () => `<div class="fit-devices" style="position:relative"><div class="devices"><div class="laptop"><div class="bar"><i></i><i></i><i></i><span>voltcoaching.ie</span></div><div class="view"><img src="${prev("fitness.jpg")}"></div></div><div class="phone"><div class="notch"></div><div class="scr" style="background:#EFE7DD;display:flex;flex-direction:column;justify-content:flex-end;padding:1.4rem;gap:1rem">
      <div style="background:#D9FDD3;border-radius:1.2rem;padding:1.2rem;font-size:1.7rem;line-height:1.35;color:#111B21">Hi! I filled in your form. Is the 12-week plan still available?</div>
      <div style="background:#fff;border-radius:1.2rem;padding:1.2rem;font-size:1.7rem;line-height:1.35;color:#111B21"><b style="color:#0F8A54;font-size:1.4rem;display:block">Automatic reply</b>Thanks! Here are the plans and prices. Pick a time for a free call 👇</div>
    </div></div></div></div>`,
};

// ── Offers and copy ──────────────────────────────────────────────────────────
const OFFERS = {
  "instant-pricing-tool": {
    name: "Instant Pricing Tool",
    priceTag: `<s>€299</s> <span class="g">€150</span> one-off`,
    cta: "Get my free preview", micro: "10-minute WhatsApp chat · pay only if you love it",
    hooks: [
      { h: `Every "call for a quote" is a customer <em>you just lost.</em>`, sub: `Most people won't ring. They book whoever shows a price first. <b>Put an instant price on your website for €150.</b>`, v: "vs" },
      { h: `Stop answering <em>"how much?"</em> ten times a day.`, sub: `Customers get their price in 30 seconds. <b>You get the enquiry on WhatsApp, every detail filled in.</b>`, v: "calc" },
      { h: `Wake up to customers who <em>already said yes</em> to your price.`, sub: `No back and forth. No ghosting after the quote. <b>Just "what days are free?"</b>`, v: "chatPrice" },
    ],
    get: { title: `Exactly what you get <em>for €150.</em>`, items: [
      ["A price calculator on your website", "Built with your real prices, extras and minimums."],
      ["Your colours and your logo", "Looks like part of your site, not a bolt-on."],
      ["Enquiries straight to your WhatsApp", "Every answer and the price, ready to reply to."],
      ["Works on the site you already have", "Wix, WordPress, Squarespace, Shopify. No website? It gets its own page."],
      ["2 rounds of changes + 30 days of price updates", "Rates change? Send me a message."],
    ], ready: ["Free preview in a few days", "You don't install or configure anything."] },
    ba: { afterTitle: "With the pricing tool", title: `What "call for a quote" <em>is costing you.</em>`,
      before: ["Visitors leave to find a price", "You answer the same question all day", "Leads arrive with zero details", "People ghost when they hear the price"],
      after: ["Customers see their price 24/7", "Enquiries arrive ready to book", "Every detail already filled in", "The price is agreed before you talk"],
      punch: `Every week without it, the jobs go to <em>whoever shows a price.</em>` },
    roi: { title: `€150 once. <em>One job pays it back.</em>`, left: ["€150", "one-off, no monthly fees"], right: ["1 job", "one extra booking worth €150 or more and it has paid for itself"], note: "Every enquiry after that is profit. Your numbers will differ; the maths is the point." },
    obj: { title: `"Sounds good, <em>but…"</em>`, items: [
      [`"I don't have time."`, `It takes <em>one 10-minute chat</em> on WhatsApp. I build everything else.`],
      [`"I'm not a tech person."`, `You won't touch any tech. <em>I build it and put it on your site.</em>`],
      [`"Will it work for my business?"`, `If customers ask "how much?", yes. Jobs that need a visit get a <em>price range</em>, like €68k to €84k.`],
    ] },
    deal: { was: "€299", now: "€150", sub: "one-off", urgent: "Launch price for the first 5 Irish businesses only. Ends 30 November, then it's €299.", guarTitle: "Risk-free: try it before you pay", guar: "I build a working preview with your real prices first. Don't love it? You owe nothing." },
  },

  "landing-pages": {
    name: "High-Conversion Landing Pages",
    priceTag: `from <span class="g">€250</span> per page`,
    cta: "Get my landing page", micro: "Preview in 5 working days · pay after you approve",
    hooks: [
      { h: `You're paying for clicks <em>that never call.</em>`, sub: `Your ads send people to a homepage with ten places to click. <b>Send them to a page built to get the enquiry.</b>`, v: "cmp" },
      { h: `Your homepage is <em>wasting your ad money.</em>`, sub: `Slow on phones, too many menus, no clear next step. <b>A landing page fixes all three. From €250.</b>`, v: "devices" },
      { h: `Same ads. Same budget. <em>More enquiries.</em>`, sub: `Five live pages built for cleaners, clinics, builders, trainers and restaurants. <b>Yours from €250.</b>`, v: "fan" },
    ],
    get: { title: `Exactly what you get <em>for €250.</em>`, items: [
      ["One page built around one offer", "Up to six sections, designed to get one action."],
      ["The words written for you", "Clear, persuasive copy from a short questionnaire."],
      ["Designed for phones first", "In your colours, with your logo. Loads fast."],
      ["Enquiries to your inbox", "A short form, plus WhatsApp and call buttons."],
      ["Live on your own domain", "Google basics set up. 2 rounds of changes included."],
    ], ready: ["Preview in 5 working days", "Live the same week you approve. We do the tech."] },
    ba: { afterTitle: "With a landing page", title: `Where your ad money <em>goes right now.</em>`,
      before: ["Ads land on your homepage", "Visitors get lost in menus", "Slow to load on mobile data", "No obvious next step, so they leave"],
      after: ["Ads land on one focused offer", "One clear button to enquire", "Loads fast on any phone", "Enquiries land in your inbox"],
      punch: `You already paid for the click. <em>Don't lose the customer on the page.</em>` },
    roi: { title: `€250 once. <em>One client pays it back.</em>`, left: ["€250", "one-off, no monthly fee to us"], right: ["1 client", "one extra booking or job worth €250 and the page has paid for itself"], note: "It keeps working for every campaign after that. Your numbers will differ; the maths is the point." },
    obj: { title: `"Sounds good, <em>but…"</em>`, items: [
      [`"I don't have time."`, `A <em>1-minute form</em> and a few quick questions. We write, design and build the rest.`],
      [`"I'm not a tech person."`, `We publish it on your domain and connect the form. <em>You just share the link.</em>`],
      [`"Will it work for my business?"`, `See it for yourself: <em>5 live demos</em> for cleaning, beauty, renovation, fitness and restaurants.`],
    ] },
    deal: { was: "", now: "€250", sub: "from, per page", urgent: "We build a few pages a week so each gets proper attention. Book this week's slot.", guarTitle: "Risk-free: see it before you pay", guar: "You get a private preview first, plus 2 rounds of changes. Not right for you? You don't pay." },
  },

  "whatsapp-business-setup": {
    name: "WhatsApp Business Setup",
    priceTag: `<s>€149</s> <span class="g">€99</span> one-off`,
    cta: "Set up my WhatsApp", micro: "Working in 48 hours · pay once it's working",
    hooks: [
      { h: `Customers don't wait. <em>They message the next business.</em>`, sub: `Every message left on read is a booking for your competitor. <b>Professional WhatsApp setup in 48 hours, €99.</b>`, v: "missed" },
      { h: `Reply to every customer <em>in seconds.</em> Even at 10pm.`, sub: `Instant greetings, after-hours replies and your prices one tap away. <b>Set up for you in 48 hours.</b>`, v: "autoReply" },
      { h: `Still typing your prices <em>by hand?</em>`, sub: `Quick replies, a catalogue and labels that do the boring part for you. <b>€99, done in 48 hours.</b>`, v: "quickReplies" },
    ],
    get: { title: `Exactly what you get <em>for €99.</em>`, items: [
      ["A professional business profile", "Logo, hours, address, description and website."],
      ["Your services and prices in a catalogue", "Customers browse and pick without asking."],
      ["Greeting and after-hours messages", "Every customer gets an answer, instantly."],
      ["Quick replies for your top questions", "Prices, booking, location and hours in one tap."],
      ["Labels, a WhatsApp link and a QR code", "Track new leads. Add the link to Instagram, Google and your window."],
    ], ready: ["Working in 48 hours", "A 30-minute call. We do the setup with you."] },
    ba: { afterTitle: "After the setup", title: `What slow replies <em>are costing you.</em>`,
      before: ["Messages sit unanswered for hours", "Same questions, typed out every day", "No idea who's a new lead", "Customers book whoever replies first"],
      after: ["Every message answered instantly", "Prices and booking in one tap", "New leads labelled and followed up", "You look as professional as you are"],
      punch: `The business that replies first <em>usually gets the booking.</em>` },
    roi: { title: `€99 once. <em>One saved booking pays it back.</em>`, left: ["€99", "one-off, no subscription"], right: ["1 booking", "one customer you'd have missed is usually worth more than €99"], note: "WhatsApp Business itself is free. You only pay for the setup." },
    obj: { title: `"Sounds good, <em>but…"</em>`, items: [
      [`"I don't have time."`, `It's <em>one 30-minute call</em>. We set it up while you watch.`],
      [`"I'm not a tech person."`, `You don't configure anything. <em>You just reply to customers.</em>`],
      [`"Will it work for my business?"`, `Restaurants, salons, clinics, gyms: <em>if customers message you, yes.</em>`],
    ] },
    deal: { was: "€149", now: "€99", sub: "one-off", urgent: "Launch price. We only take a few setups a week, first come, first served.", guarTitle: "Risk-free: pay once it's working", guar: "We set it up, you test it on your phone. You only pay when you're happy with it." },
  },

  "never-miss-a-customer-pack": {
    name: "Never Miss a Customer Pack",
    priceTag: `<s>€399</s> <span class="g">€349</span> for both`,
    cta: "Get the pack", micro: "Landing page + WhatsApp setup · pay after you approve",
    hooks: [
      { h: `Get found. Get the enquiry. <em>Answer it in seconds.</em>`, sub: `A landing page that turns clicks into enquiries, plus a WhatsApp that answers them instantly. <b>Both for €349.</b>`, v: "bundle" },
      { h: `Stop losing customers <em>at both ends.</em>`, sub: `They leave a slow website. They give up on slow replies. <b>Fix both in one go.</b>`, v: "cmp" },
      { h: `Your 24/7 receptionist, <em>for €349 once.</em>`, sub: `Your page takes the enquiry. Your WhatsApp replies at 10pm. <b>You just do the work.</b>`, v: "autoReply" },
    ],
    get: { title: `Exactly what you get <em>for €349.</em>`, items: [
      ["A high-conversion landing page", "One offer, copy written for you, phone-first design."],
      ["Enquiries to your inbox and WhatsApp", "A short form plus WhatsApp and call buttons."],
      ["A professional WhatsApp Business setup", "Profile, catalogue, quick replies, labels."],
      ["Instant and after-hours replies", "Every customer gets an answer, day or night."],
      ["One project, one person, one invoice", "Live on your domain. 2 rounds of changes."],
    ], ready: ["WhatsApp in 48h, page in 5 working days", "We do all the tech. You approve."] },
    ba: { afterTitle: "With the pack", title: `Where you're <em>losing customers now.</em>`,
      before: ["Clicks land on a confusing website", "Interested people leave without asking", "Messages wait hours for a reply", "The fastest competitor gets the job"],
      after: ["Clicks land on one clear offer", "Enquiries come in with every detail", "Every message answered instantly", "You get there first, every time"],
      punch: `Two leaks, one fix: <em>catch the customer and keep them.</em>` },
    roi: { title: `€349 once. <em>Two customers pay it back.</em>`, left: ["€349", "€399 if bought separately"], right: ["2 clients", "two extra bookings or jobs worth €175 each and the pack has paid for itself"], note: "Then it keeps working for every campaign and every message. Your numbers will differ; the maths is the point." },
    obj: { title: `"Sounds good, <em>but…"</em>`, items: [
      [`"I don't have time."`, `A <em>1-minute form and one call.</em> We build and set up everything else.`],
      [`"I'm not a tech person."`, `Perfect. <em>We do all of it</em>, then show you how to reply to your leads.`],
      [`"Will it work for my business?"`, `If you sell a local service and customers message you, <em>this is built for you.</em>`],
    ] },
    deal: { was: "€399", now: "€349", sub: "for both, one-off", urgent: "We take a small number of projects each week. Book this week's slot.", guarTitle: "Risk-free: approve before you pay", guar: "See your page and test your WhatsApp first. You only pay for what you approve." },
  },
};

// ── Slide templates (4:5 unless noted) ───────────────────────────────────────
const top = (o, n) => `<div class="top">${LOGO}${n ? `<span class="count">${n}/6</span>` : ""}</div>`;
const foot = (o, swipe) => `<div class="foot"><div class="tag"><b>${o.name}</b>${o.priceTag}</div>${swipe
  ? `<div class="ctawrap"><span class="swipe">Swipe to see how ${ARROW}</span></div>`
  : `<div class="ctawrap"><div class="cta">${o.cta} ${ARROW}</div><span class="micro">${o.micro}</span></div>`}</div>`;

function hook(o, i, fmt, carousel) {
  const k = o.hooks[i];
  return page(fmt, `${EXTRA}${top(o, carousel ? 1 : 0)}<div class="copy"><h1>${k.h}</h1><p class="sub">${k.sub}</p></div><div class="stage">${V[k.v]()}</div>${foot(o, carousel)}`);
}
function getSlide(o) {
  const g = o.get;
  return page("4x5", `${EXTRA}${top(o, 2)}<div class="copy"><span class="offer-name">What you get</span><h2>${g.title}</h2></div>
    <div class="list" style="flex:1;align-content:center">${g.items.map((it, n) => `<div class="item"><i>${n + 1}</i><div><b>${it[0]}</b><span>${it[1]}</span></div></div>`).join("")}</div>
    <div class="ready">${CLOCK}<div>${g.ready[0]}<small>${g.ready[1]}</small></div></div>`);
}
function baSlide(o) {
  const b = o.ba;
  return page("4x5", `${EXTRA}${top(o, 3)}<div class="copy"><span class="offer-name">Before and after</span><h2>${b.title}</h2></div>
    <div class="ba" style="flex:1;align-items:stretch"><div class="col before"><h3>Today</h3>${b.before.map((x) => `<p>${x}</p>`).join("")}</div><div class="col after"><h3>${b.afterTitle}</h3>${b.after.map((x) => `<p>${x}</p>`).join("")}</div></div>
    <p class="punch">${b.punch}</p>`);
}
function roiSlide(o) {
  const r = o.roi;
  return page("4x5", `${EXTRA}${top(o, 4)}<div class="copy"><span class="offer-name">Do the maths</span><h2>${r.title}</h2></div>
    <div class="stage"><div class="eq" style="width:100%"><div class="eqbox"><b>${r.left[0]}</b><span>${r.left[1]}</span></div><span class="vsign">=</span><div class="eqbox win"><b>${r.right[0]}</b><span>${r.right[1]}</span></div></div></div>
    <p class="note">${r.note}</p>`);
}
function objSlide(o) {
  const q = o.obj;
  return page("4x5", `${EXTRA}${top(o, 5)}<div class="copy"><span class="offer-name">Your questions</span><h2>${q.title}</h2></div>
    <div class="qa" style="flex:1;align-content:center">${q.items.map((x) => `<div><b>${x[0]}</b><span>${x[1]}</span></div>`).join("")}</div>`);
}
function dealSlide(o) {
  const d = o.deal;
  return page("4x5", `${EXTRA}${top(o, 6)}<div class="deal" style="flex:1;justify-content:center">
      <span class="offer-name">${o.name}</span>
      <div class="anchor">${d.was ? `<s>${d.was}</s>` : ""}<b>${d.now}</b><small>${d.sub}</small></div>
      <div class="urgent">⏳ ${d.urgent}</div>
      <div class="guar">${SHIELD}<div><b>${d.guarTitle}</b><span>${d.guar}</span></div></div>
      <div class="cta bigcta">${o.cta} ${ARROW}</div>
      <p class="center-micro">${o.micro}</p>
    </div>`);
}

// ── Render ───────────────────────────────────────────────────────────────────
const only = process.argv.slice(2);
const browser = await chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
async function shot(html, file, w, h) {
  const tmp = path.join(out, ".tmp.html");
  await writeFile(tmp, html);
  const p = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await p.goto(pathToFileURL(tmp).href, { waitUntil: "load" });
  await p.evaluate(() => document.fonts.ready);
  await p.evaluate(() => fit());
  await p.waitForTimeout(120);
  await p.screenshot({ path: file });
  await p.close();
}
for (const [id, o] of Object.entries(OFFERS)) {
  if (only.length && !only.includes(id)) continue;
  const dir = path.join(out, id);
  await mkdir(dir, { recursive: true });
  for (let i = 0; i < 3; i++) await shot(hook(o, i, "4x5", false), path.join(dir, `hook-${i + 1}.png`), 1080, 1350);
  await shot(hook(o, 0, "9x16", false), path.join(dir, "hook-1-story.png"), 1080, 1920);
  await shot(hook(o, 0, "4x5", true), path.join(dir, "carousel-1.png"), 1080, 1350);
  await shot(getSlide(o), path.join(dir, "carousel-2.png"), 1080, 1350);
  await shot(baSlide(o), path.join(dir, "carousel-3.png"), 1080, 1350);
  await shot(roiSlide(o), path.join(dir, "carousel-4.png"), 1080, 1350);
  await shot(objSlide(o), path.join(dir, "carousel-5.png"), 1080, 1350);
  await shot(dealSlide(o), path.join(dir, "carousel-6.png"), 1080, 1350);
  console.log(`wrote brand/sales-posts/${id}/ (10 images)`);
}
await rm(path.join(out, ".tmp.html"), { force: true });
await browser.close();
