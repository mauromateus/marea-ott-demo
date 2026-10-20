import Session from 'core/Session'

beforeEach(() => window.sessionStorage.clear())
afterEach(() => jest.restoreAllMocks())

describe('Session wrapper', () => {
  it('stores and reads strings and objects', () => {
    Session.setItem('a', 'x')
    Session.setItem('b', { n: 1 })
    expect(Session.getItem('a')).toBe('x')
    expect(Session.getItem('b')).toEqual({ n: 1 })
  })

  it('removes items', () => {
    Session.setItem('a', 'x')
    Session.removeItem('a')
    expect(Session.getItem('a')).toBeNull()
  })

  it('never writes to localStorage', () => {
    Session.setItem('a', 'x')
    expect(window.localStorage.length).toBe(0)
  })

  it('does not throw when the store throws', () => {
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('boom') })
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('boom') })
    jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => { throw new Error('boom') })
    expect(() => Session.setItem('a', 'x')).not.toThrow()
    expect(Session.getItem('a')).toBeUndefined()
    expect(() => Session.removeItem('a')).not.toThrow()
  })

  it('does not throw when sessionStorage is not accessible', () => {
    const original = Object.getOwnPropertyDescriptor(window, 'sessionStorage')
    Object.defineProperty(window, 'sessionStorage', { configurable: true, get () { throw new Error('denied') } })
    try {
      expect(() => Session.setItem('a', 'x')).not.toThrow()
      expect(Session.getItem('a')).toBeUndefined()
    } finally {
      if (original) Object.defineProperty(window, 'sessionStorage', original)
    }
  })
})
