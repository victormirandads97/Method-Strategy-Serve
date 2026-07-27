import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { B, BEBAS, INTER, LABEL, MONO, alpha } from "@/lib/brand";
import { CONTACT_ROUTES, type ContactRoute } from "@/lib/contact";
import Reveal from "@/components/motion/Reveal";
import TiltCard from "@/components/motion/TiltCard";
import MagneticButton from "@/components/motion/MagneticButton";

const FACTS = [
  { label: "Based", value: "Dublin, Ireland" },
  { label: "Open to", value: "Roles and freelance" },
  { label: "Replies", value: "Usually same day" },
] as const;

function RouteIcon({ kind }: { kind: ContactRoute["icon"] }) {
  return (
    <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, display: "block" }}>
      {kind === "company" ? (
        <>
          <path
            d="M3 21h18M5 21V7l7-4 7 4v14"
            stroke={B.blueBright}
            strokeWidth="1.4"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M9 21v-5h6v5"
            stroke={B.blueBright}
            strokeWidth="1.4"
            strokeLinejoin="round"
            fill="none"
          />
        </>
      ) : (
        <>
          <circle
            cx="12"
            cy="8"
            r="3.6"
            stroke={B.blueBright}
            strokeWidth="1.4"
            fill="none"
          />
          <path
            d="M4.5 20a7.5 7.5 0 0115 0"
            stroke={B.blueBright}
            strokeWidth="1.4"
            strokeLinecap="round"
            fill="none"
          />
        </>
      )}
    </svg>
  );
}

function CopyButton({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const copy = async () => {
    if (timer.current) clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setFailed(false);
    } catch {
      // Clipboard can be blocked by permissions or an insecure origin.
      setFailed(true);
      setCopied(false);
    }
    timer.current = setTimeout(() => {
      setCopied(false);
      setFailed(false);
    }, 1900);
  };

  const label = copied ? "Copied" : failed ? "Copy failed" : "Copy";

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copy ${email} to the clipboard`}
      style={{
        ...MONO,
        display: "inline-flex",
        alignItems: "center",
        gap: "0.45rem",
        background: "transparent",
        border: `1px solid ${copied ? B.green : B.line}`,
        color: copied ? B.green : B.creamSoft,
        borderRadius: 3,
        padding: "0.62rem 1rem",
        fontSize: "0.68rem",
        fontWeight: 600,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        cursor: "pointer",
        transition: "border-color 0.2s ease, color 0.2s ease",
        whiteSpace: "nowrap",
      }}
    >
      <svg viewBox="0 0 24 24" style={{ width: 13, height: 13 }}>
        {copied ? (
          <path
            d="M5 13l4 4L19 7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        ) : (
          <>
            <rect
              x="9"
              y="9"
              width="11"
              height="11"
              rx="2"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              d="M5 15V5a2 2 0 012-2h10"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
            />
          </>
        )}
      </svg>
      {label}
    </button>
  );
}

function RouteCard({ route }: { route: ContactRoute }) {
  return (
    <TiltCard
      style={{
        background: `linear-gradient(160deg, ${alpha(B.blue, 0.06)} 0%, ${B.ink} 55%)`,
        borderTop: `2px solid ${alpha(B.blue, 0.55)}`,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          padding: "clamp(1.5rem, 3vw, 2.1rem)",
          gap: "0.9rem",
        }}
      >
        <div
          style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
        >
          <span
            style={{
              width: 42,
              height: 42,
              borderRadius: 6,
              flexShrink: 0,
              background: alpha(B.blue, 0.1),
              border: `1px solid ${alpha(B.blue, 0.28)}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <RouteIcon kind={route.icon} />
          </span>
          <span style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <span
              style={{ ...LABEL, color: B.blueBright, fontSize: "0.54rem" }}
            >
              {route.tag}
            </span>
            <span
              style={{
                ...BEBAS,
                color: B.cream,
                fontSize: "1.35rem",
                letterSpacing: "0.06em",
                lineHeight: 1,
              }}
            >
              {route.name}
            </span>
          </span>
        </div>

        <a
          href={`mailto:${route.email}`}
          style={{
            ...MONO,
            color: B.cream,
            fontSize: "clamp(0.8rem, 1.5vw, 0.95rem)",
            letterSpacing: "0.01em",
            wordBreak: "break-all",
            borderBottom: `1px solid ${alpha(B.blue, 0.35)}`,
            paddingBottom: "0.5rem",
          }}
        >
          {route.email}
        </a>

        <p
          style={{
            ...INTER,
            fontWeight: 300,
            color: B.muted,
            fontSize: "0.86rem",
            lineHeight: 1.6,
            flex: 1,
          }}
        >
          {route.blurb}
        </p>

        <div
          style={{
            display: "flex",
            gap: "0.6rem",
            flexWrap: "wrap",
            alignItems: "center",
            marginTop: "0.2rem",
          }}
        >
          <a
            href={`mailto:${route.email}`}
            style={{
              ...MONO,
              display: "inline-flex",
              alignItems: "center",
              gap: "0.45rem",
              background: B.cream,
              color: "#0A0A0A",
              border: `1px solid ${B.cream}`,
              borderRadius: 3,
              padding: "0.62rem 1.15rem",
              fontSize: "0.68rem",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}
          >
            Send an email
            <svg viewBox="0 0 24 24" style={{ width: 13, height: 13 }}>
              <path
                d="M5 12h14M12 5l7 7-7 7"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </a>
          <CopyButton email={route.email} />
        </div>
      </div>
    </TiltCard>
  );
}

/**
 * Contact section. Two clearly separated routes, company and personal, each on
 * a tilting card with a cursor glow, plus a live availability strip so the page
 * answers "are you actually free" before anyone has to ask.
 */
export default function Contact() {
  return (
    <section
      id="contact"
      style={{ position: "relative", padding: "104px 5vw", zIndex: 1 }}
    >
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <Reveal>
          <p
            style={{
              ...LABEL,
              color: B.blueBright,
              fontSize: "0.62rem",
              marginBottom: "1rem",
            }}
          >
            // Contact
          </p>
          <h2
            style={{
              ...BEBAS,
              color: B.cream,
              fontSize: "clamp(2.6rem, 6vw, 4.4rem)",
              lineHeight: 0.92,
              marginBottom: "1.1rem",
            }}
          >
            Let's build something.
          </h2>
          <p
            style={{
              ...INTER,
              fontWeight: 300,
              color: B.creamSoft,
              fontSize: "1.05rem",
              lineHeight: 1.65,
              maxWidth: 560,
              marginBottom: "2.5rem",
            }}
          >
            I am open to product and builder roles, and to freelance builds. If
            you have something worth shipping, pick whichever inbox fits.
          </p>
        </Reveal>

        {/* Availability strip */}
        <Reveal index={1}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "clamp(1rem, 4vw, 2.5rem)",
              padding: "1rem 1.35rem",
              marginBottom: "1.5rem",
              borderRadius: 6,
              border: `1px solid ${B.border}`,
              background: alpha(B.panel, 0.55),
            }}
          >
            <span
              style={{
                ...MONO,
                display: "inline-flex",
                alignItems: "center",
                gap: "0.55rem",
                color: B.green,
                fontSize: "0.72rem",
                fontWeight: 600,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              <motion.span
                aria-hidden="true"
                animate={{ opacity: [1, 0.35, 1], scale: [1, 0.82, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: B.green,
                  boxShadow: `0 0 8px ${B.green}`,
                  display: "inline-block",
                }}
              />
              Available for work
            </span>

            {FACTS.map((fact) => (
              <span
                key={fact.label}
                style={{
                  display: "inline-flex",
                  alignItems: "baseline",
                  gap: "0.55rem",
                }}
              >
                <span
                  style={{ ...LABEL, color: B.muted, fontSize: "0.54rem" }}
                >
                  {fact.label}
                </span>
                <span
                  style={{
                    ...INTER,
                    color: B.creamSoft,
                    fontSize: "0.85rem",
                    fontWeight: 400,
                  }}
                >
                  {fact.value}
                </span>
              </span>
            ))}
          </div>
        </Reveal>

        {/* Two routes */}
        <div
          className="contact-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "1.25rem",
          }}
        >
          {CONTACT_ROUTES.map((route, i) => (
            <Reveal key={route.id} index={i + 2} style={{ height: "100%" }}>
              <RouteCard route={route} />
            </Reveal>
          ))}
        </div>

        {/* Closing line */}
        <Reveal index={4}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1.5rem",
              marginTop: "2.5rem",
            }}
          >
            <p
              style={{
                ...MONO,
                color: B.muted,
                fontSize: "0.74rem",
                letterSpacing: "0.04em",
              }}
            >
              // No forms. No autoresponders. The email goes straight to me.
            </p>
            <MagneticButton href="#work" variant="ghost" pull={9}>
              See the work first
            </MagneticButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
