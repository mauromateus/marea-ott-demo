import React from 'react'
import { screen, fireEvent, waitFor, act, within } from '@testing-library/react'

import ViewInstall from 'components/views/ViewInstall'
import InstallPromptService from 'core/services/InstallPromptService'
import renderWithProviders, { config } from '../../utils/renderWithProviders'

const IPHONE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'
const ANDROID_UA = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36'

const withApk = (apkUrl) => ({ ...config, install: { apkUrl } })

// phone: viewport under 768px. touch: the primary pointer is a finger. standalone: display-mode standalone.
const setViewport = ({ phone = false, touch = false, standalone = false } = {}) => {
  window.matchMedia = (query) => ({
    matches: (/max-width: 767px/.test(query) && phone) || (/pointer: coarse/.test(query) && touch) || (/display-mode: standalone/.test(query) && standalone),
    addListener () {},
    removeListener () {},
    addEventListener () {},
    removeEventListener () {}
  })
}

const setDevice = ({ ua, platform, touch = 5 }) => {
  jest.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue(ua)
  jest.spyOn(window.navigator, 'platform', 'get').mockReturnValue(platform)
  Object.defineProperty(window.navigator, 'maxTouchPoints', { value: touch, configurable: true })
}

const offerInstallPrompt = () => {
  const event = new Event('beforeinstallprompt', { cancelable: true })
  event.prompt = jest.fn(() => Promise.resolve())
  event.userChoice = Promise.resolve({ outcome: 'dismissed' })
  act(() => { window.dispatchEvent(event) })
}

const wordCount = (text) => text.trim().split(/\s+/).length
const renderView = (options = {}) => renderWithProviders(<ViewInstall />, { withAudio: false, ...options })

beforeEach(() => {
  InstallPromptService.reset()
  setViewport()
})

afterEach(() => {
  InstallPromptService.reset()
  jest.restoreAllMocks()
  delete window.navigator.maxTouchPoints
})

describe('ViewInstall header', () => {
  it('has a short title, a one-line lead of at most 12 words and a status chip', () => {
    renderView()
    expect(screen.getByRole('heading', { level: 1, name: 'Instala Marea' })).toBeInTheDocument()
    const lead = screen.getByText('Ábrela con un toque, a pantalla completa.')
    expect(wordCount(lead.textContent)).toBeLessThanOrEqual(12)
    expect(screen.getByRole('status', { name: 'Estado de la instalación' })).toHaveTextContent('Aún no está instalada')
  })

  it('says it is installed when running as an installed app', () => {
    setViewport({ standalone: true })
    renderView({ platform: 'pwa-web' })
    expect(screen.getByRole('status', { name: 'Estado de la instalación' })).toHaveTextContent('Ya está instalada')
  })

  it('says it is installed inside the Android app', () => {
    renderView({ platform: 'android' })
    expect(screen.getByRole('status', { name: 'Estado de la instalación' })).toHaveTextContent('Ya está instalada')
  })
})

describe('ViewInstall on a wide screen', () => {
  it('shows the QR tile with the link and "Copiar enlace"', () => {
    const { container } = renderView()
    expect(screen.getByRole('img', { name: 'Código QR que abre Marea' })).toBeInTheDocument()
    expect(container.querySelector('svg path')).toBeInTheDocument()
    expect(screen.getByText(`${window.location.origin}/`)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Copiar enlace' })).toBeInTheDocument()
  })

  it('shows tabs Android, iPhone and Computador with at most 3 steps each', () => {
    renderView()
    const tabs = screen.getAllByRole('tab')
    expect(tabs.map((tab) => tab.textContent)).toEqual(['Android', 'iPhone', 'Computador'])
    tabs.forEach((tab) => {
      fireEvent.click(tab)
      const steps = within(screen.getByRole('tabpanel')).getAllByRole('listitem')
      expect(steps.length).toBeGreaterThan(0)
      expect(steps.length).toBeLessThanOrEqual(3)
      steps.forEach((step) => expect(wordCount(step.textContent)).toBeLessThanOrEqual(8))
    })
  })

  it.each([
    ['a desktop browser', { ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0.0.0 Safari/537.36', platform: 'Win32', touch: 0 }, 'Computador'],
    ['Android Chrome', { ua: ANDROID_UA, platform: 'Linux armv8l' }, 'Android'],
    ['iPhone Safari', { ua: IPHONE_UA, platform: 'iPhone' }, 'iPhone']
  ])('defaults to the detected platform: %s', (_name, device, expected) => {
    setDevice(device)
    renderView()
    expect(screen.getByRole('tab', { selected: true })).toHaveTextContent(expected)
  })

  it('shows the install button next to the QR when the browser offers it', () => {
    renderView()
    expect(screen.queryByRole('button', { name: 'Instalar app' })).not.toBeInTheDocument()
    offerInstallPrompt()
    expect(screen.getByRole('button', { name: 'Instalar app' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /código qr/i })).toBeInTheDocument()
  })
})

describe('ViewInstall on a phone', () => {
  it.each([
    ['a narrow viewport', { phone: true }],
    ['a touch-primary device', { touch: true }]
  ])('hides the QR entirely on %s', (_name, viewport) => {
    setViewport(viewport)
    renderView()
    expect(screen.queryByRole('img', { name: /código qr/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Copiar enlace' })).not.toBeInTheDocument()
    expect(screen.queryByText(`${window.location.origin}/`)).not.toBeInTheDocument()
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument()
  })

  it.each([
    ['Android', { ua: ANDROID_UA, platform: 'Linux armv8l' }, ['iPhone', 'Computador'], 'Elige Instalar app.'],
    ['iPhone', { ua: IPHONE_UA, platform: 'iPhone' }, ['Android', 'Computador'], 'Toca Compartir.']
  ])('shows only the steps for the detected %s in one open accordion item', (name, device, others, step) => {
    setViewport({ phone: true })
    setDevice(device)
    const { container } = renderView()
    const buttons = screen.getAllByRole('button')
    expect(buttons.filter((button) => button.hasAttribute('aria-expanded'))).toHaveLength(1)
    const item = screen.getByRole('button', { name: name })
    expect(item).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText(step)).toBeVisible()
    others.forEach((other) => expect(screen.queryByText(other)).not.toBeInTheDocument())
    const steps = container.querySelectorAll('ol li')
    expect(steps.length).toBeLessThanOrEqual(3)
    steps.forEach((li) => expect(wordCount(li.textContent)).toBeLessThanOrEqual(8))
  })

  it('shows the desktop steps in a narrow desktop window', () => {
    setViewport({ phone: true })
    setDevice({ ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0.0.0 Safari/537.36', platform: 'Win32', touch: 0 })
    renderView()
    expect(screen.getByRole('button', { name: 'Computador' })).toHaveAttribute('aria-expanded', 'true')
  })

  it('shows the big install button instead of the steps when the browser offers it', () => {
    setViewport({ phone: true })
    setDevice({ ua: ANDROID_UA, platform: 'Linux armv8l' })
    const { container } = renderView()
    expect(container.querySelector('ol')).toBeInTheDocument()
    offerInstallPrompt()
    expect(screen.getByRole('button', { name: 'Instalar app' })).toBeInTheDocument()
    expect(container.querySelector('ol')).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Android' })).not.toBeInTheDocument()
  })
})

describe('ViewInstall Android app (APK)', () => {
  it('hides the whole section when install.apkUrl is empty', () => {
    renderView()
    expect(screen.queryByRole('heading', { name: /apk/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /descargar/i })).not.toBeInTheDocument()
  })

  it('shows a download link when install.apkUrl is set, also on a phone', () => {
    setViewport({ phone: true })
    renderView({ config: withApk('https://example.com/marea.apk') })
    expect(screen.getByRole('heading', { level: 2, name: 'App para Android (APK)' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Descargar app para Android' })).toHaveAttribute('href', 'https://example.com/marea.apk')
  })
})

describe('ViewInstall copy', () => {
  it.each([
    ['wide', {}],
    ['phone', { phone: true }],
    ['wide with APK', { apk: true }]
  ])('keeps every paragraph to one short sentence (%s)', (_name, { phone, apk }) => {
    setViewport({ phone })
    const { container } = renderView(apk ? { config: withApk('https://example.com/marea.apk') } : {})
    const paragraphs = [...container.querySelectorAll('p')]
    expect(paragraphs.length).toBeGreaterThan(0)
    paragraphs.forEach((p) => {
      expect(wordCount(p.textContent)).toBeLessThanOrEqual(12)
      expect(p.textContent.trim().replace(/[.!?]$/, '')).not.toMatch(/[.!?]\s/)
    })
  })

  it('shows no English', () => {
    const { container } = renderView({ config: withApk('https://example.com/marea.apk') })
    expect(container.textContent).not.toMatch(/\b(install|scan|copy|download|open it|steps|desktop)\b/i)
  })
})

describe('ViewInstall copy link', () => {
  it('copies the link with the clipboard API', async () => {
    const writeText = jest.fn(() => Promise.resolve())
    Object.assign(navigator, { clipboard: { writeText } })
    renderView()
    fireEvent.click(screen.getByRole('button', { name: 'Copiar enlace' }))
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(`${window.location.origin}/`))
    expect(await screen.findByText('Enlace copiado al portapapeles.')).toBeInTheDocument()
  })

  it('selects the link when the clipboard is unavailable', async () => {
    Object.assign(navigator, { clipboard: { writeText: () => Promise.reject(new Error('denied')) } })
    document.execCommand = jest.fn(() => false)
    renderView()
    fireEvent.click(screen.getByRole('button', { name: 'Copiar enlace' }))
    expect(await screen.findByText(/portapapeles no disponible/i)).toBeInTheDocument()
    expect(window.getSelection().toString()).toContain(window.location.origin)
  })
})
