import type { GameState, Mark, PlayerKey } from '../types'
import { createBoard, findWinner, isBoardFull, markForMove, placeMark } from './rules'

/** `X` is "Joueur un" and `O` is "Joueur deux" (app.js:1-2, :49-59). */
const PLAYER_OF_MARK: Record<Mark, PlayerKey> = {
  X: 'playerOne',
  O: 'playerTwo'
}

/** The two player names, as the original's score panel writes them (app.js:49-59). */
export const PLAYER_LABELS: Record<PlayerKey, string> = {
  playerOne: 'Joueur un',
  playerTwo: 'Joueur deux'
}

export const createInitialState = (): GameState => ({
  board: createBoard(),
  moveCount: 0,
  score: { playerOne: 0, playerTwo: 0 },
  outcome: null
})

/**
 * One click. Order matters, and mirrors the original `play()` + `playerWin()`:
 * a click on an occupied square is swallowed without consuming a turn
 * (app.js:15-17), the winning line is looked up right after the mark lands
 * (app.js:61-117), and a full board only reaches the draw branch when no line
 * matched (app.js:118-121) — so a winning ninth move is a win, not a draw.
 */
export const play = (state: GameState, position: number): GameState => {
  if (state.outcome !== null) return state

  const mark = markForMove(state.moveCount)
  const board = placeMark(state.board, position, mark)
  if (board === null) return state

  const moveCount = state.moveCount + 1
  const winner = findWinner(board)

  if (winner !== null) {
    const score =
      winner === 'X'
        ? { playerOne: state.score.playerOne + 1, playerTwo: state.score.playerTwo }
        : { playerOne: state.score.playerOne, playerTwo: state.score.playerTwo + 1 }

    return { board, moveCount, score, outcome: { kind: 'win', winner } }
  }

  if (isBoardFull(board)) {
    return { board, moveCount, score: state.score, outcome: { kind: 'draw' } }
  }

  return { board, moveCount, score: state.score, outcome: null }
}

/** Clears the board and the move counter, and keeps the score (app.js:20-23). */
export const startNextRound = (state: GameState): GameState => ({
  board: createBoard(),
  moveCount: 0,
  score: state.score,
  outcome: null
})

export const currentPlayer = (state: GameState): PlayerKey =>
  PLAYER_OF_MARK[markForMove(state.moveCount)]
