import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";

// METHOD CHAT: set CHAT_API_ENDPOINT to go live
const CHAT_API_ENDPOINT = "";

// ── Brand tokens ──────────────────────────────────────────────────────────────
const C = {
  bg:     "#070A16",
  panel:  "#0C1226",
  elev:   "#101935",
  accent: "#3DD6F5",
  glow:   "#1FB8E6",
  hi:     "#5BE6FF",
  text:   "#EDF2F7",
  muted:  "#8A97B4",
  border: "#1D2A4D",
  green:  "#3DDA84",
  amber:  "#F0A500",
  red:    "#F06060",
} as const;

const EP:    React.CSSProperties = { fontFamily: "'Epilogue', system-ui, sans-serif" };
const DM:    React.CSSProperties = { fontFamily: "'DM Sans', system-ui, sans-serif" };
const LBL:   React.CSSProperties = { ...DM, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.13em" };
const MONO:  React.CSSProperties = { fontFamily: "'JetBrains Mono', monospace" };
const BEBAS: React.CSSProperties = { fontFamily: "'Bebas Neue', sans-serif" };

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
    funnel:  <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" stroke={col}/>,
    cursor:  <path d="M5 3l14 9-7 1-4 7-3-17z" strokeWidth="1.5" strokeLinejoin="round" fill="none" stroke={col}/>,
    search:  <><circle cx="11" cy="11" r="7" strokeWidth="1.5" fill="none" stroke={col}/><path d="M21 21l-4.35-4.35" strokeWidth="1.5" strokeLinecap="round" stroke={col}/></>,
    check:   <path d="M5 13l4 4L19 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" stroke={col}/>,
    x:       <><path d="M18 6L6 18" strokeWidth="2" strokeLinecap="round" stroke={col}/><path d="M6 6l12 12" strokeWidth="2" strokeLinecap="round" stroke={col}/></>,
    ig:      <><rect x="2" y="2" width="20" height="20" rx="5" strokeWidth="1.5" fill="none" stroke={col}/><circle cx="12" cy="12" r="4" strokeWidth="1.5" fill="none" stroke={col}/><circle cx="17.5" cy="6.5" r="1.2" fill={col}/></>,
    menu:    <path d="M3 6h18M3 12h18M3 18h18" strokeWidth="1.5" strokeLinecap="round" stroke={col} fill="none"/>,
    close:   <path d="M18 6L6 18M6 6l12 12" strokeWidth="1.5" strokeLinecap="round" stroke={col} fill="none"/>,
    play:    <><circle cx="12" cy="12" r="10" strokeWidth="1.5" fill="none" stroke={col}/><path d="M10 8l6 4-6 4V8z" fill={col}/></>,
    send:    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" stroke={col}/>,
    warning: <><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" strokeWidth="1.5" fill="none" stroke={col}/><line x1="12" y1="9" x2="12" y2="13" strokeWidth="1.5" strokeLinecap="round" stroke={col}/><line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2" strokeLinecap="round" stroke={col}/></>,
    arrow:   <path d="M5 12h14M12 5l7 7-7 7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" stroke={col}/>,
    chat:    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" fill="none" stroke={col} strokeWidth="1.5" strokeLinejoin="round"/>,
    brain:   <><path d="M12 2a7 7 0 00-7 7c0 2 .8 3.8 2 5l1 8h8l1-8a7 7 0 002-5 7 7 0 00-7-7z" fill="none" stroke={col} strokeWidth="1.5"/><path d="M9 14h6M10 17h4" stroke={col} strokeWidth="1.5" strokeLinecap="round"/></>,
  };
  return (
    <svg viewBox="0 0 24 24" style={{ width: sz, height: sz, display: "block", flexShrink: 0 }}>
      {p[n] ?? null}
    </svg>
  );
}

// ── Demo components for Ecosystem ─────────────────────────────────────────────

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

const AUDIT_BARS = [
  { label: "POSITIONING", v: 41 },
  { label: "MESSAGE",     v: 67 },
  { label: "FUNNEL",      v: 33 },
] as const;

function AuditInner() {
  const [count, setCount] = useState(0);
  const [bars, setBars] = useState([0, 0, 0]);
  useEffect(() => {
    const bt = setTimeout(() => setBars([41, 67, 33]), 60);
    const dur = 1450; let t0 = 0; let raf: number;
    function tick(ts: number) {
      if (!t0) t0 = ts;
      const p = Math.min((ts - t0) / dur, 1);
      setCount(Math.round(p * 62));
      if (p < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => { clearTimeout(bt); cancelAnimationFrame(raf); };
  }, []);
  return (
    <div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: "0.65rem" }}>
        <span style={{ ...EP, fontWeight: 900, color: C.accent, fontSize: "2rem", lineHeight: 1 }}>{count}</span>
        <span style={{ ...DM, color: C.border, fontSize: "0.75rem" }}>/100</span>
        <span style={{ ...LBL, color: C.muted, fontSize: "0.55rem", marginLeft: "auto" }}>CLARITY SCORE</span>
      </div>
      {AUDIT_BARS.map((bar, i) => (
        <div key={bar.label} style={{ marginBottom: "0.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
            <span style={{ ...LBL, color: C.muted, fontSize: "0.52rem" }}>{bar.label}</span>
            <span style={{ ...LBL, color: C.accent, fontSize: "0.52rem" }}>{bars[i]}%</span>
          </div>
          <div style={{ height: 3, background: C.border, borderRadius: 1, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${bars[i]}%`,
              background: `linear-gradient(90deg, ${C.accent}, ${C.glow})`,
              transition: `width 1.4s ease-out ${i * 0.14}s` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function ConsultancyDemo() {
  const { loopKey, fading } = useDemoLoop(3900);
  return (
    <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6,
      padding: "0.85rem", marginBottom: "0.85rem",
      opacity: fading ? 0 : 1, transition: "opacity 0.5s ease" }}>
      <AuditInner key={loopKey} />
    </div>
  );
}

interface ChatMsg { role: "user" | "bot"; text: string; }

const DEMO_MSGS: ChatMsg[] = [
  { role: "bot",  text: "What are you trying to fix in your business?" },
  { role: "user", text: "My offer is confusing. I keep losing people on the website." },
  { role: "bot",  text: "Then we fix the offer before anything else. What do you actually sell?" },
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

function ChatEcoDemo() {
  const { loopKey, fading } = useDemoLoop(4200);
  if (CHAT_API_ENDPOINT) {
    return (
      <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6,
        marginBottom: "0.85rem", overflow: "hidden" }}>
        <div style={{ ...LBL, fontSize: "0.52rem", color: C.muted,
          padding: "0.45rem 0.75rem", borderBottom: `1px solid ${C.border}` }}>
          METHOD CHAT V1.0 / LIVE
        </div>
        <iframe src={CHAT_API_ENDPOINT} style={{ width: "100%", height: 140, border: "none" }} title="Method Chat" />
      </div>
    );
  }
  return (
    <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6,
      marginBottom: "0.85rem", overflow: "hidden",
      opacity: fading ? 0 : 1, transition: "opacity 0.5s ease" }}>
      <div style={{ ...LBL, fontSize: "0.52rem", color: C.muted,
        padding: "0.45rem 0.75rem", borderBottom: `1px solid ${C.border}` }}>
        METHOD CHAT V1.0
      </div>
      <DemoChatInner key={loopKey} />
    </div>
  );
}

// ── Node graph (Second Brain) ─────────────────────────────────────────────────
const G_NODES = [
  { cx: 0.14, cy: 0.28 }, { cx: 0.50, cy: 0.10 }, { cx: 0.84, cy: 0.28 },
  { cx: 0.74, cy: 0.72 }, { cx: 0.26, cy: 0.76 }, { cx: 0.50, cy: 0.52 },
] as const;
const G_EDGES: readonly [number, number][] = [[0,5],[1,5],[2,5],[3,5],[4,5],[0,1],[2,3],[3,4]];

function NodeGraph({ w = 220, h = 110, loopKey }: { w?: number; h?: number; loopKey: number }) {
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

function SecondBrainDemo() {
  const { loopKey, fading } = useDemoLoop(4800);
  return (
    <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 6,
      marginBottom: "0.85rem", padding: "0.85rem",
      opacity: fading ? 0 : 1, transition: "opacity 0.5s ease",
      display: "flex", alignItems: "center", justifyContent: "center", minHeight: 120 }}>
      <NodeGraph loopKey={loopKey} />
    </div>
  );
}

// ── ProcessLine: animated left-to-right on scroll ─────────────────────────────
function ProcessLine() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <div ref={ref} className="process-line" style={{
      position: "absolute", top: 19,
      left: "calc(12.5% + 20px)", right: "calc(12.5% + 20px)",
      height: 1, background: C.border, zIndex: 0, overflow: "hidden",
    }}>
      <motion.div
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
        style={{
          height: "100%",
          background: `linear-gradient(90deg, ${C.accent}, ${C.glow})`,
          transformOrigin: "left",
          boxShadow: `0 0 10px ${C.accent}60`,
        }}
      />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Landing() {
  const [navOpen, setNavOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", website: "", business: "", problem: "" });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => { document.title = "The Method Co. | Clarity Before Strategy"; }, []);

  function setField(k: keyof typeof form, v: string) { setForm(p => ({ ...p, [k]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    try {
      const res = await fetch("https://formspree.io/f/xkovloyk", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name:     form.name,
          email:    form.email,
          website:  form.website,
          business: form.business,
          problem:  form.problem,
        }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        alert("Something went wrong. Please email us directly at support@themethodco.co");
      }
    } catch {
      alert("Network error. Please email us directly at support@themethodco.co");
    } finally {
      setSending(false);
    }
  }

  const inp: React.CSSProperties = {
    ...DM, fontWeight: 400, width: "100%", background: C.panel,
    border: "1px solid rgba(61,214,245,0.3)", borderRadius: 6, color: C.text,
    fontSize: "0.9rem", padding: "0.8rem 1rem", outline: "none",
    boxSizing: "border-box",
  };
  const lbl: React.CSSProperties = {
    ...LBL, color: C.text, fontSize: "0.62rem", letterSpacing: "0.1em",
    display: "block", marginBottom: "0.45rem",
  };

  const NAV_LINKS = [
    { label: "Offers",     href: "#offers"    },
    { label: "Fit",        href: "#fit"       },
    { label: "Process",    href: "#process"   },
    { label: "About",      href: "#about"     },
    { label: "Ecosystem",  href: "#ecosystem" },
    { label: "Insights",   href: "/insights/" },
  ];

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text, overflowX: "hidden" }}>

      {/* ── GLOBAL AMBIENT BACKGROUND ──────────────────────────────────────── */}
      <div style={{ position: "fixed", inset: 0, zIndex: -1, pointerEvents: "none", overflow: "hidden" }}>
        <div style={{
          position: "absolute", width: "55vw", height: "55vw", maxWidth: 900, maxHeight: 900,
          top: "-15%", left: "-10%",
          background: `radial-gradient(circle, ${C.glow}1e 0%, transparent 70%)`,
          animation: "orbGlobal1 45s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute", width: "45vw", height: "45vw", maxWidth: 720, maxHeight: 720,
          top: "40%", right: "-8%",
          background: `radial-gradient(circle, ${C.hi}14 0%, transparent 70%)`,
          animation: "orbGlobal2 60s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute", width: "50vw", height: "50vw", maxWidth: 800, maxHeight: 800,
          bottom: "10%", left: "25%",
          background: `radial-gradient(circle, ${C.accent}0f 0%, transparent 70%)`,
          animation: "orbGlobal3 52s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          opacity: 0.03, mixBlendMode: "overlay",
        }} />
      </div>

      <style>{`
        @keyframes typingDot {
          0%,75%,100% { transform: scale(0.35); opacity: 0.25; }
          38%          { transform: scale(1);    opacity: 1; }
        }
        @keyframes orbDrift1 {
          0%,100% { transform: translate(0,0) scale(1); }
          50%     { transform: translate(60px,-40px) scale(1.1); }
        }
        @keyframes orbDrift2 {
          0%,100% { transform: translate(0,0) scale(1); }
          50%     { transform: translate(-50px,35px) scale(0.95); }
        }
        @keyframes orbGlobal1 {
          0%,100% { transform: translate(0,0) scale(1); }
          33%     { transform: translate(80px,-60px) scale(1.08); }
          66%     { transform: translate(-40px,40px) scale(0.96); }
        }
        @keyframes orbGlobal2 {
          0%,100% { transform: translate(0,0) scale(1); }
          40%     { transform: translate(-70px,50px) scale(1.06); }
          70%     { transform: translate(50px,-30px) scale(0.98); }
        }
        @keyframes orbGlobal3 {
          0%,100% { transform: translate(0,0) scale(1); }
          30%     { transform: translate(60px,70px) scale(1.04); }
          60%     { transform: translate(-80px,-40px) scale(0.97); }
        }
        @keyframes ctaPulse {
          0%,100% { box-shadow: 0 0 20px rgba(61,214,245,0.20), 0 0 40px rgba(61,214,245,0.08); }
          50%     { box-shadow: 0 0 30px rgba(61,214,245,0.40), 0 0 60px rgba(61,214,245,0.15); }
        }
        @keyframes svgRotate {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .cta-glow { animation: ctaPulse 3s ease-in-out infinite; }
        .form-input:focus {
          border-color: #3DD6F5 !important;
          box-shadow: 0 0 0 3px rgba(61,214,245,0.12) !important;
          outline: none;
        }
        .form-input::placeholder { color: #8A97B4; opacity: 1; }
        @keyframes marquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-inner { animation: marquee 28s linear infinite; }
        .marquee-wrap:hover .marquee-inner { animation-play-state: paused; }
        .eco-row::-webkit-scrollbar { display: none; }
        .eco-row { scrollbar-width: none; }
        .nav-link:hover { color: #3DD6F5 !important; }
        a { text-decoration: none; color: inherit; }
        * { box-sizing: border-box; }
        @media (prefers-reduced-motion: reduce) {
          .marquee-inner { animation: none !important; }
          * { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
        }
        @media (max-width: 900px) {
          .nav-center  { display: none !important; }
          .hamburger   { display: flex !important; }
          .hero-cols   { flex-direction: column !important; }
          .hero-video  { width: 100% !important; flex: unset !important; }
          .fix-grid    { grid-template-columns: repeat(2,1fr) !important; }
          .offers-row  { flex-direction: column !important; }
          .fit-cols    { flex-direction: column !important; }
          .about-row   { flex-direction: column !important; }
          .process-row { grid-template-columns: repeat(2,1fr) !important; }
          .process-line { display: none !important; }
          .footer-cols { flex-direction: column !important; }
        }
        @media (max-width: 768px) {
          .team-row    { flex-direction: column !important; align-items: center !important; }
        }
        @media (max-width: 540px) {
          .fix-grid    { grid-template-columns: 1fr !important; }
          .process-row { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── NAV ──────────────────────────────────────────────────────────────── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 5vw", height: 58,
        background: `${C.bg}d8`,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: `1px solid ${C.border}40`,
      }}>
        {/* Logo */}
        <a href="/" style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
          <img
            src="https://res.cloudinary.com/dsriscylr/image/upload/v1779128984/method-primary_hl2rrb.svg"
            alt="The Method Co."
            style={{ height: 26, width: 26 }}
          />
          <span style={{ ...DM, fontWeight: 600, color: C.accent, fontSize: "0.88rem", letterSpacing: "0.02em" }}>
            The Method Co.
          </span>
        </a>

        {/* Desktop links */}
        <div className="nav-center" style={{ display: "flex", alignItems: "center", gap: "0.1rem" }}>
          {NAV_LINKS.map(({ label, href }) => (
            <a key={label} href={href} className="nav-link"
              style={{ ...DM, fontWeight: 400, color: C.text, fontSize: "0.82rem",
                padding: "0.35rem 0.7rem", borderRadius: 4, transition: "color 0.15s" }}>
              {label}
            </a>
          ))}
          <a href="https://www.instagram.com/themethodco.co/" target="_blank" rel="noreferrer"
            style={{ color: C.muted, padding: "0.35rem 0.5rem", display: "flex",
              alignItems: "center", transition: "color 0.15s", cursor: "pointer" }} className="nav-link">
            <Ic n="ig" sz={15} col="currentColor" />
          </a>
        </div>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <a href="#apply" className="cta-glow" style={{
            ...EP, fontWeight: 700, color: C.bg, background: C.accent,
            fontSize: "0.72rem", letterSpacing: "0.08em",
            padding: "0.5rem 1.2rem", borderRadius: 5,
            transition: "opacity 0.15s, transform 0.15s",
            cursor: "pointer",
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = "0.88"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = "1"; }}>
            APPLY NOW
          </a>
          <button
            className="hamburger"
            onClick={() => setNavOpen(o => !o)}
            style={{ display: "none", background: "none", border: "none",
              color: C.muted, cursor: "pointer", padding: "0.35rem" }}>
            <Ic n={navOpen ? "close" : "menu"} sz={20} col="currentColor" />
          </button>
        </div>
      </nav>

      {/* Mobile nav drawer */}
      <AnimatePresence>
        {navOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "fixed", top: 58, left: 0, right: 0, zIndex: 190,
              background: `${C.panel}f8`, backdropFilter: "blur(20px)",
              borderBottom: `1px solid ${C.border}`, padding: "1rem 5vw 1.5rem",
              display: "flex", flexDirection: "column", gap: "0.25rem",
            }}>
            {NAV_LINKS.map(({ label, href }) => (
              <a key={label} href={href} onClick={() => setNavOpen(false)}
                style={{ ...DM, fontWeight: 400, color: C.muted, fontSize: "1rem",
                  padding: "0.65rem 0", borderBottom: `1px solid ${C.border}40`,
                  transition: "color 0.15s" }}>
                {label}
              </a>
            ))}
            <a href="#apply" onClick={() => setNavOpen(false)}
              style={{ ...EP, fontWeight: 700, color: C.bg, background: C.accent,
                textAlign: "center", padding: "0.85rem", borderRadius: 6,
                marginTop: "0.75rem", fontSize: "0.85rem", letterSpacing: "0.06em" }}>
              APPLY NOW
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section style={{ position: "relative", padding: "140px 5vw 100px", overflow: "hidden", zIndex: 1 }}>

        {/* Background orbs */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}>
          <div style={{
            position: "absolute", width: 600, height: 600,
            top: "-10%", left: "-5%",
            background: `radial-gradient(circle, ${C.accent}14 0%, transparent 70%)`,
            animation: "orbDrift1 18s ease-in-out infinite",
          }} />
          <div style={{
            position: "absolute", width: 500, height: 500,
            top: "20%", right: "-8%",
            background: `radial-gradient(circle, ${C.glow}10 0%, transparent 70%)`,
            animation: "orbDrift2 22s ease-in-out infinite",
          }} />
          {/* Grain texture */}
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            opacity: 0.028, mixBlendMode: "overlay",
          }} />
        </div>

        <div style={{ maxWidth: 1160, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div className="hero-cols" style={{ display: "flex", gap: "4rem", alignItems: "center" }}>

            {/* Left column - staggered load */}
            <div style={{ flex: "1 1 520px", minWidth: 0 }}>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.05 }}
                style={{ ...LBL, color: C.accent, fontSize: "0.62rem", letterSpacing: "0.14em", marginBottom: "1.1rem" }}>
                // POSITIONING SYSTEM FOR SERVICE BUSINESSES
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  ...EP, fontWeight: 900, lineHeight: 0.9,
                  fontSize: "clamp(3rem, 7vw, 5.5rem)",
                  color: C.text, textTransform: "uppercase",
                  letterSpacing: "-0.02em", marginBottom: "1.5rem",
                  textShadow: "0 0 80px rgba(61,214,245,0.18)",
                }}>
                STOP<br />GUESSING.<br />
                <span style={{ color: C.accent }}>START</span><br />
                POSITIONING.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.3 }}
                style={{ ...DM, fontWeight: 400, color: "#C5CFE0", fontSize: "1.05rem",
                  lineHeight: 1.7, maxWidth: 480, marginBottom: "2rem" }}>
                Most service businesses don't have a visibility problem.
                They have a clarity problem. The Method builds the structure that fixes it.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.42 }}
                style={{ display: "flex", gap: "0.85rem", flexWrap: "wrap", marginBottom: "2rem" }}>
                <a href="#apply" className="cta-glow" style={{
                  ...EP, fontWeight: 700, color: C.bg, background: C.accent,
                  fontSize: "0.82rem", letterSpacing: "0.08em",
                  padding: "0.85rem 2rem", borderRadius: 6,
                  transition: "opacity 0.15s, transform 0.15s",
                  cursor: "pointer",
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)"; }}>
                  APPLY NOW
                </a>
                <a href="#offers" style={{
                  ...DM, fontWeight: 500, color: C.muted,
                  fontSize: "0.82rem",
                  padding: "0.85rem 1.75rem", borderRadius: 6,
                  border: `1px solid ${C.border}`,
                  transition: "color 0.15s, border-color 0.15s",
                  cursor: "pointer",
                }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.color = C.text; el.style.borderColor = `${C.accent}50`;
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.color = C.muted; el.style.borderColor = C.border;
                  }}>
                  See Offers
                </a>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.56 }}
                style={{ ...DM, fontWeight: 400, color: "#A8B5CC", fontSize: "0.78rem",
                  letterSpacing: "0.04em" }}>
                // No hype. No guru promises. Just structure and execution.
              </motion.p>
            </div>

            {/* Right column - atmospheric image with play overlay */}
            {/* HERO VIDEO: replace the img below with <video> or <iframe> when ready */}
            <motion.div
              className="hero-video"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              style={{ flex: "0 0 44%", minWidth: 0, position: "relative", alignSelf: "stretch", minHeight: 380 }}>
              {/* Full-bleed image */}
              <img
                src="https://res.cloudinary.com/dsriscylr/image/upload/v1772066810/freepik__remove-red-and-purple-lighting-cast-completely-neu__56027_joywsg.jpg"
                alt=""
                style={{
                  position: "absolute", inset: 0,
                  width: "100%", height: "100%", objectFit: "cover",
                  filter: "grayscale(15%) contrast(1.08)",
                }}
              />
              {/* Left-to-right gradient: bg at 60% on left, transparent on right */}
              <div style={{
                position: "absolute", inset: 0,
                background: `linear-gradient(90deg, ${C.bg}99 0%, ${C.bg}30 40%, transparent 100%)`,
              }} />
              {/* Play button overlay */}
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: "0.75rem",
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: "50%",
                  border: `1.5px solid ${C.accent}80`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: `${C.bg}a0`, backdropFilter: "blur(6px)",
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <polygon points="9,7 19,12 9,17" fill={C.accent} />
                  </svg>
                </div>
                <p style={{ ...DM, fontWeight: 400, color: `${C.text}90`, fontSize: "0.78rem", letterSpacing: "0.04em" }}>
                  Video coming soon
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <HR />

      {/* ── THE PROBLEM ──────────────────────────────────────────────────────── */}
      <section id="problem" style={{ position: "relative", padding: "96px 5vw", zIndex: 1 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Reveal>
            <SLabel>THE REAL PROBLEM</SLabel>
            <SH>YOU DON'T NEED MORE VISIBILITY.</SH>
            <Sub>You need a clear offer and a system that turns attention into enquiries. More content is not the answer.</Sub>
          </Reveal>
          <div className="fix-grid" style={{ display: "grid",
            gridTemplateColumns: "repeat(3,1fr)", gap: "1px",
            border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
            {[
              {
                icon: "warning", num: "01",
                title: "Confusing offer",
                body: "People cannot tell what you do or why you're the obvious choice. So they scroll past.",
              },
              {
                icon: "layout", num: "02",
                title: "Weak website flow",
                body: "Your page doesn't lead anyone to a decision. Visitors leave without taking a single step.",
              },
              {
                icon: "cursor", num: "03",
                title: "Spend without strategy",
                body: "Paid spend without positioning is spend wasted. Clicks are not the same as clients.",
              },
            ].map((card, i) => (
              <Reveal key={card.num} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -8, scale: 1.02, boxShadow: `0 16px 40px ${C.accent}4d, 0 0 0 1px ${C.accent}60` }}
                  transition={{ duration: 0.2 }}
                  style={{
                    background: C.panel, padding: "2rem",
                    borderRight: i < 2 ? `1px solid ${C.border}` : "none",
                    borderTop: `2px solid transparent`,
                    cursor: "default",
                  }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                    marginBottom: "1.25rem" }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 8,
                      background: `${C.accent}12`, border: `1px solid ${C.accent}30`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Ic n={card.icon} sz={18} col={C.accent} />
                    </div>
                    <span style={{ ...LBL, color: C.muted, fontSize: "0.58rem", opacity: 0.7 }}>{`ISSUE ${card.num}`}</span>
                  </div>
                  <h3 style={{ ...EP, fontWeight: 800, color: C.text, fontSize: "1.05rem",
                    letterSpacing: "0.01em", marginBottom: "0.65rem", textTransform: "uppercase" }}>
                    {card.title}
                  </h3>
                  <p style={{ ...DM, fontWeight: 300, color: "#C5CFE0", fontSize: "0.9rem", lineHeight: 1.65 }}>
                    {card.body}
                  </p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <HR />

      {/* ── WHAT WE FIX ──────────────────────────────────────────────────────── */}
      <section id="fix" style={{ position: "relative", zIndex: 1 }}>
        {/* Full-width atmospheric image strip with floating headline */}
        <div style={{ position: "relative", height: 320, overflow: "hidden", marginBottom: 0 }}>
          <img
            src="https://res.cloudinary.com/dsriscylr/image/upload/v1772066807/freepik__minimalist-professional-workspace-closeup-hands-ty__77621_k4yhcg.jpg"
            alt=""
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%",
              objectFit: "cover", filter: "grayscale(10%) contrast(1.08)" }}
            loading="lazy"
          />
          {/* Top-to-bottom gradient so bottom bleeds into section bg */}
          <div style={{
            position: "absolute", inset: 0,
            background: `linear-gradient(180deg, ${C.bg}60 0%, ${C.bg}00 40%, ${C.bg}e0 80%, ${C.bg} 100%)`,
          }} />
          {/* Floating headline */}
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column",
            justifyContent: "flex-end", padding: "0 5vw 2.5rem" }}>
            <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%" }}>
              <SLabel>WHAT WE FIX</SLabel>
              <SH style={{ marginBottom: 0 }}>PRACTICAL CHANGES THAT CONVERT.</SH>
            </div>
          </div>
        </div>
        <div style={{ padding: "0 5vw 96px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Reveal>
            <Sub>Not advice. Actual work. Six areas where clarity compounds into revenue.</Sub>
          </Reveal>
          <div className="fix-grid" style={{ display: "grid",
            gridTemplateColumns: "repeat(3,1fr)", gap: "1px",
            border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden",
            marginBottom: "3rem",
            background: C.border }}>
            {/* background: C.border fills the 1px grid gaps so no dark bands show through */}
            {[
              { icon: "target", title: "Positioning",           body: "Make your offer undeniable to the right people." },
              { icon: "pen",    title: "Copywriting",           body: "Words that move people from curious to committed." },
              { icon: "layout", title: "Landing Page Build",    body: "Pages built to convert, not to impress your cousin." },
              { icon: "funnel", title: "Funnel Planning",       body: "A clear path from awareness to enquiry to client." },
              { icon: "cursor", title: "Paid Ads Direction",    body: "Ad strategy aligned to positioning, not just budgets." },
              { icon: "search", title: "Digital Clarity Audit", body: "Start free. Find out exactly what is blocking enquiries.", tag: "FREE" },
            ].map((card, i) => (
              <Reveal key={card.title} delay={i * 0.07}>
                <motion.div
                  whileHover={{ y: -8, scale: 1.02, boxShadow: `0 16px 40px ${C.accent}4d, 0 0 0 1px ${C.accent}60` }}
                  transition={{ duration: 0.2 }}
                  style={{
                    background: C.panel, padding: "1.85rem",
                    borderRight: i % 3 < 2 ? `1px solid ${C.border}` : "none",
                    borderBottom: i < 3 ? `1px solid ${C.border}` : "none",
                    cursor: "default", position: "relative",
                  }}>
                  {card.tag && (
                    <span style={{
                      position: "absolute", top: "1.2rem", right: "1.2rem",
                      ...LBL, fontSize: "0.52rem", color: C.amber,
                      border: `1px solid ${C.amber}40`, padding: "0.1rem 0.45rem",
                      borderRadius: 3,
                    }}>{card.tag}</span>
                  )}
                  <div style={{
                    width: 44, height: 44, borderRadius: 10,
                    background: `${C.accent}10`, border: `1px solid ${C.accent}25`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginBottom: "1rem",
                    boxShadow: `0 0 16px ${C.accent}15`,
                  }}>
                    <Ic n={card.icon} sz={20} col={C.accent} />
                  </div>
                  <h3 style={{ ...EP, fontWeight: 800, color: C.text, fontSize: "0.95rem",
                    letterSpacing: "0.02em", marginBottom: "0.5rem", textTransform: "uppercase" }}>
                    {card.title}
                  </h3>
                  <p style={{ ...DM, fontWeight: 300, color: "#C5CFE0", fontSize: "0.85rem", lineHeight: 1.6 }}>
                    {card.body}
                  </p>
                </motion.div>
              </Reveal>
            ))}
          </div>

        </div>
        </div>
      </section>

      <HR />

      {/* ── FIELD GUIDES ─────────────────────────────────────────────────────── */}
      <section id="field-guides" style={{ position: "relative", padding: "96px 5vw", zIndex: 1 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Reveal>
            <p style={{ ...MONO, color: "#4A6CF7", fontSize: "0.62rem", letterSpacing: "0.1em",
              marginBottom: "0.85rem" }}>// FIELD GUIDES</p>
            <SH>The AI and Work Series</SH>
            <p style={{ fontFamily: "'Newsreader', Georgia, serif", fontStyle: "italic",
              fontWeight: 400, color: C.muted, fontSize: "1.05rem", lineHeight: 1.7,
              maxWidth: 560, marginBottom: "3rem" }}>
              Short, sharp field guides to surviving and repositioning in the age of AI. Read in under an hour. Built to be true, not loud.
            </p>
          </Reveal>

          <div className="fix-grid" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)",
            gap: "1.5rem" }}>

            {/* Card 1 — Live */}
            <Reveal delay={0.05}>
              <motion.a
                href="/last-human-job"
                whileHover={{ y: -6, boxShadow: `0 16px 40px rgba(74,108,247,0.22), 0 0 0 1px rgba(74,108,247,0.5)` }}
                transition={{ duration: 0.2 }}
                style={{
                  display: "block", textDecoration: "none",
                  background: C.panel,
                  border: `1px solid ${C.border}`,
                  borderTop: "2px solid #4A6CF7",
                  borderRadius: 8, padding: "2.25rem",
                  cursor: "pointer",
                }}>
                <div style={{ display: "flex", justifyContent: "space-between",
                  alignItems: "flex-start", marginBottom: "1.25rem" }}>
                  <span style={{ ...MONO, fontSize: "0.58rem", color: "#4A6CF7",
                    border: "1px solid rgba(74,108,247,.35)", padding: "3px 9px",
                    borderRadius: 3, letterSpacing: "0.08em" }}>
                    BOOK 01 // AVAILABLE NOW
                  </span>
                </div>
                <h3 style={{ ...BEBAS, color: C.text, fontSize: "2rem",
                  letterSpacing: "0.04em", marginBottom: "0.75rem" }}>
                  The Last Human Job
                </h3>
                <p style={{ ...DM, fontWeight: 300, color: "#C5CFE0", fontSize: "0.92rem",
                  lineHeight: 1.65, marginBottom: "1.75rem" }}>
                  The careers AI is replacing before 2030, and the five questions that tell you if yours is safe.
                </p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: "1.5rem" }}>
                  <span style={{ ...MONO, fontSize: "0.9rem", color: C.muted,
                    textDecoration: "line-through" }}>€19</span>
                  <span style={{ ...BEBAS, fontSize: "1.8rem", color: "#4A6CF7",
                    letterSpacing: "0.04em" }}>€6.97</span>
                </div>
                <span style={{ ...DM, fontWeight: 600, color: "#4A6CF7",
                  fontSize: "0.85rem", letterSpacing: "0.04em" }}>
                  Read more →
                </span>
              </motion.a>
            </Reveal>

            {/* Card 2 — Coming soon */}
            <Reveal delay={0.12}>
              <div style={{
                background: C.panel,
                border: `1px solid ${C.border}`,
                borderTop: `2px solid ${C.border}`,
                borderRadius: 8, padding: "2.25rem",
                opacity: 0.7, cursor: "default",
              }}>
                <div style={{ marginBottom: "1.25rem" }}>
                  <span style={{ ...MONO, fontSize: "0.58rem", color: C.muted,
                    border: `1px solid ${C.border}`, padding: "3px 9px",
                    borderRadius: 3, letterSpacing: "0.08em" }}>
                    BOOK 02 // COMING SOON
                  </span>
                </div>
                <h3 style={{ ...BEBAS, color: C.text, fontSize: "2rem",
                  letterSpacing: "0.04em", marginBottom: "0.75rem" }}>
                  Stay Hireable
                </h3>
                <p style={{ ...DM, fontWeight: 300, color: "#C5CFE0", fontSize: "0.92rem",
                  lineHeight: 1.65, marginBottom: "1.75rem" }}>
                  The 90-day plan to reposition yourself before AI decides your worth.
                </p>
                <div style={{ marginBottom: "1.5rem" }}>
                  <span style={{ ...MONO, fontSize: "0.82rem", color: C.muted,
                    letterSpacing: "0.04em" }}>Coming soon</span>
                </div>
                <a href="mailto:support@themethodco.co?subject=Notify me: Stay Hireable"
                  style={{ ...DM, fontWeight: 600, color: C.muted,
                    fontSize: "0.85rem", letterSpacing: "0.04em",
                    textDecoration: "none" }}>
                  Notify me →
                </a>
              </div>
            </Reveal>

          </div>
        </div>
      </section>

      <HR />

      {/* ── OFFERS ───────────────────────────────────────────────────────────── */}
      <section id="offers" style={{ position: "relative", padding: "96px 5vw", zIndex: 1, overflow: "hidden" }}>
        {/* Rotating concentric circles background */}
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
        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <Reveal>
            <SLabel>OFFERS</SLabel>
            <SH>PICK THE LEVEL OF HELP YOU NEED.</SH>
            <Sub>Every offer starts with the audit. You can go as deep as the work requires.</Sub>
          </Reveal>
          <div className="offers-row" style={{ display: "flex", gap: "1px",
            border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
            {[
              {
                tag: "FREE", tagCol: C.amber, title: "Digital Clarity Audit", price: "Free",
                priceCol: C.amber,
                desc: "Perfect if you're unsure what is blocking enquiries. No commitment required.",
                bullets: ["Review of your digital presence", "What is broken and why", "Clear priorities on what to fix first"],
                cta: "GET THE AUDIT", ctaStyle: "outline", featured: false, popular: false,
              },
              {
                tag: "CORE", tagCol: C.accent, title: "AI Strategy Sprint", price: "EUR 200-300",
                priceCol: C.accent, popular: true,
                desc: "For businesses ready to fix the foundation properly.",
                bullets: [
                  "Offer and positioning refinement",
                  "Messaging and copy direction",
                  "Simple funnel recommendation",
                  "Landing page structure",
                  "30-day action plan",
                  "Ad direction (Meta and Google)",
                ],
                cta: "APPLY FOR SPRINT", ctaStyle: "solid", featured: false,
              },
              {
                tag: "PREMIUM", tagCol: C.text, title: "Method Launch System", price: "EUR 1,000",
                priceCol: C.text,
                desc: "Full strategy plus landing page build plus ads launch. Built fast, built right.",
                bullets: [
                  "Deep positioning and offer refinement",
                  "Full funnel plan",
                  "High-converting landing page",
                  "3-5 ad angles plus creative direction",
                  "Meta and Google campaign setup plan",
                  "Tracking guidance",
                  "14-day launch support",
                ],
                cta: "APPLY FOR LAUNCH", ctaStyle: "outline", featured: false, popular: false,
              },
              {
                tag: "NEW", tagCol: C.accent, title: "Method Chat Bundle", price: "Price on application",
                priceCol: C.accent, featured: true,
                desc: "Everything in a Launch System, plus your own Method Chat: trained on your business, your offer, and your voice.",
                bullets: [
                  "Everything in Method Launch System",
                  "Custom Method Chat trained on your business",
                  "Live now, not coming soon",
                  "Ongoing positioning support through the assistant",
                ],
                cta: "ENQUIRE", ctaStyle: "cyan", popular: false,
              },
            ].map((offer, i) => (
              <Reveal key={offer.title} delay={i * 0.08} style={{ flex: "1 1 0", minWidth: 0 }}>
                <motion.div
                  whileHover={{ y: -8, scale: 1.02, boxShadow: `0 16px 40px ${C.accent}4d, 0 0 0 1px ${C.accent}60` }}
                  transition={{ duration: 0.2 }}
                  style={{
                    background: offer.featured ? `${C.accent}07` : C.panel,
                    borderRight: i < 3 ? `1px solid ${C.border}` : "none",
                    borderTop: `2px solid ${offer.featured ? C.accent : (offer.popular ? C.accent + "60" : C.border)}`,
                    padding: "1.85rem", height: "100%",
                    display: "flex", flexDirection: "column",
                    boxShadow: offer.featured ? `inset 0 0 60px ${C.accent}06` : "none",
                  }}>
                  <div style={{ display: "flex", justifyContent: "space-between",
                    alignItems: "center", marginBottom: "1rem" }}>
                    <span style={{ ...LBL, color: offer.tagCol, fontSize: "0.58rem",
                      border: `1px solid ${offer.tagCol}40`,
                      padding: "0.12rem 0.5rem", borderRadius: 3 }}>
                      [ {offer.tag} ]
                    </span>
                    {offer.popular && (
                      <span style={{ ...LBL, color: C.green, fontSize: "0.56rem",
                        display: "flex", alignItems: "center", gap: "0.35rem" }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: C.green, display: "inline-block" }} />
                        POPULAR
                      </span>
                    )}
                  </div>
                  <h3 style={{ ...EP, fontWeight: 800, color: C.text, fontSize: "1.15rem",
                    letterSpacing: "0.01em", lineHeight: 1.1, marginBottom: "0.4rem",
                    textTransform: "uppercase" }}>
                    {offer.title}
                  </h3>
                  <p style={{ ...EP, fontWeight: 700, color: offer.priceCol, fontSize: "1.25rem",
                    letterSpacing: "0.02em", marginBottom: "0.85rem" }}>
                    {offer.price}
                  </p>
                  <p style={{ ...DM, fontWeight: 300, color: "#C5CFE0", fontSize: "0.84rem",
                    lineHeight: 1.65, marginBottom: "1.25rem", flex: 1 }}>
                    {offer.desc}
                  </p>
                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.5rem",
                    display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {offer.bullets.map(b => (
                      <li key={b} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                        <span style={{ flexShrink: 0, marginTop: 3 }}>
                          <Ic n="check" sz={13} col={offer.featured ? C.accent : C.muted} />
                        </span>
                        <span style={{ ...DM, fontWeight: 400, color: "#C5CFE0", fontSize: "0.8rem", lineHeight: 1.5 }}>
                          {b}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <a href="#apply" style={{
                    ...EP, fontWeight: 700, fontSize: "0.72rem", letterSpacing: "0.1em",
                    padding: "0.7rem 1rem", borderRadius: 6, textAlign: "center",
                    display: "block", transition: "opacity 0.15s",
                    textTransform: "uppercase",
                    ...(offer.ctaStyle === "cyan"
                      ? { color: C.bg, background: C.accent, border: `1px solid ${C.accent}` }
                      : offer.ctaStyle === "solid"
                      ? { color: C.text, background: C.elev, border: `1px solid ${C.border}` }
                      : { color: C.muted, background: "transparent", border: `1px solid ${C.border}` }),
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = "0.8"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = "1"; }}>
                    {offer.cta}
                  </a>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <HR />

      {/* ── FIT ──────────────────────────────────────────────────────────────── */}
      <section id="fit" style={{ position: "relative", padding: "96px 5vw", zIndex: 1, overflow: "hidden" }}>
        {/* Radial lines SVG top-left — 5% opacity, slow rotation */}
        <div style={{ position: "absolute", top: -120, left: -120, pointerEvents: "none", zIndex: 0 }}>
          <svg width="500" height="500" viewBox="0 0 500 500"
            style={{ animation: "svgRotate 72s linear infinite reverse", opacity: 1 }}>
            {Array.from({ length: 16 }, (_, i) => {
              const angle = (i / 16) * Math.PI * 2;
              return <line key={i} x1="250" y1="250"
                x2={250 + Math.cos(angle) * 230} y2={250 + Math.sin(angle) * 230}
                stroke="#3DD6F5" strokeWidth="1" opacity="0.05" />;
            })}
            {[60, 120, 180, 230].map(r => (
              <circle key={r} cx="250" cy="250" r={r} fill="none"
                stroke="#3DD6F5" strokeWidth="0.75" opacity="0.04" />
            ))}
          </svg>
        </div>
        <div style={{ maxWidth: 860, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <Reveal>
            <SLabel>SELECTIVE FIT</SLabel>
            <SH>NOT EVERY BUSINESS IS A FIT.</SH>
            <Sub>This keeps the work sharp and the results real.</Sub>
          </Reveal>
          <div className="fit-cols" style={{ display: "flex", gap: "1px",
            border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
            {[
              {
                label: "GOOD_FIT", col: C.green, icon: "check",
                items: [
                  "You are serious about positioning and conversions",
                  "You will implement, not just collect ideas",
                  "You want clear structure over more content",
                  "You value direct, honest feedback",
                ],
              },
              {
                label: "NOT_A_FIT", col: C.red, icon: "x",
                items: [
                  "You want viral hacks or overnight miracles",
                  "You expect someone to save the business with magic",
                  "You will not change the offer, page, or message",
                  "You want tactics without fixing the foundation first",
                ],
              },
            ].map((col, i) => (
              <Reveal key={col.label} delay={i * 0.1} style={{ flex: 1 }}>
                <div style={{
                  background: C.panel, padding: "2.5rem",
                  borderRight: i < 1 ? `1px solid ${C.border}` : "none",
                  borderTop: `2px solid ${col.col}40`,
                  height: "100%",
                }}>
                  <span style={{ ...LBL, color: col.col, fontSize: "0.62rem",
                    display: "block", marginBottom: "1.5rem" }}>
                    {col.label.replace(/_/g, " ")}
                  </span>
                  <ul style={{ listStyle: "none", padding: 0,
                    display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                    {col.items.map(item => (
                      <li key={item} style={{ display: "flex", alignItems: "flex-start", gap: "0.65rem" }}>
                        <span style={{ flexShrink: 0, marginTop: 2 }}>
                          <Ic n={col.icon} sz={15} col={col.col} />
                        </span>
                        <span style={{ ...DM, fontWeight: 400, color: "#C5CFE0", fontSize: "0.92rem", lineHeight: 1.6 }}>
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <HR />

      {/* ── PROCESS ──────────────────────────────────────────────────────────── */}
      <section id="process" style={{ position: "relative", padding: "96px 5vw", zIndex: 1, overflow: "hidden" }}>
        {/* PROCESS BG: replace with proper "strategy/planning" Cloudinary image when ready.
            CSS grid pattern is a clean placeholder. */}
        <div aria-hidden="true" style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
          backgroundImage: "linear-gradient(rgba(61,214,245,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(61,214,245,0.06) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <Reveal>
            <SLabel>HOW IT WORKS</SLabel>
            <SH>SIMPLE PROCESS. REAL EXECUTION.</SH>
            <Sub>Clarity first. Then we build the system around it.</Sub>
          </Reveal>
          <div style={{ position: "relative" }}>
            <ProcessLine />
            <div className="process-row" style={{ display: "grid",
              gridTemplateColumns: "repeat(4,1fr)", gap: "1.5rem", position: "relative" }}>
              {[
                { num: "01", title: "DIAGNOSE", body: "We identify exactly what is blocking trust and enquiries. No assumptions, no guessing." },
                { num: "02", title: "DESIGN",   body: "Offer, message, funnel structure, and priorities mapped to your business and market." },
                { num: "03", title: "DEPLOY",   body: "Landing page and copy aligned with your ads and organic presence, then launched." },
                { num: "04", title: "DELIVER",  body: "Support through the first cycle. Iterate on what the numbers tell us." },
              ].map((step, i) => (
                <Reveal key={step.num} delay={i * 0.12}>
                  <div style={{ textAlign: "center", position: "relative" }}>
                    {/* Large dim numeral */}
                    <span style={{
                      position: "absolute", bottom: 0, right: "0.5rem",
                      ...EP, fontWeight: 900,
                      fontSize: "5rem", lineHeight: 1,
                      color: C.border, opacity: 0.45, userSelect: "none",
                      zIndex: 0,
                    }}>{step.num}</span>

                    {/* Circle */}
                    <div style={{
                      width: 40, height: 40, borderRadius: "50%",
                      border: `1px solid ${C.border}`,
                      background: C.panel,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      margin: "0 auto 1.5rem", position: "relative", zIndex: 1,
                      boxShadow: `0 0 0 4px ${C.bg}`,
                    }}>
                      <span style={{ ...EP, fontWeight: 800, color: C.accent, fontSize: "0.65rem" }}>
                        {step.num}
                      </span>
                    </div>

                    <h3 style={{ ...EP, fontWeight: 800, color: C.text, fontSize: "1.3rem",
                      letterSpacing: "0.05em", marginBottom: "0.65rem",
                      textTransform: "uppercase", position: "relative", zIndex: 1 }}>
                      {step.title}
                    </h3>
                    <p style={{ ...DM, fontWeight: 300, color: "#C5CFE0", fontSize: "0.87rem",
                      lineHeight: 1.65, position: "relative", zIndex: 1 }}>
                      {step.body}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <HR />

      {/* ── WHO WE ARE ───────────────────────────────────────────────────────── */}
      <section id="about" style={{ position: "relative", padding: "96px 5vw", zIndex: 1 }}>
        <div style={{ maxWidth: 1020, margin: "0 auto" }}>
          <Reveal style={{ textAlign: "center", marginBottom: "4rem" }}>
            <SLabel>THE TEAM</SLabel>
            <SH>BUILT BY OPERATORS, NOT MARKETERS.</SH>
            <Sub style={{ margin: "0 auto", color: "#C5CFE0" }}>
              Small team. Real experience. Hands on every project.
            </Sub>
          </Reveal>
          <div className="team-row" style={{ display: "flex", gap: "3rem", justifyContent: "center" }}>
            {[
              {
                photo: "https://res.cloudinary.com/dsriscylr/image/upload/v1772066810/freepik__remove-red-and-purple-lighting-cast-completely-neu__56027_joywsg.jpg",
                name: "VICTOR MIRANDA",
                role: "FOUNDER + STRATEGY",
                bio: "Brazilian. Dublin-based. Eight years running kitchens before turning to marketing. Builds the positioning and the system.",
              },
              {
                photo: "https://res.cloudinary.com/dsriscylr/image/upload/v1779996691/D51F608D-881C-4009-81B8-8DAC3C5C86A4_n2i2sx.png",
                name: "KAZAMI ONISHI",
                role: "OPERATIONS + CLIENT RELATIONS",
                bio: "Restaurant manager inside Dublin's hospitality scene. Has lived the kind of service business we work with. Handles onboarding, accounts, and keeps every project on track.",
              },
              {
                photo: "https://res.cloudinary.com/dsriscylr/image/upload/v1779996692/magnific_create-a-professional-cor_8vaQeg6IrU_nsdsek.png",
                name: "ANGELO ROCHA",
                role: "DEVELOPER",
                bio: "Builds the landing pages, funnels, and systems behind every strategy. Turns plans into working product.",
              },
            ].map((member, i) => (
              <Reveal key={member.name} delay={i * 0.12} style={{ flex: "1 1 280px", maxWidth: 320 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                  <div style={{
                    width: 200, height: 200, borderRadius: "50%", overflow: "hidden", flexShrink: 0,
                    border: `2px solid ${C.accent}`,
                    boxShadow: "0 0 40px rgba(61,214,245,0.25)",
                    marginBottom: "1.5rem",
                  }}>
                    <img src={member.photo} alt={member.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      loading="lazy" />
                  </div>
                  <h3 style={{ ...EP, fontWeight: 700, color: C.text, fontSize: "1.1rem",
                    letterSpacing: "0.03em", marginBottom: "0.4rem", textTransform: "uppercase" }}>
                    {member.name}
                  </h3>
                  <p style={{ ...DM, fontWeight: 600, color: C.accent, fontSize: "0.62rem",
                    letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "0.85rem" }}>
                    {member.role}
                  </p>
                  <p style={{ ...DM, fontWeight: 400, color: "#C5CFE0", fontSize: "0.88rem",
                    lineHeight: 1.65, maxWidth: 260 }}>
                    {member.bio}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <HR />

      {/* ── PROOF ────────────────────────────────────────────────────────────── */}
      <section id="proof" style={{ position: "relative", padding: "96px 5vw", zIndex: 1 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Reveal>
            <SLabel>PROOF</SLabel>
            <SH>WHAT CLIENTS SAY.</SH>
          </Reveal>

          {/* Marquee */}
          <Reveal delay={0.08}>
            <div className="marquee-wrap" style={{
              overflow: "hidden", position: "relative",
              marginBottom: "3.5rem",
              maskImage: "linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(90deg, transparent 0%, black 8%, black 92%, transparent 100%)",
              borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`,
              padding: "1.25rem 0",
            }}>
              <div className="marquee-inner" style={{ display: "flex", gap: "4rem", width: "max-content" }}>
                {[...Array(2)].flatMap((_, ri) =>
                  ["Lumen Studio", "Northpath Dental", "Vela Physio", "Orla Wellness", "Brightseed", "Cobh Coaching"]
                    .map((name, ni) => (
                      <span key={`${ri}-${ni}`}
                        style={{ ...LBL, color: C.muted, fontSize: "0.7rem", letterSpacing: "0.14em",
                          whiteSpace: "nowrap", opacity: 0.7 }}>
                        {name}
                      </span>
                    ))
                )}
              </div>
            </div>
          </Reveal>

          {/* Testimonials */}
          <div className="proof-row" style={{ display: "flex", gap: "1px",
            border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
            {[
              {
                initials: "MD",
                name: "Mark D.",
                role: "Founder",
                co: "Brightseed",
                quote: "We had traffic but nothing was converting. Within two weeks the structure made sense and so did our numbers. Clear thinking, no nonsense.",
              },
              {
                initials: "SV",
                name: "Sarah V.",
                role: "Owner",
                co: "Vela Physio",
                quote: "The audit alone was worth it. We changed two things on our page and saw a real difference in enquiry quality. Worth every cent.",
              },
              {
                initials: "CO",
                name: "Ciara O.",
                role: "Director",
                co: "Cobh Coaching",
                quote: "The Method gave us a clear offer and a page that actually said what we do. First time in three years clients said they understood us immediately.",
              },
            ].map((t, i) => (
              <Reveal key={t.name} delay={i * 0.1} style={{ flex: 1 }}>
                <motion.div
                  whileHover={{ y: -8, scale: 1.02, boxShadow: `0 16px 40px ${C.accent}4d, 0 0 0 1px ${C.accent}60` }}
                  transition={{ duration: 0.2 }}
                  style={{
                    background: C.panel, padding: "2rem",
                    borderRight: i < 2 ? `1px solid ${C.border}` : "none",
                    height: "100%", display: "flex", flexDirection: "column",
                    cursor: "default",
                  }}>
                  <p style={{ ...DM, fontWeight: 300, color: "#C5CFE0", fontSize: "0.9rem",
                    lineHeight: 1.75, flex: 1, marginBottom: "1.5rem" }}>
                    "{t.quote}"
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 6, flexShrink: 0,
                      background: `${C.accent}15`, border: `1px solid ${C.accent}30`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <span style={{ ...EP, fontWeight: 800, color: C.accent, fontSize: "0.62rem" }}>
                        {t.initials}
                      </span>
                    </div>
                    <div>
                      <p style={{ ...DM, fontWeight: 500, color: C.text, fontSize: "0.82rem", margin: 0 }}>
                        {t.name}
                      </p>
                      <p style={{ ...DM, fontWeight: 300, color: "#A8B5CC", fontSize: "0.72rem", margin: 0 }}>
                        {t.role} / {t.co}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <HR />

      {/* ── ECOSYSTEM ────────────────────────────────────────────────────────── */}
      <section id="ecosystem" style={{ position: "relative", padding: "96px 5vw", zIndex: 1 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Reveal>
            <SLabel>THE ECOSYSTEM</SLabel>
            <SH>ONE SYSTEM. BUILT TO GROW.</SH>
            <Sub>The consultancy is the core. These are what we are building around it.</Sub>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="eco-row" style={{ display: "flex", gap: "16px", overflowX: "auto",
              paddingBottom: "1rem" }}>
              {/* Method Consultancy */}
              <motion.div
                whileHover={{ y: -8, scale: 1.02, boxShadow: `0 16px 48px ${C.accent}4d, 0 0 0 1px ${C.accent}60` }}
                transition={{ duration: 0.2 }}
                style={{
                  flex: "0 0 340px",
                  background: `radial-gradient(circle at top left, ${C.accent}18 0%, ${C.panel} 55%)`,
                  border: `1px solid ${C.border}`, borderRadius: 12,
                  padding: "1.75rem", cursor: "default", minWidth: 0,
                }}>
                <div style={{ display: "flex", justifyContent: "space-between",
                  alignItems: "flex-start", marginBottom: "1.25rem" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
                      <span style={{ ...LBL, color: C.green, fontSize: "0.56rem",
                        display: "flex", alignItems: "center", gap: "0.35rem" }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: C.green,
                          display: "inline-block", boxShadow: `0 0 6px ${C.green}` }} />
                        LIVE
                      </span>
                    </div>
                    <h3 style={{ ...EP, fontWeight: 800, color: C.text, fontSize: "1.05rem",
                      textTransform: "uppercase", margin: 0 }}>
                      Method Consultancy
                    </h3>
                  </div>
                  <div style={{ width: 36, height: 36, borderRadius: 8,
                    background: `${C.accent}12`, border: `1px solid ${C.accent}25`,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Ic n="target" sz={16} col={C.accent} />
                  </div>
                </div>
                <p style={{ ...DM, fontWeight: 300, color: "#C5CFE0", fontSize: "0.84rem",
                  lineHeight: 1.65, marginBottom: "1.25rem" }}>
                  Positioning, copy, and funnel direction for service businesses that want clarity before scale.
                </p>
                <ConsultancyDemo />
                <a href="#apply" style={{
                  ...EP, fontWeight: 700, display: "block", textAlign: "center",
                  color: C.accent, fontSize: "0.72rem", letterSpacing: "0.1em",
                  padding: "0.65rem", borderRadius: 6, border: `1px solid ${C.accent}30`,
                  transition: "background 0.15s",
                  textTransform: "uppercase",
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = `${C.accent}10`; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; }}>
                  APPLY NOW
                </a>
              </motion.div>

              {/* The Method Chat */}
              <motion.div
                whileHover={{ y: -8, scale: 1.02, boxShadow: `0 16px 48px ${C.accent}4d, 0 0 0 1px ${C.accent}80` }}
                transition={{ duration: 0.2 }}
                style={{
                  flex: "0 0 340px",
                  background: `radial-gradient(circle at center, ${C.accent}18 0%, ${C.panel} 60%)`,
                  border: `1px solid ${C.accent}40`,
                  borderRadius: 12, padding: "1.75rem", cursor: "default", minWidth: 0,
                  boxShadow: `0 0 30px ${C.accent}0a`,
                }}>
                <div style={{ display: "flex", justifyContent: "space-between",
                  alignItems: "flex-start", marginBottom: "1.25rem" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
                      <span style={{ ...LBL, color: C.green, fontSize: "0.56rem",
                        display: "flex", alignItems: "center", gap: "0.35rem" }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: C.green,
                          display: "inline-block", boxShadow: `0 0 6px ${C.green}` }} />
                        LIVE
                      </span>
                    </div>
                    <h3 style={{ ...EP, fontWeight: 800, color: C.text, fontSize: "1.05rem",
                      textTransform: "uppercase", margin: 0 }}>
                      The Method Chat
                    </h3>
                  </div>
                  <div style={{ width: 36, height: 36, borderRadius: 8,
                    background: `${C.accent}12`, border: `1px solid ${C.accent}25`,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Ic n="chat" sz={16} col={C.accent} />
                  </div>
                </div>
                <p style={{ ...DM, fontWeight: 300, color: "#C5CFE0", fontSize: "0.84rem",
                  lineHeight: 1.65, marginBottom: "1.25rem" }}>
                  An AI assistant trained on your business, your offer, and your voice. Answers like you do. Available 24 hours.
                  {/* METHOD CHAT: set endpoint to go live */}
                </p>
                <ChatEcoDemo />
                <a href="#apply" style={{
                  ...EP, fontWeight: 700, display: "block", textAlign: "center",
                  color: C.bg, fontSize: "0.72rem", letterSpacing: "0.1em",
                  padding: "0.65rem", borderRadius: 6, background: C.accent,
                  transition: "opacity 0.15s",
                  textTransform: "uppercase",
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = "0.85"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = "1"; }}>
                  GET METHOD CHAT
                </a>
              </motion.div>

              {/* Second Brain */}
              <motion.div
                whileHover={{ y: -8, scale: 1.02, boxShadow: `0 16px 48px ${C.accent}30, 0 0 0 1px ${C.accent}40` }}
                transition={{ duration: 0.2 }}
                style={{
                  flex: "0 0 340px",
                  background: `radial-gradient(circle at bottom right, ${C.accent}12 0%, ${C.panel} 55%)`,
                  border: `1px solid ${C.border}`, borderRadius: 12,
                  padding: "1.75rem", cursor: "default", minWidth: 0,
                  opacity: 0.75,
                }}>
                <div style={{ display: "flex", justifyContent: "space-between",
                  alignItems: "flex-start", marginBottom: "1.25rem" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
                      <span style={{ ...LBL, color: C.muted, fontSize: "0.56rem", opacity: 0.8 }}>
                        COMING SOON
                      </span>
                    </div>
                    <h3 style={{ ...EP, fontWeight: 800, color: C.text, fontSize: "1.05rem",
                      textTransform: "uppercase", margin: 0 }}>
                      Second Brain
                    </h3>
                  </div>
                  <div style={{ width: 36, height: 36, borderRadius: 8,
                    background: C.elev, border: `1px solid ${C.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Ic n="brain" sz={16} col={C.muted} />
                  </div>
                </div>
                <p style={{ ...DM, fontWeight: 300, color: "#C5CFE0", fontSize: "0.84rem",
                  lineHeight: 1.65, marginBottom: "1.25rem" }}>
                  A connected knowledge system that captures your positioning, decisions, and content. Builds itself as you work.
                </p>
                <SecondBrainDemo />
                <div style={{
                  ...DM, fontWeight: 400, display: "block", textAlign: "center",
                  color: C.muted, fontSize: "0.72rem", letterSpacing: "0.1em",
                  padding: "0.65rem", borderRadius: 6, border: `1px solid ${C.border}`,
                }}>
                  IN DEVELOPMENT
                </div>
              </motion.div>
            </div>
          </Reveal>
        </div>
      </section>

      <HR />

      {/* ── APPLY ────────────────────────────────────────────────────────────── */}
      <section id="apply" style={{ position: "relative", padding: "96px 5vw", zIndex: 1 }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <Reveal style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <SLabel>THE NEXT MOVE</SLabel>
            <SH>STOP READING. START FIXING.</SH>
            <Sub style={{ margin: "0 auto", color: "#C5CFE0" }}>
              If your service business deserves clarity, apply. We take on a small number of clients each month. The audit is free. The work is honest. The results compound.
            </Sub>
          </Reveal>

          {submitted ? (
            <Reveal>
              <div style={{
                background: C.panel, border: `1px solid ${C.border}`,
                borderTop: `2px solid ${C.green}`,
                borderRadius: 10, padding: "3rem 2rem", textAlign: "center",
              }}>
                <span style={{ ...LBL, color: C.green, fontSize: "0.62rem",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  gap: "0.5rem", marginBottom: "1.25rem" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%",
                    background: C.green, display: "inline-block" }} />
                  STATUS: RECEIVED
                </span>
                <h3 style={{ ...EP, fontWeight: 900, color: C.text, fontSize: "2rem",
                  letterSpacing: "0.02em", marginBottom: "0.65rem", textTransform: "uppercase" }}>
                  Application received.
                </h3>
                <p style={{ ...DM, fontWeight: 400, color: C.muted, fontSize: "0.95rem" }}>
                  We will be in touch within 48 hours.
                </p>
              </div>
            </Reveal>
          ) : (
            <Reveal delay={0.1}>
              <form onSubmit={handleSubmit} style={{
                background: C.panel, border: `1px solid ${C.border}`,
                borderTop: `2px solid ${C.accent}`,
                borderRadius: 10, padding: "2.5rem",
                display: "flex", flexDirection: "column", gap: "1.25rem",
              }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={lbl}>FULL NAME *</label>
                    <input type="text" required placeholder="Your name"
                      value={form.name} onChange={e => setField("name", e.target.value)}
                      style={inp} className="form-input" />
                  </div>
                  <div>
                    <label style={lbl}>EMAIL *</label>
                    <input type="email" required placeholder="you@example.com"
                      value={form.email} onChange={e => setField("email", e.target.value)}
                      style={inp} className="form-input" />
                  </div>
                </div>
                <div>
                  <label style={lbl}>WEBSITE OR INSTAGRAM (optional)</label>
                  <input type="text" placeholder="yoursite.com or @handle"
                    value={form.website} onChange={e => setField("website", e.target.value)}
                    style={inp} className="form-input" />
                </div>
                <div>
                  <label style={lbl}>WHAT DOES YOUR BUSINESS DO? *</label>
                  <textarea required placeholder="Describe your service and who you help."
                    value={form.business} onChange={e => setField("business", e.target.value)}
                    rows={3} style={{ ...inp, resize: "vertical", lineHeight: 1.6 }}
                    className="form-input" />
                </div>
                <div>
                  <label style={lbl}>BIGGEST GROWTH PROBLEM *</label>
                  <textarea required placeholder="Be specific. The more honest you are, the more useful our response."
                    value={form.problem} onChange={e => setField("problem", e.target.value)}
                    rows={4} style={{ ...inp, resize: "vertical", lineHeight: 1.6 }}
                    className="form-input" />
                </div>
                <motion.button
                  type="submit"
                  disabled={sending}
                  className={sending ? undefined : "cta-glow"}
                  whileHover={{ opacity: 0.9 }}
                  whileTap={{ scale: 0.99 }}
                  style={{
                    ...EP, fontWeight: 700, color: C.bg,
                    background: sending ? C.muted : C.accent,
                    fontSize: "0.82rem", letterSpacing: "0.12em",
                    padding: "1rem", borderRadius: 6, border: "none",
                    cursor: sending ? "wait" : "pointer",
                    transition: "background 0.2s",
                    textTransform: "uppercase",
                  }}>
                  {sending ? "SENDING..." : "APPLY NOW"}
                </motion.button>
                <p style={{ ...DM, fontWeight: 400, color: "#A8B5CC", fontSize: "0.78rem",
                  textAlign: "center", margin: 0 }}>
                  We reply within 48 hours. No automated nonsense.
                </p>
              </form>
            </Reveal>
          )}
        </div>
      </section>

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
                The Method Co.
              </span>
            </div>
            <p style={{ ...DM, fontWeight: 400, color: "#C5CFE0", fontSize: "0.88rem", lineHeight: 1.65, maxWidth: 280 }}>
              Clarity before strategy. Strategy before noise.
            </p>
          </div>

          {/* Column 2: Navigate */}
          <div style={{ flex: "1 1 160px", minWidth: 140 }}>
            <p style={{ ...LBL, color: C.accent, fontSize: "0.6rem", letterSpacing: "0.12em",
              marginBottom: "1.25rem" }}>NAVIGATE</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {[
                { label: "Offers",    href: "#offers"    },
                { label: "Fit",       href: "#fit"       },
                { label: "Process",   href: "#process"   },
                { label: "Ecosystem", href: "#ecosystem" },
                { label: "Apply",     href: "#apply"     },
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
              <a href="https://www.instagram.com/themethodco.co/" target="_blank" rel="noreferrer"
                className="nav-link"
                style={{ display: "flex", alignItems: "center", gap: "0.5rem",
                  color: C.text, transition: "color 0.15s", textDecoration: "none" }}>
                <Ic n="ig" sz={16} col="currentColor" />
                <span style={{ ...DM, fontWeight: 400, fontSize: "0.88rem" }}>@themethodco.co</span>
              </a>
              <a href="mailto:support@themethodco.co"
                className="nav-link"
                style={{ ...DM, fontWeight: 400, color: C.text, fontSize: "0.88rem",
                  transition: "color 0.15s", textDecoration: "none" }}>
                support@themethodco.co
              </a>
              <p style={{ ...DM, fontWeight: 400, color: "#C5CFE0", fontSize: "0.84rem",
                lineHeight: 1.6, margin: 0 }}>
                Based in Dublin. Working worldwide.
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
            &copy; 2026 The Method Co. All rights reserved.
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {[{ label: "Privacy", href: "/privacy" }, { label: "Terms", href: "/terms" }].map(({ label, href }, i) => (
              <span key={label} style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                {i > 0 && <span style={{ color: C.border, fontSize: "0.7rem" }}>|</span>}
                <a href={href}
                  className="nav-link"
                  style={{ ...DM, fontWeight: 400, color: "#C5CFE0", fontSize: "0.78rem",
                    transition: "color 0.15s", textDecoration: "none" }}>
                  {label}
                </a>
              </span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
