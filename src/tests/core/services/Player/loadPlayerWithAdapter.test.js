import loadPlayerWithAdapter from 'core/services/Player'

jest.mock('core/services/Player/utils/loadPlayer', () => ({
  __esModule: true,
  default: jest.fn(() => Promise.resolve()),
  LIGHTNING_PLAYER_URL: 'https://player.cdn.mdstrm.com/lightning_player/api.js'
}))

const makeSdkPlayer = () => ({ on: jest.fn(), off: jest.fn(), once: jest.fn(), destroy: jest.fn(() => Promise.resolve()) })

beforeEach(() => {
  window.loadMSPlayer = jest.fn(() => Promise.resolve(makeSdkPlayer()))
})

afterEach(() => {
  delete window.loadMSPlayer
})

describe('loadPlayerWithAdapter', () => {
  it('mounts a Lightning player and returns the strategy and the SDK instance', async () => {
    const { strategy, player } = await loadPlayerWithAdapter('c1', { id: 'x', type: 'live', events: {} })
    expect(window.loadMSPlayer).toHaveBeenCalledWith('c1', expect.objectContaining({ id: 'x', type: 'live', aspectRatio: null, startPos: 0 }))
    expect(player).toBeDefined()
    expect(strategy.player).toBe(player)
  })

  it('the SDK is a singleton: loading a second player evicts the first one', async () => {
    const onEvicted = jest.fn()
    const first = await loadPlayerWithAdapter('audio', { id: 'a', events: {} }, { onEvicted })
    const second = await loadPlayerWithAdapter('video', { id: 'v', events: {} })

    expect(onEvicted).toHaveBeenCalledTimes(1)
    expect(first.player.destroy).toHaveBeenCalled()
    expect(second.player.destroy).not.toHaveBeenCalled()
  })

  it('does not evict a player that was already destroyed by its owner', async () => {
    const onEvicted = jest.fn()
    const first = await loadPlayerWithAdapter('audio', { id: 'a', events: {} }, { onEvicted })
    await first.strategy.destroy()
    await loadPlayerWithAdapter('video', { id: 'v', events: {} })
    expect(onEvicted).not.toHaveBeenCalled()
  })

  it('rejects when the SDK is not available', async () => {
    delete window.loadMSPlayer
    await expect(loadPlayerWithAdapter('c', { id: 'x', events: {} })).rejects.toThrow('Lightning Player API not available')
  })
})
