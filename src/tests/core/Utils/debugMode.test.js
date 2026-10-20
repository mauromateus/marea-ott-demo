import Session from 'core/Session'
import { DEBUG_QUERY_PARAM, DEBUG_SESSION_KEY, isDebugMode, parseDebugParam, syncDebugMode } from 'core/Utils/debugMode'

beforeEach(() => window.sessionStorage.clear())
afterEach(() => jest.restoreAllMocks())

describe('parseDebugParam (pure)', () => {
  it('reads 1 as on and 0 as off', () => {
    expect(parseDebugParam(`?${DEBUG_QUERY_PARAM}=1`)).toBe(true)
    expect(parseDebugParam(`?${DEBUG_QUERY_PARAM}=0`)).toBe(false)
    expect(parseDebugParam(`?a=b&${DEBUG_QUERY_PARAM}=1`)).toBe(true)
  })

  it.each(['', '?', '?other=1', '?debug=', '?debug=true', '?debug=2', '?debug=yes'])('ignores "%s"', (search) => {
    expect(parseDebugParam(search)).toBeNull()
  })

  it('ignores a missing or non-string search', () => {
    expect(parseDebugParam()).toBeNull()
    expect(parseDebugParam(null)).toBeNull()
  })
})

describe('isDebugMode', () => {
  it('is off by default', () => {
    expect(isDebugMode()).toBe(false)
  })

  it('is on only for the stored on value', () => {
    Session.setItem(DEBUG_SESSION_KEY, '1')
    expect(isDebugMode()).toBe(true)
    Session.setItem(DEBUG_SESSION_KEY, 'maybe')
    expect(isDebugMode()).toBe(false)
  })

  it('never throws when the session is unavailable', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('denied') })
    expect(isDebugMode()).toBe(false)
  })
})

describe('syncDebugMode', () => {
  it('?debug=1 turns it on and stores it in the session only', () => {
    expect(syncDebugMode('?debug=1')).toBe(true)
    expect(window.sessionStorage.getItem(DEBUG_SESSION_KEY)).toBe('1')
    expect(window.localStorage.length).toBe(0)
  })

  it('stays on without the param in later routes', () => {
    syncDebugMode('?debug=1')
    expect(syncDebugMode('')).toBe(true)
    expect(syncDebugMode('?other=1')).toBe(true)
  })

  it('?debug=0 turns it off and removes the key', () => {
    syncDebugMode('?debug=1')
    expect(syncDebugMode('?debug=0')).toBe(false)
    expect(window.sessionStorage.getItem(DEBUG_SESSION_KEY)).toBeNull()
  })

  it('is off when nothing was ever set', () => {
    expect(syncDebugMode('')).toBe(false)
    expect(window.sessionStorage.length).toBe(0)
  })

  it('an unknown value changes nothing', () => {
    syncDebugMode('?debug=1')
    expect(syncDebugMode('?debug=banana')).toBe(true)
  })

  it('does not throw when the session cannot be written', () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota') })
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('denied') })
    expect(() => syncDebugMode('?debug=1')).not.toThrow()
  })
})
