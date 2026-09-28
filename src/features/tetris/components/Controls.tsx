import type { Move, Turn } from '../types'

type ControlsProps = {
  running: boolean
  onMove: (direction: Move) => void
  onRotate: (turn: Turn) => void
  onSoftDrop: () => void
  onHardDrop: () => void
}

type Control = {
  label: string
  glyph: string
  /** Literal, not built from a number: Tailwind only emits what it can read in the source. */
  span: 'col-span-2' | 'col-span-3'
  fire: () => void
}

const buttonClass =
  'flex h-12 cursor-pointer touch-none items-center justify-center rounded-md border border-neutral-500/60 bg-neutral-700 text-xl text-neutral-100 transition-colors select-none hover:bg-neutral-600 active:bg-neutral-500 disabled:cursor-default disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-100'

/**
 * The five moves, as buttons that stay on screen at every width, with no device
 * detection behind them and the keyboard running alongside. They are the pad a
 * phone is driven with; the keyboard bindings (`useTetrisGame`) are the same five
 * moves for a desk.
 *
 * A press fires on click alone: the keys repeat by themselves, and one row a tap
 * is the soft drop the original's `drop()` gave the down arrow. Focus is returned
 * to the page after a press, so the next Space reaches the game instead of
 * pressing the button again.
 */
export const Controls = ({ running, onMove, onRotate, onSoftDrop, onHardDrop }: ControlsProps) => {
  const controls: readonly Control[] = [
    { label: 'Tourner la pièce', glyph: '⟳', span: 'col-span-3', fire: () => onRotate(1) },
    { label: 'Faire tomber la pièce', glyph: '⤓', span: 'col-span-3', fire: onHardDrop },
    { label: 'Déplacer vers la gauche', glyph: '←', span: 'col-span-2', fire: () => onMove(-1) },
    { label: 'Descente d’une ligne', glyph: '↓', span: 'col-span-2', fire: onSoftDrop },
    { label: 'Déplacer vers la droite', glyph: '→', span: 'col-span-2', fire: () => onMove(1) }
  ]

  return (
    <div className='grid w-full max-w-sm grid-cols-6 gap-2'>
      {controls.map((control) => (
        <button
          key={control.label}
          type='button'
          aria-label={control.label}
          disabled={!running}
          onClick={(event) => {
            control.fire()
            event.currentTarget.blur()
          }}
          className={`${buttonClass} ${control.span}`}
        >
          <span aria-hidden='true'>{control.glyph}</span>
        </button>
      ))}
    </div>
  )
}
