import { useRef } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { B, alpha } from "@/lib/brand";
import { useMotionTier } from "@/hooks/use-motion-tier";

interface TiltCardProps {
  children: React.ReactNode;
  /** Maximum rotation on either axis, in degrees. */
  maxTilt?: number;
  /** Radius of the cursor glow, in px. */
  glowSize?: number;
  glowColour?: string;
  style?: React.CSSProperties;
  className?: string;
}

/**
 * A surface that leans a few degrees toward the cursor and carries a soft
 * radial glow that tracks the pointer inside it. Everything is spring-driven,
 * so leaving the card settles it back rather than snapping.
 *
 * Both effects are off on touch and under reduced motion, where the card
 * renders as a plain panel with a static border.
 */
export default function TiltCard({
  children,
  maxTilt = 6,
  glowSize = 420,
  glowColour = B.blue,
  style,
  className,
}: TiltCardProps) {
  const { full } = useMotionTier();
  const ref = useRef<HTMLDivElement>(null);

  const tiltSpring = { stiffness: 220, damping: 20, mass: 0.5 };
  const rotateX = useSpring(useMotionValue(0), tiltSpring);
  const rotateY = useSpring(useMotionValue(0), tiltSpring);

  const glowSpring = { stiffness: 180, damping: 26 };
  const glowX = useSpring(useMotionValue(50), glowSpring);
  const glowY = useSpring(useMotionValue(50), glowSpring);
  const glowOpacity = useSpring(useMotionValue(0), {
    stiffness: 150,
    damping: 24,
  });

  const glow = useMotionTemplate`radial-gradient(${glowSize}px circle at ${glowX}% ${glowY}%, ${alpha(
    glowColour,
    0.22,
  )}, transparent 62%)`;

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!full) return;
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;

    glowX.set(px * 100);
    glowY.set(py * 100);
    glowOpacity.set(1);
    // Lean toward the cursor: right of centre tips the right edge away.
    rotateY.set((px - 0.5) * 2 * maxTilt);
    rotateX.set(-(py - 0.5) * 2 * maxTilt);
  };

  const onPointerLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
    glowOpacity.set(0);
  };

  return (
    <div
      ref={ref}
      className={className}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      style={{ perspective: 1000, height: "100%" }}
    >
      <motion.div
        style={{
          position: "relative",
          height: "100%",
          rotateX: full ? rotateX : 0,
          rotateY: full ? rotateY : 0,
          transformStyle: "preserve-3d",
          borderRadius: 6,
          background: B.ink,
          border: `1px solid ${B.border}`,
          overflow: "hidden",
          ...style,
        }}
      >
        {/* Cursor glow, painted under the content. */}
        <motion.div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: glow,
            opacity: full ? glowOpacity : 0,
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative", height: "100%" }}>{children}</div>
      </motion.div>
    </div>
  );
}
