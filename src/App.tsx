import { BackToList } from '~/components/BackToList'
import { Layout } from '~/components/Layout'
import { PROJECT_ROUTE_PATTERN, projects } from '~/data/projects'
import { Home } from '~/features/home'
import { projectFeature } from '~/features/registry'
import { type RouteDefinition, RouterView } from '~/lib/router'

const ProjectPlaceholder = ({ slug }: { slug: string }) => {
  const project = projects.find((entry) => entry.slug === slug)

  if (project === undefined) {
    return (
      <section className='space-y-4'>
        <BackToList />
        <h2 className='font-medium text-zinc-100'>Projet introuvable</h2>
        <p className='text-zinc-400'>Aucun projet ne correspond au slug « {slug} ».</p>
      </section>
    )
  }

  return (
    <section className='space-y-4'>
      <BackToList />
      <h2 className='font-medium text-zinc-100'>{project.title}</h2>
      <p className='text-zinc-400'>Placeholder — feature à venir dans une prochaine slice.</p>
    </section>
  )
}

const renderProject = (slug: string) => {
  const Feature = projectFeature(slug)

  if (Feature !== undefined) return <Feature />

  return <ProjectPlaceholder slug={slug} />
}

const NotFound = () => (
  <section className='space-y-4'>
    <BackToList />
    <h2 className='font-medium text-zinc-100'>Page introuvable</h2>
  </section>
)

/**
 * The central map. Exported so the routing seam can be asserted against the table
 * the shell actually renders: a prefix branch is load-bearing, and a test that
 * builds its own table would not notice the declaration losing its flag.
 */
export const routes: RouteDefinition[] = [
  { pattern: '/', render: () => <Home /> },
  {
    // The project branch: everything past `/projects/<slug>` belongs to the
    // feature, which reads it itself. The map never learns what is there.
    pattern: PROJECT_ROUTE_PATTERN,
    render: (params) => renderProject(params.slug ?? ''),
    prefix: true
  }
]

export const App = () => (
  <Layout>
    <RouterView routes={routes} fallback={() => <NotFound />} />
  </Layout>
)
