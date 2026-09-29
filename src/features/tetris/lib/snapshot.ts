import type { PeerSnapshot } from '~/shared/tetrisProtocol'
import type { GameState } from '../types'
import { displayBoard } from './board'

/**
 * One player's own game, as the player beside them sees it: the field with the
 * falling piece written in, the score, and what the game is doing.
 *
 * Nothing else travels. Each board belongs to its own player, so the pieces, the
 * queue and the drop speed stay home, and what crosses the wire is a picture of a
 * board rather than a board anyone else could play with.
 */
export const toPeerSnapshot = (state: GameState): PeerSnapshot => ({
  grid: displayBoard(state),
  score: state.score,
  status: state.status
})
