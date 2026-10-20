import React from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Provider, createStore } from 'jotai'

import ThemeContextProvider from 'components/context/ThemeContext/ThemeContext'
import AppContextProvider from 'components/context/AppContext/AppContext'
import GTMProvider from 'components/context/GoogleTagManager/GoogleTagManager'
import AudioPlayerProvider from 'components/context/PlayerContext/AudioPlayerProvider'
import marea from '../../../public/config/marea.json'

export const config = marea

export default function renderWithProviders (ui, { route = '/', platform = 'web', store = createStore(), withAudio = true, config: appConfig = config } = {}) {
  const content = withAudio ? <AudioPlayerProvider>{ui}</AudioPlayerProvider> : ui

  const result = render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>
        <ThemeContextProvider brand={appConfig.brand}>
          <AppContextProvider config={appConfig} platformDetails={{ platform, source: 'test' }}>
            <GTMProvider>{content}</GTMProvider>
          </AppContextProvider>
        </ThemeContextProvider>
      </MemoryRouter>
    </Provider>
  )

  return { ...result, store }
}
