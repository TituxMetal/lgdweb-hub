import { SPEEDS } from '../lib/speed'

/**
 * The toolbar: the original's `justify-content: space-evenly` row of unstyled
 * buttons, kept as a row and given the era's own colours — the cream text, the
 * grey borders, and the secondary orange the original declared without ever
 * using, which now marks the states the original had no way to show.
 */
const BUTTON =
  'cursor-pointer border border-neutral-500 bg-neutral-700 px-2.5 py-1 text-orange-100 hover:border-orange-600 hover:text-orange-600 focus-visible:border-orange-600 focus-visible:text-orange-600 focus-visible:outline-none'

const ACTIVE = 'border-orange-600 text-orange-600'

const SELECT = 'cursor-pointer border border-neutral-500 bg-neutral-700 px-1.5 py-1 text-orange-100'

const TOGGLE = `${BUTTON} aria-pressed:border-orange-600 aria-pressed:text-orange-600`

type ControlsProps = {
  generation: number
  running: boolean
  torus: boolean
  speedId: string
  onToggleRunning: () => void
  onStep: () => void
  onClear: () => void
  onRandomize: () => void
  onToggleTorus: () => void
  onSpeedChange: (id: string) => void
}

export const Controls = ({
  generation,
  running,
  torus,
  speedId,
  onToggleRunning,
  onStep,
  onClear,
  onRandomize,
  onToggleTorus,
  onSpeedChange
}: ControlsProps) => (
  <section className='flex w-full flex-wrap items-center justify-evenly gap-x-2 gap-y-2 p-2 text-sm'>
    <button
      type='button'
      onClick={onToggleRunning}
      className={running ? `${BUTTON} ${ACTIVE}` : BUTTON}
    >
      {running ? 'Pause' : 'Démarrer'}
    </button>

    <button type='button' onClick={onStep} className={BUTTON}>
      Suivant
    </button>

    <button type='button' onClick={onRandomize} className={BUTTON}>
      Aléatoire
    </button>

    <button type='button' onClick={onClear} className={BUTTON}>
      Effacer
    </button>

    <button type='button' onClick={onToggleTorus} aria-pressed={torus} className={TOGGLE}>
      Mode tore
    </button>

    <label className='flex items-center gap-2 text-orange-100'>
      Vitesse
      <select
        value={speedId}
        onChange={(event) => onSpeedChange(event.target.value)}
        className={SELECT}
      >
        {SPEEDS.map((speed) => (
          <option key={speed.id} value={speed.id}>
            {speed.label}
          </option>
        ))}
      </select>
    </label>

    <span className='font-mono text-orange-100 tabular-nums'>Génération : {generation}</span>
  </section>
)
