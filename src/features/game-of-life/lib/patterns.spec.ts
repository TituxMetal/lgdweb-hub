import { describe, expect, it } from 'bun:test'
import { CellState, type Grid, type Neighbourhood } from '../types'
import { createGrid, nextGeneration, setCell, stampPattern } from './grid'
import { DEFAULT_PATTERN_ID, GLIDER_CELLS, PATTERNS, patternById } from './patterns'

const BOUNDED: Neighbourhood = { torus: false }
const BOARD = { rows: 16, cols: 16 }

const liveCells = (grid: Grid): [number, number][] => {
  const cells: [number, number][] = []

  for (const [rowIndex, row] of grid.entries()) {
    for (const [colIndex, cell] of row.entries()) {
      if (cell === CellState.alive) cells.push([rowIndex, colIndex])
    }
  }

  return cells
}

/** The live cells rebased to their own top-left corner, so two boards compare by shape. */
const shape = (grid: Grid): string[] => {
  const cells = liveCells(grid)
  const topRow = Math.min(...cells.map(([row]) => row))
  const leftCol = Math.min(...cells.map(([, col]) => col))

  return cells.map(([row, col]) => `${row - topRow},${col - leftCol}`).sort()
}

const topLeft = (grid: Grid): [number, number] => {
  const cells = liveCells(grid)

  return [Math.min(...cells.map(([row]) => row)), Math.min(...cells.map(([, col]) => col))]
}

const advance = (grid: Grid, generations: number): Grid => {
  let current = grid

  for (let step = 0; step < generations; step++) current = nextGeneration(current, BOUNDED)

  return current
}

/** The board with the named pattern stamped, or a thrown error when the id is unknown. */
const stamped = (id: string): Grid => {
  const pattern = patternById(id)
  if (pattern === undefined) throw new Error(`no pattern named ${id}`)

  return stampPattern(createGrid(BOARD), pattern)
}

describe('the pattern catalogue', () => {
  it('holds four patterns, each named and described', () => {
    expect(PATTERNS).toHaveLength(4)

    for (const pattern of PATTERNS) {
      expect(pattern.id).toMatch(/^[a-z][a-z0-9-]*$/)
      expect(pattern.label.length).toBeGreaterThan(0)
      expect(pattern.note.length).toBeGreaterThan(0)
      expect(pattern.cells.length).toBeGreaterThan(0)
    }
  })

  it('gives every pattern its own id, and resolves each back from that id', () => {
    const ids = PATTERNS.map((pattern) => pattern.id)

    expect(new Set(ids).size).toBe(ids.length)
    expect(patternById(DEFAULT_PATTERN_ID)).toBeDefined()

    for (const pattern of PATTERNS) expect(patternById(pattern.id)).toBe(pattern)
  })

  it('names every cell exactly once, inside the pattern', () => {
    for (const pattern of PATTERNS) {
      const keys = pattern.cells.map(([row, col]) => `${row},${col}`)

      expect(new Set(keys).size).toBe(keys.length)

      for (const [row, col] of pattern.cells) {
        expect(row).toBeGreaterThanOrEqual(0)
        expect(col).toBeGreaterThanOrEqual(0)
      }
    }
  })

  it('seeds the engine opening board from the same glider the picker offers', () => {
    expect(patternById('glider')?.cells).toBe(GLIDER_CELLS)
  })
})

describe('stamping a pattern', () => {
  it('centres the pattern on the board', () => {
    // The blinker is one column wide and three rows tall, so a 16x16 board
    // centres it on rows 6-8 of column 7.
    expect(liveCells(stamped('blinker'))).toEqual([
      [6, 7],
      [7, 7],
      [8, 7]
    ])
  })

  it('adds to the board rather than replacing it', () => {
    const block = patternById('block')
    if (block === undefined) throw new Error('no block pattern')

    const withCornerCell = setCell(createGrid(BOARD), 0, 0, CellState.alive)
    const stampedOnce = stampPattern(withCornerCell, block)
    const stampedTwice = stampPattern(stampedOnce, block)

    expect(liveCells(stampedOnce)).toContainEqual([0, 0])
    expect(stampedTwice).toEqual(stampedOnce)
  })

  it('keeps a pattern wider than the board inside it', () => {
    const toad = patternById('toad')
    if (toad === undefined) throw new Error('no toad pattern')

    const narrow = stampPattern(createGrid({ rows: 4, cols: 3 }), toad)

    for (const [row, col] of liveCells(narrow)) {
      expect(row).toBeGreaterThanOrEqual(0)
      expect(row).toBeLessThan(4)
      expect(col).toBeGreaterThanOrEqual(0)
      expect(col).toBeLessThan(3)
    }
  })
})

describe('the patterns against the engine', () => {
  it('keeps the block still', () => {
    const block = stamped('block')

    expect(shape(advance(block, 5))).toEqual(shape(block))
  })

  it('makes the blinker beat between its two bars', () => {
    const blinker = stamped('blinker')
    const afterOne = advance(blinker, 1)

    expect(shape(afterOne)).toEqual(['0,0', '0,1', '0,2'])
    expect(shape(advance(blinker, 2))).toEqual(shape(blinker))
    expect(shape(advance(blinker, 3))).toEqual(shape(afterOne))
  })

  it('makes the toad alternate between its two forms', () => {
    const toad = stamped('toad')
    const afterOne = advance(toad, 1)

    expect(shape(afterOne)).not.toEqual(shape(toad))
    expect(shape(advance(toad, 2))).toEqual(shape(toad))
    expect(shape(advance(toad, 3))).toEqual(shape(afterOne))
  })

  it('sends the glider one cell down its diagonal every four generations', () => {
    const glider = stamped('glider')
    const afterFour = advance(glider, 4)
    const [row, col] = topLeft(glider)

    expect(shape(afterFour)).toEqual(shape(glider))
    expect(topLeft(afterFour)).toEqual([row + 1, col + 1])
  })
})
