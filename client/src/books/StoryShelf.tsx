/**
 * "What are they into this week?" Three book cards, controls always visible.
 * Choosing a story lifts its cover, labels it and fills the signup form.
 */
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { Cover, type Look } from "./art";
import { OFFER, STORIES } from "./config";

export function Burst({ show }: { show: boolean }) {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <AnimatePresence>
      {show && (
        <span className="lp-burst" aria-hidden="true">
          {Array.from({ length: 9 }).map((_, i) => {
            const a = (i / 9) * Math.PI * 2;
            return (
              <motion.img
                key={i}
                src="/books/clay-star.svg"
                alt=""
                className="lp-burst-star"
                initial={{ x: 0, y: 0, scale: 0.2, opacity: 1, rotate: 0 }}
                animate={{ x: Math.cos(a) * 80, y: Math.sin(a) * 60, scale: 0.5 + (i % 3) * 0.15, opacity: 0, rotate: 140 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            );
          })}
        </span>
      )}
    </AnimatePresence>
  );
}

export function StoryShelf({ chosen, onChoose, onSample, name, look }: { chosen: string; onChoose: (id: string) => void; onSample: (e: React.MouseEvent<HTMLElement>) => void; name: string; look: Look }) {
  const reduce = useReducedMotion();
  const [burst, setBurst] = useState<{ id: string; n: number } | null>(null);

  return (
    <ul className="lp-cards">
      {STORIES.map((s, i) => {
        const on = chosen === s.id;
        return (
          <motion.li
            key={s.id}
            className={`lp-storycard lp-tone-${s.art}${on ? " is-chosen" : ""}`}
            initial={reduce ? false : { opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -40px 0px" }}
            transition={{ delay: i * 0.08, duration: 0.45 }}
          >
            <div className="lp-storycard-cover">
              <motion.div className="lp-mini-book" animate={reduce ? undefined : { y: on ? -10 : 0, rotate: on ? -2 : 0 }} transition={{ type: "spring", stiffness: 260, damping: 16 }}>
                <Cover story={s.art} name={name} look={look} label={`Cover: ${name} and the ${s.title.replace(/^The /, "")}`} />
              </motion.div>
              {on && <span className="lp-selected-tag">Selected</span>}
            </div>
            <div className="lp-storycard-body">
              <h3>{s.title}</h3>
              <p>{s.hook}</p>
              <div className="lp-storycard-actions">
                <span className="lp-burst-anchor">
                  <button
                    type="button"
                    className={`lp-btn ${on ? "lp-btn-chosen" : "lp-btn-soft"}`}
                    aria-pressed={on}
                    onClick={() => {
                      if (!on) setBurst({ id: s.id, n: (burst?.n || 0) + 1 });
                      onChoose(on ? "" : s.id);
                    }}
                  >
                    {on ? "✓ Story chosen" : "Choose this story"}
                  </button>
                  {burst?.id === s.id && <Burst key={burst.n} show />}
                </span>
                {s.hasSample && (
                  <button type="button" className="lp-btn lp-btn-link" onClick={onSample}>{OFFER.secondaryCta}</button>
                )}
              </div>
            </div>
          </motion.li>
        );
      })}
    </ul>
  );
}
