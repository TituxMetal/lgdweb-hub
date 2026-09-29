/**
 * Head metadata for the documents the build emits, one per project plus the apex.
 *
 * Pure string work with one alias-free import, so the Vite config can load it
 * before the alias resolver exists. The build reads `dist/index.html` once as the
 * template, then renders the apex document and every old project's document from
 * it: the same shell, a different head.
 */
import { projectPath } from '../data/projects'

export type DocumentProject = {
  slug: string
  title: string
  description: string
  thumbnail?: string
}

/** The apex document's own description — the Home intro sentence. */
export const SITE_DESCRIPTION =
  'Vieux projets modernisés en place, et quelques projets récents pour signaler que le parcours continue.'

const SITE_NAME = 'lgdweb'
const TITLE_PATTERN = /<title>([\s\S]*?)<\/title>/
const HEAD_CLOSE = '</head>'
// Presence of the marker is what makes a render idempotent: a template that
// already carries it is left alone, so a document can never double-inject.
const MARKER = '<!-- lgdweb:metadata -->'

const escapeAttribute = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')

// The two tag spellings share the escaping contract, and every tag below goes
// through one of them, so a change to that contract lands everywhere at once.
const meta = (name: string, content: string): string =>
  `<meta name="${name}" content="${escapeAttribute(content)}">`

const property = (name: string, content: string): string =>
  `<meta property="${name}" content="${escapeAttribute(content)}">`

const injectHead = (template: string, tags: string[]): string => {
  if (template.includes(MARKER)) return template

  const block = [MARKER, ...tags].join('\n    ')

  return template.replace(HEAD_CLOSE, `  ${block}\n  ${HEAD_CLOSE}`)
}

/**
 * The apex document: its `<title>` stays the template's, and the head gains the
 * canonical URL plus the site-level social tags.
 */
export const renderSiteDocument = (template: string, siteUrl: string): string => {
  const origin = siteUrl.replace(/\/+$/, '')
  const root = `${origin}/`
  const title = template.match(TITLE_PATTERN)?.[1] ?? SITE_NAME

  return injectHead(template, [
    meta('description', SITE_DESCRIPTION),
    `<link rel="canonical" href="${escapeAttribute(root)}">`,
    property('og:type', 'website'),
    property('og:site_name', SITE_NAME),
    property('og:locale', 'fr_FR'),
    property('og:title', title),
    property('og:description', SITE_DESCRIPTION),
    property('og:url', root),
    meta('twitter:card', 'summary'),
    meta('twitter:title', title),
    meta('twitter:description', SITE_DESCRIPTION)
  ])
}

/**
 * A project document: the template's `<title>` becomes `{title} — lgdweb` and the
 * head gains the project's own canonical URL, description and social tags, with
 * the large-image card when the project carries a thumbnail.
 */
export const renderProjectDocument = (
  template: string,
  project: DocumentProject,
  siteUrl: string
): string => {
  const origin = siteUrl.replace(/\/+$/, '')
  const url = `${origin}${projectPath(project.slug)}`
  const image = project.thumbnail === undefined ? null : `${origin}${project.thumbnail}`

  const tags = [
    meta('description', project.description),
    `<link rel="canonical" href="${escapeAttribute(url)}">`,
    property('og:type', 'website'),
    property('og:site_name', SITE_NAME),
    property('og:locale', 'fr_FR'),
    property('og:title', project.title),
    property('og:description', project.description),
    property('og:url', url)
  ]

  if (image === null) {
    tags.push(meta('twitter:card', 'summary'))
  } else {
    tags.push(
      property('og:image', image),
      property('og:image:alt', project.title),
      meta('twitter:card', 'summary_large_image'),
      meta('twitter:image', image)
    )
  }

  const titled = template.replace(
    TITLE_PATTERN,
    `<title>${escapeAttribute(`${project.title} — ${SITE_NAME}`)}</title>`
  )

  return injectHead(titled, tags)
}
