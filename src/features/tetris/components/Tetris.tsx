import { BackToList } from '~/components/BackToList'
import { useTetrisGame } from '../hooks/useTetrisGame'
import { useTetrisRoom } from '../hooks/useTetrisRoom'
import { OpponentPanel } from './OpponentPanel'
import { PlayerPanel } from './PlayerPanel'
import { RoomPanel } from './RoomPanel'

const HEADER_BUTTON =
  'cursor-pointer rounded-md border border-neutral-500/60 px-3 py-1.5 text-xs text-neutral-300 transition-colors select-none hover:bg-neutral-700'

/**
 * Tetris: the field, the piece behind the falling one, the score, the five
 * buttons and the keys — all of them live at once, with no device detection and
 * no swipes. The visitor's game lives on the plate the original's page was, and
 * the shell owns everything around it.
 *
 * The same plate carries the two-player mode: a code in the URL fragment is a room
 * the visitor was invited to, a visitor without one plays alone until they open a
 * room, and either way the game they are playing is the game they keep playing —
 * the room only puts another board beside theirs, drawn from what the other player
 * relays. Nothing crosses between the two: no lines, no shared queue, no attack.
 */
export const Tetris = () => {
  const { state, start, move, rotate, softDrop, hardDrop, togglePause } = useTetrisGame()
  const { room, notice, createRoom, playSolo } = useTetrisRoom(state)
  const running = state.status === 'running'
  // The pause belongs to a game under way, not to one that never started or is
  // already over.
  const playing = running || state.status === 'paused'

  const game = {
    state,
    onStart: start,
    onMove: move,
    onRotate: rotate,
    onSoftDrop: softDrop,
    onHardDrop: hardDrop
  }

  return (
    <section className='space-y-4'>
      <BackToList />

      <header className='flex min-h-8 flex-wrap items-center justify-between gap-3'>
        <h2 className='font-medium text-neutral-100'>Tetris</h2>
        <div className='flex items-center gap-2'>
          {/* A refusal carries its own way out, so the invitation would only repeat it. */}
          {room === null && notice === null && (
            <button type='button' onClick={createRoom} className={HEADER_BUTTON}>
              Jouer à deux
            </button>
          )}

          {playing && (
            <button type='button' onClick={togglePause} className={HEADER_BUTTON}>
              {running ? 'Pause' : 'Reprendre'}
            </button>
          )}
        </div>
      </header>

      <RoomPanel room={room} notice={notice} onCreateRoom={createRoom} onPlaySolo={playSolo} />

      {/* The plate is the original's grey body. On a desk it takes the shell's
        column — the field inside it is sized by its own height budget, not by
        this width — so the grey fills the page the way the original's body did
        and two boards have room side by side. A phone keeps the narrower plate
        it was built for. */}
      <div
        className={`mx-auto flex w-full flex-col items-center gap-4 rounded-md bg-neutral-800 px-4 py-6 ${room === null ? 'max-w-md lg:max-w-none' : 'max-w-md md:max-w-none'}`}
      >
        {room === null ? (
          <PlayerPanel {...game} />
        ) : (
          // Two boards, each its own game: neither is a second copy of the other.
          <div className='grid w-full gap-6 md:grid-cols-2'>
            <PlayerPanel {...game} />
            <OpponentPanel peer={room.peer} />
          </div>
        )}
      </div>

      <p className='text-center text-xs text-neutral-500'>
        Flèches ou boutons pour déplacer · W, X ou Z pour tourner · Espace pour la chute rapide · P
        pour la pause
      </p>
    </section>
  )
}
