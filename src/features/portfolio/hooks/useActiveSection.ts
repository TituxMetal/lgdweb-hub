import { useEffect, useState } from 'react'
import { pickActiveSection, SECTION_IDS, type SectionId } from '../lib/sections'

/**
 * The viewport's midline, as a zero-height band: a section is "in view" when it
 * crosses the line halfway down the screen.
 */
const MIDLINE_MARGIN = '-50% 0px -50% 0px'

/**
 * The section the reader is inside, or `null` while none is — the hero above
 * the first section, or the footer below the last. The observer is released on
 * unmount, so nothing keeps watching the document after the visitor leaves.
 */
export const useActiveSection = (): SectionId | null => {
  const [active, setActive] = useState<SectionId | null>(null)

  useEffect(() => {
    const elements = SECTION_IDS.flatMap((id) => {
      const element = document.getElementById(id)
      return element === null ? [] : [element]
    })

    if (elements.length === 0) return

    const intersecting = new Set<string>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) intersecting.add(entry.target.id)
          else intersecting.delete(entry.target.id)
        }

        // No section crossing the midline clears the mark: the hero above the
        // first section and the footer below the last leave the navigation
        // unmarked, rather than pointing at a section the reader has left.
        setActive(pickActiveSection(SECTION_IDS, intersecting))
      },
      { rootMargin: MIDLINE_MARGIN }
    )

    for (const element of elements) observer.observe(element)

    return () => observer.disconnect()
  }, [])

  return active
}
