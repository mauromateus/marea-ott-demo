import React from 'react'
import { screen, fireEvent, act } from '@testing-library/react'

import InstallSheet from 'components/common/InstallSheet/InstallSheet'
import InstallPromptService from 'core/services/InstallPromptService'
import DataLayerService from 'core/services/DataLayerService'
import Session from 'core/Session'
import Storage from 'core/Storage'
import renderWithProviders, { config, withReappear } from '../../utils/renderWithProviders'

const IPHONE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1'
const ANDROID_UA = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36'
const DISMISSED_KEY = 'marea:install-sheet-dismissed-at'
const COUNT_KEY = 'marea:install-sheet-dismiss-count'
const SESSION_KEY = 'marea:install-sheet-dismissed-session'
const INSTALLED_KEY = 'marea:install-sheet-installed'
const DAY = 24 * 60 * 60 * 1000

const setDevice = ({ ua, platform }) => {
  jest.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue(ua)
  jest.spyOn(window.navigator, 'platform', 'get').mockReturnValue(platform)
  Object.defineProperty(window.navigator, 'maxTouchPoints', { value: 5, configurable: true })
  Object.defineProperty(window.navigator, 'standalone', { value: false, configurable: true })
}

const fireBeforeInstallPrompt = () => {
  const event = new Event('beforeinstallprompt', { cancelable: true })
  event.prompt = jest.fn(() => Promise.resolve())
  event.userChoice = Promise.resolve({ outcome: 'dismissed' })
  act(() => { window.dispatchEvent(event) })
}

const elapse = (ms) => act(() => { jest.advanceTimersByTime(ms) })
const getSheet = () => screen.queryByRole('dialog')
const close = (name = 'Ahora no') => fireEvent.click(screen.getByRole('button', { name }))
const dismissedEvents = () => (window.dataLayer || []).filter((e) => e.event === 'ms_event_install_sheet_dismissed')

// A fresh page load: new component tree, the browser offers the install again, the 4 s timer runs.
const loadPage = (reappear) => {
  InstallPromptService.reset()
  setDevice({ ua: ANDROID_UA, platform: 'Linux armv8l' })
  const utils = renderWithProviders(<InstallSheet />, { withAudio: false, config: reappear === undefined ? config : withReappear(reappear) })
  fireBeforeInstallPrompt()
  elapse(4000)
  return utils
}

// Closes the sheet and leaves the page, as a reload would.
const closeAndLeave = (utils) => {
  close()
  utils.unmount()
}

beforeEach(() => {
  jest.useFakeTimers()
  window.localStorage.clear()
  window.sessionStorage.clear()
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

describe('the demo config', () => {
  it('asks for every load explicitly and keeps the apk url', () => {
    expect(config.install.sheet).toEqual({ reappear: 'everyLoad' })
    expect(config.install.apkUrl).toBe('')
  })
})

describe('reappear: everyLoad', () => {
  it('shows on every load: close, reload, it is back', () => {
    closeAndLeave(loadPage('everyLoad'))
    const second = loadPage('everyLoad')
    expect(getSheet()).toBeInTheDocument()
    closeAndLeave(second)
    loadPage('everyLoad')
    expect(getSheet()).toBeInTheDocument()
  })

  it('stays closed for the rest of the page view', () => {
    loadPage('everyLoad')
    close('Cerrar')
    expect(getSheet()).not.toBeInTheDocument()
    act(() => { window.dispatchEvent(new Event('scroll')) })
    elapse(60000)
    fireBeforeInstallPrompt()
    expect(getSheet()).not.toBeInTheDocument()
  })

  it('stores nothing, in either storage', () => {
    loadPage('everyLoad')
    close()
    expect(window.localStorage.length).toBe(0)
    expect(window.sessionStorage.length).toBe(0)
  })

  it('ignores a snooze timestamp left by an earlier version', () => {
    Storage.setItem(DISMISSED_KEY, Date.now() - 1000)
    loadPage('everyLoad')
    expect(getSheet()).toBeInTheDocument()
  })

  it('ignores a leftover session flag and count', () => {
    Session.setItem(SESSION_KEY, true)
    Storage.setItem(COUNT_KEY, 3)
    loadPage('everyLoad')
    expect(getSheet()).toBeInTheDocument()
  })

  it('still hides for good after an accepted install', () => {
    Storage.setItem(INSTALLED_KEY, true)
    setDevice({ ua: ANDROID_UA, platform: 'Linux armv8l' })
    renderWithProviders(<InstallSheet />, { withAudio: false, config: withReappear('everyLoad') })
    elapse(5000)
    expect(getSheet()).not.toBeInTheDocument()
  })

  it('clears a stale installed mark and shows, even with an old snooze stored', () => {
    Storage.setItem(INSTALLED_KEY, true)
    Storage.setItem(DISMISSED_KEY, Date.now() - 1000)
    loadPage('everyLoad')
    expect(getSheet()).toBeInTheDocument()
    expect(Storage.getItem(INSTALLED_KEY)).toBeNull()
  })

  it('shows again when the browser re-offers the install after an uninstall in the same page view', () => {
    setDevice({ ua: ANDROID_UA, platform: 'Linux armv8l' })
    renderWithProviders(<InstallSheet />, { withAudio: false, config: withReappear('everyLoad') })
    elapse(4000)
    act(() => { window.dispatchEvent(new Event('appinstalled')) })
    expect(getSheet()).not.toBeInTheDocument()
    fireBeforeInstallPrompt()
    expect(Storage.getItem(INSTALLED_KEY)).toBeNull()
    expect(getSheet()).toBeInTheDocument()
  })

  it('keeps a close of this page view when the stale mark is healed later', () => {
    loadPage('everyLoad')
    close()
    act(() => { window.dispatchEvent(new Event('appinstalled')) })
    fireBeforeInstallPrompt()
    expect(Storage.getItem(INSTALLED_KEY)).toBeNull()
    expect(getSheet()).not.toBeInTheDocument()
  })

  it('is what the unmodified demo config does', () => {
    closeAndLeave(loadPage())
    loadPage()
    expect(getSheet()).toBeInTheDocument()
  })
})

describe('reappear: session', () => {
  it('stays hidden after a reload in the same tab session', () => {
    closeAndLeave(loadPage('session'))
    loadPage('session')
    expect(getSheet()).not.toBeInTheDocument()
  })

  it('comes back when the session storage is cleared (a new tab or browser session)', () => {
    closeAndLeave(loadPage('session'))
    window.sessionStorage.clear()
    loadPage('session')
    expect(getSheet()).toBeInTheDocument()
  })

  it('uses the Session wrapper and never touches localStorage', () => {
    loadPage('session')
    close()
    expect(Session.getItem(SESSION_KEY)).toBe(true)
    expect(window.localStorage.length).toBe(0)
  })

  it('ignores a snooze timestamp left by an earlier version', () => {
    Storage.setItem(DISMISSED_KEY, Date.now() - 1000)
    loadPage('session')
    expect(getSheet()).toBeInTheDocument()
  })

  it('keeps a session close when the stale installed mark is cleared', () => {
    Storage.setItem(INSTALLED_KEY, true)
    Session.setItem(SESSION_KEY, true)
    loadPage('session')
    expect(getSheet()).not.toBeInTheDocument()
    expect(Storage.getItem(INSTALLED_KEY)).toBeNull()
  })

  it('does not read a corrupt session value as a close', () => {
    window.sessionStorage.setItem(SESSION_KEY, 'maybe')
    loadPage('session')
    expect(getSheet()).toBeInTheDocument()
  })
})

describe('reappear: days:N', () => {
  it('stores a timestamp and stays hidden for N days, then shows', () => {
    closeAndLeave(loadPage('days:3'))
    expect(typeof Storage.getItem(DISMISSED_KEY)).toBe('number')
    expect(window.sessionStorage.length).toBe(0)

    jest.setSystemTime(Date.now() + 3 * DAY - 1000)
    const second = loadPage('days:3')
    expect(getSheet()).not.toBeInTheDocument()
    second.unmount()

    jest.setSystemTime(Date.now() + 2000)
    loadPage('days:3')
    expect(getSheet()).toBeInTheDocument()
  })

  it('survives clearing the session storage', () => {
    closeAndLeave(loadPage('days:3'))
    window.sessionStorage.clear()
    loadPage('days:3')
    expect(getSheet()).not.toBeInTheDocument()
  })

  it('uses N from the config', () => {
    Storage.setItem(DISMISSED_KEY, Date.now() - 2 * DAY)
    const first = loadPage('days:1')
    expect(getSheet()).toBeInTheDocument()
    first.unmount()
    loadPage('days:7')
    expect(getSheet()).not.toBeInTheDocument()
  })

  it('ignores a future timestamp', () => {
    Storage.setItem(DISMISSED_KEY, Date.now() + 30 * DAY)
    loadPage('days:3')
    expect(getSheet()).toBeInTheDocument()
  })

  it('keeps a recent close when the stale installed mark is cleared', () => {
    Storage.setItem(INSTALLED_KEY, true)
    Storage.setItem(DISMISSED_KEY, Date.now())
    loadPage('days:3')
    expect(getSheet()).not.toBeInTheDocument()
    expect(Storage.getItem(INSTALLED_KEY)).toBeNull()
  })
})

describe('reappear: progressive', () => {
  const closeNumber = (n) => {
    const utils = loadPage('progressive')
    expect(getSheet()).toBeInTheDocument()
    closeAndLeave(utils)
    expect(Storage.getItem(COUNT_KEY)).toBe(n)
  }

  it('step 1: the first close hides it for the session only', () => {
    closeNumber(1)
    expect(Storage.getItem(DISMISSED_KEY)).toBeNull()
    expect(Session.getItem(SESSION_KEY)).toBe(true)

    loadPage('progressive')
    expect(getSheet()).not.toBeInTheDocument()

    window.sessionStorage.clear()
    loadPage('progressive')
    expect(getSheet()).toBeInTheDocument()
  })

  it('step 2: the second close hides it for 3 days', () => {
    closeNumber(1)
    window.sessionStorage.clear()
    closeNumber(2)
    expect(typeof Storage.getItem(DISMISSED_KEY)).toBe('number')

    window.sessionStorage.clear()
    jest.setSystemTime(Date.now() + 3 * DAY - 1000)
    const early = loadPage('progressive')
    expect(getSheet()).not.toBeInTheDocument()
    early.unmount()

    jest.setSystemTime(Date.now() + 2000)
    loadPage('progressive')
    expect(getSheet()).toBeInTheDocument()
  })

  it('step 3: the third close hides it for 14 days', () => {
    closeNumber(1)
    window.sessionStorage.clear()
    closeNumber(2)
    jest.setSystemTime(Date.now() + 3 * DAY + 1000)
    closeNumber(3)

    jest.setSystemTime(Date.now() + 14 * DAY - 1000)
    const early = loadPage('progressive')
    expect(getSheet()).not.toBeInTheDocument()
    early.unmount()

    jest.setSystemTime(Date.now() + 2000)
    loadPage('progressive')
    expect(getSheet()).toBeInTheDocument()
  })

  it('step 4 and beyond: stays at 14 days and keeps counting', () => {
    Storage.setItem(COUNT_KEY, 3)
    Storage.setItem(DISMISSED_KEY, Date.now() - 15 * DAY)
    closeNumber(4)

    jest.setSystemTime(Date.now() + 13 * DAY)
    const early = loadPage('progressive')
    expect(getSheet()).not.toBeInTheDocument()
    early.unmount()

    jest.setSystemTime(Date.now() + 2 * DAY)
    loadPage('progressive')
    expect(getSheet()).toBeInTheDocument()
  })

  it('ignores a 7 day snooze left by an earlier version', () => {
    Storage.setItem(DISMISSED_KEY, Date.now() - 1000)
    loadPage('progressive')
    expect(getSheet()).toBeInTheDocument()
  })

  it('treats a corrupt count as no earlier close', () => {
    window.localStorage.setItem(COUNT_KEY, 'lots')
    const utils = loadPage('progressive')
    expect(getSheet()).toBeInTheDocument()
    closeAndLeave(utils)
    expect(Storage.getItem(COUNT_KEY)).toBe(1)
  })
})

describe('an invalid or missing reappear value falls back to session', () => {
  it.each([
    ['weekly'], ['days:0'], ['days:-2'], ['days:abc'], [''], [42]
  ])('%j', (reappear) => {
    closeAndLeave(loadPage(reappear))
    loadPage(reappear)
    expect(getSheet()).not.toBeInTheDocument()
    window.sessionStorage.clear()
    loadPage(reappear)
    expect(getSheet()).toBeInTheDocument()
  })

  it.each([
    ['no install.sheet block', { ...config, install: { apkUrl: '' } }],
    ['no install block', { ...config, install: undefined }]
  ])('%s', (_, appConfig) => {
    const load = () => {
      InstallPromptService.reset()
      setDevice({ ua: ANDROID_UA, platform: 'Linux armv8l' })
      const utils = renderWithProviders(<InstallSheet />, { withAudio: false, config: appConfig })
      fireBeforeInstallPrompt()
      elapse(4000)
      return utils
    }
    closeAndLeave(load())
    load()
    expect(getSheet()).not.toBeInTheDocument()
  })

  it('ignores a legacy 7 day snooze, like session does', () => {
    Storage.setItem(DISMISSED_KEY, Date.now() - 1000)
    loadPage('days:0')
    expect(getSheet()).toBeInTheDocument()
  })
})

describe('iOS variant under a policy', () => {
  const loadIos = (reappear) => {
    setDevice({ ua: IPHONE_UA, platform: 'iPhone' })
    const utils = renderWithProviders(<InstallSheet />, { withAudio: false, config: withReappear(reappear) })
    elapse(4000)
    return utils
  }

  it('everyLoad: closing hides it only until the next load', () => {
    const first = loadIos('everyLoad')
    close()
    expect(getSheet()).not.toBeInTheDocument()
    first.unmount()
    loadIos('everyLoad')
    expect(getSheet()).toBeInTheDocument()
  })

  it('days:3: closing stores the timestamp', () => {
    loadIos('days:3')
    close()
    expect(typeof Storage.getItem(DISMISSED_KEY)).toBe('number')
  })
})

describe('ms_install_reappear on the dismissed event', () => {
  it.each([
    ['everyLoad', 'everyLoad'],
    ['session', 'session'],
    ['days:3', 'days'],
    ['progressive', 'progressive'],
    ['nonsense', 'session']
  ])('config %j sends %j', (reappear, mode) => {
    loadPage(reappear)
    close()
    expect(dismissedEvents()).toEqual([
      { event: 'ms_event_install_sheet_dismissed', ms_install_variant: 'chromium', ms_install_reappear: mode, ms_platform_origin: 'web' }
    ])
  })

  it('is sent by the X button as well', () => {
    loadPage('everyLoad')
    close('Cerrar')
    expect(dismissedEvents()[0]).toMatchObject({ ms_install_reappear: 'everyLoad' })
  })

  it('does not change the shown event', () => {
    loadPage('days:3')
    const shown = (window.dataLayer || []).filter((e) => e.event === 'ms_event_install_sheet_shown')
    expect(shown).toEqual([{ event: 'ms_event_install_sheet_shown', ms_install_variant: 'chromium', ms_platform_origin: 'web' }])
  })
})
