# Pomodoro palette

Every colour of the 2018 original, read from its public repository
(`TituxMetal/pomodoroTimer` — the archive holds no local copy of this one, as for Tetris), with the
file and line each one comes from and the Tailwind default entry it anchors on.

## Method

The nearest entry is computed, never recalled. The default palette of the installed `tailwindcss`
(4.3.0) is read from `node_modules/tailwindcss/theme.css`; every `oklch()` entry is converted to
sRGB through the Oklch-to-linear-sRGB matrices and the transfer function, clipped to the gamut, and
the sRGB colour as rendered is converted to CIELAB (D65). The distance is measured with
**CIEDE2000**, the perceptual metric, and the implementation was checked against the published
CIEDE2000 test vectors (Sharma, Wu and Dalal) before any figure here was written. Black is not
written as `black` anywhere in this feature: the archive's three translucent blacks anchor on
`neutral-950`, the nearest non-pure neighbour, as `CODING_STANDARDS.md` requires. A translucent
original keeps its alpha on the nearest entry's hex, and the ΔE is measured on the opaque colour,
since alpha composites against a background rather than naming one.

| Original colour | Read from | Tailwind entry | Hex | ΔE2000 |
| --- | --- | --- | --- | --- |
| `rebeccapurple` (`#663399`) — the page plate | `src/scss/_reset.scss:5` | `purple-800` | `#6e11b0` | 5.86 |
| `lightsalmon` (`#ffa07a`) — the countdown and the end time | `src/scss/_timer.scss:11`, `:18` | `red-300` | `#ffa2a2` | 12.78 |
| `sandybrown` (`#f4a460`) — the preset buttons and the minutes field | `src/scss/_timer.scss:40`, `:57` | `orange-300` | `#ffb86a` | 5.99 |
| `rgba(0, 0, 0, .1)` — the controls' plate | `src/scss/_timer.scss:33`, `:61` | `neutral-950` at 10% | `#0a0a0a` | 1.60 |
| `rgba(0, 0, 0, .2)` — the buttons' edges and their pressed plate | `src/scss/_timer.scss:62`, `:63`, `:70` | `neutral-950` at 20% | `#0a0a0a` | 1.60 |
| `rgba(0, 0, 0, .05)` — the countdown's text shadow | `src/scss/_timer.scss:19` | `neutral-950` at 5% | `#0a0a0a` | 1.60 |

`lightsalmon` is the palette's widest anchor: no default entry lands under 12, and the nearest,
`red-300`, is a paler, pinker cousin of the original's orange-leaning salmon (`orange-300` sits
14.07 away and reads more saturated, not closer). The metric decides it, as it does everywhere
else here; the tone stays the pale warm the countdown wore against the purple plate.

## Where each entry is used

- `bg-purple-800` on the feature's plate: the original's `html` background, which was the whole page
  (`_reset.scss:5`).
- `text-red-300` on the countdown and on the end time (`_timer.scss:11-19`).
- `text-orange-300` on the preset buttons and on the minutes field's own text
  (`_timer.scss:40`, `:57`); the placeholder takes the same tone.
- `bg-neutral-950/10` on the controls' plate and on each button, `border-neutral-950/20` on their
  right and bottom edges, and `bg-neutral-950/20` for the pressed state (`_timer.scss:33`,
  `:61-70`).
- the countdown's shadow, `text-shadow-[4px_4px_0] text-shadow-neutral-950/5` (`_timer.scss:19`):
  `neutral-950` is the entry the three translucent blacks anchor on — the nearest non-pure neighbour
  of `#000000` at ΔE 1.60, and the same entry the portfolio's own translucent plates take — so no
  class string here names a pure black.

## Fonts

The original fetched `Inconsolata` from Google Fonts and set it on the body and on the buttons
(`src/scss/app.scss:1`, `_reset.scss:10`, `_timer.scss:65`); the minutes field declared no face of
its own (`_timer.scss:38-46`) and inherited the body's. This project ships its own
pair (Geist Sans / Geist Mono) and forbids global CSS beyond the reset, so the port keeps the era's
colours, sizes and layout and renders in `font-mono` — unlike the other ports, this original's face
was a monospace, so its identity survives the substitution rather than being flattened to the
shell's `font-sans`.

## Where the port departs from the original

- **The plate lives in the shell's column.** The original's `.timer` was `min-height: 100vh` and its
  controls `max-width: 100vw`, because the app was the whole page; here the shell owns the page and
  the feature gets a column, so the plate takes a fixed height and the controls fill the column's
  width, which is the porting rule this unit settled: a viewport-relative value does not survive the
  move into a column.
- **The type scale steps down by the column-to-canvas ratio (0.8).** The original's countdown was
  `6rem` and its end time `1.5rem` — 96px and 24px at the browser's default 16px root (the
  original's own `font-style: 10px` is not a property, so it never took effect) — and that 96px
  countdown overflows a phone's column once the display carries an hour. The port keeps the
  hierarchy at 77px and 19px. The button and field labels keep their 16px, the shell's floor for
  running text.
- **An exact multiple of sixty hours is written with its hours.** The original prefixed them only
  when `hours % 60` was non-zero (`app.js:31`), so a 3600-minute entry — which its own field accepts —
  read `00:00`. The port prefixes them whenever there are any; the rest of the format is the
  original's, character for character.
- **The free minutes field is numeric.** The original took any text and let `| 0` turn it into a
  number; the port keeps that reading (`secondsFromMinutes`) and adds `inputMode='numeric'` so a
  phone offers digits.
- **No icon font, no runtime fetch.** The original loaded its font from Google; nothing is fetched
  here, and the display's own text-shadow is the one arbitrary utility value the look needed.

## Additions beyond the original

Only one, and it is invisible: the shell's `<title>` is restored when the visitor leaves. The
original was the whole page and could keep writing `document.title`; the port borrows the title
while its countdown runs (`app.js:34`) and hands the shell's own back on unmount.

The display's starting value, `13:37`, is the original's own markup, not an addition — the countdown
replaced it on the first press (`index.html:35`).
