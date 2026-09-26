import heroBackground from '../assets/sectionHeaderBackground.jpg'

/**
 * The original's full-viewport header: the portrait photo, the name in
 * Courgette and the two roles
 * (`20210406-portfolio/src/index.html:38-46`, `_head.scss:1-41`). The two
 * paragraphs are the original's `p` rules, not a single block.
 */
export const Hero = () => (
  <header
    className='flex h-screen items-center justify-center bg-cover bg-center bg-fixed bg-no-repeat'
    style={{ backgroundImage: `url(${heroBackground})` }}
  >
    <div className='w-full'>
      <h1 className='text-center text-[35px] font-black text-orange-500 sm:text-[50px]'>
        Guillaume LANG
      </h1>
      <p className='py-2.5 text-center text-[22px] font-black text-neutral-50 sm:text-[30px]'>
        Développeur / Intégrateur Web
      </p>
      <p className='py-2.5 text-center text-[22px] font-black text-neutral-50 sm:text-[30px]'>
        Administrateur Système Linux
      </p>
    </div>
  </header>
)
