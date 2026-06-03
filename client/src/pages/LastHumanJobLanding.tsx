// ============================================================
// LastHumanJobLanding.tsx — Visual-first redesign
// Drop into: client/src/pages/LastHumanJobLanding.tsx
// ============================================================

import { useEffect, useState } from "react";

const CHECKOUT_URL = "/api/create-checkout-session";
const VICTOR_PHOTO =
  "https://res.cloudinary.com/dsriscylr/image/upload/v1772066808/freepik__ultrarealistic-portrait-dark-studio-as-digital-str__43901_c5ebjh.jpg";

export default function LastHumanJobLanding() {
  const [showSticky, setShowSticky] = useState(false);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimated(true), 300);
    const onScroll = () => {
      const hero = document.getElementById("hero");
      const offer = document.getElementById("offer");
      if (!hero || !offer) return;
      const heroBottom = hero.getBoundingClientRect().bottom;
      const offerRect = offer.getBoundingClientRect();
      const offerVisible = offerRect.top < window.innerHeight && offerRect.bottom > 0;
      setShowSticky(heroBottom < 0 && !offerVisible);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const track = () => {
    if (typeof window !== "undefined") {
      // @ts-ignore
      window.gtag?.("event", "begin_checkout", { currency: "EUR", value: 6.97 });
      // @ts-ignore
      window.fbq?.("track", "InitiateCheckout", { currency: "EUR", value: 6.97 });
    }
  };

  return (
    <div className="lhj">
      <style>{CSS}</style>

      <div className="specbar">
        <div className="wrap">
          <span>SYS / BOOK_01 / 2026</span>
          <span className="hide-sm">FIELD GUIDE 01 // THE METHOD CO.</span>
        </div>
      </div>

      <nav className="nav">
        <div className="wrap">
          <a className="brand" href="https://themethodco.co">
            <Logo />
            <span>The Method Co.</span>
          </a>
          <a className="navcta" href={CHECKOUT_URL} data-checkout="last-human-job" onClick={track}>
            Get the Book · €6.97
          </a>
        </div>
      </nav>

      <header className="hero" id="hero">
        <BackgroundGrid />
        <div className="wrap hero-grid">
          <div className="hero-left">
            <span className="eyebrow">// Field Guide 01</span>
            <h1>The Last<br /><span className="blue">Human</span><br />Job</h1>
            <p className="standfirst">The careers AI is replacing before 2030.</p>

            <div className="buybox">
              <div className="pricecol">
                <span className="strike">€19</span>
                <div className="priceline">
                  <span className="price"><span className="cur">€</span>6.97</span>
                </div>
                <span className="save">SAVE 63% · LAUNCH PRICE</span>
              </div>
              <a className="btn btn-blue btn-lg" href={CHECKOUT_URL} data-checkout="last-human-job" onClick={track}>
                Download Now →
              </a>
            </div>

            <div className="trust-row">
              <Trust icon="lock" text="Stripe secure" />
              <Trust icon="shield" text="7-day refund" />
              <Trust icon="bolt" text="Instant PDF" />
            </div>
          </div>

          <div className="hero-right">
            <BookMockup />
          </div>
        </div>
      </header>

      <section className="band stat-band">
        <div className="wrap stat-grid">
          <div className="stat-left">
            <span className="eyebrow">// The shift, in three numbers</span>
            <h2>This is not a drill.</h2>
          </div>
          <div className="stat-right">
            <StatCard big="50%" label="of UAE government to run on AI" sub="By 2028 · World first" />
            <StatCard big="80K" label="civil servants being retrained" sub="UAE Cabinet · 2026" />
            <StatCard big="13%" label="drop in early-career hires in AI roles" sub="Stanford · 2025" />
          </div>
        </div>
      </section>

      <section className="band heat-band">
        <div className="wrap">
          <div className="sec-head">
            <span className="idx">01</span>
            <h2>Where the ground<br />is moving fastest</h2>
          </div>
          <p className="lead">AI exposure by role. The higher the bar, the more of the work is already gone.</p>

          <div className="heat-chart">
            <HeatBar nm="Volume translation" icon="globe" pct={92} animated={animated} delay={0} />
            <HeatBar nm="Tier-1 customer service" icon="headset" pct={88} animated={animated} delay={80} />
            <HeatBar nm="Data entry & admin" icon="clipboard" pct={84} animated={animated} delay={160} />
            <HeatBar nm="Stock illustration" icon="image" pct={80} animated={animated} delay={240} />
            <HeatBar nm="Junior paralegal" icon="gavel" pct={75} animated={animated} delay={320} />
            <HeatBar nm="Volume copywriting" icon="pen" pct={72} animated={animated} delay={400} />
            <HeatBar nm="Junior accounting" icon="calc" pct={68} animated={animated} delay={480} />
            <HeatBar nm="Routine code & tests" icon="code" pct={65} animated={animated} delay={560} />
            <HeatBar nm="Retail till & bank counter" icon="cash" pct={62} animated={animated} delay={640} />
          </div>

          <div className="heat-legend">
            <div className="legend-item"><span className="dot green" /> SAFE 0–40</div>
            <div className="legend-item"><span className="dot amber" /> AT RISK 40–70</div>
            <div className="legend-item"><span className="dot red" /> HIGH RISK 70+</div>
          </div>
        </div>
      </section>

      <section className="band">
        <div className="wrap">
          <div className="sec-head">
            <span className="idx">02</span>
            <h2>What's inside</h2>
          </div>

          <div className="features-grid">
            <Feature icon={<IconScan />} title="9 exposed careers" text="Real companies. Real numbers." />
            <Feature icon={<IconChart />} title="The AI heat map" text="See your role's risk in one glance." />
            <Feature icon={<IconMeter />} title="The Risk Meter" text="Five questions. One honest answer." />
            <Feature icon={<IconCompass />} title="The 3 risk traits" text="Spot any job's risk in seconds." />
            <Feature icon={<IconAlarm />} title="Entry-level time bomb" text="Why beginners get hit first." />
            <Feature icon={<IconCheck />} title="What survives" text="The work AI can't replace." />
          </div>
        </div>
      </section>

      <section className="band meter-band">
        <div className="wrap meter-grid">
          <div>
            <span className="eyebrow">// Inside the book</span>
            <h2>The Risk Meter</h2>
            <p className="lead">A 5-question test. Take it in 90 seconds. Know where you stand.</p>
            <div className="meter-questions">
              <MeterQ n="01" t="Rule-based or judgement?" />
              <MeterQ n="02" t="Does it need empathy?" />
              <MeterQ n="03" t="Commodity or contextual?" />
              <MeterQ n="04" t="Built on human trust?" />
              <MeterQ n="05" t="Could a prompt do it?" />
            </div>
          </div>

          <div className="meter-visual">
            <RiskGauge animated={animated} />
          </div>
        </div>
      </section>

      <section className="band pq">
        <div className="wrap">
          <span className="mark">"</span>
          <blockquote>A task is not a career.<br /><span className="blue">Separate them in time.</span></blockquote>
          <p className="cite">— Victor Miranda</p>
        </div>
      </section>

      <section className="band who-band">
        <div className="wrap">
          <div className="sec-head">
            <span className="idx">03</span>
            <h2>Written for the<br />person in the middle.</h2>
          </div>

          <div className="who-grid">
            <WhoCard icon="briefcase" t="Mid-level pros" s="Admin, support, copy, design, finance, legal" />
            <WhoCard icon="user" t="Not founders, not engineers" s="Just real people doing real work" />
            <WhoCard icon="search" t="Sense the shift" s="See the headlines, feel the draft" />
            <WhoCard icon="map" t="Want a map" s="Not a motivational speech" />
          </div>
        </div>
      </section>

      <section className="band author">
        <div className="wrap author-grid">
          <div className="photo">
            <img src={VICTOR_PHOTO} alt="Victor Miranda" />
          </div>
          <div>
            <span className="eyebrow">// The author</span>
            <p className="name">Victor Miranda</p>
            <p className="role">Founder · The Method Co. · Dublin</p>
            <p>Watched AI hit the marketing world first. Now helps people get clear on what makes them valuable before the market decides for them.</p>
          </div>
        </div>
      </section>

      <section className="band offer" id="offer">
        <div className="wrap">
          <div className="sec-head center">
            <span className="idx">04</span>
            <h2>Get the book</h2>
          </div>

          <div className="card">
            <div className="card-top">
              <span className="card-tag">// AVAILABLE NOW</span>
              <h3>The Last Human Job</h3>
              <p className="card-sub">28 pages · Instant PDF</p>
            </div>

            <div className="card-price">
              <span className="strike">€19</span>
              <span className="price"><span className="cur">€</span>6.97</span>
              <span className="save">SAVE 63% · LAUNCH PRICE</span>
            </div>

            <div className="card-includes">
              <Include text="28-page PDF field guide" />
              <Include text="9 exposed careers + real evidence" />
              <Include text="The AI exposure heat map" />
              <Include text="The 5-question Risk Meter" />
              <Include text="7-day money-back guarantee" />
            </div>

            <a className="btn btn-blue btn-xl" href={CHECKOUT_URL} data-checkout="last-human-job" onClick={track}>
              Get the Book · €6.97 →
            </a>
            <p className="guarantee">Secure Stripe checkout · Instant delivery</p>
          </div>
        </div>
      </section>

      <section className="band guar">
        <div className="wrap center-text">
          <div className="badge"><ShieldBig /></div>
          <h3 className="guar-title">If it doesn't change<br />how you see your work,<br /><span className="blue">you pay nothing.</span></h3>
          <p className="guar-body">7-day refund. Reply, get every cent back.</p>
        </div>
      </section>

      <section className="band">
        <div className="wrap">
          <div className="sec-head">
            <span className="idx">05</span>
            <h2>Questions</h2>
          </div>
          <div className="faq-list">
            <Faq q="Is this AI hype?" a="Opposite. Every claim is tied to a real company or study. Full references at the back." />
            <Faq q="I'm not technical. Will it make sense?" a="Yes. Written for the person in the middle. No jargon, no code." />
            <Faq q="What do I get?" a="A 28-page PDF. The 9 exposed careers, the heat map, the risk meter, the references." />
            <Faq q="Will it tell me what to do?" a="This is the diagnosis. The follow-up book is the 90-day plan." />
            <Faq q="Refund?" a="7 days. No questions. Full refund." />
          </div>
        </div>
      </section>

      <section className="band final">
        <div className="wrap center-text">
          <span className="eyebrow">// Last thing</span>
          <h2>See it first.<br /><span className="blue">Then move.</span></h2>
          <a className="btn btn-blue btn-xl" href={CHECKOUT_URL} data-checkout="last-human-job" onClick={track}>
            Download for €6.97 →
          </a>
        </div>
      </section>

      <footer>
        <div className="wrap">
          <div className="fbrand">
            <Logo />
            <span className="tag">Get clear before the market decides for you.</span>
          </div>
          <div className="links">
            <a href="https://themethodco.co">THEMETHODCO.CO</a>
            <a href="https://instagram.com/themethodco.co">@THEMETHODCO.CO</a>
          </div>
        </div>
      </footer>

      <div className={`stickybar ${showSticky ? "show" : ""}`}>
        <div className="wrap">
          <div className="left">
            <span className="title">The Last <span className="blue">Human</span> Job</span>
            <span className="sprice">
              <span className="strk">€19</span>
              <span className="now">€6.97</span>
            </span>
          </div>
          <a className="btn btn-blue" href={CHECKOUT_URL} data-checkout="last-human-job" onClick={track}>
            Download →
          </a>
        </div>
      </div>
    </div>
  );
}

function BackgroundGrid() {
  return (
    <svg className="bg-grid" viewBox="0 0 1400 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#5A78FF" strokeWidth="0.5" opacity="0.08" />
        </pattern>
        <radialGradient id="glow" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor="#5A78FF" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#5A78FF" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1400" height="800" fill="url(#grid)" />
      <rect width="1400" height="800" fill="url(#glow)" />
    </svg>
  );
}

function BookMockup() {
  return (
    <div className="book-3d">
      <div className="book-spine" />
      <div className="book-cover">
        <svg className="book-bg" viewBox="0 0 400 540" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="bookgrid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#5A78FF" strokeWidth="0.5" opacity="0.12" />
            </pattern>
          </defs>
          <rect width="400" height="540" fill="url(#bookgrid)" />
          <circle cx="200" cy="280" r="180" fill="#5A78FF" opacity="0.04" />
        </svg>
        <div className="book-content">
          <div className="book-top">
            <span>SYS / BOOK_01</span>
            <span>EN_V1</span>
          </div>
          <div className="book-title">The Last<br /><span className="blue">Human</span><br />Job</div>
          <div className="book-sub">The careers AI is replacing before 2030.</div>
          <div className="book-num">01</div>
          <div className="book-foot">Victor Miranda · themethodco.co</div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ big, label, sub }: { big: string; label: string; sub: string }) {
  return (
    <div className="stat-card">
      <div className="stat-big">{big}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-sub">{sub}</div>
    </div>
  );
}

function HeatBar({ nm, icon, pct, animated, delay }: { nm: string; icon: string; pct: number; animated: boolean; delay: number }) {
  const color = pct >= 70 ? "red" : pct >= 40 ? "amber" : "green";
  return (
    <div className="heat-row">
      <div className="heat-icon"><HeatIcon name={icon} /></div>
      <div className="heat-name">{nm}</div>
      <div className="heat-track">
        <div className={`heat-fill ${color}`} style={{ width: animated ? `${pct}%` : "0%", transitionDelay: `${delay}ms` }} />
      </div>
      <div className={`heat-val ${color}`}>{pct}</div>
    </div>
  );
}

function HeatIcon({ name }: { name: string }) {
  const paths: Record<string, JSX.Element> = {
    globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></>,
    headset: <><path d="M4 14v-2a8 8 0 0 1 16 0v2M4 14a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2zm16 0a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2z" /></>,
    clipboard: <><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4v3h6V4M9 12h6M9 16h4" /></>,
    image: <><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="10" r="1.5" /><path d="M21 16l-5-5-9 8" /></>,
    gavel: <><path d="M3 21h12M6 21l8-8M14 5l5 5M11 8l5 5M9 10l5 5" /></>,
    pen: <><path d="M4 20l4-1L20 7l-3-3L5 16l-1 4z" /></>,
    calc: <><rect x="5" y="3" width="14" height="18" rx="2" /><rect x="8" y="6" width="8" height="3" /><circle cx="9" cy="13" r=".8" fill="currentColor" /><circle cx="12" cy="13" r=".8" fill="currentColor" /><circle cx="15" cy="13" r=".8" fill="currentColor" /><circle cx="9" cy="17" r=".8" fill="currentColor" /><circle cx="12" cy="17" r=".8" fill="currentColor" /><circle cx="15" cy="17" r=".8" fill="currentColor" /></>,
    code: <><path d="M8 6l-5 6 5 6M16 6l5 6-5 6M14 4l-4 16" /></>,
    cash: <><rect x="3" y="6" width="18" height="12" rx="1" /><circle cx="12" cy="12" r="3" /></>,
  };
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
}

function Feature({ icon, title, text }: { icon: JSX.Element; title: string; text: string }) {
  return (
    <div className="feature">
      <div className="feature-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

function MeterQ({ n, t }: { n: string; t: string }) {
  return (
    <div className="meter-q">
      <span className="meter-n">{n}</span>
      <span className="meter-t">{t}</span>
    </div>
  );
}

function RiskGauge({ animated }: { animated: boolean }) {
  return (
    <svg viewBox="0 0 300 200" className="gauge">
      <defs>
        <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4DD897" />
          <stop offset="50%" stopColor="#F4B85C" />
          <stop offset="100%" stopColor="#F26B6B" />
        </linearGradient>
      </defs>
      <path d="M 30 170 A 120 120 0 0 1 270 170" fill="none" stroke="#1F1D19" strokeWidth="22" strokeLinecap="round" />
      <path d="M 30 170 A 120 120 0 0 1 270 170" fill="none" stroke="url(#gaugeGrad)" strokeWidth="22" strokeLinecap="round" strokeDasharray="377" strokeDashoffset={animated ? "94" : "377"} style={{ transition: "stroke-dashoffset 1.6s cubic-bezier(.5,0,.2,1) .3s" }} />
      <g style={{ transform: animated ? "rotate(45deg)" : "rotate(-90deg)", transformOrigin: "150px 170px", transition: "transform 1.8s cubic-bezier(.5,0,.2,1) .3s" }}>
        <line x1="150" y1="170" x2="150" y2="60" stroke="#F5EFE0" strokeWidth="3" strokeLinecap="round" />
        <circle cx="150" cy="170" r="9" fill="#5A78FF" />
        <circle cx="150" cy="170" r="4" fill="#0E0E10" />
      </g>
      <text x="38" y="195" fontFamily="JetBrains Mono" fontSize="10" fill="#4DD897" fontWeight="600">SAFE</text>
      <text x="135" y="40" fontFamily="JetBrains Mono" fontSize="10" fill="#F4B85C" fontWeight="600">AT RISK</text>
      <text x="225" y="195" fontFamily="JetBrains Mono" fontSize="10" fill="#F26B6B" fontWeight="600">HIGH RISK</text>
    </svg>
  );
}

function WhoCard({ icon, t, s }: { icon: string; t: string; s: string }) {
  const paths: Record<string, JSX.Element> = {
    briefcase: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-7 8-7s8 3 8 7" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="M21 21l-5-5" /></>,
    map: <><path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14" /></>,
  };
  return (
    <div className="who-card">
      <svg viewBox="0 0 24 24" fill="none" stroke="#6B89FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[icon]}</svg>
      <h3>{t}</h3>
      <p>{s}</p>
    </div>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq ${open ? "open" : ""}`} onClick={() => setOpen(!open)}>
      <div className="faq-q">
        <span>{q}</span>
        <span className="faq-toggle">{open ? "−" : "+"}</span>
      </div>
      {open && <div className="faq-a">{a}</div>}
    </div>
  );
}

function Include({ text }: { text: string }) {
  return (
    <div className="include">
      <svg viewBox="0 0 24 24" fill="none" stroke="#6B89FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
        <path d="M5 12l5 5L20 7" />
      </svg>
      <span>{text}</span>
    </div>
  );
}

function Trust({ icon, text }: { icon: "lock" | "shield" | "bolt"; text: string }) {
  const path =
    icon === "lock" ? <><rect x="6" y="11" width="14" height="10" rx="2" /><path d="M9 11V8a4 4 0 0 1 8 0v3" /></> :
    icon === "shield" ? <><path d="M12 2l9 4v6c0 5-4 9-9 11-5-2-9-6-9-11V6l9-4z" /><path d="M9 12l2 2 4-4" /></> :
    <><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" /></>;
  return (
    <div className="trust-item">
      <svg viewBox="0 0 24 24" fill="none" stroke="#6B89FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{path}</svg>
      <span>{text}</span>
    </div>
  );
}

function Logo() {
  return (
    <svg viewBox="0 0 240 240" width="34" height="34">
      <path d="M 150 44 L 62 44 Q 44 44 44 62 L 44 178 Q 44 196 62 196 L 178 196 Q 196 196 196 178 L 196 96" fill="none" stroke="#F5EFE0" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 66 166 L 66 82 L 120 128 L 174 82 L 174 166" fill="none" stroke="#F5EFE0" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 200 52 L 116 136" fill="none" stroke="#6B89FF" strokeWidth="14" strokeLinecap="round" />
      <path d="M 146 130 L 116 136 L 122 106" fill="none" stroke="#6B89FF" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ShieldBig() {
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke="#6B89FF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 3l11 4v7c0 7-5 12-11 15C10 26 5 21 5 14V7l11-4z" />
      <path d="M11 16l3 3 6-7" />
    </svg>
  );
}

function IconScan() { return <svg viewBox="0 0 32 32" fill="none" stroke="#6B89FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 9V5a1 1 0 0 1 1-1h4M28 9V5a1 1 0 0 0-1-1h-4M4 23v4a1 1 0 0 0 1 1h4M28 23v4a1 1 0 0 1-1 1h-4M4 16h24" /></svg>; }
function IconChart() { return <svg viewBox="0 0 32 32" fill="none" stroke="#6B89FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 27h22M8 23V13M14 23V8M20 23v-7M26 23v-13" /></svg>; }
function IconMeter() { return <svg viewBox="0 0 32 32" fill="none" stroke="#6B89FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 24a11 11 0 0 1 22 0" /><path d="M16 24l6-7" /><circle cx="16" cy="24" r="2" fill="#6B89FF" /></svg>; }
function IconCompass() { return <svg viewBox="0 0 32 32" fill="none" stroke="#6B89FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="16" cy="16" r="12" /><path d="M21 11l-3 7-7 3 3-7z" /></svg>; }
function IconAlarm() { return <svg viewBox="0 0 32 32" fill="none" stroke="#6B89FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="16" cy="17" r="10" /><path d="M16 12v5l3 3M6 7l4-3M26 7l-4-3" /></svg>; }
function IconCheck() { return <svg viewBox="0 0 32 32" fill="none" stroke="#6B89FF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M28 16a12 12 0 1 1-6-10.4" /><path d="M11 15l4 4 12-12" /></svg>; }

const CSS = `
.lhj {
  --black: #0E0E10;
  --black2: #16161A;
  --panel: #1C1C22;
  --cream: #F5EFE0;
  --cream-soft: #D8D2C2;
  --blue: #5A78FF;
  --blue-bright: #6B89FF;
  --blue-glow: rgba(90, 120, 255, 0.18);
  --muted: #8E8878;
  --border: #2E2A26;
  --line: #36322D;
  --green: #4DD897;
  --amber: #F4B85C;
  --red: #F26B6B;
  font-family: 'Inter', sans-serif;
  background: var(--black);
  color: var(--cream);
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
}
.lhj * { box-sizing: border-box; }
.lhj .wrap { max-width: 1160px; margin: 0 auto; padding: 0 28px; position: relative; }
.lhj h1, .lhj h2, .lhj h3 { font-family: 'Bebas Neue', sans-serif; font-weight: 400; line-height: .94; letter-spacing: .005em; color: var(--cream); margin: 0; }
.lhj p { margin: 0; }
.lhj a { color: inherit; text-decoration: none; }
.lhj .blue { color: var(--blue-bright); }
.lhj .center-text { text-align: center; }
.lhj .eyebrow { font-family: 'JetBrains Mono', monospace; letter-spacing: .26em; font-size: 11.5px; color: var(--blue-bright); text-transform: uppercase; font-weight: 600; }
.lhj .standfirst { font-family: 'Newsreader', serif; font-style: italic; font-size: 22px; line-height: 1.5; color: var(--cream-soft); }
.lhj .sec-head { display: flex; align-items: baseline; gap: 18px; margin-bottom: 18px; }
.lhj .sec-head.center { justify-content: center; }
.lhj .sec-head .idx { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--blue-bright); letter-spacing: .1em; }
.lhj .band { padding: 100px 0; border-top: 1px solid var(--line); position: relative; }
.lhj .band h2 { font-size: 64px; }
.lhj .lead { font-family: 'Newsreader', serif; font-style: italic; font-size: 21px; color: var(--cream-soft); max-width: 680px; margin-top: 16px; line-height: 1.5; }
.lhj .lead.center { margin: 16px auto 0; }
.lhj .btn { display: inline-block; background: var(--cream); color: #0A0A0A; font-weight: 700; font-size: 15px; padding: 16px 34px; border-radius: 3px; letter-spacing: .04em; text-transform: uppercase; font-family: 'JetBrains Mono', monospace; transition: all .2s ease; cursor: pointer; border: none; }
.lhj .btn-blue { background: var(--blue); color: #fff; box-shadow: 0 8px 30px var(--blue-glow); }
.lhj .btn-blue:hover { background: var(--blue-bright); box-shadow: 0 12px 50px rgba(90,120,255,0.35); transform: translateY(-2px); }
.lhj .btn-lg { font-size: 16px; padding: 19px 40px; text-align: center; }
.lhj .btn-xl { font-size: 17px; padding: 22px 52px; }
.lhj .specbar { border-bottom: 1px solid var(--line); font-family: 'JetBrains Mono', monospace; font-size: 10.5px; letter-spacing: .18em; color: var(--muted); background: var(--black); }
.lhj .specbar .wrap { display: flex; justify-content: space-between; align-items: center; height: 40px; text-transform: uppercase; }
.lhj .nav { border-bottom: 1px solid var(--line); position: sticky; top: 0; backdrop-filter: blur(14px); background: rgba(14,14,16,.92); z-index: 60; }
.lhj .nav .wrap { display: flex; align-items: center; justify-content: space-between; height: 74px; }
.lhj .brand { display: flex; align-items: center; gap: 13px; font-family: 'Bebas Neue', sans-serif; letter-spacing: .2em; font-size: 19px; color: var(--cream); }
.lhj .navcta { font-family: 'JetBrains Mono', monospace; letter-spacing: .06em; font-size: 12.5px; color: #fff; background: var(--blue); padding: 11px 19px; border-radius: 3px; font-weight: 600; }
.lhj .navcta:hover { background: var(--blue-bright); }
.lhj .hero { padding: 90px 0 100px; position: relative; overflow: hidden; }
.lhj .bg-grid { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
.lhj .hero-grid { position: relative; z-index: 2; display: grid; grid-template-columns: 1.05fr .95fr; gap: 70px; align-items: center; }
.lhj .hero-left .eyebrow { display: block; margin-bottom: 24px; }
.lhj .hero h1 { font-size: 100px; line-height: .9; }
.lhj .hero .standfirst { margin-top: 24px; max-width: 460px; }
.lhj .buybox { margin-top: 38px; border: 1px solid var(--border); background: var(--panel); padding: 28px 30px; display: flex; align-items: center; gap: 28px; flex-wrap: wrap; border-radius: 4px; }
.lhj .buybox .pricecol { display: flex; flex-direction: column; align-items: flex-start; flex: 0 0 auto; }
.lhj .buybox .strike { font-family: 'JetBrains Mono', monospace; font-size: 14px; color: var(--muted); text-decoration: line-through; }
.lhj .buybox .priceline { display: flex; align-items: baseline; gap: 8px; margin-top: 2px; }
.lhj .buybox .price { font-family: 'Bebas Neue', sans-serif; font-size: 80px; line-height: .82; color: var(--cream); }
.lhj .buybox .price .cur { color: var(--blue-bright); font-size: 42px; vertical-align: super; }
.lhj .buybox .save { font-family: 'JetBrains Mono', monospace; font-size: 11px; color: var(--blue-bright); letter-spacing: .14em; margin-top: 10px; font-weight: 700; }
.lhj .buybox .btn { flex: 1; min-width: 200px; }
.lhj .trust-row { margin-top: 28px; display: flex; gap: 28px; flex-wrap: wrap; }
.lhj .trust-item { display: flex; align-items: center; gap: 9px; font-family: 'JetBrains Mono', monospace; font-size: 11.5px; color: var(--cream-soft); letter-spacing: .04em; }
.lhj .trust-item svg { width: 16px; height: 16px; flex-shrink: 0; }
.lhj .book-3d { position: relative; perspective: 1600px; max-width: 420px; margin: 0 auto; transform: rotateY(-12deg) rotateX(2deg); }
.lhj .book-spine { position: absolute; left: -12px; top: 8px; bottom: -8px; width: 16px; background: linear-gradient(90deg, #050507, #14141C); border-radius: 2px 0 0 2px; }
.lhj .book-cover { position: relative; aspect-ratio: 3/4; background: linear-gradient(160deg, #18181E 0%, #08080C 100%); border: 1px solid var(--border); border-radius: 2px; box-shadow: 30px 30px 80px rgba(0,0,0,.7), 0 0 60px var(--blue-glow); overflow: hidden; }
.lhj .book-bg { position: absolute; inset: 0; width: 100%; height: 100%; }
.lhj .book-content { position: relative; z-index: 2; padding: 36px 32px; height: 100%; display: flex; flex-direction: column; justify-content: space-between; }
.lhj .book-top { display: flex; justify-content: space-between; font-family: 'JetBrains Mono', monospace; font-size: 9.5px; letter-spacing: .14em; color: var(--muted); text-transform: uppercase; }
.lhj .book-title { font-family: 'Bebas Neue', sans-serif; font-size: 64px; line-height: .88; color: var(--cream); }
.lhj .book-sub { font-family: 'Newsreader', serif; font-style: italic; font-size: 13.5px; color: var(--cream-soft); margin-top: 14px; max-width: 80%; }
.lhj .book-num { position: absolute; right: 30px; bottom: 80px; font-family: 'Bebas Neue', sans-serif; font-size: 130px; line-height: .7; color: transparent; -webkit-text-stroke: 1px #2A2520; }
.lhj .book-foot { font-family: 'JetBrains Mono', monospace; font-size: 10.5px; letter-spacing: .14em; color: var(--blue-bright); text-transform: uppercase; position: relative; z-index: 2; }
.lhj .stat-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 60px; align-items: center; }
.lhj .stat-left h2 { font-size: 64px; margin-top: 14px; }
.lhj .stat-right { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 18px; }
.lhj .stat-card { background: var(--panel); border: 1px solid var(--border); padding: 28px 22px; border-radius: 4px; transition: all .2s ease; }
.lhj .stat-card:hover { border-color: var(--blue); transform: translateY(-3px); }
.lhj .stat-big { font-family: 'Bebas Neue', sans-serif; font-size: 64px; line-height: .9; color: var(--blue-bright); }
.lhj .stat-label { font-size: 14.5px; color: var(--cream); margin-top: 10px; line-height: 1.4; }
.lhj .stat-sub { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: .1em; color: var(--muted); text-transform: uppercase; margin-top: 12px; }
.lhj .heat-band { background: var(--black2); }
.lhj .heat-chart { margin-top: 50px; border: 1px solid var(--line); padding: 36px 32px; background: var(--black); border-radius: 4px; }
.lhj .heat-row { display: grid; grid-template-columns: 36px 200px 1fr 50px; align-items: center; gap: 18px; padding: 12px 0; border-bottom: 1px solid var(--line); }
.lhj .heat-row:last-child { border-bottom: none; }
.lhj .heat-icon { color: var(--cream-soft); display: flex; align-items: center; justify-content: center; }
.lhj .heat-icon svg { width: 22px; height: 22px; }
.lhj .heat-name { font-size: 15px; color: var(--cream); font-weight: 500; }
.lhj .heat-track { height: 14px; background: #1F1D19; position: relative; border-radius: 7px; overflow: hidden; }
.lhj .heat-fill { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 7px; transition: width 1.4s cubic-bezier(.5,0,.2,1); }
.lhj .heat-fill.green { background: linear-gradient(90deg, #2D9B6E, var(--green)); }
.lhj .heat-fill.amber { background: linear-gradient(90deg, #D08E2A, var(--amber)); }
.lhj .heat-fill.red { background: linear-gradient(90deg, #D04545, var(--red)); box-shadow: 0 0 20px rgba(242,107,107,0.3); }
.lhj .heat-val { font-family: 'JetBrains Mono', monospace; font-size: 16px; font-weight: 700; text-align: right; }
.lhj .heat-val.green { color: var(--green); }
.lhj .heat-val.amber { color: var(--amber); }
.lhj .heat-val.red { color: var(--red); }
.lhj .heat-legend { display: flex; gap: 32px; margin-top: 24px; justify-content: center; flex-wrap: wrap; }
.lhj .legend-item { display: flex; align-items: center; gap: 9px; font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: .12em; color: var(--cream-soft); text-transform: uppercase; }
.lhj .dot { width: 10px; height: 10px; border-radius: 50%; }
.lhj .dot.green { background: var(--green); }
.lhj .dot.amber { background: var(--amber); }
.lhj .dot.red { background: var(--red); box-shadow: 0 0 12px var(--red); }
.lhj .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin-top: 44px; }
.lhj .feature { background: var(--panel); border: 1px solid var(--border); padding: 32px 28px; border-radius: 4px; transition: all .2s ease; }
.lhj .feature:hover { border-color: var(--blue); transform: translateY(-4px); box-shadow: 0 20px 50px rgba(0,0,0,0.4); }
.lhj .feature-icon { width: 52px; height: 52px; border-radius: 4px; background: rgba(90,120,255,0.08); border: 1px solid rgba(90,120,255,0.2); display: flex; align-items: center; justify-content: center; margin-bottom: 22px; }
.lhj .feature-icon svg { width: 26px; height: 26px; }
.lhj .feature h3 { font-size: 26px; color: var(--cream); margin-bottom: 8px; }
.lhj .feature p { color: var(--cream-soft); font-size: 14.5px; }
.lhj .meter-band { background: var(--black2); }
.lhj .meter-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
.lhj .meter-band h2 { margin-top: 14px; }
.lhj .meter-questions { margin-top: 30px; }
.lhj .meter-q { display: flex; align-items: center; gap: 18px; padding: 14px 0; border-bottom: 1px solid var(--line); }
.lhj .meter-q:last-child { border-bottom: none; }
.lhj .meter-n { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--blue-bright); font-weight: 700; letter-spacing: .08em; }
.lhj .meter-t { font-size: 16px; color: var(--cream); }
.lhj .meter-visual { display: flex; justify-content: center; align-items: center; padding: 30px; background: var(--black); border: 1px solid var(--border); border-radius: 4px; }
.lhj .gauge { width: 100%; max-width: 380px; height: auto; }
.lhj .pq { text-align: left; padding: 120px 0; }
.lhj .pq .mark { font-family: 'Bebas Neue', sans-serif; font-size: 160px; line-height: .4; color: var(--blue-bright); display: block; }
.lhj .pq blockquote { font-family: 'Bebas Neue', sans-serif; font-size: 78px; line-height: 1.02; color: var(--cream); max-width: 920px; margin: 20px 0 0; }
.lhj .pq .cite { font-family: 'JetBrains Mono', monospace; font-size: 12px; letter-spacing: .16em; color: var(--muted); margin-top: 30px; text-transform: uppercase; }
.lhj .who-band { background: var(--black2); }
.lhj .who-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 18px; margin-top: 44px; }
.lhj .who-card { background: var(--panel); border: 1px solid var(--border); padding: 30px 24px; border-radius: 4px; text-align: center; }
.lhj .who-card svg { width: 32px; height: 32px; margin-bottom: 18px; }
.lhj .who-card h3 { font-size: 22px; color: var(--cream); margin-bottom: 8px; }
.lhj .who-card p { color: var(--cream-soft); font-size: 13.5px; line-height: 1.5; }
.lhj .author-grid { display: grid; grid-template-columns: 280px 1fr; gap: 56px; align-items: center; }
.lhj .photo { width: 280px; height: 340px; border: 1px solid var(--border); background: var(--black2); overflow: hidden; border-radius: 4px; }
.lhj .photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
.lhj .author .name { font-family: 'Bebas Neue', sans-serif; font-size: 40px; color: var(--cream); letter-spacing: .04em; margin-top: 14px; }
.lhj .author .role { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--blue-bright); letter-spacing: .1em; text-transform: uppercase; margin: 6px 0 22px; }
.lhj .author p { color: var(--cream-soft); font-size: 17px; max-width: 540px; line-height: 1.65; }
.lhj .offer { background: var(--black2); }
.lhj .offer .card { max-width: 640px; margin: 50px auto 0; border: 1px solid var(--blue); padding: 0; text-align: center; background: var(--black); box-shadow: 0 0 100px var(--blue-glow); border-radius: 6px; overflow: hidden; }
.lhj .card-top { padding: 42px 44px 28px; }
.lhj .card-tag { font-family: 'JetBrains Mono', monospace; font-size: 11.5px; color: var(--blue-bright); letter-spacing: .18em; font-weight: 700; }
.lhj .card-top h3 { font-family: 'Bebas Neue', sans-serif; font-size: 48px; color: var(--cream); margin: 14px 0 8px; letter-spacing: .02em; }
.lhj .card-sub { font-family: 'JetBrains Mono', monospace; font-size: 12px; color: var(--muted); letter-spacing: .08em; text-transform: uppercase; }
.lhj .card-price { padding: 36px 44px; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); background: var(--panel); display: flex; flex-direction: column; align-items: center; }
.lhj .card-price .strike { font-family: 'JetBrains Mono', monospace; font-size: 17px; color: var(--muted); text-decoration: line-through; }
.lhj .card-price .price { font-family: 'Bebas Neue', sans-serif; font-size: 124px; line-height: .82; color: var(--cream); margin-top: 8px; }
.lhj .card-price .price .cur { color: var(--blue-bright); font-size: 64px; vertical-align: super; }
.lhj .card-price .save { font-family: 'JetBrains Mono', monospace; font-size: 13px; color: var(--blue-bright); letter-spacing: .14em; margin-top: 14px; font-weight: 700; }
.lhj .card-includes { padding: 30px 44px; }
.lhj .include { display: flex; align-items: center; gap: 14px; padding: 10px 0; color: var(--cream-soft); font-size: 15px; text-align: left; }
.lhj .include svg { flex-shrink: 0; }
.lhj .offer .btn { margin: 8px 44px 14px; width: calc(100% - 88px); }
.lhj .offer .guarantee { font-family: 'JetBrains Mono', monospace; font-size: 11.5px; letter-spacing: .1em; color: var(--muted); padding: 0 0 38px; text-transform: uppercase; }
.lhj .guar { padding: 110px 0; }
.lhj .guar .badge { width: 80px; height: 80px; margin: 0 auto 28px; border: 1.5px solid var(--blue); border-radius: 50%; display: flex; align-items: center; justify-content: center; background: var(--blue-glow); }
.lhj .guar .badge svg { width: 38px; height: 38px; }
.lhj .guar-title { font-family: 'Bebas Neue', sans-serif; font-size: 56px; color: var(--cream); max-width: 800px; margin: 0 auto 22px; line-height: 1.05; }
.lhj .guar-body { color: var(--cream-soft); max-width: 500px; margin: 0 auto; font-size: 17px; font-family: 'JetBrains Mono', monospace; letter-spacing: .08em; text-transform: uppercase; }
.lhj .faq-list { max-width: 820px; margin: 44px auto 0; border-top: 1px solid var(--line); }
.lhj .faq { border-bottom: 1px solid var(--line); cursor: pointer; transition: background .15s ease; }
.lhj .faq:hover { background: var(--black2); }
.lhj .faq-q { display: flex; align-items: center; justify-content: space-between; padding: 26px 0; font-family: 'Bebas Neue', sans-serif; font-size: 26px; color: var(--cream); }
.lhj .faq-toggle { color: var(--blue-bright); font-size: 30px; font-weight: 300; }
.lhj .faq-a { color: var(--cream-soft); font-size: 16px; padding: 0 0 28px; max-width: 720px; line-height: 1.65; }
.lhj .final { background: var(--black2); padding: 120px 0 130px; }
.lhj .final h2 { font-size: 92px; margin: 22px 0 40px; }
.lhj footer { border-top: 1px solid var(--line); padding: 52px 0 130px; background: var(--black); }
.lhj footer .wrap { display: flex; align-items: center; justify-content: space-between; gap: 24px; flex-wrap: wrap; }
.lhj footer .fbrand { display: flex; align-items: center; gap: 14px; }
.lhj footer .tag { font-family: 'Newsreader', serif; font-style: italic; font-size: 17px; color: var(--cream); }
.lhj footer .links a { font-family: 'JetBrains Mono', monospace; color: var(--muted); font-size: 12px; margin-left: 24px; letter-spacing: .06em; }
.lhj footer .links a:hover { color: var(--blue-bright); }
.lhj .stickybar { position: fixed; left: 0; right: 0; bottom: 0; z-index: 70; background: rgba(14,14,16,.97); backdrop-filter: blur(14px); border-top: 1px solid var(--blue); box-shadow: 0 -10px 40px rgba(0,0,0,0.5); transform: translateY(110%); transition: transform .35s ease; }
.lhj .stickybar.show { transform: translateY(0); }
.lhj .stickybar .wrap { display: flex; align-items: center; justify-content: space-between; height: 78px; gap: 22px; }
.lhj .stickybar .left { display: flex; align-items: center; gap: 22px; min-width: 0; }
.lhj .stickybar .title { font-family: 'Bebas Neue', sans-serif; font-size: 26px; color: var(--cream); letter-spacing: .03em; white-space: nowrap; }
.lhj .stickybar .sprice { font-family: 'JetBrains Mono', monospace; font-size: 15px; white-space: nowrap; }
.lhj .stickybar .sprice .strk { color: var(--muted); text-decoration: line-through; margin-right: 10px; }
.lhj .stickybar .sprice .now { color: var(--blue-bright); font-weight: 700; font-size: 18px; }
.lhj .stickybar .btn { padding: 15px 38px; font-size: 14px; white-space: nowrap; }
@media (max-width: 880px) {
  .lhj .hide-sm { display: none; }
  .lhj .hero-grid { grid-template-columns: 1fr; gap: 50px; }
  .lhj .hero h1 { font-size: 64px; }
  .lhj .book-3d { transform: none; max-width: 320px; }
  .lhj .stat-grid { grid-template-columns: 1fr; gap: 40px; }
  .lhj .stat-right { grid-template-columns: 1fr; }
  .lhj .features-grid, .lhj .who-grid { grid-template-columns: 1fr 1fr; gap: 14px; }
  .lhj .meter-grid { grid-template-columns: 1fr; gap: 40px; }
  .lhj .heat-row { grid-template-columns: 28px 140px 1fr 40px; gap: 12px; }
  .lhj .heat-name { font-size: 13px; }
  .lhj .band { padding: 70px 0; }
  .lhj .band h2 { font-size: 44px; }
  .lhj .pq blockquote { font-size: 44px; }
  .lhj .author-grid { grid-template-columns: 1fr; justify-items: center; text-align: center; }
  .lhj .photo { width: 220px; height: 270px; }
  .lhj .final h2 { font-size: 56px; }
  .lhj .card-price .price { font-size: 96px; }
  .lhj .stickybar .title { display: none; }
  .lhj .buybox { flex-direction: column; align-items: stretch; gap: 20px; }
  .lhj footer .wrap { flex-direction: column; text-align: center; }
  .lhj .guar-title { font-size: 38px; }
}
`;
