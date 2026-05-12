/**
 * Server env contract. `loadConfig()` reads from `process.env` (or an injected
 * record for tests) and falls back to safe defaults: PORT=3000, HOST=0.0.0.0,
 * NODE_ENV=development. Invalid values are silently coerced to the default
 * rather than thrown — the server always starts.
 */
export type Config = {
  port: number
  host: string
  nodeEnv: 'development' | 'production' | 'test'
}

const parsePort = (raw: string | undefined): number => {
  if (raw === undefined) return 3000

  const parsed = Number.parseInt(raw, 10)
  if (Number.isNaN(parsed) || parsed <= 0 || parsed > 65535) return 3000

  return parsed
}

const parseHost = (raw: string | undefined): string => {
  if (raw === undefined || raw.length === 0) return '0.0.0.0'
  return raw
}

const parseNodeEnv = (raw: string | undefined): Config['nodeEnv'] => {
  if (raw === 'production') return 'production'
  if (raw === 'test') return 'test'
  return 'development'
}

export const loadConfig = (env: Record<string, string | undefined> = process.env): Config => ({
  port: parsePort(env.PORT),
  host: parseHost(env.HOST),
  nodeEnv: parseNodeEnv(env.NODE_ENV)
})
