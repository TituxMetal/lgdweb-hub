import { CellState, type Grid, type GridSize } from '../types'

/** The original measured its 40px cells against the viewport; the column re-derives them. */
export const CELL_SIZE = 24

// The original's own colours, as Tailwind entries — the mapping is computed in
// `palette.md`: dead `pink` → rose-200, alive `black` → neutral-900, the `grey`
// cell border → neutral-500.
const DEAD_CELL = '#ffccd3' // Tailwind rose-200
const LIVE_CELL = '#171717' // Tailwind neutral-900
const CELL_BORDER = '#737373' // Tailwind neutral-500

/** The board as the original drew it: a ground of dead cells, the live ones filled, one grey line per boundary. */
export const paintGrid = (
  ctx: CanvasRenderingContext2D,
  grid: Grid,
  { rows, cols }: GridSize
): void => {
  const width = cols * CELL_SIZE
  const height = rows * CELL_SIZE

  ctx.fillStyle = DEAD_CELL // Tailwind rose-200
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = LIVE_CELL // Tailwind neutral-900
  for (let row = 0; row < rows; row++) {
    const cells = grid[row]
    if (cells === undefined) continue

    for (let col = 0; col < cols; col++) {
      if (cells[col] === CellState.alive) {
        ctx.fillRect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE)
      }
    }
  }

  // The original bordered every cell in grey; drawn here as one shared 1px line
  // per boundary rather than two touching borders, on the half pixel so it stays
  // crisp instead of blurring across two physical pixels.
  ctx.strokeStyle = CELL_BORDER // Tailwind neutral-500
  ctx.lineWidth = 1
  ctx.beginPath()
  for (let col = 0; col < cols; col++) {
    const x = col * CELL_SIZE + 0.5
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
  }
  for (let row = 0; row < rows; row++) {
    const y = row * CELL_SIZE + 0.5
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
  }
  // The far edges would otherwise sit half a pixel outside the canvas.
  ctx.moveTo(width - 0.5, 0)
  ctx.lineTo(width - 0.5, height)
  ctx.moveTo(0, height - 0.5)
  ctx.lineTo(width, height - 0.5)
  ctx.stroke()
}
