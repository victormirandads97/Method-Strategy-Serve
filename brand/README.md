# The Method Co. brand assets (v1.0)

Dark navy, green and white. Every file here is generated from code, so the
logo is the same geometry everywhere:

```bash
python3 script/brand/build-svgs.py
```

```bash
node script/brand/render-pngs.mjs
```

The first writes the SVGs, palette and tokens. The second renders the PNGs and
`favicon.ico`, then copies the favicon set into `client/public/`.

## Logo

| File | Use it for |
| --- | --- |
| `logo/method-logo-horizontal-on-dark.svg` / `.png` | Primary horizontal logo, transparent, for dark backgrounds |
| `logo/method-logo-horizontal-on-light.svg` / `.png` | Primary horizontal logo, transparent, for light backgrounds |
| `logo/method-logo-horizontal-navy.svg` / `.png` | Horizontal logo on a navy panel |
| `logo/method-logo-horizontal-white.svg` / `.png` | Horizontal logo on a white panel |
| `logo/method-mark-on-dark.svg` / `.png` | The M on its own, transparent, for dark backgrounds |
| `logo/method-mark-on-light.svg` / `.png` | The M on its own, transparent, for light backgrounds |

On dark grounds the left half of the M and the wordmark are white. On light
grounds they turn navy (`#0A0F14`). The green half and the green full stop
never change colour.

## Icons and profile

| File | Use it for |
| --- | --- |
| `social/method-whatsapp-profile-640.png` | WhatsApp Business profile photo (640 x 640). The mark sits inside the circle crop. |
| `icon/method-app-icon-512.png`, `-192.png` | App icon, web manifest |
| `icon/apple-touch-icon.png` | iOS home screen (180 x 180) |
| `icon/favicon.svg`, `favicon.ico`, `favicon-16/32/48.png` | Browser tab |

## Colour

`palette/method-palette.png` is the reference sheet. The same values are in
`palette/method-palette.json`, `palette/method-tokens.css` and
`client/src/lib/brand.ts`.

| Token | Hex | Role |
| --- | --- | --- |
| Primary | `#22D87A` | CTAs, links, accents. Use dark text on it, never white. |
| Primary Dark | `#0F8A54` | Gradients, glows |
| Background | `#0A0F14` | Page background |
| Surface | `#111827` | Cards, panels |
| Border / Muted | `#374151` | Borders, dividers |
| Light Surface | `#E5E7EB` | Light panels |
| Background Light | `#F9FAFB` | Light pages, headings on dark |
| Text / UI | `#FFFFFF` | Logo, UI on dark |

Gradients: Primary `#0A0F14 → #22D87A`, Accent `#0F8A54 → #22D87A`.

## Type

Inter: Bold for the wordmark and headings, SemiBold for buttons, Medium and
Regular for body.
