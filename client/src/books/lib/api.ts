import { useEffect, useState } from "react";
import type { FormatId, PublicSettings } from "@shared/books/catalog";

export class ApiError extends Error {
  constructor(message: string, readonly status: number, readonly body: Record<string, unknown>) {
    super(message);
  }
}

export async function api<T = Record<string, unknown>>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const { json, ...rest } = init;
  const res = await fetch(path, {
    credentials: "same-origin",
    ...rest,
    headers: { ...(json !== undefined ? { "Content-Type": "application/json" } : {}), ...(rest.headers || {}) },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });
  const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) throw new ApiError(String(body.error || "Something went wrong. Please try again."), res.status, body);
  return body as T;
}

export type ShopInfo = PublicSettings & {
  reviews: { count: number; average: number } | null;
  methods: { id: "stripe" | "paypal" | "test"; label: string; note: string }[];
  testMode: boolean;
  photoUploads: boolean;
};

let cached: Promise<ShopInfo | null> | null = null;
export function useShop(): ShopInfo | null {
  const [s, setS] = useState<ShopInfo | null>(null);
  useEffect(() => {
    cached ??= api<ShopInfo>("/api/books/settings").catch(() => null);
    cached.then(setS);
  }, []);
  return s;
}
export function refreshShop() { cached = null; }

/** Client-side mirror of the server quote, for display only. The server recalculates at checkout. */
export function clientQuote(info: ShopInfo, format: FormatId | undefined, extras: number) {
  const f = info.formats.find((x) => x.id === format) ?? info.formats[0];
  if (!f) return null;
  const n = Math.max(0, Math.min(info.maxExtraCharacters, extras));
  const extrasCents = n * info.extraCharacterCents;
  const shippingCents = f.shippingCents ?? 0;
  return { format: f, bookCents: f.priceCents, wasCents: f.wasCents, saleLabel: f.saleLabel, extras: n, extrasCents, shippingCents, totalCents: f.priceCents + extrasCents + shippingCents };
}

/** The lowest current book price, for "from" lines. */
export function fromPrice(info: ShopInfo) {
  return [...info.formats].sort((a, b) => a.priceCents - b.priceCents)[0] ?? null;
}

export function useTitle(title: string) {
  useEffect(() => { document.title = title; }, [title]);
}

export function useReducedMotion(): boolean {
  const [r, setR] = useState(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setR(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return r;
}
