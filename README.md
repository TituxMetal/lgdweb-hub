# lgdweb-hub

Showroom of old projects modernized in place + landing for the future `lgdweb.fr` Hub.

See [`docs/plans/showroom.md`](./docs/plans/showroom.md) for the showroom's design record, and
[`docs/agents/workflow/showroom.md`](./docs/agents/workflow/showroom.md) for its workflow unit.

## Development

The interface and the server are two processes: the Vite dev server serves the interface with HMR,
and the composed Bun application serves the API and the Tetris WebSocket. The dev server forwards
`/api` and `/ws` to the second one, so the multiplayer works from `bun run dev` — without the
forwarding the browser dials its own origin and finds nothing there.

```sh
bun run dev:server   # http://127.0.0.1:3001 — the API and the Tetris socket
bun run dev          # http://127.0.0.1:3000 — the interface
```

To play two players locally: open `http://127.0.0.1:3000/projects/tetris`, press « Jouer à deux »
and open the link it copies — `…/projects/tetris#<code>` — in a second tab.

One process for everything, served as production serves it:

```sh
bun run build && bun run start   # http://127.0.0.1:3000, nothing else running
```
