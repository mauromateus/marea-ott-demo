import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Provider, createStore } from 'jotai'

import App from 'App'
import DataLayerService from 'core/services/DataLayerService'
import { resetPlatformOrigin, initPlatformOrigin } from 'core/Utils/getPlatformOrigin'
import loadPlayerWithAdapter from 'core/services/Player'
import marea from '../../../public/config/marea.json'

jest.mock('core/services/Player')

const renderApp = (route = '/', { debug = false } = {}) => {
  const store = createStore()
  window.matchMedia = () => ({ matches: false, addListener () {}, removeListener () {} })
  window.sessionStorage.clear()
  if (debug) window.sessionStorage.setItem('ms_debug', '1')
  window.history.pushState({}, '', '/?ms_platform=lg-tv')
  resetPlatformOrigin()
  const platformDetails = initPlatformOrigin()
  const utils = render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>
        <App config={marea} platformDetails={platformDetails} />
      </MemoryRouter>
    </Provider>
  )
  return { ...utils, store }
}

beforeEach(() => {
  delete window.dataLayer
  DataLayerService.clearRecentEvents()
  loadPlayerWithAdapter.mockImplementation(() => Promise.resolve({
    strategy: { destroy: jest.fn() },
    player: { play: jest.fn(), pause: jest.fn() }
  }))
})

afterEach(() => jest.clearAllMocks())

describe('App routes', () => {
  it('home shows both live cards, the sample rails and the example note', async () => {
    renderApp('/')
    expect(await screen.findByRole('heading', { name: 'Marea TV' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Marea Radio' })).toBeInTheDocument()
    expect(screen.getAllByText('EN VIVO').length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText(/contenido de ejemplo/i)).toBeInTheDocument()
    marea.rails.forEach((rail) => expect(screen.getByRole('heading', { name: rail.title })).toBeInTheDocument())
  })

  it('renders every rail card inside a swiper wrapper (slides must be plain SwiperSlide children)', async () => {
    const { container } = renderApp('/')
    await screen.findByRole('heading', { name: 'Marea TV' })
    const total = marea.rails.reduce((sum, rail) => sum + rail.items.length, 0)
    expect(container.querySelectorAll('.swiper-wrapper .swiper-slide')).toHaveLength(total)
  })

  it('/tv mounts the live video player', async () => {
    const { container } = renderApp('/tv')
    await waitFor(() => expect(loadPlayerWithAdapter).toHaveBeenCalled())
    expect(container.querySelector('#marea-video-player')).toBeInTheDocument()
    expect(loadPlayerWithAdapter.mock.calls[0][1]).toMatchObject({ id: marea.players.video.id, npaw: { name: 'marea-lg-tv' } })
  })

  it('/radio shows the radio panel and starts audio on play', async () => {
    renderApp('/radio')
    fireEvent.click(await screen.findByRole('button', { name: /reproducir marea radio/i }))
    await waitFor(() => expect(loadPlayerWithAdapter).toHaveBeenCalledTimes(1))
    expect(loadPlayerWithAdapter.mock.calls[0][1]).toMatchObject({ id: marea.players.audio.id })
  })

  it('/debug shows the diagnostics and the copy button', async () => {
    renderApp('/debug', { debug: true })
    expect(await screen.findByRole('heading', { name: 'Diagnóstico' })).toBeInTheDocument()
    // Shown in the diagnostics grid and again in the install state panel.
    expect(screen.getAllByText('Plataforma resuelta')).toHaveLength(2)
    expect(screen.getByRole('button', { name: /copiar informe/i })).toBeInTheDocument()
    expect(screen.getByLabelText('Informe en texto plano').textContent).toContain('Plataforma resuelta: lg-tv (query)')
    expect(screen.getByLabelText('Informe en texto plano').textContent).toContain('appName de analítica: marea-lg-tv')
  })

  it('/debug redirects home when debug mode is off', async () => {
    renderApp('/debug')
    expect(await screen.findByRole('heading', { name: 'Marea TV' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Diagnóstico' })).not.toBeInTheDocument()
  })

  it('/debug?debug=1 turns debug mode on and shows the diagnostics', async () => {
    renderApp('/debug?debug=1')
    expect(await screen.findByRole('heading', { name: 'Diagnóstico' })).toBeInTheDocument()
    expect(window.sessionStorage.getItem('ms_debug')).toBe('1')
  })

  it('unknown routes redirect home', async () => {
    renderApp('/nope')
    expect(await screen.findByRole('heading', { name: 'Marea TV' })).toBeInTheDocument()
  })

  it('pushes a page_view with the resolver platform on every route change', async () => {
    renderApp('/')
    await screen.findByRole('heading', { name: 'Marea TV' })
    fireEvent.click(screen.getAllByRole('link', { name: 'Radio' })[0])
    await waitFor(() => expect(window.dataLayer.filter((e) => e.event === 'ms_event_page_view')).toHaveLength(2))
    const views = window.dataLayer.filter((e) => e.event === 'ms_event_page_view')
    expect(views.map((e) => e.page)).toEqual(['/', '/radio'])
    expect(views.every((e) => e.ms_platform_origin === 'lg-tv')).toBe(true)
  })

  it('the footer links to /install and, by default, not to /debug', async () => {
    renderApp('/')
    await screen.findByRole('heading', { name: 'Marea TV' })
    expect(screen.queryByRole('link', { name: 'Diagnóstico' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Instalar' })).toHaveAttribute('href', '/install')
  })

  it('nothing in the UI links to /debug while debug mode is off', async () => {
    const { container } = renderApp('/')
    await screen.findByRole('heading', { name: 'Marea TV' })
    expect(container.querySelector('a[href="/debug"]')).toBeNull()
  })

  it('/?debug=1 adds the footer link to /debug', async () => {
    renderApp('/?debug=1')
    await screen.findByRole('heading', { name: 'Marea TV' })
    expect(screen.getByRole('link', { name: 'Diagnóstico' })).toHaveAttribute('href', '/debug')
  })

  it('/install lazy-loads the install page with its QR code', async () => {
    renderApp('/install')
    expect(await screen.findByRole('heading', { level: 1, name: /instala marea/i })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /código qr/i })).toBeInTheDocument()
  })
})

describe('Debug copy report', () => {
  it('copies the report with the clipboard API', async () => {
    const writeText = jest.fn(() => Promise.resolve())
    Object.assign(navigator, { clipboard: { writeText } })
    renderApp('/debug', { debug: true })
    fireEvent.click(await screen.findByRole('button', { name: /copiar informe/i }))
    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1))
    expect(writeText.mock.calls[0][0]).toContain('Plataforma resuelta: lg-tv')
    expect(await screen.findByText(/informe copiado/i)).toBeInTheDocument()
  })

  it('selects the text when the clipboard is unavailable', async () => {
    Object.assign(navigator, { clipboard: { writeText: () => Promise.reject(new Error('denied')) } })
    document.execCommand = jest.fn(() => false)
    renderApp('/debug', { debug: true })
    fireEvent.click(await screen.findByRole('button', { name: /copiar informe/i }))
    expect(await screen.findByText(/portapapeles no disponible/i)).toBeInTheDocument()
    expect(window.getSelection().toString()).toContain('Plataforma resuelta')
  })
})
