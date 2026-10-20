import buildPlayerConfig from 'core/services/Player/utils/buildPlayerConfig'
import { normalizeConfig } from 'core/services/Player/players/Lightning/config'
import getNpawApp from 'core/Utils/getNpawApp'
import marea from '../../../../../public/config/marea.json'

describe('getNpawApp', () => {
  it('uses the platform specific app name and the app version', () => {
    expect(getNpawApp(marea, 'android')).toEqual({ appName: 'marea-pwa-android', appVersion: '0.1.0' })
  })

  it('falls back to analytics.appName', () => {
    expect(getNpawApp({ ...marea, analytics: { appName: 'fallback' } }, 'ios').appName).toBe('fallback')
  })
})

describe('buildPlayerConfig', () => {
  const events = { onPlay: () => {} }

  it('builds the live video config with npaw and customer_extras', () => {
    const config = buildPlayerConfig({
      media: marea.players.video,
      npaw: { name: 'marea-pwa-android', version: '0.1.0' },
      events
    })
    expect(config).toEqual({
      id: marea.players.video.id,
      type: 'live',
      autoplay: true,
      npaw: { name: 'marea-pwa-android', version: '0.1.0' },
      customer_extras: null,
      events
    })
  })

  it('builds the live audio config with the same shape', () => {
    const config = buildPlayerConfig({
      media: marea.players.audio,
      npaw: { name: 'marea-web', version: '0.1.0' },
      events
    })
    expect(config).toMatchObject({
      id: marea.players.audio.id,
      type: 'live',
      npaw: { name: 'marea-web', version: '0.1.0' },
      customer_extras: null
    })
    expect(config).not.toHaveProperty('player')
  })

  it('passes a player profile id only when configured', () => {
    const config = buildPlayerConfig({
      media: { type: 'live', id: 'abc', player: 'player-id' },
      npaw: { name: 'n', version: 'v' }
    })
    expect(config.player).toBe('player-id')
  })

  it('passes customer extras through when provided', () => {
    const extras = { name: 'user-1', type: 'Registered' }
    expect(buildPlayerConfig({ media: { type: 'live', id: 'abc' }, npaw: {}, customerExtras: extras }).customer_extras).toBe(extras)
  })
})

describe('Lightning normalizeConfig (mirrors the real product)', () => {
  it('always sends aspectRatio and startPos', () => {
    expect(normalizeConfig({ id: 'x' })).toEqual({ id: 'x', aspectRatio: null, startPos: 0 })
  })

  it('maps startTime to startPos and keeps aspectRatio', () => {
    expect(normalizeConfig({ id: 'x', startTime: 12, aspectRatio: '9/16' })).toEqual({ id: 'x', aspectRatio: '9/16', startPos: 12 })
  })
})
