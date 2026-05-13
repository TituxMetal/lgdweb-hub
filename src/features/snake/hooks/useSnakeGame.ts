import { useCallback, useEffect, useRef, useState } from 'react'
import { createInitialState, start as startGame, tick } from '../lib/game'
import { loadHighScores, recordScore } from '../lib/highScore'
import { isReversal, setDirection as setSnakeDirection } from '../lib/snake'
import type { Direction, GameState, GameStatus, GridSize } from '../types'

const MAX_QUEUED_DIRECTIONS = 2

type UseSnakeGameInput = {
  gridSize: GridSize
}

type UseSnakeGameResult = {
  state: GameState
  start: () => void
  setDirection: (direction: Direction) => void
  highScores: number[]
}

const readInitialHighScores = (): number[] => {
  if (typeof window === 'undefined') return []
  return loadHighScores(window.localStorage)
}

export const useSnakeGame = ({ gridSize }: UseSnakeGameInput): UseSnakeGameResult => {
  // Game state lives in a ref so the RAF loop can mutate it at 60+ fps without
  // triggering a re-render per frame. React is told to repaint via the
  // `setRenderTick` counter only at the natural cadence (once per RAF callback).
  const stateRef = useRef<GameState>(createInitialState(gridSize))
  const rafRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number>(0)
  const accumulatorRef = useRef<number>(0)
  const previousStatusRef = useRef<GameStatus>(stateRef.current.status)
  // Input buffer applied one entry per simulation tick. Prevents 180° bypass
  // (e.g. right → up → left within the same tick window would otherwise let
  // the head walk into the segment behind it).
  const directionQueueRef = useRef<Direction[]>([])
  const [, setRenderTick] = useState(0)
  const [highScores, setHighScores] = useState<number[]>(readInitialHighScores)

  const forceRender = useCallback(() => {
    setRenderTick((value) => value + 1)
  }, [])

  // Fixed-timestep accumulator: RAF fires at the screen refresh rate but the
  // game simulates at `state.delay` ms. We accumulate elapsed time and drain
  // full ticks; the visible frame is rendered once per RAF callback regardless.
  const loop = useCallback(
    (now: number) => {
      accumulatorRef.current += now - lastTimeRef.current
      lastTimeRef.current = now

      while (accumulatorRef.current >= stateRef.current.delay) {
        // Capture the delay *before* `tick` runs: `tick` can lower it (speedup
        // milestone every 5 points), and subtracting the new value would leave
        // a few ms of phantom time in the accumulator and drift toward early
        // ticks over a long game.
        const stepDelay = stateRef.current.delay
        const pending = directionQueueRef.current.shift()
        if (pending !== undefined) {
          stateRef.current = {
            ...stateRef.current,
            snake: setSnakeDirection(stateRef.current.snake, pending)
          }
        }
        stateRef.current = tick(stateRef.current)
        accumulatorRef.current -= stepDelay
        if (stateRef.current.status !== 'running') break
      }

      // Persist scores exactly once per game-over transition (not every frame
      // while status stays 'over').
      if (
        previousStatusRef.current === 'running' &&
        stateRef.current.status === 'over' &&
        typeof window !== 'undefined'
      ) {
        const next = recordScore(window.localStorage, stateRef.current.score)
        setHighScores(next)
      }
      previousStatusRef.current = stateRef.current.status

      forceRender()

      if (stateRef.current.status === 'running') {
        rafRef.current = requestAnimationFrame(loop)
        return
      }

      rafRef.current = null
    },
    [forceRender]
  )

  const startLoop = useCallback(() => {
    if (rafRef.current !== null) return
    lastTimeRef.current = performance.now()
    accumulatorRef.current = 0
    rafRef.current = requestAnimationFrame(loop)
  }, [loop])

  const start = useCallback(() => {
    if (stateRef.current.status === 'running') return
    stateRef.current = startGame(stateRef.current)
    previousStatusRef.current = stateRef.current.status
    directionQueueRef.current = []
    forceRender()
    startLoop()
  }, [forceRender, startLoop])

  const setDirection = useCallback((direction: Direction) => {
    const queue = directionQueueRef.current
    const reference = queue[queue.length - 1] ?? stateRef.current.snake.direction

    if (reference === direction) return
    if (isReversal(reference, direction)) return
    if (queue.length >= MAX_QUEUED_DIRECTIONS) return

    queue.push(direction)
  }, [])

  useEffect(
    () => () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    },
    []
  )

  return { state: stateRef.current, start, setDirection, highScores }
}
