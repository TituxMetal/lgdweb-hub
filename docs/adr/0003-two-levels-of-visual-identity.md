# Two isolated levels of visual identity

The shell — list page, cards, `BackToList`, layout — carries the Hub's own identity, built on zinc
surfaces with a single amber accent; each old project re-implements the look of the era it was made
in, because modernization replaces the code and not the identity. The two levels are therefore kept
apart: the shell's tokens are not exposed to features, a feature reads its own tokens in its own
scope, and no global CSS exists beyond the `globals.css` reset. Enforcement is deliberately left to
review: no linter can judge whether a feature's look is faithful to its original.

## Considered options

- **One identity everywhere**, features inheriting the shell's palette — cheaper, and it would
  modernize the look as well as the code, losing what the showroom exists to display.
- **Per-feature arbitrary colour values** (`bg-[#xxx]`) — exact fidelity to the original hexes, at
  the price of a palette system no one can read or keep consistent across nine features.

## Consequences

A feature-local CSS file is acceptable when an original look genuinely needs it (a custom animation
utilities cannot express); otherwise a feature expresses its identity through Tailwind utilities and
its own tokens. The exclusion applies to project features: `home` lives in a feature folder like the
others but *is* the shell's own page, so the shell's tokens are its palette, not a leak. Contrast
minimums apply inside the shell, while a feature's interior is exempt — it preserves its era's
choices, not the shell's.
