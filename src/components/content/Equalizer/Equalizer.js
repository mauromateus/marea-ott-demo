import React from 'react'
import PropTypes from 'prop-types'
import styled, { keyframes } from 'styled-components'

const bounce = keyframes`
  0%, 100% { transform: scaleY(0.25); }
  50% { transform: scaleY(1); }
`

const Wrap = styled.span`
  display: inline-flex;
  align-items: flex-end;
  gap: 3px;
  height: ${({ $size }) => $size}px;
`

const Bar = styled.span`
  width: ${({ $size }) => Math.max(3, Math.round($size / 7))}px;
  height: 100%;
  border-radius: 2px;
  background: ${({ theme }) => theme.colors.accent};
  transform-origin: bottom;
  transform: scaleY(0.25);
  animation: ${bounce} ${({ $speed }) => $speed}s ease-in-out infinite;
  animation-play-state: ${({ $active }) => ($active ? 'running' : 'paused')};
`

Equalizer.propTypes = {
  active: PropTypes.bool,
  size: PropTypes.number
}

const SPEEDS = [0.9, 0.6, 1.1, 0.75]

export default function Equalizer ({ active = false, size = 22 }) {
  return (
    <Wrap $size={size} aria-hidden='true' data-active={active}>
      {SPEEDS.map((speed, i) => <Bar key={i} $size={size} $speed={speed} $active={active} style={{ animationDelay: `${i * -0.2}s` }} />)}
    </Wrap>
  )
}
