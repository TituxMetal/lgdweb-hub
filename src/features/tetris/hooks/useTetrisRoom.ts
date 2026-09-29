import { useCallback, useEffect, useRef, useState } from 'react'
import type { RecoveryAction, SessionPeer, TetrisErrorCode } from '~/shared/tetrisProtocol'
import { clientId } from '../lib/clientId'
import { clearCodeFragment, codeFromFragment, writeCodeFragment } from '../lib/roomLink'
import { createRoomSession, type RoomSession } from '../lib/roomSession'
import { toPeerSnapshot } from '../lib/snapshot'
import type { GameState } from '../types'

/** Where a room stands, from the visitor's side. */
export type RoomPhase =
  /** `initSession` is on its way; no code yet. */
  | 'creating'
  /** `joinSession` is on its way, for a code the visitor arrived with or typed into the URL. */
  | 'joining'
  /** Seated, alone: the code is the thing to share. */
  | 'waiting'
  /** Seated, with the other player. */
  | 'playing'
  /** The room could not be reached: the rebuild budget is spent and the way out is solo. */
  | 'unreachable'

/** The room the visitor is in, as the interface shows it. */
export type RoomView = {
  /** The room's code, once the endpoint has named it — `null` while one is being minted. */
  code: string | null
  phase: RoomPhase
  /** The other player, or `null` while the room holds only the visitor. */
  peer: SessionPeer | null
  /** Whether the visitor's own socket is up; the endpoint keeps the seat while it is not. */
  connected: boolean
}

/**
 * Why the visitor is not sitting in their room.
 *
 * `seat-taken` and `unreachable` are the visitor's own end rather than a
 * refusal: the identity came back in another tab, or the connection could not be
 * rebuilt at all. Neither is a code the endpoint sends, and neither is a reason
 * to reconnect — `seat-taken` would only fight the tab that won the seat, and
 * `unreachable` has already spent every attempt it had.
 */
export type RoomNotice = {
  code: TetrisErrorCode | 'seat-taken' | 'unreachable'
  recovery: RecoveryAction | null
}

/** Which refusals mean the visitor holds no seat, so the room view goes with them. */
const LOSES_SEAT: Readonly<Record<TetrisErrorCode, boolean>> = {
  'invalid-message': false,
  'already-in-room': false,
  'not-in-room': true,
  'room-not-found': true,
  'room-full': true,
  'join-attempts-exceeded': true,
  'room-unavailable': true
}

type UseTetrisRoomResult = {
  /** The room the visitor is in, or `null` while the feature runs solo. */
  room: RoomView | null
  /** What the endpoint last refused, or `null`. */
  notice: RoomNotice | null
  /** Opens a room of the visitor's own and puts its code in the fragment. */
  createRoom: () => void
  /** Leaves the room: the socket closes, the fragment is dropped, the game goes on alone. */
  playSolo: () => void
}

/**
 * The visitor's room, over the game they are playing.
 *
 * A visitor who arrives with a code in the fragment asks for that seat; one who
 * arrives without plays alone until they open a room. Whichever way they came in,
 * the game is theirs and stays theirs: the hook relays the board it is handed and
 * shows the board it is told about, and never lets either player's game change
 * the other's.
 *
 * The socket outlives a lost connection — the endpoint holds the seat for a while,
 * and the session rebuilds and reclaims it under the same identifier — but not the
 * visit: leaving the feature closes it, which is what keeps a room from going ghost.
 */
export const useTetrisRoom = (state: GameState): UseTetrisRoomResult => {
  const [room, setRoom] = useState<RoomView | null>(null)
  const [notice, setNotice] = useState<RoomNotice | null>(null)
  const sessionRef = useRef<RoomSession | null>(null)
  const roomRef = useRef<RoomView | null>(null)
  const stateRef = useRef(state)

  const session = useCallback((): RoomSession => {
    sessionRef.current ??= createRoomSession(clientId(), () => toPeerSnapshot(stateRef.current), {
      onOpen: () => {
        // The socket is up; the frames that seat the visitor are what say where
        // the room now stands, so nothing is claimed here but the connection.
        // The view already reads as connected from the moment the visitor asked,
        // so an open that changes nothing keeps the same reference.
        setRoom((current) =>
          current === null || current.connected ? current : { ...current, connected: true }
        )
      },
      onMessage: (message) => {
        switch (message.type) {
          case 'sessionInitialized':
            writeCodeFragment(message.code)
            setRoom({
              code: message.code,
              phase: 'waiting',
              peer: null,
              connected: true
            })
            setNotice(null)
            return

          case 'sessionBroadcast': {
            writeCodeFragment(message.code)

            const peer =
              message.peers.clients.find((client) => client.id !== message.peers.you) ?? null

            setRoom({
              code: message.code,
              phase: peer === null ? 'waiting' : 'playing',
              peer,
              connected: true
            })
            setNotice(null)
            return
          }

          case 'stateUpdate':
            setRoom((current) =>
              current === null || current.peer === null || current.peer.id !== message.clientId
                ? current
                : { ...current, peer: { ...current.peer, state: message.state } }
            )
            return

          case 'error':
            if (LOSES_SEAT[message.code]) {
              // The visitor holds no seat any more, so they hold no socket
              // either: the endpoint stays reachable for the recovery action,
              // which opens a fresh connection, and a refused tab stops
              // heartbeating at a room it is not in.
              setRoom(null)
              sessionRef.current?.close()
              sessionRef.current = null
            }

            setNotice({ code: message.code, recovery: message.recovery })
            return

          case 'pong':
            return
        }
      },
      onClose: (cause) => {
        if (cause === 'seat-taken') {
          setRoom(null)
          setNotice({ code: 'seat-taken', recovery: 'play-solo' })
          return
        }

        if (cause === 'unreachable') {
          // The budget is spent: the room is not coming back, so the view stops
          // promising another attempt and offers the same way out a refusal does.
          setRoom((current) =>
            current === null ? null : { ...current, phase: 'unreachable', connected: false }
          )
          setNotice({ code: 'unreachable', recovery: 'play-solo' })
          return
        }

        // Same reference when the view already reads as disconnected, so a close
        // the visitor has been told about does not paint again.
        setRoom((current) =>
          current === null || !current.connected ? current : { ...current, connected: false }
        )
      }
    })

    return sessionRef.current
  }, [])

  // The committed room, for the fragment handler: it has to tell the room the
  // visitor is already sitting in from one they have just been invited to, and a
  // handler that outlives a render cannot read the state it was closed over.
  useEffect(() => {
    roomRef.current = room
  }, [room])

  // The code in the fragment is the whole invitation: arriving with one asks for
  // that seat, arriving without one plays alone. A fragment can also change
  // without a navigation — the panel's own link pasted into this tab, or a code
  // corrected in the address bar — so the same-document change is followed here
  // too; the mini-router watches the path and never learns the fragment exists.
  useEffect(() => {
    const followFragment = (): void => {
      const code = codeFromFragment()

      if (code === null) {
        // The fragment is gone: the visitor is back to playing alone.
        sessionRef.current?.close()
        sessionRef.current = null
        setRoom(null)
        setNotice(null)
        return
      }

      // Naming the room the visitor is already in — the endpoint's own code, or
      // the same one written in another case — asks for nothing: re-joining would
      // only race the seat this connection is holding.
      if (roomRef.current?.code?.toUpperCase() === code.toUpperCase()) return

      // Another room: the invitation replaces whatever this tab was doing, seat
      // and all, and the new connection asks for the new code.
      sessionRef.current?.close()
      sessionRef.current = null
      setNotice(null)
      setRoom({ code, phase: 'joining', peer: null, connected: true })
      session().join(code)
    }

    followFragment()
    window.addEventListener('hashchange', followFragment)

    return () => {
      window.removeEventListener('hashchange', followFragment)
      sessionRef.current?.close()
      sessionRef.current = null
    }
  }, [session])

  // The player's own board, relayed as it changes. The reference the game hands
  // back is stable between real moves, so a repaint the opponent caused sends
  // nothing.
  useEffect(() => {
    stateRef.current = state

    sessionRef.current?.relay(toPeerSnapshot(state))
  }, [state])

  const createRoom = useCallback(() => {
    setNotice(null)
    setRoom({ code: null, phase: 'creating', peer: null, connected: true })
    session().init()
  }, [session])

  const playSolo = useCallback(() => {
    clearCodeFragment()
    sessionRef.current?.close()
    sessionRef.current = null
    setRoom(null)
    setNotice(null)
  }, [])

  return { room, notice, createRoom, playSolo }
}
