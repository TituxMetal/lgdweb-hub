/**
 * Attributes for a link that leaves the site. Shared, because both layers carry
 * one: the shell's project cards, and the profile's references, the portfolio's
 * project links and its footer. The contract (`target` + `rel`) is written once,
 * so a change to it lands in every outbound link at once.
 */
export const EXTERNAL_LINK_PROPS = {
  target: '_blank',
  rel: 'noopener noreferrer'
} as const
