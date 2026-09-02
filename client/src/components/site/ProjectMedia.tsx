import { useCallback, useEffect, useRef, useState } from "react";
import { B } from "@/lib/brand";
import {
  previewSources,
  useHoverPointer,
  useMediaAvailability,
  useMeteredConnection,
  useReducedMotion,
  useVisibleShots,
  type ShotSlot,
} from "@/lib/project-media";

// Same tokens the landing page maps onto the brand palette.
const C = {
  bg: B.black,
  panel: B.ink,
  elev: B.panel,
  accent: B.blueBright,
  text: B.cream,
  soft: B.creamSoft,
  muted: B.muted,
  border: B.border,
  green: B.green,
  amber: B.amber,
  red: B.red,
} as const;

const MONO: React.CSSProperties = { fontFamily: "'JetBrains Mono', monospace" };
const LBL: React.CSSProperties = {
  ...MONO,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.2em",
};

// ── Browser frame ─────────────────────────────────────────────────────────────

export function BrowserFrame({ url, children, style: s }: {
  url?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div style={{
      border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden",
      background: C.elev, boxShadow: "0 20px 50px rgba(0,0,0,0.4)", ...s,
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: "0.5rem",
        padding: "0.55rem 0.85rem", borderBottom: `1px solid ${C.border}`,
        background: C.panel,
      }}>
        <div style={{ display: "flex", gap: 5 }}>
          {[C.red, C.amber, C.green].map((c) => (
            <span key={c} style={{ width: 9, height: 9, borderRadius: "50%", background: c, opacity: 0.7 }} />
          ))}
        </div>
        {url && (
          <div style={{
            flex: 1, marginLeft: "0.35rem", background: C.bg,
            border: `1px solid ${C.border}`, borderRadius: 5,
            padding: "0.2rem 0.6rem", ...MONO, fontSize: "0.62rem", color: C.muted,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {url}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

/**
 * Screenshot cropped to a consistent window, aligned to the top of the app.
 * The image fills the window rather than sitting at its natural aspect ratio,
 * so a narrow phone viewport does not leave a band of empty panel underneath.
 */
export function Shot({ src, alt, height }: { src: string; alt: string; height: number | string }) {
  return (
    <div style={{ height, overflow: "hidden", background: C.bg }}>
      <img src={src} alt={alt} loading="lazy" decoding="async"
        style={{ width: "100%", height: "100%", display: "block",
          objectFit: "cover", objectPosition: "top" }} />
    </div>
  );
}

// ── Placeholder ───────────────────────────────────────────────────────────────

/** Shown wherever a media file is not in the repo yet. Names the file to drop in. */
export function MediaPlaceholder({ hint, note, height }: {
  hint: string;
  note?: string;
  height: number | string;
}) {
  return (
    <div style={{
      height, minHeight: 96, background: C.bg,
      border: `1px dashed ${C.border}`, borderRadius: 8,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: "0.5rem", padding: "1rem", textAlign: "center",
    }}>
      <svg viewBox="0 0 24 24" style={{ width: 22, height: 22, opacity: 0.55 }} aria-hidden="true">
        <rect x="3" y="4" width="18" height="16" rx="2" fill="none" stroke={C.muted} strokeWidth="1.4" />
        <path d="M3 16l5-5 4 4 3-3 6 6" fill="none" stroke={C.muted} strokeWidth="1.4"
          strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9" cy="9" r="1.4" fill={C.muted} />
      </svg>
      <p style={{ ...LBL, fontSize: "0.5rem", color: C.accent, margin: 0 }}>MEDIA PLACEHOLDER</p>
      <p style={{ ...MONO, fontSize: "0.62rem", color: C.soft, margin: 0, wordBreak: "break-all", lineHeight: 1.5 }}>
        {hint}
      </p>
      {note && (
        <p style={{ ...MONO, fontSize: "0.58rem", color: C.muted, margin: 0, lineHeight: 1.5 }}>
          {note}
        </p>
      )}
    </div>
  );
}

// ── Viewport gate ─────────────────────────────────────────────────────────────

/** True once the element has come within a screen of the viewport, then stays true. */
function useNearViewport(ref: React.RefObject<HTMLElement | null>, rootMargin = "300px"): boolean {
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setNear(true);
      return;
    }
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        setNear(true);
        io.disconnect();
      }
    }, { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin]);

  return near;
}

// ── Play affordance ───────────────────────────────────────────────────────────

function PlayBadge({ playing, label, onToggle }: {
  playing: boolean;
  label: string;
  onToggle: (e: React.MouseEvent) => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={label}
      style={{
        position: "absolute", left: "0.65rem", bottom: "0.65rem", zIndex: 2,
        display: "inline-flex", alignItems: "center", gap: "0.4rem",
        background: "rgba(14,14,16,0.78)", border: `1px solid ${C.accent}55`,
        borderRadius: 999, padding: "0.32rem 0.7rem", cursor: "pointer",
        color: C.text, backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)",
      }}>
      <svg viewBox="0 0 24 24" style={{ width: 11, height: 11 }} aria-hidden="true">
        {playing ? (
          <>
            <rect x="7" y="5" width="3.4" height="14" rx="1" fill={C.accent} />
            <rect x="13.6" y="5" width="3.4" height="14" rx="1" fill={C.accent} />
          </>
        ) : (
          <path d="M8 5.5l11 6.5-11 6.5z" fill={C.accent} />
        )}
      </svg>
      <span style={{ ...LBL, fontSize: "0.46rem", color: C.text }}>
        {playing ? "PAUSE" : "PLAY"}
      </span>
    </button>
  );
}

// ── Project preview ───────────────────────────────────────────────────────────

export interface ProjectPreviewProps {
  projectId: string;
  name: string;
  height: number;
  frameUrl?: string;
  /** Built-in animated demo, used when no real media has been added yet. */
  fallback?: React.ReactNode;
}

/**
 * The main card preview. A looping muted recording where one exists, playing on
 * hover with a mouse and on tap with a finger, resting on a static poster frame.
 * Video is never autoplayed on a metered connection or on a touch device.
 */
export function ProjectPreview({ projectId, name, height, frameUrl, fallback }: ProjectPreviewProps) {
  const src = previewSources(projectId);
  const states = useMediaAvailability([src.webm, src.mp4, src.poster, src.posterFallback]);
  const hoverable = useHoverPointer();
  const metered = useMeteredConnection();
  const reducedMotion = useReducedMotion();

  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const near = useNearViewport(wrapRef);

  const [playing, setPlaying] = useState(false);
  const [videoBroken, setVideoBroken] = useState(false);

  const hasWebm = states[src.webm] === "ready";
  const hasMp4 = states[src.mp4] === "ready";
  const hasVideo = (hasWebm || hasMp4) && !videoBroken;
  const posterSrc =
    states[src.poster] === "ready" ? src.poster
    : states[src.posterFallback] === "ready" ? src.posterFallback
    : undefined;

  const resolved = [src.webm, src.mp4, src.poster, src.posterFallback]
    .every((u) => states[u] !== undefined && states[u] !== "pending");

  // Autoplay is for a hovering pointer on an unmetered link only.
  const mayAutoplay = hoverable && !metered && !reducedMotion;

  const play = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    void el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }, []);

  const stop = useCallback((rewind: boolean) => {
    const el = videoRef.current;
    if (!el) return;
    el.pause();
    if (rewind) el.currentTime = 0;
    setPlaying(false);
  }, []);

  const toggle = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (playing) stop(false); else play();
  }, [playing, play, stop]);

  // Stop playing once the preview scrolls away, so nothing decodes off screen.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el || !hasVideo || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver((entries) => {
      if (entries.every((entry) => !entry.isIntersecting)) stop(false);
    }, { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, [hasVideo, stop]);

  let body: React.ReactNode;

  if (!resolved) {
    body = <div style={{ height, background: C.bg }} />;
  } else if (hasVideo) {
    body = (
      <div
        style={{ position: "relative", height, background: C.bg }}
        onMouseEnter={mayAutoplay ? play : undefined}
        onMouseLeave={mayAutoplay ? () => stop(true) : undefined}>
        {near && (
          <video
            ref={videoRef}
            muted
            loop
            playsInline
            preload={mayAutoplay ? "metadata" : "none"}
            poster={posterSrc}
            aria-label={`${name} screen recording`}
            onError={() => setVideoBroken(true)}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            style={{ width: "100%", height: "100%", display: "block", objectFit: "cover", objectPosition: "top" }}>
            {hasWebm && <source src={src.webm} type="video/webm" />}
            {hasMp4 && <source src={src.mp4} type="video/mp4" />}
          </video>
        )}
        <PlayBadge
          playing={playing}
          label={playing ? `Pause the ${name} preview` : `Play the ${name} preview`}
          onToggle={toggle}
        />
      </div>
    );
  } else if (posterSrc) {
    body = <Shot src={posterSrc} alt={`${name} screenshot`} height={height} />;
  } else if (fallback) {
    return <div ref={wrapRef}>{fallback}</div>;
  } else {
    body = (
      <div style={{ height, background: C.bg, padding: "0.75rem" }}>
        <MediaPlaceholder
          hint={`media/projects/${projectId}/preview.mp4`}
          note="plus poster.jpg for the still frame"
          height="100%"
        />
      </div>
    );
  }

  return (
    <div ref={wrapRef}>
      <BrowserFrame url={frameUrl}>{body}</BrowserFrame>
    </div>
  );
}

// ── Lightbox ──────────────────────────────────────────────────────────────────

function Lightbox({ shot, name, onClose }: { shot: ShotSlot; name: string; onClose: () => void }) {
  useEffect(() => {
    // Capture phase, so the case study modal behind this does not also close.
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      onClose();
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${name}: ${shot.label}`}
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 400,
        background: "rgba(3,5,12,0.9)", backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: "1rem", padding: "4vh 4vw",
      }}>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        aria-label="Close screenshot"
        style={{
          position: "absolute", top: "1.1rem", right: "1.1rem",
          background: C.elev, border: `1px solid ${C.border}`, borderRadius: 8,
          color: C.muted, cursor: "pointer", padding: "0.45rem",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
        <svg viewBox="0 0 24 24" style={{ width: 16, height: 16 }} aria-hidden="true">
          <path d="M18 6L6 18M6 6l12 12" strokeWidth="1.5" strokeLinecap="round"
            stroke="currentColor" fill="none" />
        </svg>
      </button>
      <img
        src={shot.src}
        alt={`${name}: ${shot.label}`}
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "100%", maxHeight: "78vh", objectFit: "contain",
          borderRadius: 10, border: `1px solid ${C.border}`,
          boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
        }}
      />
      <p style={{ ...MONO, color: C.soft, fontSize: "0.72rem", margin: 0, textAlign: "center" }}>
        {shot.label}
      </p>
    </div>
  );
}

// ── Gallery ───────────────────────────────────────────────────────────────────

function GalleryTile({ shot, name, ready, onOpen }: {
  shot: ShotSlot;
  name: string;
  ready: boolean;
  onOpen: () => void;
}) {
  if (!ready) {
    return (
      <figure style={{ margin: 0 }}>
        <MediaPlaceholder hint={shot.hint} height={132} />
        <figcaption style={{ ...MONO, color: C.muted, fontSize: "0.62rem",
          marginTop: "0.45rem", textAlign: "center" }}>
          {shot.label}
        </figcaption>
      </figure>
    );
  }

  return (
    <figure style={{ margin: 0 }}>
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Open ${name}: ${shot.label} larger`}
        style={{
          display: "block", width: "100%", padding: 0, cursor: "zoom-in",
          background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8,
          overflow: "hidden",
        }}>
        <img
          src={shot.src}
          alt={`${name}: ${shot.label}`}
          loading="lazy"
          decoding="async"
          style={{ width: "100%", height: 132, display: "block",
            objectFit: "cover", objectPosition: "top" }}
        />
      </button>
      <figcaption style={{ ...MONO, color: C.muted, fontSize: "0.62rem",
        marginTop: "0.45rem", textAlign: "center" }}>
        {shot.label}
      </figcaption>
    </figure>
  );
}

/** Screenshot gallery for a case study. Tiles open larger on click. */
export function ProjectGallery({ projectId, name }: { projectId: string; name: string }) {
  const { shots, states } = useVisibleShots(projectId);
  const [openSlot, setOpenSlot] = useState<number | null>(null);
  const openShot = shots.find((s) => s.slot === openSlot) ?? null;

  return (
    <>
      <div className="media-gallery" style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.85rem",
      }}>
        {shots.map((shot) => (
          <GalleryTile
            key={shot.src}
            shot={shot}
            name={name}
            ready={states[shot.src] === "ready"}
            onOpen={() => setOpenSlot(shot.slot)}
          />
        ))}
      </div>
      {openShot && (
        <Lightbox shot={openShot} name={name} onClose={() => setOpenSlot(null)} />
      )}
    </>
  );
}
