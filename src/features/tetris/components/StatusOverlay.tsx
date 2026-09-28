import type { GameStatus } from '../types'

type StatusOverlayProps = {
  status: GameStatus
  onStart: () => void
}

const COPY: Readonly<Record<Exclude<GameStatus, 'running'>, { title: string; action: string }>> = {
  ready: { title: 'Prêt ?', action: 'Démarrer' },
  paused: { title: 'En pause', action: 'Reprendre' },
  over: { title: 'Partie terminée', action: 'Recommencer' }
}

/**
 * What covers the field when nothing is falling: before the first piece, while
 * paused, and once the stack has reached the top, where a finished game offers a
 * restart. The original had no such screen: its end of game cleared the arena,
 * zeroed the score and started a new piece without telling the visitor
 * (`Player.js:57-64`), and its pause left the canvas as it stood.
 */
export const StatusOverlay = ({ status, onStart }: StatusOverlayProps) => {
  if (status === 'running') return null

  const copy = COPY[status]

  return (
    <div className='absolute inset-0 flex flex-col items-center justify-center gap-3 bg-neutral-800/90 text-neutral-50'>
      <p className='text-sm tracking-wide'>{copy.title}</p>
      <button
        type='button'
        onClick={(event) => {
          onStart()
          // Focus goes back to the page, as on the pad: the visitor clicked to
          // start and now drives the piece with the keys, and Space belongs to the
          // game rather than to this button.
          event.currentTarget.blur()
        }}
        className='cursor-pointer rounded-md bg-neutral-100 px-5 py-2.5 text-sm font-medium tracking-wide text-neutral-900 uppercase transition-colors hover:bg-neutral-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-100'
      >
        {copy.action}
      </button>
    </div>
  )
}
