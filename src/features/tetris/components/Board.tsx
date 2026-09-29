import type { ReactNode } from 'react'
import { BOARD_HEIGHT, BOARD_WIDTH } from '../lib/board'
import { PIECE_CLASSES } from '../lib/pieces'
import type { Board as BoardGrid } from '../types'
import { flattenCells } from './cells'

type BoardProps = {
  /**
   * The grid to draw, rows of cells — a player's own field read through
   * `displayBoard`, or the board their opponent relayed. The two are the same
   * drawing: a relayed snapshot carries the grid as it is painted, its falling
   * piece already written into the stack.
   */
  grid: BoardGrid
  children?: ReactNode
}

/**
 * The field, drawn as a grid of elements rather than the canvas the original
 * painted (`Tetris.js:26-43`): the port renders it as one element per cell, so
 * the cells are Tailwind entries and a resting piece is a coloured cell.
 *
 * The grid keeps the original field's 3/5 ratio (its 12 × 20 cells of one
 * square). A phone gets a share of the plate's width, capped in rem, so the field
 * stands whole in the portrait column with both pad rows under it. From `lg` the
 * field fills the column its panel gives it, and the panel is what carries the
 * height budget: it is as wide as the height the page can spare leaves for a 3/5
 * box, so the field is sized against that height the way the original's `90vh`
 * was — never against a fixed rem cap. Its height then follows from the ratio,
 * and the panel is sized by the plate, which decides whether its column is the
 * whole width or half of it — that is how two players' fields sit side by side.
 */
export const Board = ({ grid, children }: BoardProps) => (
  <div
    className='relative grid aspect-[3/5] w-[68%] max-w-52 border-2 border-neutral-100 bg-neutral-700 lg:w-full lg:max-w-none'
    style={{
      gridTemplateColumns: `repeat(${BOARD_WIDTH}, minmax(0, 1fr))`,
      gridTemplateRows: `repeat(${BOARD_HEIGHT}, minmax(0, 1fr))`
    }}
  >
    {flattenCells(grid).map(({ key, cell }) => (
      <div key={key} className={cell === null ? '' : PIECE_CLASSES[cell]} />
    ))}

    {children}
  </div>
)
