/**
 * Attributes for a link that leaves the site, shared by the three components
 * that carry one: the profile's references, the project links and the footer.
 * Value-identical to the shell's inline pair (`src/components/ProjectCard.tsx`).
 */
export const EXTERNAL_LINK_PROPS = {
  target: '_blank',
  rel: 'noopener noreferrer'
} as const
