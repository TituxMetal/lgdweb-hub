import { describe, expect, it } from 'bun:test'
import { advance, createSnake, hasCollided, isEatingApple, setDirection } from './snake'

describe('createSnake', () => {
  it('initialises with the given direction, body and ateApple=false', () => {
    const snake = createSnake('right', [
      [3, 3],
      [2, 3]
    ])

    expect(snake.direction).toBe('right')
    expect(snake.body).toEqual([
      [3, 3],
      [2, 3]
    ])
    expect(snake.ateApple).toBe(false)
  })
})

describe('advance', () => {
  it('moves the head right by one cell and pops the tail', () => {
    const snake = createSnake('right', [
      [3, 3],
      [2, 3]
    ])

    expect(advance(snake).body).toEqual([
      [4, 3],
      [3, 3]
    ])
  })

  it('moves left, up and down correctly', () => {
    expect(advance(createSnake('left', [[3, 3]])).body).toEqual([[2, 3]])
    expect(advance(createSnake('up', [[3, 3]])).body).toEqual([[3, 2]])
    expect(advance(createSnake('down', [[3, 3]])).body).toEqual([[3, 4]])
  })

  it('grows the body by one cell when ateApple is true', () => {
    const snake = { ...createSnake('right', [[3, 3]]), ateApple: true }
    const next = advance(snake)

    expect(next.body).toEqual([
      [4, 3],
      [3, 3]
    ])
    expect(next.ateApple).toBe(false)
  })
})

describe('setDirection', () => {
  it('updates the direction when valid', () => {
    const snake = createSnake('right', [[0, 0]])
    expect(setDirection(snake, 'up').direction).toBe('up')
    expect(setDirection(snake, 'down').direction).toBe('down')
  })

  it('rejects 180° reversals', () => {
    expect(setDirection(createSnake('right', [[0, 0]]), 'left').direction).toBe('right')
    expect(setDirection(createSnake('left', [[0, 0]]), 'right').direction).toBe('left')
    expect(setDirection(createSnake('up', [[0, 0]]), 'down').direction).toBe('up')
    expect(setDirection(createSnake('down', [[0, 0]]), 'up').direction).toBe('down')
  })

  it('is a no-op when the new direction equals the current one', () => {
    const snake = createSnake('right', [[0, 0]])
    expect(setDirection(snake, 'right')).toBe(snake)
  })
})

describe('hasCollided', () => {
  const gridSize = { width: 10, height: 10 }

  it('detects out-of-bounds on every side', () => {
    expect(hasCollided(createSnake('left', [[-1, 5]]), gridSize)).toBe(true)
    expect(hasCollided(createSnake('right', [[10, 5]]), gridSize)).toBe(true)
    expect(hasCollided(createSnake('up', [[5, -1]]), gridSize)).toBe(true)
    expect(hasCollided(createSnake('down', [[5, 10]]), gridSize)).toBe(true)
  })

  it('returns false when the head is inside the grid and the body is straight', () => {
    expect(
      hasCollided(
        createSnake('right', [
          [3, 3],
          [2, 3]
        ]),
        gridSize
      )
    ).toBe(false)
  })

  it('detects self-collision when the head overlaps a body segment', () => {
    const snake = createSnake('right', [
      [3, 3],
      [3, 4],
      [2, 4],
      [2, 3],
      [3, 3]
    ])
    expect(hasCollided(snake, gridSize)).toBe(true)
  })
})

describe('isEatingApple', () => {
  it('returns true when the head sits on the apple', () => {
    const snake = createSnake('right', [[5, 5]])
    expect(isEatingApple(snake, { position: [5, 5] })).toBe(true)
  })

  it('returns false otherwise', () => {
    const snake = createSnake('right', [[5, 5]])
    expect(isEatingApple(snake, { position: [6, 5] })).toBe(false)
    expect(isEatingApple(snake, { position: [5, 6] })).toBe(false)
  })
})
