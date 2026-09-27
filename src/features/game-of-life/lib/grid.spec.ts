import { describe, expect, it } from 'bun:test'
import { CellState, type Grid, type Neighbourhood } from '../types'
import {
  countAliveNeighbours,
  createGrid,
  nextGeneration,
  randomGrid,
  seedGlider,
  setCell
} from './grid'

const BOUNDED: Neighbourhood = { torus: false }
const TORUS: Neighbourhood = { torus: true }

/** Compact board notation, `#` alive and anything else dead. */
const board = (rows: string[]): Grid =>
  rows.map((row) => [...row].map((cell) => (cell === '#' ? CellState.alive : CellState.dead)))

const render = (grid: Grid): string[] =>
  grid.map((row) => row.map((cell) => (cell === CellState.alive ? '#' : '.')).join(''))

describe('the Game of Life rules, on explicit boards', () => {
  it('is born where a dead cell has exactly three live neighbours', () => {
    // Only (1,1) is dead with three neighbours; the three live cells each keep two.
    const before = board(['##.', '#..', '...'])

    expect(render(nextGeneration(before, BOUNDED))).toEqual(['##.', '##.', '...'])
  })

  it('keeps a live cell alive with exactly two neighbours', () => {
    // The block: every one of its four cells has two neighbours, and no dead cell
    // reaches three.
    const block = board(['##.', '##.', '...'])

    expect(render(nextGeneration(block, BOUNDED))).toEqual(['##.', '##.', '...'])
  })

  it('keeps a live cell alive with exactly three neighbours', () => {
    const before = board(['###', '.#.', '...'])
    const after = nextGeneration(before, BOUNDED)

    expect(after[0]?.[1]).toBe(CellState.alive)
    expect(render(after)).toEqual(['###', '###', '...'])
  })

  it('kills a live cell with fewer than two neighbours', () => {
    expect(render(nextGeneration(board(['#..', '...', '...']), BOUNDED))).toEqual([
      '...',
      '...',
      '...'
    ])

    // Two neighbours of each other is still one neighbour each.
    expect(render(nextGeneration(board(['##.', '...', '...']), BOUNDED))).toEqual([
      '...',
      '...',
      '...'
    ])
  })

  it('kills a live cell with more than three neighbours', () => {
    const before = board(['###', '###', '###'])
    const after = nextGeneration(before, BOUNDED)

    expect(after[1]?.[1]).toBe(CellState.dead)
    // The edges see five live neighbours, the centre eight; the corners see three
    // and survive, and no dead cell reaches exactly three.
    expect(render(after)).toEqual(['#.#', '...', '#.#'])
  })

  it('leaves a dead cell with exactly two neighbours dead', () => {
    const before = board(['#.#', '...', '...'])
    const after = nextGeneration(before, BOUNDED)

    // (0,1) is the dead cell with exactly two live neighbours; (1,0), adjacent
    // to only one of them, has one.
    expect(after[0]?.[1]).toBe(CellState.dead)
    expect(after[1]?.[0]).toBe(CellState.dead)
  })

  it('holds a block still across generations', () => {
    let grid = board(['.....', '.##..', '.##..', '.....', '.....'])

    for (let generation = 0; generation < 5; generation++) {
      grid = nextGeneration(grid, BOUNDED)
    }

    expect(render(grid)).toEqual(['.....', '.##..', '.##..', '.....', '.....'])
  })

  it('oscillates a blinker between its two orientations', () => {
    const vertical = board(['..#..', '..#..', '..#..', '.....', '.....'])
    const horizontal = board(['.....', '.###.', '.....', '.....', '.....'])

    const halfway = nextGeneration(vertical, BOUNDED)

    expect(render(halfway)).toEqual(render(horizontal))
    expect(render(nextGeneration(halfway, BOUNDED))).toEqual(render(vertical))
  })

  it('walks a glider one cell diagonally every four generations', () => {
    const field = createGrid({ rows: 10, cols: 10 })
    let grid = seedGlider(field, { row: 0, col: 0 })

    for (let generation = 0; generation < 4; generation++) {
      grid = nextGeneration(grid, BOUNDED)
    }

    expect(render(grid)).toEqual(render(seedGlider(field, { row: 1, col: 1 })))
  })
})

describe('the torus neighbourhood', () => {
  it('wraps the edges, where the bounded neighbourhood clamps at them', () => {
    const before = board([
      // A row at the bottom edge and a live corner, only adjacent through the wrap.
      '.....',
      '.....',
      '.....',
      '.....',
      '#..##'
    ])

    // (0,4)'s three live neighbours are all across the edge.
    expect(countAliveNeighbours(before, 0, 4, BOUNDED)).toBe(0)
    expect(countAliveNeighbours(before, 0, 4, TORUS)).toBe(3)

    expect(nextGeneration(before, BOUNDED)[0]?.[4]).toBe(CellState.dead)
    expect(nextGeneration(before, TORUS)[0]?.[4]).toBe(CellState.alive)
  })

  it('counts the opposite edges as neighbours of a corner', () => {
    let grid = createGrid({ rows: 3, cols: 3 })
    grid = setCell(grid, 0, 0, CellState.alive)
    grid = setCell(grid, 0, 2, CellState.alive)
    grid = setCell(grid, 2, 0, CellState.alive)

    expect(countAliveNeighbours(grid, 0, 0, BOUNDED)).toBe(0)
    expect(countAliveNeighbours(grid, 0, 0, TORUS)).toBe(2)
  })

  it('never counts a cell as its own neighbour on a single-row board', () => {
    // On a 1x3 torus every offset wraps into the same row, so a cell that skips
    // only the (0, 0) offset reaches itself twice; the original skipped every
    // offset whose wrapped coordinates land back on the cell.
    expect(countAliveNeighbours(board(['#..']), 0, 0, TORUS)).toBe(0)

    // With all three cells alive, each of the two siblings is reached once per
    // row offset: six neighbours in all, none of them the cell itself.
    expect(countAliveNeighbours(board(['###']), 0, 0, TORUS)).toBe(6)
  })
})

describe('board construction', () => {
  it('creates an empty board of the requested size', () => {
    expect(render(createGrid({ rows: 2, cols: 3 }))).toEqual(['...', '...'])
  })

  it('seeds the glider the original seeded its board with', () => {
    const grid = seedGlider(createGrid({ rows: 4, cols: 4 }), { row: 0, col: 0 })

    expect(render(grid)).toEqual(['..#.', '#.#.', '.##.', '....'])
  })

  it('seeds its default glider on rows 1–3, columns 0–2, as the original did', () => {
    // `GameState.js` placed the pattern's corner at (1, 0), not (1, 1).
    expect(render(seedGlider(createGrid({ rows: 4, cols: 8 })))).toEqual([
      '........',
      '..#.....',
      '#.#.....',
      '.##.....'
    ])
  })

  it('leaves the board untouched for a cell outside it', () => {
    const grid = board(['#..', '...'])

    expect(setCell(grid, 5, 0, CellState.alive)).toBe(grid)
    expect(setCell(grid, 0, 5, CellState.alive)).toBe(grid)
    expect(setCell(grid, -1, 0, CellState.alive)).toBe(grid)
    expect(setCell(grid, 0, -1, CellState.alive)).toBe(grid)
  })

  it('leaves the board untouched when the cell already holds the state', () => {
    const grid = board(['#..', '...'])

    expect(setCell(grid, 0, 0, CellState.alive)).toBe(grid)
    expect(setCell(grid, 0, 1, CellState.dead)).toBe(grid)
  })

  it('seeds live cells in proportion to the density', () => {
    const rolls = [0.1, 0.5, 0.9]
    const random = () => rolls.shift() ?? 0

    expect(render(randomGrid({ rows: 1, cols: 3 }, 0.3, random))).toEqual(['#..'])
  })
})
