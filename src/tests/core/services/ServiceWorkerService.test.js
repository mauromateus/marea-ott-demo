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
