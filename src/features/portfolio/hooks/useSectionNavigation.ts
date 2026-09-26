import { useCallback, useEffect } from 'react'
import { navigate } from '~/lib/router'
import { resolveHashTarget, SECTION_IDS, type SectionId } from '../lib/sections'

/**
 * Moves to a section and leaves the URL naming it, so the section can be linked,
 * shared and reloaded. The hash goes through the router, the feature's only
 * writer of history: its `navigate` pushes the fragment and notifies nobody who
 * cares, since the path is unchanged.
 */
export const useSectionNavigation = (): ((id: SectionId) => void) => {
  const goTo = useCallback((id: SectionId) => {
    const target = document.getElementById(id)
    if (target === null) return

    // Writing the URL the reader already has would push an identical history
    // entry and make Back look dead, so the fragment is written only when it
    // changes; the jump itself always runs.
    if (window.location.hash !== `#${id}`) navigate(`#${id}`)

    target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  useEffect(() => {
    const scrollToHash = (behavior: ScrollBehavior) => {
      const id = resolveHashTarget(window.location.hash, SECTION_IDS)
      if (id === null) return

      document.getElementById(id)?.scrollIntoView({ behavior, block: 'start' })
    }

    // A shared link's hash is applied once the feature has rendered: the
    // browser resolves the hash against a document the feature only reaches
    // after mount, so the jump has to be repeated here.
    scrollToHash('auto')

    // Back and forward between two section URLs move the reader with the URL.
    const onHashChange = () => scrollToHash('smooth')
    window.addEventListener('hashchange', onHashChange)

    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return goTo
}
