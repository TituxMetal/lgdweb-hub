import { BackToList } from '~/components/BackToList'
import { useGameOfLife } from '../hooks/useGameOfLife'
import type { GridSize } from '../types'
import { Controls } from './Controls'
import { GameCanvas } from './GameCanvas'

/**
 * The board, re-derived for the shell's column. The original cut 36 columns and
 * 20 rows out of a 1440×900 window at 40px per cell; the column is 720px, so the
 * same count would ask for 20px cells. The port keeps the 20 rows and trades six
 * columns for size — 24px cells — so the board still fills the column and the
 * cell a phone scales it down to stays above 11px rather than under 10.
 */
const GRID_SIZE: GridSize = { rows: 20, cols: 30 }

/**
 * The 2019 Game of Life with the viewer it never had: the original's plate,
 * its centred title, its bordered grid and its toolbar, driven by the rules the
 * engine always carried and by the controls the empty viewer left out.
 */
export const GameOfLife = () => {
  const {
    grid,
    generation,
    running,
    torus,
    speedId,
    step,
    toggleRunning,
    clear,
    randomize,
    toggleTorus,
    setSpeedId,
    paintCell
  } = useGameOfLife({ size: GRID_SIZE })

  return (
    <section className='space-y-4'>
      <BackToList />

      <div className='flex flex-wrap justify-center border border-rose-200 bg-neutral-700'>
        <h2 className='w-full p-2 text-center text-3xl text-orange-100'>Game of Life</h2>

        <GameCanvas grid={grid} size={GRID_SIZE} onPaint={paintCell} />

        <Controls
          generation={generation}
          running={running}
          torus={torus}
          speedId={speedId}
          onToggleRunning={toggleRunning}
          onStep={step}
          onClear={clear}
          onRandomize={randomize}
          onToggleTorus={toggleTorus}
          onSpeedChange={setSpeedId}
        />
      </div>

      <p className='text-center text-xs text-neutral-500'>
        Cliquez ou glissez sur la grille pour dessiner · Démarrer lance la simulation · Suivant
        avance d'une génération
      </p>
    </section>
  )
}
