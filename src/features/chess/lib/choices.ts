/**
 * Where the arrow keys move the highlight on a multiple-choice question. The
 * original wired this in `MultipleChoice.tsx:60-78` — a component its live path
 * never rendered, while the question it did render carried no keyboard control at
 * all. The port keeps the question it showed and gives it the keyboard the original
 * had already written.
 */
export const stepChoice = (current: number, delta: number, count: number): number => {
  if (count <= 0) return 0

  return (current + delta + count) % count
}
