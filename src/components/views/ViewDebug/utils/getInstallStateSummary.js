import { getHiddenState, parseReappear } from 'components/common/InstallSheet/utils/reappearPolicy'

/**
 * Explains why the install card shows or not, mirroring useInstallSheet. Returns a stable code plus params;
 * the view turns it into Spanish. First cause that applies wins:
 * platform, installed mark, closed (this session or snoozed), no browser offer, quiet route, available.
 * everyLoad keeps nothing in storage, so it never reports a closed or snoozed card.
 * @returns {{code: 'hidden-platform'|'hidden-installed'|'closed-session'|'snoozed'|'no-offer'|'hidden-route'|'available', params: object}}
 */
export default function getInstallStateSummary ({
  canInstall,
  platform,
  storedPlatform,
  dismissedAt,
  dismissCount,
  sessionDismissed = false,
  policy = parseReappear(),
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
  const closed = getHiddenState({ policy, dismissedAt, dismissCount, sessionDismissed, now })
  if (closed.hidden) {
    return closed.scope === 'session' ? { code: 'closed-session', params: {} } : { code: 'snoozed', params: { until: closed.until } }
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
