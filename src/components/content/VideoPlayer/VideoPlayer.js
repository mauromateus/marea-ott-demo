import React from 'react'
import styled from 'styled-components'

import { Button } from 'components/common/Button/Button.styles'
import useLiveVideoPlayer from './hooks/useLiveVideoPlayer'

// padding-top keeps 16:9 on browsers without the aspect-ratio property (older TV browsers).
const Frame = styled.div`
  position: relative;
  width: 100%;
  height: 0;
  padding-top: 56.25%;
  overflow: hidden;
  border-radius: ${({ theme }) => theme.radii.lg};
  background: #05080f;
  box-shadow: ${({ theme }) => theme.shadows.card};
`

const Mount = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 16px;
  text-align: center;
  color: ${({ theme }) => theme.colors.textMuted};
  pointer-events: none;

  button { pointer-events: auto; }
`

export default function VideoPlayer () {
  const { status, retry, containerId } = useLiveVideoPlayer()

  return (
    <Frame>
      <Mount id={containerId} />
      {status === 'loading' && <Overlay role='status'>Loading live signal...</Overlay>}
      {status === 'evicted' && (
        <Overlay role='status'>
          <span>The radio is using the player.</span>
          <Button type='button' onClick={retry}>Resume TV</Button>
        </Overlay>
      )}
      {status === 'error' && (
        <Overlay role='alert'>
          <span>The player could not be loaded. Check your connection.</span>
          <Button type='button' onClick={retry}>Try again</Button>
        </Overlay>
      )}
    </Frame>
  )
}
