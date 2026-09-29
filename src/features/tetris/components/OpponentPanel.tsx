import { memo } from 'react'
import type { PeerStatus, SessionPeer } from '~/shared/tetris-protocol'
import { createBoard } from '../lib/board'
import { Board } from './Board'

type OpponentPanelProps = {
  /** The other player as the endpoint last described them, or `null` while the room waits for one. */
  peer: SessionPeer | null
}

/** What the other player's game is doing, in the words the interface uses. */
const PEER_STATUS_COPY: Readonly<Record<PeerStatus, string>> = {
  ready: 'Prêt',
  running: 'En jeu',
  paused: 'En pause',
  over: 'Partie terminée'
}

/** The field before anyone has relayed one: the same arena, empty. */
const EMPTY_GRID = createBoard()

/**
 * The player beside them, drawn from what they relayed.
 *
 * Nothing here is a game: the grid arrives as it is painted, so the piece that is
 * falling on their screen is the piece that appears here mid-fall, and the score
 * and the status are theirs to report. Their board is never touched by this side —
 * no lines are added to it, no queue is shared with it, no move is sent to it.
 *
 * A player who is away keeps their place and their last board, marked as away,
 * because the endpoint is holding their seat for them.
 *
 * Memoised: the plate re-renders on every one of the visitor's own moves, and this
 * panel draws the other seat's board, which none of those moves changed.
 */
export const OpponentPanel = memo(({ peer }: OpponentPanelProps) => (
  <div className='flex flex-col items-center gap-4'>
    <div className='flex w-full max-w-sm items-start justify-between gap-4'>
      <dl className='font-mono tabular-nums'>
        <dt className='text-[10px] tracking-wider text-neutral-500 uppercase'>Adversaire</dt>
        <dd className='text-xl font-semibold text-neutral-300'>{peer?.state.score ?? 0}</dd>
      </dl>

      <p className='text-xs text-neutral-400'>
        {peer === null ? 'En attente' : PEER_STATUS_COPY[peer.state.status]}
      </p>
    </div>

    <Board grid={peer?.state.grid ?? EMPTY_GRID}>
      {peer === null && (
        <div className='absolute inset-0 flex items-center justify-center bg-neutral-800/90 p-2 text-center text-xs text-neutral-300'>
          La partie de ton adversaire apparaîtra ici.
        </div>
      )}
    </Board>

    {peer !== null && !peer.connected && (
      <p className='text-center text-xs text-neutral-400'>
        Adversaire déconnecté — sa place est gardée.
      </p>
    )}
  </div>
))
