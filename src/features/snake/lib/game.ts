import type { GameState, GridSize } from '../types'
import { placeApple } from './apple'
import { advance, createSnake, hasCollided, isEatingApple } from './snake'

const INITIAL_DELAY = 120
const MIN_DELAY = 30
const SPEEDUP_INTERVAL = 5

const createFreshSnake = (gridSize: GridSize) => {
  const cx = Math.floor(gridSize.width / 2)
  const cy = Math.floor(gridSize.height / 2)
  return createSnake('right', [
    [cx, cy],
    [cx - 1, cy]
  ])
}

export const createInitialState = (gridSize: GridSize): GameState => {
  const snake = createFreshSnake(gridSize)
  return {
    status: 'idle',
    score: 0,
    snake,
    apple: placeApple(gridSize, snake),
    gridSize,
    delay: INITIAL_DELAY
  }
}

// Speedup curve replicating the original 2018 snakeJs: every 5 points, shave
// the tick delay by `score` (early game, ramp fast) or `round(score / 20)`
// (late game, ramp slow). Floored at MIN_DELAY so the game stays playable.
export const computeDelay = (score: number, currentDelay: number): number => {
  if (score === 0 || score % SPEEDUP_INTERVAL !== 0) return currentDelay
  const decrement = score <= 10 ? score : Math.round(score / 20)
  return Math.max(MIN_DELAY, currentDelay - decrement)
}

// One simulation step. Order matters:
// 1. Check collision on the *current* head — lets the player see the snake
//    one cell past the wall for one frame before Game Over, matching the
//    feel of the original.
// 2. Advance the snake.
// 3. If the new head sits on the apple, set `ateApple = true`; growth then
//    materialises on the *following* tick when `advance` consumes the flag.
export const tick = (state: GameState, rng?: () => number): GameState => {
  if (state.status !== 'running') return state

  if (hasCollided(state.snake, state.gridSize)) {
    return { ...state, status: 'over' }
  }

  const movedSnake = advance(state.snake)

  if (!isEatingApple(movedSnake, state.apple)) {
    return { ...state, snake: movedSnake }
  }

  const grownSnake = { ...movedSnake, ateApple: true }
  const score = state.score + 1

  return {
    ...state,
    snake: grownSnake,
    score,
    apple: placeApple(state.gridSize, grownSnake, rng),
    delay: computeDelay(score, state.delay)
  }
}

export const start = (state: GameState): GameState => {
  const snake = createFreshSnake(state.gridSize)
  return {
    status: 'running',
    score: 0,
    snake,
    apple: placeApple(state.gridSize, snake),
    gridSize: state.gridSize,
    delay: INITIAL_DELAY
  }
}
