import type { Card, SymbolId } from '../types'

type SymbolFace = {
  label: string
  glyph: string
  className: string
}

/**
 * The 2018 front faces are third-party logo SVGs. The port keeps each logo's
 * own colour — mapped in `palette.md` — and names the symbol with a monogram
 * instead of copying the artwork: the deck, the plate and the flip are what the
 * era is. `ansible` reads with its logo's white, since its near-black mark would
 * disappear on the card plate.
 */
const SYMBOL_FACES: Record<SymbolId, SymbolFace> = {
  ansible: { label: 'Ansible', glyph: 'A', className: 'text-neutral-50' },
  docker: { label: 'Docker', glyph: 'D', className: 'text-sky-600' },
  git: { label: 'Git', glyph: 'G', className: 'text-red-500' },
  html: { label: 'HTML5', glyph: 'H5', className: 'text-orange-600' },
  javascript: { label: 'JavaScript', glyph: 'JS', className: 'text-amber-300' },
  sass: { label: 'Sass', glyph: 'S', className: 'text-pink-400' }
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
      <span className='absolute inset-0 rounded-[5px] border border-neutral-100/50 bg-orange-300 backface-hidden' />
      <span
        className={`absolute inset-0 flex items-center justify-center rounded-[5px] border border-neutral-100/50 bg-violet-800 text-[24px] font-semibold backface-hidden rotate-y-180 ${face.className}`}
      >
        {face.glyph}
      </span>
    </button>
  )
}
