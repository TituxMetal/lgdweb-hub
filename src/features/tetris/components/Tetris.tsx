import { BackToList } from '~/components/BackToList'
import { useTetrisGame } from '../hooks/useTetrisGame'
import { Board } from './Board'
import { Controls } from './Controls'
import { NextPiecePreview } from './NextPiecePreview'
import { StatusOverlay } from './StatusOverlay'

/**
 * Tetris, solo: the field, the piece behind the falling one, the score, the five
 * buttons and the keys — all of them live at once, with no device detection and
 * no swipes. The visitor's game lives on the plate the original's page was, and
 * the shell owns everything around it.
 */
export const Tetris = () => {
  const { state, start, move, rotate, softDrop, hardDrop, togglePause } = useTetrisGame()
  const running = state.status === 'running'
  // The pause belongs to a game under way, not to one that never started or is
  // already over.
  const playing = running || state.status === 'paused'

  return (
    <section className='space-y-4'>
      <BackToList />

      <header className='flex min-h-8 flex-wrap items-center justify-between gap-3'>
        <h2 className='font-medium text-neutral-100'>Tetris</h2>
        {playing && (
          <button
            type='button'
            onClick={togglePause}
            className='cursor-pointer rounded-md border border-neutral-500/60 px-3 py-1.5 text-xs text-neutral-300 transition-colors select-none hover:bg-neutral-700'
          >
            {running ? 'Pause' : 'Reprendre'}
          </button>
        )}
      </header>

      <div className='mx-auto flex w-full max-w-md flex-col items-center gap-4 rounded-md bg-neutral-800 px-4 py-6'>
        <div className='flex w-full max-w-sm items-start justify-between gap-4'>
          <dl className='font-mono tabular-nums'>
            <dt className='text-[10px] tracking-wider text-neutral-500 uppercase'>Score</dt>
            <dd className='text-xl font-semibold text-neutral-300'>{state.score}</dd>
          </dl>

          {/* A finished game's bag is replaced by the next start, so the preview
              would be promising a piece that never falls. */}
          {state.status !== 'over' && <NextPiecePreview queue={state.queue} />}
        </div>

        <Board state={state}>
          <StatusOverlay status={state.status} onStart={start} />
        </Board>

        <Controls
          running={running}
          onMove={move}
          onRotate={rotate}
          onSoftDrop={softDrop}
          onHardDrop={hardDrop}
        />
      </div>

      <p className='text-center text-xs text-neutral-500'>
        Flèches ou boutons pour déplacer · W, X ou Z pour tourner · Espace pour la chute rapide · P
        pour la pause
      </p>
    </section>
  )
}
