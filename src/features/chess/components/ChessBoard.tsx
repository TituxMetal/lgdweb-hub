import { memo, useMemo } from 'react'
import { Chessboard } from 'react-chessboard'
import { resolvePosition } from '../lib/moves'

type ChessBoardProps = {
  /** The position to draw: a FEN, or the original's `startpos` keyword. */
  position: string
  /** Whether a visitor may move the pieces: the chapters that show a position for
   *  reading pass `false`. */
  interactive?: boolean
  /** Called with the move a visitor played. Answering `false` for a move the rules
   *  do not allow returns the piece to its square — the original answered `true`
   *  whatever was played and left the parent to put an illegal piece back. */
  onMove?: (move: { from: string; to: string }) => boolean
}

/**
 * The original's board (`entities/chessboard/ChessBoard.tsx`), on the same renderer
 * and with the same size and shadow: the era's look is the library's default board,
 * which the original configured in no other way.
 *
 * Memoised, as the original was: a screen that re-renders for a reason the board
 * does not care about — a keystroke in a move field, a chapter's text arriving —
 * leaves it alone, and only a change of the position re-parses it.
 */
export const ChessBoard = memo(({ position, interactive = true, onMove }: ChessBoardProps) => {
  const resolved = useMemo(() => resolvePosition(position), [position])

  return (
    <div className='mx-auto w-full max-w-[280px] md:max-w-[500px]'>
      <Chessboard
        options={{
          position: resolved,
          allowDragging: interactive,
          onPieceDrop: ({ sourceSquare, targetSquare }) =>
            targetSquare !== null && onMove !== undefined
              ? onMove({ from: sourceSquare, to: targetSquare })
              : false,
          boardStyle: {
            borderRadius: '4px',
            // The original's own shadow (`ChessBoard.tsx:67`), anchored on the nearest
            // non-pure neighbour to the black it wrote.
            boxShadow: '0 2px 10px rgba(10, 10, 10, 0.5)' // Tailwind neutral-950 at 50%
          }
        }}
      />
    </div>
  )
})
