import React, { Suspense, lazy } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { Redirect, Route, Switch } from 'react-router-dom'
import { Helmet } from 'react-helmet'

import ThemeContextProvider from 'components/context/ThemeContext/ThemeContext'
import AppContextProvider from 'components/context/AppContext/AppContext'
import GTMProvider from 'components/context/GoogleTagManager/GoogleTagManager'
import AudioPlayerProvider from 'components/context/PlayerContext/AudioPlayerProvider'
import Header from 'components/common/Header/Header'
import Footer from 'components/common/Footer/Footer'
import UpdateToast from 'components/common/UpdateToast/UpdateToast'
import MiniPlayer from 'components/content/MiniPlayer/MiniPlayer'

const ViewHome = lazy(() => import('components/views/ViewHome'))
const ViewTv = lazy(() => import('components/views/ViewTv'))
const ViewRadio = lazy(() => import('components/views/ViewRadio'))
const ViewDebug = lazy(() => import('components/views/ViewDebug'))

const Shell = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`

const Main = styled.main`
  flex: 1;
  width: 100%;
  max-width: ${({ theme }) => theme.layout.maxWidth};
  margin: 0 auto;
  padding: 28px ${({ theme }) => theme.layout.gutter} 120px;
`

const Loading = styled.p`
  padding: 48px 0;
  text-align: center;
  color: ${({ theme }) => theme.colors.textMuted};
`

App.propTypes = {
  config: PropTypes.object.isRequired,
  platformDetails: PropTypes.object.isRequired
}

// The router (BrowserRouter in index.js, MemoryRouter in tests) and jotai store are provided by the caller.
export default function App ({ config, platformDetails }) {
  return (
    <ThemeContextProvider brand={config.brand}>
      <AppContextProvider config={config} platformDetails={platformDetails}>
        <GTMProvider>
          <AudioPlayerProvider>
            <Helmet defaultTitle={config.brand.name} titleTemplate={`%s · ${config.brand.name}`} />
            <Shell>
              <Header brandName={config.brand.name} />
              <Main>
                <Suspense fallback={<Loading role='status'>Loading...</Loading>}>
                  <Switch>
                    <Route exact path='/' component={ViewHome} />
                    <Route path='/tv' component={ViewTv} />
                    <Route path='/radio' component={ViewRadio} />
                    <Route path='/debug' component={ViewDebug} />
                    <Redirect to='/' />
                  </Switch>
                </Suspense>
              </Main>
              <Footer brandName={config.brand.name} version={config.app.version} />
            </Shell>
            <MiniPlayer />
            <UpdateToast />
          </AudioPlayerProvider>
        </GTMProvider>
      </AppContextProvider>
    </ThemeContextProvider>
  )
}
