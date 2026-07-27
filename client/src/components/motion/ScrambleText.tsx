import { useEffect, useRef, useState } from "react";
import { useMotionTier } from "@/hooks/use-motion-tier";

interface ScrambleTextProps {
  /** Pass a stable reference, ideally a module-level constant. */
  words: readonly string[];
  /** How long each word rests before the next scramble starts. */
  holdMs?: number;
  /** How long the scramble between two words takes. */
  scrambleMs?: number;
  style?: React.CSSProperties;
}

const GLYPHS = "!<>-_\\/[]{}=+*^?#$%&01";

/**
 * Cycles a short list of phrases, dissolving one into the next through a
 * character scramble. Text is written straight to the node rather than through
 * state, so a scramble does not re-render React on every frame.
 *
 * On reduced motion the scramble is skipped entirely and the words swap plainly
 * on a slower timer.
 */
export default function ScrambleText({
  words,
  holdMs = 2300,
  scrambleMs = 640,
  style,
}: ScrambleTextProps) {
  const { reduced } = useMotionTier();
  const nodeRef = useRef<HTMLSpanElement>(null);
  const [index, setIndex] = useState(0);

  const longest = words.reduce((max, w) => Math.max(max, w.length), 0);

  useEffect(() => {
    if (words.length === 0) return;
    const node = nodeRef.current;
    if (!node) return;

    const from = words[index] ?? "";
    const to = words[(index + 1) % words.length] ?? "";
    node.textContent = from;

    let raf = 0;
    let cancelled = false;

    const advance = () => {
      if (reduced) {
        node.textContent = to;
        setIndex((i) => (i + 1) % words.length);
        return;
      }

      const length = Math.max(from.length, to.length);
      // Each character gets its own window inside the scramble, so the phrase
      // resolves left to right in a ragged rather than uniform way.
      const plan = Array.from({ length }, (_, i) => {
        const begin = Math.random() * 0.45;
        return {
          begin,
          end: begin + 0.2 + Math.random() * 0.35,
          char: to[i] ?? "",
        };
      });

      const start = performance.now();
      const frame = (now: number) => {
        if (cancelled) return;
        const t = Math.min(1, (now - start) / scrambleMs);
        let out = "";
        for (let i = 0; i < length; i += 1) {
          const slot = plan[i];
          if (t >= slot.end) out += slot.char;
          else if (t >= slot.begin)
            out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          else out += from[i] ?? "";
        }
        node.textContent = out;

        if (t < 1) {
          raf = requestAnimationFrame(frame);
        } else {
          node.textContent = to;
          setIndex((i) => (i + 1) % words.length);
        }
      };
      raf = requestAnimationFrame(frame);
    };

    const timer = setTimeout(advance, reduced ? holdMs * 2 : holdMs);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [index, words, reduced, holdMs, scrambleMs]);

  return (
    <span
      ref={nodeRef}
      // Reserve the widest phrase so the line never reflows mid-scramble.
      style={{ display: "inline-block", minWidth: `${longest}ch`, ...style }}
    >
      {words[0] ?? ""}
    </span>
  );
}
