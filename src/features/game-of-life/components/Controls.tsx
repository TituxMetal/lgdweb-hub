import { PATTERNS } from '../lib/patterns'
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
  patternId: string
  onToggleRunning: () => void
  onStep: () => void
  onClear: () => void
  onRandomize: () => void
  onToggleTorus: () => void
  onSpeedChange: (id: string) => void
  onPatternChange: (id: string) => void
  onStamp: () => void
}

export const Controls = ({
  generation,
  running,
  torus,
  speedId,
  patternId,
  onToggleRunning,
  onStep,
  onClear,
  onRandomize,
  onToggleTorus,
  onSpeedChange,
  onPatternChange,
  onStamp
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

    {/* The label names the select alone: a label owns a single labelable
        descendant, and the stamp button is one too. The row stays a group, so
        the button and the note are its siblings rather than its contents. */}
    <div className='flex items-center gap-2 text-orange-100'>
      <label className='flex items-center gap-2'>
        Motif
        <select
          value={patternId}
          onChange={(event) => onPatternChange(event.target.value)}
          className={SELECT}
        >
          {PATTERNS.map((pattern) => (
            <option key={pattern.id} value={pattern.id}>
              {pattern.label}
            </option>
          ))}
        </select>
      </label>
      <button type='button' onClick={onStamp} className={BUTTON}>
        Poser
      </button>
      <span className='max-w-56 text-xs text-orange-100/70'>
        {PATTERNS.find((pattern) => pattern.id === patternId)?.note}
      </span>
    </div>

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
