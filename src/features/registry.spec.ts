import { describe, expect, it } from 'bun:test'
import { PROJECT_ROUTE_PATTERN, projectPath, projects } from '~/data/projects'
import { PROJECT_FEATURE_SLUGS, projectFeature } from '~/features/registry'
import { matchRoute } from '~/lib/router'

/**
 * The manifest is the showroom's one source of truth, and the registry is the
 * one place a feature is wired to a slug. These are the membership invariants
 * between them: adding a project means touching the manifest and the registry,
 * never a hard-coded count.
 */
describe('projects manifest and the features the showroom renders', () => {
  it('lists every project the showroom can render', () => {
    const listed = new Set(projects.map((project) => project.slug))
    const unlisted = PROJECT_FEATURE_SLUGS.filter((slug) => !listed.has(slug))

    expect(unlisted).toEqual([])
  })

  it('addresses every listed project at its own URL', () => {
    const unreachable = projects
      .filter((project) => matchRoute(projectPath(project.slug), PROJECT_ROUTE_PATTERN) === null)
      .map((project) => project.slug)

    expect(unreachable).toEqual([])
  })

  it('has no feature for a slug the showroom does not render, inherited keys included', () => {
    // `PROJECT_FEATURES[slug]` on a plain object would answer these with
    // `Object.prototype`'s members, and the route would mount them.
    for (const slug of ['constructor', 'hasOwnProperty', 'toString', 'valueOf', '__proto__']) {
      expect(projectFeature(slug)).toBeUndefined()
    }

    expect(projectFeature('not-a-project')).toBeUndefined()
    expect(projectFeature('portfolio')).toBeDefined()
    expect(projectFeature('pomodoro')).toBeDefined()
  })
})
