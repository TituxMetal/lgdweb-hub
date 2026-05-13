import { describe, expect, it } from 'bun:test'
import type { Cell } from '../types'
import { createApple, placeApple } from './apple'
import { createSnake } from './snake'

describe('createApple', () => {
  it('returns an apple at the given position', () => {
    expect(createApple([3, 4])).toEqual({ position: [3, 4] })
  })
})

describe('placeApple', () => {
  const gridSize = { width: 4, height: 4 }

  it('uses the injected RNG to pick a deterministic position', () => {
    const values = [0.5, 0.25]
    let index = 0
    const rng = () => {
      const value = values[index] ?? 0
      index++
      return value
    }
    const snake = createSnake('right', [[0, 0]])

    expect(placeApple(gridSize, snake, rng).position).toEqual([2, 1])
  })

  it('falls back to a linear scan when the RNG keeps landing on the snake', () => {
    const snake = createSnake('right', [[0, 0]])

    expect(placeApple(gridSize, snake, () => 0).position).toEqual([1, 0])
  })

  it('never lands on the snake even when only one cell is free', () => {
    const body: Cell[] = []
    for (let y = 0; y < gridSize.height; y++) {
      for (let x = 0; x < gridSize.width; x++) {
        if (x === 3 && y === 3) continue
        body.push([x, y] as const)
      }
    }
    const snake = createSnake('right', body)

    expect(placeApple(gridSize, snake, () => 0).position).toEqual([3, 3])
  })
})
