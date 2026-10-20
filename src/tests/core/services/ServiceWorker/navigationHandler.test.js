import { createNavigationHandler } from 'core/services/ServiceWorker/navigationHandler'

const SHELL = 'https://marea.test/marea-ott-demo/index.html'
const okResponse = (body = 'fresh') => ({ ok: true, status: 200, body })

const setup = (overrides = {}) => {
  const fetchFn = jest.fn(() => Promise.resolve(okResponse()))
  const fallback = jest.fn(() => Promise.resolve({ ok: true, body: 'precached' }))
  const handler = createNavigationHandler({ shellUrl: SHELL, fetchFn, fallback, ...overrides })
  return { handler, fetchFn, fallback }
}

describe('createNavigationHandler', () => {
  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())

  it('returns the fresh shell when the network answers', async () => {
    const { handler, fallback } = setup()
    const response = await handler({ event: {} })
    expect(response.body).toBe('fresh')
    expect(fallback).not.toHaveBeenCalled()
  })

  it('builds a no-cache, same-origin request for the shell URL, not the navigation URL', async () => {
    const built = { url: SHELL }
    const createRequest = jest.fn(() => built)
    const { handler, fetchFn } = setup({ createRequest })

    await handler({ request: { url: 'https://marea.test/marea-ott-demo/tv', mode: 'navigate' } })

    expect(createRequest).toHaveBeenCalledWith(SHELL, { cache: 'no-cache', credentials: 'same-origin' })
    expect(fetchFn).toHaveBeenCalledWith(built)
  })

  it('fetches a new request that is not a navigation (default request factory)', async () => {
    const { handler, fetchFn } = setup()
    await handler({ request: { url: 'https://marea.test/marea-ott-demo/tv', mode: 'navigate' } })

    const request = fetchFn.mock.calls[0][0]
    // The jest fetch polyfill appends a cache-busting query for no-cache; real browsers do not.
    expect(request.url.split('?')[0]).toBe(SHELL)
    expect(request.mode).not.toBe('navigate')
  })

  it('falls back to the precached shell, passing the route options through', async () => {
    const { handler, fallback } = setup({ fetchFn: jest.fn(() => Promise.reject(new TypeError('Failed to fetch'))) })
    const options = { event: { id: 1 } }
    const response = await handler(options)
    expect(response.body).toBe('precached')
    expect(fallback).toHaveBeenCalledWith(options)
  })

  it('falls back when the network is slower than the timeout', async () => {
    const { handler, fallback } = setup({ fetchFn: jest.fn(() => new Promise(() => {})), timeoutMs: 3000 })
    const pending = handler({})

    jest.advanceTimersByTime(2999)
    await Promise.resolve()
    expect(fallback).not.toHaveBeenCalled()
    jest.advanceTimersByTime(2)
    const response = await pending

    expect(fallback).toHaveBeenCalledTimes(1)
    expect(response.body).toBe('precached')
  })

  it('uses a 3 second timeout by default', async () => {
    const { handler, fallback } = setup({ fetchFn: jest.fn(() => new Promise(() => {})) })
    const pending = handler({})
    jest.advanceTimersByTime(3001)
    await pending
    expect(fallback).toHaveBeenCalledTimes(1)
  })

  it.each([404, 500])('falls back on a %i response', async (status) => {
    const { handler, fallback } = setup({ fetchFn: jest.fn(() => Promise.resolve({ ok: false, status })) })
    const response = await handler({})
    expect(response.body).toBe('precached')
    expect(fallback).toHaveBeenCalledTimes(1)
  })

  it('does not touch the network while offline', async () => {
    const { handler, fetchFn, fallback } = setup({ isOffline: () => true })
    const response = await handler({})
    expect(fetchFn).not.toHaveBeenCalled()
    expect(response.body).toBe('precached')
    expect(fallback).toHaveBeenCalledTimes(1)
  })

  it('does not leave a pending timer behind after a fast answer', async () => {
    const { handler } = setup()
    await handler({})
    expect(jest.getTimerCount()).toBe(0)
  })
})
