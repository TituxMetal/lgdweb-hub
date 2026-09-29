# Tetris palette

Every colour of the 2018 original, read from the source repository
`github.com/TituxMetal/tetrisGame` at `74c8197` — the archive holds no `tetrisGame` copy, so the
file and line below name the repository's own tree — with the file each one comes from and the
Tailwind default entry it anchors on.

## Method

The nearest entry is computed, never recalled. The default palette of the installed `tailwindcss`
(4.3.0) is read from `node_modules/tailwindcss/theme.css`; every `oklch()` entry is converted to
sRGB through the Oklch-to-linear-sRGB matrices and the transfer function, clipped to the gamut, and
the sRGB colour as rendered is converted to CIELAB (D65). The distance is measured with
**CIEDE2000**, the perceptual metric; the implementation was checked against the supplementary test
data of Sharma, Wu and Dalal — a sample of the published pairs, worst deviation 0.00004 — before
any figure here was written. Two entries within 1 of each other count as a tie, and a tied grey
takes the `neutral-*` family, which `CODING_STANDARDS.md` names as the repository's stand-in for
black and white.

| Original colour | Read from | Tailwind entry | Hex | ΔE2000 |
| --- | --- | --- | --- | --- |
| `#222` — body background | `dist/app.css:7` | `neutral-800` | `#262626` | 1.26 |
| `#444` — the field, painted over the canvas before the cells | `client/modules/Tetris.js:27` | `neutral-700` | `#404040` | 1.33 |
| `#707070` — `canvas` border, 2px | `dist/app.css:33` | `neutral-500` | `#737373` | 1.18 |
| `#eee` — `.player.local canvas` border, which overrides it for the local player | `dist/app.css:18-20` | `neutral-100` | `#f5f5f5` | 1.46 |
| `#bbb` — the `h1` carrying the score | `dist/app.css:22-29` (the colour at `:24`) | `neutral-300` | `#d4d4d4` | 6.22 |
| `#FFE138` — colour 6, the **I** piece | `client/modules/Piece.js:10,19-24` | `yellow-300` | `#ffdf20` | 1.26 |
| `#0DC2FF` — colour 2, the **J** piece | `client/modules/Piece.js:6,26-31` | `sky-400` | `#00bcff` | 2.24 |
| `#0DFF72` — colour 3, the **L** piece | `client/modules/Piece.js:7,32-37` | `green-400` | `#05df72` | 7.46 |
| `#3877FF` — colour 7, the **O** piece | `client/modules/Piece.js:11,38-42` | `blue-500` | `#2b7fff` | 3.27 |
| `#FF8E0D` — colour 5, the **S** piece | `client/modules/Piece.js:9,43-48` | `orange-400` | `#ff8904` | 1.43 |
| `#FF0D72` — colour 1, the **T** piece | `client/modules/Piece.js:5,49-54` | `pink-600` | `#e60076` | 6.59 |
| `#F538FF` — colour 4, the **Z** piece | `client/modules/Piece.js:8,55-60` | `fuchsia-500` | `#e12afb` | 4.34 |

The colour table is the original's own, indexed by the value its `createPiece` grids carried: the
long piece carried 6 and the T carried 1, so the yellow belongs to the I and the pink to the T,
against the usual convention. Both the piece shapes and those indices are kept, so a player of the
original finds the same seven pieces in the same seven colours.

The local player's border is a tie, as `#eee` is a light grey: `taupe-100` (`#f3f1f1`, 1.23),
`zinc-100` (`#f4f4f5`, 1.38), `mist-100` (1.38) and `neutral-100` (`#f5f5f5`, 1.46) all sit within
1 of the nearest, so the repository's grey rule takes the `neutral-*` family. The score's `#bbb` is
a tie too (`stone-300` 6.32 behind `neutral-300`'s 6.22) and resolves the same way.

## Where each entry is used

- `bg-neutral-800` on the feature's plate (`components/Tetris.tsx`): the original's `body`, which
  was the whole page. The plate is column-sized rather than viewport-sized — the shell owns the page
  — and on a desk it takes that column whole, as the original's body did; the field inside it is
  sized against the height the page can spare, which is the measure the original's `90vh` took.
- `bg-neutral-700` on the field and on the preview's box (`components/Board.tsx`,
  `components/NextPiecePreview.tsx`): the fill the original laid down before drawing the cells.
- `border-neutral-100` on the field, 2px: the local player's `#eee` outline. The base `#707070` is
  the same rule before `.player.local` overrides it, and the port renders the local player alone, so
  `neutral-500` carries no surface here; it is spent instead on the pause button's border and on the
  quiet text (`text-neutral-500`) under the plate and on the « Suivant » label — the one grey the
  original had outside the two surfaces.
- The seven `bg-*` entries on the falling piece and on the cells it leaves in the stack
  (`lib/pieces.ts` → `PIECE_CLASSES`, read by `Board.tsx` and `NextPiecePreview.tsx`).
- `text-neutral-300` on the score: the original's `h1`, which held the score. The plate's status
  copy and the overlay's action button add `text-neutral-50` and `neutral-800/90` (the plate grey,
  over the field) from the repository's white and black anchors, and the button under them takes
  `text-neutral-900` on `bg-neutral-100`: the overlay has no original, so it is built from the two
  anchors `CODING_STANDARDS.md` names plus the plate's own grey.
- The port's own controls take the rest of the greys the same way: `text-neutral-100` on the title
  and the pad's glyphs (the field's border colour, read as ink), `hover:bg-neutral-600` and
  `active:bg-neutral-500` on the pad's pressed states, and `hover:bg-neutral-300` on the overlay's
  action button.

## Where the port departs from the original

- **The board is a grid of elements, not a canvas.** The port renders it as one element per cell, so
  the original's `context.fillRect` drawing (`Tetris.js:26-43`) becomes a cell with a
  Tailwind entry. The field is still 12 × 20 in a 3/5 box, and a phone still measures it as a share
  of the plate's width, capped in rem, so it stands whole in the portrait column with both pad rows
  under it. From `lg` it measures the viewport instead, the way the original's `90vh` did: its
  height is `100vh` less the 30rem the page's chrome and the plate's own score row and pad take,
  floored at 20rem so a short window cannot collapse it and capped at 44rem — the field and the
  panel that holds it are one width, which the plate decides is the whole column or, with two
  players, half of it (`components/PlayerPanel.tsx`).
- **The scoring rule is reproduced, and the reading of it is not.** The original added
  `rowCount * 10` and incremented `rowCount` per cleared row (`Arena.js:48-69`), so one, two, three
  and four rows score 10, 30, 60 and 100 — cumulative, not the flat 10, 20, 30, 40 a per-row count
  would give. The port keeps the cumulative figures.
- **The drop has a floor.** The original subtracted the swept score from `dropInterval` with nothing
  underneath (`Player.js:29`), so a long game reached an interval of zero and the piece fell a row
  per frame; the port stops at 100ms, a tenth of the starting second.
- **The queue is a bag, not a shuffle.** `Piece.getRandomPiece` (`Piece.js:64-77`) pulled
  `Math.random()` twice over a shrinking pool and could deal the same tetromino twice in a row; the
  port deals the seven in a shuffled bag, which is the only rule that departs from the original by
  design.
- **A full top row clears too.** The original's `sweep` scanned rows 19 down to 1 (`Arena.js:52`) and
  never row 0, so a filled first row stayed there for good. The port sweeps all twenty rows: the
  off-by-one was a slip, not a rule to keep.
- **The turn pivots on the grid, as the original's did.** `rotateMatrix` transposed the piece's
  square grid and read it back in place (`Player.js:90-108`), so piece content that does not sit at
  the grid's centre shifts by a row or a column on the way round, and the wall kick reaches for the
  first sideways offset that leaves room. That is kept: the shapes, the offsets and the resulting
  play are the original's.
- **The wall kick is bounded.** The original walked its offsets `1, -2, 2, -3, …` until they passed
  the piece's width (`Player.js:76-85`); the port tries `0, +1, -1, +2, -2` and stops, so a turn that
  fits nowhere leaves the piece as it was instead of walking on.
- **A game over is shown.** The original's `reset` found the collision itself and silently cleared
  the arena, zeroed the score and dropped a new piece (`Player.js:57-64`). The port stops the game,
  says « Partie terminée » and offers a restart.
- **The copy is French.** The original's `h1` read `Score: N` (`dist/index.html:14`); the port labels the
  score, the preview, the pad's five buttons and the three overlay states in French, per this
  repository's rule that the visitor reads French.

## Additions beyond the original

- The hard drop: the original had none — its down arrow was `Player.drop()`, one row at a time
  (`main.js:23-25`) — and the port's Space key and ⤓ button drop the piece to the stack in one move,
  scoring nothing extra.
- The next-piece preview. The original showed the falling piece and the score alone
  (`dist/index.html:12-17`); the port previews the head of the queue, drawn in the colour it will
  fall in, in the orientation it will enter in.
- The virtual pad. The original bound the keyboard only; the port puts left, right, turn, soft
  drop and hard drop on screen at every width, with the keyboard live beside them.
- The score keeps the original's place and colour, not its shape. The original's centred `h1` read
  `Score: N` (`dist/index.html:14`, `dist/app.css:22-29`); the port labels the score and sets the
  number under it in the mono face, in the `neutral-300` the `h1` carried.
- A start gate and a titled field. The original started its loop on load (`main.js:9`); the port
  waits for the visitor (« Prêt ? ») before a piece falls, and titles the field « Tetris » the way
  every showroom feature titles its own.
- The pause. The original's `p` stopped its animation frame and started it again (`Tetris.js:45-53`)
  and said nothing on screen; the port names the state on the overlay and hands the same toggle to a
  button next to the title.
