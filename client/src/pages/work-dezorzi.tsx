import { useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { B, BEBAS, INTER, LABEL, MONO, alpha } from "@/lib/brand";
import Nav from "@/components/site/Nav";
import Contact from "@/components/site/Contact";
import AuroraBackdrop from "@/components/motion/AuroraBackdrop";
import GrainOverlay from "@/components/motion/GrainOverlay";
import ScrollProgress from "@/components/motion/ScrollProgress";
import Reveal from "@/components/motion/Reveal";
import { ProjectGallery, ProjectPreview } from "@/components/site/ProjectMedia";

/**
 * Case study for Dezorzi, structured on the four-step framework the rest of
 * the site runs on: Diagnose, Design, Deploy, Deliver.
 *
 * Screenshots come from client/public/media/projects/dezorzi/ by the shared
 * convention, so any slot without a file yet renders a labelled placeholder
 * rather than a gap. See @/lib/project-media.
 */

const PROJECT_ID = "dezorzi";

// Set once the Render deploy has a URL. Empty keeps the button off the page
// rather than linking somewhere that 404s.
const LIVE_URL = "";

const STACK = [
  "React",
  "TypeScript",
  "Node",
  "SQLite",
  "Google Places",
  "Claude API",
  "MapLibre",
  "Render",
] as const;

interface Step {
  num: string;
  title: string;
  lede: string;
  body: readonly string[];
}

const STEPS: readonly Step[] = [
  {
    num: "01",
    title: "DIAGNOSE",
    lede: "Planning a trip across several cities breaks every tool you reach for.",
    body: [
      "A multi-city trip is not one list. It is a set of cities, each with its own days, its own stops and its own geography, and the tools people actually use do not know that. A spreadsheet has no map. A map has no days. Notes have neither.",
      "The failure that costs real time is subtle: a place gets added to the wrong city. You search a restaurant name, the result you tap is the branch in the other city, and nothing tells you. You find out on the day, standing in the wrong place.",
      "The second gap is distance. A day can look fine as a list of four stops and be impossible once you know the third one is forty minutes out and back.",
    ],
  },
  {
    num: "02",
    title: "DESIGN",
    lede: "Make the city the unit, and make the map the thing that checks your work.",
    body: [
      "Every trip is built city by city. A city owns its days, its stops and its bounds, and a per-city guard checks every place against the city it is being added to. A result from the wrong city is refused at the point of adding it, not flagged later.",
      "Search runs at neighbourhood level through Google Places, so looking for somewhere to eat in one quarter of a city returns that quarter rather than the whole metro area.",
      "Travel time is worked out per leg and shown against the day it belongs to, so a day that does not fit reads as one that does not fit while you are still building it.",
      "The itinerary and the map are two views of the same data. Stops are numbered in order and coloured by day, and that colouring carries through everywhere the trip is drawn.",
    ],
  },
  {
    num: "03",
    title: "DEPLOY",
    lede: "React and TypeScript on the front, Node and SQLite behind, running on Render.",
    body: [
      "The map is MapLibre with custom styling, pulled down to a dark base so the route and the day colours are the brightest thing on it rather than competing with road fills and labels.",
      "Google Places supplies search and place detail. The Claude API handles the language side of planning, turning a loose description of a day into stops that can be checked against the city.",
      "Both of those are paid per call, so an admin dashboard tracks cost per provider. Knowing which provider a feature spends on is what makes it possible to decide whether that feature is worth keeping.",
      "The share image is the piece that had to be exact. It is drawn server side using the same projection as the map, so the route on the exported image is the real route, at the real shape, not an approximation redrawn to fit a frame.",
    ],
  },
  {
    num: "04",
    title: "DELIVER",
    lede: "A trip you can build in one sitting, and an image worth sending.",
    body: [
      "The result is a planner where the map is not decoration. It holds the constraint that a stop belongs to a city, it shows what a day costs in travel, and it produces something at the end that is worth sharing.",
      "The share image carries the trip title, the dates, the stop count, the route drawn in the day colours, the day headings and the totals for distance, planned spend and travelling days. It is the whole trip in one frame.",
    ],
  },
];

const FACTS = [
  { k: "Role", v: "Designed and built end to end" },
  { k: "Status", v: "Live" },
  { k: "Type", v: "Multi-city trip planner" },
  { k: "Deploy", v: "Render" },
] as const;

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ ...LABEL, color: B.cyan, fontSize: "0.62rem", letterSpacing: "0.14em",
      marginBottom: "0.85rem" }}>
      // {children}
    </p>
  );
}

export default function WorkDezorzi() {
  useEffect(() => {
    document.title = "Dezorzi case study | The Method Co.";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ background: B.black, minHeight: "100vh", color: B.cream,
      overflowX: "hidden", position: "relative" }}>

      <ScrollProgress />
      <AuroraBackdrop />
      <GrainOverlay />

      <style>{`
        @media (max-width: 900px) {
          .cs-hero { flex-direction: column !important; align-items: stretch !important; }
          /* Once stacked, flex-basis applies to height and leaves a dead gap
             between the copy and the screenshot. Let both size to content. */
          .cs-hero > * { flex: 0 0 auto !important; width: 100% !important; }
          .cs-step { grid-template-columns: 1fr !important; gap: 1rem !important; }
        }
        @media (max-width: 480px) {
          .cs-facts { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* The nav lives on the home page, so its section links need to go there. */}
      <Nav hrefBase="/" />

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section style={{ position: "relative", padding: "132px 5vw 72px", zIndex: 1 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Reveal>
            <Link
              href="/#work"
              style={{ ...MONO, color: B.muted, fontSize: "0.76rem",
                textDecoration: "none", display: "inline-flex", alignItems: "center",
                gap: "0.45rem", marginBottom: "1.75rem" }}>
              <span aria-hidden="true">&larr;</span> Back to work
            </Link>
          </Reveal>

          <div className="cs-hero" style={{ display: "flex",
            gap: "clamp(1.75rem, 4vw, 3.5rem)", alignItems: "center" }}>
            <div style={{ flex: "1 1 380px", minWidth: 0 }}>
              <Reveal>
                <SectionLabel>CASE STUDY</SectionLabel>
                <h1 style={{ ...BEBAS, fontSize: "clamp(3rem, 8vw, 5.5rem)", lineHeight: 0.9,
                  letterSpacing: "0.01em", textTransform: "uppercase", color: B.cream,
                  margin: "0 0 0.7rem" }}>
                  Dezorzi
                </h1>
                <p style={{ ...INTER, fontWeight: 300, color: B.creamSoft,
                  fontSize: "clamp(1.05rem, 2vw, 1.25rem)", lineHeight: 1.6,
                  maxWidth: 480, marginBottom: "1.5rem" }}>
                  A multi-city trip planner that builds a real route, city by city,
                  and exports it as an image worth sending.
                </p>
                <p style={{ ...MONO, color: B.muted, fontSize: "0.78rem", lineHeight: 1.7,
                  maxWidth: 480, marginBottom: "1.75rem" }}>
                  React, TypeScript, Node, SQLite, Google Places, Claude API,
                  MapLibre with custom styling, Render.
                </p>
                {LIVE_URL && (
                  <a href={LIVE_URL} target="_blank" rel="noopener noreferrer"
                    style={{ ...BEBAS, fontSize: "0.9rem", letterSpacing: "0.1em",
                      textTransform: "uppercase", color: B.black, background: B.cyan,
                      padding: "0.75rem 1.5rem", borderRadius: 4, textDecoration: "none",
                      display: "inline-block" }}>
                    Open the live app
                  </a>
                )}
              </Reveal>
            </div>

            <Reveal delay={0.1} style={{ flex: "1 1 460px", minWidth: 0, width: "100%" }}>
              <ProjectPreview
                projectId={PROJECT_ID}
                name="Dezorzi"
                height={320}
                frameUrl="dezorzi.onrender.com"
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── FACTS + STACK ────────────────────────────────────────────────────── */}
      <section style={{ position: "relative", padding: "0 5vw 72px", zIndex: 1 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Reveal>
            <div className="cs-facts" style={{ display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)", gap: "1px",
              border: `1px solid ${B.border}`, background: B.border,
              borderRadius: 6, overflow: "hidden", marginBottom: "1.75rem" }}>
              {FACTS.map(fact => (
                <div key={fact.k} style={{ background: B.ink, padding: "1.1rem 1.25rem" }}>
                  <p style={{ ...LABEL, color: B.cyan, fontSize: "0.52rem", margin: "0 0 0.5rem" }}>
                    {fact.k}
                  </p>
                  <p style={{ ...INTER, fontWeight: 400, color: B.cream, fontSize: "0.9rem",
                    lineHeight: 1.4, margin: 0 }}>
                    {fact.v}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.06}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {STACK.map(item => (
                <span key={item} style={{ ...MONO, fontSize: "0.72rem", color: B.creamSoft,
                  border: `1px solid ${alpha(B.blueBright, 0.3)}`,
                  background: alpha(B.blueBright, 0.06),
                  padding: "0.3rem 0.7rem", borderRadius: 3 }}>
                  {item}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── THE FOUR STEPS ───────────────────────────────────────────────────── */}
      <section style={{ position: "relative", padding: "0 5vw 88px", zIndex: 1 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          {STEPS.map((step, i) => (
            <Reveal key={step.num} delay={0.04}>
              <div className="cs-step" style={{
                display: "grid", gridTemplateColumns: "180px 1fr",
                gap: "clamp(1.5rem, 4vw, 3rem)",
                padding: "2.5rem 0",
                borderTop: i === 0 ? "none" : `1px solid ${B.border}`,
              }}>
                <div>
                  <div style={{
                    width: 44, height: 44, borderRadius: "50%",
                    border: `1px solid ${alpha(B.cyan, 0.45)}`,
                    background: alpha(B.cyan, 0.07),
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginBottom: "0.9rem",
                  }}>
                    <span style={{ ...MONO, fontWeight: 600, color: B.cyan, fontSize: "0.78rem" }}>
                      {step.num}
                    </span>
                  </div>
                  <h2 style={{ ...BEBAS, fontSize: "clamp(1.8rem, 4vw, 2.3rem)",
                    lineHeight: 1, letterSpacing: "0.02em", textTransform: "uppercase",
                    color: B.cream, margin: 0 }}>
                    {step.title}
                  </h2>
                </div>

                <div>
                  <p style={{ ...INTER, fontWeight: 400, color: B.cream,
                    fontSize: "clamp(1.05rem, 2vw, 1.2rem)", lineHeight: 1.5,
                    marginBottom: "1.25rem", maxWidth: 620 }}>
                    {step.lede}
                  </p>
                  {step.body.map((para, j) => (
                    <p key={j} style={{ ...INTER, fontWeight: 300, color: B.creamSoft,
                      fontSize: "1rem", lineHeight: 1.8, marginBottom: "1rem", maxWidth: 620 }}>
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── SCREENS ──────────────────────────────────────────────────────────── */}
      <section style={{ position: "relative", padding: "0 5vw 96px", zIndex: 1 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Reveal>
            <SectionLabel>SCREENS</SectionLabel>
            <h2 style={{ ...BEBAS, fontSize: "clamp(2.2rem, 5vw, 3.2rem)", lineHeight: 0.95,
              letterSpacing: "0.01em", textTransform: "uppercase", color: B.cream,
              margin: "0 0 1.75rem" }}>
              The real thing
            </h2>
          </Reveal>
          <Reveal delay={0.06}>
            {/* Four named slots: the share image, plus the three screens still
                to be captured. Each keeps its caption until the file lands. */}
            <ProjectGallery projectId={PROJECT_ID} name="Dezorzi" minShots={4} />
          </Reveal>
        </div>
      </section>

      {/* ── NEXT ─────────────────────────────────────────────────────────────── */}
      <section style={{ position: "relative", padding: "0 5vw 96px", zIndex: 1 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{
              borderTop: `1px solid ${B.border}`, paddingTop: "2.5rem",
              display: "flex", flexWrap: "wrap", gap: "1.5rem",
              alignItems: "center", justifyContent: "space-between",
            }}>
            <p style={{ ...INTER, fontWeight: 300, color: B.creamSoft, fontSize: "1rem",
              lineHeight: 1.6, margin: 0, maxWidth: 420 }}>
              Every project on the site is built and shipped the same way.
            </p>
            <Link href="/#work"
              style={{ ...BEBAS, fontSize: "0.9rem", letterSpacing: "0.1em",
                textTransform: "uppercase", color: B.cyan, textDecoration: "none",
                display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
              See the rest of the work <span aria-hidden="true">&rarr;</span>
            </Link>
          </motion.div>
        </div>
      </section>

      <Contact />
    </div>
  );
}
