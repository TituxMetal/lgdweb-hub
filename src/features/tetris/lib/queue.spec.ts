import { describe, expect, it } from 'bun:test'
import type { PieceType } from '../types'
import { PIECE_TYPES } from './pieces'
import { createBag, drawNext } from './queue'

const sorted = (pieces: readonly PieceType[]): PieceType[] => [...pieces].sort()

describe('createBag', () => {
  it('deals each of the seven tetrominoes exactly once, whatever the draw', () => {
    for (const roll of [0, 0.13, 0.5, 0.87, 0.999]) {
      expect(sorted(createBag(() => roll))).toEqual(sorted(PIECE_TYPES))
    }
  })

  it('does not always deal the same order', () => {
    const first = createBag(() => 0)
    const second = createBag(() => 0.5)

    expect(first).not.toEqual(second)
  })
})

describe('drawNext', () => {
  it('hands out the head of the queue and keeps the rest behind it', () => {
    const dealt = drawNext(['T', 'I', 'O'], () => 0)

    expect(dealt.type).toBe('T')
    expect(dealt.queue).toEqual(['I', 'O'])
  })

  it('deals a fresh bag once the queue runs dry, never repeating a piece early', () => {
    let queue: readonly PieceType[] = createBag(() => 0)
    const dealt: PieceType[] = []

    for (let draw = 0; draw < 14; draw++) {
      const next = drawNext(queue, () => 0)
      dealt.push(next.type)
      queue = next.queue
    }

    expect(sorted(dealt.slice(0, 7))).toEqual(sorted(PIECE_TYPES))
    expect(sorted(dealt.slice(7))).toEqual(sorted(PIECE_TYPES))
  })

  it('takes from a bag when it is handed an empty queue', () => {
    const dealt = drawNext([], () => 0)

    expect(PIECE_TYPES).toContain(dealt.type)
    expect(dealt.queue).toHaveLength(PIECE_TYPES.length - 1)
  })

  it('leaves the queue it was given alone', () => {
    const queue: PieceType[] = ['L']

    drawNext(queue, () => 0)

    expect(queue).toEqual(['L'])
  })
})
