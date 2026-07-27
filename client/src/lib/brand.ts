import type { CSSProperties } from "react";

/**
 * The Method Co. brand tokens.
 * Sourced from the /last-human-job page so the whole site reads as one system:
 * deep near-black, cream, blue accent.
 */
export const B = {
  black: "#0E0E10",
  ink: "#141418",
  panel: "#1C1C22",
  elev: "#22222A",
  cream: "#F5EFE0",
  creamSoft: "#D8D2C2",
  blue: "#5A78FF",
  blueBright: "#6B89FF",
  cyan: "#5AD8FF",
  muted: "#8E8878",
  border: "#2E2A26",
  line: "#36322D",
  green: "#4DD897",
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
