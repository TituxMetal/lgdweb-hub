import { useEffect, useState } from 'react'

/**
 * The original showed its back-to-top button past the first viewport
 * (`20210406-portfolio/src/assets/js/smoothScroll.js:106-129`). The scroll
 * listener is passive and released on unmount.
 */
export const useScrolledPastViewport = (): boolean => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY >= window.innerHeight)
    onScroll()

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return visible
}
