import type { ReactNode } from 'react'
import { BOARD_HEIGHT, BOARD_WIDTH, merge } from '../lib/board'
import { PIECE_CLASSES } from '../lib/pieces'
import type { GameState } from '../types'
import { flattenCells } from './cells'

type BoardProps = {
  state: GameState
  children?: ReactNode
}

/**
 * The field, drawn as a grid of elements rather than the canvas the original
 * painted (`Tetris.js:26-43`): the port renders it as one element per cell, so
 * the cells are Tailwind entries and a resting piece is a coloured cell.
 *
 * The falling piece is merged into the stack for display only — the state keeps
 * them apart until it locks. The grid keeps the original field's 3/5 ratio (its
 * 12 × 20 cells of one square), sized against the shell's column rather than the
 * viewport the original measured: a share of the plate wide, capped in rem so a
 * desktop window gets the larger field and a phone the one that leaves room for
 * both pad rows under it.
 */
export const Board = ({ state, children }: BoardProps) => {
  const { board, piece } = state
  const cells = piece === null ? board : merge(board, piece)

  return (
    <div
      className='relative grid aspect-[3/5] w-[68%] max-w-52 border-2 border-neutral-100 bg-neutral-700 lg:max-w-56'
      style={{
        gridTemplateColumns: `repeat(${BOARD_WIDTH}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${BOARD_HEIGHT}, minmax(0, 1fr))`
      }}
    >
      {flattenCells(cells).map(({ key, cell }) => (
        <div key={key} className={cell === null ? '' : PIECE_CLASSES[cell]} />
      ))}

      {children}
    </div>
  )
}
