import type { Card } from '../types'
import { MemoryCard } from './MemoryCard'

type MemoryBoardProps = {
  cards: ReadonlyArray<Card>
  onFlip: (id: number) => void
}

/**
 * Four columns by three rows, 70vh and 460px wide, growing to 90vh and 640px
 * past 460px of viewport width (`_board.scss:9-17, :56-63`), with the original's
 * 1000px perspective carrying the flip (`_board.scss:13`).
 */
export const MemoryBoard = ({ cards, onFlip }: MemoryBoardProps) => (
  <div className='grid h-[70vh] max-h-125 w-full max-w-115 grid-cols-4 grid-rows-3 gap-2.5 perspective-[1000px] min-[460px]:h-[90vh] min-[460px]:max-h-175 min-[460px]:max-w-160'>
    {cards.map((card, position) => (
      <MemoryCard key={card.id} card={card} position={position} onFlip={onFlip} />
    ))}
  </div>
)
