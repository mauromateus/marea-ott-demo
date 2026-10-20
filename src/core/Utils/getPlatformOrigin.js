import Session from 'core/Session'
import detectInstallContext from 'core/Utils/detectInstallContext'

export const PLATFORMS = ['web', 'pwa-web', 'android', 'android-tv', 'fire-tv', 'samsung-tv', 'lg-tv', 'ios']
export const PLATFORM_QUERY_PARAM = 'ms_platform'
// sessionStorage only: a Trusted Web Activity shares localStorage with Chrome and would mislabel browser visits.
export const PLATFORM_SESSION_KEY = 'ms_platform_origin'

const ANDROID_APP_REFERRER = 'android-app://'

const normalize = (value) => (typeof value === 'string' ? value.trim().toLowerCase() : '')

export const isValidPlatform = (value) => PLATFORMS.includes(normalize(value))

const TIZEN_UA = /Tizen|SMART-TV/i
const LG_UA = /Web0S|webOS|NetCast/i
const ANDROID_PLATFORMS = ['android', 'android-tv', 'fire-tv']

/**
 * Whether a platform value is consistent with the device. Shells inject or store a value, but a desktop tab
 * must never believe it runs inside the Android shell, so a contradicting value is ignored.
 */
export const isPlatformPlausible = (platform, { userAgent = '', maxTouchPoints = 0, navigatorPlatform = '' } = {}) => {
  const value = normalize(platform)
  if (value === 'web' || value === 'pwa-web') return true
  const ua = typeof userAgent === 'string' ? userAgent : ''
  // iPadOS 13+ sends a desktop Mac UA; detectInstallContext tells it apart by MacIntel plus touch points.
  const macPlatform = navigatorPlatform || (/Macintosh/i.test(ua) ? 'MacIntel' : '')
  const context = detectInstallContext({ userAgent: ua, platform: macPlatform, maxTouchPoints })
  if (ANDROID_PLATFORMS.includes(value)) return context.isAndroid
  if (value === 'samsung-tv') return TIZEN_UA.test(ua)
  if (value === 'lg-tv') return LG_UA.test(ua)
  if (value === 'ios') return context.isIos || /iPad|iPhone|iPod/i.test(ua)
  return false
}

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

const readDevice = () => {
  const nav = typeof window !== 'undefined' ? window.navigator : {}
  return { userAgent: nav.userAgent, maxTouchPoints: nav.maxTouchPoints, navigatorPlatform: nav.platform }
}

/**
 * Call once at boot, before the first render. Verifies platform state against the device on every load:
 * a stored value that contradicts the device is discarded, and a query or referrer value is honored for this
 * load but only persisted when plausible, so stale values disappear on the next refresh.
 */
export const initPlatformOrigin = ({ useReferrerSignal = true } = {}) => {
  const device = readDevice()
  let storedValue = Session.getItem(PLATFORM_SESSION_KEY)
  if (storedValue !== undefined && storedValue !== null && !isPlatformPlausible(storedValue, device)) {
    Session.removeItem(PLATFORM_SESSION_KEY)
    storedValue = null
  }

  const result = resolvePlatform({
    queryValue: readQueryValue(),
    storedValue,
    referrer: typeof document !== 'undefined' ? document.referrer : '',
    isStandalone: isStandaloneMode(),
    useReferrerSignal
  })

  if (result.persist && isPlatformPlausible(result.platform, device)) {
    Session.setItem(PLATFORM_SESSION_KEY, result.platform)
  }

  resolved = { platform: result.platform, source: result.source }
  return resolved
}

export const getPlatformDetails = () => resolved || initPlatformOrigin()

export const getPlatformOrigin = () => getPlatformDetails().platform

export default getPlatformOrigin
