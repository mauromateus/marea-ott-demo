import React from 'react'
import PropTypes from 'prop-types'
import styled, { keyframes } from 'styled-components'
import { Link } from 'react-router-dom'

import LiveBadge from 'components/common/LiveBadge/LiveBadge'
import { Button, ButtonLink } from 'components/common/Button/Button.styles'
import { PlayIcon, PauseIcon, SpinnerIcon } from 'components/common/Icons/Icons'
import Equalizer from 'components/content/Equalizer/Equalizer'
import { useAudioPlayer } from 'components/context/PlayerContext/AudioPlayerProvider'

const drift = keyframes`
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
`

const Card = styled.section`
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 48px;
  min-height: ${({ $large }) => ($large ? '320px' : '260px')};
  padding: clamp(20px, 3vw, 32px);
  border-radius: ${({ theme }) => theme.radii.lg};
  background: ${({ $kind }) => ($kind === 'audio'
    ? 'linear-gradient(145deg, #3A1C71 0%, #7B2D5F 55%, #FF6B4A 130%)'
    : 'linear-gradient(145deg, #0F4C5C 0%, #134E5E 45%, #2EC4B6 140%)')};
  box-shadow: ${({ theme }) => theme.shadows.card};
  transition: box-shadow 0.25s ease, transform 0.25s ease;

  &:hover {
    box-shadow: ${({ theme, $kind }) => ($kind === 'audio' ? theme.shadows.liveGlow : theme.shadows.glow)};
  }
`

const Waves = styled.svg`
  position: absolute;
  left: 0;
  bottom: 0;
  width: 200%;
  height: 55%;
  color: rgba(255, 255, 255, 0.12);
  pointer-events: none;
  animation: ${drift} 24s linear infinite;
`

const Top = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`

const Body = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const Title = styled.h2`
  font-size: ${({ $large }) => ($large ? 'clamp(1.9rem, 4vw, 2.8rem)' : 'clamp(1.5rem, 3vw, 1.9rem)')};
  font-weight: 700;

  a { border-radius: ${({ theme }) => theme.radii.sm}; }
`

const Description = styled.p`
  color: rgba(255, 255, 255, 0.85);
  max-width: 46ch;
`

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 12px;
`

export const WaveDecoration = () => (
  <Waves viewBox='0 0 800 120' preserveAspectRatio='none' aria-hidden='true'>
    <path fill='currentColor' d='M0 60 C 100 20, 200 100, 300 60 S 500 20, 600 60 S 700 100, 800 60 L800 120 L0 120 Z' />
    <path fill='currentColor' opacity='0.7' d='M0 80 C 100 50, 200 110, 300 80 S 500 50, 600 80 S 700 110, 800 80 L800 120 L0 120 Z' />
  </Waves>
)

const idFor = (kind) => `live-card-${kind}-title`

LiveCard.propTypes = {
  kind: PropTypes.oneOf(['video', 'audio']).isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  to: PropTypes.string.isRequired,
  large: PropTypes.bool
}

export default function LiveCard ({ kind, title, description, to, large = false }) {
  const { status, isPlaying, toggle } = useAudioPlayer()
  const isAudio = kind === 'audio'
  const loading = isAudio && status === 'loading'

  return (
    <Card $kind={kind} $large={large} aria-labelledby={idFor(kind)}>
      <WaveDecoration />
      <Top>
        <LiveBadge />
        {isAudio && <Equalizer active={isPlaying} />}
      </Top>
      <Body>
        <Title id={idFor(kind)} $large={large}><Link to={to}>{title}</Link></Title>
        {description && <Description>{description}</Description>}
        <Actions>
          {isAudio
            ? (
              <Button type='button' onClick={toggle} disabled={loading} aria-label={isPlaying ? `Pause ${title}` : `Listen to ${title} live`}>
                {loading ? <SpinnerIcon /> : isPlaying ? <PauseIcon /> : <PlayIcon />}
                {loading ? 'Connecting' : isPlaying ? 'Pause' : 'Listen live'}
              </Button>
              )
            : (
              <ButtonLink to={to}><PlayIcon /> Watch live</ButtonLink>
              )}
          {isAudio && <ButtonLink to={to} $variant='secondary'>Open radio</ButtonLink>}
        </Actions>
      </Body>
    </Card>
  )
}
