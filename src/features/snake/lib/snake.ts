import type { Apple, Cell, Direction, GridSize, Snake } from '../types'

const OPPOSITES: Record<Direction, Direction> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left'
}

// A 180° flip would walk the head into the segment right behind it (instant
// self-collision). Exposed so the input queue in `useSnakeGame` can validate
// each queued direction against the *previous* queued one, not only the
// current snake direction.
export const isReversal = (current: Direction, next: Direction): boolean =>
  OPPOSITES[current] === next

const nextHead = (head: Cell, direction: Direction): Cell => {
  const [x, y] = head
  if (direction === 'left') return [x - 1, y]
  if (direction === 'right') return [x + 1, y]
  if (direction === 'up') return [x, y - 1]
  return [x, y + 1]
}

export const createSnake = (direction: Direction, body: ReadonlyArray<Cell>): Snake => ({
  direction,
  body,
  ateApple: false
})

// `ateApple` is a one-shot flag set by `game.tick` when the head just landed on
// an apple. `advance` consumes it: keep the tail if true (snake grows), else
// pop it (snake moves). The flag is reset to false so growth never compounds.
export const advance = (snake: Snake): Snake => {
  const head = snake.body[0]
  if (head === undefined) return snake

  const next = nextHead(head, snake.direction)
  const body = snake.ateApple ? [next, ...snake.body] : [next, ...snake.body.slice(0, -1)]

  return { direction: snake.direction, body, ateApple: false }
}

export const setDirection = (snake: Snake, next: Direction): Snake => {
  if (OPPOSITES[snake.direction] === next) return snake
  if (snake.direction === next) return snake
  return { ...snake, direction: next }
}

export const hasCollided = (snake: Snake, gridSize: GridSize): boolean => {
  const head = snake.body[0]
  if (head === undefined) return false

  const [x, y] = head
  if (x < 0 || x >= gridSize.width) return true
  if (y < 0 || y >= gridSize.height) return true

  for (let i = 1; i < snake.body.length; i++) {
    const segment = snake.body[i]
    if (segment === undefined) continue
    if (segment[0] === x && segment[1] === y) return true
  }

  return false
}

export const isEatingApple = (snake: Snake, apple: Apple): boolean => {
  const head = snake.body[0]
  if (head === undefined) return false
  return head[0] === apple.position[0] && head[1] === apple.position[1]
}
