import getAnalyticsAppName from 'core/Utils/getAnalyticsAppName'
import { PLATFORMS } from 'core/Utils/getPlatformOrigin'
import marea from '../../../../public/config/marea.json'

const config = {
  analytics: {
    appName: 'marea-web',
    appNames: { web: 'marea-web', android: 'marea-pwa-android' }
  }
}

describe('getAnalyticsAppName', () => {
  it('returns the platform specific name', () => {
    expect(getAnalyticsAppName(config, 'android')).toBe('marea-pwa-android')
  })

  it('falls back to analytics.appName for a platform without mapping', () => {
    expect(getAnalyticsAppName(config, 'lg-tv')).toBe('marea-web')
  })

  it('falls back when appNames is missing', () => {
    expect(getAnalyticsAppName({ analytics: { appName: 'x' } }, 'android')).toBe('x')
  })

  it('returns undefined for an empty config', () => {
    expect(getAnalyticsAppName(undefined, 'web')).toBeUndefined()
    expect(getAnalyticsAppName({}, 'web')).toBeUndefined()
  })

  it('covers every allowed platform in the shipped marea.json', () => {
    PLATFORMS.forEach((platform) => {
      expect(getAnalyticsAppName(marea, platform)).toMatch(/^marea-/)
    })
  })
})
