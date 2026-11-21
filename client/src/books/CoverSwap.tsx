/**
 * "See who could be on the cover." Pick a fictional hero: the cover title and
 * character art change together, turning over a stationary spine. The new
 * cover is in place instantly; the old one turns away on top of it.
 */
import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { Cover, Portrait, SpreadFootprints } from "./art";
import { HEROES, spread1Text } from "./config";

export function CoverSwap({ index, onChange }: { index: number; onChange: (i: number) => void }) {
  const reduce = useReducedMotion();
  const [turning, setTurning] = useState<{ from: number; n: number } | null>(null);
  const hero = HEROES[index];

  function choose(i: number) {
    if (i === index) return;
    if (!reduce) setTurning({ from: index, n: (turning?.n || 0) + 1 });
    onChange(i);
  }

  return (
    <div className="lp-swap">
      <fieldset className="lp-swap-heroes">
        <legend className="lp-sr">Choose a fictional example hero</legend>
        {HEROES.map((h, i) => (
          <label key={h.name} className={`lp-swap-hero${i === index ? " is-on" : ""}`}>
            <input type="radio" name="lp-hero" value={h.name} checked={i === index} onChange={() => choose(i)} />
            <span className="lp-swap-face"><Portrait look={h.look} /></span>
            <span className="lp-swap-text">
              <span className="lp-swap-name">{h.name}</span>
              <span className="lp-swap-label">{h.label}</span>
            </span>
            {i === index && <span className="lp-swap-check" aria-hidden="true">✓</span>}
          </label>
        ))}
        <p className="lp-small">Fictional example heroes</p>
      </fieldset>

      <div className="lp-swap-book">
        <div className="lp-swap-stage">
          <div className="lp-swap-pages" aria-hidden="true" />
          <div className="lp-swap-layer" aria-live="polite">
            <Cover story="dinosaur" name={hero.name} look={hero.look} label={`Sample cover: ${hero.name} and the Dinosaur Next Door`} />
          </div>
          {turning && (
            <motion.div
              key={turning.n}
              className="lp-swap-layer lp-swap-turning"
              aria-hidden="true"
              initial={{ rotateY: 0 }}
              animate={{ rotateY: -105 }}
              transition={{ duration: 0.55, ease: [0.45, 0, 0.6, 1] }}
              onAnimationComplete={() => setTurning(null)}
            >
              <Cover story="dinosaur" name={HEROES[turning.from].name} look={HEROES[turning.from].look} label="" />
            </motion.div>
          )}
          <span className="lp-swap-spine" aria-hidden="true" />
        </div>
      </div>

      <div className="lp-swap-detail">
        <p className="lp-kicker">From the cover into the story</p>
        <div className="lp-swap-detail-row">
          <div className="lp-swap-crop">
            <SpreadFootprints look={hero.look} viewBox="140 322 136 68" fit="slice" title={`${hero.name}’s ${hero.thing}, from page one`} />
          </div>
          <p><strong>{hero.name}’s {hero.thing}</strong> are on the cover, and they start the adventure on page one.</p>
        </div>
        <blockquote className="lp-swap-quote"><p className="lp-story-text">{spread1Text(hero)}</p></blockquote>
      </div>
    </div>
  );
}
