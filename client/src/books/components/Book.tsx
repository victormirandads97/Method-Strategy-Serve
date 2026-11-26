import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { euro, type StoryId } from "@shared/books/catalog";
import { sampleFor } from "@shared/books/story";
import { sampleEdition, type SamplePage } from "@shared/books/sample-edition";
import { Cover } from "./Art";

function IllustratedPage({ page, story }: { page: SamplePage; story: StoryId }) {
  if (page.kind === "cover") return <Cover story={story} />;

  return (
    <div className={`sample-page sample-page-${page.kind}`}>
      <img src={page.image} width={640} height={640} alt="" decoding="async" />
      {"text" in page && (
        <div className="sample-page-copy" style={{
          left: `${page.placement.left}%`,
          width: `${page.placement.width}%`,
          top: `${page.placement.center}%`,
          fontSize: `clamp(13px, ${page.placement.maxSize / 5.76}cqw, ${page.placement.maxSize}px)`,
        }}>
          {page.heading && <p className="sample-page-heading">{page.heading}</p>}
          <p>{page.text}</p>
        </div>
      )}
    </div>
  );
}

export function SampleReader({ story, onClose, footer }: { story: StoryId; onClose: () => void; footer?: ReactNode }) {
  const s = sampleFor(story);
  const [i, setI] = useState(2);
  const ref = useRef<HTMLDivElement>(null);
  const edition = sampleEdition(s);
  const total = edition.length;
  const pageCount = edition.reduce((sum, spread) => sum + spread.length, 0);
  const pages = edition[i];
  const firstPage = i === 0 ? 1 : i * 2;
  const pageLabel = pages.length === 1 ? `Page ${firstPage}` : `Pages ${firstPage}–${firstPage + 1}`;
  const go = useCallback((d: number) => setI((x) => Math.min(total - 1, Math.max(0, x + d))), [total]);
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    ref.current?.querySelector<HTMLElement>("[data-first]")?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "Tab" && ref.current) {
        const items = Array.from(ref.current.querySelectorAll<HTMLElement>("button:not([disabled]), a[href]"));
        const a = items[0], b = items[items.length - 1];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); b.focus(); }
        else if (!e.shiftKey && document.activeElement === b) { e.preventDefault(); a.focus(); }
      }
    };
    document.addEventListener("keydown", key);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", key); document.body.style.overflow = prev; opener?.focus?.(); };
  }, [go, onClose]);
  return (
    <div className="modal-bg" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="rd-title" ref={ref}>
        <div className="reader">
          <div className="reader-top">
            <div>
              <h2 id="rd-title">{s.title}</h2>
              <p className="small muted" style={{ marginTop: 4 }}>Sample book · {pageCount} pages</p>
            </div>
            <button type="button" className="btn btn-line btn-sm" onClick={onClose} data-first>Close</button>
          </div>
          <div className="reader-stage">
            <div key={i} className={pages.length === 1 ? "sample-spread sample-spread-single" : "sample-spread"}>
              {pages.map((page) => <IllustratedPage key={page.kind} story={story} page={page} />)}
            </div>
          </div>
          <div className="reader-nav">
            <button type="button" className="btn btn-line btn-sm" onClick={() => go(-1)} disabled={i === 0}>← Previous</button>
            <span className="count" aria-live="polite">{pageLabel} of {pageCount}</span>
            <button type="button" className="btn btn-dark btn-sm" onClick={() => go(1)} disabled={i === total - 1}>Next →</button>
          </div>
          {footer}
        </div>
      </div>
    </div>
  );
}

export function Price({ cents, was, label }: { cents: number; was?: number | null; label?: string | null }) {
  return (
    <span className="price">
      <span className="now">{euro(cents)}</span>
      {was ? <><s aria-label={`was ${euro(was)}`}>{euro(was)}</s>{label ? <span className="sale-pill">{label}</span> : null}</> : null}
    </span>
  );
}
