import ansibleLogo from '../assets/ansible_logo.png'
import atomLogo from '../assets/atom_logo.png'
import bootstrapLogo from '../assets/bootstrap_logo.png'
import composerLogo from '../assets/composer_logo.png'
import css3Logo from '../assets/css3_logo.png'
import dockerLogo from '../assets/docker_logo.png'
import foundationLogo from '../assets/foundation_logo.png'
import gitLogo from '../assets/git_logo.png'
import gulpLogo from '../assets/gulp_logo.png'
import html5Logo from '../assets/html5_logo.png'
import javascriptLogo from '../assets/javascript_logo.png'
import jqueryLogo from '../assets/jquery_logo.png'
import laravelLogo from '../assets/laravel_logo.png'
import mariadbLogo from '../assets/mariadb_logo.png'
import phpLogo from '../assets/php_logo.png'
import sassLogo from '../assets/sass_logo.png'
import symfonyLogo from '../assets/symfony_logo.png'

/** The original's six capabilities, verbatim (`index.html:82-89`). */
const KNOWLEDGE = [
  'Développement back-end',
  'Intégration front-end',
  'Responsive web design',
  'Optimisation seo',
  'Gestion de versions du code source',
  'Administration de serveurs Linux'
]

/** The original's technology grid — seventeen logos, in its order (`index.html:94-207`). */
const TECH = [
  { label: 'Html5', logo: html5Logo },
  { label: 'Css3', logo: css3Logo },
  { label: 'Javascript', logo: javascriptLogo },
  { label: 'Php', logo: phpLogo },
  { label: 'MariaDb', logo: mariadbLogo },
  { label: 'Sass', logo: sassLogo },
  { label: 'Atom', logo: atomLogo },
  { label: 'Git', logo: gitLogo },
  { label: 'Composer', logo: composerLogo },
  { label: 'Gulp', logo: gulpLogo },
  { label: 'Docker', logo: dockerLogo },
  { label: 'Ansible', logo: ansibleLogo },
  { label: 'JQuery', logo: jqueryLogo },
  { label: 'Bootstrap', logo: bootstrapLogo },
  { label: 'Foundation', logo: foundationLogo },
  { label: 'Laravel', logo: laravelLogo },
  { label: 'Symfony', logo: symfonyLogo }
]

/**
 * `#skills` — the capabilities list and the technology grid, with the original's
 * own logo files (`_skills.scss`).
 */
export const SkillsSection = () => (
  <section id='skills' className='scroll-mt-16 bg-neutral-900 py-[5vmin] md:scroll-mt-20'>
    <article className='mx-auto my-[60px] max-w-[90%]'>
      <h2 className='px-[10vmin] text-[30px] font-bold text-orange-500'>Compétences</h2>
      <ul className='mx-auto my-2.5 flex flex-wrap justify-around text-[16px] leading-[32px] tracking-[1px]'>
        {KNOWLEDGE.map((item) => (
          <li key={item} className='mt-5 rounded-[3px] bg-neutral-800 p-2 sm:m-2.5'>
            {item}
          </li>
        ))}
      </ul>
    </article>

    <article className='mx-auto my-[60px] max-w-[90%]'>
      <h2 className='px-[10vmin] text-[30px] font-bold text-orange-500'>Technologies</h2>
      <ul className='mx-auto my-2.5 flex flex-wrap justify-around text-[16px]'>
        {TECH.map(({ label, logo }) => (
          <li key={label} className='mx-auto my-2.5 w-1/3 sm:m-3 sm:w-1/5 md:w-auto'>
            <figure className='mx-auto w-[90%] rounded-[3px] bg-neutral-800 py-2.5 sm:w-auto sm:pt-5 md:p-5'>
              <img
                src={logo}
                alt={label}
                loading='lazy'
                decoding='async'
                className='mx-auto w-full max-w-[80px] sm:max-w-[100px] md:max-w-[115px] lg:max-w-[140px]'
              />
              <figcaption className='pt-2.5 text-center'>{label}</figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </article>
  </section>
)
