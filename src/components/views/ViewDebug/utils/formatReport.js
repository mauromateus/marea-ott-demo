import { translate } from 'core/Translation'
import { orEmpty, orNone, serviceWorkerLabel, yesNo } from './labels'

/**
 * Plain-text report meant to be pasted into the device test log (docs/test-log.md).
 * @param {object} d - result of collectDiagnostics
 * @param {Array<{at: number, payload: object}>} events - oldest first, as kept by DataLayerService
 * @param {string} [brandName]
 */
export default function formatReport (d, events, brandName = 'Marea') {
  const lines = [
    translate('debug.report.title', { name: brandName, date: d.generatedAt }),
    '',
    `${translate('debug.label.platform')}: ${d.platform} (${d.platformSource})`,
    `${translate('debug.label.appName')}: ${orNone(d.analyticsAppName)}`,
    `${translate('debug.label.appVersion')}: ${orNone(d.appVersion)}`,
    `${translate('debug.label.displayMode')}: ${d.displayMode}`,
    `${translate('debug.label.referrer')}: ${orEmpty(d.referrer)}`,
    `${translate('debug.label.launchQuery')}: ${orNone(d.launchQuery)}`,
    `${translate('debug.label.sessionPlatform')}: ${orNone(d.sessionPlatform)}`,
    `${translate('debug.label.serviceWorker')}: ${serviceWorkerLabel(d.serviceWorkerControlling)}`,
    `${translate('debug.label.online')}: ${yesNo(d.online)}`,
    `${translate('debug.label.url')}: ${d.url}`,
    `${translate('debug.label.viewport')}: ${d.viewport}`,
    `${translate('debug.label.userAgent')}: ${d.userAgent}`,
    '',
    translate('debug.report.events', { count: events.length })
  ]

  events.slice().reverse().forEach(({ at, payload }) => {
    lines.push(`${new Date(at).toISOString()} ${JSON.stringify(payload)}`)
  })

  return lines.join('\n')
}
