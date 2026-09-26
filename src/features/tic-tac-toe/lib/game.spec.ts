import { describe, expect, it } from 'bun:test'
import type { GameState } from '../types'
import { createInitialState, currentPlayer, play, startNextRound } from './game'

/** Plays a list of cell positions, one click each, from the current state. */
const playAll = (state: GameState, positions: ReadonlyArray<number>): GameState =>
  positions.reduce((current, position) => play(current, position), state)

const WIN_ROUND: ReadonlyArray<number> = [0, 3, 1, 4, 2]
const DRAW_ROUND: ReadonlyArray<number> = [0, 1, 2, 4, 3, 5, 7, 6, 8]
/** Nine moves; only the ninth completes a line (0, 1, 2 for `X`). */
const LATE_WIN_ROUND: ReadonlyArray<number> = [1, 4, 2, 5, 3, 7, 6, 8, 0]

describe('play', () => {
  it('alternates turns, X first then O', () => {
    const afterOne = play(createInitialState(), 0)
    const afterTwo = play(afterOne, 1)

    expect(afterOne.board[0]).toBe('X')
    expect(afterTwo.board[1]).toBe('O')
    expect(afterTwo.moveCount).toBe(2)
    expect(currentPlayer(afterTwo)).toBe('playerOne')
  })

  it('swallows a click on an occupied cell without consuming a turn', () => {
    const before = play(createInitialState(), 4)
    const after = play(before, 4)

    expect(after).toBe(before)
    expect(after.moveCount).toBe(1)
    expect(currentPlayer(after)).toBe('playerTwo')
  })

  it('scores a win for the player who owns the winning mark', () => {
    const state = playAll(createInitialState(), WIN_ROUND)

    expect(state.outcome).toEqual({ kind: 'win', winner: 'X' })
    expect(state.score).toEqual({ playerOne: 1, playerTwo: 0 })
    expect(state.moveCount).toBe(5)
  })

  it('scores the second player when O takes the line', () => {
    const state = playAll(createInitialState(), [0, 3, 1, 4, 8, 5])

    expect(state.outcome).toEqual({ kind: 'win', winner: 'O' })
    expect(state.score).toEqual({ playerOne: 0, playerTwo: 1 })
  })

  it('declares a draw on the ninth move when no line matched, and changes no score', () => {
    const state = playAll(createInitialState(), DRAW_ROUND)

    expect(state.outcome).toEqual({ kind: 'draw' })
    expect(state.score).toEqual({ playerOne: 0, playerTwo: 0 })
    expect(state.moveCount).toBe(9)
  })

  it('treats a winning ninth move as a win, not a draw', () => {
    const state = playAll(createInitialState(), LATE_WIN_ROUND)

    expect(state.moveCount).toBe(9)
    expect(state.outcome).toEqual({ kind: 'win', winner: 'X' })
    expect(state.score).toEqual({ playerOne: 1, playerTwo: 0 })
  })

  it('freezes the board once the round is over', () => {
    const won = playAll(createInitialState(), WIN_ROUND)

    expect(play(won, 5)).toBe(won)
    expect(play(won, 8)).toBe(won)
  })
})

describe('startNextRound', () => {
  it('clears the board and the turn counter, and keeps the score', () => {
    const won = playAll(createInitialState(), WIN_ROUND)
    const next = startNextRound(won)

    expect(next.board.every((cell) => cell === null)).toBe(true)
    expect(next.moveCount).toBe(0)
    expect(next.outcome).toBeNull()
    expect(next.score).toEqual({ playerOne: 1, playerTwo: 0 })
    expect(currentPlayer(next)).toBe('playerOne')
  })
})
