import type { GameState } from '../types'

// Half-pixel offset (+ 0.5) on integer coordinates keeps 1px lines crisp:
// without it, canvas spreads the stroke across two physical pixels and the
// grid looks blurry / 2px thick.
const drawGrid = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  blockSize: number
): void => {
  ctx.strokeStyle = '#171717' // Tailwind neutral-900
  ctx.lineWidth = 1
  ctx.beginPath()
  for (let x = blockSize; x < width; x += blockSize) {
    ctx.moveTo(x + 0.5, 0)
    ctx.lineTo(x + 0.5, height)
  }
  for (let y = blockSize; y < height; y += blockSize) {
    ctx.moveTo(0, y + 0.5)
    ctx.lineTo(width, y + 0.5)
  }
  ctx.stroke()
}

const drawWatermark = (
  ctx: CanvasRenderingContext2D,
  score: number,
  width: number,
  height: number
): void => {
  ctx.fillStyle = '#404040' // Tailwind neutral-700
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = '900 144px sans-serif'
  ctx.fillText(String(score), width / 2, height / 2)
}

const drawSnake = (
  ctx: CanvasRenderingContext2D,
  body: GameState['snake']['body'],
  blockSize: number
): void => {
  const inset = 1
  for (const [x, y] of body) {
    const px = x * blockSize
    const py = y * blockSize
    ctx.fillStyle = '#60a5fa' // Tailwind blue-400
    ctx.fillRect(px + inset, py + inset, blockSize - inset * 2, blockSize - inset * 2)
    ctx.strokeStyle = '#171717' // Tailwind neutral-900
    ctx.lineWidth = 1
    ctx.strokeRect(
      px + inset + 0.5,
      py + inset + 0.5,
      blockSize - inset * 2 - 1,
      blockSize - inset * 2 - 1
    )
  }
}

const drawApple = (
  ctx: CanvasRenderingContext2D,
  position: GameState['apple']['position'],
  blockSize: number
): void => {
  const [x, y] = position
  const cx = x * blockSize + blockSize / 2
  const cy = y * blockSize + blockSize / 2
  ctx.fillStyle = '#a3e635' // Tailwind lime-400
  ctx.beginPath()
  ctx.arc(cx, cy, blockSize / 2 - 2, 0, Math.PI * 2)
  ctx.fill()
}

const drawGameOver = (ctx: CanvasRenderingContext2D, width: number, height: number): void => {
  ctx.fillStyle = 'rgba(23, 23, 23, 0.7)' // Tailwind neutral-900 at 70%
  ctx.fillRect(0, 0, width, height)

  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = '#d4d4d4' // Tailwind neutral-300
  ctx.strokeStyle = '#171717' // Tailwind neutral-900
  ctx.lineWidth = 3

  ctx.font = '900 70px sans-serif'
  ctx.strokeText('Game Over', width / 2, height / 2 - 12)
  ctx.fillText('Game Over', width / 2, height / 2 - 12)

  ctx.font = '500 26px sans-serif'
  ctx.strokeText('Press Space or Restart', width / 2, height / 2 + 50)
  ctx.fillText('Press Space or Restart', width / 2, height / 2 + 50)
}

export const drawFrame = (
  ctx: CanvasRenderingContext2D,
  state: GameState,
  blockSize: number
): void => {
  const width = state.gridSize.width * blockSize
  const height = state.gridSize.height * blockSize

  ctx.fillStyle = '#262626' // Tailwind neutral-800
  ctx.fillRect(0, 0, width, height)

  drawGrid(ctx, width, height, blockSize)
  drawWatermark(ctx, state.score, width, height)
  drawApple(ctx, state.apple.position, blockSize)
  drawSnake(ctx, state.snake.body, blockSize)

  if (state.status === 'over') drawGameOver(ctx, width, height)
}
