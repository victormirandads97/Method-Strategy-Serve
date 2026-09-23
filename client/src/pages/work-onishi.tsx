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
import { useHasShots } from "@/lib/project-media";

/**
 * Case study for Onishi, the flagship. Laid out for a recruiter's scan: the
 * problem, the solution, my role, the product decisions, why it is useful, and
 * where it runs today. Same page shell as /work/dezorzi.
 *
 * Every claim here is backed by the Onishi codebase. Keep it that way: no
 * user counts or metrics unless they can be shown.
 */

const PROJECT_ID = "onishi";

const LIVE_URL = "https://onishi.onrender.com";

const STACK = [
  "React",
  "TypeScript",
  "Express",
  "SQLite",
  "Session auth",
  "Tiptap rich text",
  "Tailwind",
  "Vite",
  "PWA",
  "Render",
] as const;

interface Step {
  num: string;
  title: string;
  lede: string;
  body?: readonly string[];
  list?: readonly string[];
}

const STEPS: readonly Step[] = [
  {
    num: "01",
    title: "THE PROBLEM",
    lede: "Restaurant teams run on scattered information, verbal handovers, and tools that were never designed for service.",
    body: [
      "On a restaurant floor the roster lives on paper, day off requests arrive in a group chat, and the hours someone actually worked are whatever gets remembered at the end of the week. Nothing lives in one place, and nothing is reliable when it matters.",
      "I did not find this problem in a brief. I knew it first-hand from years in professional kitchens, where the admin around a shift is often harder to manage than the shift itself.",
    ],
  },
  {
    num: "02",
    title: "THE SOLUTION",
    lede: "One lightweight app for the floor, built around how a service team actually works.",
    body: [
      "Roster building, with holidays shown on the roster so everyone can see who is away. Day off and holiday requests made as a date range. Actual-hours logging and overtime tracking. A sales-per-hour leaderboard, shared checklists, and rich-text notes that can go to specific people or the whole team.",
      "A daily quiz in the break room, on food, drinks and general knowledge, gives staff a reason to open the app when nothing is urgent.",
      "Managers and sub-managers share the day-to-day controls. Only the admin manages accounts and roles, including password resets.",
    ],
  },
  {
    num: "03",
    title: "MY ROLE",
    lede: "Everything, from the problem to the deploy.",
    body: [
      "Product design, UX, frontend, backend, database and deployment. I worked out what the app needed to do from the problems the team already had, designed the screens, built the React and TypeScript client and the Express API, modelled the data in SQLite, and run it in production on Render.",
    ],
  },
  {
    num: "04",
    title: "KEY DECISIONS",
    lede: "Most of the product is in the calls about what it should and should not do.",
    list: [
      "An installable PWA rather than an app store release, so staff open it from their home screen on the phones they already carry.",
      "Staff confirm the hours they actually worked, and anything that matches the roster is accepted automatically, so managers only review the differences.",
      "Staff are deactivated rather than deleted, so rosters and hours history stay intact when someone leaves.",
      "The existing paper roster was imported into the app, so the team started with their real week instead of an empty screen.",
      "Database changes are strictly additive, on a persistent disk, so shipping a release never wipes the data the team depends on.",
    ],
  },
  {
    num: "05",
    title: "WHY IT WORKS",
    lede: "It replaces the group chat and the paper, not the people.",
    body: [
      "Everything a floor team needs between shifts sits in one place, on a phone. Managers stop chasing hours and availability over messages, staff can see their roster and prove the hours they worked, and the history stays in the app instead of disappearing up a chat thread.",
    ],
  },
  {
    num: "06",
    title: "STATUS",
    lede: "Live in production.",
    body: [
      "Deployed on Render as an installable PWA, with a persistent SQLite database and session-based sign-in. Staff accounts and the first real roster were loaded from the team's existing records, and new features have shipped to the live app since.",
    ],
  },
];

const FACTS = [
  { k: "Role", v: "Product, design, full stack and deploy" },
  { k: "Status", v: "Live in production" },
  { k: "Type", v: "Restaurant-floor team app" },
  { k: "Deploy", v: "Render, installable PWA" },
] as const;

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ ...LABEL, color: B.cyan, fontSize: "0.62rem", letterSpacing: "0.14em",
      marginBottom: "0.85rem" }}>
      // {children}
    </p>
  );
}

export default function WorkOnishi() {
  const hasShots = useHasShots(PROJECT_ID, 4);
  useEffect(() => {
    document.title = "Onishi case study | The Method Co.";
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
          .cs-hero > * { flex: 0 0 auto !important; width: 100% !important; }
          .cs-step { grid-template-columns: 1fr !important; gap: 1rem !important; }
        }
        @media (max-width: 480px) {
          .cs-facts { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* The nav lives on the home page, so its section links need to go there. */}
      <Nav hrefBase="/" />

      <main>
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
                  <SectionLabel>CASE STUDY / FLAGSHIP</SectionLabel>
                  <h1 style={{ ...BEBAS, fontSize: "clamp(3rem, 8vw, 5.5rem)", lineHeight: 0.9,
                    letterSpacing: "0.01em", textTransform: "uppercase", color: B.cream,
                    margin: "0 0 0.7rem" }}>
                    Onishi
                  </h1>
                  <p style={{ ...MONO, color: B.cyan, fontSize: "0.85rem", letterSpacing: "0.02em",
                    marginBottom: "0.9rem" }}>
                    Restaurant operations, simplified.
                  </p>
                  <p style={{ ...INTER, fontWeight: 300, color: B.creamSoft,
                    fontSize: "clamp(1.05rem, 2vw, 1.25rem)", lineHeight: 1.6,
                    maxWidth: 480, marginBottom: "1.5rem" }}>
                    A restaurant-floor app for rosters, hours, time off and team
                    communication, designed from first-hand hospitality experience
                    and live in production.
                  </p>
                  <p style={{ ...MONO, color: B.muted, fontSize: "0.78rem", lineHeight: 1.7,
                    maxWidth: 480, marginBottom: "1.75rem" }}>
                    React, TypeScript, Express, SQLite, session auth, PWA, Render.
                  </p>
                  {LIVE_URL && (
                    <a href={LIVE_URL} target="_blank" rel="noopener noreferrer"
                      style={{ ...BEBAS, fontSize: "0.9rem", letterSpacing: "0.1em",
                        textTransform: "uppercase", color: B.black, background: B.cyan,
                        padding: "0.75rem 1.5rem", borderRadius: 4, textDecoration: "none",
                        display: "inline-block" }}>
                      Open the live app (staff sign-in)
                    </a>
                  )}
                </Reveal>
              </div>

              <Reveal delay={0.1} style={{ flex: "1 1 460px", minWidth: 0, width: "100%" }}>
                <ProjectPreview
                  projectId={PROJECT_ID}
                  name="Onishi"
                  height={320}
                  frameUrl="onishi.onrender.com"
                />
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── FACTS + STACK ────────────────────────────────────────────────────── */}
        <section aria-label="Project facts" style={{ position: "relative", padding: "0 5vw 72px", zIndex: 1 }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <Reveal>
              <dl className="cs-facts" style={{ display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)", gap: "1px",
                border: `1px solid ${B.border}`, background: B.border,
                borderRadius: 6, overflow: "hidden", margin: "0 0 1.75rem" }}>
                {FACTS.map(fact => (
                  <div key={fact.k} style={{ background: B.ink, padding: "1.1rem 1.25rem" }}>
                    <dt style={{ ...LABEL, color: B.cyan, fontSize: "0.52rem", margin: "0 0 0.5rem" }}>
                      {fact.k}
                    </dt>
                    <dd style={{ ...INTER, fontWeight: 400, color: B.cream, fontSize: "0.9rem",
                      lineHeight: 1.4, margin: 0 }}>
                      {fact.v}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>

            <Reveal delay={0.06}>
              <ul aria-label="Built with" style={{ listStyle: "none", padding: 0, margin: 0,
                display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {STACK.map(item => (
                  <li key={item} style={{ ...MONO, fontSize: "0.72rem", color: B.creamSoft,
                    border: `1px solid ${alpha(B.blueBright, 0.3)}`,
                    background: alpha(B.blueBright, 0.06),
                    padding: "0.3rem 0.7rem", borderRadius: 3 }}>
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>

        {/* ── THE CASE ─────────────────────────────────────────────────────────── */}
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
                    {step.body?.map((para, j) => (
                      <p key={j} style={{ ...INTER, fontWeight: 300, color: B.creamSoft,
                        fontSize: "1rem", lineHeight: 1.8, marginBottom: "1rem", maxWidth: 620 }}>
                        {para}
                      </p>
                    ))}
                    {step.list && (
                      <ul style={{ listStyle: "none", padding: 0, margin: 0, maxWidth: 620,
                        display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                        {step.list.map(item => (
                          <li key={item} style={{ ...INTER, fontWeight: 300, color: B.creamSoft,
                            fontSize: "1rem", lineHeight: 1.7, paddingLeft: "1.1rem",
                            borderLeft: `2px solid ${alpha(B.cyan, 0.45)}` }}>
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── SCREENS ──────────────────────────────────────────────────────────── */}
        {/* Renders nothing until screenshots with demo data are in
            client/public/media/projects/onishi/. The originals showed real
            staff names and were withheld. */}
        {hasShots && (
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
                <ProjectGallery projectId={PROJECT_ID} name="Onishi" minShots={4} />
              </Reveal>
            </div>
          </section>
        )}

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
      </main>
    </div>
  );
}
