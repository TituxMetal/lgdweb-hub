import { Chess, DEFAULT_POSITION, validateFen } from 'chess.js'

/** The position every chapter starts from unless it names another. */
export const STARTING_FEN = DEFAULT_POSITION

/** The keywords the original's content used for "the starting position". */
const START_KEYWORDS = ['start', 'startpos']

/** A move the engine accepted on a position. */
export type AppliedMove = {
  /** The position the move leaves behind. */
  fen: string
  /** The move as its `from` square followed by its `to` square — how the content
   * and the questions name one. */
  uci: string
}

/**
 * Plays what the engine reads as a move, or answers `null` when it reads nothing,
 * refuses it, or cannot load the position at all. Every way into the board comes
 * through here, so no bad position and no bad entry can reach a screen.
 */
const play = (
  fen: string,
  move: string | { from: string; to: string; promotion: 'q' }
): AppliedMove | null => {
  try {
    const game = new Chess(fen)
    const played = game.move(move)

    if (played === null) return null

    return { fen: game.fen(), uci: `${played.from}${played.to}` }
  } catch {
    return null
  }
}

/**
 * The position a chapter shows: the original's `startpos` keyword becomes the
 * starting FEN, and a position the engine refuses becomes the starting position
 * too. The original's board fell back to the same place (`ChessBoard.tsx:33-40`),
 * but tested for six space-separated fields instead of asking the engine, so the
 * archived content carries positions its naive check let through and no board can
 * draw — the port's fallback is where those land.
 */
export const resolvePosition = (position: string | undefined): string => {
  if (position === undefined || START_KEYWORDS.includes(position)) return STARTING_FEN
  if (position === STARTING_FEN) return position

  return isPosition(position) ? position : STARTING_FEN
}

/** Whether the engine reads a position as a legal one. */
export const isPosition = (position: string): boolean => validateFen(position).ok

/**
 * Plays a move on a position, or answers `null` when the move is not legal there.
 * Promotion always takes the queen, which is what the original did for every move
 * a visitor played.
 */
export const applyMove = (fen: string, from: string, to: string): AppliedMove | null =>
  play(fen, { from, to, promotion: 'q' })

/**
 * The same for what a visitor typed into the move field: standard algebraic
 * notation (`e4`, `Nf3`) or the two squares (`e2e4`). The engine reads the piece
 * letters of the notation as capital, so an entry of squares is tried as it was
 * typed after an entry of squares in its lower case.
 */
export const applyNotation = (fen: string, notation: string): AppliedMove | null => {
  const wanted = notation.trim()

  if (wanted === '') return null

  return play(fen, wanted) ?? play(fen, wanted.toLowerCase())
}
