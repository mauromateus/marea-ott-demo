import Session from 'core/Session'

export const PLATFORMS = ['web', 'pwa-web', 'android', 'android-tv', 'fire-tv', 'samsung-tv', 'lg-tv', 'ios']
export const PLATFORM_QUERY_PARAM = 'ms_platform'
// sessionStorage only: a Trusted Web Activity shares localStorage with Chrome and would mislabel browser visits.
export const PLATFORM_SESSION_KEY = 'ms_platform_origin'

const ANDROID_APP_REFERRER = 'android-app://'

const normalize = (value) => (typeof value === 'string' ? value.trim().toLowerCase() : '')

export const isValidPlatform = (value) => PLATFORMS.includes(normalize(value))

/**
 * Pure resolver. Priority:
 * 1. value injected by the native shell (query param), 2. value stored earlier in this session,
 * 3. UNCONFIRMED android-app:// referrer signal (optional), 4. standalone display mode, 5. web.
 */
export const resolvePlatform = ({ queryValue, storedValue, referrer, isStandalone, useReferrerSignal } = {}) => {
  if (isValidPlatform(queryValue)) {
    return { platform: normalize(queryValue), source: 'query', persist: true }
  }
  if (isValidPlatform(storedValue)) {
    return { platform: normalize(storedValue), source: 'session', persist: false }
  }
  // UNCONFIRMED: Chrome sets this referrer when a TWA launches, but it also sets it when any
  // Android app opens a link in Chrome. Validate on a real device before trusting it (see docs/decisions/0001).
  if (useReferrerSignal && typeof referrer === 'string' && referrer.startsWith(ANDROID_APP_REFERRER)) {
    return { platform: 'android', source: 'referrer', persist: true }
  }
  if (isStandalone) {
    return { platform: 'pwa-web', source: 'standalone', persist: false }
  }
  return { platform: 'web', source: 'default', persist: false }
}

const matches = (query) => {
  try {
    return !!(window.matchMedia && window.matchMedia(query).matches)
  } catch (e) {
    return false
  }
}

export const isStandaloneMode = () => matches('(display-mode: standalone)') || window.navigator.standalone === true

export const getDisplayMode = () => {
  if (isStandaloneMode()) return 'standalone'
  if (matches('(display-mode: fullscreen)')) return 'fullscreen'
  if (matches('(display-mode: minimal-ui)')) return 'minimal-ui'
  return 'browser'
}

const readQueryValue = () => {
  try {
    return new URLSearchParams(window.location.search).get(PLATFORM_QUERY_PARAM)
  } catch (e) {
    return null
  }
}

let resolved = null

/** Test helper: forget the cached value (simulates a fresh page load). */
export const resetPlatformOrigin = () => {
  resolved = null
}

/** Call once at boot, before the first render. */
export const initPlatformOrigin = ({ useReferrerSignal = true } = {}) => {
  const result = resolvePlatform({
    queryValue: readQueryValue(),
    storedValue: Session.getItem(PLATFORM_SESSION_KEY),
    referrer: typeof document !== 'undefined' ? document.referrer : '',
    isStandalone: isStandaloneMode(),
    useReferrerSignal
  })

  if (result.persist) {
    Session.setItem(PLATFORM_SESSION_KEY, result.platform)
  }

  resolved = { platform: result.platform, source: result.source }
  return resolved
}

export const getPlatformDetails = () => resolved || initPlatformOrigin()

export const getPlatformOrigin = () => getPlatformDetails().platform

export default getPlatformOrigin
