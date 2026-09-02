import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { B } from "@/lib/brand";
import Nav from "@/components/site/Nav";
import Hero from "@/components/site/Hero";
import Contact from "@/components/site/Contact";
import { COMPANY_EMAIL, PERSONAL_EMAIL } from "@/lib/contact";
import AuroraBackdrop from "@/components/motion/AuroraBackdrop";
import GrainOverlay from "@/components/motion/GrainOverlay";
import ScrollProgress from "@/components/motion/ScrollProgress";
import { BrowserFrame, ProjectGallery, ProjectPreview } from "@/components/site/ProjectMedia";

// Personal contact + flagship live URL. Set ONISHI_URL when the deploy is ready.
const ONISHI_URL = "https://onishi.onrender.com"; // swap for a custom domain if you get one

// ── Brand tokens ──────────────────────────────────────────────────────────────
// Mapped onto the shared brand palette in @/lib/brand so this page matches
// /last-human-job: deep near-black, cream, blue accent.
const C = {
  bg:     B.black,
  panel:  B.ink,
  elev:   B.panel,
  accent: B.blueBright,
  glow:   B.blue,
  hi:     B.cyan,
  text:   B.cream,
  muted:  B.muted,
  border: B.border,
  green:  B.green,
  amber:  B.amber,
  red:    B.red,
} as const;

const EP:    React.CSSProperties = { fontFamily: "'Bebas Neue', sans-serif", fontWeight: 400, letterSpacing: "0.04em" };
const DM:    React.CSSProperties = { fontFamily: "'Inter', system-ui, sans-serif" };
const LBL:   React.CSSProperties = { fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.2em" };
const MONO:  React.CSSProperties = { fontFamily: "'JetBrains Mono', monospace" };

// The cards carry an interactive preview, so the card itself is a plain
// container and this is the real button inside it.
const CARD_CTA: React.CSSProperties = {
  ...EP, fontWeight: 700, color: C.accent, letterSpacing: "0.1em",
  textTransform: "uppercase", background: "none", border: "none",
  padding: 0, margin: 0, cursor: "pointer", alignSelf: "flex-start",
  display: "inline-flex", alignItems: "center",
};

// ── Shared components ─────────────────────────────────────────────────────────

function Reveal({ children, delay = 0, style: s }: {
  children: React.ReactNode; delay?: number; style?: React.CSSProperties;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      style={s}
    >
      {children}
    </motion.div>
  );
}

function SLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ ...LBL, color: C.accent, fontSize: "0.62rem", letterSpacing: "0.14em",
      marginBottom: "0.85rem" }}>
      // {children}
    </p>
  );
}

function SH({ children, style: s }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <h2 style={{
      ...EP, fontWeight: 900, lineHeight: 0.93, letterSpacing: "-0.01em", color: C.text,
      fontSize: "clamp(2.4rem, 5vw, 3.8rem)", marginBottom: "0.9rem",
      textTransform: "uppercase",
      textShadow: "0 0 80px rgba(61,214,245,0.15)",
      ...s,
    }}>{children}</h2>
  );
}

function Sub({ children, style: s }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <p style={{ ...DM, fontWeight: 300, color: C.muted, fontSize: "1rem", lineHeight: 1.7,
      maxWidth: 580, marginBottom: "2.75rem", ...s }}>
      {children}
    </p>
  );
}

function HR() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <div ref={ref} style={{ height: 1, overflow: "hidden", position: "relative" }}>
      <motion.div
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        style={{
          height: "100%",
          background: `linear-gradient(90deg, transparent 0%, ${C.accent}4d 20%, ${C.accent}4d 80%, transparent 100%)`,
          boxShadow: `0 0 8px ${C.accent}30`,
          transformOrigin: "left",
        }}
      />
    </div>
  );
}

// ── Icon system ───────────────────────────────────────────────────────────────
function Ic({ n, sz = 18, col = "currentColor" }: { n: string; sz?: number; col?: string }) {
  const p: Record<string, React.ReactNode> = {
    target:  <><circle cx="12" cy="12" r="9" strokeWidth="1.5" fill="none" stroke={col}/><circle cx="12" cy="12" r="5" strokeWidth="1.5" fill="none" stroke={col}/><circle cx="12" cy="12" r="1.5" fill={col}/></>,
    pen:     <><path d="M12 20H21" strokeWidth="1.5" strokeLinecap="round" fill="none" stroke={col}/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" stroke={col}/></>,
    layout:  <><rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="1.5" fill="none" stroke={col}/><path d="M3 9h18M9 21V9" strokeWidth="1.5" stroke={col} fill="none"/></>,
    cursor:  <path d="M5 3l14 9-7 1-4 7-3-17z" strokeWidth="1.5" strokeLinejoin="round" fill="none" stroke={col}/>,
    check:   <path d="M5 13l4 4L19 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" stroke={col}/>,
    x:       <><path d="M18 6L6 18" strokeWidth="2" strokeLinecap="round" stroke={col}/><path d="M6 6l12 12" strokeWidth="2" strokeLinecap="round" stroke={col}/></>,
    ig:      <><rect x="2" y="2" width="20" height="20" rx="5" strokeWidth="1.5" fill="none" stroke={col}/><circle cx="12" cy="12" r="4" strokeWidth="1.5" fill="none" stroke={col}/><circle cx="17.5" cy="6.5" r="1.2" fill={col}/></>,
    menu:    <path d="M3 6h18M3 12h18M3 18h18" strokeWidth="1.5" strokeLinecap="round" stroke={col} fill="none"/>,
    close:   <path d="M18 6L6 18M6 6l12 12" strokeWidth="1.5" strokeLinecap="round" stroke={col} fill="none"/>,
    arrow:   <path d="M5 12h14M12 5l7 7-7 7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" stroke={col}/>,
    chat:    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" fill="none" stroke={col} strokeWidth="1.5" strokeLinejoin="round"/>,
    brain:   <><path d="M12 2a7 7 0 00-7 7c0 2 .8 3.8 2 5l1 8h8l1-8a7 7 0 002-5 7 7 0 00-7-7z" fill="none" stroke={col} strokeWidth="1.5"/><path d="M9 14h6M10 17h4" stroke={col} strokeWidth="1.5" strokeLinecap="round"/></>,
    code:    <><path d="M8 6l-6 6 6 6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" stroke={col}/><path d="M16 6l6 6-6 6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" stroke={col}/></>,
    db:      <><ellipse cx="12" cy="5" rx="8" ry="3" strokeWidth="1.5" fill="none" stroke={col}/><path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5" strokeWidth="1.5" fill="none" stroke={col}/><path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3" strokeWidth="1.5" fill="none" stroke={col}/></>,
    rocket:  <><path d="M5 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2c.86-.86.86-2.14 0-3a2.12 2.12 0 00-3 0z" strokeWidth="1.5" fill="none" stroke={col} strokeLinejoin="round"/><path d="M9 12l3 3c4-1.5 7-5 7-10 0-1-.5-2-1-2-5 0-8.5 3-10 7z" strokeWidth="1.5" fill="none" stroke={col} strokeLinejoin="round"/><circle cx="14.5" cy="9.5" r="1.2" fill={col}/></>,
    card:    <><rect x="2" y="5" width="20" height="14" rx="2" strokeWidth="1.5" fill="none" stroke={col}/><path d="M2 10h20" strokeWidth="1.5" stroke={col}/></>,
    link:    <><path d="M10 13a5 5 0 007 0l3-3a5 5 0 00-7-7l-1 1" strokeWidth="1.5" fill="none" stroke={col} strokeLinecap="round"/><path d="M14 11a5 5 0 00-7 0l-3 3a5 5 0 007 7l1-1" strokeWidth="1.5" fill="none" stroke={col} strokeLinecap="round"/></>,
    spark:   <path d="M12 2l2.2 6.6L21 12l-6.8 3.4L12 22l-2.2-6.6L3 12l6.8-3.4L12 2z" strokeWidth="1.3" fill="none" stroke={col} strokeLinejoin="round"/>,
  };
  return (
    <svg viewBox="0 0 24 24" style={{ width: sz, height: sz, display: "block", flexShrink: 0 }}>
      {p[n] ?? null}
    </svg>
  );
}

// ── Demo loop helper (reused by the case-study demos) ─────────────────────────
function useDemoLoop(totalMs: number) {
  const [loopKey, setLoopKey] = useState(0);
  const [fading, setFading] = useState(false);
  useEffect(() => {
    const t1 = setTimeout(() => setFading(true), totalMs);
    const t2 = setTimeout(() => { setFading(false); setLoopKey(k => k + 1); }, totalMs + 600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [loopKey, totalMs]);
  return { loopKey, fading };
}

// ── Method Chat demo ──────────────────────────────────────────────────────────
interface ChatMsg { role: "user" | "bot"; text: string; }

const DEMO_MSGS: ChatMsg[] = [
  { role: "bot",  text: "Hi, thanks for messaging. How can I help?" },
  { role: "user", text: "Do you have a table for 4 tonight at 8?" },
  { role: "bot",  text: "Yes, 8pm for 4 works. What name should I put it under?" },
];

function DemoChatInner() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const ts = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 1400),
      setTimeout(() => setPhase(3), 2200),
      setTimeout(() => setPhase(4), 3400),
    ];
    return () => ts.forEach(clearTimeout);
  }, []);
  function bub(role: "user" | "bot", show: boolean, text: string) {
    return (
      <div style={{ display: show ? "flex" : "none", justifyContent: role === "user" ? "flex-end" : "flex-start",
        marginBottom: "0.5rem", padding: "0 0.75rem", opacity: show ? 1 : 0, transition: "opacity 0.25s" }}>
        <div style={{ maxWidth: "78%", background: role === "user" ? C.accent : C.elev,
          color: role === "user" ? C.bg : C.text,
          borderRadius: role === "user" ? "10px 10px 2px 10px" : "10px 10px 10px 2px",
          padding: "0.45rem 0.75rem", fontSize: "0.78rem", lineHeight: 1.5, ...DM, fontWeight: 400 }}>
          {text}
        </div>
      </div>
    );
  }
  return (
    <div style={{ padding: "0.5rem 0", minHeight: 112 }}>
      {bub("bot", phase >= 1, DEMO_MSGS[0].text)}
      {bub("user", phase >= 2, DEMO_MSGS[1].text)}
      <div style={{ display: phase === 3 ? "flex" : "none", justifyContent: "flex-start",
        padding: "0 0.75rem", marginBottom: "0.5rem" }}>
        <div style={{ display: "flex", gap: 3, padding: "0.3rem 0.6rem", background: C.elev,
          border: `1px solid ${C.border}`, borderRadius: 8 }}>
          {[0,1,2].map(i => <div key={i} style={{ width: 5, height: 5, borderRadius: "50%",
            background: C.muted, animation: phase === 3 ? `typingDot 1.1s ${i*0.17}s ease-in-out infinite` : "none" }} />)}
        </div>
      </div>
      {bub("bot", phase >= 4, DEMO_MSGS[2].text)}
    </div>
  );
}

function ChatDemo() {
  const { loopKey, fading } = useDemoLoop(4200);
  return (
    <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6,
      overflow: "hidden", opacity: fading ? 0 : 1, transition: "opacity 0.5s ease" }}>
      <div style={{ ...LBL, fontSize: "0.52rem", color: C.muted,
        padding: "0.45rem 0.75rem", borderBottom: `1px solid ${C.border}` }}>
        THE METHOD CHAT / LIVE
      </div>
      <DemoChatInner key={loopKey} />
    </div>
  );
}

// ── Orbit node graph demo ─────────────────────────────────────────────────────
const G_NODES = [
  { cx: 0.14, cy: 0.28 }, { cx: 0.50, cy: 0.10 }, { cx: 0.84, cy: 0.28 },
  { cx: 0.74, cy: 0.72 }, { cx: 0.26, cy: 0.76 }, { cx: 0.50, cy: 0.52 },
] as const;
const G_EDGES: readonly [number, number][] = [[0,5],[1,5],[2,5],[3,5],[4,5],[0,1],[2,3],[3,4]];

function NodeGraph({ w = 240, h = 130, loopKey }: { w?: number; h?: number; loopKey: number }) {
  const [nVis, setNVis] = useState(0);
  const [eVis, setEVis] = useState(0);
  const [pulse, setPulse] = useState(false);
  useEffect(() => {
    const ts: ReturnType<typeof setTimeout>[] = [];
    G_NODES.forEach((_, i) => ts.push(setTimeout(() => setNVis(i + 1), 80 + i * 160)));
    const es = 80 + G_NODES.length * 160 + 180;
    G_EDGES.forEach((_, i) => ts.push(setTimeout(() => setEVis(i + 1), es + i * 260)));
    const pa = es + G_EDGES.length * 260 + 260;
    ts.push(setTimeout(() => setPulse(true),  pa));
    ts.push(setTimeout(() => setPulse(false), pa + 800));
    return () => ts.forEach(clearTimeout);
  }, [loopKey]);
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}
      style={{ overflow: "visible", transition: "filter 0.4s ease",
        filter: pulse ? `drop-shadow(0 0 6px ${C.accent}80)` : "none" }}>
      {G_EDGES.map(([a, b], i) => {
        const x1 = G_NODES[a].cx * w, y1 = G_NODES[a].cy * h;
        const x2 = G_NODES[b].cx * w, y2 = G_NODES[b].cy * h;
        const len = Math.hypot(x2 - x1, y2 - y1);
        return (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={C.accent} strokeWidth="1"
            strokeDasharray={len} strokeDashoffset={eVis > i ? 0 : len}
            opacity={eVis > i ? 0.35 : 0}
            style={{ transition: eVis > i ? "stroke-dashoffset 0.5s ease, opacity 0.3s" : "none" }} />
        );
      })}
      {G_NODES.map((n, i) => (
        <circle key={i} cx={n.cx * w} cy={n.cy * h} r={i === 5 ? 7 : 4}
          fill={i === 5 ? C.accent : C.elev}
          stroke={C.accent} strokeWidth={i === 5 ? 1.5 : 1}
          opacity={nVis > i ? (i === 5 ? 1 : 0.7) : 0}
          style={{ transition: `opacity 0.4s ease ${i * 0.04}s` }} />
      ))}
    </svg>
  );
}

// ── Project visuals ─────────────────────────────────────────────────

// The animated stand-in for a project, used until a real recording is added.
function ProjectDemo({ project, height }: { project: Project; height: number }) {
  if (project.demo === "chat") {
    return (
      <div style={{ minHeight: height, display: "flex", alignItems: "stretch" }}>
        <ChatDemo />
      </div>
    );
  }
  if (project.demo === "graph") {
    return <GraphCard url={project.frameUrl} height={height} />;
  }
  return null;
}

// The visual on a project card: the real recording or poster where one exists,
// the built-in demo next, and a marked placeholder if neither is there yet.
function ProjectVisual({ project, height }: { project: Project; height: number }) {
  return (
    <ProjectPreview
      projectId={project.id}
      name={project.name}
      height={height}
      frameUrl={project.frameUrl}
      fallback={project.demo ? <ProjectDemo project={project} height={height} /> : undefined}
    />
  );
}

function GraphCard({ url, height }: { url?: string; height: number }) {
  const { loopKey, fading } = useDemoLoop(4800);
  return (
    <BrowserFrame url={url}>
      <div style={{ height, display: "flex", alignItems: "center", justifyContent: "center",
        background: C.bg, opacity: fading ? 0 : 1, transition: "opacity 0.5s ease" }}>
        <NodeGraph loopKey={loopKey} />
      </div>
    </BrowserFrame>
  );
}

// ── Project data ──────────────────────────────────────────────────────────────
type DemoKind = "chat" | "graph" | null;

interface Project {
  id: string;
  name: string;
  icon: string;
  /** Optional one-line stamp shown above the summary in the case study. */
  tagline?: string;
  summary: string;
  role: string;
  tech: string;
  problem: string;
  built: string;
  hardPart: string;
  status: string;
  statusCol: string;
  flagship?: boolean;
  liveUrl?: string;
  liveLabel?: string;
  demo?: DemoKind;
  frameUrl?: string;        // faux address bar label for the browser frame
}

// Screenshots and recordings are not listed here. They are picked up by
// convention from client/public/media/projects/<id>/ - see @/lib/project-media.

const PROJECTS: Project[] = [
  {
    id: "onishi",
    name: "Onishi",
    icon: "layout",
    summary: "A full app for a restaurant floor team, live in production.",
    role: "Designed and built end to end.",
    tech: "React, TypeScript, Express, SQLite, deployed on Render as a PWA.",
    problem:
      "Floor teams run on WhatsApp and paper for rosters, day off requests, sales ranking, and hours. Nothing lives in one place, and nothing is reliable when it matters.",
    built:
      "A single app with roster building, a day off calendar, a sales-per-hour leaderboard, checklists, shared notes, actual-hours and overtime tracking, and a daily quiz game for staff. It has roles for manager and sub-manager, and it installs on phones like a native app.",
    hardPart:
      "Getting real hours and overtime tracking right, so contracted staff can actually prove overtime. And making it safe to deploy updates without ever losing live data: persistent storage and safe, additive migrations, so shipping a release never wipes what the team depends on.",
    status: "Live in production",
    statusCol: C.green,
    flagship: true,
    liveUrl: ONISHI_URL,
    liveLabel: "Open the live app",
    frameUrl: "onishi.onrender.com",
  },
  {
    id: "method-chat",
    name: "The Method Chat",
    icon: "chat",
    summary: "An AI assistant that answers customer messages across web, Facebook, and WhatsApp.",
    role: "Built the product and the integrations.",
    tech: "Node, AI model integration, webhooks, deployed on Render.",
    problem:
      "Small service businesses miss leads because they cannot answer messages fast enough. The enquiry arrives, no one is free, and the customer moves on.",
    built:
      "A configurable AI agent with its own persona, a website widget, and channel integrations, plus lead capture and a dashboard to see what came in.",
    hardPart:
      "Debugging a live widget that hung on load. I traced it down to a single invalid character breaking the script, then handled cold starts and connection edge cases so it stays reliable in the real world.",
    status: "Live",
    statusCol: C.green,
    liveUrl: "",
    demo: "chat",
    frameUrl: "themethodco.co",
  },
  {
    id: "orbit",
    name: "Orbit",
    icon: "brain",
    tagline: "Nothing drifts away.",
    summary: "A daily organiser and notes app designed around how an ADHD brain actually works.",
    role: "Designed and built end to end.",
    tech: "React, TypeScript, Express, SQLite, PWA, deployed on Render.",
    problem:
      "Most productivity tools assume you can hold a plan in your head and come back to it. With ADHD you cannot. Long lists cause shutdown, unfinished tasks become shame, and anything you cannot capture in two seconds is lost.",
    built:
      "A Now screen that shows one suggested task and never more than three others. A Focus mode that puts a single task full screen with a timer, because starting is the hard part, not planning. Capture from anywhere in under two seconds into an Inbox you process one item at a time rather than facing a list of forty. A proper calendar with tap to schedule and undo on every action. Projects, notes with linking and tags, and a mind map showing how everything connects. An optional spoken briefing that reads your day aloud. Installable on a phone as a PWA.",
    hardPart:
      "Designing against my own instincts. Every impulse was to add more, and almost every good decision was a subtraction: capping lists at five items, replacing overdue with rolled over so it carries no blame, cutting drag to schedule on mobile because a drag that half fails is worse than two taps, and quietening the ambient animation because motion competes for attention.",
    status: "Personal build",
    statusCol: C.accent,
    demo: "graph",
    frameUrl: "orbit.local",
  },
  {
    id: "last-human-job",
    name: "The Last Human Job",
    icon: "rocket",
    summary: "A paid ebook with a designed landing page and live payments.",
    role: "Wrote, designed, built, and launched it.",
    tech: "React landing page, Stripe checkout, gated digital delivery, on Render.",
    problem:
      "Turning an idea into something that actually sells online, end to end, not just a document sitting in a folder.",
    built:
      "The whole go-to-market: the writing, the editorial design, a conversion-focused landing page, Stripe payment, and secure PDF delivery after purchase.",
    hardPart:
      "Wiring secure paid delivery, so the product is only accessible after payment and cannot be pulled without buying it first.",
    status: "Live",
    statusCol: C.green,
    liveUrl: "/last-human-job",
    liveLabel: "View the live page",
    frameUrl: "themethodco.co/last-human-job",
  },
];

// ── Skills data ───────────────────────────────────────────────────────────────
const SKILLS = [
  { icon: "code",   title: "Full-stack web apps", body: "React, TypeScript, Node, and Express, from the interface down to the API." },
  { icon: "db",     title: "Databases",           body: "SQLite and Postgres. Modelling data and keeping it safe through change." },
  { icon: "rocket", title: "Ship and run live apps", body: "Render, GitHub, and DNS. Deploying, maintaining, and not losing data doing it." },
  { icon: "spark",  title: "AI in real products", body: "Integrating AI models into products people actually use, not demos." },
  { icon: "card",   title: "Payments",            body: "Stripe checkout and gated digital delivery that only opens after purchase." },
  { icon: "arrow",  title: "Fast with AI-assisted dev", body: "Building and shipping quickly by working alongside AI tools every day." },
] as const;

// ── Case-study modal ──────────────────────────────────────────────────────────
function CaseStudy({ project, onClose }: { project: Project; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  const sections: { label: string; body: string }[] = [
    { label: "The problem", body: project.problem },
    { label: "What I built", body: project.built },
    { label: "The hard part", body: project.hardPart },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 300,
        background: "rgba(3,5,12,0.72)", backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        padding: "5vh 5vw", overflowY: "auto",
      }}>
      <motion.div
        role="dialog" aria-modal="true" aria-label={`${project.name} case study`}
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        onClick={e => e.stopPropagation()}
        style={{
          background: C.panel, border: `1px solid ${C.border}`,
          borderTop: `2px solid ${C.accent}`, borderRadius: 12,
          maxWidth: 720, width: "100%", padding: "clamp(1.5rem, 4vw, 2.75rem)",
          boxShadow: `0 30px 80px rgba(0,0,0,0.55), 0 0 0 1px ${C.accent}12`,
          position: "relative",
        }}>
        <button
          onClick={onClose} aria-label="Close case study"
          style={{ position: "absolute", top: "1.1rem", right: "1.1rem",
            background: C.elev, border: `1px solid ${C.border}`, borderRadius: 8,
            color: C.muted, cursor: "pointer", padding: "0.4rem",
            display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Ic n="close" sz={16} col="currentColor" />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.1rem" }}>
          <span style={{ ...LBL, color: project.statusCol, fontSize: "0.56rem",
            display: "flex", alignItems: "center", gap: "0.35rem" }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: project.statusCol,
              display: "inline-block", boxShadow: `0 0 6px ${project.statusCol}` }} />
            {project.status.toUpperCase()}
          </span>
          {project.flagship && (
            <span style={{ ...LBL, color: C.accent, fontSize: "0.54rem",
              border: `1px solid ${C.accent}40`, padding: "0.1rem 0.45rem", borderRadius: 3 }}>
              FLAGSHIP
            </span>
          )}
        </div>

        <h3 style={{ ...EP, fontWeight: 900, color: C.text, fontSize: "clamp(1.9rem, 5vw, 2.6rem)",
          lineHeight: 1, letterSpacing: "-0.01em", textTransform: "uppercase", marginBottom: "0.7rem" }}>
          {project.name}
        </h3>
        {project.tagline && (
          <p style={{ ...MONO, color: C.accent, fontSize: "0.8rem", letterSpacing: "0.02em",
            marginBottom: "0.6rem" }}>
            {project.tagline}
          </p>
        )}
        <p style={{ ...DM, fontWeight: 300, color: "#D8D2C2", fontSize: "1rem", lineHeight: 1.6,
          marginBottom: "1.75rem" }}>
          {project.summary}
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "0.9rem", marginBottom: "1.75rem" }}>
          <div>
            <p style={{ ...LBL, color: C.accent, fontSize: "0.56rem", marginBottom: "0.3rem" }}>MY ROLE</p>
            <p style={{ ...DM, fontWeight: 400, color: C.text, fontSize: "0.9rem", lineHeight: 1.55 }}>{project.role}</p>
          </div>
          <div>
            <p style={{ ...LBL, color: C.accent, fontSize: "0.56rem", marginBottom: "0.3rem" }}>TECH</p>
            <p style={{ ...MONO, color: "#D8D2C2", fontSize: "0.82rem", lineHeight: 1.55 }}>{project.tech}</p>
          </div>
        </div>

        <div style={{ marginBottom: "1.75rem" }}>
          <ProjectVisual project={project} height={260} />
        </div>

        <div style={{ marginBottom: "2rem" }}>
          <p style={{ ...LBL, color: C.muted, fontSize: "0.58rem", marginBottom: "0.8rem" }}>
            Screens
          </p>
          <ProjectGallery projectId={project.id} name={project.name} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {sections.map(s => (
            <div key={s.label}>
              <p style={{ ...LBL, color: C.muted, fontSize: "0.58rem", marginBottom: "0.5rem" }}>
                {s.label}
              </p>
              <p style={{ ...DM, fontWeight: 300, color: "#D8D2C2", fontSize: "0.95rem", lineHeight: 1.7 }}>
                {s.body}
              </p>
            </div>
          ))}
        </div>

        {project.liveUrl ? (
          <a href={project.liveUrl}
            target={project.liveUrl.startsWith("http") ? "_blank" : undefined}
            rel={project.liveUrl.startsWith("http") ? "noreferrer" : undefined}
            style={{ ...EP, fontWeight: 700, color: C.bg, background: C.accent,
              fontSize: "0.74rem", letterSpacing: "0.08em", textTransform: "uppercase",
              display: "inline-flex", alignItems: "center", gap: "0.5rem",
              padding: "0.8rem 1.5rem", borderRadius: 6, marginTop: "2rem" }}>
            {project.liveLabel ?? "View live"} <Ic n="arrow" sz={15} col={C.bg} />
          </a>
        ) : (
          <p style={{ ...MONO, color: C.muted, fontSize: "0.72rem", marginTop: "2rem" }}>
            // Live link coming soon
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Landing() {
  const [openId, setOpenId] = useState<string | null>(null);
  const openProject = PROJECTS.find(p => p.id === openId) ?? null;

  useEffect(() => { document.title = "The Method Co. | Victor Miranda"; }, []);

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text, overflowX: "hidden", position: "relative" }}>

      <ScrollProgress />
      <AuroraBackdrop />
      <GrainOverlay />

      {/* Page-scoped keyframes. Shared layout and motion rules live in index.css. */}
      <style>{`
        @keyframes typingDot {
          0%,75%,100% { transform: scale(0.35); opacity: 0.25; }
          38%          { transform: scale(1);    opacity: 1; }
        }
        @keyframes ctaPulse {
          0%,100% { box-shadow: 0 0 20px rgba(90,120,255,0.18), 0 0 40px rgba(90,120,255,0.07); }
          50%     { box-shadow: 0 0 30px rgba(90,120,255,0.34), 0 0 60px rgba(90,120,255,0.13); }
        }
        @keyframes svgRotate {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .cta-glow { animation: ctaPulse 3s ease-in-out infinite; }
        @media (max-width: 900px) {
          .flagship-cols { flex-direction: column !important; }
        }
      `}</style>

      <Nav />
      <Hero />

      <HR />

      {/* ── ABOUT ────────────────────────────────────────────────────────────── */}
      <section id="about" style={{ position: "relative", padding: "96px 5vw", zIndex: 1 }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Reveal>
            <SLabel>ABOUT</SLabel>
            <SH>CHEF FOR YEARS. BUILDER NOW.</SH>
          </Reveal>
          <div className="about-row" style={{ display: "flex", gap: "3rem", marginTop: "1rem" }}>
            <Reveal delay={0.08} style={{ flex: "1 1 0", minWidth: 0 }}>
              <p style={{ ...DM, fontWeight: 300, color: "#D8D2C2", fontSize: "1.05rem", lineHeight: 1.8,
                marginBottom: "1.5rem" }}>
                I spent years cooking in kitchens across Ireland and Malta. Then I taught myself to build
                software. Now I design, build, and ship full products using AI tools and modern web tech.
              </p>
              <p style={{ ...DM, fontWeight: 300, color: "#D8D2C2", fontSize: "1.05rem", lineHeight: 1.8 }}>
                I care about clarity, and about tools people actually use. I am working toward settling in
                Ireland and I am open to product and builder roles.
              </p>
            </Reveal>
            <Reveal delay={0.16} style={{ flex: "0 0 auto" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                {[
                  { k: "Based", v: "Dublin, Ireland" },
                  { k: "Was", v: "Chef, Ireland and Malta" },
                  { k: "Now", v: "AI product builder" },
                  { k: "Open to", v: "Product and builder roles" },
                ].map(row => (
                  <div key={row.k} style={{ display: "flex", gap: "1rem", alignItems: "baseline",
                    borderBottom: `1px solid ${C.border}`, paddingBottom: "0.75rem", minWidth: 240 }}>
                    <span style={{ ...LBL, color: C.accent, fontSize: "0.56rem", flex: "0 0 72px" }}>{row.k}</span>
                    <span style={{ ...DM, fontWeight: 400, color: C.text, fontSize: "0.9rem" }}>{row.v}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <HR />

      {/* ── WORK ─────────────────────────────────────────────────────────────── */}
      <section id="work" style={{ position: "relative", padding: "96px 5vw", zIndex: 1 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Reveal>
            <SLabel>WORK</SLabel>
            <SH>PRODUCTS I HAVE BUILT.</SH>
            <Sub>Each one shipped end to end. Click any project for the short case study, the real problem, what I built, and the hard part I actually solved.</Sub>
          </Reveal>

          {/* Flagship: Onishi */}
          {PROJECTS.filter(p => p.flagship).map(project => (
            <Reveal key={project.id} delay={0.05}>
              <motion.div
                onClick={() => setOpenId(project.id)}
                whileHover={{ y: -6, boxShadow: `0 26px 64px ${C.accent}2b, 0 0 0 1px ${C.accent}55` }}
                transition={{ duration: 0.2 }}
                style={{
                  width: "100%", textAlign: "left", cursor: "pointer",
                  background: `radial-gradient(circle at top left, ${C.accent}16 0%, ${C.panel} 58%)`,
                  border: `1px solid ${C.border}`, borderTop: `2px solid ${C.accent}`,
                  borderRadius: 14, padding: "clamp(1.5rem, 4vw, 2.5rem)",
                  marginBottom: "1.5rem", display: "block",
                }}>
                <div className="flagship-cols" style={{ display: "flex",
                  gap: "clamp(1.5rem, 4vw, 3rem)", alignItems: "center" }}>
                  {/* Text */}
                  <div style={{ flex: "1 1 360px", minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem",
                      marginBottom: "1.1rem", flexWrap: "wrap" }}>
                      <span style={{ ...LBL, color: C.accent, fontSize: "0.56rem",
                        border: `1px solid ${C.accent}40`, padding: "0.12rem 0.5rem", borderRadius: 3 }}>
                        FLAGSHIP
                      </span>
                      <span style={{ ...LBL, color: project.statusCol, fontSize: "0.56rem",
                        display: "flex", alignItems: "center", gap: "0.35rem" }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: project.statusCol,
                          display: "inline-block", boxShadow: `0 0 6px ${project.statusCol}` }} />
                        {project.status.toUpperCase()}
                      </span>
                    </div>
                    <h3 style={{ ...EP, fontWeight: 900, color: C.text, fontSize: "clamp(2.2rem, 5vw, 3.4rem)",
                      lineHeight: 0.95, letterSpacing: "-0.01em", textTransform: "uppercase",
                      marginBottom: "0.85rem" }}>
                      {project.name}
                    </h3>
                    <p style={{ ...DM, fontWeight: 300, color: "#D8D2C2", fontSize: "1.05rem",
                      lineHeight: 1.6, maxWidth: 460, marginBottom: "1.4rem" }}>
                      {project.summary}
                    </p>
                    <p style={{ ...MONO, color: C.muted, fontSize: "0.76rem", lineHeight: 1.6,
                      marginBottom: "1.6rem" }}>
                      {project.tech}
                    </p>
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); setOpenId(project.id); }}
                      style={{ ...CARD_CTA, fontSize: "0.76rem", gap: "0.5rem" }}>
                      Read the case study <Ic n="arrow" sz={15} col={C.accent} />
                    </button>
                  </div>
                  {/* Real screenshot */}
                  <div className="flagship-media" style={{ flex: "1 1 480px", minWidth: 0, width: "100%" }}>
                    <ProjectVisual project={project} height={300} />
                  </div>
                </div>
              </motion.div>
            </Reveal>
          ))}

          {/* Grid: the rest */}
          <div className="card-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1.5rem" }}>
            {PROJECTS.filter(p => !p.flagship).map((project, i) => (
              <Reveal key={project.id} delay={i * 0.08}>
                <motion.div
                  onClick={() => setOpenId(project.id)}
                  whileHover={{ y: -8, boxShadow: `0 20px 46px ${C.accent}3d, 0 0 0 1px ${C.accent}55` }}
                  transition={{ duration: 0.2 }}
                  style={{
                    width: "100%", height: "100%", textAlign: "left", cursor: "pointer",
                    background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12,
                    padding: "1rem", display: "flex", flexDirection: "column", gap: "1.15rem",
                  }}>
                  <ProjectVisual project={project} height={168} />
                  <div style={{ padding: "0 0.55rem 0.65rem", display: "flex",
                    flexDirection: "column", flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
                      marginBottom: "0.8rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.55rem" }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: 8,
                          background: `${C.accent}10`, border: `1px solid ${C.accent}25`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <Ic n={project.icon} sz={16} col={C.accent} />
                        </div>
                        <h3 style={{ ...EP, fontWeight: 800, color: C.text, fontSize: "1.05rem",
                          letterSpacing: "0.01em", textTransform: "uppercase", margin: 0 }}>
                          {project.name}
                        </h3>
                      </div>
                      <span style={{ ...LBL, color: project.statusCol, fontSize: "0.5rem",
                        display: "flex", alignItems: "center", gap: "0.3rem" }}>
                        <span style={{ width: 4, height: 4, borderRadius: "50%", background: project.statusCol,
                          display: "inline-block" }} />
                        {project.status.toUpperCase()}
                      </span>
                    </div>
                    <p style={{ ...DM, fontWeight: 300, color: "#D8D2C2", fontSize: "0.86rem",
                      lineHeight: 1.6, marginBottom: "1.1rem", flex: 1 }}>
                      {project.summary}
                    </p>
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); setOpenId(project.id); }}
                      style={{ ...CARD_CTA, fontSize: "0.7rem", gap: "0.4rem" }}>
                      Case study <Ic n="arrow" sz={13} col={C.accent} />
                    </button>
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <HR />

      {/* ── SKILLS ───────────────────────────────────────────────────────────── */}
      <section id="skills" style={{ position: "relative", padding: "96px 5vw", zIndex: 1, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%,-50%)", pointerEvents: "none", zIndex: 0 }}>
          <svg width="700" height="700" viewBox="0 0 700 700"
            style={{ animation: "svgRotate 60s linear infinite", opacity: 1 }}>
            {[60,120,180,240,300,340].map(r => (
              <circle key={r} cx="350" cy="350" r={r} fill="none"
                stroke="#3DD6F5" strokeWidth="1" opacity="0.05" />
            ))}
          </svg>
        </div>
        <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <Reveal>
            <SLabel>SKILLS</SLabel>
            <SH>WHAT I ACTUALLY DO.</SH>
            <Sub>Honest and specific. These are the things I have used to ship real products, not a list of logos.</Sub>
          </Reveal>

          <div className="card-grid" style={{ display: "grid",
            gridTemplateColumns: "repeat(3,1fr)", gap: "1px",
            border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden",
            background: C.border, marginBottom: "1.5rem" }}>
            {SKILLS.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.06}>
                <motion.div
                  whileHover={{ y: -8, scale: 1.02, boxShadow: `0 16px 40px ${C.accent}4d, 0 0 0 1px ${C.accent}60` }}
                  transition={{ duration: 0.2 }}
                  style={{ background: C.panel, padding: "1.85rem", height: "100%", cursor: "default" }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 10,
                    background: `${C.accent}10`, border: `1px solid ${C.accent}25`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginBottom: "1rem", boxShadow: `0 0 16px ${C.accent}15`,
                  }}>
                    <Ic n={s.icon} sz={20} col={C.accent} />
                  </div>
                  <h3 style={{ ...EP, fontWeight: 800, color: C.text, fontSize: "0.95rem",
                    letterSpacing: "0.02em", marginBottom: "0.5rem", textTransform: "uppercase" }}>
                    {s.title}
                  </h3>
                  <p style={{ ...DM, fontWeight: 300, color: "#D8D2C2", fontSize: "0.85rem", lineHeight: 1.6 }}>
                    {s.body}
                  </p>
                </motion.div>
              </Reveal>
            ))}
          </div>

          {/* Dual-skill band */}
          <Reveal delay={0.1}>
            <div style={{
              background: `radial-gradient(circle at top right, ${C.accent}12 0%, ${C.panel} 60%)`,
              border: `1px solid ${C.border}`, borderTop: `2px solid ${C.accent}`,
              borderRadius: 10, padding: "clamp(1.75rem, 4vw, 2.5rem)",
              display: "flex", gap: "1.5rem", alignItems: "flex-start", flexWrap: "wrap",
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                background: `${C.accent}12`, border: `1px solid ${C.accent}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Ic n="spark" sz={22} col={C.accent} />
              </div>
              <div style={{ flex: "1 1 320px", minWidth: 0 }}>
                <h3 style={{ ...EP, fontWeight: 800, color: C.text, fontSize: "1.15rem",
                  letterSpacing: "0.01em", marginBottom: "0.6rem", textTransform: "uppercase" }}>
                  Product and go-to-market, from one person
                </h3>
                <p style={{ ...DM, fontWeight: 300, color: "#D8D2C2", fontSize: "0.95rem", lineHeight: 1.7 }}>
                  Before I built software I worked in marketing, copywriting, and design. That is not a side
                  note. It means I can build a product and the thing that sells it: the positioning, the
                  landing page, the words, and the launch. Most builders can do one side. I do both.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <HR />

      <Contact />

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer style={{
        position: "relative", zIndex: 1,
        background: C.panel,
        borderTop: `1px solid ${C.accent}33`,
        padding: "80px 5vw 40px",
      }}>
        <div className="footer-cols" style={{
          maxWidth: 1100, margin: "0 auto",
          display: "flex", gap: "4rem", flexWrap: "wrap", marginBottom: "3rem",
        }}>
          {/* Column 1: Brand */}
          <div style={{ flex: "1 1 260px", minWidth: 200 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginBottom: "1rem" }}>
              <img
                src="https://res.cloudinary.com/dsriscylr/image/upload/v1779128984/method-primary_hl2rrb.svg"
                alt=""
                style={{ height: 26, width: 26 }}
              />
              <span style={{
                ...DM, fontWeight: 600, fontSize: "1rem", letterSpacing: "0.02em",
                background: `linear-gradient(90deg, ${C.accent}, ${C.hi})`,
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>
                Victor Miranda
              </span>
            </div>
            <p style={{ ...DM, fontWeight: 400, color: "#D8D2C2", fontSize: "0.88rem", lineHeight: 1.65, maxWidth: 280 }}>
              I turn ideas into working products, fast.
            </p>
          </div>

          {/* Column 2: Navigate */}
          <div style={{ flex: "1 1 160px", minWidth: 140 }}>
            <p style={{ ...LBL, color: C.accent, fontSize: "0.6rem", letterSpacing: "0.12em",
              marginBottom: "1.25rem" }}>NAVIGATE</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {[
                { label: "Work",    href: "#work"    },
                { label: "About",   href: "#about"   },
                { label: "Skills",  href: "#skills"  },
                { label: "Contact", href: "#contact" },
              ].map(({ label, href }) => (
                <a key={label} href={href}
                  className="nav-link"
                  style={{ ...DM, fontWeight: 400, color: C.text, fontSize: "0.88rem",
                    transition: "color 0.15s", textDecoration: "none" }}>
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Column 3: Connect */}
          <div style={{ flex: "1 1 200px", minWidth: 180 }}>
            <p style={{ ...LBL, color: C.accent, fontSize: "0.6rem", letterSpacing: "0.12em",
              marginBottom: "1.25rem" }}>CONNECT</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              {[
                { tag: "Company", email: COMPANY_EMAIL },
                { tag: "Direct",  email: PERSONAL_EMAIL },
              ].map(({ tag, email }) => (
                <span key={tag} style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                  <span style={{ ...LBL, color: C.muted, fontSize: "0.52rem" }}>{tag}</span>
                  <a href={`mailto:${email}`}
                    className="nav-link"
                    style={{ ...MONO, fontWeight: 400, color: C.text, fontSize: "0.82rem",
                      transition: "color 0.15s", textDecoration: "none", wordBreak: "break-all" }}>
                    {email}
                  </a>
                </span>
              ))}
              <p style={{ ...DM, fontWeight: 400, color: "#D8D2C2", fontSize: "0.84rem",
                lineHeight: 1.6, margin: 0 }}>
                Based in Dublin. Open to work worldwide.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          maxWidth: 1100, margin: "0 auto",
          borderTop: `1px solid ${C.accent}26`,
          paddingTop: "1.5rem",
          display: "flex", flexWrap: "wrap",
          alignItems: "center", justifyContent: "space-between", gap: "1rem",
        }}>
          <span style={{ ...DM, fontWeight: 400, color: C.muted, fontSize: "0.78rem" }}>
            &copy; 2026 Victor Miranda. All rights reserved.
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {[{ label: "Privacy", href: "/privacy" }, { label: "Terms", href: "/terms" }].map(({ label, href }, i) => (
              <span key={label} style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                {i > 0 && <span style={{ color: C.border, fontSize: "0.7rem" }}>|</span>}
                <a href={href}
                  className="nav-link"
                  style={{ ...DM, fontWeight: 400, color: "#D8D2C2", fontSize: "0.78rem",
                    transition: "color 0.15s", textDecoration: "none" }}>
                  {label}
                </a>
              </span>
            ))}
          </div>
        </div>
      </footer>

      {/* ── CASE STUDY MODAL ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {openProject && (
          <CaseStudy project={openProject} onClose={() => setOpenId(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
