import { isMediaRequest, isConfigRequest, shouldRuntimeCache, isNavigationFallback } from 'core/services/ServiceWorker/cacheRules'

const url = (href) => new URL(href, 'https://marea.test')
const req = (destination = '') => ({ destination })
const ORIGIN = 'https://marea.test'

describe('isMediaRequest (never cached, never intercepted)', () => {
  it.each([
    'https://player.cdn.mdstrm.com/lightning_player/api.js',
    'https://mdstrm.com/live-stream/abc/playlist.m3u8',
    'https://edge.eu.mdstrm.com/x/segment.ts'
  ])('flags mdstrm hosts: %s', (href) => {
    expect(isMediaRequest(url(href), req('script'))).toBe(true)
  })

  it.each(['/live/index.m3u8', '/vod/manifest.mpd', '/seg/1.ts', '/seg/1.m4s', '/a.aac', '/a.mp4', '/a.mp3'])('flags media paths: %s', (path) => {
    expect(isMediaRequest(url(path), req())).toBe(true)
  })

  it.each(['audio', 'video', 'track'])('flags request destination %s', (destination) => {
    expect(isMediaRequest(url('/anything'), req(destination))).toBe(true)
  })

  it('does not flag app assets', () => {
    expect(isMediaRequest(url('/static/js/main.js'), req('script'))).toBe(false)
  })
})

describe('shouldRuntimeCache', () => {
  it('caches same-origin images and fonts', () => {
    expect(shouldRuntimeCache({ url: url('/icons/icon-192.png'), request: req('image'), origin: ORIGIN })).toBe(true)
    expect(shouldRuntimeCache({ url: url('/static/media/font.woff2'), request: req('font'), origin: ORIGIN })).toBe(true)
  })

  it('leaves config json to its own network-first rule', () => {
    expect(shouldRuntimeCache({ url: url('/config/marea.json'), request: req(''), origin: ORIGIN })).toBe(false)
  })

  it('never caches cross-origin requests', () => {
    expect(shouldRuntimeCache({ url: new URL('https://fonts.gstatic.com/a.woff2'), request: req('font'), origin: ORIGIN })).toBe(false)
  })

  it('never caches mdstrm or media requests, even if the type would match', () => {
    expect(shouldRuntimeCache({ url: new URL('https://img.mdstrm.com/a.png'), request: req('image'), origin: ORIGIN })).toBe(false)
    expect(shouldRuntimeCache({ url: url('/seg.ts'), request: req('image'), origin: ORIGIN })).toBe(false)
  })

  it('does not cache other json or documents', () => {
    expect(shouldRuntimeCache({ url: url('/api/data.json'), request: req(''), origin: ORIGIN })).toBe(false)
    expect(shouldRuntimeCache({ url: url('/tv'), request: req('document'), origin: ORIGIN })).toBe(false)
  })
})

describe('base path awareness (GitHub Pages project subpath)', () => {
  const BASE = '/marea-ott-demo'

  it('caches images under the base path', () => {
    expect(shouldRuntimeCache({ url: url('/marea-ott-demo/icons/icon-192.png'), request: req('image'), origin: ORIGIN, basePath: BASE })).toBe(true)
  })

  it('still never caches media or mdstrm under a base path', () => {
    expect(shouldRuntimeCache({ url: url('/marea-ott-demo/config/x.m3u8'), request: req('image'), origin: ORIGIN, basePath: BASE })).toBe(false)
    expect(shouldRuntimeCache({ url: new URL('https://img.mdstrm.com/marea-ott-demo/config/a.json'), request: req('image'), origin: ORIGIN, basePath: BASE })).toBe(false)
  })
})

describe('isConfigRequest (network-first config json)', () => {
  const BASE = '/marea-ott-demo'

  it('matches config json at the root', () => {
    expect(isConfigRequest({ url: url('/config/marea.json'), request: req(''), origin: ORIGIN, basePath: '' })).toBe(true)
  })

  it('defaults to the root when no base path is given', () => {
    expect(isConfigRequest({ url: url('/config/marea.json'), request: req(''), origin: ORIGIN })).toBe(true)
  })

  it('matches config json under the base path', () => {
    expect(isConfigRequest({ url: url('/marea-ott-demo/config/marea.json'), request: req(''), origin: ORIGIN, basePath: BASE })).toBe(true)
  })

  it('does not treat a root /config/ path as config when a base path is set', () => {
    expect(isConfigRequest({ url: url('/config/marea.json'), request: req(''), origin: ORIGIN, basePath: BASE })).toBe(false)
  })

  it('ignores other origins', () => {
    expect(isConfigRequest({ url: new URL('https://other.test/config/marea.json'), request: req(''), origin: ORIGIN, basePath: '' })).toBe(false)
  })

  it('ignores non-json files and other folders', () => {
    expect(isConfigRequest({ url: url('/config/marea.txt'), request: req(''), origin: ORIGIN, basePath: '' })).toBe(false)
    expect(isConfigRequest({ url: url('/api/marea.json'), request: req(''), origin: ORIGIN, basePath: '' })).toBe(false)
  })

  it('never matches media or mdstrm requests', () => {
    expect(isConfigRequest({ url: new URL('https://img.mdstrm.com/config/a.json'), request: req(''), origin: 'https://img.mdstrm.com', basePath: '' })).toBe(false)
    expect(isConfigRequest({ url: url('/config/a.json'), request: req('video'), origin: ORIGIN, basePath: '' })).toBe(false)
  })
})

describe('isNavigationFallback', () => {
  const nav = { mode: 'navigate' }

  it('serves the shell for app routes, at the root and under a base path', () => {
    expect(isNavigationFallback({ url: url('/tv'), request: nav })).toBe(true)
    expect(isNavigationFallback({ url: url('/marea-ott-demo/tv'), request: nav, basePath: '/marea-ott-demo' })).toBe(true)
  })

  it('ignores non navigation requests', () => {
    expect(isNavigationFallback({ url: url('/tv'), request: { mode: 'cors' } })).toBe(false)
  })

  it('ignores URLs that look like files', () => {
    expect(isNavigationFallback({ url: url('/.well-known/assetlinks.json'), request: nav })).toBe(false)
    expect(isNavigationFallback({ url: url('/marea-ott-demo/manifest.json'), request: nav, basePath: '/marea-ott-demo' })).toBe(false)
  })

  it('ignores reserved underscore paths relative to the base path', () => {
    expect(isNavigationFallback({ url: url('/_health'), request: nav })).toBe(false)
    expect(isNavigationFallback({ url: url('/marea-ott-demo/_health'), request: nav, basePath: '/marea-ott-demo' })).toBe(false)
  })
})
