# Game of Life palette

Every colour of the 2019 original, read from the frozen archive — its viewer at
`~/archived/webdev/oldProjects/tuximetal-game-of-life/` and the engine that viewer vendored at
`~/archived/webdev/oldProjects/tuximetal-game-of-life-engine/` — with the archived file each one
comes from and the Tailwind default entry it anchors on.

The original had no stylesheet of its own: four colours lived in styled-components templates, and
three named CSS colours (`grey`, `black`, `pink`) sat inside them.

## Method

The nearest entry is computed, never recalled. The default palette of the installed `tailwindcss`
(4.3.0) is read from `node_modules/tailwindcss/theme.css`; every `oklch()` entry is converted to
sRGB through the Oklch-to-linear-sRGB matrices and the transfer function, clipped to the gamut, and
the sRGB colour as rendered is converted to CIELAB (D65). The distance is measured with
**CIEDE2000**, the perceptual metric, and the implementation was checked against the published
CIEDE2000 test vectors (Sharma, Wu and Dalal — all 32 pairs within 0.0002) before any figure here
was written.

| Original colour | Read from | Tailwind entry | Hex | ΔE2000 |
| --- | --- | --- | --- | --- |
| `hsl(0, 0%, 26%)` (`#424242`) — the page plate, `primaryColor` | `~/archived/webdev/oldProjects/tuximetal-game-of-life/src/components/styled/GlobalStyle.js:4` | `neutral-700` | `#404040` | 0.66 |
| `hsl(34, 78%, 91%)` (`#FAEAD6`) — the text, `textColor` | `~/archived/webdev/oldProjects/tuximetal-game-of-life/src/components/styled/GlobalStyle.js:6` | `orange-100` | `#ffedd4` | 1.84 |
| `hsl(21, 100%, 45%)` (`#E65000`) — `secondaryColor`, declared and never used | `~/archived/webdev/oldProjects/tuximetal-game-of-life/src/components/styled/GlobalStyle.js:5` | `orange-600` | `#f54900` | 3.01 |
| `grey` (`#808080`) — the 1px border of every cell | `~/archived/webdev/oldProjects/tuximetal-game-of-life/src/components/Cell.js:9` | `neutral-500` | `#737373` | 5.13 |
| `black` (`#000000`) — a live cell | `~/archived/webdev/oldProjects/tuximetal-game-of-life/src/components/Cell.js:12` | `neutral-900` | `#171717` | 4.58 |
| `pink` (`#FFC0CB`) — a dead cell | `~/archived/webdev/oldProjects/tuximetal-game-of-life/src/components/Cell.js:15` | `rose-200` | `#ffccd3` | 3.49 |
| `pink` (`#FFC0CB`) — the plate's own 1px border | `~/archived/webdev/oldProjects/tuximetal-game-of-life/src/components/styled/Wrapper.js:8` | `rose-200` | `#ffccd3` | 3.49 |

The live cell is the palette's one deliberate non-nearest anchor: `#000000`'s closest non-pure entry
is `neutral-950` (`#0a0a0a`, ΔE 1.59), but `CODING_STANDARDS.md` names `neutral-900` as the black
anchor, and at a 24px cell the two are indistinguishable against the pink — the nearest entry stays
recorded here so the choice is visible rather than assumed.

The dead cell's pink is the palette's widest anchor after the grey: no warm entry lands closer than
`rose-200`, which is a little cooler and paler than the original's `pink` — the paper the grid is
printed on, not the coloured cells that carry the pattern.

## Where each entry is used

- `bg-neutral-700` and `text-orange-100` on the feature's plate: the original's `body` background
  and text, which were the whole page (`GlobalStyle.js:18-26`, colours from `:4-6`).
- `text-orange-100` also carries the toolbar's labels, the speed selector's value and the generation
  counter (`Toolbar.js:15`), and `border-neutral-500` the borders of the buttons and of the speed
  selector — the grey the cells already wore. The generation counter carries no border of its own.
- `border-rose-200` on the plate itself: the original's `Wrapper`, whose whole outline was
  `1px solid pink` (`Wrapper.js:8-9`).
- `text-orange-600`, `border-orange-600`: the secondary colour the original declared and never used
  (`GlobalStyle.js:5`). It marks the two states the original's markup could not show — the
  simulation running, and the torus mode engaged.
- the canvas paints three of the entries in its own scope, each tagged where it is written
  (`lib/canvas.ts`): `#ffccd3` (Tailwind rose-200) as the dead-cell ground, `#171717`
  (Tailwind neutral-900) as a live cell, `#737373` (Tailwind neutral-500) as the cell border.
- `text-neutral-500` on the hint under the plate: the same grey, as the feature's quiet text.

## Where the port departs from the original

- **The viewer's controls are built, not ported.** The original's Play button carried no handler,
  `Toolbar.js` never received `play`/`pause` state, and its `handleCellClick` called
  `game.toggleCellState(...)` — a method the standalone engine never had, so no click ever reached
  it. Start/pause, step, clear, randomize, the speed selector and the torus toggle are all
  additions; the generation counter and the next-generation button are the original's own
  (`Toolbar.js:11-17`).
- **The plate is column-sized, not viewport-sized.** The original measured its board in
  `componentDidMount` and cut `floor(width / 40)` columns out of the window, with
  `height: 100vh` on the plate (`Game.js:47-66`, `Wrapper.js:9`). Inside the shell's column that
  measure means nothing, so the port fixes the board at twenty rows and thirty columns of 24px —
  the 720px a `max-w-3xl` page keeps between its gutters — and the canvas scales the whole board
  down on a phone rather than dropping columns from it. A 1440×900 window held 36 columns at 40px,
  so the strict ratio against a 720px column is 20px cells and 36 columns; the port trades six
  columns for size, which keeps the board filling the column and the cells a phone scales to above
  11px instead of under 10 — drawing by touch needs the larger target. The porting rule this unit
  settled says a viewport-relative value does not survive the move into a column.
- **The title steps down.** The original's `<h1>` was centred at `2.2rem` (`Title.js:3-9`); the
  shell's `Layout` owns the page's `<h1>`, so the feature's title is an `<h2>` at the shell's
  `text-3xl` (30px), 0.85 of the original's 35px — the scale a column asks for.
- **The cells' borders are shared lines.** The original gave every cell its own
  `border: 1px solid grey` (`Cell.js:9`), so adjacent cells showed 2px between them; the canvas
  draws one 1px line per boundary, on the half pixel so it stays crisp. At 24px, half the original's
  40px, the difference is not perceptible, and twice the line count at twice the density would read
  as a grey field rather than a grid.
- **styled-components and its global style are gone.** The reset, the plate and the toolbar are
  Tailwind utilities on the feature's own elements; no global CSS is added, and nothing of the shell
  reaches inside the plate.
- **The era's face was the browser's default.** The original declared no family
  (`GlobalStyle.js:9-26`), so the port renders in the project's `font-sans`, and the counter in
  `font-mono`, as the other ports do.
- **The copy is French.** `Toolbar.js:13-15`'s "Play/pause", "Next" and "Generation: N" are
  "Démarrer"/"Pause", "Suivant" and "Génération : N" here, per this repository's rule that the
  visitor reads French.

## Additions beyond the original

- The loop itself: the original only ever advanced one generation when the visitor pressed Next. The
  port runs the generations on an animation frame at the chosen interval and cancels the frame on
  unmount, so the simulation stops when the visitor leaves.
- The speed selector (four intervals, 40–500ms) and the torus toggle: the engine's `torusMode` was
  reachable only through its API, and the viewer passed `torus` once at construction
  (`App.js:10`), so no visitor could ever switch it.
- Drawing by drag. The original toggled the single cell that was clicked; the port flips the first
  cell and paints every further cell it crosses with that same state, so a stroke draws a shape
  rather than flipping cells back and forth under the pointer — the touch input the original, with
  its mouse-only click, never needed.
- The pattern picker: four shapes a visitor can drop on the board — clignotant (blinker), bloc
  (block), crapaud (toad) and planeur (glider), declared in `lib/patterns.ts` — stamped centred by
  `stampPattern`. The original seeded one glider at construction (`helpers/GameState.js`, reused
  here as the `glider` pattern) and offered no way to place a second shape, so the classic patterns
  the Game of Life is read through were out of reach.
- The hint under the plate, `text-neutral-500`, naming the interactions the canvas does not
  advertise by itself.
