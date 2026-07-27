import { motion } from "framer-motion";
import { B } from "@/lib/brand";
import { useMotionTier } from "@/hooks/use-motion-tier";

interface WordRevealProps {
  text: string;
  /** Words from this index onward render in the accent colour. */
  accentFrom?: number;
  delay?: number;
  stagger?: number;
  style?: React.CSSProperties;
}

/**
 * Headline that assembles itself word by word: each word springs up from below
 * while sharpening out of a blur. On reduced motion the whole line does one
 * short fade instead.
 */
export default function WordReveal({
  text,
  accentFrom,
  delay = 0,
  stagger = 0.055,
  style,
}: WordRevealProps) {
  const { reduced } = useMotionTier();
  const words = text.split(" ");

  const colourOf = (i: number) =>
    accentFrom !== undefined && i >= accentFrom ? B.blueBright : B.cream;

  if (reduced) {
    return (
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay }}
        style={style}
      >
        {words.map((word, i) => (
          <span key={`${word}-${i}`} style={{ color: colourOf(i) }}>
            {word}
            {i < words.length - 1 ? " " : ""}
          </span>
        ))}
      </motion.h1>
    );
  }

  return (
    <h1 style={style}>
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          initial={{ opacity: 0, y: "0.42em", filter: "blur(12px)" }}
          animate={{ opacity: 1, y: "0em", filter: "blur(0px)" }}
          transition={{
            type: "spring",
            stiffness: 320,
            damping: 26,
            mass: 0.7,
            delay: delay + i * stagger,
          }}
          style={{
            display: "inline-block",
            color: colourOf(i),
            willChange: "transform, filter, opacity",
          }}
        >
          {word}
          {i < words.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </h1>
  );
}
