/**
 * Plain-text report meant to be pasted into the device test log (docs/test-log.md).
 * @param {object} d - result of collectDiagnostics
 * @param {Array<{at: number, payload: object}>} events - oldest first, as kept by DataLayerService
 */
export default function formatReport (d, events) {
  const lines = [
    `Marea debug report (${d.generatedAt})`,
    '',
    `Resolved platform: ${d.platform} (${d.platformSource})`,
    `Analytics appName: ${d.analyticsAppName || '(none)'}`,
    `App version: ${d.appVersion || '(none)'}`,
    `Display mode: ${d.displayMode}`,
    `document.referrer: ${d.referrer || '(empty)'}`,
    `Launch query: ${d.launchQuery || '(none)'}`,
    `Stored session platform: ${d.sessionPlatform || '(none)'}`,
    `Service worker controls page: ${d.serviceWorkerControlling}`,
    `Online: ${d.online ? 'yes' : 'no'}`,
    `URL: ${d.url}`,
    `Viewport: ${d.viewport}`,
    `User agent: ${d.userAgent}`,
    '',
    `dataLayer events (last ${events.length}), newest first:`
  ]

  events.slice().reverse().forEach(({ at, payload }) => {
    lines.push(`${new Date(at).toISOString()} ${JSON.stringify(payload)}`)
  })

  return lines.join('\n')
}
