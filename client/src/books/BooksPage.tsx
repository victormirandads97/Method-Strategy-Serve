import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Cover, DedicationOrnament, SpreadFootprints } from "./art";
import { BuyBox } from "./BuyBox";
import { asset, BRAND, CHECKOUT_ENDPOINT, FAQS, HEROES, LINKS, OFFER, PREVIEW } from "./config";
import { CoverSwap } from "./CoverSwap";
import { HeroBook } from "./HeroBook";
import { REVIEWS, type Review } from "./reviews";
import { SampleReader } from "./SampleReader";
import { SignupForm } from "./SignupForm";
import { Burst, StoryShelf } from "./StoryShelf";
import { captureAttribution, getConsent, loadPixel, pixelIsLoaded, setConsent, trackPurchase } from "./tracking";

function Wordmark({ as: Tag = "div" }: { as?: "div" | "p" }) {
  return (
    <Tag className="lp-wordmark">
      <svg className="lp-wordmark-icon" viewBox="0 0 64 64" aria-hidden="true">
        <path d="M6 18 Q19 12 32 19 Q45 12 58 18 V50 Q45 44 32 51 Q19 44 6 50 Z" fill="#9B3652" />
        <path d="M32 19 V51" stroke="#FFF8ED" strokeWidth="3" />
        <circle cx="49" cy="12" r="6" fill="#F3C230" />
      </svg>
      <span>
        <span className="lp-wordmark-name">{BRAND.name}</span>
        <span className="lp-endorse">{BRAND.endorsement}</span>
      </span>
    </Tag>
  );
}

function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div className={className} initial={reduce ? false : { opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "0px 0px -60px 0px" }} transition={{ duration: 0.5, delay, ease: [0.2, 0.8, 0.2, 1] }}>
      {children}
    </motion.div>
  );
}

function ReviewCards({ reviews, placeholder = false }: { reviews: Review[]; placeholder?: boolean }) {
  return (
    <ul className="lp-three" aria-label="What parents say">
      {reviews.slice(0, 3).map((r, i) => (
        <li key={i} className={`lp-card lp-review${placeholder ? " lp-placeholder" : ""}`}>
          {placeholder && <span className="lp-placeholder-tag">Design placeholder</span>}
          <blockquote><p>“{r.quote}”</p></blockquote>
          <p className="lp-review-name">{r.name}</p>
          {r.gifted && <p className="lp-small">Feedback on a gifted sample copy</p>}
        </li>
      ))}
    </ul>
  );
}

function ConsentBanner({ open, onClose }: { open: boolean; onClose: () => void }) {
  const rejectRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (open && getConsent() !== null) rejectRef.current?.focus(); }, [open]);
  if (!open) return null;
  return (
    <div className="lp-consent" role="region" aria-label="Cookie choices">
      <p>
        May we use the Meta Pixel to measure our ads and understand visits and sign-ups? Meta may use this data for advertising. Accept or reject optional cookies, and change your choice any time.{" "}
        <a href={LINKS.privacy}>Privacy and cookies</a>
      </p>
      <div className="lp-consent-actions">
        <button ref={rejectRef} type="button" className="lp-btn lp-btn-ghost" onClick={() => { const had = pixelIsLoaded(); setConsent("rejected"); onClose(); if (had) location.reload(); }}>Reject optional cookies</button>
        <button type="button" className="lp-btn lp-btn-primary" onClick={() => { setConsent("accepted"); onClose(); loadPixel(); }}>Accept optional cookies</button>
      </div>
    </div>
  );
}

function Faq() {
  const [open, setOpen] = useState<number | null>(null);
  const reduce = useReducedMotion();
  return (
    <div className="lp-faq-list">
      {FAQS.map((f, i) => {
        const on = open === i;
        return (
          <div key={f.q} className={`lp-faq-item${on ? " is-open" : ""}`}>
            <h3>
              <button type="button" aria-expanded={on} aria-controls={`lp-faq-${i}`} id={`lp-faq-q-${i}`} onClick={() => setOpen(on ? null : i)}>
                <span>{f.q}</span>
                <span className="lp-faq-icon" aria-hidden="true">{on ? "–" : "+"}</span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {on && (
                <motion.div id={`lp-faq-${i}`} role="region" aria-labelledby={`lp-faq-q-${i}`} className="lp-faq-a"
                  initial={reduce ? false : { height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={reduce ? { opacity: 0, transition: { duration: 0 } } : { height: 0, opacity: 0 }} transition={{ duration: 0.22 }}>
                  <p>{f.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

const STEPS = [
  { t: "Pick a story.", d: "Choose the adventure they’d ask you to read again.", art: <StepShelfArt /> },
  { t: "Make it theirs.", d: "Add their first name, one thing they love and a dedication from you. Use a photo or choose their look.", art: <StepHeroArt /> },
  { t: "Give it a read.", d: "Check the personalised proof before it goes to print.", art: <StepProofArt /> },
];

export default function BooksPage() {
  const reduce = useReducedMotion();
  const [story, setStory] = useState("");
  const [heroIdx, setHeroIdx] = useState(0);
  const [readerOpen, setReaderOpen] = useState(false);
  const [stickyOn, setStickyOn] = useState(false);
  const [consentOpen, setConsentOpen] = useState(false);
  const [placeholders, setPlaceholders] = useState<Review[]>([]);
  const [cancelled, setCancelled] = useState(false);
  const [order, setOrder] = useState<null | { paid: boolean; story: string | null }>(null);
  const [chosenNote, setChosenNote] = useState("");
  const heroCta = useRef<HTMLAnchorElement>(null);
  const joinRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const joinHeading = useRef<HTMLHeadingElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const readerOpener = useRef<HTMLElement | null>(null);
  const orderRef = useRef<HTMLDivElement>(null);
  const hero = HEROES[heroIdx];

  const openReader = (e: React.MouseEvent<HTMLElement>) => {
    readerOpener.current = e.currentTarget;
    setReaderOpen(true);
  };

  useEffect(() => {
    if (import.meta.env.DEV) import("./reviews.placeholder").then((m) => setPlaceholders(m.PLACEHOLDER_REVIEWS));
  }, []);

  useEffect(() => {
    captureAttribution();
    if (PREVIEW) return; // no Pixel or cookie banner in previews
    if (getConsent() === "accepted") loadPixel();
    else if (getConsent() === null) setConsentOpen(true);
    if (OFFER.mode !== "preorder") return;
    // Pre-order mode only: back from Stripe, confirm with Stripe before saying thank you.
    const params = new URLSearchParams(location.search);
    const result = params.get("order");
    const session = params.get("session_id");
    if (result === "cancelled") setCancelled(true);
    if (result === "success" && session) {
      fetch(`${CHECKOUT_ENDPOINT}?session_id=${encodeURIComponent(session)}`)
        .then((r) => r.json())
        .then((b) => { setOrder({ paid: !!b?.paid, story: b?.story || null }); if (b?.paid) trackPurchase(session); })
        .catch(() => setOrder({ paid: false, story: null }));
    }
    if (result) history.replaceState(null, "", location.pathname + (result === "cancelled" ? "#join" : ""));
  }, []);

  useEffect(() => { if (order) orderRef.current?.focus(); }, [order]);

  /* Sticky mobile CTA: after the hero CTA scrolls away; hidden while the signup form is on screen. */
  useEffect(() => {
    if (!("IntersectionObserver" in window) || !heroCta.current || !formRef.current) return;
    let heroVisible = true;
    let formVisible = false;
    const update = () => setStickyOn(!heroVisible && !formVisible);
    const a = new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting || e.boundingClientRect.top > 0; update(); });
    const b = new IntersectionObserver(([e]) => { formVisible = e.isIntersecting || e.boundingClientRect.bottom < 0; update(); });
    a.observe(heroCta.current);
    b.observe(formRef.current);
    return () => { a.disconnect(); b.disconnect(); };
  }, []);

  function goToForm() {
    joinRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    joinHeading.current?.focus({ preventScroll: true });
  }

  function chooseStory(id: string) {
    setStory(id);
    setChosenNote(id ? "Saved in the signup form below. You can change it there." : "");
  }

  return (
    <div className="lp">
      <a className="lp-skip" href="#join">Skip to the signup form</a>
      {PREVIEW && <p className="lp-preview-bar">Preview: signups here are simulated and not saved. Type fail@example.ie to see the error state.</p>}
      <header className="lp-top">
        <div className="lp-wrap lp-top-inner">
          <a href="#top" aria-label={`${BRAND.name}, ${BRAND.endorsement}. Back to top`} className="lp-home"><Wordmark /></a>
          <a className="lp-top-cta" href="#join" onClick={(e) => { e.preventDefault(); goToForm(); }}>Join the list</a>
        </div>
      </header>

      <main id="top">
        {/* 1. Opening scene */}
        <section className="lp-hero3" aria-labelledby="lp-h1">
          <div className="lp-wrap lp-hero3-grid">
            <div className="lp-hero3-copy">
              <p className="lp-eyebrow">{OFFER.productLine}</p>
              <h1 id="lp-h1">Look who’s in the book.</h1>
              <p className="lp-lede">Put their name on the cover and their favourite thing in the story. We’ll turn it into a hardback to read together.</p>
            </div>
            <div className="lp-hero3-art"><HeroBook /></div>
            <div className="lp-hero3-offer">
              <p className="lp-price">{OFFER.priceLine}</p>
              <div className="lp-cta-row">
                <a ref={heroCta} className="lp-btn lp-btn-primary lp-btn-xl" href="#join" onClick={(e) => { e.preventDefault(); goToForm(); }}>{OFFER.primaryCta}</a>
                <button type="button" className="lp-btn lp-btn-soft lp-btn-xl" onClick={openReader}><BookIcon /> {OFFER.secondaryCta}</button>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Try the personalisation */}
        <section className="lp-sec lp-sec-swap" aria-labelledby="lp-swap-h">
          <div className="lp-wrap">
            <Reveal className="lp-head lp-head-center">
              <h2 id="lp-swap-h">See who could be on the cover.</h2>
              <p>Choose a hero. Their name and look change on the cover, and their favourite thing turns up in the story.</p>
            </Reveal>
            <CoverSwap index={heroIdx} onChange={setHeroIdx} />
            <div className="lp-swap-foot">
              <p className="lp-planned">When orders open, you can use a photo or choose their look.</p>
              <p className="lp-small">This demo uses made-up characters. No name, photo, account or email needed.</p>
              <button type="button" className="lp-btn lp-btn-soft" onClick={openReader}><BookIcon /> Read the sample book</button>
            </div>
          </div>
        </section>

        {/* 3. Shelf */}
        <section className="lp-sec lp-sec-shelf" aria-labelledby="lp-shelf-h">
          <div className="lp-wrap">
            <Reveal className="lp-head">
              <h2 id="lp-shelf-h">What are they into this week?</h2>
              <p>Three adventures for the first print run. Pick the one they’d choose.</p>
            </Reveal>
            <StoryShelf chosen={story} onChoose={chooseStory} onSample={openReader} name={hero.name} look={hero.look} />
            <p className="lp-chosen-note" aria-live="polite">
              {chosenNote && <>{chosenNote} <a href="#join" onClick={(e) => { e.preventDefault(); goToForm(); }}>Go to the form</a></>}
            </p>
          </div>
        </section>

        {/* 4. How it will work */}
        <section className="lp-sec lp-sec-how" aria-labelledby="lp-how-h">
          <div className="lp-wrap">
            <Reveal className="lp-head">
              <p className="lp-kicker">Coming when orders open</p>
              <h2 id="lp-how-h">How the real book will work</h2>
            </Reveal>
            <ol className="lp-steps3">
              {STEPS.map((s, i) => (
                <motion.li key={s.t} initial={reduce ? false : { opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "0px 0px -60px 0px" }} transition={{ delay: i * 0.1, duration: 0.45 }}>
                  <div className="lp-steps3-art">{s.art}</div>
                  <span className="lp-steps3-n">{i + 1}</span>
                  <h3>{s.t}</h3>
                  <p>{s.d}</p>
                </motion.li>
              ))}
            </ol>
          </div>
        </section>

        {/* 5. Details, then reviews when real */}
        <section className="lp-sec lp-sec-details" aria-labelledby="lp-details-h">
          <div className="lp-wrap">
            <Reveal className="lp-head"><h2 id="lp-details-h">Little details that make it theirs</h2></Reveal>
            <ul className="lp-three" aria-label="Personal details in every book">
              {[
                { h: "Their name on the cover", p: "Right there in the title of their own hardback.", art: <div className="lp-detail-art lp-detail-cover"><Cover story="dinosaur" name="Ava" look={HEROES[0].look} viewBox="60 22 280 175" label="Close-up of the sample cover title: Ava and the Dinosaur Next Door" /></div> },
                { h: "Their favourite thing in a scene", p: "Ava loves her yellow wellies, so they’re in the story too.", art: <div className="lp-detail-art"><SpreadFootprints look={HEROES[0].look} viewBox="100 270 240 150" fit="slice" title="Close-up of Ava’s yellow wellies in a sample scene" /></div> },
                { h: "A dedication inside", p: "Your own words on the first page.", art: <div className="lp-detail-art lp-detail-ded"><DedicationOrnament /><p className="lp-dedication-text">For Ava,<br />our favourite adventurer.<br /><span>Love, Mum and Dad</span></p></div> },
              ].map((c, i) => (
                <motion.li key={c.h} className="lp-card lp-detail" initial={reduce ? false : { opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "0px 0px -60px 0px" }} transition={{ delay: i * 0.1, duration: 0.45 }}>
                  {c.art}
                  <h3>{c.h}</h3>
                  <p>{c.p}</p>
                </motion.li>
              ))}
            </ul>
            <p className="lp-small lp-center lp-details-note">Examples use our fictional sample hero, Ava.</p>
            {REVIEWS.length > 0 && (
              <div className="lp-reviews">
                <h2 className="lp-h-sm">What parents say</h2>
                <ReviewCards reviews={REVIEWS} />
              </div>
            )}
            {import.meta.env.DEV && placeholders.length > 0 && REVIEWS.length === 0 && (
              <div className="lp-dev-only">
                <p className="lp-small"><strong>Local development only.</strong> Review card layout with placeholder data. Not in the production build.</p>
                <ReviewCards reviews={placeholders} placeholder />
              </div>
            )}
          </div>
        </section>

        {/* 6. Invitation */}
        <section className="lp-sec lp-sec-join" id="join" ref={joinRef} aria-labelledby="lp-join-h">
          <div className="lp-wrap lp-join3">
            <div className="lp-join3-copy">
              <h2 id="lp-join-h" ref={joinHeading} tabIndex={-1}>One more story?</h2>
              <p className="lp-lede">Leave your email and we’ll tell you when the first books are ready to order.</p>
              <div className="lp-join3-book" aria-hidden="true">
                <div className="lp-mini-book"><Cover story="dinosaur" name={hero.name} look={hero.look} label="" /></div>
                <img src={asset("clay-star.svg")} alt="" width="64" height="64" className="lp-join3-star" />
              </div>
              <p className="lp-price">{OFFER.priceLine}</p>
            </div>
            <div className="lp-join3-form" ref={formRef}>
              {OFFER.mode === "preorder" && <BuyBox story={story} onStory={setStory} name={hero.name} cancelled={cancelled} />}
              <SignupForm ref={emailRef} story={story} onStoryChange={(id) => { setStory(id); setChosenNote(""); }} />
            </div>
          </div>
        </section>

        <section className="lp-sec lp-sec-faq" aria-labelledby="lp-faq-h">
          <div className="lp-wrap lp-narrow">
            <Reveal className="lp-head"><h2 id="lp-faq-h">Questions</h2></Reveal>
            <Faq />
            <p className="lp-small lp-faq-more">Anything else? Email <a href={`mailto:${LINKS.contactEmail}`}>{LINKS.contactEmail}</a></p>
          </div>
        </section>
      </main>

      <footer className="lp-foot">
        <div className="lp-wrap lp-foot-inner">
          <Wordmark as="p" />
          <nav aria-label="Footer">
            <a href={LINKS.privacy}>Privacy</a>
            <a href={`mailto:${LINKS.contactEmail}`}>Contact</a>
            <button type="button" className="lp-linkish" onClick={() => setConsentOpen(true)}>Cookie settings</button>
          </nav>
          <p className="lp-small">All characters and books shown are fictional samples.</p>
        </div>
      </footer>

      <div className={`lp-sticky${stickyOn && !readerOpen ? " is-on" : ""}`} aria-hidden={!stickyOn || readerOpen}>
        <span className="lp-sticky-info"><b>{OFFER.price}</b><span>planned · delivered</span></span>
        <a className="lp-btn lp-btn-primary" href="#join" tabIndex={stickyOn && !readerOpen ? 0 : -1} onClick={(e) => { e.preventDefault(); goToForm(); }}>{OFFER.primaryCta}</a>
      </div>

      <AnimatePresence>
        {order && (
          <motion.div className="lp-order-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="lp-order" role="dialog" aria-modal="true" aria-labelledby="lp-order-h" tabIndex={-1} ref={orderRef}>
              <span className="lp-burst-anchor"><img src={asset("clay-star.svg")} alt="" width="96" height="96" />{order.paid && <Burst show />}</span>
              {order.paid ? (
                <><h2 id="lp-order-h">Your pre-order is in!</h2><p>Stripe has emailed your receipt{order.story ? <> for <strong>{order.story}</strong></> : null}. Next, we’ll email you to set up their book.</p></>
              ) : (
                <><h2 id="lp-order-h">We’re confirming your payment</h2><p>Stripe hasn’t confirmed this payment yet. Questions? <a href={`mailto:${LINKS.contactEmail}`}>{LINKS.contactEmail}</a></p></>
              )}
              <button type="button" className="lp-btn lp-btn-primary" onClick={() => setOrder(null)}>Back to the page</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConsentBanner open={consentOpen} onClose={() => setConsentOpen(false)} />
      <SampleReader open={readerOpen} onOpenChange={setReaderOpen} onJoin={goToForm} returnFocus={readerOpener} />
    </div>
  );
}

function BookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6.5Q7.5 4 12 6.5Q16.5 4 21 6.5V19Q16.5 16.5 12 19Q7.5 16.5 3 19Z" /><path d="M12 6.5V19" />
    </svg>
  );
}

function StepShelfArt() {
  return (
    <svg viewBox="0 0 160 110" aria-hidden="true">
      <rect x="10" y="94" width="140" height="10" rx="3" fill="#C4876A" />
      <rect x="28" y="30" width="30" height="64" rx="4" fill="#DCE8DA" stroke="#6E9B68" strokeWidth="2" />
      <rect x="62" y="22" width="34" height="72" rx="4" fill="#9B3652" transform="rotate(-6 79 58)" />
      <rect x="100" y="36" width="28" height="58" rx="4" fill="#F8D5BE" stroke="#D9A27E" strokeWidth="2" />
      <circle cx="79" cy="40" r="7" fill="#FFE7A0" transform="rotate(-6 79 58)" />
      <path d="M36 44h14M36 52h10M106 50h12" stroke="#35263D" strokeWidth="2.5" strokeLinecap="round" opacity=".5" />
    </svg>
  );
}
function StepHeroArt() {
  return (
    <svg viewBox="0 0 160 110" aria-hidden="true">
      <circle cx="70" cy="56" r="40" fill="#F8D5BE" />
      <circle cx="70" cy="58" r="20" fill="#F2C6A0" />
      <g fill="#6B3E26"><circle cx="54" cy="44" r="9" /><circle cx="64" cy="36" r="9" /><circle cx="77" cy="36" r="9" /><circle cx="87" cy="44" r="9" /></g>
      <circle cx="63" cy="60" r="2.4" fill="#35263D" /><circle cx="77" cy="60" r="2.4" fill="#35263D" />
      <path d="M64 68q6 5 12 0" stroke="#35263D" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M118 30q6-9 12 0q6-9 12 0q0 9-12 18q-12-9-12-18Z" fill="#9B3652" />
      <rect x="112" y="66" width="30" height="8" rx="4" fill="#FFE7A0" transform="rotate(-35 127 70)" />
      <path d="M108 84l5-6 4 4z" fill="#35263D" />
    </svg>
  );
}
function StepProofArt() {
  return (
    <svg viewBox="0 0 160 110" aria-hidden="true">
      <path d="M20 26q30-10 58 0v66q-28-10-58 0Z" fill="#FFFDF8" stroke="#EADCCB" strokeWidth="2" />
      <path d="M78 26q30-10 60 0v66q-30-10-60 0Z" fill="#FFFDF8" stroke="#EADCCB" strokeWidth="2" />
      <rect x="86" y="34" width="44" height="30" rx="4" fill="#DCE8DA" />
      <path d="M30 40h36M30 50h30M30 60h34M30 70h24" stroke="#35263D" strokeWidth="2.5" strokeLinecap="round" opacity=".35" />
      <circle cx="124" cy="80" r="18" fill="#9B3652" />
      <path d="M115 80l6 6 12-12" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
