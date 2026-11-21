/**
 * Consent-aware ad measurement and campaign attribution for /books.
 *
 * Uses the site's shared Meta Pixel consent choice (the same localStorage key
 * as /landing-pages/), so a visitor answers once for the whole site. The
 * Pixel loads only after "Accept". Ad events never carry form values.
 */

/** The site's existing Pixel. Change here if Little Plot Books gets its own. */
export const META_PIXEL_ID = "29511278675176705";
export const CONSENT_KEY = "method_meta_consent_v1";
const ATTR_KEY = "lpb_attribution_v1";
const UTM = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

declare global {
  interface Window {
    fbq?: ((...args: unknown[]) => void) & { callMethod?: (...a: unknown[]) => void; queue?: unknown[]; push?: unknown; loaded?: boolean; version?: string };
    _fbq?: unknown;
  }
}

export type Consent = "accepted" | "rejected" | null;

export function getConsent(): Consent {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === "accepted" || v === "rejected" ? v : null;
  } catch {
    return null;
  }
}

export function setConsent(v: "accepted" | "rejected") {
  try {
    localStorage.setItem(CONSENT_KEY, v);
  } catch {
    /* storage blocked: the choice lasts for this visit only */
  }
}

let pixelLoaded = false;

export function loadPixel() {
  if (pixelLoaded || getConsent() !== "accepted") return;
  pixelLoaded = true;
  if (!window.fbq) {
    const f = function (...args: unknown[]) {
      f.callMethod ? f.callMethod(...args) : f.queue!.push(args);
    } as NonNullable<Window["fbq"]>;
    window.fbq = f;
    if (!window._fbq) window._fbq = f;
    f.push = f;
    f.loaded = true;
    f.version = "2.0";
    f.queue = [];
    const s = document.createElement("script");
    s.async = true;
    s.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(s);
  }
  window.fbq("init", META_PIXEL_ID);
  window.fbq("track", "PageView");
}

export function pixelIsLoaded() {
  return pixelLoaded;
}

/** Counts a Lead. Call only after the server confirmed the signup. No form values. */
export function trackLead() {
  if (getConsent() !== "accepted" || !window.fbq) return;
  try {
    window.fbq("track", "Lead", { content_name: "Little Plot Books launch list" });
  } catch {
    /* never let measurement break the page */
  }
}

/** fbclid from the landing URL. Kept in memory and sent only with consent. */
let landingFbclid = "";

/** Remembers first-touch UTM tags for this visit, so a signup further down the page still carries them. */
export function captureAttribution() {
  try {
    const params = new URLSearchParams(location.search);
    landingFbclid = (params.get("fbclid") || "").slice(0, 500);
    if (sessionStorage.getItem(ATTR_KEY)) return;
    const found: Record<string, string> = {};
    for (const k of UTM) {
      const v = params.get(k);
      if (v) found[k] = v.slice(0, 150);
    }
    if (Object.keys(found).length) sessionStorage.setItem(ATTR_KEY, JSON.stringify(found));
  } catch {
    /* storage blocked: attribution is optional */
  }
}

export function getAttribution(): Record<string, string> {
  let out: Record<string, string> = {};
  try {
    out = JSON.parse(sessionStorage.getItem(ATTR_KEY) || "{}");
  } catch {
    out = {};
  }
  if (landingFbclid && getConsent() === "accepted") out.fbclid = landingFbclid;
  return out;
}
