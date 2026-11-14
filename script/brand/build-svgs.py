"""
Builds The Method Co. brand SVGs from code, so every asset comes from one
geometry and one palette instead of a cropped image.

    python3 script/brand/build-svgs.py      # SVGs, palette, tokens
    node    script/brand/render-pngs.mjs    # PNG exports, favicon.ico

The wordmark is Inter Bold outlined to paths (needs fontTools and Inter Bold
installed), so the SVGs render the same on machines without the font.
Set INTER_BOLD to the font file if it is not in the usual Linux place.
"""

from __future__ import annotations

import json
import os
import shutil
from pathlib import Path

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "brand"
PUBLIC = ROOT / "client" / "public"
INTER_BOLD = os.environ.get("INTER_BOLD", "/usr/share/fonts/opentype/inter/Inter-Bold.otf")

# ── Palette ──────────────────────────────────────────────────────────────────
# Mirrors client/src/lib/brand.ts. Change both together.
PALETTE = [
    ("primary", "Primary", "#22D87A"),
    ("primaryDark", "Primary Dark", "#0F8A54"),
    ("background", "Background", "#0A0F14"),
    ("surface", "Surface", "#111827"),
    ("border", "Border / Muted", "#374151"),
    ("lightSurface", "Light Surface", "#E5E7EB"),
    ("backgroundLight", "Background Light", "#F9FAFB"),
    ("white", "Text / UI", "#FFFFFF"),
]
P = {k: v for k, _, v in PALETTE}
GRADIENTS = [
    ("Primary Gradient", P["background"], P["primary"]),
    ("Accent Gradient", P["primaryDark"], P["primary"]),
]

# ── The mark ─────────────────────────────────────────────────────────────────
# An M built from two mirrored halves that meet in a V: a solid left half and
# a green right half, darker where it folds into the join and brightest at the
# top-right corner, so the M reads as rising. Units: 160 x 112.
MARK_W, MARK_H = 160.0, 112.0
STEM = 29.0           # stem width
SLOPE = 0.79          # rise of each diagonal per unit across
DEPTH = 22.0          # vertical thickness of each diagonal
_MID = MARK_W / 2
_TOP_JOIN = _MID * SLOPE                 # where the diagonals' top edges meet
_LEFT = [
    (0, 0), (_MID, _TOP_JOIN), (_MID, _TOP_JOIN + DEPTH),
    (STEM, STEM * SLOPE + DEPTH), (STEM, MARK_H), (0, MARK_H),
]
_RIGHT = [(MARK_W - x, y) for x, y in _LEFT]


def _poly(points: list[tuple[float, float]]) -> str:
    return "M" + " L".join(f"{x:.2f} {y:.2f}" for x, y in points) + " Z"


LEFT_D = _poly(_LEFT)
RIGHT_D = _poly(_RIGHT)


def mark_group(left_fill: str, uid: str, x: float = 0, y: float = 0, scale: float = 1.0) -> tuple[str, str]:
    """Returns (defs, group) for the mark placed at x, y with the given scale."""
    defs = (
        f'<linearGradient id="{uid}" gradientUnits="userSpaceOnUse" '
        f'x1="{_MID:.2f}" y1="{_TOP_JOIN + DEPTH:.2f}" x2="{MARK_W:.2f}" y2="0">'
        f'<stop offset="0" stop-color="{P["primaryDark"]}"/>'
        f'<stop offset="0.55" stop-color="{P["primary"]}"/>'
        f'<stop offset="1" stop-color="#4BF59A"/>'
        f"</linearGradient>"
    )
    group = (
        f'<g transform="translate({x:.2f} {y:.2f}) scale({scale:.4f})">'
        f'<path d="{LEFT_D}" fill="{left_fill}"/>'
        f'<path d="{RIGHT_D}" fill="url(#{uid})"/>'
        f"</g>"
    )
    return defs, group


# ── The wordmark ─────────────────────────────────────────────────────────────
_font = TTFont(INTER_BOLD)
_glyphs = _font.getGlyphSet()
_cmap = _font.getBestCmap()
_hmtx = _font["hmtx"]
UPM = _font["head"].unitsPerEm
CAP = _font["OS/2"].sCapHeight


def text_path(text: str, cap_px: float, tracking_em: float) -> tuple[str, float]:
    """Outline `text` to a single path. Baseline at y=cap_px. Returns (d, width)."""
    s = cap_px / CAP
    pen = SVGPathPen(_glyphs)
    x = 0.0
    chars = list(text)
    for i, ch in enumerate(chars):
        name = _cmap[ord(ch)]
        # Flip y (font units are y-up) and drop the baseline to cap_px.
        tp = TransformPen(pen, (s, 0, 0, -s, x, cap_px))
        _glyphs[name].draw(tp)
        x += _hmtx[name][0] * s
        if i < len(chars) - 1:
            x += tracking_em * UPM * s
    return pen.getCommands(), x


def wordmark(cap_px: float) -> tuple[str, str, float]:
    """'THE METHOD CO' path, and the green full stop path, and total width."""
    tracking = 0.075
    main_d, w = text_path("THE METHOD CO", cap_px, tracking)
    gap = tracking * UPM * (cap_px / CAP)
    dot_d, dot_w = text_path(".", cap_px, 0)
    return main_d, f'<path transform="translate({w + gap * 0.6:.2f} 0)" d="{dot_d}"/>', w + gap * 0.6 + dot_w


# ── Writers ──────────────────────────────────────────────────────────────────
def svg(w: float, h: float, body: str, defs: str = "", title: str = "The Method Co.") -> str:
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.0f} {h:.0f}" '
        f'width="{w:.0f}" height="{h:.0f}" role="img" aria-label="{title}">'
        f"<title>{title}</title>"
        + (f"<defs>{defs}</defs>" if defs else "")
        + body
        + "</svg>\n"
    )


def horizontal(ink: str, rule: str, bg: str | None = None) -> str:
    """Mark, hairline divider, wordmark. ink colours the solid half and the text."""
    pad = 24.0
    cap = 44.0
    main_d, dot, text_w = wordmark(cap)
    rule_x = pad + MARK_W + 30
    text_x = rule_x + 32
    w = text_x + text_w + pad
    h = MARK_H + pad * 2
    defs, mark = mark_group(ink, "mg", pad, pad)
    text_y = pad + (MARK_H - cap) / 2
    body = ""
    if bg:
        body += f'<rect width="{w:.0f}" height="{h:.0f}" rx="20" fill="{bg}"/>'
    body += mark
    body += f'<rect x="{rule_x:.2f}" y="{pad + 8:.2f}" width="2.5" height="{MARK_H - 16:.2f}" rx="1.25" fill="{rule}"/>'
    body += (
        f'<g transform="translate({text_x:.2f} {text_y:.2f})">'
        f'<path fill="{ink}" d="{main_d}"/>'
        f'<g fill="{P["primary"]}">{dot}</g></g>'
    )
    return svg(w, h, body, defs)


def mark_only(ink: str) -> str:
    pad = 12.0
    defs, mark = mark_group(ink, "mg", pad, pad)
    return svg(MARK_W + pad * 2, MARK_H + pad * 2, mark, defs)


def tile(size: int, radius_ratio: float, mark_ratio: float, glow: bool, title: str) -> str:
    """Square tile: navy ground, mark centred. Used for app icon and profile photo."""
    scale = size * mark_ratio / MARK_W
    mx = (size - MARK_W * scale) / 2
    my = (size - MARK_H * scale) / 2
    defs, mark = mark_group(P["white"], "mg", mx, my, scale)
    defs += (
        f'<radialGradient id="ground" cx="0.5" cy="0.42" r="0.75">'
        f'<stop offset="0" stop-color="#121B24"/><stop offset="1" stop-color="{P["background"]}"/>'
        f"</radialGradient>"
    )
    body = f'<rect width="{size}" height="{size}" rx="{size * radius_ratio:.1f}" fill="url(#ground)"/>'
    if glow:
        defs += (
            f'<radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">'
            f'<stop offset="0" stop-color="{P["primary"]}" stop-opacity="0.22"/>'
            f'<stop offset="1" stop-color="{P["primary"]}" stop-opacity="0"/>'
            f"</radialGradient>"
        )
        body += (
            f'<ellipse cx="{size * 0.62:.1f}" cy="{size * 0.6:.1f}" rx="{size * 0.42:.1f}" '
            f'ry="{size * 0.3:.1f}" fill="url(#glow)"/>'
        )
    body += mark
    return svg(size, size, body, defs, title)


def palette_sheet() -> str:
    w, h = 1200, 640
    sw, sh, gap, x0, y0 = 128, 112, 10, 60, 150
    body = f'<rect width="{w}" height="{h}" fill="{P["background"]}"/>'
    font = "font-family=\"Inter, 'Helvetica Neue', Arial, sans-serif\""
    body += f'<text x="60" y="82" {font} font-size="15" font-weight="600" letter-spacing="3.5" fill="{P["white"]}">COLOUR PALETTE</text>'
    body += f'<text x="60" y="112" {font} font-size="15" fill="#9CA3AF">The Method Co. brand system v1.0</text>'
    for i, (_k, name, hx) in enumerate(PALETTE):
        x = x0 + i * (sw + gap)
        stroke = P["border"] if hx in (P["background"], P["surface"]) else "none"
        body += f'<rect x="{x}" y="{y0}" width="{sw}" height="{sh}" rx="14" fill="{hx}" stroke="{stroke}"/>'
        body += f'<text x="{x}" y="{y0 + sh + 30}" {font} font-size="16" font-weight="700" fill="{P["white"]}">{hx}</text>'
        col = P["primary"] if i == 0 else "#9CA3AF"
        body += f'<text x="{x}" y="{y0 + sh + 52}" {font} font-size="14" fill="{col}">{name}</text>'
    defs = ""
    gy = 420
    body += f'<text x="60" y="{gy - 24}" {font} font-size="15" font-weight="600" letter-spacing="3.5" fill="{P["white"]}">GRADIENTS</text>'
    for i, (name, a, b) in enumerate(GRADIENTS):
        x = 60 + i * 560
        defs += f'<linearGradient id="g{i}" x1="0" y1="0.2" x2="1" y2="0.8"><stop offset="0" stop-color="{a}"/><stop offset="1" stop-color="{b}"/></linearGradient>'
        body += f'<rect x="{x}" y="{gy}" width="520" height="110" rx="16" fill="url(#g{i})" stroke="{P["border"]}"/>'
        body += f'<text x="{x}" y="{gy + 140}" {font} font-size="16" font-weight="700" fill="{P["white"]}">{name}</text>'
        body += f'<text x="{x + 180}" y="{gy + 140}" {font} font-size="14" fill="#9CA3AF">{a} → {b}</text>'
    return svg(w, h, body, defs, "The Method Co. colour palette")


def tokens_css() -> str:
    lines = [f"  --mc-{''.join('-' + c.lower() if c.isupper() else c for c in k)}: {v};" for k, _, v in PALETTE]
    return (
        "/* The Method Co. brand tokens. Generated by script/brand/build-svgs.py */\n"
        ":root {\n" + "\n".join(lines) + "\n"
        f"  --mc-gradient-primary: linear-gradient(135deg, {GRADIENTS[0][1]}, {GRADIENTS[0][2]});\n"
        f"  --mc-gradient-accent: linear-gradient(135deg, {GRADIENTS[1][1]}, {GRADIENTS[1][2]});\n"
        "  --mc-font: 'Inter', system-ui, sans-serif;\n}\n"
    )


def main() -> None:
    for d in ("logo", "icon", "social", "palette"):
        (OUT / d).mkdir(parents=True, exist_ok=True)
    files = {
        # Horizontal lockups. Transparent ground, one for each kind of background.
        "logo/method-logo-horizontal-on-dark.svg": horizontal(P["white"], "rgba(255,255,255,0.35)"),
        "logo/method-logo-horizontal-on-light.svg": horizontal(P["background"], "rgba(10,15,20,0.25)"),
        # The same lockups on their own ground, for places that need a filled rectangle.
        "logo/method-logo-horizontal-navy.svg": horizontal(P["white"], "rgba(255,255,255,0.35)", P["background"]),
        "logo/method-logo-horizontal-white.svg": horizontal(P["background"], "rgba(10,15,20,0.25)", P["white"]),
        # Mark on its own, transparent.
        "logo/method-mark-on-dark.svg": mark_only(P["white"]),
        "logo/method-mark-on-light.svg": mark_only(P["background"]),
        # App icon and favicon source.
        "icon/method-app-icon.svg": tile(512, 0.22, 0.66, False, "The Method Co."),
        "icon/favicon.svg": tile(64, 0.2, 0.76, False, "The Method Co."),
        # WhatsApp crops the photo to a circle: keep the mark inside the safe area.
        "social/method-whatsapp-profile.svg": tile(640, 0, 0.5, True, "The Method Co."),
        "palette/method-palette.svg": palette_sheet(),
    }
    for rel, content in files.items():
        (OUT / rel).write_text(content)
    (OUT / "palette" / "method-palette.json").write_text(
        json.dumps(
            {
                "name": "The Method Co.",
                "version": "1.0",
                "colours": [{"token": k, "name": n, "hex": v} for k, n, v in PALETTE],
                "gradients": [{"name": n, "from": a, "to": b} for n, a, b in GRADIENTS],
                "typography": {"family": "Inter", "weights": [400, 500, 600, 700]},
            },
            indent=2,
        )
        + "\n"
    )
    (OUT / "palette" / "method-tokens.css").write_text(tokens_css())

    # Files the site serves directly.
    shutil.copy(OUT / "icon/favicon.svg", PUBLIC / "favicon.svg")
    (PUBLIC / "brand").mkdir(exist_ok=True)
    for name in ("method-logo-horizontal-on-dark.svg", "method-logo-horizontal-on-light.svg",
                 "method-mark-on-dark.svg", "method-mark-on-light.svg"):
        shutil.copy(OUT / "logo" / name, PUBLIC / "brand" / name)
    print("\n".join(sorted(files)))
    print("mark paths:", LEFT_D, "|", RIGHT_D)


if __name__ == "__main__":
    main()
