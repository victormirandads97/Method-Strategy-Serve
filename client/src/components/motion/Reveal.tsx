import { motion } from "framer-motion";
import { useMotionTier } from "@/hooks/use-motion-tier";

interface RevealProps {
  children: React.ReactNode;
  /** Sibling position, used to stagger a row or grid. */
  index?: number;
  delay?: number;
  style?: React.CSSProperties;
  className?: string;
}

/** Gap between staggered siblings, in seconds. */
const STAGGER = 0.06;

/**
 * Scroll-triggered entrance with real movement: a 40px rise and a slight scale
 * up, on a spring rather than a linear fade. Fires once, so scrolling back up
 * and down again does not replay it.
 *
 * Reduced motion gets a plain short fade with no travel.
 */
export default function Reveal({
  children,
  index = 0,
  delay = 0,
  style,
  className,
}: RevealProps) {
  const { reduced } = useMotionTier();
  const wait = delay + index * STAGGER;

  if (reduced) {
    return (
      <motion.div
        className={className}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.35, delay: wait }}
        style={style}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        type: "spring",
        stiffness: 190,
        damping: 24,
        mass: 0.8,
        delay: wait,
      }}
      style={style}
    >
      {children}
    </motion.div>
  );
}
