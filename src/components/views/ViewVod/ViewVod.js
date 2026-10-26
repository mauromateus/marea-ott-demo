import React, { useMemo } from 'react'
import styled from 'styled-components'
import { Helmet } from 'react-helmet'
import { Redirect, useParams } from 'react-router-dom'

import { useAppContext } from 'components/context/AppContext/AppContext'
import VideoPlayer from 'components/content/VideoPlayer/VideoPlayer'
import { ButtonLink } from 'components/common/Button/Button.styles'
import { translate } from 'core/Translation'

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

  h1 { font-size: clamp(1.4rem, 3.4vw, 2.1rem); }
  p { color: ${({ theme }) => theme.colors.textMuted}; }
`

// On-demand page of a media listed in the rails of the config: /ver/<media id>.
export default function ViewVod () {
  const { id } = useParams()
  const { config } = useAppContext()
  const item = config.rails.flatMap((rail) => rail.items).find((candidate) => candidate.id === id)
  // Keeps the player's media reference stable between renders.
  const media = useMemo(() => item && { id: item.id, type: 'media', title: item.title }, [item])

  if (!item) {
    return <Redirect to='/' />
  }

  return (
    <Page>
      <Helmet><title>{item.title}</title></Helmet>
      <VideoPlayer media={media} />
      <Heading>
        <h1>{item.title}</h1>
        {item.meta && <p>{item.meta}</p>}
        <ButtonLink to='/' $variant='secondary'>{translate('vod.back')}</ButtonLink>
      </Heading>
    </Page>
  )
}
