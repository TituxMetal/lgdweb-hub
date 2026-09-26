import profileBackground from '../assets/sectionProfileBackground.jpg'
import { EXTERNAL_LINK_PROPS } from '../lib/links'

/**
 * `#profile` — the about and training articles over the original's fixed
 * background photo, with the two slanted plates it drew above and below the
 * section (`_common.scss:96-118`, `_profile.scss`). The training article comes
 * first once the two sit side by side, as the original ordered them.
 */
export const ProfileSection = () => (
  <section
    id='profile'
    className='scroll-mt-16 bg-cover bg-center bg-fixed bg-no-repeat md:scroll-mt-20'
    style={{ backgroundImage: `url(${profileBackground})` }}
  >
    <div className='h-[4vw] -translate-y-[2vw] -skew-y-2 bg-neutral-900' aria-hidden='true' />

    <div className='mx-auto my-[60px] flex max-w-[90%] flex-col justify-center md:flex-row md:items-center'>
      <article className='rounded-[3px] bg-neutral-800/80 p-5 md:order-2 md:w-[45%] md:p-0 lg:mx-3 lg:w-[30%]'>
        <h2 className='px-[10vmin] text-[30px] font-bold text-orange-500'>Profil</h2>
        <p className='text-justify text-[20px] md:px-5 md:py-2.5 md:leading-[1.8] lg:px-[30px]'>
          <strong>Guillaume LANG en quelques mots.</strong> J'ai le soucis du détail, je m'investis
          à fond dans ce que je fait, honnête et dévoué, toujours entrain d'apprendre et découvrir
          de nouvelles choses, je sais me remettre en question, j'apprends de mes erreurs.
        </p>
      </article>

      <article className='rounded-[3px] bg-neutral-800/80 p-5 md:order-1 md:w-[45%] md:p-0 lg:mx-3 lg:w-[30%]'>
        <h2 className='px-[10vmin] text-[30px] font-bold text-orange-500'>Formations</h2>
        <p className='text-justify text-[20px] md:px-5 md:py-2.5 md:leading-[1.8] lg:px-[30px]'>
          En 1995, j'ai obtenu un <strong>B.E.P Structures Métalliques</strong> au Lycée du bâtiment
          de Cernay. En 2002, j'ai obtenu le <strong>CCP Cariste</strong>, puis en 2013 j'ai passé
          les <strong>CACES Cariste 1, 3 et 5</strong>.
        </p>
        <p className='text-justify text-[20px] md:px-5 md:py-2.5 md:leading-[1.8] lg:px-[30px]'>
          Passionné autodidacte depuis plus de 10 ans, j'ai appris à créer mes premiers sites Web
          grâce à{' '}
          <a
            href='http://openclassrooms.com'
            title='OpenClassRooms'
            {...EXTERNAL_LINK_PROPS}
            className='text-orange-400 hover:underline'
          >
            OpenClassRooms
          </a>{' '}
          et{' '}
          <a
            href='http://grafikart.fr'
            title='Grafikart'
            {...EXTERNAL_LINK_PROPS}
            className='text-orange-400 hover:underline'
          >
            Grafikart
          </a>
          .
        </p>
        <p className='text-justify text-[20px] md:px-5 md:py-2.5 md:leading-[1.8] lg:px-[30px]'>
          En 2016, j'ai décidé de me reconvertir aux métiers du Web en suivant la formation
          intensive de <strong>Développeur / Intégrateur Web</strong> à la{' '}
          <a
            href='http://3wa.fr'
            title='3WAcademy'
            {...EXTERNAL_LINK_PROPS}
            className='text-orange-400 hover:underline'
          >
            3WAcademy
          </a>{' '}
          de Strasbourg.
        </p>
      </article>
    </div>

    <div className='h-[4vw] translate-y-[2vw] -skew-y-2 bg-neutral-900' aria-hidden='true' />
  </section>
)
