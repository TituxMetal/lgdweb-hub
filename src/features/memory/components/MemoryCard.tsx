import ansibleLogo from '../assets/ansibleLogo.svg'
import backFaceArt from '../assets/backFace.svg'
import dockerLogo from '../assets/dockerLogo.svg'
import gitLogo from '../assets/gitLogo.svg'
import html5Logo from '../assets/html5Logo.svg'
import javascriptLogo from '../assets/javascriptLogo.svg'
import sassLogo from '../assets/sassLogo.svg'
import type { Card, SymbolId } from '../types'

type SymbolFace = {
  label: string
  logo: string
}

/**
 * The 2018 front faces, one logo per symbol. The artwork is the original's own,
 * copied byte for byte from `memoryGame/src/assets/img/` — the eye of the era is
 * the drawing, not a stand-in for it — so each logo paints its own colours
 * rather than a mapped class (recorded in `palette.md`).
 */
const SYMBOL_FACES: Record<SymbolId, SymbolFace> = {
  ansible: { label: 'Ansible', logo: ansibleLogo },
  docker: { label: 'Docker', logo: dockerLogo },
  git: { label: 'Git', logo: gitLogo },
  html: { label: 'HTML5', logo: html5Logo },
  javascript: { label: 'JavaScript', logo: javascriptLogo },
  sass: { label: 'Sass', logo: sassLogo }
}

type MemoryCardProps = {
  card: Card
  position: number
  onFlip: (id: number) => void
}

export const MemoryCard = ({ card, position, onFlip }: MemoryCardProps) => {
  const face = SYMBOL_FACES[card.symbol]
  const faceUp = card.status !== 'down'

  return (
    <button
      type='button'
      aria-label={
        faceUp ? `Carte ${position + 1}, ${face.label}` : `Carte ${position + 1}, face cachée`
      }
      disabled={faceUp}
      onClick={() => onFlip(card.id)}
      className={`relative cursor-pointer transition-transform duration-500 transform-3d active:scale-97 disabled:cursor-default ${faceUp ? 'rotate-y-180' : ''}`}
    >
      {/* The card back: the original's `backFace.svg` motif on the `$cardBg` plate
          (`_board.scss:38-48`). The button names the card, so the art is decorative. */}
      <span className='absolute inset-0 rounded-[5px] border border-neutral-100/50 bg-violet-800 p-1.25 backface-hidden'>
        <img src={backFaceArt} alt='' className='h-full w-full' />
      </span>
      {/* The revealed face: the symbol's own logo, as the original's `.front-face` img was. */}
      <span className='absolute inset-0 rounded-[5px] border border-neutral-100/50 bg-violet-800 p-1.25 backface-hidden rotate-y-180'>
        <img src={face.logo} alt='' className='h-full w-full' />
      </span>
    </button>
  )
}
