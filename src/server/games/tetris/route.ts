import { Hono } from 'hono'
import type { BunWebSocketData } from 'hono/bun'
import { upgradeWebSocket } from 'hono/bun'
import {
  HEARTBEAT_TIMEOUT_MS,
  parseClientMessage,
  type ServerMessage,
  type TetrisErrorCode
} from '../../../shared/tetrisProtocol'
import { MAX_JOIN_ATTEMPTS, type PeerSocket, RECOVERY_BY_CODE, RoomRegistry } from './room'

/**
 * The Tetris endpoint, as one route group: `GET /ws/tetris`, upgraded on the Bun
 * runtime. The room code travels in the page's fragment and never in a path, so
 * this group has a single fixed address and no parameter — every room is reached
 * through the socket's messages, not through the URL.
 *
 * Every frame a client sends is validated at this boundary (`parseClientMessage`)
 * and answered with a structured error when it is not a message this endpoint
 * speaks: nothing throws out of a handler, and nothing is dropped in silence. A
 * connection carries its identity, its seat's code and its join budget; a
 * heartbeat the client drives keeps a dead socket from being mistaken for a
 * quiet one on both ends.
 */

const registry = new RoomRegistry()

/** One open endpoint connection. */
type Connection = {
  /** The room sends through this; it is the connection's identity for the registry. */
  socket: PeerSocket
  /** The transport, once the upgrade has handed it over. */
  raw: Bun.ServerWebSocket<BunWebSocketData> | null
  /** The identifier the client minted, learnt at its first session message. */
  clientId: string | null
  /** The room it sits in, or `null` while it holds no seat. */
  code: string | null
  /** How many `joinSession` frames it has spent. */
  joins: number
  /** When a frame last arrived — a ping counts. The idle sweep reads it. */
  lastSeen: number
}

const connections = new Set<Connection>()

/**
 * A frame the connection went wrong on. The recovery action is the endpoint's
 * policy for the code, sent alongside it so the client has something to offer
 * without owning a copy of the rule.
 */
const refuse = (connection: Connection, code: TetrisErrorCode): void => {
  connection.socket.send({ type: 'error', code, recovery: RECOVERY_BY_CODE[code] })
}

const dispatch = (connection: Connection, frame: string): void => {
  connection.lastSeen = Date.now()

  const message = parseClientMessage(frame)
  if (message === null) {
    refuse(connection, 'invalid-message')
    return
  }

  switch (message.type) {
    case 'ping': {
      connection.socket.send({ type: 'pong' })
      return
    }

    case 'initSession': {
      if (connection.clientId !== null) {
        refuse(connection, 'already-in-room')
        return
      }

      const outcome = registry.init(message.clientId, message.state, connection.socket)
      if (!outcome.ok) {
        refuse(connection, outcome.code)
        return
      }

      connection.clientId = message.clientId
      connection.code = outcome.code
      connection.socket.send({
        type: 'sessionInitialized',
        code: outcome.code,
        token: outcome.token
      })
      return
    }

    case 'joinSession': {
      if (connection.clientId !== null) {
        refuse(connection, 'already-in-room')
        return
      }

      if (connection.joins >= MAX_JOIN_ATTEMPTS) {
        refuse(connection, 'join-attempts-exceeded')
        return
      }

      connection.joins += 1

      const outcome = registry.join(
        message.clientId,
        message.code,
        message.state,
        connection.socket,
        message.token
      )

      if (!outcome.ok) {
        refuse(connection, outcome.code)
        return
      }

      connection.clientId = message.clientId
      connection.code = outcome.code
      return
    }

    case 'stateUpdate': {
      const { code, clientId } = connection

      if (
        code === null ||
        clientId === null ||
        !registry.relay(code, clientId, connection.socket, message.state)
      ) {
        refuse(connection, 'not-in-room')
      }
    }
  }
}

/** The endpoint's own release of a connection: a client that stopped speaking. */
const sweepIdle = (): void => {
  const now = Date.now()

  for (const connection of connections) {
    if (now - connection.lastSeen > HEARTBEAT_TIMEOUT_MS) connection.raw?.close(1001, 'idle')
  }
}

const idleSweep = setInterval(sweepIdle, HEARTBEAT_TIMEOUT_MS)
// The sweep is a safety net, not the reason the process is alive: without this a
// test that stops the server would wait out the interval before its runner could exit.
idleSweep.unref()

export const tetrisRoute = new Hono().get(
  '/ws/tetris',
  upgradeWebSocket(() => {
    const connection: Connection = {
      socket: {
        send: (message: ServerMessage) => {
          // A socket that is closing is not one to write to. Bun answers `-1`
          // rather than throwing, but a close the endpoint has not processed yet
          // would otherwise be written into the void.
          if (connection.raw?.readyState !== WebSocket.OPEN) return

          connection.raw.send(JSON.stringify(message))
        },
        close: (code: number, reason: string) => connection.raw?.close(code, reason)
      },
      raw: null,
      clientId: null,
      code: null,
      joins: 0,
      lastSeen: Date.now()
    }

    return {
      onOpen: (_event, ws) => {
        connection.raw = ws.raw as Bun.ServerWebSocket<BunWebSocketData>
        connection.lastSeen = Date.now()
        connections.add(connection)
      },
      onMessage: (event) => {
        // A binary frame is not a frame this vocabulary has: the client speaks
        // JSON text, so anything else is refused like any other bad message.
        if (typeof event.data === 'string') dispatch(connection, event.data)
        else refuse(connection, 'invalid-message')
      },
      onClose: () => {
        connections.delete(connection)

        const { code, clientId } = connection
        if (code !== null && clientId !== null) registry.leave(code, clientId, connection.socket)
      }
    }
  })
)
