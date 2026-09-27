import { type MouseEvent, useEffect, useRef, useState } from 'react'
import { isPlainLeftClick } from '~/lib/router'
import { SECTIONS, type Section, type SectionId } from '../lib/sections'

type PortfolioNavProps = {
  active: SectionId | null
  onNavigate: (id: SectionId) => void
}

type NavItemProps = {
  section: Section
  active: SectionId | null
  onNavigate: (id: SectionId) => void
  /** Runs before the jump; the phone menu uses it to close itself. */
  onMenuClose?: () => void
  className: string
}

/** The breakpoint the two layouts split on, the same one Tailwind's `md` uses. */
const WIDE_LAYOUT = '(min-width: 768px)'

/**
 * A section link. Plain left-clicks are intercepted so the jump can be smooth
 * and the URL written by hand; every other click (a modifier, a middle button)
 * falls through to the browser, which is what makes "open in a new tab" work
 * with the section already addressed in the href.
 */
const NavItem = ({ section, active, onNavigate, onMenuClose, className }: NavItemProps) => {
  const isActive = section.id === active

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!isPlainLeftClick(event)) return

    event.preventDefault()
    onMenuClose?.()
    onNavigate(section.id)
  }

  return (
    <a
      href={`#${section.id}`}
      aria-current={isActive ? 'true' : undefined}
      onClick={onClick}
      className={`${className} ${isActive ? 'border-orange-400 text-orange-400' : 'border-transparent text-orange-400'}`}
    >
      {section.label}
    </a>
  )
}

/**
 * The original's two navigation shapes, kept apart by breakpoint: below `md` a
 * hamburger opening a full-screen menu over a dark plate, from `md` a bar that
 * sticks to the top of the viewport once the hero has scrolled past
 * (`20210406-portfolio/src/assets/scss/_menu.scss`). Both mark the section the
 * reader is inside, which the original did not.
 *
 * The phone menu is a native modal `dialog`: the browser keeps focus inside it,
 * puts the page behind it out of the tab order and closes it on Escape, so the
 * feature needs no hand-rolled focus trap and reaches nothing outside itself.
 */
export const PortfolioNav = ({ active, onNavigate }: PortfolioNavProps) => {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const menu = menuRef.current
    if (menu === null) return

    if (open) menu.showModal()
    else menu.close()
  }, [open])

  // A modal opened on a phone survives a rotation or a resized window, where
  // the hamburger that closed it is gone; the wide layout closes it instead.
  useEffect(() => {
    const wide = window.matchMedia(WIDE_LAYOUT)
    const onLayoutChange = () => {
      if (wide.matches) setOpen(false)
    }

    wide.addEventListener('change', onLayoutChange)
    return () => wide.removeEventListener('change', onLayoutChange)
  }, [])

  return (
    <>
      <div className='sticky top-0 z-20 hidden bg-neutral-900/90 md:block'>
        <nav className='mx-auto flex h-20 max-w-[80em] items-center justify-around'>
          {SECTIONS.map((section) => (
            <NavItem
              key={section.id}
              section={section}
              active={active}
              onNavigate={onNavigate}
              className='border-b-2 px-5 py-4 text-base font-bold uppercase transition-colors hover:border-orange-400'
            />
          ))}
        </nav>
      </div>

      <button
        type='button'
        aria-label='Ouvrir le menu'
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className='fixed top-4 right-4 z-30 flex size-12.5 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-full bg-neutral-950/20 transition-transform duration-200 md:hidden'
      >
        <span aria-hidden='true' className='h-0.5 w-[46%] bg-neutral-50' />
        <span aria-hidden='true' className='h-0.5 w-[46%] bg-neutral-50' />
        <span aria-hidden='true' className='h-0.5 w-[46%] bg-neutral-50' />
      </button>

      <dialog
        ref={menuRef}
        onClose={() => setOpen(false)}
        aria-label='Sections'
        className='m-0 h-auto max-h-none w-auto max-w-none border-0 bg-neutral-950/90 p-0 text-neutral-50 md:hidden'
      >
        <button
          type='button'
          aria-label='Fermer le menu'
          onClick={() => setOpen(false)}
          className='fixed top-4 right-4 flex size-12.5 cursor-pointer rotate-180 flex-col items-center justify-center gap-1.5 rounded-full bg-neutral-950/20'
        >
          <span
            aria-hidden='true'
            className='h-0.5 w-[46%] translate-y-2 rotate-45 bg-neutral-50'
          />
          <span aria-hidden='true' className='h-0.5 w-[46%] bg-neutral-50 opacity-0' />
          <span
            aria-hidden='true'
            className='h-0.5 w-[46%] -translate-y-2 -rotate-45 bg-neutral-50'
          />
        </button>

        <ul className='flex h-full flex-col flex-wrap items-center justify-between p-10'>
          {SECTIONS.map((section) => (
            <li key={section.id} className='w-full'>
              <NavItem
                section={section}
                active={active}
                onNavigate={onNavigate}
                onMenuClose={() => setOpen(false)}
                className='mx-auto block w-fit border-b-2 text-base font-bold uppercase'
              />
            </li>
          ))}
        </ul>
      </dialog>
    </>
  )
}
