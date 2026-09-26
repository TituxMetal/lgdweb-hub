import albinThumb from '../assets/projectsAlbin.jpg'
import pomodoroThumb from '../assets/projectsPomodoro.jpg'
import tenchidoThumb from '../assets/projectsTenchido.jpg'
import ticTacToeThumb from '../assets/projectsTicTacToe.jpg'
import { EXTERNAL_LINK_PROPS } from '../lib/links'

type ProjectLink = {
  label: string
  url: string
  /** The link's tooltip, verbatim from the original. */
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

/** The original's four projects, verbatim (`index.html:216-397`). */
const PROJECTS: PortfolioProject[] = [
  {
    title: 'Tenchido Obernai',
    description:
      "Refonte design du site du club de karaté d'Obernai. J'avais carte blanche pour créer le design, en gardant les couleurs principales du club et le logo. J'ai réalisé l'intégration Html, Css et Javascript dans la structure Php existante. J'ai choisi de réaliser le style en utilisant le préprocesseur Sass, sans aucun framework.",
    thumbnail: tenchidoThumb,
    thumbnailAlt: "Site du Tenchido d'Orbernai",
    links: [
      {
        label: 'Voir le projet',
        url: 'http://tenchido.fr',
        title: 'Karaté Tenchido Obernai après la refonte'
      },
      {
        label: 'Projet avant refonte',
        url: 'https://web.archive.org/web/20161028195201/http://www.tenchido.fr/',
        title: 'Karaté Tenchido Obernai avant la refonte'
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
        label: 'Voir le projet',
        url: 'https://albin.tuxlab.fr',
        title: 'Page de bienvenue du jeune Albin'
      },
      {
        label: 'Voir les sources',
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
      { label: 'Voir le projet', url: 'https://tuxtactoe.tuxlab.fr', title: 'Jeu du Tic Tac Toe' },
      {
        label: 'Voir les sources',
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
        url: 'https://pomodoro.tuxlab.fr',
        title: 'App de timer pomodoro'
      },
      {
        label: 'Voir les sources',
        url: 'https://github.com/TituxMetal/pomodoroTimer',
        title: "Code source de l'application de timer pomodoro"
      }
    ]
  }
]

/**
 * `#projects` — the four case studies of the original, each with its round
 * thumbnail, its description and its outbound links (`_projects.scss`).
 */
export const ProjectsSection = () => (
  <section id='projects' className='scroll-mt-16 bg-neutral-900 py-[5vmin] md:scroll-mt-20'>
    <div className='mx-auto my-[60px] max-w-[90%]'>
      <h2 className='px-[10vmin] text-[30px] font-bold text-orange-500'>Projets réalisés</h2>
      <ul className='text-[16px] md:flex md:flex-wrap md:justify-between'>
        {PROJECTS.map((project) => {
          const [primary] = project.links

          return (
            <li
              key={project.title}
              className='my-[2em] w-full bg-neutral-800/80 p-[1em] md:w-[45%]'
            >
              <article className='md:flex md:flex-wrap md:items-center md:justify-between'>
                <h2 className='inline-block p-[0.5em] text-[24px] leading-[1.4] sm:px-[60px] sm:py-2.5 md:px-0'>
                  <a
                    href={primary.url}
                    title={primary.title}
                    {...EXTERNAL_LINK_PROPS}
                    className='text-orange-400 hover:underline'
                  >
                    {project.title}
                  </a>
                </h2>

                <p className='text-justify text-[20px] sm:px-10 sm:py-5 md:px-0'>
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

                <footer className='mx-auto my-[1em] w-4/5 text-[19px] sm:max-w-[40%] md:max-w-[60%]'>
                  <ul>
                    {project.links.map((link) => (
                      <li key={link.url} className='transition-colors'>
                        <a
                          href={link.url}
                          title={link.title}
                          {...EXTERNAL_LINK_PROPS}
                          className='inline-block p-[0.2em] font-bold text-orange-700 hover:underline'
                        >
                          {link.label}
                        </a>
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
