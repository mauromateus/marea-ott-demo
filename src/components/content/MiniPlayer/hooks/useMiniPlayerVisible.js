import { useRouteMatch } from 'react-router-dom'

import { useAudioPlayer } from 'components/context/PlayerContext/AudioPlayerProvider'

/** Single source of truth for "is the mini player on screen", shared by whatever must sit above it. */
export default function useMiniPlayerVisible () {
  const { status } = useAudioPlayer()
  const onRadioPage = useRouteMatch('/radio')
  return status !== 'idle' && !onRadioPage
}
