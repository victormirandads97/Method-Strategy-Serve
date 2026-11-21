/**
 * Hero scene: a square hardback tilted to show its spine and page block,
 * a glimpse of an open spread behind, and three clay props. The egg is a
 * real button: tap it and it cracks to show a tiny dinosaur (replayable,
 * instant under reduced motion). Ambient motion pauses offscreen and has a
 * visible pause control.
 */
import { useEffect, useRef, useState } from "react";
import { Cover, SpreadFootprints } from "./art";
import { AVA } from "./config";

export function HeroBook() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [offscreen, setOffscreen] = useState(false);
  const [eggOpen, setEggOpen] = useState(false);

  useEffect(() => {
    const el = sceneRef.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([e]) => setOffscreen(!e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={sceneRef} className={`lp-hb${paused || offscreen ? " is-still" : ""}`}>
      <div className="lp-hb-arch" aria-hidden="true" />
      <div className="lp-hb-spread" aria-hidden="true">
        <SpreadFootprints look={AVA.look} title="" mirror />
      </div>

      <img className="lp-hb-star" src="/books/clay-star.svg" alt="" width={160} height={160} />

      <div className="lp-hb-float">
        <div className="lp-hb-book">
          <div className="lp-hb-face lp-hb-front">
            <Cover story="dinosaur" name={AVA.name} look={AVA.look} label="Sample mockup of the hardback cover: Ava and the Dinosaur Next Door" />
          </div>
          <div className="lp-hb-face lp-hb-spine" aria-hidden="true"><span>Ava and the Dinosaur Next Door</span></div>
          <div className="lp-hb-face lp-hb-pages-top" aria-hidden="true" />
          <div className="lp-hb-face lp-hb-pages-bottom" aria-hidden="true" />
          <div className="lp-hb-face lp-hb-pages-right" aria-hidden="true" />
          <div className="lp-hb-face lp-hb-back" aria-hidden="true" />
        </div>
        <div className="lp-hb-shadow" aria-hidden="true" />
      </div>

      <img className="lp-hb-wellies" src="/books/clay-wellies.svg" alt="" width={200} height={170} />

      <div className="lp-hb-egg-wrap">
        <button
          type="button"
          className={`lp-egg${eggOpen ? " is-open" : ""}`}
          aria-pressed={eggOpen}
          aria-label={eggOpen ? "Close the egg" : "Tap the egg to see what hatches"}
          onClick={() => setEggOpen((o) => !o)}
        >
          <span className="lp-egg-inner">
            <img className="lp-egg-dino" src="/books/baby-dino.svg" alt="" width={160} height={200} />
            <img className="lp-egg-bottom" src="/books/egg-bottom.svg" alt="" width={160} height={200} />
            <img className="lp-egg-top" src="/books/egg-top.svg" alt="" width={160} height={200} />
          </span>
        </button>
        <span className="lp-egg-label" aria-hidden="true">{eggOpen ? "Hello!" : "Tap the egg"}</span>
      </div>

      <span className="lp-hb-tag">Sample mockup</span>
      <button type="button" className="lp-hb-pause" aria-pressed={paused} onClick={() => setPaused((p) => !p)}>
        {paused ? (
          <><svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 2l7 4-7 4z" fill="currentColor" /></svg> Play animation</>
        ) : (
          <><svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 2h2v8H3zM7 2h2v8H7z" fill="currentColor" /></svg> Pause animation</>
        )}
      </button>
    </div>
  );
}
