import { describe, expect, it } from 'bun:test'
import {
  formatEndTime,
  formatRemaining,
  PRESETS,
  remainingSeconds,
  secondsFromMinutes
} from '~/features/pomodoro/lib/timer'

describe('pomodoro presets', () => {
  it('keeps the 2018 original’s four lengths, in its order', () => {
    expect(PRESETS.map((preset) => preset.seconds)).toEqual([300, 900, 1500, 3300])
  })
})

describe('remainingSeconds', () => {
  it('rounds the countdown to the whole second, as each tick did', () => {
    expect(remainingSeconds(1_000_000, 1_000_000)).toBe(0)
    expect(remainingSeconds(1_000_000, 999_400)).toBe(1)
    expect(remainingSeconds(1_000_000, 999_600)).toBe(0)
    expect(remainingSeconds(1_000_000, 998_500)).toBe(2)
  })

  it('reads a halfway second as −0, the boundary the countdown stops past', () => {
    // `Math.round` sends a halfway value towards +∞, so −0.5s is not negative:
    // the last drawn second stays on screen, as the original's own tick did.
    expect(Object.is(remainingSeconds(1_000_000, 1_000_500), -0)).toBe(true)
    expect(remainingSeconds(1_000_000, 1_001_499)).toBe(-1)
    expect(remainingSeconds(1_000_000, 1_001_500)).toBe(-1)
  })
})

describe('formatRemaining', () => {
  it('writes minutes and seconds, always two digits', () => {
    expect(formatRemaining(0)).toBe('00:00')
    expect(formatRemaining(9)).toBe('00:09')
    expect(formatRemaining(60)).toBe('01:00')
    expect(formatRemaining(300)).toBe('05:00')
    expect(formatRemaining(1500)).toBe('25:00')
    expect(formatRemaining(3300)).toBe('55:00')
    expect(formatRemaining(3599)).toBe('59:59')
  })

  it('prefixes the hours only once the countdown carries one', () => {
    expect(formatRemaining(3600)).toBe('1:00:00')
    expect(formatRemaining(3661)).toBe('1:01:01')
    expect(formatRemaining(3600 * 2 + 59)).toBe('2:00:59')
  })

  it('keeps the hours of a whole multiple of sixty, which the original dropped', () => {
    expect(formatRemaining(3600 * 60)).toBe('60:00:00')
  })
})

describe('formatEndTime', () => {
  it('announces the hour the countdown ends at, unpadded like the original', () => {
    const at = new Date(2026, 8, 27, 14, 35)

    expect(formatEndTime(at.getTime())).toBe('De retour à 14:35')
  })

  it('pads the minutes', () => {
    const at = new Date(2026, 8, 27, 9, 5)

    expect(formatEndTime(at.getTime())).toBe('De retour à 9:05')
  })
})

describe('secondsFromMinutes', () => {
  it('reads the free minutes field as the original did', () => {
    expect(secondsFromMinutes('25')).toBe(1500)
    expect(secondsFromMinutes(' 5 ')).toBe(300)
    expect(secondsFromMinutes('2.9')).toBe(120)
  })

  it('caps a long entry at two hours, so the display fits the column', () => {
    expect(secondsFromMinutes('120')).toBe(7200)
    expect(secondsFromMinutes('121')).toBe(7200)
    expect(secondsFromMinutes('3600')).toBe(7200)
  })

  it('refuses an entry that is not a duration, so nothing is armed', () => {
    expect(secondsFromMinutes('-5')).toBeNull()
    expect(secondsFromMinutes('0')).toBeNull()
    expect(secondsFromMinutes('')).toBeNull()
    expect(secondsFromMinutes('abc')).toBeNull()
  })
})
