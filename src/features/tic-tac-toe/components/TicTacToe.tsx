import { useState } from 'react'
import { BackToList } from '~/components/BackToList'
import { createInitialState, currentPlayer, PLAYER_LABELS, play, startNextRound } from '../lib/game'
import { BOARD_POSITIONS, markForMove } from '../lib/rules'
import { RoundOverlay } from './RoundOverlay'
import { Square } from './Square'

export const TicTacToe = () => {
  const [state, setState] = useState(createInitialState)
  const outcome = state.outcome
  const player = currentPlayer(state)
  const mark = markForMove(state.moveCount)

  return (
    <section className='space-y-4'>
      <BackToList />

      <div className='relative flex min-h-screen flex-col items-center justify-center gap-6 border-[5px] border-lime-300 bg-neutral-900 px-4 py-8 text-neutral-50'>
        <h1 className='text-center text-[30px] text-teal-600'>Tic Tac Toe by Titux</h1>

        <p className='text-[16px] tabular-nums'>
          Au tour de {PLAYER_LABELS[player]} ({mark})
        </p>

        <div className='flex aspect-square w-[min(60vh,100%)] flex-wrap justify-center border-[5px] border-fuchsia-700 p-[10px]'>
          {BOARD_POSITIONS.map((position) => (
            <Square
              key={position}
              position={position}
              mark={state.board[position] ?? null}
              locked={outcome !== null}
              onPlay={(target) => setState((current) => play(current, target))}
            />
          ))}
        </div>

        <p className='text-[16px] tabular-nums'>
          {PLAYER_LABELS.playerOne} : {state.score.playerOne} · {PLAYER_LABELS.playerTwo} :{' '}
          {state.score.playerTwo}
        </p>

        {outcome !== null && (
          <RoundOverlay
            outcome={outcome}
            score={state.score}
            onContinue={() => setState(startNextRound)}
          />
        )}
      </div>
    </section>
  )
}
