import type { ReactNode } from 'react'
import { projectPath } from '~/data/projects'
import { EXTERNAL_LINK_PROPS } from '~/lib/links'
import { Link } from '~/lib/router'
import albinThumb from '../assets/projectsAlbin.jpg'
import pomodoroThumb from '../assets/projectsPomodoro.jpg'
import tenchidoThumb from '../assets/projectsTenchido.jpg'
import ticTacToeThumb from '../assets/projectsTicTacToe.jpg'

type ProjectLink = {
  label: string
  /** An in-site link stays in the shell; an outbound one opens in a new tab. */
  kind: 'internal' | 'external'
  url: string
  /** The link's tooltip, the original's or this port's own where the target changed. */
  title: string
}

type PortfolioProject = {
  title: string
  description: string
  thumbnail: string
  thumbnailAlt: string
  /** The heading's link first, the remaining outbound links after it. */
  links: [ProjectLink, ...ProjectLink[]]
}

/**
 * The original's four projects, verbatim (`index.html:216-397`) except for the
 * targets that rotted: `tenchido.fr` is served by someone else today, and
 * `albin.tuxlab.fr`, `tuxtactoe.tuxlab.fr` and `pomodoro.tuxlab.fr` answer
 * nothing. Each now points at the author's own version — an archived capture —
 * or, where the showroom has already ported the project, into the showroom.
 */
const PROJECTS: PortfolioProject[] = [
  {
    title: 'Tenchido Obernai',
    description:
      "Refonte design du site du club de karaté d'Obernai. J'avais carte blanche pour créer le design, en gardant les couleurs principales du club et le logo. J'ai réalisé l'intégration Html, Css et Javascript dans la structure Php existante. J'ai choisi de réaliser le style en utilisant le préprocesseur Sass, sans aucun framework.",
    thumbnail: tenchidoThumb,
    thumbnailAlt: "Site du Tenchido d'Orbernai",
    links: [
      {
        label: 'Voir la version archivée',
        kind: 'external',
        url: 'https://web.archive.org/web/20231211223347/https://tenchido.fr/',
        title: 'Karaté Tenchido Obernai après la refonte (capture archive.org)'
      },
      {
        label: 'Projet avant refonte',
        kind: 'external',
        url: 'https://web.archive.org/web/20161028195201/http://www.tenchido.fr/',
        title: 'Karaté Tenchido Obernai avant la refonte (capture archive.org)'
      }
    ]
  },
  {
    title: 'Bienvenue Albin',
    description:
      "Une page de présentation pour la naissance du fils à un ami. Page réalisée en Html, Css et Javascript. J'ai réalisé le style en utilisant le préprocesseur Sass, sans aucun framework. J'ai réalisé le diaporama en Javascript ES6.",
    thumbnail: albinThumb,
    thumbnailAlt: 'Page de bienvenue du jeune Albin',
    links: [
      {
        label: 'Voir la version archivée',
        kind: 'external',
        url: 'https://web.archive.org/web/20201030113907/https://albin.tuxlab.fr/',
        title: 'Page de bienvenue du jeune Albin (capture archive.org)'
      },
      {
        label: 'Voir les sources',
        kind: 'external',
        url: 'https://github.com/TituxMetal/welcomAlbin',
        title: 'Code source de la page de bienvenue du jeune Albin'
      }
    ]
  },
  {
    title: 'Jeu du Tic Tac Toe',
    description:
      "Petite application du jeu du Tic Tac Toe faite en javascript pendant ma formation à la 3WAcademy. J'ai récement fait quelques modifications au niveau du style et des couleurs.",
    thumbnail: ticTacToeThumb,
    thumbnailAlt: 'Jeu du Tic Tac Toe',
    links: [
      {
        label: 'Voir le projet',
        kind: 'internal',
        url: projectPath('tic-tac-toe'),
        title: 'Jeu du Tic Tac Toe, porté dans cette vitrine'
      },
      {
        label: 'Voir les sources',
        kind: 'external',
        url: 'https://github.com/TituxMetal/ticTacToe',
        title: 'Code source du jeu du Tic Tac Toe'
      }
    ]
  },
  {
    title: 'App de timer pomodoro',
    description:
      "Une application de timer pomodoro, réalisée en Html, Css et Javascript Es6. J'ai utilisé Webpack pour optimiser le code source final.",
    thumbnail: pomodoroThumb,
    thumbnailAlt: 'App de timer pomodoro',
    links: [
      {
        label: 'Voir le projet',
        kind: 'internal',
        url: projectPath('pomodoro'),
        title: 'App de timer pomodoro, portée dans cette vitrine'
      },
      {
        label: 'Voir les sources',
        kind: 'external',
        url: 'https://github.com/TituxMetal/pomodoroTimer',
        title: "Code source de l'application de timer pomodoro"
      }
    ]
  }
]

/** A project link, leaving in the shell or opening in a new tab. */
const ProjectLinkAnchor = ({
  link,
  className,
  children
}: {
  link: ProjectLink
  className: string
  children: ReactNode
}) => {
  if (link.kind === 'internal') {
    return (
      <Link to={link.url} title={link.title} className={className}>
        {children}
      </Link>
    )
  }

  return (
    <a href={link.url} title={link.title} {...EXTERNAL_LINK_PROPS} className={className}>
      {children}
    </a>
  )
}

/**
 * `#projects` — the four case studies of the original, each with its round
 * thumbnail, its description and its links (`_projects.scss`).
 */
export const ProjectsSection = () => (
  <section id='projects' className='scroll-mt-16 bg-neutral-900 py-9 md:scroll-mt-20'>
    <div className='mx-auto my-12 max-w-[90%]'>
      <h2 className='px-8 leading-normal text-2xl font-bold text-orange-500'>Projets réalisés</h2>
      <ul className='text-base md:flex md:flex-wrap md:justify-between'>
        {PROJECTS.map((project) => {
          const [primary] = project.links

          return (
            <li
              key={project.title}
              className='my-[2em] w-full bg-neutral-800/80 p-[1em] md:w-[45%]'
            >
              <article className='md:flex md:flex-wrap md:items-center md:justify-between'>
                <h2 className='inline-block p-[0.5em] text-[19px] leading-[1.4] sm:px-12 sm:py-2.5 md:px-0'>
                  <ProjectLinkAnchor link={primary} className='text-orange-400 hover:underline'>
                    {project.title}
                  </ProjectLinkAnchor>
                </h2>

                <p className='text-justify text-base sm:px-10 sm:py-5 md:px-0'>
                  {project.description}
                </p>

                <figure className='hidden sm:mx-auto sm:block sm:max-w-[20%] md:max-w-[25%]'>
                  <img
                    src={project.thumbnail}
                    alt={project.thumbnailAlt}
                    loading='lazy'
                    decoding='async'
                    className='mx-auto max-w-full sm:rounded-full'
                  />
                </figure>

                <footer className='mx-auto my-[1em] w-4/5 text-base sm:max-w-[40%] md:max-w-[60%]'>
                  <ul>
                    {project.links.map((link) => (
                      <li key={link.url} className='transition-colors'>
                        <ProjectLinkAnchor
                          link={link}
                          className='inline-block p-[0.2em] font-bold text-orange-700 hover:underline'
                        >
                          {link.label}
                        </ProjectLinkAnchor>
                      </li>
                    ))}
                  </ul>
                </footer>
              </article>
            </li>
          )
        })}
      </ul>
    </div>
  </section>
)
