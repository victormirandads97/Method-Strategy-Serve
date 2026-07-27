import { useEffect, useState } from "react";

/**
 * One source of truth for how much motion this visitor should get.
 *
 * reduced -> the visitor asked for less motion. Kill particles, scramble,
 *            magnetic pull and tilt. Keep short fades only.
 * lite    -> phone or touch device. Cut the expensive effects and shrink the
 *            particle count, but keep scroll reveals.
 * full    -> desktop pointer with motion allowed. Everything on.
 *
 * Before the first client measurement we report `lite` and `ready: false`, so
 * nothing heavy ever starts during the first paint.
 */
export interface MotionTier {
  reduced: boolean;
  lite: boolean;
  full: boolean;
  ready: boolean;
}

const LITE_MAX_WIDTH = 820;

export function useMotionTier(): MotionTier {
  const [state, setState] = useState<{
    reduced: boolean;
    lite: boolean;
    ready: boolean;
  }>({ reduced: false, lite: true, ready: false });

  useEffect(() => {
    const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarseQuery = window.matchMedia("(hover: none), (pointer: coarse)");
    const narrowQuery = window.matchMedia(`(max-width: ${LITE_MAX_WIDTH}px)`);
    const queries = [reducedQuery, coarseQuery, narrowQuery];

    const read = () => {
      setState({
        reduced: reducedQuery.matches,
        lite: coarseQuery.matches || narrowQuery.matches,
        ready: true,
      });
    };

    read();
    queries.forEach((q) => q.addEventListener("change", read));
    return () => queries.forEach((q) => q.removeEventListener("change", read));
  }, []);

  return {
    reduced: state.reduced,
    lite: state.lite,
    ready: state.ready,
    full: state.ready && !state.reduced && !state.lite,
  };
}
