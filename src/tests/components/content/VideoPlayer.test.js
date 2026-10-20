import React from 'react'
import { act, waitFor, screen, fireEvent } from '@testing-library/react'

import renderWithProviders, { config } from '../../utils/renderWithProviders'
import VideoPlayer from 'components/content/VideoPlayer/VideoPlayer'
import { activeSourceAtom, isVideoPlayingAtom } from 'components/context/PlayerContext/atoms/playerAtoms'
import DataLayerService from 'core/services/DataLayerService'
import playerTrackingState from 'components/context/GoogleTagManager/utils/playerTrackingState'
import loadPlayerWithAdapter from 'core/services/Player'

jest.mock('core/services/Player')

let fakePlayer
let strategy
let loadedConfig

beforeEach(() => {
  delete window.dataLayer
  DataLayerService.clearRecentEvents()
  playerTrackingState.clear()
  fakePlayer = { play: jest.fn(), pause: jest.fn() }
  strategy = { destroy: jest.fn() }
  loadPlayerWithAdapter.mockImplementation((containerId, playerConfig) => {
    loadedConfig = playerConfig
    return Promise.resolve({ strategy, player: fakePlayer })
  })
})

afterEach(() => jest.clearAllMocks())

const mount = async () => {
  const utils = renderWithProviders(<VideoPlayer />, { platform: 'ios', route: '/tv' })
  await waitFor(() => expect(loadPlayerWithAdapter).toHaveBeenCalled())
  await act(async () => {})
  return utils
}

describe('VideoPlayer', () => {
  it('mounts a 16:9 container and loads the live video player with npaw and customer_extras', async () => {
    const { container } = await mount()
    const [containerId] = loadPlayerWithAdapter.mock.calls[0]
    expect(container.querySelector(`#${containerId}`)).toBeInTheDocument()
    expect(loadedConfig).toMatchObject({
      id: config.players.video.id,
      type: 'live',
      customer_extras: null,
      npaw: { name: 'marea-pwa-ios', version: '0.1.0' }
    })
  })

  it('marks video as the active source when it starts playing', async () => {
    const { store } = await mount()
    act(() => loadedConfig.events.onPlay())
    expect(store.get(activeSourceAtom)).toBe('video')
    expect(store.get(isVideoPlayingAtom)).toBe(true)
  })

  it('pauses video when audio becomes the active source', async () => {
    const { store } = await mount()
    act(() => loadedConfig.events.onPlay())
    act(() => store.set(activeSourceAtom, 'audio'))
    expect(fakePlayer.pause).toHaveBeenCalled()
  })

  it('offers to resume when the radio takes over the player, and reloads on resume', async () => {
    let evictedCb
    loadPlayerWithAdapter.mockImplementation((containerId, playerConfig, options) => {
      loadedConfig = playerConfig
      evictedCb = options.onEvicted
      return Promise.resolve({ strategy, player: fakePlayer })
    })
    const { store } = await mount()
    act(() => loadedConfig.events.onPlay())
    act(() => evictedCb())
    expect(screen.getByText(/radio is using the player/i)).toBeInTheDocument()
    expect(store.get(isVideoPlayingAtom)).toBe(false)

    fireEvent.click(screen.getByRole('button', { name: /resume tv/i }))
    await waitFor(() => expect(loadPlayerWithAdapter).toHaveBeenCalledTimes(2))
  })

  it('destroys the player and clears the playing flag on unmount', async () => {
    const { unmount, store } = await mount()
    act(() => loadedConfig.events.onPlay())
    unmount()
    expect(strategy.destroy).toHaveBeenCalled()
    expect(store.get(isVideoPlayingAtom)).toBe(false)
  })

  it('destroys a player that finishes loading after unmount', async () => {
    let resolveLoad
    loadPlayerWithAdapter.mockImplementation(() => new Promise((resolve) => { resolveLoad = resolve }))
    const { unmount } = renderWithProviders(<VideoPlayer />, { route: '/tv' })
    unmount()
    await act(async () => resolveLoad({ strategy, player: fakePlayer }))
    expect(strategy.destroy).toHaveBeenCalled()
  })
})
