import { describe, expect, it } from 'bun:test'
import type { Board, GameState, PieceType, Position, Shape } from '../types'
import { createBoard } from './board'
import {
  createInitialState,
  DEFAULT_DROP_INTERVAL,
  hardDrop,
  MIN_DROP_INTERVAL,
  move,
  nextDropInterval,
  rotate,
  softDrop,
  start,
  togglePause
} from './game'
import { createShape, PIECE_TYPES } from './pieces'

/** A shape as one string: `###/.#./...` reads as the picture it asserts. */
const cellsOf = (shape: Shape): string =>
  shape.map((row) => row.map((filled) => (filled ? '#' : '.')).join('')).join('/')

/** A board of resting cells: `filled` picks them, empty where it does not. */
const filledWhere = (filled: (x: number, y: number) => boolean, type: PieceType = 'T'): Board =>
  createBoard().map((line, y) => line.map((_, x) => (filled(x, y) ? type : null)))

/** A running game holding `type` at `position`, with whatever the caller pins around it. */
const heldGame = (
  { type, position }: { type: PieceType; position: Position },
  overrides: Partial<GameState> = {}
): GameState => ({
  ...createInitialState(() => 0),
  status: 'running',
  piece: { type, shape: createShape(type), position },
  ...overrides
})

describe('createInitialState', () => {
  it('waits for a start, with an empty board and a bag behind it', () => {
    const state = createInitialState(() => 0)

    expect(state.status).toBe('ready')
    expect(state.piece).toBeNull()
    expect(state.score).toBe(0)
    expect(state.dropInterval).toBe(1000)
    expect(state.queue).toHaveLength(7)
    expect(state.board).toHaveLength(20)
    expect(state.board.every((line) => line.every((cell) => cell === null))).toBe(true)
  })
})

describe('start', () => {
  it('drops a piece from the bag at the top of an empty board', () => {
    const started = start(createInitialState(() => 0))

    expect(started.status).toBe('running')
    expect(PIECE_TYPES.some((type) => type === started.piece?.type)).toBe(true)
    expect(started.piece?.position.y).toBe(0)
    expect(started.queue).toHaveLength(PIECE_TYPES.length - 1)
    expect(started.board.every((line) => line.every((cell) => cell === null))).toBe(true)
  })

  it('starts on the bag it was already holding, so the preview came true', () => {
    const ready: GameState = { ...createInitialState(() => 0), queue: ['L', 'I', 'O'] }
    const started = start(ready)

    expect(started.piece?.type).toBe('L')
    expect(started.piece?.position).toEqual({ x: 5, y: 0 })
    expect(started.queue).toEqual(['I', 'O'])
  })

  it('restarts a finished game from scratch', () => {
    const over: GameState = {
      ...createInitialState(() => 0),
      status: 'over',
      score: 380,
      piece: null,
      board: filledWhere((x, y) => y > 10 && x !== 11),
      dropInterval: 220
    }
    const restarted = start(over)

    expect(restarted.status).toBe('running')
    expect(restarted.score).toBe(0)
    expect(restarted.dropInterval).toBe(DEFAULT_DROP_INTERVAL)
    expect(restarted.board.every((line) => line.every((cell) => cell === null))).toBe(true)
    expect(restarted.piece?.position.y).toBe(0)
  })

  it('resumes a paused game with the stack and the score it had', () => {
    const paused: GameState = {
      ...heldGame({ type: 'T', position: { x: 5, y: 6 } }),
      status: 'paused',
      score: 120
    }
    const resumed = start(paused)

    expect(resumed.status).toBe('running')
    expect(resumed.score).toBe(120)
    expect(resumed.piece?.position).toEqual({ x: 5, y: 6 })
    expect(resumed.board).toBe(paused.board)
  })

  it('leaves a game that is already running alone', () => {
    const running = heldGame({ type: 'O', position: { x: 5, y: 0 } })

    expect(start(running)).toBe(running)
  })
})

describe('move', () => {
  it('slides the piece one column each way', () => {
    const state = heldGame({ type: 'O', position: { x: 5, y: 0 } })

    expect(move(state, -1).piece?.position).toEqual({ x: 4, y: 0 })
    expect(move(state, 1).piece?.position).toEqual({ x: 6, y: 0 })
  })

  it('refuses to slide the piece through a wall', () => {
    const state = heldGame({ type: 'O', position: { x: 0, y: 5 } })

    expect(move(state, -1).piece?.position).toEqual({ x: 0, y: 5 })
    expect(move(state, 1).piece?.position).toEqual({ x: 1, y: 5 })
  })

  it('refuses to slide the piece into the stack', () => {
    const state = heldGame(
      { type: 'O', position: { x: 4, y: 16 } },
      { board: filledWhere((x, y) => x === 3 && y === 17) }
    )

    expect(move(state, -1).piece?.position).toEqual({ x: 4, y: 16 })
  })

  it('does nothing while the game is not running', () => {
    for (const status of ['ready', 'paused', 'over'] as const) {
      const state = heldGame({ type: 'O', position: { x: 5, y: 0 } }, { status })

      expect(move(state, -1)).toBe(state)
      expect(rotate(state, 1)).toBe(state)
      expect(softDrop(state)).toBe(state)
      expect(hardDrop(state)).toBe(state)
    }
  })
})

describe('rotate', () => {
  it('turns the piece in place', () => {
    const state = heldGame({ type: 'T', position: { x: 5, y: 0 } })
    const turned = rotate(state, 1)

    expect(cellsOf(turned.piece?.shape ?? [])).toBe('..#/.##/..#')
    expect(turned.piece?.position).toEqual({ x: 5, y: 0 })
    expect(turned.piece?.type).toBe('T')
  })

  it('turns the piece the other way too', () => {
    const state = heldGame({ type: 'T', position: { x: 5, y: 0 } })

    expect(cellsOf(rotate(state, -1).piece?.shape ?? [])).toBe('#../##./#..')
  })

  it('kicks the piece off the wall it turned into', () => {
    const state = heldGame({ type: 'I', position: { x: 10, y: 0 } })
    const turned = rotate(state, 1)

    expect(cellsOf(turned.piece?.shape ?? [])).toBe('..../####/..../....')
    expect(turned.piece?.position).toEqual({ x: 8, y: 0 })
  })

  it('gives up when the turned piece fits nowhere', () => {
    const state = heldGame(
      { type: 'I', position: { x: 0, y: 0 } },
      { board: filledWhere((x, y) => y < 4 && (x === 0 || x === 2)) }
    )

    expect(rotate(state, 1)).toBe(state)
  })

  it('does not write to the shape it was given', () => {
    const state = heldGame({ type: 'T', position: { x: 5, y: 0 } })
    const before = cellsOf(state.piece?.shape ?? [])

    rotate(state, 1)

    expect(cellsOf(state.piece?.shape ?? [])).toBe(before)
  })
})

describe('soft drop', () => {
  it('falls one row while there is room', () => {
    const state = heldGame({ type: 'O', position: { x: 5, y: 4 } })

    expect(softDrop(state).piece?.position).toEqual({ x: 5, y: 5 })
    expect(softDrop(state).score).toBe(0)
  })

  it('locks the piece into the stack on the floor and drops the next one', () => {
    const state = heldGame({ type: 'O', position: { x: 4, y: 18 } }, { queue: ['J', 'I', 'O'] })
    const locked = softDrop(state, () => 0)

    expect(locked.board[19]?.[4]).toBe('O')
    expect(locked.board[19]?.[5]).toBe('O')
    expect(locked.piece?.type).toBe('J')
    expect(locked.piece?.position).toEqual({ x: 5, y: 0 })
    expect(locked.queue[0]).toBe('I')
  })
})

describe('hard drop', () => {
  it('lands the piece on the floor and locks it', () => {
    const state = heldGame({ type: 'O', position: { x: 4, y: 0 } })
    const landed = hardDrop(state)

    expect(landed.board[18]?.[4]).toBe('O')
    expect(landed.board[19]?.[5]).toBe('O')
    expect(landed.piece?.position).toEqual({ x: 5, y: 0 })
  })

  it('stacks the piece on what already rests there', () => {
    const state = heldGame(
      { type: 'O', position: { x: 4, y: 0 } },
      { board: filledWhere((x, y) => y === 19 && x < 10) }
    )
    const landed = hardDrop(state)

    expect(landed.board[19]?.[4]).toBe('T')
    expect(landed.board[18]?.[4]).toBe('O')
    expect(landed.board[17]?.[5]).toBe('O')
    expect(landed.board[16]?.[4]).toBeNull()
  })

  it('rests a shape with an empty row on the floor, not past it', () => {
    const landed = hardDrop(heldGame({ type: 'T', position: { x: 4, y: 0 } }))

    expect(landed.board[19]?.[5]).toBe('T')
    expect(landed.board[18]?.map((cell) => cell !== null)).toEqual([
      false,
      false,
      false,
      false,
      true,
      true,
      true,
      false,
      false,
      false,
      false,
      false
    ])
  })

  it('deals the queue in order, one piece per landing', () => {
    const state = heldGame({ type: 'O', position: { x: 4, y: 0 } }, { queue: ['J', 'I'] })
    const first = hardDrop(state, () => 0)
    const second = hardDrop(first, () => 0)

    expect(first.piece?.type).toBe('J')
    expect(second.piece?.type).toBe('I')
  })
})

describe('the lock, the score and the speed', () => {
  it('clears the row the piece completed and scores it ten', () => {
    const state = heldGame(
      { type: 'O', position: { x: 4, y: 18 } },
      { board: filledWhere((x, y) => y === 19 && x !== 4 && x !== 5) }
    )
    const locked = softDrop(state, () => 0)

    expect(locked.score).toBe(10)
    expect(locked.dropInterval).toBe(990)
    expect(locked.board[19]?.[4]).toBe('O')
    expect(locked.board[18]?.every((cell) => cell === null)).toBe(true)
  })

  it('scores a four-row pass a hundred, as the original’s cumulative count did', () => {
    const state = heldGame(
      { type: 'I', position: { x: 4, y: 0 } },
      { board: filledWhere((x, y) => y >= 16 && x !== 5) }
    )
    const landed = hardDrop(state, () => 0)

    expect(landed.score).toBe(100)
    expect(landed.dropInterval).toBe(900)
  })

  it('stops the game when the next piece has nowhere to enter', () => {
    // A wall with a notch three cells wide at the top and a well below it: the O
    // slides into the notch, and what it leaves behind roofs the spawn — every
    // tetromino lands on a filled cell, whichever one the bag deals next.
    const state = heldGame(
      { type: 'O', position: { x: 4, y: 0 } },
      {
        board: filledWhere((x, y) => (y <= 2 ? x < 4 || x > 6 : x !== 5)),
        queue: ['T', 'I', 'O', 'S', 'Z', 'J', 'L']
      }
    )
    const landed = hardDrop(state)

    expect(landed.status).toBe('over')
    expect(landed.piece).toBeNull()
    expect(landed.board[1]?.[4]).toBe('O')
    expect(landed.board[2]?.[5]).toBe('O')
    expect(start(landed).status).toBe('running')
  })
})

describe('togglePause', () => {
  it('holds a running game and lets it go', () => {
    const running = heldGame({ type: 'T', position: { x: 5, y: 3 } }, { score: 40 })
    const paused = togglePause(running)

    expect(paused.status).toBe('paused')
    expect(paused.piece).toBe(running.piece)
    expect(paused.score).toBe(40)
    expect(togglePause(paused).status).toBe('running')
  })

  it('leaves a game that never started and a finished one alone', () => {
    const ready = createInitialState(() => 0)
    const over: GameState = { ...ready, status: 'over' }

    expect(togglePause(ready)).toBe(ready)
    expect(togglePause(over)).toBe(over)
  })
})

describe('nextDropInterval', () => {
  it('speeds up by the score of the rows just cleared', () => {
    expect(nextDropInterval(DEFAULT_DROP_INTERVAL, 10)).toBe(990)
    expect(nextDropInterval(1000, 100)).toBe(900)
    expect(nextDropInterval(990, 30)).toBe(960)
  })

  it('holds a floor the original lacked', () => {
    expect(MIN_DROP_INTERVAL).toBe(100)
    expect(nextDropInterval(150, 60)).toBe(100)
    expect(nextDropInterval(110, 10)).toBe(100)
  })
})
