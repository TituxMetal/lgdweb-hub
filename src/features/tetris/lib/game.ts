import type { GameState, Move, Piece, Rng, Turn } from '../types'
import { BOARD_WIDTH, collides, createBoard, merge, sweep } from './board'
import { createShape, rotateShape, spawnPosition } from './pieces'
import { createBag, drawNext } from './queue'

/**
 * The game's own rules, taken from the original's `Player.js`: a piece enters at
 * the top, falls, takes the visitor's moves and turns, and locks into the stack
 * when it cannot fall further — the stack's rows are then swept and scored, the
 * drop speeds up, and a piece that no longer fits at the top ends the game.
 *
 * The original kept all of this as mutable state on a `Player` that reached into
 * the arena and announced changes over an event bus, with `dropCounter`/`deltaTime`
 * arithmetic mixed into the same object. Here each rule is a pure function from a
 * state to the next one, so the timing, the keyboard and the buttons stay outside
 * and a plain Bun test can play a whole game.
 */

/** The original's `defaultInterval` (`Player.js:6`): a fresh piece falls a row a second. */
export const DEFAULT_DROP_INTERVAL = 1000

/**
 * The floor the original did not have. It subtracted the swept score from the
 * interval with nothing underneath (`Player.js:29`), so enough cleared rows took
 * the interval to zero and the piece fell a row per frame until it was over. The
 * port keeps the rule and stops at a tenth of the starting interval.
 */
export const MIN_DROP_INTERVAL = 100

/**
 * How far sideways a turn may push the piece before giving up. The original tried
 * `1, -2, 2, -3, …` alternately (`Player.js:76-85`), in place first; the port
 * tries the same outward steps on both sides, in place first, and then stops.
 */
const KICK_OFFSETS: readonly number[] = [0, 1, -1, 2, -2]

/** Whether the game takes input and a piece is falling — every action opens with this. */
const canPlay = (state: GameState): state is GameState & { piece: Piece } =>
  state.status === 'running' && state.piece !== null

/**
 * The next piece of the queue, entered at the top of the board — or the end of the
 * game when it does not fit there, which is the original's `reset` finding itself
 * a collision (`Player.js:57-64`) turned into a state instead of a quiet restart.
 */
const spawn = (state: GameState, rng: Rng): GameState => {
  const { type, queue } = drawNext(state.queue, rng)
  const shape = createShape(type)
  const position = spawnPosition(shape, BOARD_WIDTH)

  if (collides(state.board, shape, position)) {
    return { ...state, status: 'over', piece: null, queue }
  }

  return { ...state, piece: { type, shape, position }, queue }
}

/** Writes the falling piece into the stack, sweeps what it completed, and drops the next piece. */
const lock = (state: GameState, rng: Rng): GameState => {
  const piece = state.piece
  if (piece === null) return state

  const merged = merge(state.board, piece)
  const cleared = sweep(merged)
  const score = state.score + cleared.score

  return spawn(
    {
      ...state,
      board: cleared.board,
      piece: null,
      score,
      dropInterval: nextDropInterval(state.dropInterval, cleared.score)
    },
    rng
  )
}

/**
 * The interval after a pass that scored `clearScore` — the original's
 * `dropInterval -= newScore` (`Player.js:29`), held at `MIN_DROP_INTERVAL`.
 */
export const nextDropInterval = (dropInterval: number, clearScore: number): number =>
  Math.max(MIN_DROP_INTERVAL, dropInterval - clearScore)

/** A game waiting for its first piece: an empty board, a bag behind it, nothing falling. */
export const createInitialState = (rng: Rng = Math.random): GameState => ({
  status: 'ready',
  board: createBoard(),
  piece: null,
  queue: createBag(rng),
  score: 0,
  dropInterval: DEFAULT_DROP_INTERVAL
})

/**
 * Starts, restarts or resumes. A game waiting for its first piece already holds a
 * freshly dealt bag, and that bag is the one it falls into play with, so the
 * preview shown before the start is the piece that comes. A paused game keeps the
 * stack and the score it was holding; a finished one starts over on a new board
 * and a new bag.
 */
export const start = (state: GameState, rng: Rng = Math.random): GameState => {
  if (state.status === 'running') return state
  if (state.status === 'paused') return { ...state, status: 'running' }
  if (state.status === 'ready') return spawn({ ...state, status: 'running' }, rng)

  return spawn({ ...createInitialState(rng), status: 'running' }, rng)
}

export const togglePause = (state: GameState): GameState => {
  if (state.status === 'running') return { ...state, status: 'paused' }
  if (state.status === 'paused') return { ...state, status: 'running' }

  return state
}

/** One column sideways, refused by a wall or the stack. */
export const move = (state: GameState, direction: Move): GameState => {
  if (!canPlay(state)) return state

  const piece = state.piece
  const position = { x: piece.position.x + direction, y: piece.position.y }

  if (collides(state.board, piece.shape, position)) return state

  return { ...state, piece: { ...piece, position } }
}

/** A quarter turn in place, kicked sideways by the first offset that leaves it room. */
export const rotate = (state: GameState, turn: Turn): GameState => {
  if (!canPlay(state)) return state

  const piece = state.piece
  const shape = rotateShape(piece.shape, turn)

  for (const offset of KICK_OFFSETS) {
    const position = { x: piece.position.x + offset, y: piece.position.y }

    if (!collides(state.board, shape, position)) {
      return { ...state, piece: { ...piece, shape, position } }
    }
  }

  return state
}

/** Down one row, or into the stack when the row below is taken — the original's `drop`. */
export const softDrop = (state: GameState, rng: Rng = Math.random): GameState => {
  if (!canPlay(state)) return state

  const piece = state.piece
  const position = { x: piece.position.x, y: piece.position.y + 1 }

  if (collides(state.board, piece.shape, position)) return lock(state, rng)

  return { ...state, piece: { ...piece, position } }
}

/**
 * Straight down to the stack and locked there. The original had no hard drop; it
 * is the same landing gravity would reach, taken in one step, and scores nothing
 * extra — the original's score was the swept rows alone.
 */
export const hardDrop = (state: GameState, rng: Rng = Math.random): GameState => {
  if (!canPlay(state)) return state

  const piece = state.piece
  let position = piece.position

  while (!collides(state.board, piece.shape, { x: position.x, y: position.y + 1 })) {
    position = { x: position.x, y: position.y + 1 }
  }

  return lock({ ...state, piece: { ...piece, position } }, rng)
}
