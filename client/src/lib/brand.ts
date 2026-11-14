import type { CSSProperties } from "react";

/**
 * The Method Co. brand tokens, brand system v1.0: dark navy, green and white.
 * The same palette ships as brand/palette/method-tokens.css and is the source
 * for the logo files in brand/ (script/brand/build-svgs.py). Change them
 * together.
 */
export const B = {
  /** Page background. */
  bg: "#0A0F14",
  /** Surface: cards, the open mobile menu. */
  surface: "#111827",
  /** Raised surface inside a card. */
  panel: "#172131",
  elev: "#1F2A3A",
  /** Headings and UI text on dark. */
  text: "#F9FAFB",
  /** Body copy on dark. */
  textSoft: "#D1D5DB",
  /** Primary brand green: CTAs, links, accents. Pair with dark text, never white. */
  green: "#22D87A",
  /** Primary Dark: deep green for glows, gradients and pressed states. */
  greenDark: "#0F8A54",
  /** Light end of the mark's gradient, for highlights. */
  greenGlow: "#4BF59A",
  white: "#FFFFFF",
  muted: "#9CA3AF",
  border: "#1F2937",
  line: "#374151",
  /** Status colours. Success uses the brand green. */
  success: "#22D87A",
  amber: "#F4B85C",
  red: "#F26B6B",
} as const;

/** Display face. Bebas is all-caps by design and ships a single weight. */
export const BEBAS: CSSProperties = {
  fontFamily: "'Bebas Neue', sans-serif",
  fontWeight: 400,
  letterSpacing: "0.005em",
};

/** Body face. */
export const INTER: CSSProperties = {
  fontFamily: "'Inter', system-ui, sans-serif",
};

/** Technical face, used for labels, chips and metadata. */
export const MONO: CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
};

/** Editorial accent, italic only. */
export const NEWS: CSSProperties = {
  fontFamily: "'Newsreader', serif",
  fontStyle: "italic",
};

/** Uppercase mono label, the recurring small-type treatment across the site. */
export const LABEL: CSSProperties = {
  ...MONO,
  textTransform: "uppercase",
  letterSpacing: "0.22em",
  fontWeight: 600,
};

/** Turn a #rrggbb string into channels, for building rgba() at runtime. */
export function rgbOf(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

/** rgba() helper so alpha values stay readable at the call site. */
export function alpha(hex: string, a: number): string {
  const { r, g, b } = rgbOf(hex);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
