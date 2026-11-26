import { useCallback, useEffect, useState } from "react";
import { ArrowRight, BookOpen, CheckCircle2, Gift, Heart, PawPrint, Snowflake, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { STORIES, STYLES, SALE_SCOPE, euro, type StoryId, type StyleId } from "@shared/books/catalog";
import { Cover, GalleryArt } from "../components/Art";
import { Price, SampleReader } from "../components/Book";
import { Footer, Header } from "../components/Chrome";
import { api, fromPrice, useShop, useTitle } from "../lib/api";
import { LIFESTYLE_PHOTOS } from "../lib/photos";
import "../storefront.css";

interface PublicReview {
  id: number;
  rating: number;
  body: string;
  display_name: string;
  verified: boolean;
}

export default function Home() {
  useTitle("Little Plot Books · Personalised storybooks for children");
  const info = useShop();
  const [reading, setReading] = useState<StoryId | null>(null);
  const closeReader = useCallback(() => setReading(null), []);
  const [style, setStyle] = useState<StyleId>("pastel");
  const [reviews, setReviews] = useState<PublicReview[]>([]);

  useEffect(() => {
    api<{ reviews: PublicReview[] }>("/api/books/reviews")
      .then(({ reviews }) => setReviews(reviews))
      .catch(() => undefined);
  }, []);

  const christmas = !!info?.christmas.enabled;
  const featured = christmas ? "snow-globe" : "little-wonders";
  const from = info ? fromPrice(info) : null;
  const canOrder = !!(info?.formats.length && info.methods.length);
  const activeStyle = STYLES.find((option) => option.id === style)!;
  const photos = LIFESTYLE_PHOTOS.filter((item) => item.approved);

  return (
    <div className="storefront">
      <a className="skip" href="#main">Skip to content</a>
      <Header info={info} shop />
      <main id="main">
        <section className="shop-hero">
          <img className="shop-hero-photo" src="/books-art/personalised-hardcover-hero.webp" width={1534} height={1025}
            alt="A smiling child holding an open personalised hardcover of The Sock-Stealing Dragon" fetchPriority="high" />
          <div className="wrap shop-hero-content">
            <div className="shop-hero-copy">
              {christmas && from && <p className="shop-campaign"><Gift size={18} aria-hidden="true" /> Christmas pricing <Snowflake size={15} aria-hidden="true" /></p>}
              <h1>Make your child <em>the hero of their own book.</em></h1>
              <p className="shop-hero-description">Pick a story or bring your own. Add your child, their favourite people and even the family pet. We turn it into a 20-page illustrated book you can wrap for Christmas.</p>
              {from && <div className="shop-price">
                <p className="shop-hero-price">From <Price cents={from.priceCents} was={from.wasCents} /></p>
                {from.shippingCents === 0 && <small>Ireland shipping included</small>}
                {info?.sale && <small>{SALE_SCOPE}</small>}
              </div>}
              <div className="shop-actions">
                <Link href="/create" className="btn btn-primary">Make their book <ArrowRight size={19} aria-hidden="true" /></Link>
                <button type="button" className="btn shop-sample-button" onClick={() => setReading(featured)}><BookOpen size={18} aria-hidden="true" /> Look inside a sample</button>
              </div>
              <div className="shop-hero-details">
                <p className="shop-hero-includes"><CheckCircle2 size={18} aria-hidden="true" /> You approve every page. The PDF is included.</p>
                <a className="shop-reviews-link" href="#reviews">Customer reviews</a>
              </div>
              {info && !canOrder && <p className="shop-request-note">Send your book request and we’ll confirm timing and payment by email.</p>}
            </div>
          </div>
        </section>

        <section className="shop-benefits" aria-label="What comes with your book">
          <ul className="wrap">
            <li><Gift size={24} aria-hidden="true" /><div><strong>A book only they could star in</strong><span>Their name, their favourite people and even their pet.</span></div></li>
            <li><CheckCircle2 size={24} aria-hidden="true" /><div><strong>See it before we print</strong><span>Approve the full book or ask for changes first.</span></div></li>
            <li><BookOpen size={24} aria-hidden="true" /><div><strong>A printed gift and a PDF</strong><span>Choose softcover or hardcover and keep the digital copy.</span></div></li>
          </ul>
        </section>

        <section className="shop-proof" id="reviews" aria-labelledby="reviews-title">
          <div className="wrap">
            <div className="shop-proof-grid">
              <div>
                <h2 id="reviews-title">What families say</h2>
                {info?.reviews && (
                  <p className="shop-review-rating"><strong>{info.reviews.average.toFixed(1)} out of 5</strong> from {info.reviews.count} {info.reviews.count === 1 ? "review" : "reviews"}</p>
                )}
                {!reviews.length && !info?.reviews && <p>Reviews from families will appear here as they’re published.</p>}
              </div>
              {!reviews.length && (
                <button type="button" className="btn btn-primary" onClick={() => setReading("sock-dragon")}><BookOpen size={18} aria-hidden="true" /> Read a sample while you’re here</button>
              )}
            </div>
            {reviews.length > 0 && (
              <div className="reviews">
                {reviews.slice(0, 3).map((review) => (
                  <figure className="review" key={review.id}>
                    <div className="stars" aria-label={`${review.rating} out of 5`}>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</div>
                    <blockquote>{review.body}</blockquote>
                    <figcaption>{review.display_name}{review.verified && <span className="verified"> · Verified purchase</span>}</figcaption>
                  </figure>
                ))}
              </div>
            )}
            <div className="shop-review-invite">
              <p><strong>Already read your book together?</strong> Open your private order link and choose <strong>Leave a review</strong> after delivery.</p>
              <Link href="/contact?topic=review" className="btn btn-line btn-sm">Help finding my order link</Link>
            </div>
          </div>
        </section>

        <section className="shop-section shop-process" id="how" aria-labelledby="process-title">
          <div className="wrap">
            <h2 id="process-title">From your idea to their bookshelf</h2>
            <ol>
              <li><h3>Share your idea</h3><p>Choose a story or tell us what should happen. Add their name, a photo or description, and even the family pet.</p></li>
              <li><h3>Check every page</h3><p>We write and illustrate the book, then email you a private PDF proof. Approve it or tell us what to change.</p></li>
              <li><h3>Get their printed book</h3><p>Once you approve, we print and post your softcover or hardcover. The approved PDF is yours to keep.</p></li>
            </ol>
            <div className="shop-actions"><Link href="/create" className="btn btn-primary">Start their book <ArrowRight size={18} aria-hidden="true" /></Link></div>
          </div>
        </section>

        <section className="shop-section shop-library" id="samples" aria-labelledby="library-title">
          <div className="wrap">
            <div className="shop-section-heading">
              <h2 id="library-title">Pick an adventure. Make it theirs.</h2>
              <p>Read the illustrated samples, then choose the story you want us to personalise.</p>
            </div>
            <div className="shop-shelf">
              {STORIES.map((story) => (
                <article className="shop-book" key={story.id}>
                  <button type="button" className="shop-cover-button" onClick={() => setReading(story.id)} aria-label={`Look inside ${story.sampleTitle}`}>
                    <span className="shop-book-object"><Cover story={story.id} /></span>
                  </button>
                  <p className="shop-book-age">{story.ages}</p>
                  <h3>{story.sampleTitle}</h3>
                  <div className="shop-book-links">
                    <Link href={`/create?route=preset&story=${story.id}`} className="btn btn-primary btn-sm">Make this book <ArrowRight size={14} aria-hidden="true" /></Link>
                    <button type="button" className="btn-link" onClick={() => setReading(story.id)}>Look inside</button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="shop-section shop-custom" id="personalise" aria-labelledby="custom-title">
          <div className="wrap shop-custom-grid">
            {photos.length > 0 && (
              <div className="shop-lifestyle shop-photo-board">
                {photos.map((photo) => (
                  <img key={photo.assetId} src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} loading="lazy" />
                ))}
              </div>
            )}
            <div>
              <h2 id="custom-title">A story only you could give.</h2>
              <p>That phrase they say every five minutes? The dog who steals their socks? Tell us about the little things that make them <em>them</em>, and we’ll find a place for them in the story.</p>
              <ul className="shop-details">
                <li><Heart size={20} aria-hidden="true" /> Give your child the starring role and add a dedication.</li>
                <li><PawPrint size={20} aria-hidden="true" /> Add a pet, sibling or another character for {info ? euro(info.extraCharacterCents) : "€5"} each.</li>
                <li><Sparkles size={20} aria-hidden="true" /> Share a reference photo or describe how they look.</li>
              </ul>
              <div className="shop-actions">
                <Link href="/create?route=custom" className="btn btn-primary">Dream up a story <ArrowRight size={18} aria-hidden="true" /></Link>
                <Link href="/create?route=preset" className="shop-text-link">Personalise a favourite <ArrowRight size={15} aria-hidden="true" /></Link>
              </div>
            </div>
          </div>
        </section>

        <section className="shop-section shop-style" aria-labelledby="style-title">
          <div className="wrap shop-style-grid">
            <div className="shop-style-image" key={style}>
              <GalleryArt style={style} label={`Picture book illustration in ${activeStyle.name.toLowerCase()}`} />
            </div>
            <div>
              <h2 id="style-title">Pick an illustration style.</h2>
              <p>Every story is available in seven styles. Choose the one they’ll love to look at again and again.</p>
              <div className="shop-style-options" aria-label="Illustration styles" role="group">
                {STYLES.map((option) => (
                  <button key={option.id} type="button" aria-pressed={style === option.id} onClick={() => setStyle(option.id)}>
                    {option.name}
                  </button>
                ))}
              </div>
              <p className="shop-style-description" aria-live="polite">{activeStyle.line}</p>
              <div className="shop-actions"><Link href="/create" className="btn btn-primary">Create my storybook <ArrowRight size={18} aria-hidden="true" /></Link></div>
            </div>
          </div>
        </section>

        <section className="shop-section shop-delivery" id="delivery" aria-labelledby="delivery-title">
          <div className="wrap">
            <div className="shop-section-heading"><h2 id="delivery-title">Choose softcover or hardcover</h2><p>Every printed book includes the approved PDF. You can download it from your private order page.</p></div>
            <div className="shop-formats">
              {([
                { id: "softcover", label: "Softcover", text: "A flexible cover for bedtime rereads." },
                { id: "hardback", label: "Hardcover", text: "A rigid cover for a book they’ll want to keep." },
              ] as const).map(({ id, label, text }) => {
                const format = info?.formats.find((item) => item.id === id);
                const base = info?.formats.find((item) => item.id === "softcover");
                const upgrade = id === "hardback" && format && base ? format.priceCents - base.priceCents : 0;
                return (
                  <article className={`shop-format shop-format-${id}`} key={id}>
                    <div className="shop-format-book" aria-hidden="true"><Cover story={id === "softcover" ? "little-wonders" : "moonlight-delivery"} /></div>
                    <div className="shop-format-copy">
                      <h3>{label}</h3>
                      <p>{text}</p>
                      {format && <>
                        <p>{upgrade > 0 ? <>+{euro(upgrade)} hardcover upgrade</> : <Price cents={format.priceCents} was={format.wasCents} label={format.saleLabel} />}{!!format.shippingCents && <> + {euro(format.shippingCents)} shipping</>}</p>
                        {format.specs.length > 0 && <p>{format.specs.join(". ")}.</p>}
                        {format.shipping && <p>{format.shipping}</p>}
                        {format.turnaround && <p>{format.turnaround}</p>}
                        {christmas && format.christmasCutoff && <p>Christmas orders close {new Date(format.christmasCutoff + "T12:00:00").toLocaleDateString("en-IE", { day: "numeric", month: "long" })}.</p>}
                      </>}
                      {id === "softcover" ? <Link className="btn btn-primary btn-sm" href="/create">Make their book <ArrowRight size={15} aria-hidden="true" /></Link>
                        : <p>Choose hardcover at the end of personalisation.</p>}
                    </div>
                  </article>
                );
              })}
            </div>
            {info?.sale && <p className="sale-note">{SALE_SCOPE}</p>}
            {info?.taxNote && <p className="sale-note">{info.taxNote}</p>}
          </div>
        </section>

        <section className="shop-section shop-about" id="about" aria-labelledby="about-title">
          <div className="wrap shop-maker">
            <img src="/books-art/victor-portrait.webp" alt="Victor Miranda" width={104} height={104} loading="lazy" />
            <div>
              <h2 id="about-title">Meet Victor, the maker behind Little Plot Books</h2>
              <p>I’m Victor Miranda. I make personalised picture books from the ideas and little details only you know about your child. You bring the story idea, and I’ll turn it into a book you can read together.</p>
            </div>
          </div>
        </section>

        <section className="shop-section shop-final" aria-labelledby="final-title">
          <div className="wrap">
            <h2 id="final-title">Give them a book with their name on the cover.</h2>
            <div className="shop-actions">
              <Link href="/create" className="btn btn-primary">Make their book <ArrowRight size={18} aria-hidden="true" /></Link>
              <Link href="/contact" className="shop-text-link">Ask us a question</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      {reading && (
        <SampleReader story={reading} onClose={closeReader} footer={
          <div className="shop-reader-actions">
            <Link href={`/create?route=preset&story=${reading}`} className="btn btn-primary btn-sm">Personalise this story</Link>
          </div>
        } />
      )}
    </div>
  );
}
