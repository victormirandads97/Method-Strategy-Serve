/**
 * Vector illustration kit for the Little Plot Books samples.
 *
 * Every picture is a list of shapes in a 1000 × 1000 box. The same list is
 * drawn on the website (SVG, with a texture treatment per style) and into the
 * sample PDFs (pdf-lib), so each character looks the same on every page and in
 * every format. Seven art styles are applied as treatments on top of the same
 * drawing, which is what makes the style comparison a fair one.
 *
 * Sample art only. Customer books are illustrated to order.
 */
import type { StoryId, StyleId } from "./catalog";

export type Pt = [number, number];
export interface Geo { pts: Pt[]; closed: boolean; smooth: boolean }
export interface Shape {
  geo: Geo[];
  fill?: string;
  stroke?: string;
  sw?: number;
  o?: number;
  /** Gets an outline in outlined styles. */
  ol?: boolean;
}

export const C = {
  ink: "#22302B",
  paper: "#FBF6EC",
  evergreen: "#1F4D3D",
  cranberry: "#A3283F",
  gold: "#C9A24B",
  snow: "#F7F9FC",
  night: "#1E2A44",
  nightDeep: "#141C30",
  grass: "#9CC08A",
  grassDark: "#6E9A61",
  sky: "#CFE3EE",
  brick: "#C8775A",
  wood: "#9A6B47",
  star: "#F7D560",
  cheek: "#F09A8E",
};

// ---------------------------------------------------------------------------
// Geometry
// ---------------------------------------------------------------------------

export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const r1 = (n: number) => Math.round(n * 10) / 10;

export function geoPath(g: Geo): string {
  const p = g.pts;
  if (p.length < 2) return "";
  if (!g.smooth) return `M${p.map(([x, y]) => `${r1(x)} ${r1(y)}`).join(" L")}${g.closed ? " Z" : ""}`;
  const n = p.length;
  const at = (i: number) => (g.closed ? p[(i + n) % n] : p[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${r1(p[0][0])} ${r1(p[0][1])}`;
  const segs = g.closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = at(i - 1), q1 = at(i), q2 = at(i + 1), p3 = at(i + 2);
    d += ` C${r1(q1[0] + (q2[0] - p0[0]) / 6)} ${r1(q1[1] + (q2[1] - p0[1]) / 6)} ${r1(q2[0] - (p3[0] - q1[0]) / 6)} ${r1(q2[1] - (p3[1] - q1[1]) / 6)} ${r1(q2[0])} ${r1(q2[1])}`;
  }
  return g.closed ? d + " Z" : d;
}
export const shapePath = (s: Shape) => s.geo.map(geoPath).join(" ");

export const ell = (cx: number, cy: number, rx: number, ry = rx, n = 14): Geo => ({
  pts: Array.from({ length: n }, (_, i) => [cx + Math.cos((i / n) * Math.PI * 2) * rx, cy + Math.sin((i / n) * Math.PI * 2) * ry] as Pt),
  closed: true,
  smooth: true,
});
export const poly = (pts: Pt[], smooth = false, closed = true): Geo => ({ pts, closed, smooth });
export function rect(x: number, y: number, w: number, h: number, r = 0): Geo {
  if (!r) return poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]]);
  const pts: Pt[] = [];
  const corner = (cx: number, cy: number, a0: number) => {
    for (let i = 0; i <= 3; i++) pts.push([cx + Math.cos(a0 + (i / 3) * (Math.PI / 2)) * r, cy + Math.sin(a0 + (i / 3) * (Math.PI / 2)) * r]);
  };
  corner(x + w - r, y + r, -Math.PI / 2);
  corner(x + w - r, y + h - r, 0);
  corner(x + r, y + h - r, Math.PI / 2);
  corner(x + r, y + r, Math.PI);
  return poly(pts);
}
export function blob(cx: number, cy: number, rx: number, ry: number, seed: number, wob = 0.12, n = 9): Geo {
  const r = rng(seed);
  return {
    pts: Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2 + r() * 0.2;
      const k = 1 - wob + r() * wob * 2;
      return [cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k] as Pt;
    }),
    closed: true,
    smooth: true,
  };
}
export function capsule(a: Pt, b: Pt, r: number): Geo {
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const pts: Pt[] = [];
  for (let i = 0; i <= 6; i++) { const t = ang + Math.PI / 2 + (i / 6) * Math.PI; pts.push([a[0] + Math.cos(t) * r, a[1] + Math.sin(t) * r]); }
  for (let i = 0; i <= 6; i++) { const t = ang - Math.PI / 2 + (i / 6) * Math.PI; pts.push([b[0] + Math.cos(t) * r, b[1] + Math.sin(t) * r]); }
  return poly(pts, true);
}
export function starGeo(cx: number, cy: number, ro: number, ri: number, rot = 0, n = 5): Geo {
  const pts: Pt[] = [];
  for (let i = 0; i < n * 2; i++) {
    const a = rot - Math.PI / 2 + (i * Math.PI) / n;
    const r = i % 2 ? ri : ro;
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return poly(pts);
}
export function transform(shapes: Shape[], f: (p: Pt) => Pt): Shape[] {
  return shapes.map((s) => ({ ...s, geo: s.geo.map((g) => ({ ...g, pts: g.pts.map(f) })) }));
}
/** Places a figure drawn around (0,0) at x,y with scale, optional mirror and rotation. */
export function place(shapes: Shape[], x: number, y: number, s = 1, flip = false, rot = 0): Shape[] {
  const cos = Math.cos(rot), sin = Math.sin(rot);
  return transform(shapes, ([px, py]) => {
    const fx = (flip ? -px : px) * s, fy = py * s;
    return [x + fx * cos - fy * sin, y + fx * sin + fy * cos];
  });
}
const S = (geo: Geo | Geo[], fill?: string, extra: Partial<Shape> = {}): Shape => ({ geo: Array.isArray(geo) ? geo : [geo], fill, ...extra });
const F = (geo: Geo | Geo[], fill: string, o?: number): Shape => S(geo, fill, { ol: true, ...(o !== undefined ? { o } : {}) });
const line = (pts: Pt[], stroke: string, sw: number, smooth = true): Shape => ({ geo: [poly(pts, smooth, false)], stroke, sw });

function hex(c: string): [number, number, number] {
  const h = c.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
export function mix(a: string, b: string, t: number): string {
  if (!a.startsWith("#") || !b.startsWith("#")) return a;
  const x = hex(a), y = hex(b);
  return "#" + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, "0")).join("");
}
export function hexToRgb01(c: string): [number, number, number] {
  const [r, g, b] = hex(c);
  return [r / 255, g / 255, b / 255];
}
function saturate(c: string, k: number): string {
  if (!c.startsWith("#") || k === 1) return c;
  const [r, g, b] = hex(c);
  const grey = 0.3 * r + 0.59 * g + 0.11 * b;
  const ch = (v: number) => Math.max(0, Math.min(255, Math.round(grey + (v - grey) * k)));
  return "#" + [ch(r), ch(g), ch(b)].map((v) => v.toString(16).padStart(2, "0")).join("");
}

// ---------------------------------------------------------------------------
// Characters
// ---------------------------------------------------------------------------

export interface Look {
  skin: string;
  hair: string;
  hairStyle: "short" | "curly" | "long" | "bunches" | "puffs" | "braids" | "bald";
  outfit: string;
  glasses: boolean;
}
export interface PetLook { kind: "dog" | "cat" | "rabbit"; fur: string; patch: string }
export type Pose = "stand" | "wave" | "point" | "hold" | "reach" | "run";

/** A child (or a grown-up with `adult`). Feet at (0,0), about 300 units tall. */
export function person(look: Look, pose: Pose = "stand", adult = false): Shape[] {
  const out: Shape[] = [];
  const hy = -222;
  const trousers = adult ? mix(look.outfit, C.ink, 0.55) : mix(look.outfit, "#3E5A8A", 0.6);
  const boots = mix(look.outfit, C.ink, 0.65);
  const hair = look.hair;
  if (look.hairStyle === "long") out.push(F(rect(-58, hy - 30, 116, 120, 40), hair));
  if (look.hairStyle === "bunches") out.push(F(blob(-66, hy + 16, 22, 34, 3), hair), F(blob(66, hy + 16, 22, 34, 4), hair));
  if (look.hairStyle === "puffs") out.push(F(blob(-48, hy - 44, 34, 32, 5, 0.08), hair), F(blob(48, hy - 44, 34, 32, 6, 0.08), hair));
  if (look.hairStyle === "braids") out.push(F(capsule([-50, hy], [-58, hy + 70], 12), hair), F(capsule([50, hy], [58, hy + 70], 12), hair), F([ell(-58, hy + 78, 9), ell(58, hy + 78, 9)], C.cranberry));
  const arm = (p: Pose, side: 1 | -1): [Pt, Pt] => {
    const sh: Pt = [38 * side, -158];
    if (p === "wave" && side === 1) return [sh, [86, -246]];
    if (p === "point" && side === 1) return [sh, [118, -178]];
    if (p === "hold") return [sh, [14 * side, -118]];
    if (p === "reach") return [sh, [80 * side, -236]];
    if (p === "run") return side === 1 ? [sh, [80, -120]] : [sh, [-70, -190]];
    return [sh, [54 * side, -92]];
  };
  const legs: [number, number] = pose === "run" ? [-14, 14] : [0, 0];
  out.push(F(rect(-25 + legs[0], -86, 21, 52, 6), trousers), F(rect(4 + legs[1], -86, 21, 52, 6), trousers));
  out.push(F(rect(-31 + legs[0], -44, 29, 44, 8), boots), F(rect(2 + legs[1], -44, 29, 44, 8), boots));
  out.push(F(poly([[-40, -174], [40, -174], [52, -80], [-52, -80]], true), look.outfit));
  if (!adult) out.push(S(rect(-40, -112, 80, 10, 3), mix(look.outfit, "#FFFFFF", 0.45), { o: 0.8 }));
  for (const side of [-1, 1] as const) {
    const [a, b] = arm(pose, side);
    out.push(F(capsule(a, b, 12), look.outfit), F(ell(b[0], b[1], 11), look.skin));
  }
  out.push(S(rect(-10, -186, 20, 18, 4), look.skin));
  out.push(F(ell(-50, hy + 6, 11), look.skin), F(ell(50, hy + 6, 11), look.skin));
  out.push(F(ell(0, hy, 52, 54), look.skin));
  if (look.hairStyle === "curly") {
    const r = rng(7);
    const curls: Geo[] = [];
    for (let i = 0; i < 11; i++) { const a = Math.PI + (i / 10) * Math.PI; curls.push(ell(Math.cos(a) * 50, hy - 6 + Math.sin(a) * 46, 17 + r() * 5)); }
    out.push(F(curls, hair));
  } else if (look.hairStyle !== "bald") {
    const cap: Pt[] = [];
    for (let i = 0; i <= 10; i++) { const a = Math.PI * 1.02 + (i / 10) * Math.PI * 0.96; cap.push([Math.cos(a) * 57, hy + 2 + Math.sin(a) * 60]); }
    cap.push([34, hy - 20], [6, hy - 30], [-20, hy - 18], [-44, hy - 4]);
    out.push(F(poly(cap, true), hair));
  }
  if (adult && look.hairStyle === "bald") out.push(S(blob(0, hy - 46, 30, 8, 2), mix(look.skin, "#FFFFFF", 0.3), { o: 0.6 }));
  out.push(S(ell(-18, hy + 4, 5, 6.5), C.ink), S(ell(18, hy + 4, 5, 6.5), C.ink));
  out.push(S(ell(-16, hy + 2, 1.6), "#FFFFFF"), S(ell(20, hy + 2, 1.6), "#FFFFFF"));
  out.push(S(ell(-30, hy + 22, 9, 6), C.cheek, { o: 0.45 }), S(ell(30, hy + 22, 9, 6), C.cheek, { o: 0.45 }));
  out.push(line([[-12, hy + 24], [0, hy + 32], [12, hy + 24]], C.ink, 3.2));
  if (adult) out.push(line([[-14, hy + 40], [0, hy + 44], [14, hy + 40]], mix(look.skin, C.ink, 0.3), 2));
  if (look.glasses) {
    out.push({ geo: [ell(-18, hy + 4, 15, 14), ell(18, hy + 4, 15, 14)], stroke: C.ink, sw: 3.5 });
    out.push(line([[-3, hy + 2], [3, hy + 2]], C.ink, 3.5, false));
  }
  return out;
}

/** A pet. Feet at (0,0), facing right, about 150 wide. */
export function pet(p: PetLook, wag = 0): Shape[] {
  const fur = p.fur, light = p.patch, dark = mix(p.fur, C.ink, 0.45);
  if (p.kind === "dog") {
    return [
      F(capsule([-64, -70], [-96, -112 - wag * 10], 9), fur),
      F(rect(-50, -40, 20, 40, 8), fur), F(rect(30, -40, 20, 40, 8), fur),
      F(ell(0, -70, 72, 42), fur),
      S(ell(10, -58, 34, 20), light, { o: 0.9 }),
      F(ell(62, -112, 38, 36), fur),
      S(ell(54, -118, 15, 13), light),
      F(ell(84, -98, 22, 16), light),
      S(ell(100, -104, 7, 6), C.ink),
      F(blob(36, -112, 14, 30, 11, 0.1, 7), dark),
      S(ell(66, -120, 4.5, 5.5), C.ink), S(ell(67, -122, 1.4), "#FFFFFF"),
      line([[82, -86], [92, -82]], C.ink, 2.5),
    ];
  }
  if (p.kind === "cat") {
    return [
      { geo: [poly([[-58, -50], [-96, -90], [-104, -150], [-90, -170]], true, false)], stroke: fur, sw: 16 },
      F(rect(-40, -36, 18, 36, 8), fur), F(rect(24, -36, 18, 36, 8), fur),
      F(ell(-4, -62, 62, 38), fur),
      F(ell(54, -110, 36, 34), fur),
      F(poly([[30, -132], [34, -170], [52, -138]]), fur), F(poly([[60, -140], [80, -168], [82, -128]]), fur),
      S(ell(58, -98, 16, 11), light),
      S(ell(46, -116, 5, 7), "#B7D46A"), S(ell(70, -116, 5, 7), "#B7D46A"),
      S(ell(46, -116, 1.8, 5), C.ink), S(ell(70, -116, 1.8, 5), C.ink),
      S(poly([[54, -104], [62, -104], [58, -99]]), C.cheek),
      line([[64, -100], [100, -106]], light, 1.5, false), line([[64, -96], [100, -92]], light, 1.5, false),
    ];
  }
  return [
    F(ell(-56, -62, 16), light),
    F(ell(-6, -52, 56, 46), fur),
    F(capsule([30, -120], [26, -196], 13), fur), F(capsule([50, -118], [62, -192], 13), fur),
    S(capsule([30, -128], [27, -186], 6), "#F4C7C3"), S(capsule([50, -126], [60, -184], 6), "#F4C7C3"),
    F(ell(44, -96, 34, 32), fur),
    S(ell(56, -98, 5, 6), C.ink), S(ell(57, -100, 1.5), "#FFFFFF"),
    S(ell(74, -88, 5, 4), "#E58AA7"),
    F(ell(30, -6, 20, 8), light),
  ];
}

export function dragon(opts: { socks?: boolean; fire?: boolean; shiver?: boolean } = {}): Shape[] {
  const body = "#7FB6CC", belly = "#D6ECF2", wing = "#5E93AD";
  const out: Shape[] = [
    F(poly([[90, -120], [300, -60], [330, -30], [280, -40], [110, -60]], true), body),
    F(poly([[-30, -260], [-160, -380], [-110, -250], [-200, -300], [-90, -200]], true), wing),
    F(rect(-110, -100, 66, 100, 26), body), F(rect(40, -100, 66, 100, 26), body),
    F(ell(0, -170, 150, 110), body),
    S(ell(-40, -150, 80, 70), belly),
    F(poly([[-110, -230], [-170, -340], [-110, -360], [-60, -260]], true), body),
    F(ell(-160, -380, 82, 64), body),
    F(poly([[-190, -430], [-200, -480], [-160, -440]]), "#F2D27B"), F(poly([[-140, -436], [-130, -488], [-112, -432]]), "#F2D27B"),
    S(ell(-185, -392, 10, 12), C.ink), S(ell(-182, -396, 3), "#FFFFFF"),
    S(ell(-232, -364, 6, 5), C.ink, { o: 0.6 }),
    line([[-236, -340], [-210, -334], [-188, -342]], C.ink, 4),
    S(ell(-200, -360, 14, 8), C.cheek, { o: 0.4 }),
  ];
  if (opts.shiver) out.push(line([[-260, -420], [-280, -410], [-262, -398]], C.ink, 3, false), line([[60, -300], [76, -292], [62, -282]], C.ink, 3, false));
  if (opts.socks) {
    out.push(F(rect(-118, -40, 82, 50, 14), "#E2574C"), F(rect(32, -40, 82, 50, 14), "#F2C14E"));
    out.push(S([rect(-118, -28, 82, 8), rect(32, -28, 82, 8)], "#FFFFFF", { o: 0.8 }));
    out.push(F(capsule([200, -70], [250, -50], 14), "#4F7A5A"), F(capsule([120, -110], [170, -96], 14), "#B8D4E8"));
  }
  if (opts.fire) out.push(F(blob(-280, -360, 40, 24, 9, 0.2), "#F29C38"), S(blob(-270, -360, 22, 12, 4, 0.2), "#F7D560"));
  return out;
}

export function star(x: number, y: number, r: number, rot = 0, face = false): Shape[] {
  const out: Shape[] = [F(starGeo(x, y, r, r * 0.5, rot), C.star)];
  if (face) {
    out.push(S(ell(x - r * 0.18, y, r * 0.06, r * 0.08), C.ink), S(ell(x + r * 0.18, y, r * 0.06, r * 0.08), C.ink));
    out.push(line([[x - r * 0.12, y + r * 0.16], [x, y + r * 0.24], [x + r * 0.12, y + r * 0.16]], C.ink, Math.max(2, r * 0.05)));
  }
  return out;
}
export function sparkle(x: number, y: number, r: number, colour: string = C.star): Shape[] {
  return [S(starGeo(x, y, r, r * 0.28, 0, 4), colour)];
}
function moon(x: number, y: number, r: number, smile = true): Shape[] {
  const out: Shape[] = [F(ell(x, y, r), "#F6EBC8"), S([ell(x - r * 0.35, y - r * 0.3, r * 0.12), ell(x + r * 0.3, y + r * 0.35, r * 0.09)], "#E6D7A8")];
  if (smile) {
    out.push(S(ell(x - r * 0.25, y - r * 0.05, r * 0.05, r * 0.07), C.ink), S(ell(x + r * 0.25, y - r * 0.05, r * 0.05, r * 0.07), C.ink));
    out.push(line([[x - r * 0.25, y + r * 0.22], [x, y + r * 0.36], [x + r * 0.25, y + r * 0.22]], C.ink, Math.max(3, r * 0.04)));
  }
  return out;
}
function bird(x: number, y: number, s: number, body: string, wing: string, extra: Shape[] = [], flip = false): Shape[] {
  return place([F(ell(0, 0, 46, 36), body), F(ell(10, -4, 26, 18), wing), F(ell(-34, -30, 24), body), S(ell(-40, -36, 5), C.ink), S(poly([[-58, -30], [-76, -26], [-58, -22]]), C.gold), ...extra], x, y, s, flip);
}
function snowGlobe(x: number, y: number, s: number, lit: boolean, starOn: boolean): Shape[] {
  const inner: Shape[] = [
    S(ell(0, -150, 140), lit ? "#D9E8F5" : "#B9C6D6", { o: 0.9 }),
    F(rect(-80, -120, 50, 50, 4), "#F2E3CF"), F(poly([[-86, -120], [-55, -150], [-24, -120]]), C.cranberry),
    F(rect(10, -130, 60, 60, 4), "#F2E3CF"), F(poly([[4, -130], [40, -168], [76, -130]]), C.evergreen),
    F(poly([[-10, -60], [-30, -60], [-20, -110]]), C.evergreen),
    S([rect(-70, -105, 12, 12), rect(28, -112, 12, 12), rect(48, -112, 12, 12)], lit ? C.star : "#6C7A8C"),
    S(blob(0, -60, 130, 22, 3), C.snow),
  ];
  if (starOn) inner.push(...star(40, -190, 22, 0, false));
  return place([...inner, { geo: [ell(0, -150, 140)], stroke: "#FFFFFF", sw: 6, o: 0.8 }, S(blob(-60, -210, 20, 40, 2), "#FFFFFF", { o: 0.5 }), F(poly([[-130, -40], [130, -40], [110, 20], [-110, 20]], true), C.wood)], x, y, s);
}

// ---------------------------------------------------------------------------
// Backgrounds
// ---------------------------------------------------------------------------

const full = (fill: string) => S(rect(-40, -40, 1080, 1080), fill);

function snowFlakes(seed: number, n = 40, top = 0, bottom = 1000): Shape {
  const r = rng(seed);
  return S(Array.from({ length: n }, () => ell(r() * 1000, top + r() * (bottom - top), 3 + r() * 5)), C.snow, { o: 0.9 });
}

function bedroomNight(seed: number, opts: { globe?: "dark" | "lit"; star?: boolean; books?: boolean } = {}): Shape[] {
  const out: Shape[] = [full("#E7DCEB"), S(rect(-40, 780, 1080, 300), "#C9B39A"), S(rect(-40, 760, 1080, 24), "#B39A80")];
  out.push(F(rect(520, 160, 380, 420, 14), C.night), S(rect(708, 160, 6, 420), "#E7DCEB"), S(rect(520, 366, 380, 6), "#E7DCEB"), snowFlakes(seed, 26, 170, 570));
  out.push(F(rect(500, 580, 420, 34, 6), "#D8C3A5"));
  out.push(F(rect(-20, 600, 420, 200, 30), "#8FA9C9"), F(rect(-20, 560, 420, 70, 26), "#FFFFFF"), F(rect(10, 520, 120, 70, 30), "#FFFFFF"));
  if (opts.globe) out.push(...snowGlobe(720, 580, 0.9, opts.globe === "lit", !!opts.star));
  if (opts.books) out.push(F(rect(620, 640, 200, 40, 4), C.cranberry), F(rect(640, 680, 170, 40, 4), C.evergreen), F(rect(610, 720, 220, 40, 4), C.gold));
  return out;
}

function snowyGardenNight(seed: number): Shape[] {
  const r = rng(seed);
  return [
    full(C.night), S(Array.from({ length: 30 }, () => ell(r() * 1000, r() * 500, 2 + r() * 2.5)), C.star, { o: 0.9 }),
    S(poly([[-40, 620], [300, 560], [700, 600], [1040, 540], [1040, 1040], [-40, 1040]], true), "#DCE6F2"),
    F(rect(700, 470, 220, 170, 6), "#7A5A48"), F(poly([[680, 480], [810, 400], [940, 480]]), "#5A3F36"), S(poly([[690, 476], [810, 404], [930, 476], [810, 430]], true), C.snow),
    F(blob(170, 640, 140, 90, 4), C.evergreen), S([ell(120, 610, 12), ell(200, 650, 12), ell(240, 600, 12), ell(150, 680, 12)], C.cranberry),
    S(blob(170, 570, 120, 30, 5), C.snow),
    snowFlakes(seed + 1, 30),
  ];
}

function hillWithCave(seed: number, day = true): Shape[] {
  return [
    full(day ? C.sky : "#F4D6B8"),
    S(blob(820, 160, 80, 30, seed, 0.15), "#FFFFFF", { o: 0.9 }), S(blob(200, 120, 100, 34, seed + 1, 0.15), "#FFFFFF", { o: 0.9 }),
    S(poly([[-40, 760], [200, 420], [460, 300], [760, 380], [1040, 600], [1040, 1040], [-40, 1040]], true), C.grass),
    S(poly([[-40, 860], [400, 760], [1040, 820], [1040, 1040], [-40, 1040]], true), C.grassDark),
    F(poly([[340, 520], [380, 420], [480, 380], [580, 420], [620, 520]], true), "#3E3A44"),
  ];
}

function bedroomDay(): Shape[] {
  return [
    full("#F3E3C8"), S(rect(-40, 760, 1080, 300), "#B68A62"), F(rect(560, 140, 340, 300, 14), C.sky), S(blob(700, 230, 80, 26, 3), "#FFFFFF"),
    F(rect(40, 520, 380, 250, 20), "#8BB59A"), F(rect(40, 470, 140, 70, 24), "#FFFFFF"),
    F(rect(620, 560, 260, 200, 10), C.wood), S([rect(640, 590, 220, 60, 6), rect(640, 670, 220, 60, 6)], mix(C.wood, "#FFFFFF", 0.2)),
  ];
}

function rooftops(seed: number, moonY = 200, moonR = 110): Shape[] {
  const r = rng(seed);
  const out: Shape[] = [full("#24305A"), S(Array.from({ length: 40 }, () => ell(r() * 1000, r() * 520, 2 + r() * 3)), C.star, { o: 0.9 }), ...moon(800, moonY, moonR)];
  const roofs: [number, number, number, string][] = [[-40, 640, 300, "#3A3F6B"], [230, 600, 320, "#45306A"], [520, 660, 260, "#3A3F6B"], [760, 610, 320, "#4A3A72"]];
  for (const [x, y, w, c] of roofs) {
    out.push(F(poly([[x, y], [x + w / 2, y - 120], [x + w, y], [x + w, 1040], [x, 1040]], false), c));
    out.push(F(rect(x + w * 0.65, y - 150, 44, 110, 4), C.brick));
    out.push(S([rect(x + 40, y + 60, 50, 60, 6), rect(x + w - 100, y + 80, 50, 60, 6)], C.star, { o: 0.85 }));
  }
  return out;
}

function skyHigh(seed: number): Shape[] {
  const r = rng(seed);
  return [
    full("#1F2C57"), S(Array.from({ length: 60 }, () => ell(r() * 1000, r() * 1000, 2 + r() * 3)), C.star, { o: 0.9 }),
    S(blob(220, 700, 160, 50, seed, 0.15), "#8D9BC9", { o: 0.7 }), S(blob(760, 820, 180, 50, seed + 2, 0.15), "#8D9BC9", { o: 0.7 }),
  ];
}
function moonLadder(x: number): Shape[] {
  const out: Shape[] = [S(poly([[x - 70, 1040], [x - 30, -40], [x + 30, -40], [x + 70, 1040]], true), "#F6EBC8", { o: 0.35 })];
  for (let y = 40; y < 1000; y += 110) out.push(S(rect(x - 60 + (y / 1000) * -10, y, 120 + (y / 1000) * 20, 12, 6), "#F6EBC8", { o: 0.9 }));
  return out;
}

function park(seed: number, opts: { tree?: boolean; slide?: boolean; sand?: boolean } = {}): Shape[] {
  const r = rng(seed);
  const out: Shape[] = [full("#DCEBE6"), S(blob(200, 150, 90, 30, seed, 0.15), "#FFFFFF"), S(blob(760, 110, 110, 34, seed + 1, 0.15), "#FFFFFF")];
  out.push(S(poly([[-40, 600], [300, 560], [700, 590], [1040, 550], [1040, 1040], [-40, 1040]], true), C.grass));
  out.push(S(Array.from({ length: 18 }, () => { const x = r() * 1000, y = 640 + r() * 360; return poly([[x, y], [x + 5, y - 18], [x + 10, y]]); }), C.grassDark, { o: 0.8 }));
  if (opts.tree) {
    out.push(F(rect(760, 300, 80, 320, 20), C.wood), S(ell(800, 440, 22, 34), "#3E2E24"));
    out.push(F(blob(800, 240, 200, 150, seed + 3, 0.12), "#5E8C55"), F(capsule([840, 360], [960, 330], 14), C.wood));
  }
  if (opts.slide) out.push({ geo: [poly([[120, 640], [120, 400], [320, 640]], false, false)], stroke: "#E2574C", sw: 18 }, F(rect(100, 380, 60, 30, 6), "#E2574C"));
  if (opts.sand) out.push(F(rect(420, 700, 260, 90, 20), "#E9D29C"));
  return out;
}

function street(seed: number, opts: { bunting?: boolean; curtains?: "closed" | "open" } = {}): Shape[] {
  const out: Shape[] = [full("#EEDCC4"), S(rect(-40, 760, 1080, 300), "#B9AFA5"), S(rect(-40, 740, 1080, 26), "#D8CEC3")];
  const houses: [number, string, string][] = [[-20, "#C8775A", "7"], [330, "#7E9C86", "9"], [680, "#E3B35A", "11"]];
  for (const [x, c, n] of houses) {
    out.push(F(rect(x, 260, 340, 480), c), F(poly([[x - 10, 270], [x + 170, 150], [x + 350, 270]]), mix(c, C.ink, 0.4)));
    out.push(F(rect(x + 130, 560, 80, 180, 8), C.evergreen), S(ell(x + 196, 650, 6), C.gold));
    const wc = n === "9" && opts.curtains === "closed" ? "#E7C9D6" : "#F7E6A8";
    out.push(F([rect(x + 40, 330, 90, 100, 6), rect(x + 210, 330, 90, 100, 6)], wc));
    out.push(S(rect(x + 150, 520, 40, 26, 4), "#FFFFFF"));
  }
  if (opts.bunting) {
    out.push(line([[-40, 200], [500, 260], [1040, 200]], C.ink, 2.5));
    const cols = [C.cranberry, C.gold, "#5E8C55", "#4D7CB4"];
    for (let i = 0; i < 16; i++) {
      const x = -20 + i * 68, y = 200 + Math.sin((i / 15) * Math.PI) * 60;
      out.push(S(poly([[x, y], [x + 40, y + 4], [x + 18, y + 50]]), cols[i % 4]));
    }
  }
  return out;
}

const shell = (x: number, y: number, s: number) => place([F(blob(0, 0, 40, 30, 12, 0.05), "#F2B8C6"), line([[-20, 10], [0, -16], [20, 10]], "#D17E96", 3)], x, y, s);
const sock = (x: number, y: number, c: string, rot = 0) => place([F(poly([[-14, -40], [14, -40], [14, 10], [34, 14], [34, 34], [-14, 34]], true), c), S(rect(-14, -40, 28, 10), "#FFFFFF", { o: 0.8 })], x, y, 1.4, false, rot);
const parcel = (x: number, y: number, s: number) => place([F(rect(-60, -50, 120, 90, 8), "#C9CFD9"), S(rect(-8, -50, 16, 90), C.cranberry), S(rect(-60, -10, 120, 14), C.cranberry), F(blob(0, -54, 22, 12, 3), C.cranberry)], x, y, s);
const tomatoes = (x: number, y: number) => place([F(poly([[-100, -50], [100, -50], [80, 20], [-80, 20]], true), "#7E9C86"), F(capsule([100, -40], [170, -80], 8), C.wood), S([ell(-60, -60, 18), ell(-20, -66, 18), ell(20, -60, 18), ell(60, -64, 18), ell(-40, -84, 16), ell(30, -86, 16)], "#D64A3A", { ol: true }), F([ell(-60, 34, 22), ell(60, 34, 22)], C.ink)], x, y, 1);
const map = (x: number, y: number, s: number) => place([F(poly([[-120, -80], [-40, -100], [40, -80], [120, -100], [120, 80], [40, 100], [-40, 80], [-120, 100]], true), "#F4E6C6"), line([[-90, 40], [-30, -10], [30, 30], [90, -40]], C.cranberry, 4), ...sparkle(90, -40, 14, C.cranberry), S([ell(-80, -50, 10), ell(60, 50, 12)], "#6B8F5E")], x, y, s);

// ---------------------------------------------------------------------------
// Scenes: beat 0 is the cover, 1–8 the spreads.
// ---------------------------------------------------------------------------

export interface Cast { child: Look; pet?: PetLook }

export function scene(story: StoryId, beat: number, cast: Cast): Shape[] {
  const kid = (pose: Pose, x: number, y: number, s = 1.15, flip = false) => place(person(cast.child, pose), x, y, s, flip);
  const pal = (x: number, y: number, s = 1, flip = false) => (cast.pet ? place(pet(cast.pet), x, y, s, flip) : []);
  switch (story) {
    case "snow-globe":
      switch (beat) {
        case 0: return [...snowyGardenNight(3), ...star(500, 300, 70, 0.1, true), ...kid("reach", 400, 940, 1.25), ...pal(640, 940, 1.3)];
        case 1: return [...bedroomNight(4, { globe: "lit" }), ...kid("stand", 220, 920, 1.1), ...pal(400, 920, 1.1)];
        case 2: return [...bedroomNight(5, { globe: "dark" }), ...sparkle(560, 640, 10), ...sparkle(600, 660, 9), ...sparkle(640, 650, 10), ...sparkle(680, 670, 9), ...kid("point", 260, 940, 1.2)];
        case 3: return [...snowyGardenNight(6), ...kid("run", 360, 940, 1.15), ...pal(560, 940, 1.2)];
        case 4: return [...snowyGardenNight(7), ...star(190, 580, 44, 0.3, true), ...kid("reach", 460, 940, 1.15, true), ...pal(640, 940, 1.15, true)];
        case 5: return [...snowyGardenNight(8), ...pal(380, 940, 1.6), ...kid("run", 700, 940, 1.1), ...star(760, 640, 30, 0, true)];
        case 6: return [...bedroomNight(9, { globe: "dark", books: true }), ...kid("reach", 560, 640, 1.0), ...pal(420, 940, 1.2)];
        case 7: return [...bedroomNight(10, { globe: "lit", star: true }), ...kid("wave", 300, 940, 1.15), ...sparkle(760, 380, 16), ...sparkle(640, 420, 12)];
        default: return [...bedroomNight(11, { globe: "lit", star: true }), ...pal(240, 650, 1.0), S(blob(200, 520, 70, 50, 1), cast.child.skin), S(blob(200, 488, 80, 40, 2), cast.child.hair)];
      }
    case "sock-dragon":
      switch (beat) {
        case 0: return [...hillWithCave(1), ...place(dragon({ socks: true }), 700, 920, 0.95), ...kid("wave", 260, 940, 1.25)];
        case 1: return [...bedroomDay(), ...sock(700, 700, "#4D7CB4", -0.2), ...kid("hold", 330, 940, 1.2)];
        case 2: return [...bedroomNight(12, {}), ...place(dragon({}), 760, 700, 0.42, true), ...sock(640, 470, "#E2574C", 0.4), ...place(person({ skin: "#F2CBA8", hair: "#E0A33A", hairStyle: "short", outfit: "#E2574C", glasses: true }, "point"), 220, 940, 1.1)];
        case 3: return [...hillWithCave(2), ...sock(160, 820, "#E2574C"), ...sock(320, 700, "#F2C14E", 0.3), ...sock(470, 560, "#B8D4E8", -0.3), ...kid("point", 140, 960, 1.1)];
        case 4: return [...hillWithCave(3, false), ...place(dragon({ socks: true, shiver: true }), 760, 940, 0.85), ...kid("stand", 220, 940, 1.1)];
        case 5: return [...hillWithCave(4, false), ...place(dragon({ shiver: true }), 760, 940, 0.85), ...kid("point", 260, 940, 1.15)];
        case 6: return [...hillWithCave(5), ...place(dragon({}), 760, 940, 0.85), ...kid("wave", 260, 940, 1.15)];
        case 7: return [...street(6, {}), ...place(person({ skin: "#E8C2A0", hair: "#D9D4CC", hairStyle: "bald", outfit: "#6B8F5E", glasses: true }, "hold", true), 300, 960, 1.5), ...kid("hold", 600, 960, 1.15), ...sock(450, 640, "#E2574C", 0.2)];
        default: return [...hillWithCave(7, false), ...place(dragon({ socks: true, fire: true }), 760, 940, 0.85), ...kid("wave", 240, 940, 1.15), ...sparkle(500, 400, 18)];
      }
    case "moonlight-delivery":
      switch (beat) {
        case 0: return [...rooftops(1, 220, 150), ...kid("hold", 360, 760, 1.25), ...parcel(360, 640, 0.75), ...pal(600, 740, 1.3)];
        case 1: return [...street(2, {}), ...parcel(500, 800, 1.2), ...kid("stand", 300, 960, 1.15)];
        case 2: return [...bedroomDay(), ...parcel(500, 800, 1.1), ...pal(500, 760, 1.2), ...kid("point", 220, 940, 1.1)];
        case 3: return [...rooftops(3), ...kid("run", 400, 640, 1.15), ...pal(640, 620, 1.1)];
        case 4: return [...rooftops(4, 160, 90), ...bird(640, 520, 1.6, "#8E96A6", "#6E7686", [F(rect(-56, -66, 44, 18, 4), "#2B2F5B")]), ...kid("stand", 300, 700, 1.1)];
        case 5: return [...rooftops(5, 140, 80), ...moonLadder(600), ...pal(600, 520, 1.0), ...kid("reach", 380, 700, 1.1)];
        case 6: return [...skyHigh(6), ...moonLadder(500), ...kid("reach", 500, 760, 1.05), ...pal(500, 420, 0.9), ...bird(820, 360, 1.2, "#9C7A5B", "#7A5A40")];
        case 7: return [...skyHigh(7), ...moon(600, 420, 300), ...parcel(320, 760, 1.0), ...kid("hold", 220, 940, 1.0)];
        default: return [...bedroomNight(8, {}), ...moon(720, 260, 70), ...kid("wave", 300, 940, 1.1), ...pal(520, 940, 1.1)];
      }
    case "little-wonders": {
      const rosa: Look = { skin: "#C99369", hair: "#2B2024", hairStyle: "long", outfit: "#E58AA7", glasses: false };
      const friend = (pose: Pose, x: number, y: number, s = 1.1, flip = false) => place(person(rosa, pose), x, y, s, flip);
      const magpie = (x: number, y: number, s: number, shiny = false) => bird(x, y, s, "#22302B", "#FFFFFF", shiny ? shell(-70, -14, 0.5) : []);
      switch (beat) {
        case 0: return [...park(1, { tree: true }), ...map(500, 420, 1.4), ...kid("point", 300, 940, 1.2), ...magpie(840, 330, 0.9, true)];
        case 1: return [...park(2, { tree: true }), ...kid("wave", 400, 940, 1.2), ...sparkle(520, 600, 18)];
        case 2: return [...park(3, { slide: true }), ...friend("stand", 640, 940, 1.15, true), ...kid("run", 300, 940, 1.1)];
        case 3: return [...park(4), ...map(500, 520, 2.2), ...kid("hold", 500, 960, 0.9)];
        case 4: return [...park(5, { slide: true, sand: true }), ...kid("reach", 480, 900, 1.05), ...friend("stand", 760, 940, 1.05, true)];
        case 5: return [...park(6), ...map(500, 450, 2.0), ...magpie(560, 420, 0.7, true), ...kid("point", 200, 960, 1.0)];
        case 6: return [...park(7, { tree: true }), ...magpie(860, 330, 1.0, true), ...kid("point", 380, 940, 1.1), ...friend("stand", 560, 940, 1.05)];
        case 7: return [...park(8, { tree: true }), ...magpie(860, 330, 1.0), ...shell(620, 760, 1.2), ...kid("reach", 420, 940, 1.1)];
        default: return [...park(9, { tree: true }), ...kid("wave", 340, 940, 1.15), ...friend("hold", 580, 940, 1.15), ...shell(580, 820, 0.5), ...magpie(860, 330, 0.9)];
      }
    }
    case "small-parade": {
      const doyle: Look = { skin: "#E8C2A0", hair: "#BFBAB3", hairStyle: "short", outfit: "#7E6A9E", glasses: true };
      const mrD = (pose: Pose, x: number, y: number) => place(person(doyle, pose, true), x, y, 1.5);
      switch (beat) {
        case 0: return [...street(1, { bunting: true }), ...tomatoes(620, 920), ...pal(600, 820, 0.9), ...kid("wave", 260, 960, 1.25)];
        case 1: return [...street(2, { bunting: true }), ...place(pet({ kind: "dog", fur: "#E58A3A", patch: "#F2C14E" }), 700, 960, 1.2), ...kid("wave", 260, 960, 1.15), ...pal(420, 960, 1.0)];
        case 2: return [...street(3, { bunting: true, curtains: "closed" }), ...place(person(doyle, "stand", true), 585, 500, 0.5), S(rect(540, 330, 30, 100, 4), "#E7C9D6", { ol: true }), S(rect(600, 330, 30, 100, 4), "#E7C9D6", { ol: true }), S(rect(540, 430, 90, 140), "#7E9C86"), ...kid("point", 200, 960, 1.1), ...pal(380, 960, 0.9)];
        case 3: return [...street(4, {}), ...kid("stand", 360, 960, 1.15), ...pal(560, 960, 1.2), ...sparkle(420, 600, 16)];
        case 4: return [...street(5, {}), ...mrD("stand", 620, 960), ...kid("point", 300, 960, 1.1)];
        case 5: return [...street(6, {}), ...kid("hold", 500, 960, 1.2), ...pal(680, 960, 1.0), ...sparkle(520, 520, 22)];
        case 6: return [...street(7, { bunting: true }), ...tomatoes(560, 920), ...pal(540, 830, 0.8), ...kid("wave", 220, 960, 1.1)];
        case 7: return [...street(8, { bunting: true }), ...mrD("hold", 400, 960), ...tomatoes(640, 920), ...pal(620, 830, 0.8)];
        default: return [...street(9, { bunting: true, curtains: "open" }), ...mrD("wave", 520, 960), ...kid("wave", 260, 960, 1.15), ...pal(760, 960, 1.1)];
      }
    }
  }
}

/** The same character, pet and setting for the style comparison gallery. */
export function galleryScene(): Shape[] {
  const child: Look = { skin: "#E8B996", hair: "#7A4A2A", hairStyle: "bunches", outfit: "#A3283F", glasses: false };
  return [...park(42, { tree: true }), ...place(person(child, "wave"), 380, 940, 1.35), ...place(pet({ kind: "dog", fur: "#C98B52", patch: "#FFF4E6" }), 620, 940, 1.5), ...sparkle(520, 420, 18, C.gold)];
}

/** Small decoration for text pages. */
export function vignette(story: StoryId, beat: number): Shape[] {
  const v = beat % 2;
  if (story === "snow-globe") return v ? star(500, 520, 320, 0.1, true) : snowGlobe(500, 820, 2.4, true, true);
  if (story === "sock-dragon") return v ? sock(500, 520, "#E2574C", 0.3).map((s) => ({ ...s, geo: s.geo.map((g) => ({ ...g, pts: g.pts.map(([x, y]) => [500 + (x - 500) * 4, 520 + (y - 520) * 4] as Pt) })) })) : place(dragon({ fire: true }), 640, 900, 1.3);
  if (story === "moonlight-delivery") return v ? moon(500, 500, 300) : parcel(500, 520, 4);
  if (story === "little-wonders") return v ? shell(500, 500, 6) : map(500, 500, 3.5);
  return v ? tomatoes(500, 640).map((s) => ({ ...s, geo: s.geo.map((g) => ({ ...g, pts: g.pts.map(([x, y]) => [500 + (x - 500) * 3, 560 + (y - 640) * 3] as Pt) })) })) : place(pet({ kind: "rabbit", fur: "#D9D2C5", patch: "#FFFFFF" }), 480, 820, 4);
}

// ---------------------------------------------------------------------------
// The seven styles. The PDF uses colour and line; the web adds texture filters.
// ---------------------------------------------------------------------------

export interface StyleSpec {
  /** Blend fills toward the tint (or paper) (0–1). */
  wash: number;
  tint: string | null;
  saturation: number;
  /** Outline width for `ol` shapes, or null for none. */
  outline: number | null;
  outlineColour: "ink" | "shade" | "black";
  opacity: number;
  /** Cut-paper offset shadow. */
  shadow: boolean;
  /** Web texture treatment. */
  web: { wobble: number; freq: number; blur: number; grain: number; overlay: "none" | "dots" | "hatch" | "chalk" | "bristle" };
}

export const STYLE_SPECS: Record<StyleId, StyleSpec> = {
  pastel: { wash: 0.36, tint: "#FBE6EE", saturation: 0.9, outline: 1.6, outlineColour: "shade", opacity: 0.97, shadow: false, web: { wobble: 3, freq: 0.03, blur: 0.5, grain: 0.2, overlay: "chalk" } },
  cartoon: { wash: 0, tint: null, saturation: 1.45, outline: 8, outlineColour: "ink", opacity: 1, shadow: false, web: { wobble: 0, freq: 0.02, blur: 0, grain: 0, overlay: "none" } },
  comic: { wash: 0, tint: null, saturation: 1.2, outline: 7, outlineColour: "black", opacity: 1, shadow: false, web: { wobble: 0, freq: 0.02, blur: 0, grain: 0, overlay: "dots" } },
  watercolour: { wash: 0.28, tint: "#E4EEF2", saturation: 0.95, outline: null, outlineColour: "shade", opacity: 0.82, shadow: false, web: { wobble: 10, freq: 0.02, blur: 1.4, grain: 0.18, overlay: "none" } },
  collage: { wash: 0.04, tint: null, saturation: 0.9, outline: null, outlineColour: "shade", opacity: 1, shadow: true, web: { wobble: 4, freq: 0.12, blur: 0, grain: 0.16, overlay: "none" } },
  pencil: { wash: 0.26, tint: null, saturation: 0.85, outline: 2.6, outlineColour: "shade", opacity: 0.95, shadow: false, web: { wobble: 2.5, freq: 0.08, blur: 0, grain: 0.1, overlay: "hatch" } },
  gouache: { wash: 0, tint: null, saturation: 1.12, outline: 3.5, outlineColour: "ink", opacity: 1, shadow: false, web: { wobble: 5, freq: 0.04, blur: 0, grain: 0.14, overlay: "bristle" } },
};

export interface Styled { fill?: string; stroke?: string; sw?: number; o: number; shadow: boolean }

export function styled(s: Shape, style: StyleId): Styled {
  const k = STYLE_SPECS[style];
  const col = (c?: string) => (c ? mix(saturate(c, k.saturation), k.tint ?? C.paper, k.wash) : undefined);
  const fill = col(s.fill);
  let stroke = s.stroke ? (k.wash ? mix(s.stroke, C.paper, k.wash * 0.6) : s.stroke) : undefined;
  let sw = s.sw;
  if (style === "cartoon" || style === "comic") sw = sw ? sw * 1.4 : sw;
  if (s.ol && s.fill && !s.stroke && k.outline) {
    stroke = k.outlineColour === "ink" ? C.ink : k.outlineColour === "black" ? "#111114" : mix(fill ?? C.ink, C.ink, 0.45);
    sw = k.outline;
  }
  return { fill, stroke, sw, o: (s.o ?? 1) * k.opacity, shadow: k.shadow && !!s.ol && !!s.fill };
}
