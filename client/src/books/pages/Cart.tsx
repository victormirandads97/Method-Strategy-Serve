import { useEffect, useState, type FormEvent } from "react";
import { Link } from "wouter";
import { euro, LIMITS, type Quote } from "@shared/books/catalog";
import { Footer, Header } from "../components/Chrome";
import { api, useShop, useTitle } from "../lib/api";

interface CartItem { id: string; title: string; style: string; available: boolean; price: Quote }

export default function Cart() {
  useTitle("Your cart · Little Plot Books");
  const info = useShop();
  const [items, setItems] = useState<CartItem[] | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const response = await api<{ items: CartItem[] }>("/api/books/cart");
    setItems(response.items);
  }
  useEffect(() => {
    load().catch(() => setError("We couldn't load your cart. Refresh the page to try again."));
  }, []);

  const total = items?.reduce((sum, item) => sum + item.price.totalCents, 0) ?? 0;
  async function change(payload: { action: "remove"; id: string } | { action: "submit" }) {
    setBusy(true);
    setError(null);
    try {
      if (payload.action === "submit") {
        await api("/api/books/cart", { method: "POST", json: { ...payload, email, name, totalCents: total, items: items?.map(({ id }) => id) } });
        setItems([]);
        setSent(true);
      } else {
        await api("/api/books/cart", { method: "POST", json: payload });
        await load();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Try again.");
      await load().catch(() => undefined);
    } finally {
      setBusy(false);
    }
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!busy) void change({ action: "submit" });
  }
  const basePrice = info?.formats.find((format) => format.id === "softcover")?.priceCents;
  return <>
    <Header info={info} minimal />
    <main className="wrap narrow cart-page" id="main">
      <h1 className="h2">{sent ? "Your book request is in" : "Your cart"}</h1>
      {error && <p role="alert" className="note note-err">{error}</p>}
      {sent ? <p className="lede" role="status">We’ll email {email} to confirm delivery timing and arrange payment. No payment has been taken.</p>
        : items === null ? !error && <p role="status">Loading your books…</p>
        : !items.length ? <p className="lede">Your cart is empty. Make a storybook to add your first book.</p>
        : <>
          <p className="lede">Each book has its own story, characters and cover.</p>
          <div style={{ display: "grid", gap: 12, marginBlock: 20 }}>
            {items.map(({ id, title, style, available, price }) => {
              const upgrade = price.format === "hardback" && basePrice !== undefined ? Math.max(0, price.bookCents - basePrice) : 0;
              return <article className="card cart-item" key={id}>
                <div>
                  <h2>{title}</h2>
                  <p>{style} · {price.format === "hardback" ? "Hardcover" : "Softcover"}</p>
                  {!available && <p className="err">This cover is currently unavailable.</p>}
                  <button type="button" className="btn-link" disabled={busy} onClick={() => change({ action: "remove", id })} aria-label={`Remove ${title}`}>Remove</button>
                </div>
                <div className="lines">
                  <div><span>Book</span><span>{euro(price.bookCents - upgrade)}</span></div>
                  {upgrade > 0 && <div><span>Hardcover upgrade</span><span>+{euro(upgrade)}</span></div>}
                  {price.extraCharacters > 0 && <div><span>{price.extraCharacters} extra × {euro(price.extraCharacterCents)}</span><span>{euro(price.extrasCents)}</span></div>}
                  <div><span>Ireland shipping</span><span>{price.shippingCents ? euro(price.shippingCents) : "Included"}</span></div>
                  <div className="total"><span>Book total</span><span>{euro(price.totalCents)}</span></div>
                </div>
              </article>;
            })}
          </div>
          <form className="card" onSubmit={submit}>
            <div className="lines"><div className="total"><span>Cart total</span><span>{euro(total)}</span></div></div>
            <div className="field"><label htmlFor="cart-name">Your first name <span className="opt">(optional)</span></label><input id="cart-name" className="input" autoComplete="given-name" value={name} maxLength={LIMITS.name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="field"><label htmlFor="cart-email">Your email</label><input id="cart-email" className="input" type="email" autoComplete="email" required value={email} maxLength={LIMITS.email} onChange={(e) => setEmail(e.target.value)} /></div>
            <button className="btn btn-primary btn-block" disabled={busy || items.some((item) => !item.available)}>{busy ? "Working…" : "Send book request"}</button>
            <p className="hint">We’ll confirm delivery and payment by email.</p>
          </form>
        </>}
      <div className="toolbar" style={{ marginTop: 18 }}>
        {!sent && <Link href="/create" className="btn btn-line">{items?.length ? "Make another book" : "Make their book"}</Link>}
        <Link href="/" className="btn-link">Back to the shop</Link>
      </div>
    </main>
    <Footer />
  </>;
}
