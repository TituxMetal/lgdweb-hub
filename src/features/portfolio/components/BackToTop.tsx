import { useScrolledPastViewport } from '../hooks/useScrolledPastViewport'

/**
 * The original's back-to-top disc, shown past the first viewport
 * (`20210406-portfolio/src/assets/js/smoothScroll.js:104-129`).
 */
export const BackToTop = () => {
  const visible = useScrolledPastViewport()

  if (!visible) return null

  return (
    <button
      type='button'
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className='fixed right-5 bottom-5 z-30 flex size-12.5 cursor-pointer items-center justify-center rounded-full border border-orange-400/40 bg-neutral-900/20 text-base font-bold text-neutral-50/40 transition-colors hover:text-orange-400'
    >
      TOP
    </button>
  )
}
