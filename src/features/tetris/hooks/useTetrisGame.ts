import { useCallback, useEffect, useRef, useState } from 'react'
import {
  createInitialState,
  hardDrop as dropToFloor,
  move as slide,
  start as startGame,
  softDrop as stepDown,
  togglePause,
  rotate as turn
} from '../lib/game'
import type { GameState, Move, Turn } from '../types'

/**
 * What one key does, by `KeyboardEvent.code`. The original listened for the key
 * codes 37/39 (sideways), 40 (down), 87 (w) and 88 (x), with 80 for pause
 * (`main.js:15-36`); the port keeps w and x where the original had them — x turns
 * counter-clockwise, so z joins it rather than fighting it — adds the arrows, and
 * reads Space as the hard drop.
 */
type KeyAction =
  | 'left'
  | 'right'
  | 'rotateClockwise'
  | 'rotateCounterClockwise'
  | 'softDrop'
  | 'hardDrop'
  | 'pause'
  | 'start'

const KEY_ACTIONS: Readonly<Record<string, KeyAction>> = {
  ArrowLeft: 'left',
  ArrowRight: 'right',
  ArrowDown: 'softDrop',
  ArrowUp: 'rotateClockwise',
  KeyW: 'rotateClockwise',
  KeyX: 'rotateCounterClockwise',
  KeyZ: 'rotateCounterClockwise',
  KeyP: 'pause',
  Space: 'start'
}

type UseTetrisGameResult = {
  state: GameState
  start: () => void
  move: (direction: Move) => void
  rotate: (turn: Turn) => void
  softDrop: () => void
  hardDrop: () => void
  togglePause: () => void
}

/**
 * The game loop and the visitor's input, the two things the pure rules refuse to
 * know about.
 *
 * The state lives in a ref so the animation frame can advance it without a
 * re-render per gravity step; React is told to repaint through a counter, and only
 * when the state actually moved. The frame runs only while a game is running — a
 * game waiting, paused or over parks the loop — and unmounting cancels it and
 * drops the keydown listener, so leaving the feature stops everything it started.
 */
export const useTetrisGame = (): UseTetrisGameResult => {
  // The first state is built once, through a lazy initializer: `useRef` would
  // evaluate its argument on every render, and this hook renders per frame.
  const [initialState] = useState(createInitialState)
  const stateRef = useRef<GameState>(initialState)
  const rafRef = useRef<number | null>(null)
  const lastTimeRef = useRef(0)
  const accumulatorRef = useRef(0)
  const [, setRenderTick] = useState(0)

  const forceRender = useCallback(() => setRenderTick((tick) => tick + 1), [])

  // Fixed-timestep accumulator, as the shell's other games do it: the frame fires
  // at the screen's refresh rate while gravity steps at `dropInterval`, so the
  // elapsed time is banked and spent a step at a time. The bank is capped at one
  // interval, so a late frame — a hidden tab, a stalled main thread — cannot spend
  // a burst of steps and drop the piece several rows between two paints.
  const loop = useCallback(
    (now: number) => {
      accumulatorRef.current += Math.min(now - lastTimeRef.current, stateRef.current.dropInterval)
      lastTimeRef.current = now

      let advanced = false

      while (
        stateRef.current.status === 'running' &&
        accumulatorRef.current >= stateRef.current.dropInterval
      ) {
        // Read the interval before the step: the step can lower it (a cleared
        // pass speeds the drop up), and subtracting the new one would leave
        // phantom time behind and drift toward early drops.
        accumulatorRef.current -= stateRef.current.dropInterval

        const next = stepDown(stateRef.current)
        if (next !== stateRef.current) {
          stateRef.current = next
          advanced = true
        }
      }

      // Repaint only when the step moved the game: nothing on screen is timed, so
      // a frame that merely elapsed has nothing to show.
      if (advanced) forceRender()

      if (stateRef.current.status !== 'running') {
        rafRef.current = null
        return
      }

      rafRef.current = requestAnimationFrame(loop)
    },
    [forceRender]
  )

  const startLoop = useCallback(() => {
    if (rafRef.current !== null) return
    lastTimeRef.current = performance.now()
    accumulatorRef.current = 0
    rafRef.current = requestAnimationFrame(loop)
  }, [loop])

  // Every rule below answers a refused action with the very state it was given —
  // a piece held against a wall, one that has nowhere to turn, any key while the
  // game is not running. Comparing references is what tells the two apart, so a
  // refused press never repaints the board.
  const start = useCallback(() => {
    const next = startGame(stateRef.current)
    if (next === stateRef.current) return

    stateRef.current = next
    forceRender()
    startLoop()
  }, [forceRender, startLoop])

  const move = useCallback(
    (direction: Move) => {
      const next = slide(stateRef.current, direction)
      if (next === stateRef.current) return

      stateRef.current = next
      forceRender()
    },
    [forceRender]
  )

  const rotate = useCallback(
    (direction: Turn) => {
      const next = turn(stateRef.current, direction)
      if (next === stateRef.current) return

      stateRef.current = next
      forceRender()
    },
    [forceRender]
  )

  // A hand-driven step or a drop resets the gravity clock, as the original's
  // `dropCounter = 0` did (`Player.js:20`), so the piece never takes the visitor's
  // row *and* gravity's on the same frame.
  const softDrop = useCallback(() => {
    accumulatorRef.current = 0

    const next = stepDown(stateRef.current)
    if (next === stateRef.current) return

    stateRef.current = next
    forceRender()
  }, [forceRender])

  const hardDrop = useCallback(() => {
    accumulatorRef.current = 0

    const next = dropToFloor(stateRef.current)
    if (next === stateRef.current) return

    stateRef.current = next
    forceRender()
  }, [forceRender])

  const pause = useCallback(() => {
    const next = togglePause(stateRef.current)
    if (next === stateRef.current) return

    stateRef.current = next
    forceRender()
    if (stateRef.current.status === 'running') startLoop()
  }, [forceRender, startLoop])

  useEffect(() => {
    // Space drops the piece to the floor while a game is running and starts one
    // that is waiting, paused or over — the shell's other games bind Space to
    // start. A focused control keeps Space and Enter for itself, so tabbing to
    // the start button still works as a button.
    const handlers: Readonly<Record<KeyAction, () => void>> = {
      left: () => move(-1),
      right: () => move(1),
      rotateClockwise: () => rotate(1),
      rotateCounterClockwise: () => rotate(-1),
      softDrop,
      hardDrop,
      pause,
      start: () => {
        if (stateRef.current.status === 'running') hardDrop()
        else start()
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      const action = KEY_ACTIONS[event.code]
      if (action === undefined) return
      if (action === 'start' && event.target instanceof HTMLButtonElement) return

      // Only a key that does something keeps the page from reacting to it: while
      // the game is not running the moves answer nothing, and swallowing them
      // would leave the arrows and Space unable to scroll the page at all. While
      // it runs they would scroll it instead—the game would drift out of the
      // window under the player's hands.
      const acts = stateRef.current.status === 'running' || action === 'start' || action === 'pause'
      if (!acts) return

      event.preventDefault()
      handlers[action]()
    }

    window.addEventListener('keydown', onKeyDown)

    return () => window.removeEventListener('keydown', onKeyDown)
  }, [hardDrop, move, pause, rotate, softDrop, start])

  useEffect(
    () => () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    },
    []
  )

  return { state: stateRef.current, start, move, rotate, softDrop, hardDrop, togglePause: pause }
}
