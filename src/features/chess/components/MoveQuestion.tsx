import { type KeyboardEvent, useCallback, useState } from 'react'
import { type AppliedMove, applyMove, applyNotation } from '../lib/moves'
import type { ChessQuestion } from '../lib/stories'
import { Button } from './Button'
import { ChessBoard } from './ChessBoard'

type MoveQuestionProps = {
  question: ChessQuestion
  /** The position the question is played from, resolved. */
  position: string
  /** Called with every move a visitor plays, right or wrong, as the original did. A
   *  wrong move is answered with the chapter's own explanation and a retry, but the
   *  caller keeps the step on closed until the move is right. */
  onAnswer: (correct: boolean) => void
}

/**
 * The original's move-based question (`MoveBasedQuestion.tsx` and its three
 * sections): the board to drag a piece on, the field to type the move instead —
 * notation as a player writes it (`e4`, `Nf3`) or as the content names it (`e2e4`)
 * — and one status line that says what was played and whether it answers the
 * question, with a retry while it does not. The original's two English labels and
 * its three English messages are French here.
 */
export const MoveQuestion = ({ question, position, onAnswer }: MoveQuestionProps) => {
  const [fen, setFen] = useState(position)
  const [played, setPlayed] = useState<string | null>(null)
  const [entry, setEntry] = useState('')
  const [entryError, setEntryError] = useState<string | null>(null)

  const settled = played !== null
  const correct = played !== null && question.correctAnswer.includes(played)

  // Stable while the visitor types: the board is memoised, and a keystroke must not
  // hand it a new callback.
  const play = useCallback(
    (move: AppliedMove) => {
      setFen(move.fen)
      setPlayed(move.uci)
      onAnswer(question.correctAnswer.includes(move.uci))
    },
    [onAnswer, question.correctAnswer]
  )

  const playFromBoard = useCallback(
    (move: { from: string; to: string }): boolean => {
      if (settled) return false

      const applied = applyMove(fen, move.from, move.to)
      if (applied === null) return false

      play(applied)

      return true
    },
    [fen, play, settled]
  )

  const playFromEntry = () => {
    if (settled) return

    const applied = applyNotation(fen, entry)

    if (applied === null) {
      setEntryError('Ce coup n’est pas possible dans cette position.')
      return
    }

    setEntryError(null)
    play(applied)
  }

  const onEntryKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key !== 'Enter') return

    event.preventDefault()
    playFromEntry()
  }

  const retry = () => {
    setFen(position)
    setPlayed(null)
    setEntry('')
    setEntryError(null)
  }

  return (
    <div className='rounded-lg border border-zinc-700 bg-zinc-800 p-8'>
      <h3 className='mb-6 text-xl font-medium text-zinc-100'>{question.prompt}</h3>

      <div className='flex justify-center'>
        <ChessBoard position={fen} interactive={!settled} onMove={playFromBoard} />
      </div>

      <div className='mt-6 space-y-3'>
        <label htmlFor='chess-move' className='block text-sm font-medium text-zinc-300'>
          Ou saisissez le coup en notation algébrique :
        </label>

        <div className='flex gap-2'>
          <input
            id='chess-move'
            type='text'
            value={entry}
            onChange={(event) => setEntry(event.target.value)}
            onKeyDown={onEntryKeyDown}
            disabled={settled}
            placeholder='ex. e2e4 ou e4'
            className='flex-1 rounded-lg border border-zinc-600 bg-zinc-900 px-4 py-2 text-zinc-100 placeholder:text-zinc-500 focus:border-amber-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60'
          />

          <Button
            onClick={playFromEntry}
            disabled={settled || entry.trim() === ''}
            variant='primary'
          >
            Valider le coup
          </Button>
        </div>

        {entryError !== null && <p className='text-sm text-red-400'>{entryError}</p>}
      </div>

      {played !== null && (
        <div
          className={`mt-6 rounded-lg border p-4 ${
            correct ? 'border-emerald-500 bg-emerald-900' : 'border-red-500 bg-zinc-800'
          }`}
        >
          <div className='mb-2 flex items-center justify-between'>
            <p className={`font-medium ${correct ? 'text-emerald-300' : 'text-red-300'}`}>
              {correct ? '✓ Coup correct !' : '✗ Coup incorrect'}
            </p>
            {!correct && (
              <Button onClick={retry} variant='primary'>
                Réessayer
              </Button>
            )}
          </div>

          <p className='text-sm text-zinc-400'>Vous avez joué : {played}</p>

          {/* The original showed the explanation only for a right answer, which left a
              visitor who was sure of his move with "incorrect" and no reason — the trap
              chapters above all, where the refused move is the one the chapter exists to
              warn about. It is shown either way, labelled as the chapter's teaching
              rather than as praise when the move was wrong. */}
          {!correct && (
            <p className='mt-3 text-sm font-medium text-zinc-300'>Ce que le chapitre enseigne :</p>
          )}

          <p className='mt-2 text-sm text-zinc-300'>{question.explanation}</p>
        </div>
      )}
    </div>
  )
}
