import type { Direction, GameStatus } from '../types'

type TouchControlsProps = {
  onDirection: (direction: Direction) => void
  onStart: () => void
  status: GameStatus
}

const directionPadClass =
  'flex h-11 cursor-pointer touch-none items-center justify-center rounded-md border border-neutral-700/60 bg-neutral-800/40 text-2xl text-neutral-300 backdrop-blur-sm transition-colors select-none hover:bg-neutral-700/80 hover:text-neutral-100 active:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400'

const startButtonLabel = (status: GameStatus): string => {
  if (status === 'over') return 'Recommencer'
  return 'Démarrer'
}

// `onPointerDown` fires immediately when the finger lands (~0 ms) while
// `onClick` waits for the synthesized click after touchend (~50–100 ms on
// mobile). Wiring both gives instant touch response *and* keeps keyboard
// activation (Tab + Space/Enter) working. Duplicate calls are absorbed by
// `setDirection`'s queue dedup, and `start` is guarded against re-entry.
export const TouchControls = ({ onDirection, onStart, status }: TouchControlsProps) => {
  const fireDirection = (direction: Direction) => () => onDirection(direction)

  return (
    <div className='relative grid w-full grid-cols-2 gap-1.5 pointer-fine:max-w-md'>
      <button
        type='button'
        onPointerDown={fireDirection('up')}
        onClick={fireDirection('up')}
        className={`${directionPadClass} col-span-2`}
        aria-label='Aller en haut'
      >
        ↑
      </button>
      <button
        type='button'
        onPointerDown={fireDirection('left')}
        onClick={fireDirection('left')}
        className={directionPadClass}
        aria-label='Aller à gauche'
      >
        ←
      </button>
      <button
        type='button'
        onPointerDown={fireDirection('right')}
        onClick={fireDirection('right')}
        className={directionPadClass}
        aria-label='Aller à droite'
      >
        →
      </button>
      <button
        type='button'
        onPointerDown={fireDirection('down')}
        onClick={fireDirection('down')}
        className={`${directionPadClass} col-span-2`}
        aria-label='Aller en bas'
      >
        ↓
      </button>

      {status !== 'running' && (
        <button
          type='button'
          onPointerDown={onStart}
          onClick={onStart}
          className='absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 cursor-pointer touch-none rounded-md bg-blue-400 px-6 py-3 text-sm font-bold tracking-wider text-neutral-900 uppercase transition-colors select-none hover:bg-blue-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400'
        >
          {startButtonLabel(status)}
        </button>
      )}
    </div>
  )
}
