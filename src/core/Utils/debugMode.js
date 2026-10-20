import Session from 'core/Session'

export const DEBUG_QUERY_PARAM = 'debug'
export const DEBUG_SESSION_KEY = 'ms_debug'

const ON = '1'
const OFF = '0'

/** Pure: true for ?debug=1, false for ?debug=0, null for anything else. */
export const parseDebugParam = (search) => {
  if (typeof search !== 'string') return null
  const value = new URLSearchParams(search).get(DEBUG_QUERY_PARAM)
  if (value === ON) return true
  if (value === OFF) return false
  return null
}

export const isDebugMode = () => String(Session.getItem(DEBUG_SESSION_KEY)) === ON

/** Applies ?debug=1 / ?debug=0 from a query string to the session (idempotent) and returns the resulting mode. */
export const syncDebugMode = (search) => {
  const requested = parseDebugParam(search)
  if (requested === true) {
    Session.setItem(DEBUG_SESSION_KEY, ON)
    return true
  }
  if (requested === false) {
    Session.removeItem(DEBUG_SESSION_KEY)
    return false
  }
  return isDebugMode()
}
