import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Cover, DedicationOrnament, SpreadEgg, SpreadFootprints } from "./art";
import { AVA, OFFER, SAMPLE } from "./config";

const PAGES = ["Cover", "Dedication", "Pages 1 and 2", "Pages 3 and 4"];

export function SampleReader({ open, onOpenChange, onJoin, returnFocus }: { open: boolean; onOpenChange: (v: boolean) => void; onJoin: () => void; returnFocus: React.RefObject<HTMLElement | null> }) {
  const [page, setPage] = useState(0);
  const [dir, setDir] = useState<"next" | "prev">("next");
  const joining = useRef(false);
  const reduce = useReducedMotion();
  const last = PAGES.length - 1;

  useEffect(() => {
    if (open) {
      setPage(0);
      joining.current = false;
    }
  }, [open]);

  function go(to: number) {
    if (to < 0 || to > last) return;
    setDir(to > page ? "next" : "prev");
    setPage(to);
  }

  function onKey(e: KeyboardEvent) {
    // Arrow keys turn pages unless the visitor is selecting text or in a control that uses them.
    if (e.key === "ArrowRight") { e.preventDefault(); go(page + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); go(page - 1); }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="lp-reader-overlay" />
        <Dialog.Content
          className="lp-reader"
          onKeyDown={onKey}
          aria-describedby="lp-reader-desc"
          onCloseAutoFocus={(e) => {
            // Leaving through "Join the first print run" goes to the form; otherwise focus returns to the button that opened the reader.
            e.preventDefault();
            if (joining.current) onJoin();
            else returnFocus.current?.focus();
          }}
        >
          <div className="lp-reader-top">
            <div>
              <Dialog.Title className="lp-reader-title">Ava and the Dinosaur Next Door</Dialog.Title>
              <p id="lp-reader-desc" className="lp-reader-sub">Sample book with a fictional hero. Use the arrow keys or the buttons to turn pages.</p>
            </div>
            <Dialog.Close className="lp-reader-close" aria-label="Close the sample">
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>
            </Dialog.Close>
          </div>

          <div className="lp-reader-stage">
            <AnimatePresence mode="wait" initial={false} custom={dir}>
            <motion.div
              key={page}
              className="lp-reader-page"
              aria-roledescription="page"
              aria-label={PAGES[page]}
              custom={dir}
              initial={reduce ? { opacity: 0 } : { opacity: 0, rotateY: dir === "next" ? -35 : 35, x: dir === "next" ? 60 : -60 }}
              animate={{ opacity: 1, rotateY: 0, x: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, rotateY: dir === "next" ? 30 : -30, x: dir === "next" ? -60 : 60 }}
              transition={{ duration: reduce ? 0.12 : 0.28, ease: "easeOut" }}
            >
              {page === 0 && (
                <div className="lp-reader-cover">
                  <div className="lp-mini-book"><Cover story="dinosaur" name={AVA.name} look={AVA.look} /></div>
                </div>
              )}
              {page === 1 && (
                <div className="lp-dedication-page">
                  <DedicationOrnament />
                  <p className="lp-dedication-text">
                    {SAMPLE.dedication.line1}<br />{SAMPLE.dedication.line2}<br />
                    <span>{SAMPLE.dedication.sign}</span>
                  </p>
                  <p className="lp-dedication-note">Example dedication. You’ll write your own.</p>
                </div>
              )}
              {page === 2 && (
                <figure className="lp-reader-spread">
                  <div className="lp-spread-art">
                    <SpreadFootprints look={AVA.look} />
                    <figcaption className="lp-story-text lp-spread-text">{SAMPLE.spread1}</figcaption>
                  </div>
                </figure>
              )}
              {page === 3 && (
                <>
                <figure className="lp-reader-spread">
                  <div className="lp-spread-art">
                    <SpreadEgg look={AVA.look} />
                    <figcaption className="lp-story-text lp-spread-text">{SAMPLE.spread2}</figcaption>
                  </div>
                </figure>
                <div className="lp-reader-end">
                  <p>Want one with your child in it? Join the first print run and we’ll tell you when orders open.</p>
                </div>
                </>
              )}
            </motion.div>
            </AnimatePresence>
          </div>

          <div className="lp-reader-nav">
            <button type="button" className="lp-btn lp-btn-ghost" onClick={() => go(page - 1)} disabled={page === 0}>
              <span aria-hidden="true">←</span> Previous
            </button>
            <p className="lp-reader-count" aria-live="polite">Page {page + 1} of {PAGES.length}</p>
            {page < last ? (
              <button type="button" className="lp-btn lp-btn-soft" onClick={() => go(page + 1)}>
                Next <span aria-hidden="true">→</span>
              </button>
            ) : (
              <button
                type="button"
                className="lp-btn lp-btn-primary"
                onClick={() => {
                  joining.current = true;
                  onOpenChange(false);
                }}
              >
                {OFFER.primaryCta}
              </button>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
