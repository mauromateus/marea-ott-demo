import React from 'react'
import { screen, fireEvent, act, waitFor } from '@testing-library/react'

import renderWithProviders, { config } from '../../../utils/renderWithProviders'
import { useAudioPlayer } from 'components/context/PlayerContext/AudioPlayerProvider'
import { isPlayingAtom, activeSourceAtom, audioStatusAtom } from 'components/context/PlayerContext/atoms/playerAtoms'
import DataLayerService from 'core/services/DataLayerService'
import playerTrackingState from 'components/context/GoogleTagManager/utils/playerTrackingState'
import { resetPlatformOrigin, initPlatformOrigin } from 'core/Utils/getPlatformOrigin'
import loadPlayerWithAdapter from 'core/services/Player'

jest.mock('core/services/Player')

const Consumer = () => {
  const { status, isPlaying, toggle } = useAudioPlayer()
  return (
    <div>
      <span data-testid='status'>{status}</span>
      <span data-testid='playing'>{String(isPlaying)}</span>
      <button onClick={toggle}>toggle</button>
    </div>
  )
}

let fakePlayer
let strategy
let loadedConfig

beforeEach(() => {
  delete window.dataLayer
  DataLayerService.clearRecentEvents()
  playerTrackingState.clear()
  window.sessionStorage.clear()
  window.history.pushState({}, '', '/?ms_platform=android')
  resetPlatformOrigin()
  initPlatformOrigin()

  fakePlayer = { play: jest.fn(() => Promise.resolve()), pause: jest.fn() }
  strategy = { destroy: jest.fn() }
  loadPlayerWithAdapter.mockImplementation((containerId, playerConfig) => {
    loadedConfig = playerConfig
    return Promise.resolve({ strategy, player: fakePlayer })
  })
})

afterEach(() => jest.clearAllMocks())

const start = async () => {
  const utils = renderWithProviders(<Consumer />, { platform: 'android' })
  fireEvent.click(screen.getByText('toggle'))
  await waitFor(() => expect(loadPlayerWithAdapter).toHaveBeenCalled())
  await waitFor(() => expect(fakePlayer.play).toHaveBeenCalled())
  return utils
}

describe('AudioPlayerProvider', () => {
  it('lazily loads the live audio player with the platform aware npaw name', async () => {
    renderWithProviders(<Consumer />, { platform: 'android' })
    expect(loadPlayerWithAdapter).not.toHaveBeenCalled()
    fireEvent.click(screen.getByText('toggle'))
    await waitFor(() => expect(loadPlayerWithAdapter).toHaveBeenCalledTimes(1))
    expect(loadedConfig).toMatchObject({
      id: config.players.audio.id,
      type: 'live',
      npaw: { name: 'marea-pwa-android', version: '0.1.0' }
    })
  })

  it('marks audio as the active source as soon as playback is requested', async () => {
    const { store } = await start()
    expect(store.get(activeSourceAtom)).toBe('audio')
    expect(store.get(audioStatusAtom)).toBe('loading')
  })

  it('reflects play and pause events in the jotai atoms', async () => {
    const { store } = await start()
    act(() => loadedConfig.events.onPlay())
    expect(screen.getByTestId('status')).toHaveTextContent('playing')
    expect(store.get(isPlayingAtom)).toBe(true)

    act(() => loadedConfig.events.onVideoStop())
    expect(screen.getByTestId('status')).toHaveTextContent('paused')
    expect(store.get(isPlayingAtom)).toBe(false)
  })

  it('reuses the loaded player on the next toggle', async () => {
    await start()
    act(() => loadedConfig.events.onPlay())
    fireEvent.click(screen.getByText('toggle'))
    expect(fakePlayer.pause).toHaveBeenCalled()
    expect(loadPlayerWithAdapter).toHaveBeenCalledTimes(1)
  })

  it('pauses audio when video becomes the active source', async () => {
    const { store } = await start()
    act(() => loadedConfig.events.onPlay())
    act(() => store.set(activeSourceAtom, 'video'))
    expect(fakePlayer.pause).toHaveBeenCalled()
  })

  it('does not pause audio for a video that is not the active source', async () => {
    const { store } = await start()
    act(() => loadedConfig.events.onPlay())
    fakePlayer.pause.mockClear()
    act(() => store.set(activeSourceAtom, 'audio'))
    expect(fakePlayer.pause).not.toHaveBeenCalled()
  })

  it('pushes player ready and video_start analytics for audio with the resolver platform', async () => {
    await start()
    act(() => loadedConfig.events.onPlayerReady())
    act(() => loadedConfig.events.onTimeUpdate(1))
    const names = window.dataLayer.map((e) => e.event)
    expect(names).toEqual(expect.arrayContaining(['ms_event_player_ready', 'ms_event_video_start']))
    const started = window.dataLayer.find((e) => e.event === 'ms_event_video_start')
    expect(started).toMatchObject({ ms_video_id: config.players.audio.id, ms_platform_origin: 'android' })
  })

  it('reports an error state when the player fails to load', async () => {
    loadPlayerWithAdapter.mockImplementation(() => Promise.reject(new Error('blocked')))
    renderWithProviders(<Consumer />)
    fireEvent.click(screen.getByText('toggle'))
    await waitFor(() => expect(screen.getByTestId('status')).toHaveTextContent('error'))
  })

  it('forgets an evicted player and reloads on the next toggle', async () => {
    let evictedCb
    loadPlayerWithAdapter.mockImplementation((containerId, playerConfig, options) => {
      loadedConfig = playerConfig
      evictedCb = options.onEvicted
      return Promise.resolve({ strategy, player: fakePlayer })
    })
    const { store } = await start()
    act(() => loadedConfig.events.onPlay())
    act(() => evictedCb())
    expect(screen.getByTestId('status')).toHaveTextContent('paused')
    expect(store.get(isPlayingAtom)).toBe(false)

    fireEvent.click(screen.getByText('toggle'))
    await waitFor(() => expect(loadPlayerWithAdapter).toHaveBeenCalledTimes(2))
  })

  it('destroys the player on unmount', async () => {
    const { unmount } = await start()
    unmount()
    expect(strategy.destroy).toHaveBeenCalled()
  })
})
