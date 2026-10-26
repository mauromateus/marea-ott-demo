import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'

import { useAppContext } from 'components/context/AppContext/AppContext'
import { useGoogleTagManager } from 'components/context/GoogleTagManager/GoogleTagManager'
import getPlayerContent from 'components/context/GoogleTagManager/utils/getPlayerContent'
import { activeSourceAtom, isVideoPlayingAtom } from 'components/context/PlayerContext/atoms/playerAtoms'
import loadPlayerWithAdapter from 'core/services/Player'
import buildPlayerConfig from 'core/services/Player/utils/buildPlayerConfig'
import { stripBasename } from 'core/Utils/getBasename'

export const VIDEO_CONTAINER_ID = 'marea-video-player'

// Plays the live TV signal by default, or any other media of the account when `media` is given ({ id, type: 'media', title }).
export default function useVideoPlayer ({ media: requestedMedia } = {}) {
  const { config, npaw } = useAppContext()
  const { trackPlayerReady, trackPlayerTime } = useGoogleTagManager()
  const setActiveSource = useSetAtom(activeSourceAtom)
  const activeSource = useAtomValue(activeSourceAtom)
  const [isVideoPlaying, setVideoPlaying] = useAtom(isVideoPlayingAtom)
  const [status, setStatus] = useState('loading')
  const [attempt, setAttempt] = useState(0)
  const handleRef = useRef(null)
  const media = requestedMedia || config.players.video
  const isLive = (media.type || 'live') === 'live'
  const ottName = config.app.ottName

  // Latest values for the long-lived player callbacks.
  const latest = useRef({})
  latest.current = { trackPlayerReady, trackPlayerTime, media, ottName, npaw }

  useEffect(() => {
    let cancelled = false
    setStatus('loading')

    const getContent = () => getPlayerContent({
      media: latest.current.media,
      kind: 'video',
      ottName: latest.current.ottName,
      page: stripBasename(window.location.pathname)
    })

    const events = {
      onPlayerReady: () => latest.current.trackPlayerReady({ content: getContent() }),
      onTimeUpdate: (currentTime) => latest.current.trackPlayerTime({ currentTime, content: getContent() }),
      onPlay: () => {
        setActiveSource('video')
        setVideoPlaying(true)
      },
      onVideoStop: () => setVideoPlaying(false),
      onVideoEnd: () => setVideoPlaying(false)
    }

    loadPlayerWithAdapter(VIDEO_CONTAINER_ID, buildPlayerConfig({ media: latest.current.media, npaw: latest.current.npaw, events }), {
      // The radio took over the single SDK instance.
      onEvicted: () => {
        if (cancelled) return
        handleRef.current = null
        setVideoPlaying(false)
        setStatus('evicted')
      }
    })
      .then((handle) => {
        if (cancelled) {
          // Component unmounted while the SDK was loading.
          handle.strategy.destroy()
          return
        }
        handleRef.current = handle
        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })

    return () => {
      cancelled = true
      setVideoPlaying(false)
      const handle = handleRef.current
      handleRef.current = null
      if (handle) handle.strategy.destroy()
    }
  }, [attempt, media.id, setActiveSource, setVideoPlaying])

  useEffect(() => {
    if (activeSource === 'audio' && isVideoPlaying) {
      handleRef.current?.player.pause?.()
    }
  }, [activeSource, isVideoPlaying])

  const retry = useCallback(() => setAttempt((n) => n + 1), [])

  return useMemo(() => ({ status, retry, isLive, containerId: VIDEO_CONTAINER_ID }), [status, retry, isLive])
}
