import { useEffect, useMemo, useState } from "react";

/**
 * Project media conventions.
 *
 * Every project owns one folder under client/public/media/projects/<id>/.
 * Drop files in with these exact names and the site picks them up with no
 * code change. Anything missing renders a clearly marked placeholder instead
 * of a broken image.
 *
 *   preview.mp4    looping muted screen recording, the main card preview
 *   preview.webm   optional smaller companion, served first when present
 *   poster.jpg     the still frame shown at rest (falls back to shot-1.jpg)
 *   shot-1.jpg     gallery screenshot 1
 *   ...            up to shot-6.jpg
 */

export const MEDIA_ROOT = "/media/projects";

/** Gallery slots wired up in advance for every project. */
export const SHOT_SLOTS = 6;

/** Slots always drawn, as placeholders when the file is not there yet. */
export const MIN_VISIBLE_SHOTS = 3;

export type MediaState = "pending" | "ready" | "missing";

export interface ShotSlot {
  /** Public URL of the file. */
  src: string;
  /** Path to show the user in a placeholder, relative to client/public. */
  hint: string;
  /** Caption under the shot. */
  label: string;
  /** 1-based slot number. */
  slot: number;
}

export interface PreviewSources {
  webm: string;
  mp4: string;
  poster: string;
  posterFallback: string;
}

/**
 * Captions per gallery slot, in order. Slots beyond this list still work and
 * fall back to a generic caption, so extra screenshots need no code change.
 */
const SHOT_LABELS: Record<string, readonly string[]> = {
  onishi: [
    "Team dashboard",
    "Roster builder",
    "Sales-per-hour leaderboard",
    "Hours and overtime tracking",
  ],
  "method-chat": [
    "The widget on a live site",
    "Assistant persona settings",
    "Captured leads",
    "Channel integrations",
  ],
  orbit: [
    "The Now screen",
    "Focus mode",
    "Capture and the Inbox",
    "Calendar and mind map",
  ],
  "last-human-job": [
    "Conversion-focused landing page",
    "The offer section",
    "Stripe checkout",
    "Gated delivery after purchase",
  ],
};

function labelFor(projectId: string, slot: number): string {
  return SHOT_LABELS[projectId]?.[slot - 1] ?? `Screen ${slot}`;
}

/** Every gallery slot wired up for a project, whether the file exists or not. */
export function shotSlots(projectId: string): ShotSlot[] {
  return Array.from({ length: SHOT_SLOTS }, (_unused, i) => {
    const slot = i + 1;
    return {
      slot,
      src: `${MEDIA_ROOT}/${projectId}/shot-${slot}.jpg`,
      hint: `media/projects/${projectId}/shot-${slot}.jpg`,
      label: labelFor(projectId, slot),
    };
  });
}

export function previewSources(projectId: string): PreviewSources {
  const base = `${MEDIA_ROOT}/${projectId}`;
  return {
    webm: `${base}/preview.webm`,
    mp4: `${base}/preview.mp4`,
    poster: `${base}/poster.jpg`,
    posterFallback: `${base}/shot-1.jpg`,
  };
}

/**
 * A missing public file is answered by the SPA fallback with index.html and a
 * 200, so the status code alone proves nothing. Check the content type too.
 */
async function probe(url: string, signal: AbortSignal): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "HEAD", signal, cache: "force-cache" });
    if (!res.ok) return false;
    const type = res.headers.get("content-type") ?? "";
    return type.startsWith("image/") || type.startsWith("video/");
  } catch {
    return false;
  }
}

/**
 * Resolve which of the given files actually exist. HEAD requests only, so
 * probing costs no image or video bytes and the real elements stay lazy.
 */
export function useMediaAvailability(urls: readonly string[]): Record<string, MediaState> {
  const key = urls.join("|");
  const [state, setState] = useState<Record<string, MediaState>>({});

  useEffect(() => {
    const list = key ? key.split("|") : [];
    const controller = new AbortController();
    let live = true;

    setState(Object.fromEntries(list.map((url) => [url, "pending" as MediaState])));

    void Promise.all(
      list.map(async (url) => {
        const ok = await probe(url, controller.signal);
        if (!live) return;
        setState((prev) => ({ ...prev, [url]: ok ? "ready" : "missing" }));
      }),
    );

    return () => {
      live = false;
      controller.abort();
    };
  }, [key]);

  return state;
}

/** Subset of the Network Information API we rely on, typed rather than cast loose. */
interface NetworkInformationLike {
  saveData?: boolean;
  effectiveType?: string;
  type?: string;
  addEventListener?: (type: string, listener: () => void) => void;
  removeEventListener?: (type: string, listener: () => void) => void;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformationLike;
  mozConnection?: NetworkInformationLike;
  webkitConnection?: NetworkInformationLike;
}

function connectionOf(): NetworkInformationLike | undefined {
  if (typeof navigator === "undefined") return undefined;
  const nav = navigator as NavigatorWithConnection;
  return nav.connection ?? nav.mozConnection ?? nav.webkitConnection;
}

const FRUGAL_TYPES = new Set(["slow-2g", "2g", "3g"]);

function readMeteredNow(): boolean {
  const conn = connectionOf();
  if (!conn) return false;
  if (conn.saveData === true) return true;
  if (conn.type === "cellular") return true;
  return conn.effectiveType !== undefined && FRUGAL_TYPES.has(conn.effectiveType);
}

/**
 * True when the visitor is on mobile data, an explicitly metered link, or has
 * asked for data saving. Video never autoplays in that state.
 */
export function useMeteredConnection(): boolean {
  const [metered, setMetered] = useState(false);

  useEffect(() => {
    const update = () => setMetered(readMeteredNow());
    update();
    const conn = connectionOf();
    conn?.addEventListener?.("change", update);
    return () => conn?.removeEventListener?.("change", update);
  }, []);

  return metered;
}

/** True on a device with a real hovering pointer, so a mouse and not a finger. */
export function useHoverPointer(): boolean {
  const [hoverable, setHoverable] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setHoverable(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  return hoverable;
}

/** True when the visitor has asked the system to cut motion down. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  return reduced;
}

/**
 * The gallery shows every screenshot that exists, and pads out to
 * MIN_VISIBLE_SHOTS with placeholders so an empty project still reads as a
 * gallery rather than a gap.
 */
export function useVisibleShots(projectId: string): {
  shots: ShotSlot[];
  states: Record<string, MediaState>;
  resolved: boolean;
} {
  const all = useMemo(() => shotSlots(projectId), [projectId]);
  const urls = useMemo(() => all.map((s) => s.src), [all]);
  const states = useMediaAvailability(urls);

  const resolved = all.every((s) => states[s.src] !== undefined && states[s.src] !== "pending");

  const lastReady = all.reduce(
    (acc, s) => (states[s.src] === "ready" ? s.slot : acc),
    0,
  );
  const count = Math.max(MIN_VISIBLE_SHOTS, lastReady);

  return { shots: all.slice(0, count), states, resolved };
}
