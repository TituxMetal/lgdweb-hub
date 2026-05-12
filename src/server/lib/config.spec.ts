import { describe, expect, test } from 'bun:test'
import { loadConfig } from './config'

describe('loadConfig', () => {
  test('defaults to port 3000, host 0.0.0.0 and development when env is empty', () => {
    expect(loadConfig({})).toEqual({ port: 3000, host: '0.0.0.0', nodeEnv: 'development' })
  })

  test('parses a numeric PORT', () => {
    expect(loadConfig({ PORT: '4000' }).port).toBe(4000)
  })

  test('falls back to 3000 on invalid PORT', () => {
    expect(loadConfig({ PORT: 'not-a-number' }).port).toBe(3000)
    expect(loadConfig({ PORT: '0' }).port).toBe(3000)
    expect(loadConfig({ PORT: '-1' }).port).toBe(3000)
  })

  test('reads HOST when set', () => {
    expect(loadConfig({ HOST: '127.0.0.1' }).host).toBe('127.0.0.1')
  })

  test('falls back to 0.0.0.0 on empty HOST', () => {
    expect(loadConfig({ HOST: '' }).host).toBe('0.0.0.0')
  })

  test('reads NODE_ENV when explicitly set', () => {
    expect(loadConfig({ NODE_ENV: 'production' }).nodeEnv).toBe('production')
    expect(loadConfig({ NODE_ENV: 'test' }).nodeEnv).toBe('test')
  })

  test('falls back to development on unknown NODE_ENV', () => {
    expect(loadConfig({ NODE_ENV: 'staging' }).nodeEnv).toBe('development')
  })
})
