// The real ConfigService resolves the config URL by hostname from a remote endpoint.
// Here the hostname is mapped to a static file under /config; the default is used for unknown hosts.
export const DEFAULT_CONFIG_NAME = 'marea'

export const HOSTNAME_CONFIG_MAP = {
  localhost: 'marea'
}

const REQUIRED_KEYS = ['brand', 'app', 'analytics', 'players', 'rails']

export const resolveConfigName = (hostname, map = HOSTNAME_CONFIG_MAP) => (hostname && map[hostname]) || DEFAULT_CONFIG_NAME

export const getConfigUrl = (hostname, map = HOSTNAME_CONFIG_MAP) => `${process.env.PUBLIC_URL || ''}/config/${resolveConfigName(hostname, map)}.json`

export const validateConfig = (config) => {
  if (!config || typeof config !== 'object') {
    throw new Error('Invalid config: expected an object')
  }
  REQUIRED_KEYS.forEach((key) => {
    if (!config[key]) {
      throw new Error(`Invalid config: missing "${key}"`)
    }
  })
  if (!config.players.video?.id || !config.players.audio?.id) {
    throw new Error('Invalid config: "players" needs video.id and audio.id')
  }
  return config
}

export class ConfigService {
  constructor ({ fetcher, hostnameMap } = {}) {
    this.config = null
    this.fetcher = fetcher || ((url) => window.fetch(url))
    this.hostnameMap = hostnameMap || HOSTNAME_CONFIG_MAP
  }

  async _getFile (url) {
    const res = await this.fetcher(url)
    if (!res.ok) {
      throw new Error(`Config request failed (${res.status}) for ${url}`)
    }
    return res.json()
  }

  async getJson ({ hostname = window.location.hostname } = {}) {
    const url = getConfigUrl(hostname, this.hostnameMap)
    const defaultUrl = getConfigUrl('', this.hostnameMap)
    let data = null

    try {
      data = await this._getFile(url)
    } catch (err) {
      if (url !== defaultUrl) {
        try {
          data = await this._getFile(defaultUrl)
        } catch (fallbackErr) {
          // handled below
        }
      }
    }

    if (!data) {
      throw new Error('Config could not be loaded')
    }

    this.config = validateConfig(data)
    return this.config
  }

  getConfig () {
    return this.config
  }
}

export default new ConfigService()
