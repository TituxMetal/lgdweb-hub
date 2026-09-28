import { describe, expect, it } from 'bun:test'
import type { Board, Cell, PieceType } from '../types'
import { BOARD_HEIGHT, BOARD_WIDTH, collides, createBoard, merge, sweep } from './board'
import { createShape, PIECE_TYPES, spawnPosition } from './pieces'

/** A row of `BOARD_WIDTH` cells: `T`/`I`/… for a resting piece, `.` for nothing. */
const row = (pattern: string): Cell[] => {
  const cells = [...pattern].map((cell): Cell => (cell === '.' ? null : (cell as PieceType)))

  return [...cells, ...new Array<Cell>(BOARD_WIDTH - cells.length).fill(null)]
}

/** A board whose last rows are the given pictures, in reading order: the first is the highest. */
const boardWith = (...rows: string[]): Board => [
  ...Array.from({ length: BOARD_HEIGHT - rows.length }, () => row('')),
  ...rows.map(row)
]

describe('createBoard', () => {
  it('is a 12 × 20 board with nothing on it', () => {
    const board = createBoard()

    expect(board).toHaveLength(BOARD_HEIGHT)
    expect(board).toHaveLength(20)

    for (const line of board) {
      expect(line).toHaveLength(BOARD_WIDTH)
      expect(line).toHaveLength(12)
      expect(line.every((cell) => cell === null)).toBe(true)
    }
  })
})

describe('collides', () => {
  it('lets every piece in at the spawn on an empty board', () => {
    for (const type of PIECE_TYPES) {
      const shape = createShape(type)

      expect(collides(createBoard(), shape, spawnPosition(shape, BOARD_WIDTH))).toBe(false)
    }
  })

  it('reads only the piece’s own cells', () => {
    // The T carries an empty row; hanging below the floor it still fits.
    const shape = createShape('T')

    expect(collides(createBoard(), shape, { x: 5, y: BOARD_HEIGHT - 2 })).toBe(false)
    expect(collides(createBoard(), shape, { x: 5, y: BOARD_HEIGHT - 1 })).toBe(true)
  })

  it('reports a piece resting on the stack', () => {
    const board = boardWith('....T.......')

    expect(collides(board, createShape('O'), { x: 4, y: 18 })).toBe(true)
    expect(collides(board, createShape('O'), { x: 4, y: 17 })).toBe(false)
  })

  it('reports each wall and the floor', () => {
    const shape = createShape('O')

    expect(collides(createBoard(), shape, { x: -1, y: 0 })).toBe(true)
    expect(collides(createBoard(), shape, { x: BOARD_WIDTH - 1, y: 0 })).toBe(true)
    expect(collides(createBoard(), shape, { x: BOARD_WIDTH - 2, y: 0 })).toBe(false)
    expect(collides(createBoard(), shape, { x: 0, y: BOARD_HEIGHT - 1 })).toBe(true)
    expect(collides(createBoard(), shape, { x: 0, y: BOARD_HEIGHT - 2 })).toBe(false)
  })
})

describe('merge', () => {
  it('writes the piece into the stack under its own name', () => {
    const piece = { type: 'O', shape: createShape('O'), position: { x: 4, y: 18 } } as const
    const merged = merge(createBoard(), piece)

    expect(merged[18]?.[4]).toBe('O')
    expect(merged[18]?.[5]).toBe('O')
    expect(merged[19]?.[4]).toBe('O')
    expect(merged[19]?.[5]).toBe('O')
    expect(merged[18]?.[3]).toBeNull()
  })

  it('leaves the board it was given alone', () => {
    const board = createBoard()

    merge(board, { type: 'T', shape: createShape('T'), position: { x: 4, y: 18 } })

    expect(board.every((line) => line.every((cell) => cell === null))).toBe(true)
  })

  it('keeps what the stack already held', () => {
    const board = boardWith('....J.......')
    const merged = merge(board, {
      type: 'O',
      shape: createShape('O'),
      position: { x: 6, y: 18 }
    })

    expect(merged[19]?.[4]).toBe('J')
    expect(merged[19]?.[6]).toBe('O')
  })
})

describe('sweep', () => {
  it('hands back the same board when no row was filled', () => {
    const board = boardWith('T...........', 'TT.........Z')

    expect(sweep(board)).toEqual({ board, score: 0 })
  })

  it('drops the full row and scores it ten', () => {
    const board = boardWith('....T.......', 'TTTTTTTTTTTT')
    const swept = sweep(board)

    expect(swept.score).toBe(10)
    expect(swept.board).toHaveLength(BOARD_HEIGHT)
    expect(swept.board[BOARD_HEIGHT - 1]?.[4]).toBe('T')
    expect(swept.board[BOARD_HEIGHT - 2]?.every((cell) => cell === null)).toBe(true)
  })

  it('scores the original’s cumulative line count: 10, 30, 60, 100', () => {
    expect(sweep(boardWith('TTTTTTTTTTTT')).score).toBe(10)
    expect(sweep(boardWith('TTTTTTTTTTTT', 'JJJJJJJJJJJJ')).score).toBe(30)
    expect(sweep(boardWith('TTTTTTTTTTTT', 'JJJJJJJJJJJJ', 'ZZZZZZZZZZZZ')).score).toBe(60)
    expect(
      sweep(boardWith('TTTTTTTTTTTT', 'JJJJJJJJJJJJ', 'ZZZZZZZZZZZZ', 'IIIIIIIIIIII')).score
    ).toBe(100)
  })

  it('clears the rows in one pass, keeping the stack above them in order', () => {
    const swept = sweep(boardWith('....S.......', 'JJJJJJJJJJJJ', 'T...........', 'ZZZZZZZZZZZZ'))

    expect(swept.score).toBe(30)
    expect(swept.board).toHaveLength(BOARD_HEIGHT)
    expect(swept.board[BOARD_HEIGHT - 1]?.[0]).toBe('T')
    expect(swept.board[BOARD_HEIGHT - 2]?.[4]).toBe('S')
    expect(swept.board[BOARD_HEIGHT - 3]?.every((cell) => cell === null)).toBe(true)
  })
})
