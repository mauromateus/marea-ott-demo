import React from 'react'
import { screen, waitFor } from '@testing-library/react'

import ViewDebug from 'components/views/ViewDebug'
import formatReport from 'components/views/ViewDebug/utils/formatReport'
import buildVersionRows from 'components/views/ViewDebug/utils/buildVersionRows'
import queryWorkerVersion from 'core/services/ServiceWorker/queryWorkerVersion'
import renderWithProviders from '../../utils/renderWithProviders'

jest.mock('core/services/ServiceWorker/queryWorkerVersion', () => ({
  __esModule: true,
  default: jest.fn(),
  NO_WORKER: { status: 'none', version: null, waiting: false }
}))

const RUNNING = 'main.aaaa1111.js'
const WORKER = 'main.bbbb2222.js'

const setServiceWorker = (value) => Object.defineProperty(window.navigator, 'serviceWorker', { value, configurable: true })
const removeServiceWorker = () => { delete window.navigator.serviceWorker }
const renderDebug = () => renderWithProviders(<ViewDebug />, { route: '/debug', withAudio: false })
const valueOf = (label) => screen.getByText(label).nextElementSibling
const reportText = () => screen.getByLabelText('Informe en texto plano').textContent

beforeEach(() => {
  window.localStorage.clear()
  window.sessionStorage.clear()
  window.matchMedia = () => ({ matches: false, addListener () {}, removeListener () {} })
  const script = document.createElement('script')
  script.setAttribute('src', `/marea-ott-demo/static/js/${RUNNING}`)
  document.head.appendChild(script)
  setServiceWorker({ addEventListener: jest.fn(), removeEventListener: jest.fn() })
})

afterEach(() => {
  document.head.querySelectorAll('script[src]').forEach((script) => script.remove())
  removeServiceWorker()
})

describe('version rows on the diagnostics page', () => {
  it('shows the running bundle, the active worker bundle and a pending update', async () => {
    queryWorkerVersion.mockResolvedValue({ status: 'answered', version: WORKER, waiting: true })
    renderDebug()
    expect(valueOf('Versión en ejecución')).toHaveTextContent(RUNNING)
    await waitFor(() => expect(valueOf('Versión del service worker activo')).toHaveTextContent(WORKER))
    expect(valueOf('Service worker en espera')).toHaveTextContent('Sí')
  })

  it('says it is checking until the worker answers', async () => {
    queryWorkerVersion.mockReturnValue(new Promise(() => {}))
    renderDebug()
    expect(valueOf('Versión del service worker activo')).toHaveTextContent('consultando…')
    expect(valueOf('Service worker en espera')).toHaveTextContent('consultando…')
  })

  it('says "sin respuesta" when the active worker does not answer', async () => {
    queryWorkerVersion.mockResolvedValue({ status: 'unanswered', version: null, waiting: false })
    renderDebug()
    await waitFor(() => expect(valueOf('Versión del service worker activo')).toHaveTextContent('sin respuesta'))
    expect(valueOf('Service worker en espera')).toHaveTextContent('No')
  })

  it('says "sin service worker" without asking when the browser has no support', () => {
    removeServiceWorker()
    renderDebug()
    expect(valueOf('Versión del service worker activo')).toHaveTextContent('sin service worker')
    expect(valueOf('Service worker en espera')).toHaveTextContent('No')
    expect(queryWorkerVersion).not.toHaveBeenCalled()
  })

  it('says "sin service worker" when nothing is registered', async () => {
    queryWorkerVersion.mockResolvedValue({ status: 'none', version: null, waiting: false })
    renderDebug()
    await waitFor(() => expect(valueOf('Versión del service worker activo')).toHaveTextContent('sin service worker'))
  })

  it('shows the placeholder for the running version when no main bundle is found', () => {
    document.head.querySelectorAll('script[src]').forEach((script) => script.remove())
    queryWorkerVersion.mockReturnValue(new Promise(() => {}))
    renderDebug()
    expect(valueOf('Versión en ejecución')).toHaveTextContent('(ninguno)')
  })

  it('puts the rows right after the service worker control row', () => {
    queryWorkerVersion.mockReturnValue(new Promise(() => {}))
    const { container } = renderDebug()
    const text = container.textContent
    expect(text.indexOf('El service worker controla la página')).toBeLessThan(text.indexOf('Versión en ejecución'))
    expect(text.indexOf('Service worker en espera')).toBeLessThan(text.indexOf('En línea'))
  })
})

describe('version rows in the copy report', () => {
  it('lists the three lines after the service worker control line', async () => {
    queryWorkerVersion.mockResolvedValue({ status: 'answered', version: WORKER, waiting: true })
    renderDebug()
    await waitFor(() => expect(reportText()).toContain(`Versión del service worker activo: ${WORKER}`))
    const text = reportText()
    expect(text).toContain(`Versión en ejecución: ${RUNNING}`)
    expect(text).toContain('Service worker en espera: Sí')
    expect(text.indexOf('El service worker controla la página')).toBeLessThan(text.indexOf('Versión en ejecución'))
    expect(text.indexOf('Service worker en espera')).toBeLessThan(text.indexOf('En línea'))
  })

  it('formatReport leaves the lines out when no version rows are given', () => {
    const d = { platform: 'web', platformSource: 'default', userAgent: 'UA', online: true, generatedAt: '2025-01-01T00:00:00.000Z' }
    expect(formatReport(d, [])).not.toContain('Versión en ejecución')
    expect(formatReport(d, [], 'Marea', [], [{ id: 'x', label: 'Fila', value: 'Valor' }])).toContain('Fila: Valor')
  })
})

describe('buildVersionRows', () => {
  it('maps every worker state to Spanish values', () => {
    const values = (worker) => buildVersionRows({ running: RUNNING, worker }).map(({ value }) => value)
    expect(values({ status: 'answered', version: WORKER, waiting: false })).toEqual([RUNNING, WORKER, 'No'])
    expect(values({ status: 'unanswered', version: null, waiting: true })).toEqual([RUNNING, 'sin respuesta', 'Sí'])
    expect(values({ status: 'none', version: null, waiting: false })).toEqual([RUNNING, 'sin service worker', 'No'])
    expect(values(null)).toEqual([RUNNING, 'consultando…', 'consultando…'])
  })

  it('falls back to the empty placeholder without a running bundle', () => {
    expect(buildVersionRows({ running: null, worker: null })[0].value).toBe('(ninguno)')
  })
})
