export const SNOOZE_MS = 7 * 24 * 60 * 60 * 1000

// A future or non numeric timestamp (clock change, corrupt storage) must not hide the sheet forever.
export default function isSnoozed (dismissedAt, now = Date.now()) {
  if (typeof dismissedAt !== 'number' || !Number.isFinite(dismissedAt)) {
    return false
  }
  const age = now - dismissedAt
  return age >= 0 && age < SNOOZE_MS
}
