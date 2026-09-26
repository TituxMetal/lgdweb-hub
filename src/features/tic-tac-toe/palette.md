# Tic-Tac-Toe palette

Every colour of the 2017 original — the retained ruleset and the whole visual identity — with the
file it was read from in the frozen archive
(`~/archived/webdev/oldProjects/ticTacToe/`) and the Tailwind default entry it anchors on.

## Method

The nearest entry is computed, never recalled. The default palette of the installed `tailwindcss`
(4.3.0) is read from `node_modules/tailwindcss/theme.css`; each `oklch()` entry is converted to
sRGB and to CIELAB (D65), and the distance is measured with **CIEDE2000** — the perceptual metric,
so a colour is compared to the palette the way the eye compares them. Two entries within 1 of each
other count as a tie, and a tied grey takes the `neutral-*` family, which `CODING_STANDARDS.md`
names as the repository's stand-in for black and white. This project's own `@theme` block pins
`amber-400` to `#fbbf24` (`src/styles/globals.css`); the hex column gives what this project
renders.

| Original colour | Read from | Tailwind entry | Hex | ΔE2000 |
| --- | --- | --- | --- | --- |
| `#1b1b1b` — body background | `~/archived/webdev/oldProjects/ticTacToe/src/scss/app.scss:10` | `neutral-900` | `#171717` | 1.26 |
| `cadetblue` (`#5f9ea0`) — `h1` text | `~/archived/webdev/oldProjects/ticTacToe/src/scss/app.scss:21` | `teal-600` | `#009689` | 10.20 |
| `#bada55` — `.game` border | `~/archived/webdev/oldProjects/ticTacToe/src/scss/app.scss:30` | `lime-300` | `#bbf451` | 6.33 |
| `#b000b5` — `.board` border | `~/archived/webdev/oldProjects/ticTacToe/src/scss/app.scss:40` | `fuchsia-700` | `#a800b7` | 1.74 |
| `cornflowerblue` (`#6495ed`) — `.square` background | `~/archived/webdev/oldProjects/ticTacToe/src/scss/app.scss:48` | `blue-400` | `#51a2ff` | 5.67 |
| `#fb1` (`#ffbb11`) — `.square` border | `~/archived/webdev/oldProjects/ticTacToe/src/scss/app.scss:49` | `amber-400` | `#fbbf24` | 1.98 |
| `rgba(0, 0, 0, .9)` — overlay background | `~/archived/webdev/oldProjects/ticTacToe/src/scss/app.scss:60` | `neutral-950` at 90% | `#0a0a0a` | 1.59 |
| `#fff` — overlay text | `~/archived/webdev/oldProjects/ticTacToe/src/scss/app.scss:61` | `neutral-50` | `#fafafa` | 1.00 |
| black — the marks, from the browser default | `~/archived/webdev/oldProjects/ticTacToe/src/scss/app.scss:9-14` (the body declares no `color`) | `neutral-900` | `#171717` | 4.58 |

## Where each entry is used

- `bg-neutral-900` on the game plate, `border-lime-300` on its border and `min-h-screen` for its
  100vh: `.game` (`app.scss:28-35`).
- `text-teal-600` on the `h1`, `text-[30px]` for its 3rem at the original's 62.5% root
  (`app.scss:5-7, :16-26`).
- `border-fuchsia-700` on the board, `p-[10px]` for its 1rem padding, `w-[min(60vh,100%)]` and
  `aspect-square` for its 60vh square (`app.scss:37-44`); the width falls back to the viewport on a
  phone, where 60vh is wider than the screen.
- `bg-blue-400` and `border-amber-400` on each of the nine cells, `text-[48px]` for their 4.8em
  marks, `text-neutral-900` for the black (`app.scss:46-55`).
- `bg-neutral-950/90` and `text-neutral-50` on the round-end overlay, `text-[50px]` for its 5rem
  (`app.scss:59-72`). `neutral-950` is the entry nearest the overlay's black, so the plate darkens
  where it covers: over the `neutral-900` game plate it composites to about `#0b0b0b`, against the
  original's `rgba(0, 0, 0, .9)` over the `#1b1b1b` body (`app.scss:10, :60`) compositing to about
  `#030303`. A `neutral-900` overlay would composite to the plate's own `#171717` and darken
  nothing.

Two placements are not reproduced, because the shell owns them: the `h1` is absolute at the top of
the viewport in the original (`app.scss:16-20`) and sits in the flow here, and the overlay is
`inset-0` over the game plate rather than over the whole document — so the shell's header and
`BackToList` stay reachable while a round is over, which is what returning to the list depends on.

`amber-400` is also the shell's single accent. Nothing of the shell is read here: the entry comes
from the nearest-entry computation for `#fb1`, and it paints the nine cell borders — the role the
original gave it.

## Fonts

The original loaded `Courgette, cursive` for the `h1` and `Nunito` for the body from Google Fonts,
over the network, and set no local fallback (`app.scss:1, :11, :23`). This project ships its own
pair (Geist Sans / Geist Mono) and forbids global CSS beyond the reset, so the port keeps the
era's colours, sizes and layout and renders in `font-sans`. Nothing is fetched at runtime; the
`h1`'s identity stays its colour, size and centring.
