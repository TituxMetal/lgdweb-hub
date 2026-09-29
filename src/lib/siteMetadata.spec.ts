import { describe, expect, it } from 'bun:test'
import { type DocumentProject, renderProjectDocument, renderSiteDocument } from './siteMetadata'

const template = `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>lgdweb — vitrine de projets</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`

const siteUrl = 'https://lgdweb.fr'

const snake: DocumentProject = {
  slug: 'snake',
  title: 'Snake Game',
  description: `Reprise du Snake d'arcade.`,
  thumbnail: '/thumbnails/snake.webp'
}

const count = (haystack: string, needle: string): number => haystack.split(needle).length - 1

describe('renderSiteDocument', () => {
  it('keeps the template title and injects the site tags once', () => {
    const document = renderSiteDocument(template, siteUrl)

    expect(document).toContain('<title>lgdweb — vitrine de projets</title>')
    expect(document).toContain('<meta name="description" content="Vieux projets')
    expect(document).toContain('<link rel="canonical" href="https://lgdweb.fr/">')
    expect(document).toContain('<meta property="og:type" content="website">')
    expect(document).toContain('<meta property="og:site_name" content="lgdweb">')
    expect(document).toContain('<meta property="og:locale" content="fr_FR">')
    expect(document).toContain('<meta property="og:title" content="lgdweb — vitrine de projets">')
    expect(document).toContain('<meta property="og:url" content="https://lgdweb.fr/">')
    expect(document).toContain('<meta name="twitter:card" content="summary">')
    expect(document).toContain('<div id="root">')
  })

  it('normalizes a trailing slash on the origin', () => {
    expect(renderSiteDocument(template, 'https://lgdweb.fr/')).toContain(
      '<meta property="og:url" content="https://lgdweb.fr/">'
    )
  })

  it('never injects twice', () => {
    const once = renderSiteDocument(template, siteUrl)
    const twice = renderSiteDocument(once, siteUrl)

    expect(twice).toBe(once)
    expect(count(twice, 'lgdweb:metadata')).toBe(1)
  })
})

describe('renderProjectDocument', () => {
  it('titles the document after the project and carries its social tags', () => {
    const document = renderProjectDocument(template, snake, siteUrl)

    expect(document).toContain('<title>Snake Game — lgdweb</title>')
    expect(document).toContain(`<meta name="description" content="Reprise du Snake d'arcade.">`)
    expect(document).toContain('<link rel="canonical" href="https://lgdweb.fr/projects/snake">')
    expect(document).toContain('<meta property="og:type" content="website">')
    expect(document).toContain('<meta property="og:site_name" content="lgdweb">')
    expect(document).toContain('<meta property="og:locale" content="fr_FR">')
    expect(document).toContain('<meta property="og:title" content="Snake Game">')
    expect(document).toContain(
      '<meta property="og:description" content="Reprise du Snake d\'arcade.">'
    )
    expect(document).toContain(
      '<meta property="og:url" content="https://lgdweb.fr/projects/snake">'
    )
    expect(document).toContain(
      '<meta property="og:image" content="https://lgdweb.fr/thumbnails/snake.webp">'
    )
    expect(document).toContain('<meta property="og:image:alt" content="Snake Game">')
    expect(document).toContain('<meta name="twitter:card" content="summary_large_image">')
    expect(document).toContain(
      '<meta name="twitter:image" content="https://lgdweb.fr/thumbnails/snake.webp">'
    )
    expect(document).not.toContain('lgdweb — vitrine de projets')
  })

  it('falls back to a summary card without an image when the project has no thumbnail', () => {
    const document = renderProjectDocument(template, { ...snake, thumbnail: undefined }, siteUrl)

    expect(document).toContain('<meta name="twitter:card" content="summary">')
    expect(document).not.toContain('og:image')
    expect(document).not.toContain('twitter:image')
  })

  it('escapes attribute values containing &, ", < and >', () => {
    const document = renderProjectDocument(
      template,
      {
        slug: 'hostile',
        title: 'A & B "quoted" <tag>',
        description: 'Rien <script>alert("x")</script> & co.',
        thumbnail: '/thumbnails/hostile.webp'
      },
      siteUrl
    )

    expect(document).toContain('<title>A &amp; B &quot;quoted&quot; &lt;tag&gt; — lgdweb</title>')
    expect(document).toContain(
      '<meta property="og:title" content="A &amp; B &quot;quoted&quot; &lt;tag&gt;">'
    )
    expect(document).toContain(
      '<meta property="og:description" content="Rien &lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; co.">'
    )
  })

  it('never injects twice', () => {
    const once = renderProjectDocument(template, snake, siteUrl)
    const twice = renderProjectDocument(once, snake, siteUrl)

    expect(twice).toBe(once)
    expect(count(twice, 'lgdweb:metadata')).toBe(1)
  })
})
