import { useState } from "react";
import { ArrowRight, BookOpen, Gift, Pause, Play, ShoppingBag, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { BRAND } from "@shared/books/catalog";
import type { ShopInfo } from "../lib/api";

export function LogoIcon({ dark = false }: { dark?: boolean }) {
  return <img className="logo-icon" src={dark ? "/books-brand/icon-dark.svg" : "/books-brand/icon.svg"} alt="" width={38} height={38} />;
}

/** A small hand-drawn star for the Christmas treatment. */
export function DrawnStar({ size = 22, style }: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg className="xmas-star" width={size} height={size} viewBox="0 0 40 40" style={style} aria-hidden="true">
      <path d="M20 4c1.2 5.6 2.4 9.6 5 11.4 2.8 1.9 6.6 2.4 11 3.1-4.6 1-8.4 1.9-10.6 4.2-2.1 2.3-3.4 6.5-5 12.3-1.3-5.8-2.6-10-4.9-12.3C13.2 20.4 9.4 19.6 4 18.6c5.2-.9 9-1.4 11.3-3.2C17.6 13.6 18.8 9.6 20 4z" fill="#C9A24B" stroke="#8C6E2A" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}

export function Announcement({ info, loop = false }: { info: ShopInfo | null; loop?: boolean }) {
  const [paused, setPaused] = useState(false);
  const sale = info?.sale;
  const holiday = info?.christmas.enabled ? info.christmas.announcement : null;
  const message = sale ? `${sale.label} on eligible printed books` : holiday ?? "Make your family the stars of a printed storybook";
  if (!loop) {
    if (!sale && !holiday) return null;
    return <div className="announce" aria-label={sale ? "Book promotion" : "Christmas"}>{sale ? <a href="/books/#delivery">{message}</a> : message}</div>;
  }

  const group = () => (
    <div className="store-ribbon-group">
      <span><Gift size={16} /> {message}</span>
      <span><BookOpen size={16} /> Approve every page before printing</span>
      <span><Sparkles size={16} /> Printed softcover or hardcover</span>
    </div>
  );
  return (
    <div className="store-ribbon" data-paused={paused}>
      <a className="store-ribbon-link" href="/books/#delivery" aria-label={`${message}. See book formats and pricing.`}>
        <div aria-hidden="true" className="store-ribbon-track">{group()}{group()}{group()}{group()}</div>
      </a>
      <button className="store-ribbon-toggle" type="button" aria-label={paused ? "Play announcement" : "Pause announcement"} onClick={() => setPaused(!paused)}>
        {paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
      </button>
    </div>
  );
}

export function Header({ info, minimal = false, shop = false }: { info?: ShopInfo | null; minimal?: boolean; shop?: boolean }) {
  return (
    <>
      {shop ? <Announcement info={info ?? null} loop /> : info && <Announcement info={info} />}
      <header className={shop ? "site-header store-header" : "site-header"}>
        <div className="wrap">
          <Link href="/" className="logo" aria-label={`${BRAND}, home`}>
            <LogoIcon dark={shop} />
            <span className="logo-word">{BRAND}</span>
          </Link>
          {!minimal && <nav className="nav" aria-label="Main">
            <a className="nav-link" href="/books/#samples">Look inside</a>
            <a className="nav-link" href="/books/#how">How it works</a>
            <Link className="btn btn-primary btn-sm" href="/create">Make their book {shop && <ArrowRight size={16} aria-hidden="true" />}</Link>
            <a className="nav-link" href="/books/#delivery">Formats &amp; pricing</a>
            <a className="nav-link" href="/books/#about">About</a>
          </nav>}
          <Link href="/cart" className="site-cart-link"><ShoppingBag size={17} aria-hidden="true" /> Cart</Link>
        </div>
      </header>
    </>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <span>© {new Date().getFullYear()} {BRAND}</span>
        <nav aria-label="Footer">
          <Link href="/contact">Contact</Link>
          <Link href="/owner">Owner dashboard</Link>
        </nav>
      </div>
    </footer>
  );
}
