# Chess palette

Every colour the 2025 original painted, read from the frozen archive at
`~/archived/webdev/labo/20250928-vite-react-chess-game-learning/`, with the archived file and line
each one comes from and the Tailwind default entry it anchors on.

The original wrote its look in Tailwind classes — in its components, and for the three screens it
also owned, in an `@apply`-based stylesheet (`src/index.css`). Most rows below are therefore the class
the original wrote, measured against the same class in this project's palette; the six values it
spelled out as hex, inside that stylesheet, resolve to the entries of the same names.

## Method

The nearest entry is computed, never recalled. The default palette of the installed `tailwindcss`
(4.3.0) is read from `node_modules/tailwindcss/theme.css`; every `oklch()` entry is converted to
sRGB through the Oklch-to-linear-sRGB matrices and the transfer function, clipped to the gamut, and
the sRGB colour as rendered is converted to CIELAB (D65). The distance is measured with
**CIEDE2000**, the perceptual metric; the implementation was checked against the supplementary test
data of Sharma, Wu and Dalal — all 34 pairs, with a worst deviation of 0.00005 — before any figure here
was written.

Where the original wrote a class, this project's palette holds the same step: the class resolves to
the same colour in both Tailwinds, and the row reads 0.00. The six values it spelled out as hex —
`#e4e4e7`, `#f4f4f5`, `#e2e8f0`, `#f1f5f9`, `#f8fafc`, `#cbd5e1`, all of them the chapter text's —
are the same steps' sRGB values: five land on this project's entries exactly, and the sixth,
`#cbd5e1`, is Tailwind v3's `slate-300` where the installed palette's is `#cad5e2`, 0.47 away. The
feature's stylesheet writes the entries, so that one difference is a step of the same ramp rather
than a colour the eye separates.

| Original colour | Read from | Tailwind entry | Hex | ΔE2000 |
| --- | --- | --- | --- | --- |
| `bg-zinc-800` — the chapter plate, the question card and its feedback box, the entry cards, the progress track, the completion stats plate, the neutral and disabled buttons | `src/index.css:23-25` (`.chapter-container`), `src/components/QuestionComponent.tsx:46,97`, `src/pages/HomePage.tsx:40,46,52`, `src/components/ProgressBar.tsx:18`, `src/index.css:84-86` (`.card-stats`), `src/components/Button.tsx:25,28` | `zinc-800` | `#27272a` | 0.00 |
| `border-zinc-700` — every plate's edge, the progress tracks, the question's feedback box, the completion screen's divider | `src/index.css:23`, `src/components/QuestionComponent.tsx:46,97`, `src/pages/CompletionPage.tsx:109,127`, `src/components/ProgressBar.tsx:18` | `zinc-700` | `#3f3f46` | 0.00 |
| `bg-zinc-700` — the secondary button, and the completion screen's progress track | `src/components/Button.tsx:27`, `src/pages/CompletionPage.tsx:109` | `zinc-700` | `#3f3f46` | 0.00 |
| `hover:bg-zinc-600` / `hover:border-zinc-600` — the hover of the neutral and secondary buttons, and of a choice | `src/components/Button.tsx:27,28`, `src/components/QuestionComponent.tsx:62` | `zinc-600` | `#52525c` | 0.00 |
| `bg-zinc-900` — the page behind every screen, and the button focus ring's offset | `src/pages/HomePage.tsx:12`, `src/components/StoryViewer.tsx:81`, `src/components/Button.tsx:21` | `zinc-900` | `#18181b` | 0.00 |
| `bg-zinc-950` — the loading plate, and the near end of the completion screen's gradient | `src/index.css:6-8` (`.loading-container`), `src/index.css:55-57` (`.completion-background`) | `zinc-950` | `#09090b` | 0.00 |
| `text-zinc-100` — the chapter title, the question prompts, the correct choice's label, the completion's subtitle, the entry's heading and card titles | `src/index.css:27-29` (`.chapter-title`), `src/components/QuestionComponent.tsx:47,61,66`, `src/index.css:75-78` (`.completion-subtitle`), `src/pages/HomePage.tsx:19,42` | `zinc-100` | `#f4f4f5` | 0.00 |
| `text-zinc-200` — the secondary and neutral button labels, and the choice's resting label | `src/components/Button.tsx:27,28`, `src/components/QuestionComponent.tsx:62` | `zinc-200` | `#e4e4e7` | 0.00 |
| `text-zinc-300` — the progress bar's two labels, the entry's description, the completion's body text and counters, the chapter's loading words, the choice's explanation | `src/components/ProgressBar.tsx:13,16`, `src/pages/HomePage.tsx:24`, `src/pages/CompletionPage.tsx:70,99,105`, `src/index.css:18-20` (`.loading-text`), `src/components/QuestionComponent.tsx:101,113` | `zinc-300` | `#d4d4d8` | 0.00 |
| `text-zinc-400` — the entry cards' lines, the completion's last line, the choice's wrong label | `src/pages/HomePage.tsx:43`, `src/pages/CompletionPage.tsx:73`, `src/components/QuestionComponent.tsx:70` | `zinc-400` | `#a1a1aa` | 0.00 |
| `text-zinc-500` — the disabled button's label | `src/components/Button.tsx:25` | `zinc-500` | `#71717b` | 0.00 |
| `bg-amber-700` / `hover:bg-amber-600` / `text-amber-100` — the primary button | `src/components/Button.tsx:26` | `amber-700`, `amber-600`, `amber-100` | `#bb4d00`, `#e17100`, `#fef3c6` | 0.00 |
| `bg-amber-600` — the progress bar's fill | `src/components/ProgressBar.tsx:20`, `src/index.css:117-120` (`.progress-bar-dynamic`) | `amber-600` | `#e17100` | 0.00 |
| `ring-amber-500` — the button's focus ring | `src/components/Button.tsx:21` | `amber-500` | `#fe9a00` | 0.00 |
| `bg-emerald-900` / `border-emerald-700` / `text-emerald-300` — the correct choice, and the sentence "✓ Correct" | `src/components/QuestionComponent.tsx:66,101` | `emerald-900`, `emerald-700`, `emerald-300` | `#004f3b`, `#007a55`, `#5ee9b5` | 0.00 |
| `border-emerald-500` — the correct move's status edge, from the `green-500` the original used there | `src/features/questions/components/MoveStatusSection.tsx:29` | `emerald-500` | `#00bc7d` | the original's `green-500` sits 9.63 away; the emerald the question itself wears is nearer, see the departures |
| `border-red-500` / `text-red-300` — the wrong move's status edge and title | `src/features/questions/components/MoveStatusSection.tsx:29-30,37` | `red-500`, `red-300` | `#fb2c36`, `#ffa2a2` | 0.00 |
| `text-red-400` — the field's refusal, and the wrong choice's state | `src/features/questions/components/KeyboardInputSection.tsx:55` | `red-400` | `#ff6467` | 0.00 |
| `bg-linear-to-br from-zinc-950 via-zinc-900 to-zinc-800` — the completion screen's plate | `src/index.css:55-57` (`.completion-background`) | `zinc-950`, `zinc-900`, `zinc-800` | `#09090b`, `#18181b`, `#27272a` | 0.00 |
| `from-green-400 to-blue-500` — the completion screen's "Bravo !" | `src/index.css:71-73` (`.completion-title`) | `green-400`, `blue-500` | `#05df72`, `#2b7fff` | 0.00 |
| `from-green-500 to-blue-500` — the completion screen's progress fill | `src/index.css:102-105` (`.progress-bar-success`) | `green-500`, `blue-500` | `#00c950`, `#2b7fff` | 0.00 |
| `text-blue-400` — the completed-chapter count, and the chapter loading spinner | `src/pages/CompletionPage.tsx:98`, `src/index.css:14-16` (`.loading-spinner`) | `blue-400` | `#51a2ff` | 0.00 |
| `text-purple-400` — the progress percentage | `src/pages/CompletionPage.tsx:102` | `purple-400` | `#c27aff` | 0.00 |
| `text-slate-300` (`#cbd5e1`) — the chapter's paragraphs, the tone that took effect over `.prose-enhanced`'s | `src/index.css:161` (`.prose-invert p`) | `slate-300` | `#cad5e2` | 0.47 |
| `text-slate-50` (`#f8fafc`) — strong text in the chapter | `src/index.css:165` (`.prose-invert strong`) | `slate-50` | `#f8fafc` | 0.00 |
| `text-slate-200` (`#e2e8f0`) — emphasis in the chapter | `src/index.css:169` (`.prose-invert em`) | `slate-200` | `#e2e8f0` | 0.00 |
| `text-slate-100` (`#f1f5f9`) — the chapter's heading, the decision that took effect over `.prose-enhanced`'s `#f4f4f5` | `src/index.css:151-158` (`.prose-invert h1-h6`), overridden value at `:37-39` | `slate-100` | `#f1f5f9` | 0.00 |

One row records the shell rather than the installed default: the `zinc-400` row's hex is `#a1a1aa`
because this project's `@theme` pins `--color-zinc-400` there (`src/styles/globals.css:5`) — the
Tailwind v3 step the original wrote, where the installed palette's default has since moved to
`#9f9fa9`. The row's hex is what this project paints, and it is the original's value exactly.

The chapter's text took two blocks of the original's stylesheet at once: `.prose-enhanced` set
`#e4e4e7` on everything, and `.prose-invert` — declared later, for the same elements — set
`#cbd5e1` on paragraphs, `#f8fafc` on strong text, `#e2e8f0` on emphasis and `#f1f5f9` on headings.
Both carried `!important`, so the later block is what a visitor read: the port keeps those five
decisions and not the ones they overrode.

## The board's own colours

The archive never wrote the board's two square colours: `src/entities/chessboard/ChessBoard.tsx:59-69`
configured the renderer with a radius and a shadow and nothing else, so the light and dark squares are
`react-chessboard`'s own defaults — `#f0d9b5` and `#b58863`, the classic board. The port renders on
the same library and leaves them where they are; the nearest entries are recorded for the record:

| Original colour | Read from | Tailwind entry | Hex | ΔE2000 |
| --- | --- | --- | --- | --- |
| `#f0d9b5` — the light squares | `react-chessboard@5.12.1`, `defaultLightSquareStyle` | `orange-200` | `#ffd6a7` | 5.49 |
| `#b58863` — the dark squares | `react-chessboard@5.12.1`, `defaultDarkSquareStyle` | `yellow-600` | `#d08700` | 13.77 |

The shadow the original framed the board with (`ChessBoard.tsx:67`) is written as `neutral-950` at
50% — `0 2px 10px rgba(10, 10, 10, 0.5)`, tagged `// Tailwind neutral-950 at 50%` in the code — the
nearest non-pure neighbour to the pure black the original wrote, since a board's shadow is not a
surface the palette decides.

## Where each entry is used

- `bg-zinc-800`, `border-zinc-700` and `rounded-lg` on the chapter plate, `p-6` under `sm` and the
  original's `p-12` above it, and `mb-10` under it: `.chapter-container` (`src/index.css:23-25`), the
  plate the chapter's title, text, board and question all sit on.
- The chapter's title, paragraphs, strong text and emphasis come from the stylesheet this feature
  carries (`src/features/chess/chess.css`) — the one place a class cannot be written, since
  react-markdown produces those elements.
- `bg-zinc-800`/`border-zinc-700`/`text-zinc-100`/`text-zinc-300`/`text-zinc-400` on the entry
  screen: the original's `main`, heading, description and three cards
  (`src/pages/HomePage.tsx:12-56`), minus its page background and its `100vh`.
- the three button tones on every button and on the links that navigate: `Button.tsx:21-28`.
- `text-zinc-300`/`bg-zinc-800`/`bg-amber-600` on the progress bar: `ProgressBar.tsx:13-20`.
- `bg-zinc-800`/`border-zinc-700`/`text-zinc-100` on the question card, `bg-emerald-900`,
  `border-emerald-700`, `text-emerald-300` on the right answer and `bg-amber-600` on the progress
  fill: `QuestionComponent.tsx:46-113`.
- `border-emerald-500`/`border-red-500`/`text-red-300`/`text-red-400` on the move question's status
  and its field: `MoveStatusSection.tsx:29-37`, `KeyboardInputSection.tsx:55`.
- the completion screen: the gradient plate (`index.css:55-57`), the gradient title
  (`:71-73`), `text-zinc-100` for the story's name (`:75-78`), `text-zinc-300`/`text-zinc-400` for
  its two paragraphs (`CompletionPage.tsx:70,73`), `text-blue-400`/`text-purple-400` for the two
  counters (`:98,102`) and `bg-zinc-700` over `from-green-500 to-blue-500` for the progress
  (`:109`, `index.css:102-105`).
- `blue-400` alone also draws the loading spinner (`index.css:15-17`), shown while a chapter's text
  is on its way.

The shell's own amber belongs to the shell: the `← Retour` link at the top of each screen is
`BackToList` from `src/components/`, not an element of this era (`text-amber-400` on it is the
shell's accent, and the shell's palette records it).

## Fonts

The original declared no face at all — its `index.html` loads no webfont and its stylesheet names no
family — so its era's face was the browser's default sans. The port renders in the project's
`font-sans`, as the other ports whose original declared nothing do, and nothing is fetched at
runtime.

## Where the port departs from the original

- **The shell owns the page.** The original was the whole page: `min-h-screen` plates painted
  `bg-zinc-900` (`HomePage.tsx:12`, `StoryViewer.tsx:81`), a `container mx-auto max-w-4xl` column,
  and a full-viewport gradient behind the completion screen (`index.css:55-57`). Inside the shell the
  feature fills the shell's column, so those page-level shells are gone and the completion gradient
  is a panel in the column — the porting rule this unit settled, as for the other old projects.
- **The chapter plate's padding steps down on a phone.** `p-12` is 48px a side; against the shell's
  24px gutters that leaves a 390px screen 246px of text, so the plate is `p-6` under `sm` and the
  original's `p-12` above it.
- **The chapter text keeps a paragraph rhythm.** The original's `prose` classes needed
  `@tailwindcss/typography`, which its `package.json` never declared — so what its stylesheet called
  `prose` did nothing, Tailwind's reset took the paragraphs' margins away, and the story read as one
  block. The port keeps the colours and the line-height that did take effect and gives the paragraphs
  their space back (`chess.css`).
- **The chapter's title is written once.** The original rendered the chapter's frontmatter title in its
  own `.chapter-title` element and then the same sentence again, because every chapter file opens on
  its own `## ` heading and the original rendered that too. The port renders the file as written, and
  the stylesheet sets that heading in the era's hand (`text-3xl`, semibold, `zinc-100`, `mb-10`).
- **The move sections wear the question's palette, in French.** The original's `MoveBasedQuestion`,
  `KeyboardInputSection` and `MoveStatusSection` carried a second palette — `gray-*` and `white`,
  `blue-500`/`blue-400` for the field's focus, `green-*` and `red-*` in `light dark:` pairs — beside
  the zinc and amber the question they belonged to actually wore, and their labels and messages were
  English ("Or enter move in algebraic notation", "Submit Move", "Try Again", "You played: …"). The
  port gives them the question's tones (zinc, `emerald-*`, `red-*`, amber for the focus) and writes
  them in French, per this repository's rule that the visitor reads French.
- **A choice's padding is written once.** The original declared each choice's own plate and `p-4` and
  passed them to a `Button` whose base also carried padding; both landed in the class attribute, and
  the stylesheet's own order — ascending within a utility — gave the base the last word. The port
  writes the choice's padding on the choice. Its retry button takes the base size for the same reason:
  the original's smaller override never took effect.
- **The picked-but-unjudged choice has no colour.** The original's `bg-amber-900 border-amber-700`
  branch stood for a state it could not reach — the click that picked a choice showed its feedback in
  the same update — so the port has the resting, the correct and the wrong states only.
- **An impossible position falls back to the starting position.** The original meant to
  (`ChessBoard.tsx:33-40`) but tested for six space-separated fields rather than asking the engine, so
  its content carried positions no board can draw — two black kings
  (`04-essential-tactics/01-fork-attack`), none (`05-basic-endgames/01-king-queen-vs-king`,
  `05-basic-endgames/02-king-rook-vs-king`) — and others whose move the position made illegal. The port
  asks the engine, and the content that shipped with that guess is repaired: no chapter names a
  position the engine refuses, which the index spec asserts by counting the fallbacks at zero.
- **A move the rules refuse stays where it was.** The original answered the renderer `true` for
  everything a visitor dropped and left the parent to put an illegal piece back; the port asks the
  engine first and returns the piece when the move is not legal.
- **The two blocks that never rendered are not ported.** The completion screen's "Ce que vous avez
  appris" list needed a story to declare `keyConcepts`, which none of them did (`src/stories/index.json`
  has no such field), and its question score needed a question result to be recorded, which nothing
  recorded. Both were dead code, so the port carries neither.
- **The progress lives and dies with the feature.** The original's `progressStore` was a module
  singleton: progress survived leaving the game and coming back, and only a reload cleared it. The
  port keeps the chapters a visit got through in the feature's own state, so leaving the game releases
  them — which is what this unit asks of a feature's open resources.
- **The pulsing stats card is kept.** The original's `.animate-slide-in-1/2/3` each applied
  `animate-pulse` (`index.css:89-99`), whatever their names promised, and two of the three classes
  were on the completion screen. The port keeps the pulse it actually had.
- **A path the feature does not answer for says so.** The original's router had no catch-all and drew
  an empty page; under the branch, the feature answers with the shell's not-found shape. A chapter the
  index does not hold answers with the state the original showed for a chapter it could not load — in
  French, and with the two ids it names.

## Additions beyond the original

- **The feature's own sub-routing.** The central map mounts the feature for anything under
  `/projects/chess`, and the feature reads the rest of the path itself: the original's entry, chapter
  and completion URLs are addressable again, shareable and reloadable, and the central map knows
  nothing about them.
- **The keyboard on the question.** Arrow keys move a highlight between the choices and Enter picks
  one — the keyboard the original had written in `features/questions/MultipleChoice.tsx:60-78`, a
  component its live path never rendered, while the question it did render took clicks only. It is the
  one resource this feature opens and closes: the listener is removed when the question is answered
  and when the screen unmounts.
- **The highlight ring on a choice** (`ring-amber-400`, offset `zinc-800`): the picked state the
  keyboard needs to be visible, in the era's amber. The original's `MultipleChoice` marked the
  keyboard's position with `ring-2 ring-blue-400`, a colour from the palette it never wore.
- A chapter whose text cannot be loaded says so in the plate, rather than leaving the visitor on the
  spinner the original would have left them on.
