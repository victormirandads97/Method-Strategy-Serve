import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { B, INTER, MONO, alpha } from "@/lib/brand";
import MagneticButton from "@/components/motion/MagneticButton";
import { CV_URL } from "@/lib/contact";
import BrandMark from "@/components/site/BrandMark";

export const NAV_LINKS = [
  { label: "Work", href: "#work" },
  { label: "Skills", href: "#skills" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Contact", href: "#contact" },
] as const;

/**
 * Fixed nav carrying the full brand lockup: mark, "The Method Co." in the
 * display face, and the "by Victor Miranda" byline in mono underneath. The bar
 * stays transparent over the hero and picks up a blur and a hairline border
 * once the page starts scrolling.
 */
export default function Nav({ hrefBase = "" }: { hrefBase?: string } = {}) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -70, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 200,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          padding: "0 5vw",
          height: 74,
          background: scrolled ? alpha(B.bg, 0.78) : "transparent",
          backdropFilter: scrolled ? "blur(18px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(18px)" : "none",
          borderBottom: `1px solid ${scrolled ? B.border : "transparent"}`,
          transition: "background 0.3s ease, border-color 0.3s ease",
        }}
      >
        {/* Brand lockup */}
        <a
          href="/"
          aria-label="The Method Co. by Victor Miranda, home"
          style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
        >
          <BrandMark size={38} />
          <span
            aria-hidden="true"
            style={{ width: 1, height: 28, background: alpha(B.white, 0.3) }}
          />
          <span style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span
              style={{
                ...INTER,
                fontWeight: 700,
                color: B.white,
                fontSize: "0.98rem",
                lineHeight: 1,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}
            >
              The Method Co<span style={{ color: B.green }}>.</span>
            </span>
            <span
              style={{
                ...MONO,
                color: B.muted,
                fontSize: "0.58rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                lineHeight: 1,
              }}
            >
              by Victor Miranda
            </span>
          </span>
        </a>

        {/* Desktop links */}
        <div
          className="nav-center"
          style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
        >
          {NAV_LINKS.map(({ label, href }) => (
            <a
              key={label}
              href={`${hrefBase}${href}`}
              className="nav-link"
              style={{
                ...INTER,
                fontWeight: 400,
                color: B.textSoft,
                fontSize: "0.85rem",
                padding: "0.4rem 0.8rem",
                borderRadius: 3,
                transition: "color 0.18s ease",
              }}
            >
              {label}
            </a>
          ))}
          {CV_URL && (
            <a
              href={CV_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="nav-link"
              style={{
                ...INTER,
                fontWeight: 400,
                color: B.textSoft,
                fontSize: "0.85rem",
                padding: "0.4rem 0.8rem",
                borderRadius: 3,
                transition: "color 0.18s ease",
              }}
            >
              CV
            </a>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span className="nav-cta">
            <MagneticButton
              href={`${hrefBase}#contact`}
              variant="solid"
              pull={8}
              style={{ padding: "0.65rem 1.25rem", fontSize: "0.85rem" }}
            >
              Get in touch
            </MagneticButton>
          </span>
          <button
            className="hamburger"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            style={{
              display: "none",
              background: "none",
              border: "none",
              color: B.text,
              cursor: "pointer",
              padding: "0.4rem",
            }}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" style={{ width: 22, height: 22 }}>
              {open ? (
                <path
                  d="M18 6L6 18M6 6l12 12"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  fill="none"
                />
              ) : (
                <path
                  d="M3 6h18M3 12h18M3 18h18"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  fill="none"
                />
              )}
            </svg>
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "fixed",
              top: 74,
              left: 0,
              right: 0,
              zIndex: 195,
              background: alpha(B.surface, 0.97),
              backdropFilter: "blur(18px)",
              WebkitBackdropFilter: "blur(18px)",
              borderBottom: `1px solid ${B.border}`,
              padding: "1rem 5vw 1.75rem",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={`${hrefBase}${href}`}
                onClick={() => setOpen(false)}
                style={{
                  ...INTER,
                  color: B.textSoft,
                  fontSize: "1rem",
                  padding: "0.85rem 0",
                  borderBottom: `1px solid ${B.border}`,
                }}
              >
                {label}
              </a>
            ))}
            {CV_URL && (
              <a
                href={CV_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                style={{
                  ...INTER,
                  color: B.textSoft,
                  fontSize: "1rem",
                  padding: "0.85rem 0",
                  borderBottom: `1px solid ${B.border}`,
                }}
              >
                View CV
              </a>
            )}
            <a
              href={`${hrefBase}#contact`}
              onClick={() => setOpen(false)}
              style={{
                ...INTER,
                fontWeight: 600,
                background: B.green,
                color: B.bg,
                textAlign: "center",
                padding: "0.95rem",
                borderRadius: 10,
                marginTop: "1.25rem",
                fontSize: "0.95rem",
              }}
            >
              Get in touch
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
