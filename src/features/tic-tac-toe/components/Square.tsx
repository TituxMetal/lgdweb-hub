import type { Cell } from '../types'

type SquareProps = {
  position: number
  mark: Cell
  locked: boolean
  onPlay: (position: number) => void
}

/**
 * The 2021 original contributes exactly this much: the nine cells rendered as
 * `<button type='button'>` (20210211-simple-tic-tac-toe/src/components/Board/Square/index.js:3-5).
 * It carries no rule of its own — the painting, the occupied-cell refusal and
 * the win detection all come from the 2017 game.
 */
export const Square = ({ position, mark, locked, onPlay }: SquareProps) => (
  <button
    type='button'
    aria-label={mark === null ? `Case ${position + 1}` : `Case ${position + 1} : ${mark}`}
    disabled={mark !== null || locked}
    onClick={() => onPlay(position)}
    className='flex h-1/3 w-1/3 cursor-pointer items-center justify-center border-5 border-amber-400 bg-blue-400 text-[28px] leading-none text-neutral-900 disabled:cursor-default min-[460px]:text-5xl'
  >
    {mark}
  </button>
)
