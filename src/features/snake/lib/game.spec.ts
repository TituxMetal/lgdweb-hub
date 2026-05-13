import { describe, expect, it } from 'bun:test'
import type { Cell, GameState, GridSize } from '../types'
import { computeDelay, createInitialState, start, tick } from './game'
import { createSnake } from './snake'

const gridSize: GridSize = { width: 10, height: 10 }

const running = (overrides: Partial<GameState> = {}): GameState => ({
  ...createInitialState(gridSize),
  status: 'running',
  ...overrides
})

describe('createInitialState', () => {
  it('starts idle with score 0, two-cell snake heading right, delay 120', () => {
    const state = createInitialState(gridSize)

    expect(state.status).toBe('idle')
    expect(state.score).toBe(0)
    expect(state.delay).toBe(120)
    expect(state.snake.direction).toBe('right')
    expect(state.snake.body.length).toBe(2)
  })

  it('places the apple off the snake body', () => {
    const state = createInitialState(gridSize)
    const collides = state.snake.body.some(
      ([x, y]) => x === state.apple.position[0] && y === state.apple.position[1]
    )

    expect(collides).toBe(false)
  })
})

describe('computeDelay', () => {
  it('returns the current delay unchanged at score 0 or non-multiples of 5', () => {
    expect(computeDelay(0, 120)).toBe(120)
    expect(computeDelay(3, 120)).toBe(120)
    expect(computeDelay(7, 120)).toBe(120)
  })

  it('decrements by score when score is a multiple of 5 and ≤ 10', () => {
    expect(computeDelay(5, 120)).toBe(115)
    expect(computeDelay(10, 115)).toBe(105)
  })

  it('decrements by round(score / 20) when score is a multiple of 5 and > 10', () => {
    expect(computeDelay(15, 105)).toBe(104)
    expect(computeDelay(20, 104)).toBe(103)
    expect(computeDelay(50, 103)).toBe(100)
  })

  it('floors the delay at 30ms', () => {
    expect(computeDelay(5, 35)).toBe(30)
    expect(computeDelay(5, 30)).toBe(30)
  })
})

describe('tick', () => {
  it('returns the state unchanged when status is not running', () => {
    const idle = createInitialState(gridSize)
    expect(tick(idle)).toBe(idle)

    const over: GameState = { ...idle, status: 'over' }
    expect(tick(over)).toBe(over)
  })

  it('advances the snake by one cell when running and no collision', () => {
    const state = running({
      snake: createSnake('right', [
        [3, 3],
        [2, 3]
      ])
    })
    const next = tick(state)

    expect(next.snake.body[0]).toEqual([4, 3])
    expect(next.snake.body[1]).toEqual([3, 3])
    expect(next.score).toBe(state.score)
  })

  it('sets status to over when the snake has collided with a wall', () => {
    const state = running({
      snake: createSnake('right', [[10, 5]])
    })

    expect(tick(state).status).toBe('over')
  })

  it('increments score and repositions the apple when the snake eats it', () => {
    const apple: Cell = [4, 5]
    const state = running({
      snake: createSnake('right', [
        [3, 5],
        [2, 5]
      ]),
      apple: { position: apple },
      score: 4,
      delay: 120
    })
    const next = tick(state, () => 0)

    expect(next.score).toBe(5)
    expect(next.snake.ateApple).toBe(true)
    expect(next.apple.position).not.toEqual(apple)
    expect(next.delay).toBe(115)
  })

  it('grows the snake on the tick after eating an apple', () => {
    const state = running({
      snake: createSnake('right', [
        [3, 5],
        [2, 5]
      ]),
      apple: { position: [4, 5] }
    })
    const afterEat = tick(state, () => 0)
    const afterGrowth = tick(afterEat, () => 0)

    expect(afterEat.snake.body.length).toBe(2)
    expect(afterGrowth.snake.body.length).toBe(3)
  })
})

describe('start', () => {
  it('produces a fresh running state with score 0 and a 2-cell snake', () => {
    const previous: GameState = {
      ...createInitialState(gridSize),
      status: 'over',
      score: 42,
      delay: 60
    }
    const next = start(previous)

    expect(next.status).toBe('running')
    expect(next.score).toBe(0)
    expect(next.delay).toBe(120)
    expect(next.snake.body.length).toBe(2)
    expect(next.snake.direction).toBe('right')
  })
})
