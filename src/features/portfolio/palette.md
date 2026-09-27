# Portfolio palette

Every colour of the 2021 original, read from the frozen archive at
`~/archived/webdev/oldProjects/20210406-portfolio/`, with the archived file each one comes from and
the Tailwind default entry it anchors on.

## Method

The nearest entry is computed, never recalled. The default palette of the installed `tailwindcss`
(4.3.0) is read from `node_modules/tailwindcss/theme.css`; every `oklch()` entry is converted to
sRGB through the Oklch-to-linear-sRGB matrices and the transfer function, clipped to the gamut, and
the **sRGB colour as rendered** is then converted to CIELAB (D65, the standard sRGB matrix and white
point) — the same pipeline a browser applies, so the hex column and the distance column describe the
same colour. The distance is measured with **CIEDE2000** — the perceptual metric, so a colour is
compared to the palette the way the eye compares them; the implementation was checked against the
published CIEDE2000 test vectors (Sharma, Wu and Dalal) before any figure here was written. A
translucent original keeps its alpha on the nearest entry's hex: the table's ΔE is measured on the
opaque colour, since alpha composites against a background rather than naming one.

Two entries fall inside the 1.0 window that counts as a tie:

- a tied **grey** takes the `neutral-*` family, which `CODING_STANDARDS.md` names as the
  repository's stand-in for black and white;
- a tied **hue** stays on the family already mapping the original's other tones of the same ramp,
  since the era's ramp is what the look is made of: `$secondaryLight` is equidistant by eye between
  `amber-500` (4.84) and `orange-400` (5.34), and `orange-400` keeps the three-step orange ramp
  intact where `amber-500` would split it across two families.

| Original colour | Read from | Tailwind entry | Hex | ΔE2000 |
| --- | --- | --- | --- | --- |
| `#1b1b1b` — `$primaryColor`, the body background | `src/assets/scss/_settings.scss:5`, painted at `_common.scss:17`, `:85` | `neutral-900` | `#171717` | 1.26 |
| `#484848` — `$primaryLight`, the footer's credit band | `src/assets/scss/_settings.scss:6`, painted at `_footer.scss:78` | `neutral-700` | `#404040` | 2.67 |
| `#333` (`#333333`) — `$primaryDark`, every plate | `src/assets/scss/_settings.scss:7`, painted at `_profile.scss:5`, `_contact.scss:9`, `_projects.scss:11`, `_skills.scss:29,47` | `neutral-800` | `#262626` | 4.13 |
| `#ff6d00` — `$secondaryColor`, the section headings | `src/assets/scss/_settings.scss:9`, painted at `_common.scss:77` | `orange-500` | `#ff6900` | 1.09 |
| `#ff9e40` — `$secondaryLight`, navigation and body links | `src/assets/scss/_settings.scss:10`, painted at `_common.scss:30,46`, `_menu.scss:49,195` | `orange-400` | `#ff8904` | 5.34 |
| `#c43c00` — `$secondaryDark`, the project links | `src/assets/scss/_settings.scss:11`, painted at `_projects.scss:71` | `orange-700` | `#ca3500` | 1.76 |
| `#fafafa` — `$textColor`, the body text | `src/assets/scss/_settings.scss:13`, painted at `_common.scss:18` | `neutral-50` | `#fafafa` | 0.00 |
| `rgba(0, 0, 0, .9)` — the phone menu's plate | `src/assets/scss/_menu.scss:21` | `neutral-950` at 90% | `#0a0a0a` | 1.59 |
| `rgba(0, 0, 0, .2)` — the hamburger's disc | `src/assets/scss/_menu.scss:64` | `neutral-950` at 20% | `#0a0a0a` | 1.59 |
| `rgba(#1b1b1b, .9)` — the desktop bar's plate | `src/assets/scss/_menu.scss:168` | `neutral-900` at 90% | `#171717` | 1.26 |
| `rgba(#1b1b1b, .2)` — the back-to-top disc | `src/assets/scss/_common.scss:133` | `neutral-900` at 20% | `#171717` | 1.26 |
| `rgba(#fafafa, .4)` — the back-to-top label | `src/assets/scss/_common.scss:135` | `neutral-50` at 40% | `#fafafa` | 0.00 |
| `rgba(#ff9e40, .4)` — the back-to-top ring | `src/assets/scss/_common.scss:141` | `orange-400` at 40% | `#ff8904` | 5.34 |
| `#dadada` — `lighten($primaryColor, 75%)`, a form label at rest | `src/assets/scss/_contact.scss:51` | `neutral-300` | `#d4d4d4` | 1.39 |
| `#949494` — `darken($textColor, 40%)`, the credit band's text | `src/assets/scss/_footer.scss:79,83` | `neutral-400` | `#a1a1a1` | 4.12 |

`#333` carries the grey tie: `neutral-800` sits 4.13 away and `neutral-700` 4.23, so the two plates
are equidistant to the eye and the nearer one wins. The `$primaryDark` plates read as one surface
either way, and `neutral-700` already carries the footer's credit band, which is the lighter of the
original's two secondary surfaces (`#484848` at 2.67) — so the two plates stay told apart.

## Where each entry is used

- `bg-neutral-900` on the feature's canvas — the original's body plate (`_common.scss:17`) — on
  the skills, projects and footer blocks (`_common.scss:80-86`) and, at `bg-neutral-900/90`, on the
  desktop navigation bar (`_menu.scss:168`). The profile and contact blocks carry the original's
  photographs instead of a flat plate.
- `text-neutral-50` on the canvas, so every run of body text and every heading that is not a
  section title keeps the original's text colour (`_common.scss:18`); `bg-neutral-50` on the
  contact fields' resting underline (`_contact.scss:19-30`), and `text-neutral-50/40` on the
  back-to-top disc.
- `text-orange-500` on the four `h2` section titles and the hero's name (`_common.scss:77`,
  `_head.scss:34`), plus `border-orange-500` on the contact button's resting ring
  (`_contact.scss:120`).
- `text-orange-400` on the navigation items, the profile's inline links and the desktop bar's
  hover underline (`_common.scss:30,46`, `_menu.scss:49,195`); `border-orange-400` on the contact
  button's hover ring (`_contact.scss:129`) and, at 40%, on the back-to-top ring; `bg-orange-400`
  on the contact field underline that scales in on focus (`_contact.scss:32-40`).
- `text-orange-700` on the project links (`_projects.scss:71`).
- `bg-neutral-800` on the capability chips and the technology plates (`_skills.scss:29,47`) and, at
  `bg-neutral-800/80`, on the profile and contact plates and each project block
  (`_profile.scss:5`, `_contact.scss:9`, `_projects.scss:11`).
- `bg-neutral-700` on the footer's credit band, `text-neutral-400` on its text
  (`_footer.scss:78-83`).
- `text-neutral-300` on a contact label at rest (`_contact.scss:51`), which is also the note under
  the contact button.
- `bg-neutral-950/90` on the phone menu's plate and `bg-neutral-950/20` on the hamburger's disc
  (`_menu.scss:21,64`).

## The photographs

The original's three section backgrounds — the portrait, the profile's backdrop and the contact
backdrop — and its four project thumbnails plus seventeen technology logos are the archive's own
files, copied byte for byte into `src/features/portfolio/assets/`. An image is content, not a class
string, so each one paints what it always painted; the backgrounds keep the original's `cover`,
`center` and `fixed` treatment (`_head.scss:9-11`, `_common.scss:88-92`, `_common.scss:114-119`) and
the thumbnails keep the circular crop (`_projects.scss:113-124`).

## Fonts

The original fetched `Courgette` for the hero's name and `Nunito` for everything else from Google
Fonts at runtime (`app.scss:2`, `_common.scss:14`, `_head.scss:31`). This project ships its own pair
(Geist Sans / Geist Mono) and forbids global CSS beyond the reset, so the port keeps the era's
colours, its hierarchy and its layout — at the column's scale, not the canvas's, below — and renders
in `font-sans`. Nothing is fetched at runtime; the hero's identity stays its orange, its weight and
its centring.

## Where the port departs from the original

- **The shell owns the page.** The feature renders inside the shell's column instead of bleeding to
  the viewport edges. Viewport-relative widths the original used for its own full-page canvas —
  the technology logos' `20vw`…`11vw`, the profile articles' `45vw`, the project blocks' `45vw`, the
  contact plate's `65vmax`/`50vmax`, the articles' `90vw` — become container-relative (`w-1/3`,
  `w-[45%]`, `max-w-[80%]`, `max-w-[90%]`), which is what keeps them from overflowing a column
  narrower than the viewport.
- **The page's scale is re-derived for the column, never copied from a canvas that was the
  viewport.** The original measured against the whole screen; inside a column those values mean
  something else — at 1440×900 the `h2`'s `10vmin` padding alone took 23% of the column, and the
  profile articles fell from ~420px to 230px. Every viewport unit became the fixed value it stood
  for, and the type scale stepped down by the column-to-canvas ratio (0.8, the shell's 768px column
  against the original's ~980px desktop canvas), with running text floored at 16px:

  | Original | Port | Why |
  | --- | --- | --- |
  | `h2` `padding: 0 10vmin` | `px-8` | the indent was 23% of the column; the title keeps an indent, the text keeps its room |
  | section blocks `padding: 5vmin 0` | `py-9` | 45px at the desktop reference, stepped down |
  | slant plates `height: 4vw` / `bottom: ±2vw` | `h-10` / `translate-y-5` | a fixed plate whose half-height is its own offset, so the two plates keep meeting |
  | the phone menu's `margin: 4vw` | `top-4 right-4` | 4vw is what the button took on the phone, where it is visible |
  | the menu overlay's `100vh`/`100vw` | `h-auto w-auto` | the browser already lays a modal `<dialog>` out fixed and inset; the port only neutralises the intrinsic size and the margins the UA gives it, and no viewport unit is left |
  | `h2` `3rem` (30px) | `text-2xl leading-normal` | 0.8 |
  | `p` `2rem` (20px) | `text-base` | 0.8, and the shell's floor for running text |
  | the card title `1.5em` (24px) | `text-[19px]` | 0.8; keeping 24 would have flattened it against the section titles, and 19px is the one size the default scale has no entry for |
  | the card links `1.2em` (19px) | `text-base` | 0.8, floored |
  | the menu items `1.8rem` (18px) | `text-base` | 0.8, floored |
  | the hero's `3.5rem`/`5rem` and `2.2rem`/`3rem` | `text-[28px]`/`sm:text-[40px]` and `text-lg`/`sm:text-2xl`, each `leading-normal` | 0.8, the hierarchy untouched |
  | the card title's `padding: 1rem 6rem` | `sm:px-12` | 60px stepped down, so the title keeps its room in a 45% card |

  Every other length is written with the canonical utility rather than a bespoke value — `min-h-144`
  for the pomodoro plate, `max-w-20`/`max-w-25`/`max-w-35` for the technology logos, `leading-8`,
  `size-12.5`, `px-7.5`, `h-39.5`, `bottom-1.5`, `border-r-3` — and the two type steps that carry a
  leading of their own (`text-lg`, `text-2xl`) say `leading-normal` to keep the original's
  inherited 1.5, which is what those classes would otherwise tighten. Only the values the default
  scale has no entry for stay bespoke: `19px`, `28px`, `40px`, a `115px` logo,
  `rounded-[3px]`, `leading-[1.4]`/`leading-[1.8]`, `tracking-[1px]`, the `em` paddings the original
  measured in `em`, and the percentage widths above.

  The profile articles keep the `md:45%` they were designed for and drop the `lg:30%` step, which
  was a full-page proportion that left them 230px wide here. **One viewport unit survives, on
  purpose:** the hero's own height, `h-screen`. It is a height and not spacing, it is what makes the
  original's header read as a full-screen introduction rather than a banner, and it does not depend
  on the column's width, so it cannot overflow the way the copied *spacing* did.

  The footer's credit band keeps the original's `0.8em`: it is a credit line, not running text, and
  its proportion is part of the original's footer.
- **A viewport-relative breakpoint.** The original's two-layout split sits at `50em`
  (`_menu.scss:154`) and its type steps at `40em` (`_head.scss:45`); the port uses Tailwind's `md`
  (768px) and `sm` (640px), the nearest defaults, so a breakpoint names a palette entry too.
- **Pseudo-element animations.** The original drew every link's underline as an `::after` growing
  from 0 to 100% width (`_common.scss:48-56`, `_menu.scss:197-210`, `_projects.scss:83-90`). The
  port keeps the hover feedback as `hover:underline`, and gives the navigation's active mark a real
  border element instead of a pseudo-element, since the active state is a new requirement and not a
  port.
- **Font Awesome.** The original loaded Font Awesome's icon font and set a globe or GitHub glyph
  beside each project link (`index.html:293-304`, `_projects.scss:74-80`). The port ships no icon
  font, so the links carry their labels alone.
- **The contact button's stretch.** Kept: `px-[30px] py-[20px]` with a `min-width` transition to
  full width on hover (`_contact.scss:105-131`).

## Additions beyond the original

Behaviours and links that do not exist in the 2021 original — they are the issue's requirements, so
no original colour constrains them:

- **The active-section mark.** The original's menu had no notion of where the reader was; the port
  marks it with the entry already computed for its links (`orange-400`) and `aria-current`.
- **The smooth jump and the URL.** The original's links were plain in-page anchors animated by a
  hand-written easing loop (`smoothScroll.js`); the port uses the platform's smooth scrolling and
  writes the section into the URL, so a section can be linked and reloaded.
- **The note under the contact button.** The original's 2021 rewrite only animated its form and
  registered no submit handler, so nothing was ever delivered — but it never said so. The port says
  it, in `neutral-300`, the label tone the form already uses.
- **The footer's captures of this portfolio** (`SiteFooter.tsx`): the original carried no link to
  itself. The version this page ports and the first version are now one line in the credit band,
  both at `archive.org`, so the page the visitor is reading can be compared with its ancestors.
- **Four retargeted links** (`ProjectsSection.tsx`): the original pointed at `tenchido.fr`,
  `albin.tuxlab.fr`, `tuxtactoe.tuxlab.fr` and `pomodoro.tuxlab.fr`. The first is served by someone
  else today and the other three answer nothing, so each now reaches the author's own version — an
  archived capture — except where the showroom has already ported the project, where the card links
  into the showroom itself (`/projects/tic-tac-toe`, `/projects/pomodoro`). Those two are the
  feature's only in-site links, and they wear no `target`: they navigate in the shell.
