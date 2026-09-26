/**
 * The 2021 portfolio's in-page sections, in the order the original's menu listed
 * them (`20210406-portfolio/src/index.html:52-77`), and the two pure decisions
 * the scroll-spy and the shared-link contract rest on.
 */

export type SectionId = 'skills' | 'profile' | 'projects' | 'contact'

export type Section = {
  id: SectionId
  /** Navigation label, verbatim from the original's menu. */
  label: string
}

export const SECTIONS: readonly Section[] = [
  { id: 'skills', label: 'Compétences' },
  { id: 'profile', label: 'Profil' },
  { id: 'projects', label: 'Projets' },
  { id: 'contact', label: 'Contact' }
]

export const SECTION_IDS: readonly SectionId[] = SECTIONS.map((section) => section.id)

/**
 * The section the reader is inside, given the ones an observer reports as
 * crossing the viewport midline: the first in page order, `null` when none does
 * — the hero above the first section, or the footer below the last.
 */
export const pickActiveSection = <T extends string>(
  order: readonly T[],
  intersecting: ReadonlySet<string>
): T | null => order.find((id) => intersecting.has(id)) ?? null

/** The section a `location.hash` addresses, or `null` when it names none. */
export const resolveHashTarget = <T extends string>(hash: string, ids: readonly T[]): T | null => {
  const id = hash.startsWith('#') ? hash.slice(1) : hash
  return ids.find((candidate) => candidate === id) ?? null
}
