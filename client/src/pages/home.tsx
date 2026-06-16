import { useEffect, useRef, useState } from "react";
import { Redirect, Link } from "wouter";
import { motion, useInView } from "framer-motion";
import { useAuth } from "@/contexts/auth";
import { Spinner } from "@/components/ui/spinner";

// ─── Cloudinary ───────────────────────────────────────────────────────────────
const CDN = "https://res.cloudinary.com/dsriscylr/image/upload";
const CDN_METHOD = "https://res.cloudinary.com/dsriscylr/image/upload/method-co";

// METHOD CHAT: set CHAT_API_ENDPOINT to connect the live chatbot.
const CHAT_API_ENDPOINT = "";

// ─── Brand ───────────────────────────────────────────────────────────────────
const C = {
  bg:       "#0C0C0C",
  panel:    "#141414",
  card:     "#181818",
  surface:  "#1F1F1F",
  cyan:     "#3DD6F5",
  cyanD:    "#1FB8E6",
  cyanDim:  "#3DD6F530",
  text:     "#F0F0F0",
  sub:      "#888888",
  dim:      "#444444",
  border:   "#232323",
  borderHi: "#333333",
  green:    "#3DDA84",
  amber:    "#F0A500",
  red:      "#F06060",
} as const;

const MONO:  React.CSSProperties = { fontFamily: "'Space Mono', 'JetBrains Mono', monospace" };
const BEBAS: React.CSSProperties = { fontFamily: "'Bebas Neue', 'Arial Narrow', sans-serif" };
const INTER: React.CSSProperties = { fontFamily: "'Inter', system-ui, sans-serif" };

// ─── Scroll reveal ────────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, style: s }: {
  children: React.ReactNode; delay?: number; style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <div ref={ref} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? "translateY(0)" : "translateY(20px)",
      transition: `opacity 0.55s ease ${delay}s, transform 0.55s ease ${delay}s`,
      ...s,
    }}>{children}</div>
  );
}

// ─── Section header system ────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ ...MONO, color: C.cyan, fontSize: "0.65rem", letterSpacing: "0.06em",
      marginBottom: "0.85rem", opacity: 0.9 }}>
      // {children}
    </p>
  );
}

function SH({ children, style: s }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <h2 style={{
      ...BEBAS, lineHeight: 0.92, letterSpacing: "0.02em", color: C.text,
      fontSize: "clamp(2.4rem, 5vw, 4rem)", marginBottom: "0.9rem", ...s,
    }} className="uppercase">{children}</h2>
  );
}

function Sub({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ ...INTER, color: C.sub, fontSize: "1rem", lineHeight: 1.7,
      maxWidth: 580, marginBottom: "2.75rem" }}>
      {children}
    </p>
  );
}

// ─── Horizontal rule ──────────────────────────────────────────────────────────
function HR() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <div ref={ref} style={{
      height: 1, background: C.border,
      transform: inView ? "scaleX(1)" : "scaleX(0)",
      transformOrigin: "left",
      transition: "transform 0.8s cubic-bezier(0.22,1,0.36,1)",
    }} />
  );
}

// ─── Inline icons ─────────────────────────────────────────────────────────────
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
  };
  return <svg viewBox="0 0 24 24" style={{ width: sz, height: sz, display: "block", flexShrink: 0 }}>{p[n] ?? null}</svg>;
}

// ─── Demo loop ────────────────────────────────────────────────────────────────
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

function DemoWin({ children, fading, minH = 120 }: {
  children: React.ReactNode; fading: boolean; minH?: number;
}) {
  return (
    <div style={{
      background: C.bg, border: `1px solid ${C.border}`, borderRadius: 4,
      padding: "0.85rem", marginBottom: "0.85rem", minHeight: minH,
      opacity: fading ? 0 : 1, transition: "opacity 0.5s ease", overflow: "hidden",
    }}>{children}</div>
  );
}

// ─── Consultancy card demo ────────────────────────────────────────────────────
const AUDIT_BARS = [
  { label: "POSITIONING", v: 41 },
  { label: "MESSAGE",     v: 67 },
  { label: "FUNNEL",      v: 33 },
] as const;

function AuditInner() {
  const [count, setCount] = useState(0);
  const [bars, setBars]   = useState([0, 0, 0]);
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
        <span style={{ ...MONO, color: C.cyan, fontSize: "2rem", lineHeight: 1 }}>{count}</span>
        <span style={{ ...MONO, color: C.dim, fontSize: "0.75rem" }}>/100</span>
        <span style={{ ...MONO, color: C.sub, fontSize: "0.6rem", marginLeft: "auto", letterSpacing: "0.1em" }}>CLARITY_SCORE</span>
      </div>
      {AUDIT_BARS.map((bar, i) => (
        <div key={bar.label} style={{ marginBottom: "0.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
            <span style={{ ...MONO, color: C.sub, fontSize: "0.55rem", letterSpacing: "0.12em" }}>{bar.label}</span>
            <span style={{ ...MONO, color: C.cyan, fontSize: "0.55rem" }}>{bars[i]}%</span>
          </div>
          <div style={{ height: 3, background: C.border, borderRadius: 1, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${bars[i]}%`,
              background: C.cyan, transition: `width 1.4s ease-out ${i * 0.14}s` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
function ConsultancyDemo() {
  const { loopKey, fading } = useDemoLoop(3900);
  return <DemoWin fading={fading}><AuditInner key={loopKey} /></DemoWin>;
}

// ─── Method Chat widget ───────────────────────────────────────────────────────
interface ChatMsg { role: "user" | "bot"; text: string; }

const DEMO_MSGS: ChatMsg[] = [
  { role: "bot",  text: "What are you trying to fix in your business?" },
  { role: "user", text: "My offer is confusing. I keep losing people on the website." },
  { role: "bot",  text: "Then we fix the offer before anything else. What do you actually sell?" },
];

function LiveChat() {
  const [msgs, setMsgs] = useState<ChatMsg[]>([{ role: "bot", text: "What are you trying to fix?" }]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    setMsgs(p => [...p, { role: "user", text }]);
    setBusy(true);
    try {
      const res = await fetch(CHAT_API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setMsgs(p => [...p, { role: "bot", text: data.reply ?? data.message ?? "..." }]);
    } catch {
      setMsgs(p => [...p, { role: "bot", text: "Something went wrong. Try again." }]);
    }
    setBusy(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: 210, background: C.bg,
      border: `1px solid ${C.border}`, borderRadius: 4, overflow: "hidden", marginBottom: "0.85rem" }}>
      <div style={{ ...MONO, fontSize: "0.55rem", color: C.dim, padding: "0.45rem 0.75rem",
        borderBottom: `1px solid ${C.border}`, letterSpacing: "0.1em" }}>
        METHOD_CHAT_v1.0
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "0.75rem",
        display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        {msgs.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "88%",
            background: m.role === "user" ? `${C.cyan}12` : C.panel,
            border: `1px solid ${m.role === "user" ? `${C.cyan}30` : C.border}`,
            borderRadius: 3, padding: "0.3rem 0.6rem",
          }}>
            <p style={{ ...INTER, fontSize: "0.63rem", lineHeight: 1.5, margin: 0,
              color: m.role === "user" ? C.text : C.sub }}>{m.text}</p>
          </div>
        ))}
        {busy && (
          <div style={{ alignSelf: "flex-start", display: "flex", gap: 3,
            padding: "0.3rem 0.6rem", background: C.panel,
            border: `1px solid ${C.border}`, borderRadius: 3 }}>
            {[0,1,2].map(i => <div key={i} style={{ width: 4, height: 4, borderRadius: "50%",
              background: C.dim, animation: `typingDot 1.1s ${i*0.17}s ease-in-out infinite` }} />)}
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div style={{ display: "flex", borderTop: `1px solid ${C.border}`,
        padding: "0.4rem 0.5rem", gap: "0.4rem", background: C.panel }}>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="> type here..."
          style={{ ...MONO, flex: 1, background: "transparent", border: "none",
            outline: "none", color: C.text, fontSize: "0.6rem", padding: "0 0.3rem" }} />
        <button onClick={send} style={{
          background: C.cyan, border: "none", borderRadius: 3,
          padding: "0.28rem 0.55rem", cursor: "pointer", display: "flex", alignItems: "center" }}>
          <Ic n="send" sz={11} col={C.bg} />
        </button>
      </div>
    </div>
  );
}

function DemoChatInner() {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const ts = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1750),
      setTimeout(() => setPhase(3), 2900),
    ];
    return () => ts.forEach(clearTimeout);
  }, []);
  const bub = (role: "user" | "bot", vis: boolean, text: string) => (
    <div style={{
      alignSelf: role === "user" ? "flex-end" : "flex-start", maxWidth: "88%",
      background: role === "user" ? `${C.cyan}12` : C.panel,
      border: `1px solid ${role === "user" ? `${C.cyan}30` : C.border}`,
      borderRadius: 3, padding: "0.3rem 0.6rem",
      opacity: vis ? 1 : 0,
      transform: vis ? "translateX(0)" : role === "user" ? "translateX(10px)" : "translateX(-10px)",
      transition: "opacity 0.3s ease, transform 0.3s ease",
    }}>
      <p style={{ ...INTER, fontSize: "0.63rem", lineHeight: 1.5, margin: 0,
        color: role === "user" ? C.text : C.sub }}>{text}</p>
    </div>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem",
      padding: "0.75rem", overflow: "hidden", height: 170 }}>
      {bub("bot",  phase >= 0, DEMO_MSGS[0].text)}
      {bub("user", phase >= 1, DEMO_MSGS[1].text)}
      <div style={{
        display: "flex", gap: 3, padding: "0.3rem 0.6rem", background: C.panel,
        border: `1px solid ${C.border}`, borderRadius: 3, width: "fit-content",
        opacity: phase === 2 ? 1 : 0, transition: "opacity 0.25s",
      }}>
        {[0,1,2].map(i => <div key={i} style={{ width: 4, height: 4, borderRadius: "50%",
          background: C.dim, animation: phase === 2 ? `typingDot 1.1s ${i*0.17}s ease-in-out infinite` : "none" }} />)}
      </div>
      {bub("bot", phase >= 3, DEMO_MSGS[2].text)}
    </div>
  );
}

function ChatEcoDemo() {
  const { loopKey, fading } = useDemoLoop(4200);
  if (CHAT_API_ENDPOINT) return <LiveChat />;
  return (
    <div style={{
      background: C.bg, border: `1px solid ${C.border}`, borderRadius: 4,
      marginBottom: "0.85rem", overflow: "hidden",
      opacity: fading ? 0 : 1, transition: "opacity 0.5s ease",
    }}>
      <div style={{ ...MONO, fontSize: "0.55rem", color: C.dim,
        padding: "0.45rem 0.75rem", borderBottom: `1px solid ${C.border}`, letterSpacing: "0.1em" }}>
        METHOD_CHAT_v1.0
      </div>
      <DemoChatInner key={loopKey} />
    </div>
  );
}

// ─── Node graph (Second Brain) ────────────────────────────────────────────────
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
    G_NODES.forEach((_, i) => ts.push(setTimeout(() => setNVis(i+1), 80 + i*160)));
    const es = 80 + G_NODES.length * 160 + 180;
    G_EDGES.forEach((_, i) => ts.push(setTimeout(() => setEVis(i+1), es + i*260)));
    const pa = es + G_EDGES.length * 260 + 260;
    ts.push(setTimeout(() => setPulse(true),  pa));
    ts.push(setTimeout(() => setPulse(false), pa + 800));
    return () => ts.forEach(clearTimeout);
  }, [loopKey]);
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}
      style={{ overflow: "visible", transition: "filter 0.4s ease",
        filter: pulse ? `drop-shadow(0 0 6px ${C.cyan}80)` : "none" }}>
      {G_EDGES.map(([a, b], i) => {
        const x1 = G_NODES[a].cx*w, y1 = G_NODES[a].cy*h;
        const x2 = G_NODES[b].cx*w, y2 = G_NODES[b].cy*h;
        const len = Math.hypot(x2-x1, y2-y1);
        const vis = eVis > i;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={C.cyan} strokeWidth={0.75}
          strokeOpacity={pulse ? 0.8 : 0.35}
          strokeDasharray={len} strokeDashoffset={vis ? 0 : len}
          style={{ transition: vis ? "stroke-dashoffset 0.42s ease, stroke-opacity 0.3s" : "none" }}
        />;
      })}
      {G_NODES.map((n, i) => {
        const cx = n.cx*w, cy = n.cy*h, hub = i === 5, vis = nVis > i;
        return (
          <g key={i}>
            {hub && <circle cx={cx} cy={cy} r={7} fill="none" stroke={C.cyan}
              strokeWidth={0.75} strokeOpacity={pulse ? 0.5 : 0.18} />}
            <circle cx={cx} cy={cy} r={hub ? 4 : 3}
              fill={hub ? C.cyan : C.cyanD} fillOpacity={pulse ? 1 : 0.7}
              style={{ transform: `scale(${vis?1:0})`, transformOrigin: `${cx}px ${cy}px`,
                transition: vis ? "transform 0.28s cubic-bezier(0.34,1.56,0.64,1)" : "none" }} />
          </g>
        );
      })}
    </svg>
  );
}
function SecondBrainDemo() {
  const { loopKey, fading } = useDemoLoop(6200);
  return <DemoWin fading={fading} minH={110}><NodeGraph w={222} h={100} loopKey={loopKey} /></DemoWin>;
}

// ─── Ecosystem cards ──────────────────────────────────────────────────────────
interface EcoCardData {
  id: string; title: string; desc: string; status: "live" | "soon";
  anchor: string; featured?: boolean;
}
const ECO_CARDS: EcoCardData[] = [
  { id: "consultancy", title: "Method Consultancy", status: "live", anchor: "#offers",
    desc: "Positioning, copy, funnels, and launch systems for service businesses." },
  { id: "chat", title: "The Method Chat", status: "live", anchor: "#ecosystem", featured: true,
    desc: "Your AI strategist, trained on your business. Sharp answers in your voice, available now." },
  { id: "brain", title: "Second Brain", status: "soon", anchor: "#ecosystem",
    desc: "Every decision, insight, and piece of copy. Connected and remembered." },
];

function CardDemo({ id }: { id: string }) {
  if (id === "consultancy") return <ConsultancyDemo />;
  if (id === "chat")        return <ChatEcoDemo />;
  if (id === "brain")       return <SecondBrainDemo />;
  return null;
}

function EcoCard({ card }: { card: EcoCardData }) {
  const [hover, setHover] = useState(false);
  return (
    <a href={card.anchor}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        flex: `0 0 ${card.featured ? 340 : 300}px`, scrollSnapAlign: "start",
        background: C.card,
        border: `1px solid ${hover ? C.borderHi : C.border}`,
        borderTop: `2px solid ${card.status === "live" ? C.cyan : C.dim}`,
        borderRadius: 4,
        padding: "1.5rem",
        display: "flex", flexDirection: "column",
        cursor: "pointer", textDecoration: "none",
        transform: hover ? "translateY(-4px)" : "translateY(0)",
        transition: "transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease",
        boxShadow: hover ? `0 8px 32px rgba(0,0,0,0.6)` : "none",
      }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
        <span style={{
          ...MONO,
          color: card.status === "live" ? C.green : C.dim,
          fontSize: "0.58rem", letterSpacing: "0.1em",
        }}>
          ● {card.status === "live" ? "LIVE" : "COMING_SOON"}
        </span>
        {card.featured && (
          <span style={{ ...MONO, color: C.cyan, fontSize: "0.58rem", letterSpacing: "0.1em",
            marginLeft: "auto" }}>[ FEATURED ]</span>
        )}
      </div>
      <CardDemo id={card.id} />
      <h3 style={{ ...BEBAS, color: C.text, fontSize: "1.3rem", letterSpacing: "0.05em",
        lineHeight: 1.1, marginBottom: "0.4rem" }}>{card.title}</h3>
      <p style={{ ...INTER, color: C.sub, fontSize: "0.8rem", lineHeight: 1.6,
        flex: 1, marginBottom: "1rem" }}>{card.desc}</p>
      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem",
        opacity: hover ? 1 : 0.45, transition: "opacity 0.25s" }}>
        <span style={{ ...MONO, color: C.cyan, fontSize: "0.62rem" }}>
          {card.status === "soon" ? "learn_more" : "explore"}
        </span>
        <Ic n="arrow" sz={13} col={C.cyan} />
      </div>
    </a>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Landing() {
  const { user, loading } = useAuth();
  const [navOpen, setNavOpen] = useState(false);
  const ecoRef = useRef<HTMLDivElement>(null);
  const [ecoLeft,  setEcoLeft]  = useState(false);
  const [ecoRight, setEcoRight] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", website: "", business: "", problem: "" });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => { document.title = "The Method Co. — Clarity Before Strategy"; }, []);

  function updateEco() {
    const el = ecoRef.current;
    if (!el) return;
    setEcoLeft(el.scrollLeft > 10);
    setEcoRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }
  function scrollEco(dir: "l" | "r") {
    ecoRef.current?.scrollBy({ left: dir === "r" ? 340 : -340, behavior: "smooth" });
  }
  function setField(k: keyof typeof form, v: string) { setForm(p => ({ ...p, [k]: v })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    await new Promise(r => setTimeout(r, 900));
    setSending(false);
    setSubmitted(true);
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex",
      alignItems: "center", justifyContent: "center" }}>
      <Spinner className="size-8" style={{ color: C.cyan }} />
    </div>
  );
  if (user) return <Redirect to="/dashboard" />;

  const inp: React.CSSProperties = {
    ...INTER, width: "100%", background: C.panel, border: `1px solid ${C.border}`,
    borderRadius: 4, color: C.text, fontSize: "0.88rem", padding: "0.75rem 1rem",
    outline: "none", boxSizing: "border-box" as const,
  };
  const lbl: React.CSSProperties = {
    ...MONO, color: C.sub, fontSize: "0.65rem", letterSpacing: "0.08em",
    display: "block", marginBottom: "0.4rem",
  };

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text, overflowX: "hidden" }}>

      <style>{`
        @keyframes typingDot {
          0%,75%,100% { transform: scale(0.35); opacity: 0.25; }
          38%          { transform: scale(1);    opacity: 1; }
        }
        @keyframes scanline {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .eco-row::-webkit-scrollbar { display: none; }
        .eco-row { scrollbar-width: none; }
        .ghost:hover { color: #F0F0F0 !important; border-color: #3DD6F540 !important; }
        .nav-link:hover { color: #F0F0F0 !important; }
        .fix-card:hover { border-top-color: #3DD6F5 !important; transform: translateY(-3px); }
        a { text-decoration: none; }
        @media (max-width: 900px) {
          .nav-center { display: none !important; }
          .hamburger  { display: flex !important; }
          .hero-inner { padding: 110px 5vw 60px !important; }
          .stat-strip { grid-template-columns: repeat(2,1fr) !important; }
          .fix-grid   { grid-template-columns: repeat(2,1fr) !important; }
          .offers-row { flex-direction: column !important; }
          .fit-cols   { flex-direction: column !important; }
          .about-row  { flex-direction: column !important; }
          .process-row { flex-direction: column !important; }
          .process-line { display: none !important; }
          .proof-row  { flex-direction: column !important; }
        }
        @media (max-width: 540px) {
          .fix-grid  { grid-template-columns: 1fr !important; }
          .stat-strip { grid-template-columns: repeat(2,1fr) !important; }
        }
      `}</style>

      {/* Very subtle scanline texture */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.012) 2px, rgba(255,255,255,0.012) 4px)`,
      }} />

      {/* ── NAV ──────────────────────────────────────────────────────────── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 5vw", height: 56,
        background: `${C.bg}f0`, backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${C.border}`,
      }}>
        <Link href="/">
          <a style={{ display: "flex", alignItems: "center", gap: "0.7rem", textDecoration: "none" }}>
            <img src={`https://res.cloudinary.com/dsriscylr/image/upload/v1779128984/method-primary_hl2rrb.svg`} alt="" style={{ height: 28, width: 28 }} />
            <span style={{ ...MONO, color: C.cyan, fontSize: "0.9rem", letterSpacing: "0.04em", fontWeight: 700 }}>
              The Method Co.
            </span>
          </a>
        </Link>

        <div className="nav-center" style={{ display: "flex", alignItems: "center", gap: "0.1rem" }}>
          {[
            { label: "offers",       href: "#offers"    },
            { label: "who it's for", href: "#fit"       },
            { label: "process",      href: "#process"   },
            { label: "about",        href: "#about"     },
            { label: "services",     href: "#ecosystem" },
            { label: "proof",        href: "#proof"     },
          ].map(({ label, href }) => (
            <a key={label} href={href} className="nav-link"
              style={{ ...MONO, color: C.sub, fontSize: "0.7rem",
                padding: "0.35rem 0.65rem", borderRadius: 3, transition: "color 0.15s" }}>
              {label}
            </a>
          ))}
          <a href="https://www.instagram.com/themethodco" target="_blank" rel="noreferrer"
            style={{ color: C.sub, padding: "0.35rem 0.45rem", display: "flex",
              alignItems: "center", transition: "color 0.15s" }} className="nav-link">
            <Ic n="ig" sz={15} col="currentColor" />
          </a>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ ...MONO, color: C.green, fontSize: "0.6rem", letterSpacing: "0.1em",
            display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: C.green,
              display: "inline-block", boxShadow: `0 0 6px ${C.green}` }} />
            OPEN
          </span>
          <a href="#apply" style={{
            ...MONO, color: C.bg, background: C.cyan, fontWeight: 700,
            fontSize: "0.7rem", letterSpacing: "0.1em",
            padding: "0.45rem 1.1rem", borderRadius: 3,
            transition: "opacity 0.15s",
          }} className="cta-btn">BOOK A CALL</a>
          <button className="hamburger"
            style={{ display: "none", background: "transparent", border: "none",
              cursor: "pointer", color: C.sub, padding: "0.2rem" }}
            onClick={() => setNavOpen(o => !o)}>
            <Ic n={navOpen ? "close" : "menu"} sz={20} col={C.sub} />
          </button>
        </div>
      </nav>

      {/* Mobile overlay */}
      {navOpen && (
        <div onClick={() => setNavOpen(false)} style={{
          position: "fixed", inset: 0, zIndex: 99,
          background: `${C.bg}f8`, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: "1.75rem",
        }}>
          {[
            { label: "offers",       href: "#offers"    },
            { label: "who it's for", href: "#fit"       },
            { label: "process",      href: "#process"   },
            { label: "about",        href: "#about"     },
            { label: "services",     href: "#ecosystem" },
            { label: "proof",        href: "#proof"     },
          ].map(({ label, href }) => (
            <a key={label} href={href} onClick={() => setNavOpen(false)}
              style={{ ...MONO, color: C.text, fontSize: "1.4rem", letterSpacing: "0.08em" }}>
              {`> ${label}`}
            </a>
          ))}
          <a href="#apply" onClick={() => setNavOpen(false)} style={{
            ...MONO, color: C.bg, background: C.cyan, fontWeight: 700,
            fontSize: "0.9rem", letterSpacing: "0.1em",
            padding: "0.65rem 2rem", borderRadius: 3, marginTop: "0.5rem",
          }}>BOOK A CALL</a>
        </div>
      )}

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="hero-inner" style={{ position: "relative", zIndex: 1,
        padding: "130px 5vw 80px", minHeight: "100vh",
        display: "flex", flexDirection: "column", justifyContent: "center" }}>

        {/* Hero background image at low opacity */}
        <img src={`https://res.cloudinary.com/dsriscylr/image/upload/v1772066807/freepik_assistant_1771454204222_lj7vgn.jpg`} alt="" style={{
          position: "absolute", inset: 0, width: "100%", height: "100%",
          objectFit: "cover", opacity: 0.04, zIndex: 0, pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 860 }}>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}>
            <span style={{
              ...MONO, color: C.cyan, fontSize: "0.65rem", letterSpacing: "0.12em",
              border: `1px solid ${C.border}`, padding: "0.3rem 0.75rem",
              borderRadius: 2, display: "inline-block", marginBottom: "2rem",
            }}>
              // FOR SERVICE BUSINESSES IN IRELAND & THE UK
            </span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            style={{ ...BEBAS, fontSize: "clamp(4rem, 11vw, 9.5rem)", lineHeight: 0.88,
              letterSpacing: "0.01em", color: C.text, marginBottom: "0.1em" }}
            className="uppercase">
            YOU'RE GOOD AT WHAT YOU DO.
          </motion.h1>
          <motion.h1 initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            style={{ ...BEBAS, fontSize: "clamp(4rem, 11vw, 9.5rem)", lineHeight: 0.88,
              letterSpacing: "0.01em", color: C.cyan, marginBottom: "2rem" }}
            className="uppercase">
            SO WHY DOESN'T THE MARKET SEE IT?
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{ ...INTER, color: C.sub, fontSize: "1.05rem", lineHeight: 1.7,
              maxWidth: 520, marginBottom: "2.5rem" }}>
            Most service businesses don't have a marketing problem. They have a clarity problem.
            The Method fixes how you are seen, so the right clients finally pick you.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.4 }}
            style={{ display: "flex", gap: "0.85rem", flexWrap: "wrap", marginBottom: "0.85rem" }}>
            <a href="#apply" style={{
              ...MONO, color: C.bg, background: C.cyan, fontWeight: 700,
              fontSize: "0.78rem", letterSpacing: "0.1em",
              padding: "0.85rem 1.75rem", borderRadius: 3,
              transition: "opacity 0.15s",
            }}>BOOK A FREE CLARITY CALL</a>
            <a href="#offers" className="ghost" style={{
              ...MONO, color: C.sub,
              border: `1px solid ${C.border}`, fontSize: "0.78rem", letterSpacing: "0.1em",
              padding: "0.85rem 1.75rem", borderRadius: 3,
              transition: "color 0.15s, border-color 0.15s",
            }}>SEE HOW IT WORKS</a>
          </motion.div>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            style={{ ...MONO, color: C.dim, fontSize: "0.6rem", letterSpacing: "0.08em" }}>
            // No hype. No guru promises. Just structure that works.
          </motion.p>
        </div>

        {/* Stat strip */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.65 }}
          className="stat-strip"
          style={{ position: "relative", zIndex: 1, marginTop: "4rem",
            display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "1px",
            border: `1px solid ${C.border}`, borderRadius: 4, overflow: "hidden",
            maxWidth: 720 }}>
          {[
            { label: "CLIENTS_HELPED",  value: "47+" },
            { label: "AVG_SCORE_LIFT",  value: "+41 pts" },
            { label: "LAUNCH_TIME",     value: "14 days" },
            { label: "ACTIVE_PROJECTS", value: "3" },
          ].map((s, i) => (
            <div key={s.label} style={{
              background: C.panel, padding: "1.25rem 1.5rem",
              borderRight: i < 3 ? `1px solid ${C.border}` : "none",
            }}>
              <p style={{ ...MONO, color: C.dim, fontSize: "0.55rem", letterSpacing: "0.12em",
                marginBottom: "0.4rem" }}>{s.label}</p>
              <p style={{ ...BEBAS, color: C.text, fontSize: "1.7rem", lineHeight: 1 }}>{s.value}</p>
            </div>
          ))}
        </motion.div>
      </section>

      <HR />

      {/* ── PAIN ─────────────────────────────────────────────────────────── */}
      <section id="pain" style={{ position: "relative", padding: "96px 5vw", zIndex: 1 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Reveal>
            <SH>SOUND FAMILIAR?</SH>
          </Reveal>
          <div className="fix-grid" style={{ display: "grid",
            gridTemplateColumns: "repeat(3,1fr)", gap: "1px",
            border: `1px solid ${C.border}`, borderRadius: 4, overflow: "hidden",
            marginBottom: "2rem" }}>
            {[
              { label: "PAIN_01", body: "You post, you show up, you work hard. The leads still don't come." },
              { label: "PAIN_02", body: "People say \"nice work\" but pick someone cheaper or louder." },
              { label: "PAIN_03", body: "You know you're good. You just can't make the market see it fast." },
            ].map((card, i) => (
              <Reveal key={card.label} delay={i * 0.1}>
                <div className="fix-card" style={{
                  background: C.card, padding: "2rem",
                  borderRight: i < 2 ? `1px solid ${C.border}` : "none",
                  borderTop: `2px solid transparent`,
                  transition: "border-top-color 0.2s, transform 0.2s",
                }}>
                  <span style={{ ...MONO, color: C.dim, fontSize: "0.6rem",
                    letterSpacing: "0.1em", display: "block", marginBottom: "1rem" }}>
                    {card.label}
                  </span>
                  <p style={{ ...INTER, color: C.sub, fontSize: "0.88rem", lineHeight: 1.65 }}>{card.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.3}>
            <p style={{ ...INTER, color: C.sub, fontSize: "1rem", lineHeight: 1.7 }}>
              That's not a you problem. That's a clarity problem. And clarity can be built.
            </p>
          </Reveal>
        </div>
      </section>

      <HR />

      {/* ── REAL PROBLEM ─────────────────────────────────────────────────── */}
      <section id="problem" style={{ position: "relative", padding: "96px 5vw", zIndex: 1 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Reveal>
            <SectionLabel>THE REAL PROBLEM</SectionLabel>
            <SH>YOU DON'T NEED MORE VISIBILITY.</SH>
            <Sub>You need clarity, and a system that turns attention into enquiries.</Sub>
          </Reveal>
          <div className="fix-grid" style={{ display: "grid",
            gridTemplateColumns: "repeat(3,1fr)", gap: "1px",
            border: `1px solid ${C.border}`, borderRadius: 4, overflow: "hidden" }}>
            {[
              { icon: "warning", label: "ISSUE_01", title: "Confusing offer",
                body: "People cannot tell what you do or why you are the obvious choice. So they scroll past." },
              { icon: "layout",  label: "ISSUE_02", title: "Weak website flow",
                body: "Your page does not lead anyone to a decision. Visitors leave without taking a single step." },
              { icon: "cursor",  label: "ISSUE_03", title: "Ads with no strategy",
                body: "Spend without positioning is spend wasted. Clicks are not the same as clients." },
            ].map((card, i) => (
              <Reveal key={card.label} delay={i * 0.1}>
                <div className="fix-card" style={{
                  background: C.card, padding: "2rem",
                  borderRight: i < 2 ? `1px solid ${C.border}` : "none",
                  borderTop: `2px solid transparent`,
                  transition: "border-top-color 0.2s, transform 0.2s",
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                    marginBottom: "1.25rem" }}>
                    <div style={{ width: 40, height: 40, borderRadius: 3,
                      background: C.surface, border: `1px solid ${C.border}`,
                      display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Ic n={card.icon} sz={18} col={C.sub} />
                    </div>
                    <span style={{ ...MONO, color: C.dim, fontSize: "0.6rem", letterSpacing: "0.1em" }}>
                      {card.label}
                    </span>
                  </div>
                  <h3 style={{ ...BEBAS, color: C.text, fontSize: "1.4rem", letterSpacing: "0.04em",
                    lineHeight: 1.1, marginBottom: "0.65rem" }}>{card.title}</h3>
                  <p style={{ ...INTER, color: C.sub, fontSize: "0.88rem", lineHeight: 1.65 }}>{card.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <HR />

      {/* ── WHAT WE FIX ──────────────────────────────────────────────────── */}
      <section id="fix" style={{ position: "relative", padding: "96px 5vw", zIndex: 1 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Reveal>
            <SectionLabel>WHAT THE METHOD DOES</SectionLabel>
            <SH>WE MAKE YOU THE OBVIOUS CHOICE.</SH>
          </Reveal>

          <div className="fix-grid" style={{ display: "grid",
            gridTemplateColumns: "repeat(3,1fr)", gap: "1px",
            border: `1px solid ${C.border}`, overflow: "hidden", borderRadius: 4,
            marginBottom: "1.5rem" }}>
            {[
              { icon: "target", idx: "01", title: "Positioning",
                body: "We get clear on what you offer and why it matters, so you stop sounding like everyone else." },
              { icon: "pen",    idx: "02", title: "Copy & messaging",
                body: "We fix the words on your site and funnel so they actually sell." },
              { icon: "layout", idx: "03", title: "Funnels & landing pages",
                body: "We build the path that turns a click into a booked client, on our own platform." },
              { icon: "search", idx: "04", title: "Clarity audit",
                body: "We find what's broken in your online presence and tell you exactly what to fix." },
            ].map((card, i) => (
              <Reveal key={card.idx} delay={i * 0.08}>
                <div className="fix-card" style={{
                  background: C.card, padding: "1.75rem",
                  borderRight: i % 3 < 2 ? `1px solid ${C.border}` : "none",
                  borderBottom: i < 3 ? `1px solid ${C.border}` : "none",
                  borderTop: `2px solid transparent`,
                  transition: "border-top-color 0.2s, transform 0.2s",
                  position: "relative",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between",
                    alignItems: "flex-start", marginBottom: "1rem" }}>
                    <div style={{ width: 38, height: 38, borderRadius: 3,
                      background: C.surface, border: `1px solid ${C.border}`,
                      display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Ic n={card.icon} sz={17} col={C.sub} />
                    </div>
                    <span style={{ ...MONO, color: C.dim, fontSize: "0.58rem", letterSpacing: "0.1em" }}>
                      {card.idx}
                    </span>
                  </div>
                  <h3 style={{ ...BEBAS, color: C.text, fontSize: "1.15rem", letterSpacing: "0.04em",
                    lineHeight: 1.1, marginBottom: "0.45rem" }}>{card.title}</h3>
                  <p style={{ ...INTER, color: C.sub, fontSize: "0.84rem", lineHeight: 1.6 }}>{card.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.2}>
            <p style={{ ...MONO, color: C.dim, fontSize: "0.65rem", letterSpacing: "0.06em" }}>
              // Not a social-media agency. We do not post for you. We build the structure underneath everything.
            </p>
          </Reveal>

          {/* Dashboard image */}
          <Reveal>
            <div style={{ maxWidth: 600, margin: "2rem auto 0", borderRadius: 16, overflow: "hidden",
              border: "1px solid rgba(61,214,245,0.2)", position: "relative" }}>
              <img src="https://res.cloudinary.com/dsriscylr/image/upload/v1772066807/freepik__minimalist-professional-workspace-closeup-hands-ty__77621_k4yhcg.jpg" alt=""
                style={{ width: "100%", display: "block",
                  filter: "brightness(0.75) contrast(1.1)" }} />
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to bottom, transparent 50%, rgba(12,12,12,0.7) 100%)",
              }} />
            </div>
          </Reveal>
        </div>
      </section>

      <HR />

      {/* ── OFFERS ───────────────────────────────────────────────────────── */}
      <section id="offers" style={{ position: "relative", padding: "96px 5vw", zIndex: 1 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Reveal>
            <SectionLabel>OFFERS</SectionLabel>
            <SH>PICK THE LEVEL OF HELP YOU NEED.</SH>
            <Sub>From a free clarity audit to full execution. No retainers, no fluff.</Sub>
          </Reveal>

          <div className="offers-row" style={{ display: "flex", gap: "1px",
            border: `1px solid ${C.border}`, borderRadius: 4, overflow: "hidden" }}>
            {[
              {
                tag: "FREE", tagCol: C.amber, title: "Digital Clarity Audit", price: "Free",
                priceCol: C.amber, desc: "Perfect if you are unsure what is blocking enquiries.",
                bullets: ["Review of your digital presence","What is broken and why","Clear priorities on what to fix first"],
                bulletCol: C.sub, cta: "BOOK A FREE CLARITY CALL", ctaStyle: "outline",
              },
              {
                tag: "CORE", tagCol: C.cyan, title: "AI Strategy Sprint", price: "EUR 200-300",
                priceCol: C.cyan, popular: true,
                desc: "For businesses ready to fix the foundation properly.",
                bullets: ["Offer and positioning refinement","Messaging and copy direction","Simple funnel recommendation","Landing page structure","30-day action plan","Ad direction (Meta and Google)"],
                bulletCol: C.sub, cta: "BOOK A CALL", ctaStyle: "solid",
              },
              {
                tag: "PREMIUM", tagCol: C.text, title: "Method Launch System", price: "EUR 1,000",
                priceCol: C.text,
                desc: "Full strategy plus landing page build plus ads launch. Built fast, built right.",
                bullets: ["Deep positioning and offer refinement","Full funnel plan","High-converting landing page","3-5 ad angles plus creative direction","Meta/Google campaign setup plan","Tracking guidance","14-day launch support"],
                bulletCol: C.sub, cta: "BOOK A CALL", ctaStyle: "outline",
              },
              {
                tag: "NEW", tagCol: C.cyan, title: "Method Chat Bundle", price: "POA",
                priceCol: C.cyan, featured: true,
                desc: "Everything in a Launch System, plus your own Method Chat: trained on your business, your offer, and your voice. Live and on-message.",
                bullets: ["Everything in Method Launch System","Custom Method Chat trained on your business","Live now, not coming soon","Ongoing positioning support through the assistant"],
                bulletCol: C.sub, cta: "BOOK A CALL", ctaStyle: "cyan",
              },
            ].map((offer, i) => (
              <Reveal key={offer.title} delay={i * 0.08} style={{ flex: "1 1 0", minWidth: 0 }}>
                <div style={{
                  background: offer.featured ? `${C.cyan}08` : C.card,
                  borderRight: i < 3 ? `1px solid ${C.border}` : "none",
                  borderTop: `2px solid ${offer.featured ? C.cyan : C.border}`,
                  padding: "1.75rem", height: "100%", display: "flex", flexDirection: "column",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between",
                    alignItems: "center", marginBottom: "1rem" }}>
                    <span style={{ ...MONO, color: offer.tagCol, fontSize: "0.6rem",
                      letterSpacing: "0.12em", border: `1px solid ${offer.tagCol}40`,
                      padding: "0.15rem 0.55rem", borderRadius: 2 }}>[ {offer.tag} ]</span>
                    {offer.popular && (
                      <span style={{ ...MONO, color: C.green, fontSize: "0.58rem",
                        letterSpacing: "0.1em" }}>● POPULAR</span>
                    )}
                  </div>
                  <h3 style={{ ...BEBAS, color: C.text, fontSize: "1.3rem", letterSpacing: "0.04em",
                    lineHeight: 1.1, marginBottom: "0.3rem" }}>{offer.title}</h3>
                  <p style={{ ...MONO, color: offer.priceCol, fontSize: "1.4rem",
                    letterSpacing: "0.03em", marginBottom: "0.85rem" }}>{offer.price}</p>
                  <p style={{ ...INTER, color: C.sub, fontSize: "0.82rem", lineHeight: 1.6,
                    marginBottom: "1.25rem", flex: 1 }}>{offer.desc}</p>
                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.5rem",
                    display: "flex", flexDirection: "column", gap: "0.45rem" }}>
                    {offer.bullets.map(b => (
                      <li key={b} style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                        <span style={{ flexShrink: 0, marginTop: 3 }}>
                          <Ic n="check" sz={13} col={offer.featured ? C.cyan : C.dim} />
                        </span>
                        <span style={{ ...INTER, color: offer.bulletCol, fontSize: "0.78rem",
                          lineHeight: 1.5 }}>{b}</span>
                      </li>
                    ))}
                  </ul>
                  <a href="#apply" style={{
                    ...MONO, fontSize: "0.7rem", letterSpacing: "0.1em",
                    padding: "0.65rem 1rem", borderRadius: 3, textAlign: "center",
                    display: "block", fontWeight: 700,
                    ...(offer.ctaStyle === "solid"
                      ? { color: C.bg, background: C.surface, border: `1px solid ${C.borderHi}` }
                      : offer.ctaStyle === "cyan"
                      ? { color: C.bg, background: C.cyan, border: `1px solid ${C.cyan}` }
                      : { color: C.sub, background: "transparent", border: `1px solid ${C.border}` }),
                    transition: "opacity 0.15s",
                  }} className="ghost">{offer.cta}</a>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <HR />

      {/* ── FIT ──────────────────────────────────────────────────────────── */}
      <section id="fit" style={{ position: "relative", padding: "96px 5vw", zIndex: 1 }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <Reveal>
            <SectionLabel>SELECTIVE FIT</SectionLabel>
            <SH>NOT EVERY BUSINESS IS A FIT.</SH>
            <Sub style={{ marginBottom: "2.5rem" }}>This keeps the work sharp and the results real.</Sub>
          </Reveal>
          <div className="fit-cols" style={{ display: "flex", gap: "1px",
            border: `1px solid ${C.border}`, borderRadius: 4, overflow: "hidden" }}>
            {[
              {
                label: "GOOD_FIT", col: C.green,
                items: [
                  "You are serious about positioning and conversions",
                  "You will implement, not just collect ideas",
                  "You want clear structure over more content",
                  "You value direct, honest feedback",
                ],
                icon: "check",
              },
              {
                label: "NOT_A_FIT", col: C.red,
                items: [
                  "You want viral hacks or overnight miracles",
                  "You expect someone to save the business with magic",
                  "You will not change the offer, page, or message",
                  "You want tactics without fixing the foundation first",
                ],
                icon: "x",
              },
            ].map((col, i) => (
              <Reveal key={col.label} delay={i * 0.1} style={{ flex: 1 }}>
                <div style={{ background: C.card, padding: "2rem",
                  borderLeft: i === 1 ? `1px solid ${C.border}` : "none" }}>
                  <p style={{ ...MONO, color: col.col, fontSize: "0.65rem",
                    letterSpacing: "0.12em", marginBottom: "1.5rem",
                    display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%",
                      background: col.col, display: "inline-block" }} />
                    {col.label}
                  </p>
                  <ul style={{ listStyle: "none", padding: 0, display: "flex",
                    flexDirection: "column", gap: "0.9rem" }}>
                    {col.items.map(item => (
                      <li key={item} style={{ display: "flex", alignItems: "flex-start",
                        gap: "0.7rem" }}>
                        <span style={{ flexShrink: 0, marginTop: 2 }}>
                          <Ic n={col.icon} sz={15} col={col.col} />
                        </span>
                        <span style={{ ...INTER, color: C.sub, fontSize: "0.9rem",
                          lineHeight: 1.55 }}>{item}</span>
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

      {/* ── PROCESS ──────────────────────────────────────────────────────── */}
      <section id="process" style={{ position: "relative", padding: "96px 5vw", zIndex: 1 }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Reveal>
            <SectionLabel>THE PROCESS</SectionLabel>
            <SH>FOUR STEPS. ONE CLEAR PATH.</SH>
          </Reveal>
          <div style={{ position: "relative" }}>
            <div className="process-line" style={{
              position: "absolute", top: 19, left: "calc(12.5% + 20px)", right: "calc(12.5% + 20px)",
              height: 1, background: C.border, zIndex: 0,
            }} />
            <div className="process-row" style={{ display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "2rem", position: "relative" }}>
              {[
                { num: "01", title: "DIAGNOSE", body: "We find what's actually getting in the way." },
                { num: "02", title: "DESIGN",   body: "We build your positioning and message." },
                { num: "03", title: "DEPLOY",   body: "We put it live: site, copy, funnel." },
                { num: "04", title: "DELIVER",  body: "You show up clear, and the right clients notice." },
              ].map((step, i) => (
                <Reveal key={step.num} delay={i * 0.15} style={{ textAlign: "center" }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: "50%",
                    border: `1px solid ${C.borderHi}`,
                    background: C.panel,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 1.5rem", position: "relative", zIndex: 1,
                  }}>
                    <span style={{ ...MONO, color: C.cyan, fontSize: "0.65rem", fontWeight: 700 }}>
                      {step.num}
                    </span>
                  </div>
                  <h3 style={{ ...BEBAS, color: C.text, fontSize: "1.5rem", letterSpacing: "0.05em",
                    marginBottom: "0.6rem" }}>{step.title}</h3>
                  <p style={{ ...INTER, color: C.sub, fontSize: "0.87rem", lineHeight: 1.65 }}>
                    {step.body}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <HR />

      {/* ── VIDEO ────────────────────────────────────────────────────────── */}
      <section id="video" style={{ position: "relative", padding: "96px 5vw", zIndex: 1 }}>
        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
          <Reveal>
            <SectionLabel>60 SECONDS</SectionLabel>
            <SH style={{ marginBottom: "1.5rem" }}>
              Why most service businesses stay invisible (and how to fix it)
            </SH>
          </Reveal>
          <Reveal delay={0.1}>
            <div style={{
              background: C.panel, border: `1px solid ${C.border}`, borderRadius: 8,
              overflow: "hidden", aspectRatio: "16/9",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: "1.25rem", position: "relative",
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: `${C.cyan}20`, border: `1px solid ${C.cyan}40`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Ic n="play" sz={28} col={C.cyan} />
              </div>
            </div>
            <p style={{ ...MONO, color: C.dim, fontSize: "0.65rem", letterSpacing: "0.08em" }}>
              // Watch this before you spend another euro on marketing.
            </p>
          </Reveal>
        </div>
      </section>

      <HR />

      {/* ── ABOUT ────────────────────────────────────────────────────────── */}
      <section id="about" style={{ position: "relative", padding: "96px 5vw", zIndex: 1 }}>
        <div style={{ maxWidth: 1020, margin: "0 auto" }}>
          <div className="about-row" style={{ display: "flex", gap: "4rem", alignItems: "flex-start" }}>
            <div style={{ flex: "1 1 460px", minWidth: 0 }}>
              <Reveal>
                <SectionLabel>ABOUT</SectionLabel>
                <SH>WE'RE PRACTICAL. WE BUILD STRUCTURE.</SH>
                <p style={{ ...INTER, color: C.sub, fontSize: "1rem", lineHeight: 1.7,
                  marginBottom: "2rem" }}>No hype. No fluff. Just what moves the needle.</p>
              </Reveal>
              <Reveal delay={0.1}>
                <p style={{ ...MONO, color: C.cyan, fontSize: "0.62rem", letterSpacing: "0.12em",
                  marginBottom: "0.85rem" }}>// WHAT_YOU_CAN_EXPECT</p>
                <ul style={{ listStyle: "none", padding: 0, display: "flex",
                  flexDirection: "column", gap: "0.7rem", marginBottom: "2rem" }}>
                  {[
                    "Clear feedback, no sugarcoating",
                    "Strong positioning direction",
                    "Better copy and page flow",
                    "Smarter ad and message alignment",
                    "Simple systems you can actually run",
                  ].map(item => (
                    <li key={item} style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                      <Ic n="check" sz={14} col={C.cyan} />
                      <span style={{ ...INTER, color: C.sub, fontSize: "0.9rem" }}>{item}</span>
                    </li>
                  ))}
                </ul>
                <p style={{ ...MONO, color: C.dim, fontSize: "0.65rem", lineHeight: 1.7,
                  letterSpacing: "0.03em" }}>
                  // Based in Dublin. Working with serious founders and small businesses who want
                  clarity over noise.
                </p>
              </Reveal>
            </div>
            <Reveal delay={0.15} style={{ flex: "0 0 360px", maxWidth: 360 }}>
              <div style={{ borderRadius: 16, overflow: "hidden",
                border: `1px solid ${C.border}`,
                filter: "grayscale(20%) contrast(1.05)",
                maxHeight: 500,
              }}>
                <img src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1200&q=80" alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <HR />

      {/* ── PROOF ────────────────────────────────────────────────────────── */}
      <section id="proof" style={{ position: "relative", padding: "96px 5vw", zIndex: 1 }}>
        <div style={{ maxWidth: 1020, margin: "0 auto" }}>
          <Reveal>
            <SectionLabel>PROOF</SectionLabel>
            <SH>WHAT CLIENTS SAY.</SH>
          </Reveal>
          <Reveal delay={0.08}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem 3rem",
              margin: "2rem 0 3.5rem", borderBottom: `1px solid ${C.border}`,
              paddingBottom: "2.5rem" }}>
              {["Lumen Studio","Northpath Dental","Vela Physio","Orla Wellness","Brightseed","Cobh Coaching"].map(name => (
                <span key={name} style={{ ...MONO, color: C.dim, fontSize: "0.65rem",
                  letterSpacing: "0.12em", textTransform: "uppercase" }}>{name}</span>
              ))}
            </div>
          </Reveal>
          <div className="proof-row" style={{ display: "flex", gap: "1px",
            border: `1px solid ${C.border}`, borderRadius: 4, overflow: "hidden" }}>
            {[
              { initials: "MD", name: "Mark D.", role: "Founder", co: "Brightseed",
                quote: "We had been getting clicks but no enquiries. After the Strategy Sprint, our landing page actually worked. Enquiries picked up within two weeks." },
              { initials: "CB", name: "Claire B.", role: "Director", co: "Northpath Dental",
                quote: "We knew our offer was confusing but did not know how to fix it. The positioning work made a real difference to how we explain ourselves online." },
              { initials: "TH", name: "Tom H.", role: "Owner", co: "Cobh Coaching",
                quote: "The clarity audit flagged exactly what I already sensed was wrong, and gave me a clear plan to fix it. Direct feedback, no fluff." },
            ].map((t, i) => (
              <Reveal key={t.name} delay={i * 0.1} style={{ flex: 1 }}>
                <div style={{ background: C.card, padding: "2rem",
                  borderRight: i < 2 ? `1px solid ${C.border}` : "none",
                  height: "100%", display: "flex", flexDirection: "column" }}>
                  <p style={{ ...INTER, color: C.sub, fontSize: "0.87rem", lineHeight: 1.7,
                    flex: 1, marginBottom: "1.5rem", fontStyle: "italic" }}>
                    "{t.quote}"
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
                    <div style={{ width: 34, height: 34, borderRadius: 3, flexShrink: 0,
                      background: C.surface, border: `1px solid ${C.border}`,
                      display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ ...MONO, color: C.cyan, fontSize: "0.6rem",
                        fontWeight: 700 }}>{t.initials}</span>
                    </div>
                    <div>
                      <p style={{ ...MONO, color: C.text, fontSize: "0.65rem",
                        fontWeight: 700, margin: 0, letterSpacing: "0.05em" }}>{t.name}</p>
                      <p style={{ ...MONO, color: C.dim, fontSize: "0.58rem",
                        margin: 0, letterSpacing: "0.05em" }}>{t.role} / {t.co}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <HR />

      {/* ── ECOSYSTEM ────────────────────────────────────────────────────── */}
      <section id="ecosystem" style={{ position: "relative", padding: "96px 5vw", zIndex: 1 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <Reveal>
            <SectionLabel>THE ECOSYSTEM</SectionLabel>
            <SH>ONE SYSTEM. BUILT TO GROW.</SH>
            <Sub>The consultancy is the core. These are what we are building around it.</Sub>
          </Reveal>
          <Reveal delay={0.1}>
            <div style={{ position: "relative" }}>
              <button onClick={() => scrollEco("l")} style={{
                position: "absolute", left: -18, top: "50%", transform: "translateY(-50%)",
                zIndex: 10, background: C.panel, border: `1px solid ${C.border}`,
                borderRadius: 3, width: 36, height: 36,
                display: ecoLeft ? "flex" : "none",
                alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: C.sub,
              }}>
                <svg viewBox="0 0 24 24" width={16} height={16}><path d="M15 18l-6-6 6-6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" stroke="currentColor"/></svg>
              </button>
              <button onClick={() => scrollEco("r")} style={{
                position: "absolute", right: -18, top: "50%", transform: "translateY(-50%)",
                zIndex: 10, background: C.panel, border: `1px solid ${C.border}`,
                borderRadius: 3, width: 36, height: 36,
                display: ecoRight ? "flex" : "none",
                alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: C.sub,
              }}>
                <svg viewBox="0 0 24 24" width={16} height={16}><path d="M9 18l6-6-6-6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" stroke="currentColor"/></svg>
              </button>
              <div ref={ecoRef} className="eco-row"
                onScroll={updateEco}
                style={{ display: "flex", gap: "1px", overflowX: "auto",
                  scrollSnapType: "x mandatory", paddingBottom: "0.5rem",
                  border: `1px solid ${C.border}`, borderRadius: 4, overflow: "hidden" }}>
                {ECO_CARDS.map(card => <EcoCard key={card.id} card={card} />)}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <HR />

      {/* ── APPLY ────────────────────────────────────────────────────────── */}
      <section id="apply" style={{ position: "relative", padding: "96px 5vw", zIndex: 1 }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <Reveal style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <SectionLabel>APPLY</SectionLabel>
            <SH>STOP GUESSING. START POSITIONING.</SH>
            <Sub style={{ margin: "0 auto" }}>
              Book a free 20-minute clarity call. We'll find what's getting in the way, no pitch, no pressure.
            </Sub>
          </Reveal>

          {submitted ? (
            <Reveal>
              <div style={{ background: C.card, border: `1px solid ${C.border}`,
                borderTop: `2px solid ${C.green}`,
                borderRadius: 4, padding: "3rem 2rem", textAlign: "center" }}>
                <span style={{ ...MONO, color: C.green, fontSize: "0.65rem",
                  letterSpacing: "0.12em", display: "flex", alignItems: "center",
                  justifyContent: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%",
                    background: C.green, display: "inline-block" }} />
                  STATUS: RECEIVED
                </span>
                <h3 style={{ ...BEBAS, color: C.text, fontSize: "2rem", letterSpacing: "0.05em",
                  marginBottom: "0.6rem" }}>Application received.</h3>
                <p style={{ ...INTER, color: C.sub, fontSize: "0.95rem" }}>We will be in touch.</p>
              </div>
            </Reveal>
          ) : (
            <Reveal delay={0.1}>
              <form onSubmit={handleSubmit} style={{
                background: C.card, border: `1px solid ${C.border}`,
                borderTop: `2px solid ${C.cyan}`,
                borderRadius: 4, padding: "2.5rem",
                display: "flex", flexDirection: "column", gap: "1.25rem",
              }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={lbl}>FULL_NAME *</label>
                    <input type="text" required placeholder="Your name"
                      value={form.name} onChange={e => setField("name", e.target.value)} style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>EMAIL *</label>
                    <input type="email" required placeholder="you@example.com"
                      value={form.email} onChange={e => setField("email", e.target.value)} style={inp} />
                  </div>
                </div>
                <div>
                  <label style={lbl}>WEBSITE_OR_INSTAGRAM</label>
                  <input type="text" placeholder="yoursite.com or @handle"
                    value={form.website} onChange={e => setField("website", e.target.value)} style={inp} />
                </div>
                <div>
                  <label style={lbl}>WHAT_DOES_YOUR_BUSINESS_DO *</label>
                  <textarea required placeholder="Describe your service and who you help."
                    value={form.business} onChange={e => setField("business", e.target.value)}
                    rows={3} style={{ ...inp, resize: "vertical", lineHeight: 1.6 }} />
                </div>
                <div>
                  <label style={lbl}>BIGGEST_GROWTH_PROBLEM *</label>
                  <textarea required placeholder="Be specific. The more honest you are, the more useful our response."
                    value={form.problem} onChange={e => setField("problem", e.target.value)}
                    rows={4} style={{ ...inp, resize: "vertical", lineHeight: 1.6 }} />
                </div>
                <button type="submit" disabled={sending} style={{
                  ...MONO, color: C.bg, background: sending ? C.dim : C.cyan,
                  fontWeight: 700, fontSize: "0.78rem", letterSpacing: "0.12em",
                  padding: "1rem", borderRadius: 3, border: "none",
                  cursor: sending ? "wait" : "pointer",
                  transition: "background 0.2s",
                }}>
                  {sending ? "SENDING..." : "BOOK MY FREE CALL"}
                </button>
              </form>
            </Reveal>
          )}
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer style={{
        position: "relative", zIndex: 1, borderTop: `1px solid ${C.border}`,
        padding: "1.75rem 5vw",
        display: "flex", flexWrap: "wrap",
        alignItems: "center", justifyContent: "space-between", gap: "1rem",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
          <img src={`https://res.cloudinary.com/dsriscylr/image/upload/v1779128984/method-primary_hl2rrb.svg`} alt="" style={{ height: 24, width: 24 }} />
          <span style={{ ...MONO, color: C.dim, fontSize: "0.65rem", letterSpacing: "0.08em" }}>
            The Method Co. // CLARITY BEFORE STRATEGY.
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <a href="https://www.instagram.com/themethodco" target="_blank" rel="noreferrer"
            style={{ color: C.dim, transition: "color 0.15s" }} className="ghost">
            <Ic n="ig" sz={16} col="currentColor" />
          </a>
          {[{ label: "privacy", href: "/privacy" }, { label: "terms", href: "/terms" }].map(({ label, href }) => (
            <Link key={label} href={href}>
              <a style={{ ...MONO, color: C.dim, fontSize: "0.62rem",
                letterSpacing: "0.08em", transition: "color 0.15s" }} className="ghost">{label}</a>
            </Link>
          ))}
        </div>
      </footer>
    </div>
  );
}
