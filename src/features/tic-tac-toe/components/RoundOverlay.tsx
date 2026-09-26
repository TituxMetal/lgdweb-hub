import { PLAYER_LABELS } from '../lib/game'
import type { RoundOutcome, Score } from '../types'

type RoundOverlayProps = {
  outcome: RoundOutcome
  score: Score
  onContinue: () => void
}

/**
 * The original round-end panel: a dark plate carrying the result, both scores
 * in that order, and the line telling the visitor what to click (app.js:25-47).
 * It covers the game — the plate it is positioned against — so the shell and
 * `BackToList` stay reachable, and clicking it (or pressing it, since the whole
 * plate is one button) clears the board and starts the next round.
 */
export const RoundOverlay = ({ outcome, score, onContinue }: RoundOverlayProps) => {
  let message = 'Le joueur deux gagne la partie'
  if (outcome.kind === 'draw') message = 'Match null, aucun joueur ne gagne la partie'
  else if (outcome.winner === 'X') message = 'Le joueur un gagne la partie'

  return (
    <button
      type='button'
      onClick={onContinue}
      className='absolute inset-0 z-10 flex cursor-pointer flex-col items-center justify-center gap-2 bg-neutral-950/90 px-4 text-center text-[28px] text-neutral-50 min-[460px]:text-[50px]'
    >
      <span>{message}</span>
      <span>
        {PLAYER_LABELS.playerOne} : {score.playerOne}
      </span>
      <span>
        {PLAYER_LABELS.playerTwo} : {score.playerTwo}
      </span>
      <span>Pour continuer à jouer cliquez sur le fond noir</span>
    </button>
  )
}
