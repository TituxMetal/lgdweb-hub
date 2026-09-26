import { describe, expect, it } from 'bun:test'
import { pickActiveSection, resolveHashTarget, SECTION_IDS } from './sections'

describe('pickActiveSection', () => {
  it('takes the first section in page order when several cross the midline', () => {
    expect(pickActiveSection(SECTION_IDS, new Set(['projects', 'profile']))).toBe('profile')
  })

  it('marks nothing while no section crosses the midline', () => {
    expect(pickActiveSection(SECTION_IDS, new Set())).toBeNull()
  })

  it('ignores observed ids that are not sections', () => {
    expect(pickActiveSection(SECTION_IDS, new Set(['footer']))).toBeNull()
  })
})

describe('resolveHashTarget', () => {
  it('resolves a hash naming a section', () => {
    expect(resolveHashTarget('#projects', SECTION_IDS)).toBe('projects')
  })

  it('resolves a hash naming no section to nothing', () => {
    expect(resolveHashTarget('#nowhere', SECTION_IDS)).toBeNull()
    expect(resolveHashTarget('#', SECTION_IDS)).toBeNull()
    expect(resolveHashTarget('', SECTION_IDS)).toBeNull()
  })
})
