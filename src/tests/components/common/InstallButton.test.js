import React from 'react'
import { screen, fireEvent, act, waitFor } from '@testing-library/react'

import Header from 'components/common/Header/Header'
import InstallButton from 'components/common/InstallButton/InstallButton'
import InstallPromptService from 'core/services/InstallPromptService'
import DataLayerService from 'core/services/DataLayerService'
import renderWithProviders from '../../utils/renderWithProviders'

const fireBeforeInstallPrompt = (outcome = 'accepted') => {
  const event = new Event('beforeinstallprompt', { cancelable: true })
  event.prompt = jest.fn(() => Promise.resolve())
  event.userChoice = Promise.resolve({ outcome })
  act(() => { window.dispatchEvent(event) })
  return event
}

beforeEach(() => {
  delete window.dataLayer
  DataLayerService.clearRecentEvents()
  InstallPromptService.reset()
})

afterEach(() => InstallPromptService.reset())

describe('Install app button in the Header', () => {
  it('is hidden until the browser offers an install prompt', () => {
    renderWithProviders(<Header brandName='Marea' />, { withAudio: false })
    expect(screen.queryByRole('button', { name: /install app/i })).not.toBeInTheDocument()
  })

  it('appears on the web platform once beforeinstallprompt fires', () => {
    renderWithProviders(<Header brandName='Marea' />, { withAudio: false })
    fireBeforeInstallPrompt()
    expect(screen.getByRole('button', { name: /install app/i })).toBeInTheDocument()
  })

  it.each(['android', 'pwa-web', 'ios', 'lg-tv'])('stays hidden when the resolved platform is %s', (platform) => {
    renderWithProviders(<Header brandName='Marea' />, { platform, withAudio: false })
    fireBeforeInstallPrompt()
    expect(screen.queryByRole('button', { name: /install app/i })).not.toBeInTheDocument()
  })

  it('prompts on click and hides after the user accepts', async () => {
    renderWithProviders(<Header brandName='Marea' />, { withAudio: false })
    const event = fireBeforeInstallPrompt('accepted')
    fireEvent.click(screen.getByRole('button', { name: /install app/i }))
    await waitFor(() => expect(screen.queryByRole('button', { name: /install app/i })).not.toBeInTheDocument())
    expect(event.prompt).toHaveBeenCalledTimes(1)
  })

  it('hides after appinstalled', () => {
    renderWithProviders(<Header brandName='Marea' />, { withAudio: false })
    fireBeforeInstallPrompt()
    act(() => { window.dispatchEvent(new Event('appinstalled')) })
    expect(screen.queryByRole('button', { name: /install app/i })).not.toBeInTheDocument()
  })
})

describe('InstallButton (full size)', () => {
  it('renders the same behavior outside the header', () => {
    renderWithProviders(<InstallButton />, { withAudio: false })
    expect(screen.queryByRole('button', { name: /install app/i })).not.toBeInTheDocument()
    fireBeforeInstallPrompt()
    expect(screen.getByRole('button', { name: /install app/i })).toBeInTheDocument()
  })
})
