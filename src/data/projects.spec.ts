import { describe, expect, test } from 'bun:test'
import { projects } from '~/data/projects'

describe('projects manifest', () => {
  test('has 7 old and 3 recent entries', () => {
    const oldCount = projects.filter((project) => project.kind === 'old').length
    const recentCount = projects.filter((project) => project.kind === 'recent').length

    expect(oldCount).toBe(7)
    expect(recentCount).toBe(3)
  })

  test('every entry has non-empty required fields', () => {
    for (const project of projects) {
      expect(project.slug).toMatch(/^[a-z][a-z0-9-]*$/)
      expect(project.title.length).toBeGreaterThan(0)
      expect(project.description.length).toBeGreaterThan(0)
      expect(project.date).toMatch(/^\d{4}-(0[1-9]|1[0-2])$/)
      expect(project.tech.length).toBeGreaterThan(0)
      expect(project.repoUrl).toMatch(/^https?:\/\//)
    }
  })

  test('recent entries expose a valid liveUrl when present', () => {
    const recents = projects.filter((project) => project.kind === 'recent')

    for (const project of recents) {
      if (project.liveUrl === undefined) continue
      expect(project.liveUrl).toMatch(/^https?:\/\//)
    }
  })

  test('slugs are unique', () => {
    const slugs = projects.map((project) => project.slug)
    const unique = new Set(slugs)

    expect(unique.size).toBe(slugs.length)
  })

  test('entries are sorted by date descending', () => {
    for (let i = 1; i < projects.length; i++) {
      const previous = projects[i - 1]
      const current = projects[i]

      if (previous === undefined || current === undefined) continue

      expect(previous.date >= current.date).toBe(true)
    }
  })
})
