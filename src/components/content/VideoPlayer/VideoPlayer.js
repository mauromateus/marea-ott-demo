import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import { Button } from 'components/common/Button/Button.styles'
import { translate } from 'core/Translation'
import useVideoPlayer from './hooks/useVideoPlayer'

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

VideoPlayer.propTypes = {
  // Omit it to play the live TV signal of the config.
  media: PropTypes.shape({ id: PropTypes.string.isRequired, type: PropTypes.string, title: PropTypes.string })
}

export default function VideoPlayer ({ media }) {
  const { status, retry, isLive, containerId } = useVideoPlayer({ media })

  return (
    <Frame>
      <Mount id={containerId} />
      {status === 'loading' && <Overlay role='status'>{translate(isLive ? 'player.loadingLive' : 'player.loadingVod')}</Overlay>}
      {status === 'evicted' && (
        <Overlay role='status'>
          <span>{translate('player.evicted')}</span>
          <Button type='button' onClick={retry}>{translate(isLive ? 'player.resumeTv' : 'player.resumeVod')}</Button>
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
