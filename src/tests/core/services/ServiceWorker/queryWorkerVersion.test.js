import queryWorkerVersion from 'core/services/ServiceWorker/queryWorkerVersion'

const VERSION = 'main.aaaa1111.js'

// A fake MessageChannel; `ref.current` exposes the last created channel so a test can answer on port1.
const makeChannel = () => {
  const ref = { current: null }
  const Channel = function () {
    this.port1 = {}
    this.port2 = { id: 'port2' }
    ref.current = this
  }
  return { Channel, ref }
}

const makeContainer = (registration) => ({ getRegistration: jest.fn(() => Promise.resolve(registration)) })

// An active worker that answers GET_VERSION with `reply` on the transferred port, or stays silent when undefined.
const makeWorker = (ref, reply) => ({
  postMessage: jest.fn(() => {
    if (reply !== undefined) {
      ref.current.port1.onmessage({ data: reply })
    }
  })
})

describe('queryWorkerVersion', () => {
  afterEach(() => {
    jest.useRealTimers()
  })

  it('returns the bundle name the active worker answers', async () => {
    const { Channel, ref } = makeChannel()
    const active = makeWorker(ref, { type: 'VERSION', main: VERSION })
    const result = await queryWorkerVersion({ container: makeContainer({ active, waiting: null }), Channel })
    expect(result).toEqual({ status: 'answered', version: VERSION, waiting: false })
  })

  it('sends exactly GET_VERSION with one transferred port (port2)', async () => {
    const { Channel, ref } = makeChannel()
    const active = makeWorker(ref, { type: 'VERSION', main: VERSION })
    await queryWorkerVersion({ container: makeContainer({ active }), Channel })
    expect(active.postMessage).toHaveBeenCalledTimes(1)
    const [message, transfer] = active.postMessage.mock.calls[0]
    expect(message).toStrictEqual({ type: 'GET_VERSION' })
    expect(transfer).toHaveLength(1)
    expect(transfer[0]).toBe(ref.current.port2)
  })

  it('reports no worker when the browser has no serviceWorker support', async () => {
    const { Channel } = makeChannel()
    expect(await queryWorkerVersion({ container: undefined, Channel })).toEqual({ status: 'none', version: null, waiting: false })
  })

  it('reports no worker when nothing is registered', async () => {
    const { Channel } = makeChannel()
    expect(await queryWorkerVersion({ container: makeContainer(undefined), Channel })).toEqual({ status: 'none', version: null, waiting: false })
  })

  it('reports no worker when reading the registration fails', async () => {
    const { Channel } = makeChannel()
    const container = { getRegistration: jest.fn(() => Promise.reject(new Error('denied'))) }
    expect(await queryWorkerVersion({ container, Channel })).toEqual({ status: 'none', version: null, waiting: false })
  })

  it('reports no answer when the registration has no active worker, and still detects a waiting one', async () => {
    const { Channel } = makeChannel()
    const result = await queryWorkerVersion({ container: makeContainer({ active: null, waiting: {} }), Channel })
    expect(result).toEqual({ status: 'unanswered', version: null, waiting: true })
  })

  it('reports no answer after 2 seconds of silence', async () => {
    jest.useFakeTimers()
    const { Channel, ref } = makeChannel()
    const active = makeWorker(ref, undefined)
    const pending = queryWorkerVersion({ container: makeContainer({ active }), Channel })
    await Promise.resolve()
    await Promise.resolve()
    jest.advanceTimersByTime(1999)
    let settled = false
    pending.then(() => { settled = true })
    await Promise.resolve()
    expect(settled).toBe(false)
    jest.advanceTimersByTime(1)
    expect(await pending).toEqual({ status: 'unanswered', version: null, waiting: false })
  })

  it('uses the injected timers and clears the timeout once the worker answers', async () => {
    const { Channel, ref } = makeChannel()
    const timers = { setTimeout: jest.fn(() => 42), clearTimeout: jest.fn() }
    const active = makeWorker(ref, { type: 'VERSION', main: VERSION })
    await queryWorkerVersion({ container: makeContainer({ active }), Channel, timers })
    expect(timers.setTimeout).toHaveBeenCalledWith(expect.any(Function), 2000)
    expect(timers.clearTimeout).toHaveBeenCalledWith(42)
  })

  it.each([
    ['an unexpected message type', { type: 'OTHER', main: VERSION }],
    ['a VERSION answer without a bundle name (old worker)', { type: 'VERSION' }],
    ['no data', undefined]
  ])('treats %s as no answer', async (_name, data) => {
    const { Channel, ref } = makeChannel()
    const active = { postMessage: jest.fn(() => ref.current.port1.onmessage({ data })) }
    const result = await queryWorkerVersion({ container: makeContainer({ active }), Channel })
    expect(result.status).toBe('unanswered')
    expect(result.version).toBeNull()
  })

  it('reports no answer when posting to the worker throws', async () => {
    const { Channel } = makeChannel()
    const active = { postMessage: jest.fn(() => { throw new Error('boom') }) }
    const result = await queryWorkerVersion({ container: makeContainer({ active }), Channel })
    expect(result.status).toBe('unanswered')
  })

  it('reports no answer when MessageChannel is not available', async () => {
    const active = { postMessage: jest.fn() }
    const result = await queryWorkerVersion({ container: makeContainer({ active }), Channel: null })
    expect(result.status).toBe('unanswered')
    expect(active.postMessage).not.toHaveBeenCalled()
  })

  it('detects a waiting worker next to an answering active one', async () => {
    const { Channel, ref } = makeChannel()
    const active = makeWorker(ref, { type: 'VERSION', main: VERSION })
    const result = await queryWorkerVersion({ container: makeContainer({ active, waiting: {} }), Channel })
    expect(result).toEqual({ status: 'answered', version: VERSION, waiting: true })
  })
})
