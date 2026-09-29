import { memo } from 'react'
import { displayBoard } from '../lib/board'
import type { GameState, Move, Turn } from '../types'
import { Board } from './Board'
import { Controls } from './Controls'
import { NextPiecePreview } from './NextPiecePreview'
import { StatusOverlay } from './StatusOverlay'

type PlayerPanelProps = {
  state: GameState
  onStart: () => void
  onMove: (direction: Move) => void
  onRotate: (turn: Turn) => void
  onSoftDrop: () => void
  onHardDrop: () => void
}

/**
 * One player's own game: the score, the piece behind the falling one, the field
 * with the five buttons under it — all of them live at once, with no device
 * detection and no swipes.
 *
 * It is one panel because it is one game, whether the visitor plays alone or with
 * a friend beside them: the room mode changes what stands next to it, never what
 * it is. The keys come from the game hook above both layouts, so they keep working
 * either way.
 *
 * Memoised: the plate re-renders whenever the other player's board arrives, and
 * this panel draws a game none of those frames moved — the state the game hands
 * back keeps its reference until a real move, and the handlers are stable.
 */
export const PlayerPanel = memo(
  ({ state, onStart, onMove, onRotate, onSoftDrop, onHardDrop }: PlayerPanelProps) => {
    const running = state.status === 'running'

    return (
      <div className='flex flex-col items-center gap-4'>
        <div className='flex w-full max-w-sm items-start justify-between gap-4'>
          <dl className='font-mono tabular-nums'>
            <dt className='text-[10px] tracking-wider text-neutral-500 uppercase'>Score</dt>
            <dd className='text-xl font-semibold text-neutral-300'>{state.score}</dd>
          </dl>

          {/* A finished game's bag is replaced by the next start, so the preview
            would be promising a piece that never falls. */}
          {state.status !== 'over' && <NextPiecePreview queue={state.queue} />}
        </div>

        <Board grid={displayBoard(state)}>
          <StatusOverlay status={state.status} onStart={onStart} />
        </Board>

        <Controls
          running={running}
          onMove={onMove}
          onRotate={onRotate}
          onSoftDrop={onSoftDrop}
          onHardDrop={onHardDrop}
        />
      </div>
    )
  }
)
