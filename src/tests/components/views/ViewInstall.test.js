import React from 'react'
import { screen, fireEvent, waitFor, act } from '@testing-library/react'

import ViewInstall from 'components/views/ViewInstall'
import InstallPromptService from 'core/services/InstallPromptService'
import renderWithProviders, { config } from '../../utils/renderWithProviders'

const withApk = (apkUrl) => ({ ...config, install: { apkUrl } })

beforeEach(() => {
  InstallPromptService.reset()
  window.matchMedia = () => ({ matches: false, addListener () {}, removeListener () {} })
})

afterEach(() => {
  InstallPromptService.reset()
  jest.restoreAllMocks()
})

describe('ViewInstall (/install)', () => {
  it('shows the heading, a QR tile for the site URL and the per-platform steps', () => {
    const { container } = renderWithProviders(<ViewInstall />, { withAudio: false })
    expect(screen.getByRole('heading', { level: 1, name: /install marea/i })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /qr code/i })).toBeInTheDocument()
    expect(container.querySelector('svg path')).toBeInTheDocument()
    expect(screen.getByText(`${window.location.origin}/`)).toBeInTheDocument()
    const sections = ['Android (Chrome)', 'iPhone and iPad (Safari)', 'Desktop (Chrome or Edge)']
    sections.forEach((name) => expect(screen.getByRole('heading', { level: 2, name })).toBeInTheDocument())
    expect(container.querySelectorAll('ol')).toHaveLength(3)
  })

  it('reports that it is not running as an app in a plain browser tab', () => {
    renderWithProviders(<ViewInstall />, { withAudio: false })
    expect(screen.getByRole('status', { name: /install status/i })).toHaveTextContent(/not running as an installed app/i)
  })

  it('says "Already installed" when standalone', () => {
    window.matchMedia = (query) => ({ matches: query === '(display-mode: standalone)', addListener () {}, removeListener () {} })
    renderWithProviders(<ViewInstall />, { platform: 'pwa-web', withAudio: false })
    expect(screen.getByRole('status', { name: /install status/i })).toHaveTextContent(/already installed/i)
  })

  it('shows the Install app button only when the browser offers it on the web platform', () => {
    renderWithProviders(<ViewInstall />, { withAudio: false })
    expect(screen.queryByRole('button', { name: /install app/i })).not.toBeInTheDocument()
    const event = new Event('beforeinstallprompt', { cancelable: true })
    event.prompt = jest.fn(() => Promise.resolve())
    event.userChoice = Promise.resolve({ outcome: 'dismissed' })
    act(() => { window.dispatchEvent(event) })
    expect(screen.getByRole('button', { name: /install app/i })).toBeInTheDocument()
  })

  it('hides the whole Android app section when install.apkUrl is empty', () => {
    renderWithProviders(<ViewInstall />, { withAudio: false })
    expect(screen.queryByRole('heading', { name: /android app/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /download/i })).not.toBeInTheDocument()
  })

  it('shows a download link when install.apkUrl is set', () => {
    renderWithProviders(<ViewInstall />, { config: withApk('https://example.com/marea.apk'), withAudio: false })
    expect(screen.getByRole('heading', { level: 2, name: /android app/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /download android app/i })).toHaveAttribute('href', 'https://example.com/marea.apk')
  })

  it('copies the link with the clipboard API', async () => {
    const writeText = jest.fn(() => Promise.resolve())
    Object.assign(navigator, { clipboard: { writeText } })
    renderWithProviders(<ViewInstall />, { withAudio: false })
    fireEvent.click(screen.getByRole('button', { name: /copy link/i }))
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/`))
    expect(await screen.findByText(/link copied/i)).toBeInTheDocument()
  })

  it('selects the link when the clipboard is unavailable', async () => {
    Object.assign(navigator, { clipboard: { writeText: () => Promise.reject(new Error('denied')) } })
    document.execCommand = jest.fn(() => false)
    renderWithProviders(<ViewInstall />, { withAudio: false })
    fireEvent.click(screen.getByRole('button', { name: /copy link/i }))
    expect(await screen.findByText(/clipboard unavailable/i)).toBeInTheDocument()
    expect(window.getSelection().toString()).toContain(window.location.origin)
  })
})
