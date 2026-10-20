import DataLayerService, { RING_BUFFER_SIZE } from 'core/services/DataLayerService'

beforeEach(() => {
  delete window.dataLayer
  DataLayerService.clearRecentEvents()
})

afterEach(() => jest.restoreAllMocks())

describe('DataLayerService', () => {
  it('creates window.dataLayer and pushes { event, ...params }', () => {
    DataLayerService.pushEvent({ eventName: 'ms_event_test', params: { a: 1 } })
    expect(window.dataLayer).toEqual([{ event: 'ms_event_test', a: 1 }])
  })

  it('reuses an existing dataLayer', () => {
    window.dataLayer = [{ gtm: true }]
    DataLayerService.pushEvent({ eventName: 'e' })
    expect(window.dataLayer).toHaveLength(2)
  })

  it('keeps a ring buffer of the last 20 pushes', () => {
    expect(RING_BUFFER_SIZE).toBe(20)
    for (let i = 0; i < 25; i++) DataLayerService.pushEvent({ eventName: 'e', params: { i } })
    const recent = DataLayerService.getRecentEvents()
    expect(recent).toHaveLength(20)
    expect(recent[0].payload.i).toBe(5)
    expect(recent[19].payload.i).toBe(24)
    expect(typeof recent[0].at).toBe('number')
  })

  it('notifies subscribers and supports unsubscribe', () => {
    const listener = jest.fn()
    const unsubscribe = DataLayerService.subscribe(listener)
    DataLayerService.pushEvent({ eventName: 'e' })
    expect(listener).toHaveBeenCalledTimes(1)
    unsubscribe()
    DataLayerService.pushEvent({ eventName: 'e' })
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('does not throw when dataLayer.push throws', () => {
    window.dataLayer = { push: () => { throw new Error('boom') } }
    jest.spyOn(console, 'warn').mockImplementation(() => {})
    expect(() => DataLayerService.pushEvent({ eventName: 'e' })).not.toThrow()
  })
})
