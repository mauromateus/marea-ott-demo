import React from 'react'
import styled from 'styled-components'
import { Helmet } from 'react-helmet'

import { useAppContext } from 'components/context/AppContext/AppContext'
import { useAudioPlayer } from 'components/context/PlayerContext/AudioPlayerProvider'
import LiveBadge from 'components/common/LiveBadge/LiveBadge'
import { Button } from 'components/common/Button/Button.styles'
import { PlayIcon, PauseIcon, SpinnerIcon } from 'components/common/Icons/Icons'
import Equalizer from 'components/content/Equalizer/Equalizer'
import { WaveDecoration } from 'components/content/LiveCard/LiveCard'
import { translate } from 'core/Translation'

const Panel = styled.section`
  position: relative;
  overflow: hidden;
  max-width: 720px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 22px;
  padding: clamp(28px, 6vw, 56px) clamp(20px, 5vw, 48px);
  text-align: center;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: linear-gradient(145deg, #3A1C71 0%, #7B2D5F 55%, #FF6B4A 130%);
  box-shadow: ${({ theme }) => theme.shadows.card};

  > *:not(svg) { position: relative; }
  h1 { font-size: clamp(1.9rem, 5vw, 3rem); }
  p { color: rgba(255, 255, 255, 0.85); }
`

const BigButton = styled(Button)`
  min-width: 190px;
  min-height: 56px;
  font-size: 1.1rem;
`

// Literal keys on purpose: the dictionary test scans source for them.
const STATUS_KEYS = {
  idle: 'radio.status.idle',
  loading: 'radio.status.loading',
  playing: 'radio.status.playing',
  paused: 'radio.status.paused',
  error: 'radio.status.error'
}

export default function ViewRadio () {
  const { config } = useAppContext()
  const { status, isPlaying, toggle } = useAudioPlayer()
  const { title, description } = config.players.audio
  const loading = status === 'loading'

  return (
    <Panel aria-labelledby='radio-title'>
      <Helmet><title>{title}</title></Helmet>
      <WaveDecoration />
      <LiveBadge />
      <Equalizer active={isPlaying} size={44} />
      <h1 id='radio-title'>{title}</h1>
      <p>{description}</p>
      <BigButton type='button' onClick={toggle} disabled={loading} aria-label={isPlaying ? translate('player.pauseNamed', { title }) : translate('player.playNamed', { title })}>
        {loading ? <SpinnerIcon /> : isPlaying ? <PauseIcon /> : <PlayIcon />}
        {loading ? translate('player.connecting') : isPlaying ? translate('player.pause') : translate('player.play')}
      </BigButton>
      <p role='status'>{translate(STATUS_KEYS[status])}</p>
    </Panel>
  )
}
