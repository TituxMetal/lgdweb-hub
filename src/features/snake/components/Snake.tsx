import { useEffect } from 'react'
import { BackToList } from '~/components/BackToList'
import { useSnakeGame } from '../hooks/useSnakeGame'
import { MAX_HIGH_SCORES } from '../lib/highScore'
import type { Direction, GameStatus, GridSize } from '../types'
import { SnakeCanvas } from './SnakeCanvas'
import { TouchControls } from './TouchControls'

const BLOCK_SIZE = 30
const GRID_SIZE: GridSize = { width: 30, height: 20 }

const ARROW_KEY_TO_DIRECTION: Record<string, Direction> = {
  ArrowLeft: 'left',
  ArrowRight: 'right',
  ArrowUp: 'up',
  ArrowDown: 'down'
}

const StatusBadge = ({ status }: { status: GameStatus }) => {
  if (status === 'running') {
    return (
      <span className='inline-flex items-center gap-1.5 rounded-full bg-blue-400/10 px-2 py-0.5 text-xs font-medium text-blue-400'>
        <span className='size-1.5 animate-pulse rounded-full bg-blue-400' aria-hidden='true' />
        En cours
      </span>
    )
  }

  if (status === 'over') {
    return (
      <span className='inline-flex items-center rounded-full bg-neutral-700 px-2 py-0.5 text-xs font-medium text-neutral-100'>
        Game Over
      </span>
    )
  }

  return (
    <span className='inline-flex items-center rounded-full bg-neutral-700 px-2 py-0.5 text-xs font-medium text-neutral-300'>
      En attente
    </span>
  )
}

const formatScore = (value: number): string => value.toString().padStart(2, '0')

type ScoreSlot = { rank: number; score: number | undefined }

const HighScoresPanel = ({ scores }: { scores: number[] }) => {
  const slots: ScoreSlot[] = Array.from({ length: MAX_HIGH_SCORES }, (_, index) => ({
    rank: index + 1,
    score: scores[index]
  }))

  return (
    <ol
      aria-label={`Top ${MAX_HIGH_SCORES} scores`}
      className='flex w-full items-baseline justify-center gap-3 font-mono text-xs tabular-nums sm:gap-5'
    >
      {slots.map((slot) => (
        <li key={slot.rank} className='flex items-baseline gap-1.5'>
          <span className='text-neutral-400'>{slot.rank}.</span>
          <span
            className={
              slot.score !== undefined ? 'font-semibold text-lime-400' : 'text-neutral-500'
            }
          >
            {slot.score !== undefined ? formatScore(slot.score) : '—'}
          </span>
        </li>
      ))}
    </ol>
  )
}

export const Snake = () => {
  const { state, start, setDirection, highScores } = useSnakeGame({ gridSize: GRID_SIZE })
  const best = highScores[0] ?? 0

  // Locks the page against pull-to-refresh and rubber-band scroll while on
  // Snake — restored on unmount so other routes behave normally.
  useEffect(() => {
    const html = document.documentElement
    const previousOverscroll = html.style.overscrollBehaviorY
    html.style.overscrollBehaviorY = 'contain'
    return () => {
      html.style.overscrollBehaviorY = previousOverscroll
    }
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault()
        if (state.status !== 'running') start()
        return
      }

      const direction = ARROW_KEY_TO_DIRECTION[event.key]
      if (direction === undefined) return

      event.preventDefault()
      setDirection(direction)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [start, setDirection, state.status])

  return (
    <section className='space-y-4'>
      <BackToList />

      <header className='flex flex-wrap items-center justify-between gap-3'>
        <div className='flex items-center gap-3'>
          <h2 className='font-medium text-neutral-100'>Snake</h2>
          <StatusBadge status={state.status} />
        </div>
        <dl className='flex items-center gap-4 font-mono text-sm tabular-nums'>
          <div className='flex items-center gap-1.5'>
            <dt className='text-neutral-400'>Score</dt>
            <dd className='font-semibold text-blue-400'>{formatScore(state.score)}</dd>
          </div>
          <div className='flex items-center gap-1.5'>
            <dt className='text-neutral-400'>Best</dt>
            <dd className='font-semibold text-lime-400'>{formatScore(best)}</dd>
          </div>
        </dl>
      </header>

      <div className='flex flex-col items-center gap-4'>
        <SnakeCanvas state={state} blockSize={BLOCK_SIZE} />
        <TouchControls onDirection={setDirection} onStart={start} status={state.status} />
      </div>

      <div className='flex flex-col items-center gap-1.5 border-t border-neutral-800 pt-3'>
        <p className='font-mono text-[10px] tracking-wider text-neutral-400 uppercase'>
          Top {MAX_HIGH_SCORES}
        </p>
        <HighScoresPanel scores={highScores} />
      </div>

      <p className='text-center text-xs text-neutral-400'>
        Flèches ou boutons pour diriger · Espace pour démarrer / recommencer
      </p>
    </section>
  )
}
