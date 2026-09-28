import { describe, expect, it } from 'bun:test'
import type { Shape } from '../types'
import {
  createShape,
  PIECE_CLASSES,
  PIECE_TYPES,
  rotateShape,
  spawnPosition,
  trimShape
} from './pieces'

/** Renders a shape as rows of `#`/`.` so an expectation reads as the picture it asserts. */
const picture = (shape: Shape): string[] =>
  shape.map((row) => row.map((filled) => (filled ? '#' : '.')).join(''))

const shapeOf = (rows: string[]): Shape => rows.map((row) => [...row].map((cell) => cell === '#'))

describe('createShape', () => {
  it('draws each tetromino the way the original drew it', () => {
    expect(picture(createShape('I'))).toEqual(['.#..', '.#..', '.#..', '.#..'])
    expect(picture(createShape('J'))).toEqual(['.#.', '.#.', '##.'])
    expect(picture(createShape('L'))).toEqual(['.#.', '.#.', '.##'])
    expect(picture(createShape('O'))).toEqual(['##', '##'])
    expect(picture(createShape('S'))).toEqual(['.##', '##.', '...'])
    expect(picture(createShape('T'))).toEqual(['###', '.#.', '...'])
    expect(picture(createShape('Z'))).toEqual(['##.', '.##', '...'])
  })

  it('deals seven tetrominoes, each of them four cells on a square grid', () => {
    expect(PIECE_TYPES).toHaveLength(7)
    expect(new Set(PIECE_TYPES).size).toBe(7)

    for (const type of PIECE_TYPES) {
      const shape = createShape(type)
      const filled = shape.flat().filter((cell) => cell).length

      for (const line of shape) expect(line.length).toBe(shape.length)
      expect(filled).toBe(4)
    }
  })
})

describe('rotateShape', () => {
  it('turns a piece clockwise', () => {
    expect(picture(rotateShape(createShape('T'), 1))).toEqual(['..#', '.##', '..#'])
    expect(picture(rotateShape(createShape('J'), 1))).toEqual(['#..', '###', '...'])
  })

  it('turns a piece counter-clockwise, undoing a clockwise turn', () => {
    for (const type of PIECE_TYPES) {
      const shape = createShape(type)
      const turned = rotateShape(rotateShape(shape, 1), -1)

      expect(turned).toEqual(shape)
    }
  })

  it('pivots on the matrix rather than the piece, as the original did', () => {
    // The original transposed the piece's square grid (`Player.js:88-105`), so the
    // turned piece may sit one row or column off its centre: a quarter turn of the
    // T lands its bar on the right, sharing no column with the spawn, and a second
    // quarter turn leaves the bar at the bottom row. Kept: it is the original's
    // play, and the same rotation the wall-kick offsets were tuned against.
    expect(picture(rotateShape(createShape('T'), 1))[0]).toBe('..#')
    expect(picture(rotateShape(rotateShape(createShape('T'), 1), 1))).toEqual(['...', '.#.', '###'])
  })

  it('leaves the square tetromino exactly as it was', () => {
    const shape = createShape('O')

    expect(rotateShape(shape, 1)).toEqual(shape)
    expect(rotateShape(shape, -1)).toEqual(shape)
  })

  it('walks the long tetromino around its four orientations, as the original did', () => {
    const vertical = createShape('I')

    // The original's grid holds the bar in its second column, so the four turns
    // read the bar, then the bar one row down, then a column further in, then the
    // spawn again. The turns are the standard ones — what moves is where the bar
    // sits in the grid, since the grid is turned, not the piece's centre.
    const first = rotateShape(vertical, 1)
    const second = rotateShape(first, 1)
    const third = rotateShape(second, 1)

    expect(picture(first)).toEqual(['....', '####', '....', '....'])
    expect(picture(second)).toEqual(['..#.', '..#.', '..#.', '..#.'])
    expect(picture(third)).toEqual(['....', '....', '####', '....'])
    expect(rotateShape(third, 1)).toEqual(vertical)
    expect(picture(rotateShape(vertical, -1))).toEqual(picture(third))
  })

  it('does not mutate the shape it was given', () => {
    const shape = createShape('S')
    const before = picture(shape)

    rotateShape(shape, 1)

    expect(picture(shape)).toEqual(before)
  })
})

describe('PIECE_CLASSES', () => {
  it('paints each tetromino with the entry its original colour maps to', () => {
    // The original's colour table, read through the indices its grids carried and
    // mapped in `palette.md`; a change here is a change to that document too.
    expect(PIECE_CLASSES).toEqual({
      I: 'bg-yellow-300',
      J: 'bg-sky-400',
      L: 'bg-green-400',
      O: 'bg-blue-500',
      S: 'bg-orange-400',
      T: 'bg-pink-600',
      Z: 'bg-fuchsia-500'
    })
  })
})

describe('trimShape', () => {
  it('cuts an empty row and column off the piece', () => {
    expect(picture(trimShape(createShape('T')))).toEqual(['###', '.#.'])
    expect(picture(trimShape(createShape('I')))).toEqual(['#', '#', '#', '#'])
    expect(picture(trimShape(createShape('O')))).toEqual(['##', '##'])
  })
})

describe('spawnPosition', () => {
  it('centres the piece on the board, as the original reset did', () => {
    expect(spawnPosition(createShape('T'), 12)).toEqual({ x: 5, y: 0 })
    expect(spawnPosition(createShape('O'), 12)).toEqual({ x: 5, y: 0 })
    expect(spawnPosition(createShape('I'), 12)).toEqual({ x: 4, y: 0 })
  })
})

describe('shapeOf', () => {
  it('is the inverse of picture', () => {
    expect(picture(shapeOf(['#.#', '.#.']))).toEqual(['#.#', '.#.'])
  })
})
