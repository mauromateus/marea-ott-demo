import React from 'react'
import { screen, fireEvent, act } from '@testing-library/react'
import { createStore } from 'jotai'

import InstallSheet from 'components/common/InstallSheet/InstallSheet'
import InstallPromptService from 'core/services/InstallPromptService'
import DataLayerService from 'core/services/DataLayerService'
import Storage from 'core/Storage'
import { audioStatusAtom } from 'components/context/PlayerContext/atoms/playerAtoms'
import renderWithProviders from '../../utils/renderWithProviders'

const IPHONE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'
const IPAD_UA = 'Mozilla/5.0 (iPad; CPU OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'
const MAC_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15'
const ANDROID_UA = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36'
const DISMISSED_KEY = 'marea:install-sheet-dismissed-at'
const INSTALLED_KEY = 'marea:install-sheet-installed'
const DAY = 24 * 60 * 60 * 1000

const setDevice = ({ ua, platform, touch = 5, standalone = false }) => {
  jest.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue(ua)
  jest.spyOn(window.navigator, 'platform', 'get').mockReturnValue(platform)
  Object.defineProperty(window.navigator, 'maxTouchPoints', { value: touch, configurable: true })
  Object.defineProperty(window.navigator, 'standalone', { value: standalone, configurable: true })
}

const fireBeforeInstallPrompt = (outcome = 'accepted') => {
  const event = new Event('beforeinstallprompt', { cancelable: true })
  event.prompt = jest.fn(() => Promise.resolve())
  event.userChoice = Promise.resolve({ outcome })
  act(() => { window.dispatchEvent(event) })
  return event
}

const elapse = (ms) => act(() => { jest.advanceTimersByTime(ms) })
const getSheet = () => screen.queryByRole('dialog')
const sheetEvents = () => (window.dataLayer || []).filter((e) => /install_sheet/.test(e.event))

// Chromium on Android: a real beforeinstallprompt, then wait for the 4 s timer.
const renderChromium = (options = {}) => {
  setDevice({ ua: ANDROID_UA, platform: 'Linux armv8l' })
  const utils = renderWithProviders(<InstallSheet />, { withAudio: false, ...options })
  fireBeforeInstallPrompt()
  return utils
}

beforeEach(() => {
  jest.useFakeTimers()
  window.localStorage.clear()
  delete window.dataLayer
  DataLayerService.clearRecentEvents()
  InstallPromptService.reset()
  window.matchMedia = () => ({ matches: false, addListener () {}, removeListener () {} })
})

afterEach(() => {
  InstallPromptService.reset()
  jest.useRealTimers()
  jest.restoreAllMocks()
  delete window.navigator.maxTouchPoints
  delete window.navigator.standalone
})

describe('InstallSheet timing', () => {
  it('appears 4 seconds after load and not before', () => {
    renderChromium()
    expect(getSheet()).not.toBeInTheDocument()
    elapse(3999)
    expect(getSheet()).not.toBeInTheDocument()
    elapse(1)
    expect(getSheet()).toBeInTheDocument()
  })

  it('appears on the first scroll, before the timer', () => {
    renderChromium()
    elapse(1000)
    expect(getSheet()).not.toBeInTheDocument()
    act(() => { window.dispatchEvent(new Event('scroll')) })
    expect(getSheet()).toBeInTheDocument()
  })

  it('waits for the browser to offer the prompt, even after the timer', () => {
    setDevice({ ua: ANDROID_UA, platform: 'Linux armv8l' })
    renderWithProviders(<InstallSheet />, { withAudio: false })
    elapse(5000)
    expect(getSheet()).not.toBeInTheDocument()
    fireBeforeInstallPrompt()
    expect(getSheet()).toBeInTheDocument()
  })

  it('stops listening for scroll and clears the timer on unmount', () => {
    const { unmount } = renderChromium()
    unmount()
    expect(() => {
      act(() => { window.dispatchEvent(new Event('scroll')) })
      elapse(5000)
    }).not.toThrow()
  })
})

describe('InstallSheet Chromium variant', () => {
  const open = () => { const utils = renderChromium(); elapse(4000); return utils }

  it('is a non-modal dialog with an accessible name, title, one line and the two actions', () => {
    open()
    const dialog = screen.getByRole('dialog', { name: 'Instalar Marea' })
    expect(dialog).not.toHaveAttribute('aria-modal', 'true')
    expect(screen.getByRole('heading', { name: 'Instala Marea' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Instalar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ahora no' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cerrar' })).toBeInTheDocument()
    expect(screen.queryByTestId('install-sheet-steps')).not.toBeInTheDocument()
    expect(screen.queryByTestId('install-sheet-arrow')).not.toBeInTheDocument()
  })

  it('prompts on Instalar and hides for good after the user accepts', async () => {
    const first = open()
    const event = fireBeforeInstallPrompt('accepted')
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Instalar' })) })
    expect(event.prompt).toHaveBeenCalledTimes(1)
    expect(getSheet()).not.toBeInTheDocument()
    expect(Storage.getItem(INSTALLED_KEY)).toBe(true)
    first.unmount()

    // A real browser does not offer the install again while the app is installed.
    InstallPromptService.reset()
    renderWithProviders(<InstallSheet />, { withAudio: false })
    elapse(4000)
    expect(getSheet()).not.toBeInTheDocument()
    expect(Storage.getItem(INSTALLED_KEY)).toBe(true)
  })

  it('does not remember a dismissed browser prompt as a dismissal of the sheet', async () => {
    open()
    fireBeforeInstallPrompt('dismissed')
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Instalar' })) })
    expect(Storage.getItem(DISMISSED_KEY)).toBeNull()
    expect(Storage.getItem(INSTALLED_KEY)).toBeNull()
  })

  it('hides for good after appinstalled (install from the browser menu)', () => {
    open()
    act(() => { window.dispatchEvent(new Event('appinstalled')) })
    expect(getSheet()).not.toBeInTheDocument()
    expect(Storage.getItem(INSTALLED_KEY)).toBe(true)
  })
})

describe('InstallSheet after an uninstall', () => {
  it('forgets a stale "installed" mark when the browser offers the install again', () => {
    Storage.setItem(INSTALLED_KEY, true)
    renderChromium()
    elapse(4000)
    expect(getSheet()).toBeInTheDocument()
    expect(Storage.getItem(INSTALLED_KEY)).toBeNull()
  })

  it('still honours a recent dismissal when it clears the stale mark', () => {
    Storage.setItem(INSTALLED_KEY, true)
    Storage.setItem(DISMISSED_KEY, Date.now())
    renderChromium()
    elapse(4000)
    expect(getSheet()).not.toBeInTheDocument()
    expect(Storage.getItem(INSTALLED_KEY)).toBeNull()
  })

  it('keeps the mark while the browser does not offer the install (app still installed)', () => {
    Storage.setItem(INSTALLED_KEY, true)
    setDevice({ ua: ANDROID_UA, platform: 'Linux armv8l' })
    renderWithProviders(<InstallSheet />, { withAudio: false })
    elapse(5000)
    expect(getSheet()).not.toBeInTheDocument()
    expect(Storage.getItem(INSTALLED_KEY)).toBe(true)
  })
})

describe('InstallSheet dismissal', () => {
  it.each(['Ahora no', 'Cerrar'])('"%s" hides it and stores a timestamp through the Storage wrapper', (name) => {
    renderChromium()
    elapse(4000)
    const before = Date.now()
    fireEvent.click(screen.getByRole('button', { name }))
    expect(getSheet()).not.toBeInTheDocument()
    expect(Storage.getItem(DISMISSED_KEY)).toBe(before)
  })

  it('stays away for 7 days and comes back after that', () => {
    Storage.setItem(DISMISSED_KEY, Date.now() - 6 * DAY)
    const first = renderChromium()
    elapse(4000)
    expect(getSheet()).not.toBeInTheDocument()
    first.unmount()

    InstallPromptService.reset()
    Storage.setItem(DISMISSED_KEY, Date.now() - 8 * DAY)
    renderChromium()
    elapse(4000)
    expect(getSheet()).toBeInTheDocument()
  })

  it('ignores a corrupt or future timestamp', () => {
    Storage.setItem(DISMISSED_KEY, Date.now() + 30 * DAY)
    renderChromium()
    elapse(4000)
    expect(getSheet()).toBeInTheDocument()
  })
})

describe('InstallSheet gating', () => {
  it.each(['android', 'pwa-web', 'ios', 'lg-tv'])('never shows when the resolved platform is %s', (platform) => {
    renderChromium({ platform })
    elapse(5000)
    expect(getSheet()).not.toBeInTheDocument()
  })

  it.each(['/install', '/debug'])('never shows on %s', (route) => {
    renderChromium({ route })
    elapse(5000)
    expect(getSheet()).not.toBeInTheDocument()
  })

  it('shows on other routes', () => {
    renderChromium({ route: '/tv' })
    elapse(4000)
    expect(getSheet()).toBeInTheDocument()
  })

  it('never shows iOS instructions in a standalone Home Screen app', () => {
    setDevice({ ua: IPHONE_UA, platform: 'iPhone', standalone: true })
    renderWithProviders(<InstallSheet />, { withAudio: false })
    elapse(5000)
    expect(getSheet()).not.toBeInTheDocument()
  })

  it('never shows iOS instructions when the platform is not web', () => {
    setDevice({ ua: IPHONE_UA, platform: 'iPhone' })
    renderWithProviders(<InstallSheet />, { platform: 'pwa-web', withAudio: false })
    elapse(5000)
    expect(getSheet()).not.toBeInTheDocument()
  })
})

describe('InstallSheet iOS variant', () => {
  const openIos = (device) => {
    setDevice(device)
    renderWithProviders(<InstallSheet />, { withAudio: false })
    elapse(4000)
  }

  it('shows two short steps with a share icon and a bouncing arrow on iPhone', () => {
    openIos({ ua: IPHONE_UA, platform: 'iPhone' })
    expect(screen.getByRole('dialog', { name: 'Instalar Marea' })).toBeInTheDocument()
    const steps = screen.getByTestId('install-sheet-steps')
    expect(steps.querySelectorAll('li')).toHaveLength(2)
    expect(steps).toHaveTextContent('Toca Compartir')
    expect(steps).toHaveTextContent('Elige Agregar a pantalla de inicio')
    expect(steps.querySelector('svg')).toBeInTheDocument()
    expect(screen.getByTestId('install-sheet-arrow')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Instalar' })).not.toBeInTheDocument()
  })

  it('has no arrow on iPad (the share button is at the top there)', () => {
    openIos({ ua: IPAD_UA, platform: 'iPad' })
    expect(screen.getByTestId('install-sheet-steps')).toBeInTheDocument()
    expect(screen.queryByTestId('install-sheet-arrow')).not.toBeInTheDocument()
  })

  it('treats the desktop-class iPadOS user agent as an iPad', () => {
    openIos({ ua: MAC_UA, platform: 'MacIntel', touch: 5 })
    expect(screen.getByTestId('install-sheet-steps')).toBeInTheDocument()
    expect(screen.queryByTestId('install-sheet-arrow')).not.toBeInTheDocument()
  })

  it('does not show on a Mac without touch, even after the timer', () => {
    openIos({ ua: MAC_UA, platform: 'MacIntel', touch: 0 })
    expect(getSheet()).not.toBeInTheDocument()
  })

  it('can be dismissed and remembers it', () => {
    openIos({ ua: IPHONE_UA, platform: 'iPhone' })
    fireEvent.click(screen.getByRole('button', { name: 'Ahora no' }))
    expect(getSheet()).not.toBeInTheDocument()
    expect(typeof Storage.getItem(DISMISSED_KEY)).toBe('number')
  })
})

describe('InstallSheet analytics', () => {
  it('sends ms_event_install_sheet_shown once, with the resolver platform and the variant', () => {
    renderChromium({ platform: 'web' })
    elapse(4000)
    elapse(4000)
    expect(sheetEvents()).toEqual([{ event: 'ms_event_install_sheet_shown', ms_install_variant: 'chromium', ms_platform_origin: 'web' }])
  })

  it('sends ms_event_install_sheet_dismissed on dismissal', () => {
    renderChromium()
    elapse(4000)
    fireEvent.click(screen.getByRole('button', { name: 'Ahora no' }))
    expect(sheetEvents().map((e) => e.event)).toEqual(['ms_event_install_sheet_shown', 'ms_event_install_sheet_dismissed'])
    expect(sheetEvents()[1]).toMatchObject({ ms_install_variant: 'chromium', ms_platform_origin: 'web' })
  })

  it('sends nothing when the sheet is gated', () => {
    renderChromium({ route: '/install' })
    elapse(5000)
    expect(sheetEvents()).toEqual([])
  })
})

describe('InstallSheet and the mini player', () => {
  it('sits at the bottom when no mini player is visible', () => {
    renderChromium()
    elapse(4000)
    expect(getSheet()).toHaveAttribute('data-above-mini-player', 'false')
  })

  it('sits above the mini player while audio is active', () => {
    const store = createStore()
    store.set(audioStatusAtom, 'playing')
    renderChromium({ store, withAudio: true })
    elapse(4000)
    expect(getSheet()).toHaveAttribute('data-above-mini-player', 'true')
  })

  it('does not reserve the space on /radio, where the mini player is hidden', () => {
    const store = createStore()
    store.set(audioStatusAtom, 'playing')
    renderChromium({ store, route: '/radio', withAudio: true })
    elapse(4000)
    expect(getSheet()).toHaveAttribute('data-above-mini-player', 'false')
  })
})
