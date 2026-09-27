import { useCallback, useEffect, useRef, useState } from 'react'
import {
  createGrid,
  nextGeneration,
  randomGrid,
  seedGlider,
  setCell,
  stampPattern
} from '../lib/grid'
import { DEFAULT_PATTERN_ID, patternById } from '../lib/patterns'
import { DEFAULT_SPEED_ID, speedInterval } from '../lib/speed'
import type { CellState, Grid, GridSize } from '../types'

type UseGameOfLifeInput = {
  size: GridSize
}

/** A frame this late means the tab was not drawing: catch up one generation, not all of them. */
const STALLED_FRAME_MS = 1000

type GameOfLifeController = {
  grid: Grid
  generation: number
  running: boolean
  torus: boolean
  speedId: string
  patternId: string
  step: () => void
  toggleRunning: () => void
  clear: () => void
  randomize: () => void
  stamp: () => void
  toggleTorus: () => void
  setSpeedId: (id: string) => void
  setPatternId: (id: string) => void
  paintCell: (row: number, col: number, state: CellState) => void
}

/**
 * The viewer's state and its one loop. The board is replaced whole on every
 * change — a new array per generation is what tells the canvas to repaint, and
 * what keeps the loop reading the generation it is actually stepping.
 */
export const useGameOfLife = ({ size }: UseGameOfLifeInput): GameOfLifeController => {
  const [grid, setGrid] = useState<Grid>(() => seedGlider(createGrid(size)))
  const [generation, setGeneration] = useState(0)
  const [running, setRunning] = useState(false)
  // The original's viewer ran in torus mode (`App.js` passes `torus`), and its
  // manifest copy still promises "Mode tore disponible".
  const [torus, setTorus] = useState(true)
  const [speedId, setSpeedId] = useState(DEFAULT_SPEED_ID)
  const [patternId, setPatternId] = useState(DEFAULT_PATTERN_ID)

  // The loop reads the neighbourhood through a ref: switching it must not restart
  // the animation frame, nor reset the time it has accumulated.
  const torusRef = useRef(torus)
  useEffect(() => {
    torusRef.current = torus
  }, [torus])

  const step = useCallback(() => {
    setGrid((current) => nextGeneration(current, { torus: torusRef.current }))
    setGeneration((count) => count + 1)
  }, [])

  // The loop, released with the feature: the animation frame is cancelled
  // whenever the visitor pauses or changes the speed, and on unmount, so nothing
  // keeps stepping once they have left the page.
  useEffect(() => {
    if (!running) return

    const interval = speedInterval(speedId)
    let previous = performance.now()
    let accumulated = 0
    let frame = 0

    const advance = (now: number) => {
      accumulated += now - previous
      previous = now

      // A tab in the background stops receiving frames; without a ceiling the
      // first frame back would run every generation it missed in one go.
      if (accumulated > STALLED_FRAME_MS) accumulated = interval

      while (accumulated >= interval) {
        accumulated -= interval
        step()
      }

      frame = requestAnimationFrame(advance)
    }

    frame = requestAnimationFrame(advance)

    return () => cancelAnimationFrame(frame)
  }, [running, speedId, step])

  const toggleRunning = useCallback(() => setRunning((value) => !value), [])

  // Clearing and seeding replace the board, so the generation counter starts
  // again with it — the number counts the generations of what is on screen.
  const clear = useCallback(() => {
    setGrid(createGrid(size))
    setGeneration(0)
  }, [size])

  const randomize = useCallback(() => {
    setGrid(randomGrid(size))
    setGeneration(0)
  }, [size])

  // A pattern is stamped onto the board as it stands — an edit, like drawing, not
  // a reseed — so the generation counter keeps counting what is on screen.
  const stamp = useCallback(() => {
    const pattern = patternById(patternId)
    if (pattern === undefined) return

    setGrid((current) => stampPattern(current, pattern))
  }, [patternId])

  const toggleTorus = useCallback(() => setTorus((value) => !value), [])

  const paintCell = useCallback((row: number, col: number, state: CellState) => {
    setGrid((current) => setCell(current, row, col, state))
  }, [])

  return {
    grid,
    generation,
    running,
    torus,
    speedId,
    patternId,
    step,
    toggleRunning,
    clear,
    randomize,
    stamp,
    toggleTorus,
    setSpeedId,
    setPatternId,
    paintCell
  }
}
