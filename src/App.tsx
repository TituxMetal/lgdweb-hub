import { lazy } from 'react'
import { BackToList } from '~/components/BackToList'
import { Layout } from '~/components/Layout'
import { projects } from '~/data/projects'
import { Home } from '~/features/home'
import { type RouteDefinition, RouterView } from '~/lib/router'

const Snake = lazy(() => import('~/features/snake'))

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
  if (slug === 'snake') return <Snake />
  return <ProjectPlaceholder slug={slug} />
}

const NotFound = () => (
  <section className='space-y-4'>
    <BackToList />
    <h2 className='font-medium text-zinc-100'>Page introuvable</h2>
  </section>
)

const routes: RouteDefinition[] = [
  { pattern: '/', render: () => <Home /> },
  {
    pattern: '/projects/:slug',
    render: (params) => renderProject(params.slug ?? '')
  }
]

export const App = () => (
  <Layout>
    <RouterView routes={routes} fallback={() => <NotFound />} />
  </Layout>
)
