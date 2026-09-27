/**
 * The 2018 pomodoro timer's rules, without the DOM — transcribed from the
 * public original (`TituxMetal/pomodoroTimer`, `src/app.js`), which the frozen
 * archive has no local copy of. The countdown, the time formatting and the end
 * time are pure decisions, so they are the feature's test seam.
 */

type Preset = {
  /** The button's label, in French, as the site's copy is. */
  label: string
  seconds: number
}

/** The original's four presets, in its order (`index.html:26-29`). */
export const PRESETS: readonly Preset[] = [
  { label: '5 min', seconds: 300 },
  { label: '15 min', seconds: 900 },
  { label: '25 min', seconds: 1500 },
  { label: '55 min', seconds: 3300 }
]

/** The display before any countdown runs — the original's own initial markup. */
export const IDLE_DISPLAY = '13:37'

/** Two digits, the width both the countdown and the end time are written in. */
const pad = (value: number): string => String(value).padStart(2, '0')

/** What is left of a countdown, rounded the way the original rounded each tick. */
export const remainingSeconds = (deadline: number, now: number): number =>
  Math.round((deadline - now) / 1000)

/**
 * A countdown as `MM:SS`, prefixed by its hours once it carries any
 * (`app.js:26-36`). Only ever called with a non-negative value: the original
 * stopped the countdown before it could display one below zero.
 */
export const formatRemaining = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  const hourPrefix = hours < 1 ? '' : `${hours}:`

  return `${hourPrefix}${pad(minutes % 60)}:${pad(seconds % 60)}`
}

/** The hour a countdown will end at, in the original's shape (`app.js:38-44`). */
export const formatEndTime = (timestamp: number): string => {
  const end = new Date(timestamp)

  return `De retour à ${end.getHours()}:${pad(end.getMinutes())}`
}

/** The free field's own domain, in minutes: a pomodoro is minutes to a couple of hours. */
const MIN_MINUTES = 1
const MAX_MINUTES = 120

/**
 * The free minutes field, read the way the original read it (`app.js:55`) — a
 * fractional entry truncated, anything unparsable meaning zero — and then bounded
 * to a duration the countdown can actually show.
 *
 * The 2018 original let any number through, and the field it offered accepted
 * each one: a negative entry armed a deadline already in the past, and an entry
 * of hours wrote a display wider than a phone's column. Minutes from 1 to 120 are
 * taken as typed, a longer entry is capped at the two hours a pomodoro can
 * meaningfully run for, and anything below 1 — a negative, a zero, an empty field
 * — is refused with `null`, so no submission arms a countdown that never runs.
 */
export const secondsFromMinutes = (raw: string): number | null => {
  const minutes = Math.trunc(Number(raw))

  if (!Number.isFinite(minutes) || minutes < MIN_MINUTES) return null

  return Math.min(minutes, MAX_MINUTES) * 60
}
