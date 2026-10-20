import {
  DAY_MS,
  DEFAULT_REAPPEAR_MODE,
  PROGRESSIVE_LATER_DAYS,
  PROGRESSIVE_SECOND_DAYS,
  getDismissalWrites,
  getHiddenState,
  isHiddenByPolicy,
  parseReappear
} from 'components/common/InstallSheet/utils/reappearPolicy'

const now = Date.UTC(2026, 0, 15, 12)
const none = { dismissedAt: null, dismissCount: null, sessionDismissed: false, now }

describe('parseReappear', () => {
  it('accepts the fixed modes', () => {
    expect(parseReappear('everyLoad')).toEqual({ mode: 'everyLoad' })
    expect(parseReappear('session')).toEqual({ mode: 'session' })
    expect(parseReappear('progressive')).toEqual({ mode: 'progressive' })
  })

  it('accepts days:N with a positive integer', () => {
    expect(parseReappear('days:3')).toEqual({ mode: 'days', days: 3 })
    expect(parseReappear('days:30')).toEqual({ mode: 'days', days: 30 })
    expect(parseReappear('days:1')).toEqual({ mode: 'days', days: 1 })
  })

  it('ignores case and surrounding whitespace', () => {
    expect(parseReappear('  EVERYLOAD ')).toEqual({ mode: 'everyLoad' })
    expect(parseReappear('Session')).toEqual({ mode: 'session' })
    expect(parseReappear(' Progressive\n')).toEqual({ mode: 'progressive' })
    expect(parseReappear(' DAYS:7 ')).toEqual({ mode: 'days', days: 7 })
  })

  it.each([
    ['days:0'], ['days:-2'], ['days:abc'], ['days:'], ['days'], ['days:2.5'], ['days:1e3'], ['days: 3'], ['days:3d'], ['days:+3']
  ])('falls back to session for the invalid value %j', (value) => {
    expect(parseReappear(value)).toEqual({ mode: 'session' })
  })

  it.each([[undefined], [null], [''], ['   '], ['weekly'], [3], [true], [{}], [['session']]])('falls back to session for %j', (value) => {
    expect(parseReappear(value)).toEqual({ mode: DEFAULT_REAPPEAR_MODE })
    expect(DEFAULT_REAPPEAR_MODE).toBe('session')
  })

  it('rejects a day count too large to be a safe number', () => {
    expect(parseReappear(`days:${'9'.repeat(30)}`)).toEqual({ mode: 'session' })
  })
})

describe('progressive steps', () => {
  it('are named constants: 3 days on the second close, 14 days from the third', () => {
    expect(PROGRESSIVE_SECOND_DAYS).toBe(3)
    expect(PROGRESSIVE_LATER_DAYS).toBe(14)
  })
})

describe('isHiddenByPolicy', () => {
  describe('everyLoad', () => {
    const policy = { mode: 'everyLoad' }

    it('never hides from storage, whatever an earlier version left there', () => {
      expect(isHiddenByPolicy({ ...none, policy })).toBe(false)
      expect(isHiddenByPolicy({ ...none, policy, dismissedAt: now - 1000, dismissCount: 5, sessionDismissed: true })).toBe(false)
    })
  })

  describe('session', () => {
    const policy = { mode: 'session' }

    it('hides only when this tab session dismissed it', () => {
      expect(isHiddenByPolicy({ ...none, policy })).toBe(false)
      expect(isHiddenByPolicy({ ...none, policy, sessionDismissed: true })).toBe(true)
    })

    it('ignores a legacy localStorage snooze', () => {
      expect(isHiddenByPolicy({ ...none, policy, dismissedAt: now - 1000 })).toBe(false)
    })
  })

  describe('days', () => {
    const policy = { mode: 'days', days: 3 }

    it('hides inside the window and shows at and after N days', () => {
      expect(isHiddenByPolicy({ ...none, policy, dismissedAt: now - 1000 })).toBe(true)
      expect(isHiddenByPolicy({ ...none, policy, dismissedAt: now - 3 * DAY_MS + 1 })).toBe(true)
      expect(isHiddenByPolicy({ ...none, policy, dismissedAt: now - 3 * DAY_MS })).toBe(false)
      expect(isHiddenByPolicy({ ...none, policy, dismissedAt: now - 10 * DAY_MS })).toBe(false)
    })

    it('does not hide for the session flag alone', () => {
      expect(isHiddenByPolicy({ ...none, policy, sessionDismissed: true })).toBe(false)
    })

    it('ignores future, missing and corrupt timestamps', () => {
      ;[now + 1000, now + 30 * DAY_MS, undefined, null, 'yesterday', NaN, Infinity, {}, true].forEach((dismissedAt) => {
        expect(isHiddenByPolicy({ ...none, policy, dismissedAt })).toBe(false)
      })
    })

    it('reads a 7 day legacy timestamp with the configured window', () => {
      expect(isHiddenByPolicy({ ...none, policy: { mode: 'days', days: 1 }, dismissedAt: now - 2 * DAY_MS })).toBe(false)
      expect(isHiddenByPolicy({ ...none, policy: { mode: 'days', days: 14 }, dismissedAt: now - 8 * DAY_MS })).toBe(true)
    })
  })

  describe('progressive', () => {
    const policy = { mode: 'progressive' }

    it('shows when nothing was ever closed', () => {
      expect(isHiddenByPolicy({ ...none, policy })).toBe(false)
    })

    it('after the first close hides for the session only', () => {
      expect(isHiddenByPolicy({ ...none, policy, dismissCount: 1, sessionDismissed: true })).toBe(true)
      expect(isHiddenByPolicy({ ...none, policy, dismissCount: 1, sessionDismissed: false })).toBe(false)
    })

    it('does not use a stale timestamp while the count is 0 or 1 (legacy 7 day snooze)', () => {
      expect(isHiddenByPolicy({ ...none, policy, dismissedAt: now - 1000 })).toBe(false)
      expect(isHiddenByPolicy({ ...none, policy, dismissCount: 1, dismissedAt: now - 1000 })).toBe(false)
    })

    it('after the second close hides for 3 days', () => {
      expect(isHiddenByPolicy({ ...none, policy, dismissCount: 2, dismissedAt: now - 3 * DAY_MS + 1 })).toBe(true)
      expect(isHiddenByPolicy({ ...none, policy, dismissCount: 2, dismissedAt: now - 3 * DAY_MS })).toBe(false)
    })

    it('after the third close and later hides for 14 days', () => {
      ;[3, 4, 50].forEach((dismissCount) => {
        expect(isHiddenByPolicy({ ...none, policy, dismissCount, dismissedAt: now - 14 * DAY_MS + 1 })).toBe(true)
        expect(isHiddenByPolicy({ ...none, policy, dismissCount, dismissedAt: now - 14 * DAY_MS })).toBe(false)
      })
    })

    it('does not let a stale session flag hide it once the count is 2 or more', () => {
      expect(isHiddenByPolicy({ ...none, policy, dismissCount: 2, sessionDismissed: true, dismissedAt: now - 4 * DAY_MS })).toBe(false)
    })

    it('ignores future and corrupt timestamps and counts', () => {
      expect(isHiddenByPolicy({ ...none, policy, dismissCount: 2, dismissedAt: now + 1000 })).toBe(false)
      expect(isHiddenByPolicy({ ...none, policy, dismissCount: 2, dismissedAt: 'x' })).toBe(false)
      ;['two', -3, 1.5, NaN, null, undefined].forEach((dismissCount) => {
        expect(isHiddenByPolicy({ ...none, policy, dismissCount, dismissedAt: now - 1000 })).toBe(false)
      })
    })
  })

  it('treats an unknown mode as never hidden', () => {
    expect(isHiddenByPolicy({ ...none, policy: { mode: 'bogus' }, sessionDismissed: true, dismissedAt: now - 1 })).toBe(false)
  })

  it('defaults now to the current time', () => {
    expect(isHiddenByPolicy({ policy: { mode: 'days', days: 2 }, dismissedAt: Date.now() - 1000 })).toBe(true)
  })
})

describe('getHiddenState', () => {
  it('says why and until when', () => {
    expect(getHiddenState({ ...none, policy: { mode: 'session' } })).toEqual({ hidden: false })
    expect(getHiddenState({ ...none, policy: { mode: 'session' }, sessionDismissed: true })).toEqual({ hidden: true, scope: 'session' })
    expect(getHiddenState({ ...none, policy: { mode: 'days', days: 3 }, dismissedAt: now - 1000 }))
      .toEqual({ hidden: true, scope: 'window', until: now - 1000 + 3 * DAY_MS })
    expect(getHiddenState({ ...none, policy: { mode: 'progressive' }, dismissCount: 1, sessionDismissed: true }))
      .toEqual({ hidden: true, scope: 'session' })
    expect(getHiddenState({ ...none, policy: { mode: 'progressive' }, dismissCount: 3, dismissedAt: now - 1000 }))
      .toEqual({ hidden: true, scope: 'window', until: now - 1000 + 14 * DAY_MS })
  })
})

describe('getDismissalWrites', () => {
  const at = (policy, dismissCount) => getDismissalWrites({ policy, dismissCount, now })

  it('everyLoad stores nothing', () => {
    expect(at({ mode: 'everyLoad' }, 4)).toEqual({})
  })

  it('session marks only the tab session', () => {
    expect(at({ mode: 'session' })).toEqual({ sessionDismissed: true })
  })

  it('days stores the timestamp only', () => {
    expect(at({ mode: 'days', days: 3 }, 7)).toEqual({ dismissedAt: now })
  })

  it('progressive: first close is the session plus a count of 1', () => {
    expect(at({ mode: 'progressive' })).toEqual({ sessionDismissed: true, dismissCount: 1 })
    expect(at({ mode: 'progressive' }, 0)).toEqual({ sessionDismissed: true, dismissCount: 1 })
  })

  it('progressive: later closes store the timestamp and the incremented count', () => {
    expect(at({ mode: 'progressive' }, 1)).toEqual({ dismissedAt: now, dismissCount: 2 })
    expect(at({ mode: 'progressive' }, 2)).toEqual({ dismissedAt: now, dismissCount: 3 })
    expect(at({ mode: 'progressive' }, 9)).toEqual({ dismissedAt: now, dismissCount: 10 })
  })

  it('progressive: a corrupt count counts as no earlier close', () => {
    ;['x', -1, 1.5, NaN, {}].forEach((count) => {
      expect(at({ mode: 'progressive' }, count)).toEqual({ sessionDismissed: true, dismissCount: 1 })
    })
  })

  it('an unknown mode stores nothing', () => {
    expect(at({ mode: 'bogus' })).toEqual({})
  })
})
