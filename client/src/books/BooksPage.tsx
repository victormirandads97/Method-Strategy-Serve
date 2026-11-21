import { useEffect, useRef, useState, type ReactNode } from "react";
import { Cover, DedicationOrnament, Portrait, SpreadFootprints } from "./art";
import { AVA, BRAND, FAQS, HEROES, LINKS, OFFER, SAMPLE, STORIES } from "./config";
import { REVIEWS, type Review } from "./reviews";
import { SampleReader } from "./SampleReader";
import { SignupForm } from "./SignupForm";
import { captureAttribution, getConsent, loadPixel, pixelIsLoaded, setConsent } from "./tracking";


function reducedMotion() {
  return typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
}

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

function BookScene() {
  return (
    <div className="lp-scene">
      <div className="lp-arch" aria-hidden="true" />
      <img className="lp-clay lp-clay-star" src="/books/clay-star.svg" width="160" height="160" alt="" decoding="async" />
      <img className="lp-clay lp-clay-egg" src="/books/clay-egg.svg" width="160" height="200" alt="" decoding="async" />
      <div className="lp-open-spread" aria-hidden="true">
        <SpreadFootprints look={AVA.look} title="" />
      </div>
      <div className="lp-hardback">
        <div className="lp-hardback-pages" aria-hidden="true" />
        <div className="lp-hardback-cover">
          <Cover story="dinosaur" name={AVA.name} look={AVA.look} label="Sample book cover: Ava and the Dinosaur Next Door, a square hardback" />
          <span className="lp-spine" aria-hidden="true" />
        </div>
      </div>
      <img className="lp-clay lp-clay-wellies" src="/books/clay-wellies.svg" width="200" height="170" alt="" decoding="async" />
      <span className="lp-sample-tag">Sample book</span>
    </div>
  );
}

function ThreeCards({ children, label }: { children: ReactNode; label: string }) {
  return <ul className="lp-three" aria-label={label}>{children}</ul>;
}

/** Reusable review cards. Shown on the live page only once REVIEWS has real, approved quotes. */
function ReviewCards({ reviews, placeholder = false }: { reviews: Review[]; placeholder?: boolean }) {
  return (
    <ThreeCards label="What parents say">
      {reviews.slice(0, 3).map((r, i) => (
        <li key={i} className={`lp-card lp-review${placeholder ? " lp-placeholder" : ""}`}>
          {placeholder && <span className="lp-placeholder-tag">Design placeholder</span>}
          <blockquote>
            <p>“{r.quote}”</p>
          </blockquote>
          <p className="lp-review-name">{r.name}</p>
          {r.gifted && <p className="lp-small">Feedback on a gifted sample copy</p>}
        </li>
      ))}
    </ThreeCards>
  );
}

function ConsentBanner({ open, onClose }: { open: boolean; onClose: () => void }) {
  const rejectRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (open && getConsent() !== null) rejectRef.current?.focus();
  }, [open]);
  if (!open) return null;
  return (
    <div className="lp-consent" role="region" aria-label="Cookie choices">
      <p>
        May we use the Meta Pixel to measure our ads and understand visits and sign-ups? Meta may use this data for advertising. Accept or reject optional cookies, and change your choice any time.{" "}
        <a href={LINKS.privacy}>Privacy and cookies</a>
      </p>
      <div className="lp-consent-actions">
        <button
          ref={rejectRef}
          type="button"
          className="lp-btn lp-btn-ghost"
          onClick={() => {
            const had = pixelIsLoaded();
            setConsent("rejected");
            onClose();
            if (had) location.reload();
          }}
        >
          Reject optional cookies
        </button>
        <button
          type="button"
          className="lp-btn lp-btn-primary"
          onClick={() => {
            setConsent("accepted");
            onClose();
            loadPixel();
          }}
        >
          Accept optional cookies
        </button>
      </div>
    </div>
  );
}

export default function BooksPage() {
  const [story, setStory] = useState("");
  const [readerOpen, setReaderOpen] = useState(false);
  const [heroIdx, setHeroIdx] = useState(0);
  const [stickyOn, setStickyOn] = useState(false);
  const [consentOpen, setConsentOpen] = useState(false);
  const [chosenNote, setChosenNote] = useState("");
  const [placeholders, setPlaceholders] = useState<Review[]>([]);
  const heroCta = useRef<HTMLAnchorElement>(null);
  const joinRef = useRef<HTMLElement>(null);
  const joinHeading = useRef<HTMLHeadingElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const readerOpener = useRef<HTMLElement | null>(null);
  // Remember the button itself: Safari doesn't focus buttons on click, so activeElement can't be trusted.
  const openReader = (e: React.MouseEvent<HTMLElement>) => {
    readerOpener.current = e.currentTarget;
    setReaderOpen(true);
  };

  useEffect(() => {
    // Layout placeholders exist in local development only. Vite removes this branch, and the file, from production builds.
    if (import.meta.env.DEV) import("./reviews.placeholder").then((m) => setPlaceholders(m.PLACEHOLDER_REVIEWS));
  }, []);

  useEffect(() => {
    captureAttribution();
    if (getConsent() === "accepted") loadPixel();
    else if (getConsent() === null) setConsentOpen(true);
  }, []);

  /* Sticky mobile CTA: only once the hero CTA has scrolled away, and never over the form. */
  useEffect(() => {
    if (!("IntersectionObserver" in window) || !heroCta.current || !joinRef.current) return;
    let heroVisible = true;
    let formVisible = false;
    const update = () => setStickyOn(!heroVisible && !formVisible);
    const a = new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting || e.boundingClientRect.top > 0; update(); });
    const b = new IntersectionObserver(([e]) => { formVisible = e.isIntersecting || e.boundingClientRect.top < 0; update(); }, { rootMargin: "0px 0px -10% 0px" });
    a.observe(heroCta.current);
    b.observe(joinRef.current);
    return () => { a.disconnect(); b.disconnect(); };
  }, []);

  function goToForm() {
    joinRef.current?.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block: "start" });
    joinHeading.current?.focus({ preventScroll: true });
  }

  function chooseStory(id: string) {
    setStory(id);
    const s = STORIES.find((x) => x.id === id);
    setChosenNote(s ? `${s.title} is saved in the sign-up form below. You can change it there.` : "");
  }

  const hero = HEROES[heroIdx];

  return (
    <div className="lp">
      <a className="lp-skip" href="#join">Skip to the sign-up form</a>
      <header className="lp-top">
        <div className="lp-wrap lp-top-inner">
          <a href="#top" aria-label={`${BRAND.name}, ${BRAND.endorsement}. Back to top`} className="lp-home"><Wordmark /></a>
          <a className="lp-top-cta" href="#join">Join the list</a>
        </div>
      </header>

      <main id="top">
        {/* 1. Hero */}
        <section className="lp-hero" aria-labelledby="lp-h1">
          <div className="lp-wrap lp-hero-grid">
            <div className="lp-hero-copy">
              <p className="lp-eyebrow">{OFFER.format} · {OFFER.ages}</p>
              <h1 id="lp-h1">Their next bedtime story stars them.</h1>
              <p className="lp-lede">Pick an adventure, make them the hero, and turn it into a hardback you can read together.</p>
            </div>
            <div className="lp-hero-art"><BookScene /></div>
            <div className="lp-hero-offer">
              <p className="lp-price">{OFFER.priceLine}</p>
              <div className="lp-cta-row">
                <a ref={heroCta} className="lp-btn lp-btn-primary" href="#join" onClick={(e) => { e.preventDefault(); goToForm(); }}>{OFFER.primaryCta}</a>
                <button type="button" className="lp-btn lp-btn-link" onClick={openReader}>
                  <BookIcon /> {OFFER.secondaryCta}
                </button>
              </div>
              <p className="lp-small lp-hero-note">Launch list only: nothing to pay now.</p>
            </div>
          </div>
        </section>

        {/* 2. Make the hero yours */}
        <section className="lp-section lp-yours" aria-labelledby="lp-yours-h">
          <div className="lp-wrap">
            <div className="lp-section-head">
              <h2 id="lp-yours-h">Make the hero yours</h2>
              <p>These are made-up example heroes. Pick one and watch the cover change.</p>
            </div>
            <div className="lp-yours-grid">
              <fieldset className="lp-heroes">
                <legend className="lp-sr">Choose an example hero</legend>
                {HEROES.map((h, i) => (
                  <label key={h.name} className={`lp-hero-opt${i === heroIdx ? " is-on" : ""}`}>
                    <input type="radio" name="lp-hero" value={h.name} checked={i === heroIdx} onChange={() => setHeroIdx(i)} />
                    <span className="lp-portrait"><Portrait look={h.look} /></span>
                    <span className="lp-hero-name">{h.name}</span>
                  </label>
                ))}
                <p className="lp-label-fiction">Fictional example portraits</p>
              </fieldset>
              <div className="lp-yours-cover" aria-live="polite">
                <div className="lp-mini-book">
                  <Cover story="dinosaur" name={hero.name} look={hero.look} label={`Sample cover: ${hero.name} and the Dinosaur Next Door`} />
                </div>
                <p className="lp-small lp-center">Sample cover · {hero.name} and the Dinosaur Next Door</p>
              </div>
            </div>
            <p className="lp-planned">When orders open, use a photo or choose their look.</p>
            <p className="lp-small lp-center">This demo doesn’t ask for any details about your child.</p>

            <figure className="lp-peek">
              <div className="lp-peek-book">
                <SpreadFootprints look={AVA.look} />
              </div>
              <figcaption>
                <span className="lp-kicker">From the sample book</span>
                <p className="lp-story-text">{SAMPLE.spread1}</p>
                <button type="button" className="lp-btn lp-btn-soft" onClick={openReader}>
                  <BookIcon /> Read the full sample
                </button>
              </figcaption>
            </figure>
          </div>
        </section>

        {/* 3. Stories */}
        <section className="lp-section lp-stories" aria-labelledby="lp-stories-h">
          <div className="lp-wrap">
            <div className="lp-section-head">
              <h2 id="lp-stories-h">Choose an adventure</h2>
              <p>Three stories for the first print run. Your child is the hero of whichever you pick.</p>
            </div>
            <ul className="lp-shelf">
              {STORIES.map((s, i) => {
                const chosen = story === s.id;
                return (
                  <li key={s.id} className={`lp-story${i === 0 ? " lp-story-lead" : ""}${chosen ? " is-chosen" : ""}`}>
                    <div className={`lp-story-cover lp-tone-${s.art}`}>
                      <div className="lp-mini-book"><Cover story={s.art} name={AVA.name} look={AVA.look} label={`Cover art: ${AVA.name} and the ${s.title.replace(/^The /, "")}`} /></div>
                    </div>
                    <div className="lp-story-body">
                      <h3>{s.title}</h3>
                      <p>{s.hook}</p>
                      <div className="lp-story-actions">
                        <button type="button" className={`lp-btn ${chosen ? "lp-btn-chosen" : "lp-btn-soft"}`} aria-pressed={chosen} onClick={() => chooseStory(chosen ? "" : s.id)}>
                          {chosen ? <><CheckIcon /> Chosen</> : "Choose this story"}
                        </button>
                        {s.hasSample && (
                          <button type="button" className="lp-btn lp-btn-link" onClick={openReader}>
                            <BookIcon /> {OFFER.secondaryCta}
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <p className="lp-chosen-note" aria-live="polite">
              {chosenNote && (
                <>
                  {chosenNote} <a href="#join" onClick={(e) => { e.preventDefault(); goToForm(); }}>Go to the form</a>
                </>
              )}
            </p>
          </div>
        </section>

        {/* 4. How it works */}
        <section className="lp-section lp-how" aria-labelledby="lp-how-h">
          <div className="lp-wrap">
            <div className="lp-section-head">
              <h2 id="lp-how-h">How your printed book will work</h2>
              <p>This is the ordering flow we’re building for the first print run.</p>
            </div>
            <ol className="lp-steps">
              <li><span className="lp-step-n">1</span><h3>Pick an adventure.</h3><p>Choose one of the three stories.</p></li>
              <li><span className="lp-step-n">2</span><h3>Make them the hero.</h3><p>Add their name, then upload one photo or choose their illustrated features.</p></li>
              <li><span className="lp-step-n">3</span><h3>Approve your book.</h3><p>Check a digital proof of every page. We print only after you approve it.</p></li>
            </ol>
            <div className="lp-how-grid">
              <div className="lp-choice">
                <h3>Two ways to make them the hero</h3>
                <div className="lp-choice-row">
                  <div className="lp-choice-card">
                    <PhotoIcon />
                    <h4>Upload one photo</h4>
                    <p>We match their hair, skin tone and look in the illustrations.</p>
                  </div>
                  <div className="lp-choice-or" aria-hidden="true">or</div>
                  <div className="lp-choice-card">
                    <PaletteIcon />
                    <h4>Choose their look</h4>
                    <p>Pick hair, skin tone and outfit yourself. No photo needed.</p>
                  </div>
                </div>
                <p className="lp-small">Both options arrive with ordering. Nothing is uploaded on this page.</p>
              </div>
              <figure className="lp-open-book">
                <div className="lp-open-left">
                  <DedicationOrnament />
                  <p className="lp-dedication-text">
                    {SAMPLE.dedication.line1}<br />{SAMPLE.dedication.line2}<br /><span>{SAMPLE.dedication.sign}</span>
                  </p>
                </div>
                <div className="lp-open-right" aria-hidden="true">
                  <SpreadFootprints look={AVA.look} title="" viewBox="400 0 400 400" fit="slice" />
                </div>
                <figcaption className="lp-small">Example dedication inside the sample book. You’ll write your own.</figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* Reviews when real, otherwise the details that make it personal */}
        <section className="lp-section lp-details" aria-labelledby="lp-details-h">
          <div className="lp-wrap">
            {REVIEWS.length > 0 ? (
              <>
                <div className="lp-section-head"><h2 id="lp-details-h">What parents say</h2></div>
                <ReviewCards reviews={REVIEWS} />
              </>
            ) : (
              <>
                <div className="lp-section-head"><h2 id="lp-details-h">Little details that make it theirs</h2></div>
                <ThreeCards label="Personal details in every book">
                  <li className="lp-card lp-detail">
                    <div className="lp-detail-art lp-detail-cover"><Cover story="dinosaur" name={AVA.name} look={AVA.look} viewBox="10 14 380 304" label="Close-up of the sample cover with Ava’s name in the title" /></div>
                    <h3>Their name on the cover</h3>
                    <p>Right there in the title, on a hardback that’s theirs.</p>
                  </li>
                  <li className="lp-card lp-detail">
                    <div className="lp-detail-art lp-detail-wellies"><SpreadFootprints look={AVA.look} viewBox="96 200 250 200" fit="slice" title="Ava in her yellow wellies, from a sample spread" /></div>
                    <h3>A detail only you’d know</h3>
                    <p>Like Ava’s yellow wellies, the little things that make it unmistakably them.</p>
                  </li>
                  <li className="lp-card lp-detail">
                    <div className="lp-detail-art lp-detail-ded">
                      <DedicationOrnament />
                      <p className="lp-dedication-text">For Ava, our favourite adventurer.<br /><span>Love, Mum and Dad</span></p>
                    </div>
                    <h3>A dedication from you</h3>
                    <p>Your own words on the first page, printed in the book.</p>
                  </li>
                </ThreeCards>
                <p className="lp-small lp-center">All examples use our fictional sample hero, Ava.</p>
              </>
            )}
            {import.meta.env.DEV && placeholders.length > 0 && REVIEWS.length === 0 && (
              <div className="lp-dev-only">
                <p className="lp-small"><strong>Local development only.</strong> Review card layout with placeholder data. Not in the production build.</p>
                <ReviewCards reviews={placeholders} placeholder />
              </div>
            )}
          </div>
        </section>

        {/* 5. Close and join */}
        <section className="lp-section lp-join" id="join" ref={joinRef} aria-labelledby="lp-join-h">
          <div className="lp-wrap lp-join-grid">
            <div className="lp-join-copy">
              <h2 id="lp-join-h" ref={joinHeading} tabIndex={-1}>A book they’ll ask to read again.</h2>
              <div className="lp-offer">
                <div className="lp-offer-book"><div className="lp-mini-book"><Cover story="dinosaur" name={AVA.name} look={AVA.look} label="Sample book cover" /></div></div>
                <ul className="lp-ticks">
                  <li><CheckIcon /> One illustrated, personalised hardback</li>
                  <li><CheckIcon /> Your child as the hero, ages 4–7</li>
                  <li><CheckIcon /> Your own dedication inside</li>
                  <li><CheckIcon /> Check a proof before anything is printed</li>
                </ul>
              </div>
              <p className="lp-price">{OFFER.priceLine}</p>
            </div>
            <div className="lp-join-form">
              <SignupForm ref={emailRef} story={story} onStoryChange={(id) => { setStory(id); setChosenNote(""); }} />
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="lp-section lp-faq" aria-labelledby="lp-faq-h">
          <div className="lp-wrap lp-narrow">
            <h2 id="lp-faq-h">Questions</h2>
            {FAQS.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
            <p className="lp-small">Anything else? Email <a href={`mailto:${LINKS.contactEmail}`}>{LINKS.contactEmail}</a></p>
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
        <span className="lp-sticky-price">€39.95 delivered</span>
        <a className="lp-btn lp-btn-primary" href="#join" tabIndex={stickyOn && !readerOpen ? 0 : -1} onClick={(e) => { e.preventDefault(); goToForm(); }}>
          {OFFER.primaryCta}
        </a>
      </div>

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
function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
  );
}
function PhotoIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="#9B3652" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="6" width="18" height="14" rx="3" /><circle cx="12" cy="13" r="3.5" /><path d="M8 6l1.5-2h5L16 6" /></svg>
  );
}
function PaletteIcon() {
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="#9B3652" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a9 9 0 1 0 0 18c1.5 0 2-1 2-2s-1-1.5-1-2.5 1-1.5 2-1.5h2a4 4 0 0 0 4-4c0-4.4-4-8-9-8Z" /><circle cx="7.5" cy="11" r="1.2" /><circle cx="10" cy="7.5" r="1.2" /><circle cx="14.5" cy="7.5" r="1.2" /></svg>
  );
}
