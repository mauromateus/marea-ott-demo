import React from 'react'
import styled from 'styled-components'
import { Link, useRouteMatch } from 'react-router-dom'

import { useAppContext } from 'components/context/AppContext/AppContext'
import { useAudioPlayer } from 'components/context/PlayerContext/AudioPlayerProvider'
import LiveBadge from 'components/common/LiveBadge/LiveBadge'
import Equalizer from 'components/content/Equalizer/Equalizer'
import { Button } from 'components/common/Button/Button.styles'
import { PlayIcon, PauseIcon, SpinnerIcon } from 'components/common/Icons/Icons'

const Bar = styled.aside`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 30;
  padding: 0 ${({ theme }) => theme.layout.gutter} calc(12px + env(safe-area-inset-bottom));
  pointer-events: none;
`

const Inner = styled.div`
  max-width: 720px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 12px 10px 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ theme }) => theme.colors.surfaceAlt};
  box-shadow: 0 14px 40px -10px rgba(0, 0, 0, 0.7);
  pointer-events: auto;
`

const Info = styled(Link)`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-radius: ${({ theme }) => theme.radii.sm};

  strong { font-family: ${({ theme }) => theme.fonts.heading}; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
`

const Row = styled.span`
  display: flex;
  align-items: center;
  gap: 10px;
`

export default function MiniPlayer () {
  const { config } = useAppContext()
  const { status, isPlaying, toggle } = useAudioPlayer()
  const onRadioPage = useRouteMatch('/radio')

  if (status === 'idle' || onRadioPage) {
    return null
  }

  const title = config.players.audio.title
  const loading = status === 'loading'

  return (
    <Bar aria-label={`${title} mini player`}>
      <Inner>
        <Equalizer active={isPlaying} size={24} />
        <Info to='/radio'>
          <strong>{title}</strong>
          <Row><LiveBadge /></Row>
        </Info>
        <Button type='button' onClick={toggle} disabled={loading} aria-label={isPlaying ? `Pause ${title}` : `Play ${title}`}>
          {loading ? <SpinnerIcon /> : isPlaying ? <PauseIcon /> : <PlayIcon />}
          {isPlaying ? 'Pause' : 'Play'}
        </Button>
      </Inner>
    </Bar>
  )
}
