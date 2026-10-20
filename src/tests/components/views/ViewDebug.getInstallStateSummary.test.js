import getInstallStateSummary from 'components/views/ViewDebug/utils/getInstallStateSummary'
import { DAY_MS, parseReappear } from 'components/common/InstallSheet/utils/reappearPolicy'

describe('getInstallStateSummary', () => {
  const now = Date.UTC(2026, 0, 15, 12)
  const days7 = parseReappear('days:7')
  const ready = { canInstall: true, platform: 'web', storedPlatform: '', dismissedAt: undefined, installedMark: false, policy: days7, now }

  it('is available when the browser offered the install and nothing hides the card', () => {
    expect(getInstallStateSummary(ready)).toEqual({ code: 'available', params: {} })
  })

  it('reports the browser as the cause when it never offered the install', () => {
    expect(getInstallStateSummary({ ...ready, canInstall: false })).toEqual({ code: 'no-offer', params: {} })
  })

  it('reports a snooze with the moment it ends', () => {
    const dismissedAt = now - 1000
    expect(getInstallStateSummary({ ...ready, dismissedAt })).toEqual({ code: 'snoozed', params: { until: dismissedAt + 7 * DAY_MS } })
  })

  it('ignores an expired, future or corrupt dismissal', () => {
    ;[now - 7 * DAY_MS, now + 5000, 'yesterday', null].forEach((dismissedAt) => {
      expect(getInstallStateSummary({ ...ready, dismissedAt }).code).toBe('available')
    })
  })

  it('reports the installed mark when the browser is not offering the install', () => {
    expect(getInstallStateSummary({ ...ready, canInstall: false, installedMark: true }).code).toBe('hidden-installed')
  })

  it('does not blame a stale installed mark while the browser offers the install', () => {
    expect(getInstallStateSummary({ ...ready, installedMark: true }).code).toBe('available')
    expect(getInstallStateSummary({ ...ready, installedMark: true, dismissedAt: now - 1 }).code).toBe('snoozed')
  })

  it('reports a platform that is not web and keeps both platform values', () => {
    expect(getInstallStateSummary({ ...ready, platform: 'android', storedPlatform: 'android' }))
      .toEqual({ code: 'hidden-platform', params: { platform: 'android', storedPlatform: 'android' } })
    expect(getInstallStateSummary({ ...ready, platform: 'pwa-web' }).code).toBe('hidden-platform')
  })

  it('reports the quiet route only when the card would otherwise show', () => {
    expect(getInstallStateSummary({ ...ready, quietRoute: true })).toEqual({ code: 'hidden-route', params: {} })
  })

  it('does not require a browser offer on iOS, where the sheet shows steps instead', () => {
    expect(getInstallStateSummary({ ...ready, canInstall: false, isIos: true }).code).toBe('available')
    expect(getInstallStateSummary({ ...ready, canInstall: false, isIos: true, installedMark: true }).code).toBe('hidden-installed')
  })

  describe('precedence when several causes apply', () => {
    const everything = { canInstall: false, platform: 'android', storedPlatform: 'android', dismissedAt: now - 1, installedMark: true, quietRoute: true, policy: days7, now }

    it('platform beats every other cause', () => {
      expect(getInstallStateSummary(everything).code).toBe('hidden-platform')
    })

    it('installed mark beats snooze, no offer and route', () => {
      expect(getInstallStateSummary({ ...everything, platform: 'web' }).code).toBe('hidden-installed')
    })

    it('snooze beats no offer and route', () => {
      expect(getInstallStateSummary({ ...everything, platform: 'web', installedMark: false }).code).toBe('snoozed')
    })

    it('no offer beats the route', () => {
      expect(getInstallStateSummary({ ...everything, platform: 'web', installedMark: false, dismissedAt: undefined }).code).toBe('no-offer')
    })
  })

  it('defaults now to the current time', () => {
    expect(getInstallStateSummary({ canInstall: true, platform: 'web', policy: days7, dismissedAt: Date.now() - 1000 }).code).toBe('snoozed')
  })
  describe('by reappearance policy', () => {
    const base = { ...ready, dismissedAt: now - 1000 }
    const policy = (value) => parseReappear(value)

    it('everyLoad never reports a snooze or a closed session, whatever is stored', () => {
      const stored = { ...base, dismissCount: 3, sessionDismissed: true, policy: policy('everyLoad') }
      expect(getInstallStateSummary(stored)).toEqual({ code: 'available', params: {} })
      expect(getInstallStateSummary({ ...stored, canInstall: false }).code).toBe('no-offer')
    })

    it('session reports "closed in this session" and ignores a legacy timestamp', () => {
      const session = { ...ready, policy: policy('session') }
      expect(getInstallStateSummary({ ...session, sessionDismissed: true })).toEqual({ code: 'closed-session', params: {} })
      expect(getInstallStateSummary({ ...session, dismissedAt: now - 1000 }).code).toBe('available')
    })

    it('days reports the snooze until N days after the close, never "closed in this session"', () => {
      const days3 = { ...base, policy: policy('days:3'), sessionDismissed: true }
      expect(getInstallStateSummary(days3)).toEqual({ code: 'snoozed', params: { until: now - 1000 + 3 * DAY_MS } })
      expect(getInstallStateSummary({ ...days3, dismissedAt: now - 3 * DAY_MS }).code).toBe('available')
    })

    it('progressive: first close is the session, then 3 days, then 14 days', () => {
      const progressive = { ...base, policy: policy('progressive') }
      expect(getInstallStateSummary({ ...progressive, dismissCount: 1, sessionDismissed: true }).code).toBe('closed-session')
      expect(getInstallStateSummary({ ...progressive, dismissCount: 1 }).code).toBe('available')
      expect(getInstallStateSummary({ ...progressive, dismissCount: 2 })).toEqual({ code: 'snoozed', params: { until: now - 1000 + 3 * DAY_MS } })
      expect(getInstallStateSummary({ ...progressive, dismissCount: 5 })).toEqual({ code: 'snoozed', params: { until: now - 1000 + 14 * DAY_MS } })
    })

    it('an invalid or missing policy behaves as session', () => {
      expect(getInstallStateSummary({ ...ready, policy: undefined, sessionDismissed: true }).code).toBe('closed-session')
      expect(getInstallStateSummary({ ...ready, policy: undefined, dismissedAt: now - 1000 }).code).toBe('available')
    })

    it('"closed in this session" sits where the snooze does: after the installed mark, before no offer and the route', () => {
      const closed = { canInstall: false, platform: 'web', policy: policy('session'), sessionDismissed: true, quietRoute: true, now }
      expect(getInstallStateSummary({ ...closed, installedMark: true }).code).toBe('hidden-installed')
      expect(getInstallStateSummary(closed).code).toBe('closed-session')
      expect(getInstallStateSummary({ ...closed, platform: 'android' }).code).toBe('hidden-platform')
    })
  })
})
