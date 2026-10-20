import React from 'react'
import styled from 'styled-components'

import { Button } from 'components/common/Button/Button.styles'
import { translate } from 'core/Translation'
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
      {status === 'loading' && <Overlay role='status'>{translate('player.loadingLive')}</Overlay>}
      {status === 'evicted' && (
        <Overlay role='status'>
          <span>{translate('player.evicted')}</span>
          <Button type='button' onClick={retry}>{translate('player.resumeTv')}</Button>
        </Overlay>
      )}
      {status === 'error' && (
        <Overlay role='alert'>
          <span>{translate('errors.playerLoad')}</span>
          <Button type='button' onClick={retry}>{translate('errors.retry')}</Button>
        </Overlay>
      )}
    </Frame>
  )
}
