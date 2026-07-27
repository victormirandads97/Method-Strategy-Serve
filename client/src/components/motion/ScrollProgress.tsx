import { motion, useScroll, useSpring } from "framer-motion";
import { B } from "@/lib/brand";

/**
 * A thin accent line pinned to the very top of the viewport, filling from left
 * to right as the page scrolls. Spring-smoothed so it glides rather than
 * snapping on fast scrolls.
 */
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const width = useSpring(scrollYProgress, {
    stiffness: 220,
    damping: 34,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        zIndex: 400,
        transformOrigin: "0% 50%",
        scaleX: width,
        background: `linear-gradient(90deg, ${B.blue}, ${B.blueBright}, ${B.cyan})`,
        boxShadow: `0 0 12px ${B.blue}`,
      }}
    />
  );
}
