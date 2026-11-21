/**
 * Original storybook art for Little Plot Books, drawn as SVG so the same
 * characters stay identical everywhere (cover, sample reader, story cards)
 * and swap instantly in the "Make the hero yours" demo.
 *
 * Everything here is fictional sample art for the launch page, not final
 * print illustration.
 */
import { useId, type ReactNode } from "react";

export type Look = {
  skin: string;
  cheek: string;
  hair: string;
  hairStyle: "curls" | "short" | "puffs";
  top: string;
  stripe?: string;
  bottoms: string;
  outfit: "dungarees" | "dress" | "trousers";
  boots: string;
  freckles?: boolean;
};

const INK = "#35263D";

/** Painted feel: a gentle edge wobble and a warm paper grain. */
function PaintDefs({ id, wobble = 1.6 }: { id: string; wobble?: number }) {
  return (
    <defs>
      <filter id={`${id}-wob`} x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale={wobble} xChannelSelector="R" yChannelSelector="G" />
      </filter>
      <filter id={`${id}-grain`} x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="3" result="noise" />
        <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0.21  0 0 0 0 0.15  0 0 0 0 0.24  0 0 0 0.16 0" result="grain" />
        <feComposite in="grain" in2="SourceGraphic" operator="in" result="g" />
        <feMerge>
          <feMergeNode in="SourceGraphic" />
          <feMergeNode in="g" />
        </feMerge>
      </filter>
    </defs>
  );
}

function useSvgId() {
  return "lp" + useId().replace(/[^a-zA-Z0-9]/g, "");
}

/** A child, standing, about 120 x 200 units with feet at y=198. */
export function Kid({ look, x = 0, y = 0, s = 1, point = false, flip = false }: { look: Look; x?: number; y?: number; s?: number; point?: boolean; flip?: boolean }) {
  const id = useSvgId();
  const t = `translate(${x} ${y}) scale(${flip ? -s : s} ${s})${flip ? " translate(-120 0)" : ""}`;
  return (
    <g transform={t}>
      {look.stripe && (
        <defs>
          <pattern id={`${id}-st`} width="8" height="8" patternUnits="userSpaceOnUse">
            <rect width="8" height="8" fill={look.top} />
            <rect y="5" width="8" height="3" fill={look.stripe} />
          </pattern>
        </defs>
      )}
      {/* soft contact shadow */}
      <ellipse cx="60" cy="199" rx="34" ry="5" fill={INK} opacity=".12" />
      {/* hair behind the head */}
      {look.hairStyle === "curls" && (
        <g fill={look.hair}>
          <circle cx="31" cy="66" r="10" /><circle cx="89" cy="66" r="10" />
          <circle cx="33" cy="81" r="8" /><circle cx="87" cy="81" r="8" />
          <circle cx="37" cy="93" r="6" /><circle cx="83" cy="93" r="6" />
        </g>
      )}
      {look.hairStyle === "puffs" && (
        <g fill={look.hair}>
          <circle cx="28" cy="34" r="17" /><circle cx="92" cy="34" r="17" />
        </g>
      )}
      {/* legs and boots */}
      <rect x="45" y="150" width="12" height="30" rx="4" fill={look.outfit === "dress" ? look.skin : look.bottoms} />
      <rect x="63" y="150" width="12" height="30" rx="4" fill={look.outfit === "dress" ? look.skin : look.bottoms} />
      <g>
        <rect x="40" y="171" width="20" height="27" rx="6" fill={look.boots} />
        <rect x="60" y="171" width="20" height="27" rx="6" fill={look.boots} />
        <rect x="38" y="193" width="23" height="6" rx="3" fill={INK} opacity=".55" />
        <rect x="59" y="193" width="23" height="6" rx="3" fill={INK} opacity=".55" />
        <rect x="41" y="173" width="18" height="4" rx="2" fill="#fff" opacity=".35" />
        <rect x="61" y="173" width="18" height="4" rx="2" fill="#fff" opacity=".35" />
      </g>
      {/* arms */}
      <path d="M40 104 Q30 120 26 138" stroke={look.stripe ? `url(#${id}-st)` : look.top} strokeWidth="12" strokeLinecap="round" fill="none" />
      {point ? (
        <path d="M80 104 Q96 96 110 84" stroke={look.stripe ? `url(#${id}-st)` : look.top} strokeWidth="12" strokeLinecap="round" fill="none" />
      ) : (
        <path d="M80 104 Q90 120 94 138" stroke={look.stripe ? `url(#${id}-st)` : look.top} strokeWidth="12" strokeLinecap="round" fill="none" />
      )}
      <circle cx="25" cy="142" r="6.5" fill={look.skin} />
      {point ? <circle cx="113" cy="82" r="6.5" fill={look.skin} /> : <circle cx="95" cy="142" r="6.5" fill={look.skin} />}
      {/* body */}
      <path d="M38 98 Q60 90 82 98 L86 150 Q60 158 34 150 Z" fill={look.stripe ? `url(#${id}-st)` : look.top} />
      {look.outfit === "dungarees" && (
        <g fill={look.bottoms}>
          <rect x="45" y="112" width="30" height="24" rx="5" />
          <path d="M34 132 L86 132 L88 156 Q60 163 32 156 Z" />
          <path d="M48 114 L41 99 M72 114 L79 99" stroke={look.bottoms} strokeWidth="5" strokeLinecap="round" />
          <circle cx="50" cy="118" r="2.4" fill="#F3C34A" /><circle cx="70" cy="118" r="2.4" fill="#F3C34A" />
          <rect x="53" y="122" width="14" height="9" rx="2" fill="#fff" opacity=".18" />
        </g>
      )}
      {look.outfit === "dress" && <path d="M38 124 L82 124 L95 162 Q60 170 25 162 Z" fill={look.bottoms} />}
      {look.outfit === "trousers" && <path d="M35 134 L85 134 L87 156 Q60 162 33 156 Z" fill={look.bottoms} />}
      {/* neck, ears, head */}
      <rect x="54" y="82" width="12" height="14" rx="4" fill={look.skin} />
      <circle cx="31" cy="60" r="6" fill={look.skin} /><circle cx="89" cy="60" r="6" fill={look.skin} />
      <circle cx="60" cy="57" r="30" fill={look.skin} />
      {/* face */}
      <ellipse cx="49" cy="60" rx="3.2" ry="4" fill={INK} /><ellipse cx="71" cy="60" rx="3.2" ry="4" fill={INK} />
      <circle cx="50.2" cy="58.6" r="1.1" fill="#fff" /><circle cx="72.2" cy="58.6" r="1.1" fill="#fff" />
      <circle cx="42" cy="70" r="5.5" fill={look.cheek} opacity=".55" /><circle cx="78" cy="70" r="5.5" fill={look.cheek} opacity=".55" />
      <path d="M52 72 Q60 80 68 72" stroke={INK} strokeWidth="2.6" fill="none" strokeLinecap="round" />
      {look.freckles && (
        <g fill="#B5643A" opacity=".55">
          <circle cx="44" cy="66" r="1" /><circle cx="47" cy="68" r="1" /><circle cx="42" cy="68" r="1" />
          <circle cx="76" cy="66" r="1" /><circle cx="73" cy="68" r="1" /><circle cx="78" cy="68" r="1" />
        </g>
      )}
      {/* hair in front */}
      {look.hairStyle === "curls" && (
        <g fill={look.hair}>
          <circle cx="34" cy="46" r="11" /><circle cx="40" cy="32" r="12" /><circle cx="53" cy="25" r="12.5" />
          <circle cx="67" cy="25" r="12.5" /><circle cx="80" cy="32" r="12" /><circle cx="86" cy="46" r="11" />
          <circle cx="47" cy="38" r="9" /><circle cx="60" cy="35" r="9" /><circle cx="73" cy="38" r="9" />
          <circle cx="44" cy="27" r="3" fill="#fff" opacity=".18" /><circle cx="70" cy="22" r="3" fill="#fff" opacity=".18" />
        </g>
      )}
      {look.hairStyle === "short" && (
        <path d="M29 58 Q26 24 60 22 Q94 24 91 58 Q86 41 74 42 Q68 33 59 40 Q48 34 41 44 Q33 46 29 58 Z" fill={look.hair} />
      )}
      {look.hairStyle === "puffs" && (
        <g>
          <path d="M30 54 Q30 26 60 26 Q90 26 90 54 Q80 38 60 38 Q40 38 30 54 Z" fill={look.hair} />
          <rect x="40" y="27" width="40" height="5" rx="2.5" fill="#F3C34A" />
        </g>
      )}
    </g>
  );
}

/** The friendly dinosaur next door, peeking. Neck rises from (40,200). */
export function Dino({ x = 0, y = 0, s = 1, tilt = 0, happy = false }: { x?: number; y?: number; s?: number; tilt?: number; happy?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${tilt} 60 200)`}>
      <path d="M40 210 C38 150 66 92 118 66" stroke="#6FAE8A" strokeWidth="38" strokeLinecap="round" fill="none" />
      <path d="M52 206 C52 156 74 106 116 82" stroke="#A9D3A4" strokeWidth="10" strokeLinecap="round" fill="none" opacity=".8" />
      <g fill="#4E8E73">
        <circle cx="30" cy="160" r="5" /><circle cx="36" cy="130" r="6" /><circle cx="50" cy="104" r="5" /><circle cx="72" cy="80" r="4.5" />
      </g>
      <g fill="#F3C34A">
        <circle cx="24" cy="176" r="5" /><circle cx="27" cy="145" r="5.5" /><circle cx="37" cy="116" r="5.5" /><circle cx="54" cy="91" r="5" /><circle cx="76" cy="71" r="4.5" />
      </g>
      <g transform="rotate(-10 140 56)">
        <ellipse cx="140" cy="56" rx="40" ry="27" fill="#6FAE8A" />
        <ellipse cx="166" cy="64" rx="17" ry="14" fill="#7DBB96" />
        <circle cx="146" cy="44" r="6" fill={INK} />
        <circle cx="148" cy="42" r="2" fill="#fff" />
        <circle cx="174" cy="58" r="2.2" fill="#3F7660" />
        <circle cx="134" cy="66" r="7" fill="#F29C8F" opacity=".5" />
        <path d={happy ? "M150 70 Q164 84 178 70" : "M152 72 Q164 79 176 71"} stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
        <ellipse cx="128" cy="44" rx="8" ry="6" fill="#4E8E73" opacity=".5" />
      </g>
      {happy && (
        <g stroke="#9B3652" strokeWidth="3" strokeLinecap="round" fill="none">
          <path d="M196 24 q8 -4 10 4" /><path d="M200 50 q10 0 12 8" /><path d="M96 20 q-8 -6 -14 0" />
        </g>
      )}
    </g>
  );
}

function Footprint({ x, y, s = 1, r = 0 }: { x: number; y: number; s?: number; r?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} fill="#7E9F78" opacity=".75">
      <ellipse cx="0" cy="8" rx="15" ry="11" />
      <ellipse cx="-14" cy="-12" rx="5" ry="10" transform="rotate(-25 -14 -12)" />
      <ellipse cx="0" cy="-16" rx="5" ry="11" />
      <ellipse cx="14" cy="-12" rx="5" ry="10" transform="rotate(25 14 -12)" />
    </g>
  );
}

export function Egg({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="0" rx="22" ry="28" fill="#BFE3CC" />
      <ellipse cx="-7" cy="-10" rx="7" ry="10" fill="#fff" opacity=".45" />
      <g fill="#5E9C7C" opacity=".75">
        <circle cx="8" cy="-8" r="3" /><circle cx="-6" cy="8" r="3.5" /><circle cx="10" cy="12" r="2.2" /><circle cx="-12" cy="-2" r="2" /><circle cx="2" cy="20" r="2.4" />
      </g>
    </g>
  );
}

function Fence({ x0, x1, y }: { x0: number; x1: number; y: number }) {
  const planks: ReactNode[] = [];
  for (let px = x0; px < x1; px += 34) {
    planks.push(<path key={px} d={`M${px} ${y + 110} L${px} ${y + 12} Q${px + 15} ${y - 4} ${px + 30} ${y + 12} L${px + 30} ${y + 110} Z`} fill="#D9A27E" />);
    planks.push(<rect key={px + "l"} x={px + 4} y={y + 20} width="4" height="80" rx="2" fill="#fff" opacity=".18" />);
  }
  return (
    <g>
      {planks}
      <rect x={x0 - 4} y={y + 34} width={x1 - x0 + 4} height="10" rx="3" fill="#C4876A" />
      <rect x={x0 - 4} y={y + 78} width={x1 - x0 + 4} height="10" rx="3" fill="#C4876A" />
    </g>
  );
}

function Flowers({ items }: { items: [number, number, string][] }) {
  return (
    <g>
      {items.map(([fx, fy, c], i) => (
        <g key={i} transform={`translate(${fx} ${fy})`}>
          <path d="M0 0 L0 18" stroke="#6E9B68" strokeWidth="2.5" />
          <g fill={c}><circle cx="-4" cy="-2" r="4" /><circle cx="4" cy="-2" r="4" /><circle cx="0" cy="-7" r="4" /><circle cx="0" cy="3" r="4" /></g>
          <circle cx="0" cy="-2" r="2.5" fill="#F3C34A" />
        </g>
      ))}
    </g>
  );
}

/** Spread 1: the footprints and the whisper. Two pages, 800 x 400. */
export function SpreadFootprints({ look, title, viewBox = "0 0 800 400", fit, mirror }: { look: Look; title?: string; viewBox?: string; fit?: "slice"; mirror?: boolean }) {
  const id = useSvgId();
  return (
    <svg viewBox={viewBox} preserveAspectRatio={fit ? "xMidYMid slice" : undefined} aria-hidden={title === "" ? true : undefined} role={title === "" ? undefined : "img"} aria-label={title || "Ava in her yellow wellies follows three huge footprints across the garden to a dinosaur peeking over the fence."}>
      <PaintDefs id={id} />
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFF1DC" /><stop offset="1" stopColor="#F8D5BE" /></linearGradient>
      </defs>
      <g filter={`url(#${id}-grain)`} transform={mirror ? "matrix(-1 0 0 1 800 0)" : undefined}>
        <rect width="800" height="400" fill={`url(#${id}-sky)`} />
        <circle cx="500" cy="64" r="34" fill="#F7C97A" opacity=".8" />
        <path d="M0 240 Q120 200 260 226 T520 214 T800 224 L800 400 L0 400 Z" fill="#B9D3B0" />
        <g filter={`url(#${id}-wob)`}>
          <Dino x={560} y={10} s={1} />
          <Fence x0={420} x1={800} y={150} />
        </g>
        <path d="M0 278 Q200 252 400 270 T800 262 L800 400 L0 400 Z" fill="#DCE8DA" />
        <path d="M0 300 Q220 286 420 300 T800 296" stroke="#C9DDC4" strokeWidth="10" fill="none" opacity=".7" />
        <Footprint x={300} y={340} s={1.1} r={70} />
        <Footprint x={430} y={318} s={1} r={74} />
        <Footprint x={548} y={300} s={0.9} r={78} />
        <Flowers items={[[40, 300, "#9B3652"], [76, 318, "#F29C8F"], [720, 330, "#9B3652"], [760, 312, "#F7C97A"], [690, 352, "#F29C8F"]]} />
        <g filter={`url(#${id}-wob)`}><Kid look={look} x={150} y={172} s={1.08} /></g>
        <rect x="398" y="0" width="4" height="400" fill={INK} opacity=".07" />
      </g>
    </svg>
  );
}

/** Spread 2: the egg in the wheelbarrow and a very wobbly dance. */
export function SpreadEgg({ look }: { look: Look }) {
  const id = useSvgId();
  return (
    <svg viewBox="0 0 800 400" role="img" aria-label="Ava points at a speckled teal egg in an old wheelbarrow while the dinosaur dances happily behind the fence.">
      <PaintDefs id={id} />
      <g filter={`url(#${id}-grain)`}>
        <rect width="800" height="400" fill="#FFF3E2" />
        <path d="M0 0 L800 0 L800 140 Q600 120 400 150 T0 140 Z" fill="#F8D5BE" opacity=".7" />
        <path d="M0 236 Q180 206 380 228 T800 220 L800 400 L0 400 Z" fill="#B9D3B0" />
        <g filter={`url(#${id}-wob)`}>
          <Dino x={540} y={6} s={1} tilt={-6} happy />
          <Fence x0={440} x1={800} y={150} />
        </g>
        <path d="M0 282 Q220 258 420 276 T800 268 L800 400 L0 400 Z" fill="#DCE8DA" />
        {/* wheelbarrow */}
        <g filter={`url(#${id}-wob)`}>
          <ellipse cx="360" cy="372" rx="90" ry="8" fill={INK} opacity=".1" />
          <path d="M270 290 L450 290 L420 346 L300 346 Z" fill="#9B3652" />
          <path d="M276 292 L444 292" stroke="#fff" strokeWidth="4" opacity=".25" />
          <path d="M300 346 L292 372 M420 346 L452 330 L520 318" stroke="#6B4A3A" strokeWidth="7" strokeLinecap="round" fill="none" />
          <circle cx="350" cy="356" r="17" fill={INK} /><circle cx="350" cy="356" r="6" fill="#F3C34A" />
          <Egg x={360} y={270} s={1.05} />
          <path d="M320 262 q-10 -12 -18 -6 M402 258 q10 -12 18 -6" stroke="#F3C34A" strokeWidth="3" strokeLinecap="round" fill="none" />
        </g>
        <Flowers items={[[700, 330, "#9B3652"], [740, 350, "#F29C8F"], [60, 330, "#F7C97A"]]} />
        <g filter={`url(#${id}-wob)`}><Kid look={look} x={110} y={176} s={1.05} point /></g>
        <rect x="398" y="0" width="4" height="400" fill={INK} opacity=".07" />
      </g>
    </svg>
  );
}

export type StoryArt = "dinosaur" | "moonlight" | "garden";

/** A square cover with the complete, personalised title. */
export function Cover({ story, name, look, label, viewBox = "0 0 400 400" }: { story: StoryArt; name: string; look: Look; label?: string; viewBox?: string }) {
  const id = useSvgId();
  const full = story === "dinosaur" ? "Dinosaur Next Door" : story === "moonlight" ? "Moonlight Express" : "Secret Garden Door";
  const words = full.split(" ");
  const l1 = words[0];
  const l2 = words.slice(1).join(" ");
  const dark = story === "moonlight";
  const titleFill = dark ? "#FFF8ED" : INK;
  return (
    <svg viewBox={viewBox} {...(label === "" ? { "aria-hidden": true } : { role: "img", "aria-label": label || `Cover: ${name} and the ${full}` })}>
      <PaintDefs id={id} />
      <g filter={`url(#${id}-grain)`}>
        {story === "dinosaur" && (
          <g>
            <defs>
              <linearGradient id={`${id}-dsky`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F3F0E2" /><stop offset=".6" stopColor="#DCE8DA" /></linearGradient>
            </defs>
            <rect width="400" height="400" fill={`url(#${id}-dsky)`} />
            <path d="M0 300 Q120 270 220 292 T400 284 L400 400 L0 400 Z" fill="#B9D3B0" />
            <g filter={`url(#${id}-wob)`}>
              <Dino x={190} y={120} s={0.95} />
              <Fence x0={210} x1={400} y={250} />
            </g>
            <path d="M0 340 Q160 322 400 336 L400 400 L0 400 Z" fill="#A9C79F" />
            <Footprint x={150} y={372} s={0.8} r={60} />
            <g filter={`url(#${id}-wob)`}><Kid look={look} x={40} y={190} s={1.0} /></g>
          </g>
        )}
        {story === "moonlight" && (
          <g>
            <rect width="400" height="400" fill="#2F2A52" />
            <g fill="#FFF8ED" opacity=".85">
              <circle cx="40" cy="170" r="2" /><circle cx="90" cy="200" r="1.6" /><circle cx="360" cy="190" r="2" /><circle cx="300" cy="160" r="1.4" /><circle cx="210" cy="180" r="1.8" />
            </g>
            <path d="M330 150 a34 34 0 1 0 30 52 a28 28 0 1 1 -30 -52 Z" fill="#F7DFA0" />
            <path d="M0 300 Q140 250 400 270 L400 400 L0 400 Z" fill="#4A3F6E" />
            <path d="M0 330 Q200 280 400 300" stroke="#8C7DB0" strokeWidth="6" fill="none" />
            <g filter={`url(#${id}-wob)`}>
              {/* train */}
              <g transform="translate(150 246) rotate(-6)">
                <rect x="0" y="10" width="70" height="40" rx="8" fill="#9B3652" />
                <rect x="74" y="16" width="64" height="34" rx="8" fill="#B54A66" />
                <rect x="142" y="16" width="64" height="34" rx="8" fill="#B54A66" />
                <rect x="50" y="-6" width="16" height="20" rx="3" fill="#6E2238" />
                <g fill="#F7DFA0"><rect x="10" y="18" width="16" height="14" rx="3" /><rect x="86" y="24" width="14" height="12" rx="3" /><rect x="110" y="24" width="14" height="12" rx="3" /><rect x="154" y="24" width="14" height="12" rx="3" /><rect x="178" y="24" width="14" height="12" rx="3" /></g>
                <g fill="#35263D"><circle cx="18" cy="52" r="7" /><circle cx="52" cy="52" r="7" /><circle cx="92" cy="52" r="6" /><circle cx="124" cy="52" r="6" /><circle cx="160" cy="52" r="6" /><circle cx="192" cy="52" r="6" /></g>
                <path d="M58 -10 q-10 -16 6 -22 q-4 -14 14 -14" stroke="#FFF8ED" strokeWidth="8" strokeLinecap="round" fill="none" opacity=".5" />
              </g>
              <path d="M290 214 l7 14 15 2 -11 10 3 15 -14 -7 -14 7 3 -15 -11 -10 15 -2 Z" fill="#F3C34A" />
            </g>
            <g filter={`url(#${id}-wob)`}><Kid look={look} x={30} y={198} s={0.95} point /></g>
          </g>
        )}
        {story === "garden" && (
          <g>
            <rect width="400" height="400" fill="#F8D5BE" />
            <g transform="translate(0 34)">
            <g filter={`url(#${id}-wob)`}>
              <rect x="150" y="150" width="250" height="220" fill="#D9A27E" />
              <g stroke="#C4876A" strokeWidth="3" opacity=".7">
                <path d="M150 190 H400 M150 232 H400 M150 274 H400 M150 316 H400" />
                <path d="M200 150 V190 M290 150 V190 M245 190 V232 M340 190 V232 M200 232 V274 M380 232 V274" />
              </g>
              <path d="M226 370 L226 250 Q275 196 324 250 L324 370 Z" fill="#FFF1C9" />
              <path d="M226 370 L226 250 Q252 222 276 216 L270 370 Z" fill="#6E9B68" />
              <circle cx="258" cy="306" r="5" fill="#F3C34A" />
              <path d="M276 300 l40 -20 M276 330 l46 -6 M276 270 l30 -30" stroke="#F3C34A" strokeWidth="4" strokeLinecap="round" opacity=".6" />
            </g>
            <path d="M150 150 Q190 110 230 140 Q270 104 310 136 Q350 106 400 130 L400 160 L150 160 Z" fill="#8DB585" />
            <Flowers items={[[180, 140, "#FFF8ED"], [240, 130, "#9B3652"], [300, 128, "#FFF8ED"], [360, 124, "#F29C8F"]]} />
            </g>
            <Flowers items={[[40, 350, "#9B3652"], [130, 360, "#FFF8ED"]]} />
            <path d="M0 360 Q200 340 400 362 L400 400 L0 400 Z" fill="#B9D3B0" />
            <g filter={`url(#${id}-wob)`}><Kid look={look} x={60} y={196} s={0.95} point /></g>
          </g>
        )}
      </g>
      {/* title: real text, kept clear of the art */}
      <g fontFamily="Fraunces, Georgia, serif" textAnchor="middle" fill={titleFill}>
        <text x="200" y="52" fontSize="24" fontStyle="italic" fontWeight="500">{name} and the</text>
        <text x="200" y="98" fontSize="44" fontWeight="700" letterSpacing="-0.5">{l1}</text>
        <text x="200" y="140" fontSize="44" fontWeight="700" letterSpacing="-0.5">{l2}</text>
      </g>
    </svg>
  );
}

/** Small painted head portrait for the hero picker. */
export function Portrait({ look }: { look: Look }) {
  const id = useSvgId();
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <PaintDefs id={id} wobble={1.2} />
      <g filter={`url(#${id}-grain)`}>
        <rect width="120" height="120" fill="#F8D5BE" />
        <g filter={`url(#${id}-wob)`}><Kid look={look} x={6} y={8} s={0.9} /></g>
      </g>
    </svg>
  );
}

/** A small ornament for the dedication page. */
export function DedicationOrnament() {
  return (
    <svg viewBox="0 0 160 70" aria-hidden="true" className="lp-ornament">
      <g transform="translate(46 8)">
        <rect x="0" y="10" width="26" height="40" rx="8" fill="#F3C34A" />
        <rect x="34" y="10" width="26" height="40" rx="8" fill="#F3C34A" />
        <rect x="-2" y="46" width="30" height="8" rx="4" fill="#35263D" opacity=".5" />
        <rect x="32" y="46" width="30" height="8" rx="4" fill="#35263D" opacity=".5" />
        <rect x="2" y="12" width="22" height="5" rx="2.5" fill="#fff" opacity=".4" />
        <rect x="36" y="12" width="22" height="5" rx="2.5" fill="#fff" opacity=".4" />
      </g>
      <path d="M20 30 q6 -8 12 0 q6 -8 12 0 q0 8 -12 16 q-12 -8 -12 -16 Z" fill="#9B3652" opacity=".8" />
      <path d="M116 30 q6 -8 12 0 q6 -8 12 0 q0 8 -12 16 q-12 -8 -12 -16 Z" fill="#9B3652" opacity=".8" />
    </svg>
  );
}
