import { B, alpha } from "@/lib/brand";
import { useMotionTier } from "@/hooks/use-motion-tier";

/**
 * Three large, heavily blurred colour fields drifting and morphing on long,
 * offset loops. Opacity stays low enough that it reads as atmosphere behind the
 * particles rather than decoration in front of the copy.
 *
 * On reduced motion the blobs stay exactly where they are, so the colour is
 * still there but nothing moves.
 */
interface Blob {
  size: string;
  max: number;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  colour: string;
  strength: number;
  animation: string;
}

const BLOBS: Blob[] = [
  {
    size: "62vw",
    max: 980,
    top: "-18%",
    left: "-12%",
    colour: B.blue,
    strength: 0.13,
    animation: "auroraDriftA 48s ease-in-out infinite",
  },
  {
    size: "52vw",
    max: 820,
    top: "34%",
    right: "-14%",
    colour: B.cyan,
    strength: 0.085,
    animation: "auroraDriftB 63s ease-in-out infinite",
  },
  {
    size: "58vw",
    max: 900,
    bottom: "-12%",
    left: "22%",
    colour: B.blueBright,
    strength: 0.1,
    animation: "auroraDriftC 55s ease-in-out infinite",
  },
];

export default function AuroraBackdrop() {
  const { reduced } = useMotionTier();

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {BLOBS.map((blob, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: blob.size,
            height: blob.size,
            maxWidth: blob.max,
            maxHeight: blob.max,
            top: blob.top,
            bottom: blob.bottom,
            left: blob.left,
            right: blob.right,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${alpha(blob.colour, blob.strength)} 0%, transparent 68%)`,
            filter: "blur(40px)",
            willChange: reduced ? undefined : "transform",
            animation: reduced ? undefined : blob.animation,
          }}
        />
      ))}
    </div>
  );
}
