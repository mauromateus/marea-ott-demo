import React from 'react'
import { screen, act, within } from '@testing-library/react'

import ViewDebug from 'components/views/ViewDebug'
import formatReport from 'components/views/ViewDebug/utils/formatReport'
import InstallPromptService from 'core/services/InstallPromptService'
import Session from 'core/Session'
import Storage from 'core/Storage'
import { PLATFORM_SESSION_KEY, initPlatformOrigin, resetPlatformOrigin } from 'core/Utils/getPlatformOrigin'
import { INSTALL_SHEET_DISMISSED_KEY, INSTALL_SHEET_INSTALLED_KEY } from 'components/common/InstallSheet/hooks/useInstallSheet'
import { SNOOZE_MS } from 'components/common/InstallSheet/utils/isSnoozed'
import renderWithProviders from '../../utils/renderWithProviders'

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
})

afterEach(() => {
  InstallPromptService.reset()
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

  it('shows a stored platform other than web and says the card is hidden for it', () => {
    Session.setItem(PLATFORM_SESSION_KEY, 'android')
    renderDebug({ platform: 'android' })
    expect(valueOf('Plataforma resuelta')).toHaveTextContent('android')
    expect(valueOf('Plataforma guardada en esta pestaña')).toHaveTextContent('android')
    expect(valueOf('Tarjeta de instalación')).toHaveTextContent('Oculta: la plataforma no es web')
  })

  it('shows a stored web platform', () => {
    Session.setItem(PLATFORM_SESSION_KEY, 'web')
    renderDebug()
    expect(valueOf('Plataforma guardada en esta pestaña')).toHaveTextContent('web')
  })

  it('after a stale android value heals on load the panel reports web and nothing stored', () => {
    Session.setItem(PLATFORM_SESSION_KEY, 'android')
    resetPlatformOrigin()
    const { platform } = initPlatformOrigin()
    renderDebug({ platform })
    expect(valueOf('Plataforma resuelta')).toHaveTextContent('web')
    expect(valueOf('Plataforma guardada en esta pestaña')).toHaveTextContent('ninguna')
    expect(valueOf('Tarjeta de instalación')).toHaveTextContent('Sin oferta del navegador')
  })

  it('has no reset button and no reset hint', () => {
    Session.setItem(PLATFORM_SESSION_KEY, 'android')
    renderDebug({ platform: 'android' })
    expect(screen.queryByRole('button', { name: /restablecer/i })).not.toBeInTheDocument()
    expect(within(panel()).queryByText(/restablezcas/)).not.toBeInTheDocument()
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
    expect(text).not.toContain('restablezcas')
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
