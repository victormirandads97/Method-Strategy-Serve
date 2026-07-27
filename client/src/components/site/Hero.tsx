import { motion } from "framer-motion";
import { B, BEBAS, INTER, LABEL, MONO, alpha } from "@/lib/brand";
import ParticleField from "@/components/motion/ParticleField";
import WordReveal from "@/components/motion/WordReveal";
import ScrambleText from "@/components/motion/ScrambleText";
import MagneticButton from "@/components/motion/MagneticButton";

const PORTRAIT =
  "https://res.cloudinary.com/dsriscylr/image/upload/v1772066810/freepik__remove-red-and-purple-lighting-cast-completely-neu__56027_joywsg.jpg";

/** Module-level so the scramble effect keeps a stable reference across renders. */
const BUILDS = [
  "restaurant software",
  "AI chatbots",
  "landing pages",
  "product launches",
] as const;

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] as const },
});

export default function Hero() {
  return (
    <section
      className="hero"
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        padding: "108px 5vw 88px",
        overflow: "hidden",
        zIndex: 1,
      }}
    >
      <ParticleField colour={B.blueBright} />

      {/* Settles the copy back onto the black so the constellation never fights it. */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(180deg, transparent 0%, transparent 62%, ${B.black} 100%)`,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: 1160,
          margin: "0 auto",
          width: "100%",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div
          className="hero-cols"
          style={{ display: "flex", gap: "4rem", alignItems: "center" }}
        >
          {/* ── Copy ─────────────────────────────────────────────────────── */}
          <div style={{ flex: "1 1 560px", minWidth: 0 }}>
            <motion.p
              {...fadeUp(0.05)}
              style={{
                ...LABEL,
                color: B.blueBright,
                fontSize: "0.64rem",
                marginBottom: "1.2rem",
              }}
            >
              Portfolio / Dublin, Ireland
            </motion.p>

            <WordReveal
              text="I turn ideas into working products."
              accentFrom={4}
              delay={0.18}
              style={{
                ...BEBAS,
                fontSize: "clamp(2.9rem, 6.2vw, 5rem)",
                lineHeight: 0.9,
                letterSpacing: "0.01em",
                marginBottom: "1.3rem",
                maxWidth: 620,
              }}
            />

            <motion.p
              {...fadeUp(0.5)}
              style={{
                ...INTER,
                fontWeight: 300,
                color: B.creamSoft,
                fontSize: "clamp(1rem, 1.6vw, 1.1rem)",
                lineHeight: 1.6,
                maxWidth: 500,
                marginBottom: "1.5rem",
              }}
            >
              Chef turned builder. I ship real software with AI, products people
              use every day.
            </motion.p>

            {/* Rotating proof line */}
            <motion.p
              {...fadeUp(0.62)}
              style={{
                ...MONO,
                color: B.muted,
                fontSize: "0.82rem",
                letterSpacing: "0.04em",
                marginBottom: "2rem",
                display: "flex",
                alignItems: "baseline",
                gap: "0.55rem",
                flexWrap: "wrap",
              }}
            >
              <span>I build</span>
              <span style={{ color: B.blueBright }}>
                <ScrambleText words={BUILDS} />
              </span>
            </motion.p>

            <motion.div
              {...fadeUp(0.74)}
              className="hero-actions"
              style={{
                display: "flex",
                gap: "1.75rem",
                flexWrap: "wrap",
                alignItems: "center",
                marginBottom: "1.9rem",
              }}
            >
              <MagneticButton href="#work" variant="solid">
                See the work
                <svg viewBox="0 0 24 24" style={{ width: 15, height: 15 }}>
                  <path
                    d="M5 12h14M12 5l7 7-7 7"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              </MagneticButton>
              <MagneticButton href="#contact" variant="ghost">
                Get in touch
              </MagneticButton>
            </motion.div>

            <motion.p
              {...fadeUp(0.86)}
              style={{
                ...MONO,
                color: B.muted,
                fontSize: "0.72rem",
                letterSpacing: "0.06em",
              }}
            >
              // Four products shipped. One live in production. Not slideware.
            </motion.p>
          </div>

          {/* ── Portrait ─────────────────────────────────────────────────── */}
          <motion.div
            className="hero-media"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{
              flex: "0 0 40%",
              minWidth: 0,
              position: "relative",
              alignSelf: "stretch",
              minHeight: 400,
              maxHeight: "72vh",
              borderRadius: 4,
              overflow: "hidden",
            }}
          >
            <img
              src={PORTRAIT}
              alt="Victor Miranda"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                filter: "grayscale(55%) contrast(1.1) brightness(0.92)",
              }}
            />
            {/* Feather the portrait into the page rather than boxing it in. */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: `linear-gradient(100deg, ${B.black} 0%, ${alpha(B.black, 0.45)} 42%, transparent 100%)`,
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: `linear-gradient(0deg, ${B.black} 0%, transparent 38%, transparent 78%, ${B.black} 100%)`,
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: alpha(B.blue, 0.12),
                mixBlendMode: "color",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: "1.6rem",
                bottom: "1.6rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.4rem",
              }}
            >
              <span
                style={{
                  ...LABEL,
                  color: B.blueBright,
                  fontSize: "0.58rem",
                }}
              >
                Building in Dublin
              </span>
              <span
                style={{
                  ...BEBAS,
                  color: B.cream,
                  fontSize: "1.5rem",
                  letterSpacing: "0.1em",
                  lineHeight: 1,
                }}
              >
                Victor Miranda
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.2 }}
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: "2rem",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.6rem",
          zIndex: 2,
        }}
      >
        <span
          style={{
            ...LABEL,
            color: B.muted,
            fontSize: "0.55rem",
          }}
        >
          Scroll
        </span>
        <span
          style={{
            width: 1,
            height: 34,
            background: `linear-gradient(180deg, ${B.blueBright}, transparent)`,
            animation: "scrollCue 2.2s ease-in-out infinite",
          }}
        />
      </motion.div>
    </section>
  );
}
