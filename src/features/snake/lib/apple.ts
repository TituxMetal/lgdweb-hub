import type { Apple, Cell, GridSize, Snake } from '../types'

const MAX_RETRIES = 1000

const isOnSnake = (snake: Snake, x: number, y: number): boolean => {
  for (const segment of snake.body) {
    if (segment[0] === x && segment[1] === y) return true
  }
  return false
}

export const createApple = (position: Cell): Apple => ({ position })

// Two-stage placement:
// 1. Bounded random retry — cheap and always wins when the snake is small.
// 2. Linear scan fallback — guarantees termination when the snake fills most
//    of the grid (theoretical, but cleaner than an unbounded loop).
// If the grid is entirely full, returning [0,0] is fine: the next tick will
// detect the self-collision and end the game.
export const placeApple = (
  gridSize: GridSize,
  snake: Snake,
  rng: () => number = Math.random
): Apple => {
  for (let i = 0; i < MAX_RETRIES; i++) {
    const x = Math.floor(rng() * gridSize.width)
    const y = Math.floor(rng() * gridSize.height)
    if (!isOnSnake(snake, x, y)) return createApple([x, y])
  }

  for (let y = 0; y < gridSize.height; y++) {
    for (let x = 0; x < gridSize.width; x++) {
      if (!isOnSnake(snake, x, y)) return createApple([x, y])
    }
  }

  return createApple([0, 0])
}
