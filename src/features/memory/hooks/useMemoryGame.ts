import { useCallback, useEffect, useRef, useState } from 'react'
import { loadBestRuns, recordRun } from '../lib/bestRuns'
import { createGameState, flip, MISS_DELAY_MS, resolvePair } from '../lib/game'
import type { GameState } from '../types'

type UseMemoryGameResult = {
  state: GameState
  bestRuns: number[]
  flipCard: (id: number) => void
  reset: () => void
}

export const useMemoryGame = (): UseMemoryGameResult => {
  const [state, setState] = useState(createGameState)
  const [bestRuns, setBestRuns] = useState<number[]>(() =>
    typeof window === 'undefined' ? [] : loadBestRuns(window.localStorage)
  )
  // Guards the write so a re-render of a finished run cannot record it twice.
  const recordedRef = useRef(false)

  // A miss holds both cards up: arm the one-second turn-back, and drop it if the
  // feature unmounts before it fires (leaving for the list cancels nothing else,
  // this hook opens no other resource).
  useEffect(() => {
    if (!state.locked) return

    const timer = setTimeout(() => setState(resolvePair), MISS_DELAY_MS)
    return () => clearTimeout(timer)
  }, [state.locked])

  useEffect(() => {
    if (state.status !== 'won' || recordedRef.current) return

    recordedRef.current = true
    if (typeof window !== 'undefined') setBestRuns(recordRun(window.localStorage, state.moves))
  }, [state.status, state.moves])

  const flipCard = useCallback((id: number) => setState((current) => flip(current, id)), [])

  const reset = useCallback(() => {
    recordedRef.current = false
    setState(createGameState())
  }, [])

  return { state, bestRuns, flipCard, reset }
}
