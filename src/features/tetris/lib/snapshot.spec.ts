import { describe, expect, it } from 'bun:test'
import { GRID_HEIGHT, GRID_WIDTH, parseClientMessage } from '~/shared/tetrisProtocol'
import type { GameState } from '../types'
import { createInitialState } from './game'
import { createShape } from './pieces'
import { toPeerSnapshot } from './snapshot'

/**
 * What leaves the feature: the board a player shows the player beside them.
 *
 * The point of these cases is the seam — the endpoint validates every frame a
 * client sends, so a snapshot this feature produces has to be one that endpoint
 * accepts, and it has to carry the falling piece rather than only the stack it
 * will join.
 */

const running = (state: GameState): GameState => ({ ...state, status: 'running' })

describe('toPeerSnapshot', () => {
  it('relays a board the endpoint itself accepts, at the arena’s size', () => {
    const snapshot = toPeerSnapshot(createInitialState(() => 0))

    expect(snapshot.grid).toHaveLength(GRID_HEIGHT)
    expect(snapshot.grid[0]).toHaveLength(GRID_WIDTH)
    expect(parseClientMessage(JSON.stringify({ type: 'stateUpdate', state: snapshot }))).toEqual({
      type: 'stateUpdate',
      state: snapshot
    })
  })

  it('relays the falling piece, so the opponent watches it fall rather than appear', () => {
    const state = running({
      ...createInitialState(() => 0),
      piece: { type: 'T', shape: createShape('T'), position: { x: 0, y: 0 } }
    })

    const { grid } = toPeerSnapshot(state)

    // The T's own grid is filled at (0, 0), (1, 0), (2, 0) and (1, 1).
    expect(grid[0]?.[0]).toBe('T')
    expect(grid[0]?.[1]).toBe('T')
    expect(grid[0]?.[2]).toBe('T')
    expect(grid[1]?.[1]).toBe('T')
  })

  it('leaves the player’s own board untouched', () => {
    const state = running({
      ...createInitialState(() => 0),
      piece: { type: 'I', shape: createShape('I'), position: { x: 0, y: 0 } }
    })

    const { grid } = toPeerSnapshot(state)

    expect(state.board.every((row) => row.every((cell) => cell === null))).toBe(true)
    expect(grid.some((row) => row.some((cell) => cell === 'I'))).toBe(true)
    expect(grid).not.toBe(state.board)
  })

  it('carries the score and the status the player’s own game reports', () => {
    const state: GameState = { ...createInitialState(() => 0), status: 'paused', score: 120 }

    expect(toPeerSnapshot(state)).toMatchObject({ score: 120, status: 'paused' })
  })
})
