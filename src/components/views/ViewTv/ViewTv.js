import React from 'react'
import styled from 'styled-components'
import { Helmet } from 'react-helmet'

import { useAppContext } from 'components/context/AppContext/AppContext'
import VideoPlayer from 'components/content/VideoPlayer/VideoPlayer'
import LiveBadge from 'components/common/LiveBadge/LiveBadge'

const Page = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 1040px;
  margin: 0 auto;
`

const Heading = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;

  h1 { font-size: clamp(1.6rem, 4vw, 2.4rem); }
  p { color: ${({ theme }) => theme.colors.textMuted}; }
`

export default function ViewTv () {
  const { config } = useAppContext()
  const { title, description } = config.players.video

  return (
    <Page>
      <Helmet><title>{title}</title></Helmet>
      <VideoPlayer />
      <Heading>
        <LiveBadge />
        <h1>{title}</h1>
        <p>{description}</p>
      </Heading>
    </Page>
  )
}
