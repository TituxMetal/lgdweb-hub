import { useEffect, useState } from 'react'
import type { RecoveryAction, TetrisErrorCode } from '~/shared/tetris-protocol'
import type { RoomNotice, RoomPhase, RoomView } from '../hooks/useTetrisRoom'
import { roomLink } from '../lib/room-link'

type RoomPanelProps = {
  /** Where the visitor's room stands, or `null` while they play alone. */
  room: RoomView | null
  /** What the endpoint refused, or `null`. */
  notice: RoomNotice | null
  onCreateRoom: () => void
  onPlaySolo: () => void
}

/** Where a room stands, in the visitor's words. */
const PHASE_COPY: Readonly<Record<RoomPhase, string>> = {
  creating: 'Création de la partie',
  joining: 'Connexion à la partie',
  waiting: 'En attente d’un adversaire',
  playing: 'Partie en cours',
  unreachable: 'Partie injoignable'
}

/**
 * Why the visitor is not in the room they asked for. The endpoint sends the
 * reason as a code; the words are the interface's, which is why they are here and
 * not on the wire.
 */
const NOTICE_COPY: Readonly<Record<TetrisErrorCode | 'seat-taken' | 'unreachable', string>> = {
  'invalid-message': 'Le serveur a refusé un message.',
  'already-in-room': 'Tu es déjà dans une partie.',
  'not-in-room': 'Tu n’es plus dans cette partie.',
  'room-not-found':
    'Cette partie n’existe plus : ton adversaire l’a quittée, ou le serveur a redémarré.',
  'room-full': 'Cette partie est déjà complète : deux joueurs au maximum.',
  'join-attempts-exceeded': 'Trop de tentatives de connexion d’affilée.',
  'room-unavailable': 'Le serveur n’a pas pu ouvrir de partie.',
  'seat-taken': 'Cette partie est déjà ouverte dans un autre onglet.',
  unreachable: 'Le serveur n’a pas répondu : la partie n’a pas pu être rejointe.'
}

const RECOVERY_COPY: Readonly<Record<RecoveryAction, string>> = {
  'create-room': 'Créer une partie',
  'play-solo': 'Jouer en solo'
}

const PRIMARY_BUTTON =
  'cursor-pointer rounded-md bg-neutral-100 px-4 py-2 text-xs font-medium tracking-wide text-neutral-900 uppercase transition-colors hover:bg-neutral-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-100'

const SECONDARY_BUTTON =
  'cursor-pointer rounded-md border border-neutral-500/60 px-4 py-2 text-xs text-neutral-300 transition-colors hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-100'

/**
 * The room's code, and the gesture that passes it on. A code is read aloud or
 * copied far more often than it is typed, so the link is here in full rather than
 * left to be rebuilt out of the address bar.
 */
const CopyLink = ({ link }: { link: string }) => {
  const [copied, setCopied] = useState(false)

  // The acknowledgement is the only timed thing in the feature: it clears itself,
  // and unmounting clears it too.
  useEffect(() => {
    if (!copied) return

    const timer = setTimeout(() => setCopied(false), 2000)

    return () => clearTimeout(timer)
  }, [copied])

  return (
    <button
      type='button'
      onClick={(event) => {
        // Focus goes back to the page, so the space bar drops the piece instead of
        // copying a second time — the same reason the other controls let go.
        event.currentTarget.blur()
        void navigator.clipboard
          ?.writeText(link)
          .then(() => setCopied(true))
          .catch(() => setCopied(false))
      }}
      className={SECONDARY_BUTTON}
    >
      {copied ? 'Lien copié' : 'Copier le lien'}
    </button>
  )
}

const RoomStatus = ({ room, link }: { room: RoomView; link: string | null }) => (
  <div className='flex flex-wrap items-center justify-between gap-3 rounded-md border border-neutral-500/60 bg-neutral-800 px-4 py-3'>
    <div className='space-y-1'>
      <p className='text-[10px] tracking-wider text-neutral-400 uppercase'>
        {PHASE_COPY[room.phase]}
      </p>

      {room.code !== null && (
        <p className='font-mono text-lg tracking-widest text-neutral-100'>{room.code}</p>
      )}

      {room.phase === 'waiting' && (
        <>
          <p className='max-w-md text-xs text-neutral-400'>
            Donne ce code, ou ce lien, à la personne qui joue avec toi. Chacun garde son plateau.
          </p>
          {link !== null && <p className='max-w-md break-all text-xs text-neutral-500'>{link}</p>}
        </>
      )}
    </div>

    {link !== null && <CopyLink link={link} />}

    {!room.connected && room.phase !== 'unreachable' && (
      <p className='w-full text-xs text-neutral-300'>Connexion perdue — nouvelle tentative…</p>
    )}
  </div>
)

const Refusal = ({
  notice,
  onCreateRoom,
  onPlaySolo
}: {
  notice: RoomNotice
  onCreateRoom: () => void
  onPlaySolo: () => void
}) => (
  <div className='space-y-3 rounded-md border border-neutral-500/60 bg-neutral-800 px-4 py-3'>
    <div className='space-y-1'>
      <p className='text-sm font-medium text-neutral-100'>Partie impossible</p>
      <p className='text-sm text-neutral-300'>{NOTICE_COPY[notice.code]}</p>
    </div>

    <div className='flex flex-wrap gap-2'>
      {notice.recovery !== null && (
        <button
          type='button'
          onClick={notice.recovery === 'create-room' ? onCreateRoom : onPlaySolo}
          className={PRIMARY_BUTTON}
        >
          {RECOVERY_COPY[notice.recovery]}
        </button>
      )}

      {/* Playing alone is always available, unless it is what the first button already does. */}
      {notice.recovery !== 'play-solo' && (
        <button type='button' onClick={onPlaySolo} className={SECONDARY_BUTTON}>
          Jouer en solo
        </button>
      )}
    </div>
  </div>
)

/**
 * What the endpoint last said about the room: where it stands, the code to share,
 * and a refusal with the way out when there is one. It is one panel rather than
 * three because it is one answer — the room the visitor asked for, or the reason
 * they are not in it.
 */
export const RoomPanel = ({ room, notice, onCreateRoom, onPlaySolo }: RoomPanelProps) => (
  <>
    {notice !== null && (
      <Refusal notice={notice} onCreateRoom={onCreateRoom} onPlaySolo={onPlaySolo} />
    )}
    {room !== null && (
      <RoomStatus room={room} link={room.code === null ? null : roomLink(room.code)} />
    )}
  </>
)
