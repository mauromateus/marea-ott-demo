import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter } from 'react-router-dom'

import App from './App'
import ConfigService from 'core/services/Config/ConfigService'
import ServiceWorkerService from 'core/services/ServiceWorkerService'
import { initPlatformOrigin } from 'core/Utils/getPlatformOrigin'
import getBasename from 'core/Utils/getBasename'
import { initLanguage, translate } from 'core/Translation'
import InstallPromptService from 'core/services/InstallPromptService'
import * as serviceWorkerRegistration from './serviceWorkerRegistration'

const root = document.getElementById('root')

async function boot () {
  // Listen before the config fetch: beforeinstallprompt can fire before the first render.
  InstallPromptService.init()
  try {
    const config = await ConfigService.getJson()
    // Sets the dictionary and <html lang> before the first render.
    initLanguage(config)
    // Once, before the first render, so every analytics event and the player see the same platform.
    const platformDetails = initPlatformOrigin({ useReferrerSignal: config.analytics.referrerSignal !== false })

    ReactDOM.render(
      <BrowserRouter basename={getBasename()}>
        <App config={config} platformDetails={platformDetails} />
      </BrowserRouter>,
      root
    )
  } catch (error) {
    root.textContent = translate('errors.boot', { name: 'Marea' })
    console.error(error)
  }
}

boot()

if (process.env.NODE_ENV === 'production') {
  serviceWorkerRegistration.register({ onUpdate: (registration) => ServiceWorkerService.setRegistration(registration) })
}
