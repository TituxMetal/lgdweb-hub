import type { Project } from '~/data/projects'
import { Link } from '~/lib/router'
import { ExternalArrow } from './ExternalArrow'

type ProjectCardProps = {
  project: Project
}

const dateFormatter = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' })

const formatDate = (date: string): string => {
  const [yearRaw, monthRaw] = date.split('-')
  const year = Number.parseInt(yearRaw ?? '', 10)
  const month = Number.parseInt(monthRaw ?? '', 10)

  if (Number.isNaN(year) || Number.isNaN(month)) return date

  return dateFormatter.format(new Date(year, month - 1, 1))
}

const TechBadges = ({ tech }: { tech: string[] }) => (
  <ul className='mt-3 flex flex-wrap gap-1.5'>
    {tech.map((label) => (
      <li key={label} className='rounded bg-zinc-700 px-2 py-0.5 font-mono text-xs text-zinc-200'>
        {label}
      </li>
    ))}
  </ul>
)

const CardBody = ({ project }: ProjectCardProps) => (
  <article className='rounded-lg border border-zinc-700 bg-zinc-800 p-6 transition-colors hover:border-amber-400'>
    <header className='flex items-baseline gap-3'>
      <h2 className='flex flex-1 items-center gap-2 font-medium text-zinc-100'>
        {project.title}
        {project.kind === 'recent' && <ExternalArrow />}
      </h2>
      <span className='font-mono text-sm text-zinc-400'>{formatDate(project.date)}</span>
    </header>
    <p className='mt-2 text-zinc-300'>{project.description}</p>
    <TechBadges tech={project.tech} />
  </article>
)

const externalHref = (project: Project): string | null => {
  if (project.kind !== 'recent') return null
  return project.liveUrl ?? project.repoUrl
}

export const ProjectCard = ({ project }: ProjectCardProps) => {
  const external = externalHref(project)

  if (external !== null) {
    return (
      <a
        href={external}
        target='_blank'
        rel='noopener noreferrer'
        aria-label={`${project.title} (ouvre un nouvel onglet)`}
        className='block'
      >
        <CardBody project={project} />
      </a>
    )
  }

  return (
    <Link to={`/projects/${project.slug}`} className='block'>
      <CardBody project={project} />
    </Link>
  )
}
