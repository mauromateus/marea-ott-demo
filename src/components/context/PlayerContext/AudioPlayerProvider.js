import React, { useCallback, useContext, useEffect, useMemo, useRef } from 'react'
import PropTypes from 'prop-types'
import { useAtom } from 'jotai'
import styled from 'styled-components'

import { useAppContext } from 'components/context/AppContext/AppContext'
import { useGoogleTagManager } from 'components/context/GoogleTagManager/GoogleTagManager'
import getPlayerContent from 'components/context/GoogleTagManager/utils/getPlayerContent'
import loadPlayerWithAdapter from 'core/services/Player'
import buildPlayerConfig from 'core/services/Player/utils/buildPlayerConfig'
import { stripBasename } from 'core/Utils/getBasename'
import { activeSourceAtom, audioStatusAtom, isPlayingAtom } from './atoms/playerAtoms'

export const AUDIO_CONTAINER_ID = 'marea-audio-player'

// Mounted off-screen for the whole session so audio keeps playing across route changes.
const HiddenMount = styled.div`
  position: fixed;
  left: -9999px;
  bottom: 0;
  width: 320px;
  height: 80px;
  overflow: hidden;
`

const AudioPlayerContext = React.createContext({
  status: 'idle',
  isPlaying: false,
  play: () => {},
  pause: () => {},
  toggle: () => {}
})

AudioPlayerProvider.propTypes = {
  children: PropTypes.node
}

export default function AudioPlayerProvider ({ children }) {
  const { config, npaw } = useAppContext()
  const { trackPlayerReady, trackPlayerTime } = useGoogleTagManager()
  const [status, setStatus] = useAtom(audioStatusAtom)
  const [isPlaying, setIsPlaying] = useAtom(isPlayingAtom)
  const [activeSource, setActiveSource] = useAtom(activeSourceAtom)
  const handleRef = useRef(null)
  const loadingRef = useRef(null)
  const media = config.players.audio
  const ottName = config.app.ottName

  const getContent = useCallback(
    () => getPlayerContent({ media, kind: 'audio', ottName, page: stripBasename(window.location.pathname) }),
    [media, ottName]
  )

  const events = useMemo(() => ({
    onPlayerReady: () => trackPlayerReady({ content: getContent() }),
    onTimeUpdate: (currentTime) => trackPlayerTime({ currentTime, content: getContent() }),
    onPlay: () => {
      setActiveSource('audio')
      setIsPlaying(true)
      setStatus('playing')
    },
    onVideoStop: () => {
      setIsPlaying(false)
      setStatus('paused')
    },
    onVideoEnd: () => {
      setIsPlaying(false)
      setStatus('paused')
    }
  }), [getContent, trackPlayerReady, trackPlayerTime, setActiveSource, setIsPlaying, setStatus])

  // Another player (the TV) took over the single SDK instance: forget the dead handle so the next play reloads.
  const onEvicted = useCallback(() => {
    handleRef.current = null
    setIsPlaying(false)
    setStatus('paused')
  }, [setIsPlaying, setStatus])

  const play = useCallback(() => {
    // Claiming the active source first is what pauses a running video.
    setActiveSource('audio')

    if (handleRef.current) {
      Promise.resolve(handleRef.current.player.play?.()).catch(() => setStatus('paused'))
      return Promise.resolve()
    }
    if (loadingRef.current) {
      return loadingRef.current
    }

    setStatus('loading')
    loadingRef.current = loadPlayerWithAdapter(AUDIO_CONTAINER_ID, buildPlayerConfig({ media, npaw, events }), { onEvicted })
      .then((handle) => {
        handleRef.current = handle
        // The SDK also autoplays; this call keeps the user gesture effective on stricter browsers.
        return Promise.resolve(handle.player.play?.()).catch(() => setStatus('paused'))
      })
      .catch(() => setStatus('error'))
      .then(() => { loadingRef.current = null })
    return loadingRef.current
  }, [media, npaw, events, onEvicted, setActiveSource, setStatus])

  const pause = useCallback(() => {
    handleRef.current?.player.pause?.()
  }, [])

  const toggle = useCallback(() => {
    if (status === 'loading') {
      return
    }
    return isPlaying ? pause() : play()
  }, [status, isPlaying, play, pause])

  useEffect(() => {
    if (activeSource === 'video' && isPlaying) {
      pause()
    }
  }, [activeSource, isPlaying, pause])

  useEffect(() => () => {
    handleRef.current?.strategy.destroy()
    handleRef.current = null
  }, [])

  const value = useMemo(() => ({ status, isPlaying, play, pause, toggle }), [status, isPlaying, play, pause, toggle])

  return (
    <AudioPlayerContext.Provider value={value}>
      {children}
      <HiddenMount id={AUDIO_CONTAINER_ID} aria-hidden='true' />
    </AudioPlayerContext.Provider>
  )
}

export const useAudioPlayer = () => useContext(AudioPlayerContext)
