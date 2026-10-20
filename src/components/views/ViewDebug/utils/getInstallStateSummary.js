import isSnoozed, { SNOOZE_MS } from 'components/common/InstallSheet/utils/isSnoozed'

/**
 * Explains why the install card shows or not, mirroring useInstallSheet. Returns a stable code plus params;
 * the view turns it into Spanish. First cause that applies wins:
 * platform, installed mark, snooze, no browser offer, quiet route, available.
 * @returns {{code: 'hidden-platform'|'hidden-installed'|'snoozed'|'no-offer'|'hidden-route'|'available', params: object}}
 */
export default function getInstallStateSummary ({
  canInstall,
  platform,
  storedPlatform,
  dismissedAt,
  installedMark,
  now = Date.now(),
  isIos = false,
  quietRoute = false
}) {
  if (platform !== 'web') {
    return { code: 'hidden-platform', params: { platform, storedPlatform } }
  }
  // While the browser offers the install, useInstallSheet clears a stale mark (the app was uninstalled).
  if (installedMark && !canInstall) {
    return { code: 'hidden-installed', params: {} }
  }
  if (isSnoozed(dismissedAt, now)) {
    return { code: 'snoozed', params: { until: dismissedAt + SNOOZE_MS } }
  }
  // iOS cannot be prompted: its sheet shows steps without any browser offer.
  if (!canInstall && !isIos) {
    return { code: 'no-offer', params: {} }
  }
  if (quietRoute) {
    return { code: 'hidden-route', params: {} }
  }
  return { code: 'available', params: {} }
}
