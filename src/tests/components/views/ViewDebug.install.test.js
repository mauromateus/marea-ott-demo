import React from 'react'
import { screen, fireEvent, act, within } from '@testing-library/react'

import ViewDebug from 'components/views/ViewDebug'
import formatReport from 'components/views/ViewDebug/utils/formatReport'
import InstallPromptService from 'core/services/InstallPromptService'
import Session from 'core/Session'
import Storage from 'core/Storage'
import { PLATFORM_SESSION_KEY } from 'core/Utils/getPlatformOrigin'
import { INSTALL_SHEET_DISMISSED_KEY, INSTALL_SHEET_INSTALLED_KEY } from 'components/common/InstallSheet/hooks/useInstallSheet'
import { SNOOZE_MS } from 'components/common/InstallSheet/utils/isSnoozed'
import renderWithProviders from '../../utils/renderWithProviders'

const originalLocation = window.location

const fireBeforeInstallPrompt = () => {
  const event = new Event('beforeinstallprompt', { cancelable: true })
  event.prompt = jest.fn(() => Promise.resolve())
  event.userChoice = Promise.resolve({ outcome: 'dismissed' })
  act(() => { window.dispatchEvent(event) })
}

const renderDebug = (options = {}) => renderWithProviders(<ViewDebug />, { route: '/debug', withAudio: false, ...options })
const panel = () => screen.getByRole('region', { name: 'Estado de instalación' })
const valueOf = (label) => within(panel()).getByText(label).nextElementSibling

beforeEach(() => {
  window.localStorage.clear()
  window.sessionStorage.clear()
  InstallPromptService.reset()
  window.matchMedia = () => ({ matches: false, addListener () {}, removeListener () {} })
  // jsdom cannot reload: swap the location for a copy whose reload is a spy.
  delete window.location
  window.location = { ...originalLocation, reload: jest.fn() }
})

afterEach(() => {
  window.location = originalLocation
  InstallPromptService.reset()
  jest.useRealTimers()
})

describe('install state panel rows', () => {
  it('sits right after the diagnostics grid, before the copy button', () => {
    const { container } = renderDebug()
    const text = container.textContent
    expect(screen.getByRole('heading', { level: 2, name: 'Estado de instalación' })).toBeInTheDocument()
    expect(text.indexOf('userAgent')).toBeLessThan(text.indexOf('Estado de instalación'))
    expect(text.indexOf('Estado de instalación')).toBeLessThan(text.indexOf('Copiar informe'))
  })

  it('shows the plain default state: no offer, no stored values', () => {
    renderDebug()
    expect(valueOf('El navegador ofreció instalar')).toHaveTextContent('No')
    expect(valueOf('Plataforma resuelta')).toHaveTextContent('web')
    expect(valueOf('Plataforma guardada en esta pestaña')).toHaveTextContent('ninguna')
    expect(valueOf('Tarjeta de instalación')).toHaveTextContent('Sin oferta del navegador')
    expect(valueOf('Marca de instalada guardada')).toHaveTextContent('No')
    expect(within(panel()).queryByText(/hasta que lo restablezcas/)).not.toBeInTheDocument()
  })

  it('updates live when the browser offers the install later', () => {
    renderDebug()
    expect(valueOf('El navegador ofreció instalar')).toHaveTextContent('No')
    fireBeforeInstallPrompt()
    expect(valueOf('El navegador ofreció instalar')).toHaveTextContent('Sí')
  })

  it('says the card is available on a route where it can show', () => {
    renderDebug({ route: '/' })
    fireBeforeInstallPrompt()
    expect(valueOf('Tarjeta de instalación')).toHaveTextContent('Disponible')
  })

  it('says the card is hidden on this page even when the browser offered the install', () => {
    renderDebug()
    fireBeforeInstallPrompt()
    expect(valueOf('Tarjeta de instalación')).toHaveTextContent('Oculta en esta ruta')
  })

  it('shows the snooze with the local date and time it ends', () => {
    const dismissedAt = Date.now() - 1000
    Storage.setItem(INSTALL_SHEET_DISMISSED_KEY, dismissedAt)
    renderDebug()
    fireBeforeInstallPrompt()
    expect(valueOf('Tarjeta de instalación')).toHaveTextContent(`Pospuesta hasta ${new Date(dismissedAt + SNOOZE_MS).toLocaleString('es')}`)
  })

  it('shows the installed mark and that it hides the card', () => {
    Storage.setItem(INSTALL_SHEET_INSTALLED_KEY, true)
    renderDebug()
    expect(valueOf('Marca de instalada guardada')).toHaveTextContent('Sí')
    expect(valueOf('Tarjeta de instalación')).toHaveTextContent('Oculta: marcada como instalada')
  })

  it('shows a stored platform other than web with a hint and hides the card for it', () => {
    Session.setItem(PLATFORM_SESSION_KEY, 'android')
    renderDebug({ platform: 'android' })
    expect(valueOf('Plataforma resuelta')).toHaveTextContent('android')
    expect(valueOf('Plataforma guardada en esta pestaña')).toHaveTextContent('android')
    expect(valueOf('Tarjeta de instalación')).toHaveTextContent('Oculta: la plataforma no es web')
    expect(within(panel()).getByText('Este valor oculta la instalación en esta pestaña hasta que lo restablezcas.')).toBeInTheDocument()
  })

  it('shows no hint for a stored web platform', () => {
    Session.setItem(PLATFORM_SESSION_KEY, 'web')
    renderDebug()
    expect(valueOf('Plataforma guardada en esta pestaña')).toHaveTextContent('web')
    expect(within(panel()).queryByText(/hasta que lo restablezcas/)).not.toBeInTheDocument()
  })

  it('shows no hint for a stored value the resolver ignores', () => {
    Session.setItem(PLATFORM_SESSION_KEY, 'toaster')
    renderDebug()
    expect(valueOf('Plataforma guardada en esta pestaña')).toHaveTextContent('toaster')
    expect(within(panel()).queryByText(/hasta que lo restablezcas/)).not.toBeInTheDocument()
  })
})

describe('reset button', () => {
  const seed = () => {
    Session.setItem(PLATFORM_SESSION_KEY, 'android')
    Session.setItem('unrelated-session', 'keep')
    Storage.setItem(INSTALL_SHEET_DISMISSED_KEY, Date.now())
    Storage.setItem(INSTALL_SHEET_INSTALLED_KEY, true)
    Storage.setItem('marea:unrelated', 'keep')
  }
  const press = () => fireEvent.click(screen.getByRole('button', { name: 'Restablecer estado de instalación' }))

  it('clears exactly the platform, the dismissal and the installed mark', () => {
    jest.useFakeTimers()
    seed()
    renderDebug()
    press()
    expect(window.sessionStorage.getItem(PLATFORM_SESSION_KEY)).toBeNull()
    expect(window.localStorage.getItem(INSTALL_SHEET_DISMISSED_KEY)).toBeNull()
    expect(window.localStorage.getItem(INSTALL_SHEET_INSTALLED_KEY)).toBeNull()
    expect(window.sessionStorage.getItem('unrelated-session')).toBe('keep')
    expect(window.localStorage.getItem('marea:unrelated')).toBe('keep')
    expect(window.localStorage.length).toBe(1)
    expect(window.sessionStorage.length).toBe(1)
  })

  it('confirms with a status message and reloads once after a short delay', () => {
    jest.useFakeTimers()
    seed()
    renderDebug()
    press()
    expect(within(panel()).getByRole('status')).toHaveTextContent('Estado restablecido. Recargando…')
    expect(window.location.reload).not.toHaveBeenCalled()
    act(() => { jest.advanceTimersByTime(5000) })
    expect(window.location.reload).toHaveBeenCalledTimes(1)
  })

  it('cannot be pressed twice while it reloads', () => {
    jest.useFakeTimers()
    renderDebug()
    press()
    expect(screen.getByRole('button', { name: 'Restablecer estado de instalación' })).toBeDisabled()
    press()
    act(() => { jest.advanceTimersByTime(5000) })
    expect(window.location.reload).toHaveBeenCalledTimes(1)
  })

  it('does not reload if the page is left before the delay ends', () => {
    jest.useFakeTimers()
    const { unmount } = renderDebug()
    press()
    unmount()
    act(() => { jest.advanceTimersByTime(5000) })
    expect(window.location.reload).not.toHaveBeenCalled()
  })

  it('works when nothing was stored', () => {
    jest.useFakeTimers()
    renderDebug()
    press()
    act(() => { jest.advanceTimersByTime(5000) })
    expect(window.location.reload).toHaveBeenCalledTimes(1)
  })
})

describe('copy report', () => {
  const reportText = () => screen.getByLabelText('Informe en texto plano').textContent

  it('includes the install state rows in Spanish', () => {
    Storage.setItem(INSTALL_SHEET_INSTALLED_KEY, true)
    Session.setItem(PLATFORM_SESSION_KEY, 'android')
    renderDebug({ platform: 'android' })
    const text = reportText()
    expect(text).toContain('Estado de instalación')
    expect(text).toContain('El navegador ofreció instalar: No')
    expect(text).toContain('Plataforma resuelta: android')
    expect(text).toContain('Plataforma guardada en esta pestaña: android')
    expect(text).toContain('Este valor oculta la instalación en esta pestaña hasta que lo restablezcas.')
    expect(text).toContain('Tarjeta de instalación: Oculta: la plataforma no es web')
    expect(text).toContain('Marca de instalada guardada: Sí')
  })

  it('keeps the events section after the install rows', () => {
    renderDebug()
    const text = reportText()
    expect(text.indexOf('Estado de instalación')).toBeLessThan(text.indexOf('Eventos de dataLayer'))
  })

  it('formatReport leaves the section out when no install rows are given', () => {
    const d = { platform: 'web', platformSource: 'default', userAgent: 'UA', online: true, generatedAt: '2025-01-01T00:00:00.000Z' }
    expect(formatReport(d, [])).not.toContain('Estado de instalación')
    expect(formatReport(d, [], 'Marea', [{ id: 'x', label: 'Fila', value: 'Valor' }])).toContain('Fila: Valor')
  })
})
