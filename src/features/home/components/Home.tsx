import { ProjectCard } from '~/components/ProjectCard'
import { projects } from '~/data/projects'

export const Home = () => (
  <section className='space-y-6'>
    <p className='text-zinc-400'>
      Vieux projets modernisés en place, et quelques projets récents pour signaler que le parcours
      continue.
    </p>

    <ul className='space-y-4'>
      {projects.map((project) => (
        <li key={project.slug}>
          <ProjectCard project={project} />
        </li>
      ))}
    </ul>
  </section>
)
