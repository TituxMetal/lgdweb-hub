# Stage 1: Install dependencies and build the Vite SPA
FROM oven/bun:1.3.10-alpine AS build

WORKDIR /app

COPY package.json bun.lock ./
COPY index.html vite.config.ts tsconfig.json tsconfig.base.json tsconfig.client.json tsconfig.server.json ./
COPY src/ ./src/

RUN bun install --frozen-lockfile

RUN bun run build

# Stage 2: Production runtime — Hono on Bun serving the built SPA
FROM oven/bun:1.3.10-alpine AS production

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json /app/bun.lock ./

RUN bun install --frozen-lockfile --production

COPY --from=build /app/dist ./dist
COPY --from=build /app/src/server ./src/server
# The server's import graph leaves its own tree: the wire vocabulary lives in
# `src/shared`, which both programs import. Without it the runtime exits at
# module-graph load, before it binds a port.
COPY --from=build /app/src/shared ./src/shared
# Bun resolves the `paths` alias while running, not while building, so the runtime
# stage carries the pair that declares it: the entry point imports
# `~/shared/tetrisProtocol`, and without these the same module-graph load fails.
COPY --from=build /app/tsconfig.json /app/tsconfig.base.json ./

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

RUN chown -R appuser:appgroup /app

EXPOSE ${PORT}

USER appuser

CMD ["bun", "run", "start"]
