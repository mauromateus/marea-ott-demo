import Session from 'core/Session'
import getAnalyticsAppName from 'core/Utils/getAnalyticsAppName'
import { getDisplayMode, PLATFORM_SESSION_KEY } from 'core/Utils/getPlatformOrigin'

const getServiceWorkerState = () => {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return 'not supported'
  }
  return navigator.serviceWorker.controller ? 'yes' : 'no'
}

export default function collectDiagnostics ({ config, platformDetails, online = navigator.onLine }) {
  return {
    platform: platformDetails.platform,
    platformSource: platformDetails.source,
    analyticsAppName: getAnalyticsAppName(config, platformDetails.platform),
    appVersion: config?.app?.version,
    displayMode: getDisplayMode(),
    referrer: document.referrer,
    userAgent: window.navigator.userAgent,
    serviceWorkerControlling: getServiceWorkerState(),
    online,
    launchQuery: window.location.search,
    sessionPlatform: Session.getItem(PLATFORM_SESSION_KEY) || '',
    url: window.location.href,
    viewport: `${window.innerWidth}x${window.innerHeight} @${window.devicePixelRatio || 1}x`,
    generatedAt: new Date().toISOString()
  }
}
