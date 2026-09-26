# Memory palette

Every colour of the 2018 original, read from the frozen archive at
`~/archived/webdev/oldProjects/memoryGame/`, with the archived file each one comes from and the
Tailwind default entry it anchors on.

## Method

The nearest entry is computed, never recalled. The default palette of the installed `tailwindcss`
(4.3.0) is read from `node_modules/tailwindcss/theme.css`; every `oklch()` entry is converted to
sRGB and to CIELAB (D65), and the distance is measured with **CIEDE2000**, the perceptual metric,
so a colour is compared to the palette the way the eye compares them. Two entries within 1 of each
other count as a tie, and a tied grey takes the `neutral-*` family, which `CODING_STANDARDS.md`
names as the repository's stand-in for black and white.

| Original colour | Read from | Tailwind entry | Hex | ΔE2000 |
| --- | --- | --- | --- | --- |
| `#333` — body background (`$primary`) | `~/archived/webdev/oldProjects/memoryGame/src/assets/scss/_settings.scss:1` | `neutral-800` | `#262626` | 4.13 |
| `#eee` — body text (`$secondary`) | `~/archived/webdev/oldProjects/memoryGame/src/assets/scss/_settings.scss:2` | `neutral-100` | `#f5f5f5` | 1.46 |
| `hsl(266, 80%, 39%)` (`#5914b3`) — `$cardBg`, the plate of both faces | `~/archived/webdev/oldProjects/memoryGame/src/assets/scss/_settings.scss:3` | `violet-800` | `#5d0ec0` | 1.74 |
| `rgba(238, 238, 238, .5)` — 1px border on both faces | `~/archived/webdev/oldProjects/memoryGame/src/assets/scss/_board.scss:42` | `neutral-100` at 50% | `#f5f5f5` | 1.46 |
| `#fcaf3e` — the card-back artwork, fill at 0.9848485 opacity | `~/archived/webdev/oldProjects/memoryGame/src/assets/img/backFace.svg:75-215` | `orange-300` | `#ffb86a` | 5.46 |
| `#888888` — shading inside the card back | `~/archived/webdev/oldProjects/memoryGame/src/assets/img/backFace.svg:50` | `neutral-500` | `#737373` | 8.11 |
| `#666666` — shading inside the card back | `~/archived/webdev/oldProjects/memoryGame/src/assets/img/backFace.svg:51` | `neutral-500` | `#737373` | 5.03 |
| `#1a1918` — Ansible mark | `~/archived/webdev/oldProjects/memoryGame/src/assets/img/ansibleLogo.svg:78` | `neutral-900` | `#171717` | 1.14 |
| `#ffffff` — Ansible background and highlight | `~/archived/webdev/oldProjects/memoryGame/src/assets/img/ansibleLogo.svg:53, :83` | `neutral-50` | `#fafafa` | 1.00 |
| `#666666` — Ansible shading | `~/archived/webdev/oldProjects/memoryGame/src/assets/img/ansibleLogo.svg:69` | `neutral-500` | `#737373` | 5.03 |
| `#1488c6` — Docker mark | `~/archived/webdev/oldProjects/memoryGame/src/assets/img/dockerLogo.svg:59` | `sky-600` | `#0084d1` | 2.87 |
| `#ffffff` — Docker highlight | `~/archived/webdev/oldProjects/memoryGame/src/assets/img/dockerLogo.svg:34` | `neutral-50` | `#fafafa` | 1.00 |
| `#666666` — Docker shading | `~/archived/webdev/oldProjects/memoryGame/src/assets/img/dockerLogo.svg:35` | `neutral-500` | `#737373` | 5.03 |
| `#f14e32` — Git mark | `~/archived/webdev/oldProjects/memoryGame/src/assets/img/gitLogo.svg:77` | `red-500` | `#fb2c36` | 6.00 |
| `#ffffff` — Git highlight | `~/archived/webdev/oldProjects/memoryGame/src/assets/img/gitLogo.svg:51` | `neutral-50` | `#fafafa` | 1.00 |
| `#666666` — Git shading | `~/archived/webdev/oldProjects/memoryGame/src/assets/img/gitLogo.svg:52` | `neutral-500` | `#737373` | 5.03 |
| `#e34f26` — HTML5 mark | `~/archived/webdev/oldProjects/memoryGame/src/assets/img/html5Logo.svg:76` | `orange-600` | `#f54900` | 4.58 |
| `#ffffff` — HTML5 highlight | `~/archived/webdev/oldProjects/memoryGame/src/assets/img/html5Logo.svg:51` | `neutral-50` | `#fafafa` | 1.00 |
| `#666666` — HTML5 shading | `~/archived/webdev/oldProjects/memoryGame/src/assets/img/html5Logo.svg:52` | `neutral-500` | `#737373` | 5.03 |
| `#d4b830` — JavaScript mark | `~/archived/webdev/oldProjects/memoryGame/src/assets/img/javascriptLogo.svg:72, :81` | `amber-300` | `#ffd230` | 8.35 |
| `#fdd83c` — JavaScript mark | `~/archived/webdev/oldProjects/memoryGame/src/assets/img/javascriptLogo.svg:72, :99` | `amber-300` | `#ffd230` | 2.29 |
| `#ebebeb` — JavaScript highlight | `~/archived/webdev/oldProjects/memoryGame/src/assets/img/javascriptLogo.svg:87, :93` | `neutral-200` | `#e5e5e5` | 1.30 |
| `#888888` — JavaScript shading | `~/archived/webdev/oldProjects/memoryGame/src/assets/img/javascriptLogo.svg:49` | `neutral-500` | `#737373` | 8.11 |
| `#666666` — JavaScript shading | `~/archived/webdev/oldProjects/memoryGame/src/assets/img/javascriptLogo.svg:50` | `neutral-500` | `#737373` | 5.03 |
| `#cd6799` — Sass mark | `~/archived/webdev/oldProjects/memoryGame/src/assets/img/sassLogo.svg:62` | `pink-400` | `#fb64b6` | 8.39 |
| `#ffffff` — Sass highlight | `~/archived/webdev/oldProjects/memoryGame/src/assets/img/sassLogo.svg:35` | `neutral-50` | `#fafafa` | 1.00 |
| `#666666` — Sass shading | `~/archived/webdev/oldProjects/memoryGame/src/assets/img/sassLogo.svg:36` | `neutral-500` | `#737373` | 5.03 |

## Where each entry is used

- `bg-neutral-800` and `text-neutral-100` on the feature plate: the `body` rules
  (`_board.scss:1-7`, colours from `_settings.scss:1-2`).
- `bg-violet-800` on both faces and `border-neutral-100/50` for their 1px border, `rounded-[5px]`
  (`_board.scss:38-48`).
- `bg-orange-300` for the back face, which the original fills with the `#fcaf3e` artwork
  (`backFace.svg`).
- `rotate-y-180` on the flipped card, `duration-500` for the 0.5s transform, `transform-3d`,
  `backface-hidden` on both faces, `rotate-y-180` pre-applied to the front face, `active:scale-97`
  for the pressed state, and `perspective-[1000px]` on the board (`_board.scss:13, :24-36, :38-52`).
- `text-neutral-500` for the best-run heading, the rank numbers and the empty slots: the shading
  grey the logos already carry, promoted to the feature's secondary text tone. The original's own
  body text was `1.2rem` (`_board.scss:6`) and carries no visible string, so the new labels sit at
  `text-[14px]`.
- The win plate and the reset button introduce no colour: they reuse `bg-violet-800`,
  `bg-orange-300` and `text-neutral-800`.

`orange-300`, `neutral-100` and `neutral-500` are entries computed for the card-back artwork, the
face border and the logo shading respectively. The first also paints the reset button, the move
counter's emphasis and the win line, and the second the counter's body text and the populated
best-run values; that is those entries carrying more of the feature, not a new colour.

## The logos

The 2018 front faces are third-party logo SVGs. Nothing is copied from the archive: each symbol is
rendered as a monogram in its logo's own mapped colour, on the `$cardBg` plate — `D` in `sky-600`,
`G` in `red-500`, `H5` in `orange-600`, `JS` in `amber-300`, `S` in `pink-400`. Ansible reads in
its logo's white (`neutral-50`): its near-black mark (`neutral-900`) would disappear on the plate.
The `#666666` and `#888888` shading of every SVG maps to `neutral-500` and is not re-drawn.

## Fonts

The original declared no font family at all and rendered in the browser's default
(`_board.scss:1-7`, `_reset.scss:1-5`). The port renders in the project's `font-sans`; no font is
fetched at runtime.

## Additions beyond the original

The win state, the reset button, the move counter and the best-run list do not exist in the 2018
original — they are the issue's requirements, not ports, so no original colour constrains them.
