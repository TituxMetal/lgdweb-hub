import type { PieceType, Rng } from '../types'
import { PIECE_TYPES } from './pieces'

/**
 * The queue the falling pieces are dealt from.
 *
 * The original's `Piece.getRandomPiece` (`Piece.js:64-77`) kept a shrinking pool,
 * pulled `Math.random()` twice over it, and could still hand the same tetromino
 * out twice in a row. The port deals a shuffled bag of the seven instead: the
 * same pieces, each once before any of them repeats — better than the original on
 * purpose, and the only rule here that departs from it. The draw is a parameter,
 * so a test pins the deal down without touching `Math.random`.
 */

/** A freshly shuffled bag: the seven tetrominoes, each once. */
export const createBag = (rng: Rng = Math.random): PieceType[] =>
  PIECE_TYPES.reduce<PieceType[]>((bag, type) => {
    // Fisher–Yates read the other way round: each piece drops into a slot picked
    // out of the bag as it stands, which shuffles the seven in one pass.
    const slot = Math.floor(rng() * (bag.length + 1))

    return [...bag.slice(0, slot), type, ...bag.slice(slot)]
  }, [])

/**
 * The piece to fall next, and the queue behind it. A queue that ran dry is
 * stocked from a fresh bag, so the caller never has to deal with an empty one
 * and the bag's guarantee — seven pieces, one of each — holds across a game.
 */
export const drawNext = (
  queue: readonly PieceType[],
  rng: Rng = Math.random
): { type: PieceType; queue: PieceType[] } => {
  const dealt = queue.length > 0 ? [...queue] : createBag(rng)
  // Reading an array type is `| undefined` under `noUncheckedIndexedAccess`, and
  // the head of a queue is always a piece: `createBag` deals seven, and only the
  // *tail* of a queue can be empty. The assertion says that, rather than widening
  // the return type for a case that cannot happen.
  const type = dealt.shift() as PieceType

  return { type, queue: dealt.length > 0 ? dealt : createBag(rng) }
}
