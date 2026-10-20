import React from 'react'
import styled from 'styled-components'
import { Helmet } from 'react-helmet'

import { useAppContext } from 'components/context/AppContext/AppContext'
import LiveCard from 'components/content/LiveCard/LiveCard'
import Rail from 'components/content/Rail/Rail'
import ExampleNote from 'components/common/ExampleNote/ExampleNote'
import { translate } from 'core/Translation'

const Page = styled.div`
  display: flex;
  flex-direction: column;
  gap: 40px;
`

const Intro = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  h1 { font-size: clamp(1.8rem, 4.5vw, 2.8rem); }
  p { color: ${({ theme }) => theme.colors.textMuted}; }
`

const Live = styled.div`
  display: grid;
  gap: 20px;
  grid-template-columns: minmax(0, 1fr);

  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    grid-template-columns: minmax(0, 1.7fr) minmax(0, 1fr);
  }
`

const Rails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 28px;
`

export default function ViewHome () {
  const { config } = useAppContext()
  const { brand, players, rails } = config
  const hasSample = rails.some((rail) => rail.sample)

  return (
    <Page>
      <Helmet><title>{translate('home.pageTitle')}</title></Helmet>
      <Intro>
        <h1>{brand.name}</h1>
        <p>{brand.tagline}</p>
      </Intro>

      <Live role='region' aria-label={translate('home.liveNow')}>
        <LiveCard kind='video' large title={players.video.title} description={players.video.description} to='/tv' />
        <LiveCard kind='audio' large title={players.audio.title} description={players.audio.description} to='/radio' />
      </Live>

      <Rails>
        {hasSample && <ExampleNote />}
        {rails.map((rail) => <Rail key={rail.id} rail={rail} />)}
      </Rails>
    </Page>
  )
}
