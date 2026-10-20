export const DAY_MS = 24 * 60 * 60 * 1000

export const REAPPEAR_MODES = {
  EVERY_LOAD: 'everyLoad',
  SESSION: 'session',
  DAYS: 'days',
  PROGRESSIVE: 'progressive'
}

// The safe default for a real client; the demo config asks for everyLoad explicitly.
export const DEFAULT_REAPPEAR_MODE = REAPPEAR_MODES.SESSION

// Progressive: the 1st close lasts the session, the 2nd close this many days, the 3rd and later close this many.
export const PROGRESSIVE_SECOND_DAYS = 3
export const PROGRESSIVE_LATER_DAYS = 14

const DAYS_PATTERN = /^days:(\d+)$/

/**
 * Turns the config value (install.sheet.reappear) into a policy. Anything unknown falls back to session.
 * @returns {{mode: 'everyLoad'|'session'|'days'|'progressive', days?: number}}
 */
export function parseReappear (value) {
  const fallback = { mode: DEFAULT_REAPPEAR_MODE }
  if (typeof value !== 'string') {
    return fallback
  }
  const text = value.trim().toLowerCase()
  if (text === 'everyload') {
    return { mode: REAPPEAR_MODES.EVERY_LOAD }
  }
  if (text === 'session') {
    return { mode: REAPPEAR_MODES.SESSION }
  }
  if (text === 'progressive') {
    return { mode: REAPPEAR_MODES.PROGRESSIVE }
  }
  const match = DAYS_PATTERN.exec(text)
  const days = match ? Number(match[1]) : 0
  return Number.isSafeInteger(days) && days > 0 ? { mode: REAPPEAR_MODES.DAYS, days } : fallback
}

// Counts from storage can be corrupt; anything that is not a positive integer means "never closed".
const toCount = (value) => (Number.isInteger(value) && value > 0 ? value : 0)

// A future or non numeric timestamp (clock change, corrupt storage) must not hide the sheet forever.
const windowEnd = (dismissedAt, days, now) => {
  if (typeof dismissedAt !== 'number' || !Number.isFinite(dismissedAt)) {
    return null
  }
  const until = dismissedAt + days * DAY_MS
  const age = now - dismissedAt
  return age >= 0 && now < until ? until : null
}

const hiddenWindow = (dismissedAt, days, now) => {
  const until = windowEnd(dismissedAt, days, now)
  return until === null ? { hidden: false } : { hidden: true, scope: 'window', until }
}

const HIDDEN_FOR_SESSION = { hidden: true, scope: 'session' }

/**
 * Why the sheet is hidden by the policy, from what is stored. everyLoad never reads storage:
 * its hidden state lives in the component for the current page view only.
 * @returns {{hidden: false}|{hidden: true, scope: 'session'}|{hidden: true, scope: 'window', until: number}}
 */
export function getHiddenState ({ policy, dismissedAt, dismissCount, sessionDismissed, now = Date.now() }) {
  switch (policy.mode) {
    case REAPPEAR_MODES.SESSION:
      return sessionDismissed ? HIDDEN_FOR_SESSION : { hidden: false }
    case REAPPEAR_MODES.DAYS:
      return hiddenWindow(dismissedAt, policy.days, now)
    case REAPPEAR_MODES.PROGRESSIVE: {
      const count = toCount(dismissCount)
      if (count <= 1) {
        return sessionDismissed ? HIDDEN_FOR_SESSION : { hidden: false }
      }
      return hiddenWindow(dismissedAt, count === 2 ? PROGRESSIVE_SECOND_DAYS : PROGRESSIVE_LATER_DAYS, now)
    }
    default:
      return { hidden: false }
  }
}

export const isHiddenByPolicy = (input) => getHiddenState(input).hidden

/**
 * What to store when the user closes the sheet. Only the fields present must be written.
 * @returns {{sessionDismissed?: true, dismissedAt?: number, dismissCount?: number}}
 */
export function getDismissalWrites ({ policy, dismissCount, now = Date.now() }) {
  switch (policy.mode) {
    case REAPPEAR_MODES.SESSION:
      return { sessionDismissed: true }
    case REAPPEAR_MODES.DAYS:
      return { dismissedAt: now }
    case REAPPEAR_MODES.PROGRESSIVE: {
      const next = toCount(dismissCount) + 1
      return next === 1 ? { sessionDismissed: true, dismissCount: next } : { dismissedAt: now, dismissCount: next }
    }
    default:
      return {}
  }
}
