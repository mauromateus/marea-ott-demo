import {
  ConfigService,
  DEFAULT_CONFIG_NAME,
  HOSTNAME_CONFIG_MAP,
  resolveConfigName,
  getConfigUrl,
  validateConfig
} from 'core/services/Config/ConfigService'
import marea from '../../../../../public/config/marea.json'

const okResponse = (body) => Promise.resolve({ ok: true, json: () => Promise.resolve(body) })
const failResponse = () => Promise.resolve({ ok: false, status: 404, json: () => Promise.reject(new Error('no body')) })

describe('resolveConfigName', () => {
  it('maps a known hostname', () => {
    expect(resolveConfigName('demo.example.com', { 'demo.example.com': 'other' })).toBe('other')
  })

  it('falls back to the default for unknown hostnames', () => {
    expect(resolveConfigName('unknown.example.com', HOSTNAME_CONFIG_MAP)).toBe(DEFAULT_CONFIG_NAME)
  })

  it('falls back to the default for an empty hostname', () => {
    expect(resolveConfigName('', HOSTNAME_CONFIG_MAP)).toBe(DEFAULT_CONFIG_NAME)
    expect(resolveConfigName(undefined, HOSTNAME_CONFIG_MAP)).toBe(DEFAULT_CONFIG_NAME)
  })

  it('default config is marea', () => {
    expect(DEFAULT_CONFIG_NAME).toBe('marea')
  })
})

describe('getConfigUrl', () => {
  it('builds /config/<name>.json', () => {
    expect(getConfigUrl('localhost')).toBe('/config/marea.json')
  })

  it('resolves the GitHub Pages hostname to the default config', () => {
    expect(resolveConfigName('mauromateus.github.io', HOSTNAME_CONFIG_MAP)).toBe(DEFAULT_CONFIG_NAME)
  })

  it('prefixes PUBLIC_URL so a subpath deployment finds the config', () => {
    const previous = process.env.PUBLIC_URL
    process.env.PUBLIC_URL = '/marea-ott-demo'
    try {
      expect(getConfigUrl('mauromateus.github.io')).toBe('/marea-ott-demo/config/marea.json')
    } finally {
      process.env.PUBLIC_URL = previous
    }
  })

  it('resolves the GitHub Pages hostname to the default config', () => {
    expect(resolveConfigName('mauromateus.github.io', HOSTNAME_CONFIG_MAP)).toBe(DEFAULT_CONFIG_NAME)
  })

  it('prefixes PUBLIC_URL so a subpath deployment finds the config', () => {
    const previous = process.env.PUBLIC_URL
    process.env.PUBLIC_URL = '/marea-ott-demo'
    try {
      expect(getConfigUrl('mauromateus.github.io')).toBe('/marea-ott-demo/config/marea.json')
    } finally {
      process.env.PUBLIC_URL = previous
    }
  })
})

describe('validateConfig', () => {
  it('accepts the shipped marea.json', () => {
    expect(() => validateConfig(marea)).not.toThrow()
  })

  it.each(['brand', 'app', 'analytics', 'players', 'rails'])('rejects a config without "%s"', (key) => {
    const broken = { ...marea }
    delete broken[key]
    expect(() => validateConfig(broken)).toThrow(key)
  })

  it('rejects a config without live media ids', () => {
    expect(() => validateConfig({ ...marea, players: { video: {}, audio: {} } })).toThrow('players')
  })

  it('rejects non-objects', () => {
    expect(() => validateConfig(null)).toThrow()
  })
})

describe('shipped marea.json content contract', () => {
  it('declares the two live signals', () => {
    expect(marea.players.video).toMatchObject({ type: 'live' })
    expect(marea.players.audio).toMatchObject({ type: 'live' })
    expect(marea.players.video.id).toBeTruthy()
    expect(marea.players.audio.id).toBeTruthy()
  })

  it('has 3-4 rails of real medias, each with a title, duration and https thumbnail', () => {
    expect(marea.rails.length).toBeGreaterThanOrEqual(3)
    expect(marea.rails.length).toBeLessThanOrEqual(4)
    marea.rails.forEach((rail) => {
      expect(rail.sample).toBeUndefined()
      expect(rail.items.length).toBeGreaterThanOrEqual(3)
      rail.items.forEach((item) => {
        expect(item.sample).toBeUndefined()
        expect(item.id).toMatch(/^[0-9a-f]{24}$/)
        expect(item.title).toBeTruthy()
        expect(item.meta).toBeTruthy()
        expect(item.thumbnail.url).toMatch(/^https:\/\/thumbs\.cdn\.mdstrm\.com\//)
        expect(item.thumbnail.width).toBeGreaterThan(0)
        expect(item.thumbnail.height).toBeGreaterThan(0)
      })
    })
  })

  it('never repeats a media across rails', () => {
    const ids = marea.rails.flatMap((rail) => rail.items.map((item) => item.id))
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('keeps only public metadata in the config (no tokens or API fields)', () => {
    const text = JSON.stringify(marea)
    expect(text).not.toMatch(/X-API-Token|MS_API_TOKEN|access_rules|access_restrictions/)
  })

  it('has GTM disabled by default', () => {
    expect(marea.app.gtmId).toBe('')
  })
})

describe('ConfigService default fetcher', () => {
  afterEach(() => { delete window.fetch })

  it('revalidates with the server so an edited config never comes from the HTTP cache', async () => {
    window.fetch = jest.fn(() => okResponse(marea))
    await new ConfigService().getJson({ hostname: 'localhost' })
    expect(window.fetch).toHaveBeenCalledWith('/config/marea.json', { cache: 'no-cache' })
  })

  it('passes only the url to an injected fetcher', async () => {
    const fetcher = jest.fn(() => okResponse(marea))
    await new ConfigService({ fetcher }).getJson({ hostname: 'localhost' })
    expect(fetcher.mock.calls[0]).toEqual(['/config/marea.json'])
  })
})

describe('ConfigService.getJson', () => {
  it('loads and stores the config for the hostname', async () => {
    const fetcher = jest.fn(() => okResponse(marea))
    const service = new ConfigService({ fetcher })
    const result = await service.getJson({ hostname: 'localhost' })
    expect(fetcher).toHaveBeenCalledWith('/config/marea.json')
    expect(result).toEqual(marea)
    expect(service.getConfig()).toEqual(marea)
  })

  it('falls back to the default config when the mapped file fails', async () => {
    const fetcher = jest.fn((url) => (url.includes('special') ? failResponse() : okResponse(marea)))
    const service = new ConfigService({ fetcher, hostnameMap: { 'x.test': 'special' } })
    await service.getJson({ hostname: 'x.test' })
    expect(fetcher).toHaveBeenCalledTimes(2)
    expect(service.getConfig()).toEqual(marea)
  })

  it('rejects when nothing can be loaded', async () => {
    const service = new ConfigService({ fetcher: () => failResponse() })
    await expect(service.getJson({ hostname: 'localhost' })).rejects.toThrow('Config could not be loaded')
  })

  it('rejects when the loaded file is invalid', async () => {
    const service = new ConfigService({ fetcher: () => okResponse({ brand: {} }) })
    await expect(service.getJson({ hostname: 'localhost' })).rejects.toThrow()
  })
})
