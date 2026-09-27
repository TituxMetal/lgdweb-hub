import { useEffect, useState } from 'react'

/**
 * The original showed its back-to-top button past the first viewport
 * (`20210406-portfolio/src/assets/js/smoothScroll.js:106-129`). The first
 * viewport is read at mount, on scroll and on resize — a rotated phone or a
 * resized window moves it, and a verdict taken only on scroll would outlive it.
 * The scroll listener is passive and both listeners are released on unmount.
 */
export const useScrolledPastViewport = (): boolean => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onViewportChange = () => setVisible(window.scrollY >= window.innerHeight)
    onViewportChange()

    window.addEventListener('scroll', onViewportChange, { passive: true })
    window.addEventListener('resize', onViewportChange)
    return () => {
      window.removeEventListener('scroll', onViewportChange)
      window.removeEventListener('resize', onViewportChange)
    }
  }, [])

  return visible
}
