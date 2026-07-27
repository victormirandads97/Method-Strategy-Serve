import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { B, MONO } from "@/lib/brand";
import { useMotionTier } from "@/hooks/use-motion-tier";

interface MagneticButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: "solid" | "ghost";
  /** How far the button is allowed to travel toward the cursor, in px. */
  pull?: number;
  external?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}

/** Invisible margin around the button where the pull starts to take hold. */
const FIELD = 22;

/**
 * A button that leans toward the cursor as it approaches, with the label
 * drifting slightly further than the button itself for a bit of parallax. Both
 * spring back on leave.
 *
 * The pull is disabled entirely on touch devices and under reduced motion,
 * where it degrades to a plain hover state.
 */
export default function MagneticButton({
  href,
  children,
  variant = "solid",
  pull = 12,
  external = false,
  onClick,
  style,
}: MagneticButtonProps) {
  const { full } = useMotionTier();
  const hostRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const spring = { stiffness: 260, damping: 17, mass: 0.45 };
  const sx = useSpring(x, spring);
  const sy = useSpring(y, spring);
  const labelX = useTransform(sx, (v) => v * 0.34);
  const labelY = useTransform(sy, (v) => v * 0.34);

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!full) return;
    const host = hostRef.current;
    if (!host) return;
    const rect = host.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    // Normalise the offset against half the field, then clamp to `pull`.
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    x.set(Math.max(-1, Math.min(1, dx)) * pull);
    y.set(Math.max(-1, Math.min(1, dy)) * pull);
  };

  const release = () => {
    x.set(0);
    y.set(0);
  };

  const solid: React.CSSProperties = {
    background: B.cream,
    color: "#0A0A0A",
    border: `1px solid ${B.cream}`,
  };
  const ghost: React.CSSProperties = {
    background: "transparent",
    color: B.cream,
    border: `1px solid ${B.line}`,
  };

  return (
    <div
      ref={hostRef}
      onPointerMove={onPointerMove}
      onPointerLeave={release}
      style={{
        display: "inline-block",
        padding: FIELD,
        margin: -FIELD,
        // Keep the invisible field from swallowing clicks meant for siblings.
        pointerEvents: "auto",
      }}
    >
      <motion.a
        href={href}
        onClick={onClick}
        target={external ? "_blank" : undefined}
        rel={external ? "noreferrer" : undefined}
        whileHover={{ scale: full ? 1.03 : 1 }}
        whileTap={{ scale: 0.97 }}
        transition={spring}
        style={{
          ...MONO,
          x: sx,
          y: sy,
          display: "inline-flex",
          alignItems: "center",
          gap: "0.6rem",
          padding: "0.95rem 2rem",
          borderRadius: 3,
          fontSize: "0.78rem",
          fontWeight: 600,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          cursor: "pointer",
          whiteSpace: "nowrap",
          ...(variant === "solid" ? solid : ghost),
          ...style,
        }}
      >
        <motion.span
          style={{
            x: labelX,
            y: labelY,
            display: "inline-flex",
            alignItems: "center",
            gap: "0.6rem",
          }}
        >
          {children}
        </motion.span>
      </motion.a>
    </div>
  );
}
