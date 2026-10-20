import { ServiceWorkerService } from 'core/services/ServiceWorkerService'

const makeRegistration = (waiting) => ({ waiting })

describe('ServiceWorkerService', () => {
  it('reports no update until a waiting worker is registered', () => {
    const service = new ServiceWorkerService()
    expect(service.hasUpdate()).toBe(false)
    service.setRegistration(makeRegistration({ postMessage: jest.fn() }))
    expect(service.hasUpdate()).toBe(true)
  })

  it('notifies subscribers and supports unsubscribe', () => {
    const service = new ServiceWorkerService()
    const listener = jest.fn()
    const unsubscribe = service.subscribe(listener)
    service.setRegistration(makeRegistration({ postMessage: jest.fn() }))
    expect(listener).toHaveBeenCalledTimes(1)
    unsubscribe()
    service.setRegistration(makeRegistration({ postMessage: jest.fn() }))
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('applyUpdate asks the waiting worker to skip waiting and reloads once the controller changes', () => {
    const listeners = {}
    const container = { addEventListener: (name, fn) => { listeners[name] = fn } }
    const reload = jest.fn()
    const waiting = { postMessage: jest.fn() }
    const service = new ServiceWorkerService({ container, reload })
    service.setRegistration(makeRegistration(waiting))

    service.applyUpdate()

    expect(waiting.postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' })
    expect(reload).not.toHaveBeenCalled()
    listeners.controllerchange()
    expect(reload).toHaveBeenCalledTimes(1)
  })

  it('applyUpdate is a no-op without a waiting worker', () => {
    const service = new ServiceWorkerService({ container: { addEventListener: jest.fn() }, reload: jest.fn() })
    expect(() => service.applyUpdate()).not.toThrow()
  })
})

describe('ServiceWorkerService.handleUpdate (toast only when the version differs)', () => {
  const VERSION = 'main.aaaa1111.js'

  // The waiting worker answers on the transferred port (paired with port1) with `reply`, or stays silent.
  const build = ({ reply, running = VERSION }) => {
    const channelRef = { current: null }
    const FakeMessageChannel = function () {
      this.port1 = {}
      this.port2 = { id: 'port2' }
      channelRef.current = this
    }
    const waiting = {
      postMessage: jest.fn((message, transfer) => {
        if (message.type === 'GET_VERSION' && reply !== undefined) {
          expect(transfer).toEqual([channelRef.current.port2])
          channelRef.current.port1.onmessage({ data: reply })
        }
      })
    }
    const service = new ServiceWorkerService({
      MessageChannel: FakeMessageChannel,
      getRunningVersion: () => running,
      versionTimeoutMs: 2000
    })
    const listener = jest.fn()
    service.subscribe(listener)
    return { service, waiting, listener, registration: { waiting } }
  }

  beforeEach(() => jest.useFakeTimers())
  afterEach(() => jest.useRealTimers())

  it('activates the waiting worker silently and shows no toast when the versions match', async () => {
    const { service, waiting, listener, registration } = build({ reply: { type: 'VERSION', main: VERSION } })

    await service.handleUpdate(registration)

    expect(waiting.postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' })
    expect(service.hasUpdate()).toBe(false)
    expect(listener).not.toHaveBeenCalled()
  })

  it('does not reload after a silent activation', async () => {
    const { service, registration } = build({ reply: { type: 'VERSION', main: VERSION } })
    service.reload = jest.fn()
    await service.handleUpdate(registration)
    expect(service.reload).not.toHaveBeenCalled()
  })

  it('shows the toast when the versions differ', async () => {
    const { service, waiting, registration } = build({ reply: { type: 'VERSION', main: 'main.bbbb2222.js' } })

    await service.handleUpdate(registration)

    expect(waiting.postMessage).not.toHaveBeenCalledWith({ type: 'SKIP_WAITING' })
    expect(service.hasUpdate()).toBe(true)
  })

  it('shows the toast when the worker does not answer within the timeout', async () => {
    const { service, waiting, registration } = build({ reply: undefined })

    const pending = service.handleUpdate(registration)
    jest.advanceTimersByTime(2001)
    await pending

    expect(waiting.postMessage).not.toHaveBeenCalledWith({ type: 'SKIP_WAITING' })
    expect(service.hasUpdate()).toBe(true)
  })

  it('shows the toast when the worker answers without a version', async () => {
    const { service, registration } = build({ reply: { type: 'VERSION', main: null } })
    await service.handleUpdate(registration)
    expect(service.hasUpdate()).toBe(true)
  })

  it('shows the toast when the running version cannot be determined', async () => {
    const { service, waiting, registration } = build({ reply: { type: 'VERSION', main: VERSION }, running: null })
    await service.handleUpdate(registration)
    expect(waiting.postMessage).not.toHaveBeenCalledWith({ type: 'SKIP_WAITING' })
    expect(service.hasUpdate()).toBe(true)
  })

  it('shows the toast when messaging the worker throws', async () => {
    const { service, waiting, registration } = build({ reply: undefined })
    waiting.postMessage.mockImplementation(() => { throw new Error('boom') })
    await service.handleUpdate(registration)
    expect(service.hasUpdate()).toBe(true)
  })

  it('does nothing without a waiting worker', async () => {
    const { service, listener } = build({ reply: undefined })
    await service.handleUpdate({ waiting: null })
    expect(listener).not.toHaveBeenCalled()
  })
})
