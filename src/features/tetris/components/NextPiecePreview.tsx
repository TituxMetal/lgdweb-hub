import { createShape, PIECE_CLASSES, trimShape } from '../lib/pieces'
import type { PieceType } from '../types'
import { flattenCells } from './cells'

type NextPiecePreviewProps = {
  queue: readonly PieceType[]
}

/**
 * The piece behind the falling one, in the orientation it will enter in — an
 * addition to the original, which showed the falling piece and its score and
 * nothing else (`dist/index.html:14-19`). Its cell size matches the
 * board's at a glance rather than its cell count: the shape is trimmed to the
 * cells it fills, so the long piece reads as the long piece in either orientation.
 */
export const NextPiecePreview = ({ queue }: NextPiecePreviewProps) => {
  const type = queue[0]

  // The queue is dealt in bags of seven and refilled when it runs dry, so a head
  // is always there; the guard is what the array's type needs.
  if (type === undefined) return null

  const shape = trimShape(createShape(type))
  const columns = Math.max(...shape.map((row) => row.length))

  return (
    <div className='flex flex-col items-center gap-1.5'>
      <span className='font-mono text-[10px] tracking-wider text-neutral-500 uppercase'>
        Suivant
      </span>
      <div className='flex size-14 items-center justify-center rounded-sm bg-neutral-700'>
        <div
          className='grid place-content-center'
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {flattenCells(shape).map(({ key, cell }) => (
            <div key={key} className={`size-3 ${cell ? PIECE_CLASSES[type] : ''}`} />
          ))}
        </div>
      </div>
    </div>
  )
}
