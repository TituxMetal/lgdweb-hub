import { describe, expect, it } from 'bun:test'
import { stepChoice } from './choices'

describe('stepChoice', () => {
  it('steps down and up', () => {
    expect(stepChoice(0, 1, 3)).toBe(1)
    expect(stepChoice(2, -1, 3)).toBe(1)
  })

  it('wraps around at both ends', () => {
    expect(stepChoice(2, 1, 3)).toBe(0)
    expect(stepChoice(0, -1, 3)).toBe(2)
  })

  it('stays on the first choice when there are none', () => {
    expect(stepChoice(0, 1, 0)).toBe(0)
    expect(stepChoice(4, -1, 0)).toBe(0)
  })

  it('holds a single choice still', () => {
    expect(stepChoice(0, 1, 1)).toBe(0)
    expect(stepChoice(0, -1, 1)).toBe(0)
  })
})
