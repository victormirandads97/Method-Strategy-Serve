/**
 * A fine fractal-noise texture laid over the whole page at very low opacity, so
 * large flat areas of near-black pick up film grain instead of reading as a
 * dead digital block. Inline SVG, so it costs no network request.
 */
const NOISE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 256'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

export default function GrainOverlay() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 90,
        pointerEvents: "none",
        backgroundImage: `url("${NOISE}")`,
        backgroundSize: "220px 220px",
        opacity: 0.035,
        mixBlendMode: "overlay",
      }}
    />
  );
}
