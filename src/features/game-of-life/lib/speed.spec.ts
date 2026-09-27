import { describe, expect, it } from 'bun:test'
import { DEFAULT_SPEED_ID, SPEEDS, speedInterval } from './speed'

describe('the speed selector’s intervals', () => {
  it('gives every entry its own interval, with no duplicate id', () => {
    expect(SPEEDS.map(({ id }) => speedInterval(id))).toEqual(
      SPEEDS.map(({ intervalMs }) => intervalMs)
    )
  })

  it('falls back to the default interval for an id no entry names', () => {
    expect(speedInterval('pas-une-vitesse')).toBe(speedInterval(DEFAULT_SPEED_ID))
  })

  it('names one of the entries as the default', () => {
    expect(SPEEDS.some(({ id }) => id === DEFAULT_SPEED_ID)).toBe(true)
  })
})
