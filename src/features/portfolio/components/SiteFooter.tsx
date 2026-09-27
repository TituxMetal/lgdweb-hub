import { EXTERNAL_LINK_PROPS } from '~/lib/links'
import { Link } from '~/lib/router'

/**
 * The original's own footer, kept as content: the capabilities it summarised,
 * its three links and its credit line (`20210406-portfolio/src/index.html:459-513`,
 * `_footer.scss`). "Accueil du site" pointed at the portfolio's home page, which
 * the showroom's list now is.
 */
export const SiteFooter = () => (
  <footer className='flex flex-wrap justify-center bg-neutral-900 py-9 pb-0'>
    <h3 className='mx-auto w-4/5 pt-[1em] text-center sm:w-[70%] sm:pt-[1em] sm:text-left'>
      Guillaume LANG
    </h3>

    <section className='w-4/5 pt-[1em] text-base sm:w-1/2 sm:pb-[1em]'>
      <ul className='mx-auto flex w-full flex-wrap items-center justify-start sm:flex-col sm:items-start'>
        <li className='p-2.5 sm:py-[1em]'>Création de sites Web</li>
        <li className='p-2.5 sm:py-[1em]'>Développement front-end</li>
        <li className='p-2.5 sm:py-[1em]'>Responsive Web Design</li>
        <li className='p-2.5 sm:py-[1em]'>Administration de serveur Linux</li>
        <li className='p-2.5 sm:py-[1em]'>Optimisation Seo</li>
      </ul>
    </section>

    <section className='w-4/5 pt-[1em] text-base sm:w-[30%] sm:self-center sm:py-[1em]'>
      <ul className='mx-auto mb-[2em] flex w-full flex-col items-start sm:justify-center'>
        <li className='p-2.5'>
          <Link to='/' className='text-neutral-50 hover:underline'>
            Accueil du site
          </Link>
        </li>
        <li className='p-2.5'>
          <a
            href='https://github.com/TituxMetal'
            title='Compte GitHub de Guillaume LANG'
            {...EXTERNAL_LINK_PROPS}
            className='text-neutral-50 hover:underline'
          >
            Compte GitHub
          </a>
        </li>
        <li className='p-2.5'>
          <a
            href='https://gitlab.com/TituxMetal'
            title='Compte GitLab de Guillaume LANG'
            {...EXTERNAL_LINK_PROPS}
            className='text-neutral-50 hover:underline'
          >
            Compte GitLab
          </a>
        </li>
      </ul>
    </section>

    <section className='w-full bg-neutral-700 p-[2em] text-[0.8em] text-neutral-400'>
      <p className='mx-auto mb-[1em] text-center'>
        Ce portfolio : la version 2021,{' '}
        <a
          href='https://web.archive.org/web/20220628150439/https://portfolio.lang-guillaume.com/'
          title='Le portfolio de 2021 tel que publié, capture archive.org'
          {...EXTERNAL_LINK_PROPS}
          className='hover:underline'
        >
          telle que portée ici
        </a>{' '}
        ou la{' '}
        <a
          href='https://web.archive.org/web/20170603125017/http://lang-guillaume.com/'
          title='La première version du portfolio, capture archive.org'
          {...EXTERNAL_LINK_PROPS}
          className='hover:underline'
        >
          première version de 2017
        </a>
        .
      </p>
      <span className='mx-auto block text-center'>Created with love and lots of coffee</span>
      <span className='mx-auto block text-center'>by Guillaume LANG</span>
      <span className='mx-auto block text-center'>
        <a href='https://github.com/TituxMetal/portfolio' {...EXTERNAL_LINK_PROPS}>
          Voir le code source
        </a>
      </span>
    </section>
  </footer>
)
