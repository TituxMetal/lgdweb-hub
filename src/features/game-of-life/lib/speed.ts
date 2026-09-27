import type { Speed } from '../types'

/**
 * The speeds the viewer offers. The original had none — the viewer is the half
 * of this project that never existed — so these are an addition, chosen to span
 * "watch a glider walk" to "let a random soup churn".
 */
const DEFAULT_SPEED: Speed = { id: 'normal', label: 'Normal', intervalMs: 160 }

export const SPEEDS: readonly Speed[] = [
  { id: 'lent', label: 'Lent', intervalMs: 500 },
  DEFAULT_SPEED,
  { id: 'rapide', label: 'Rapide', intervalMs: 80 },
  { id: 'turbo', label: 'Turbo', intervalMs: 40 }
]

export const DEFAULT_SPEED_ID = DEFAULT_SPEED.id

/** The interval a speed id names; an unknown id keeps the default speed. */
export const speedInterval = (id: string): number =>
  SPEEDS.find((speed) => speed.id === id)?.intervalMs ?? DEFAULT_SPEED.intervalMs
