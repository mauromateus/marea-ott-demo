import InstallPromptService from 'core/services/InstallPromptService'
import DataLayerService from 'core/services/DataLayerService'
import { resetPlatformOrigin } from 'core/Utils/getPlatformOrigin'

const makePromptEvent = (outcome = 'accepted') => {
  const event = new Event('beforeinstallprompt', { cancelable: true })
  event.prompt = jest.fn(() => Promise.resolve())
  event.userChoice = Promise.resolve({ outcome, platform: 'web' })
  return event
}

const setPlatform = (platform) => {
  window.sessionStorage.clear()
  window.history.pushState({}, '', platform ? `/?ms_platform=${platform}` : '/')
  resetPlatformOrigin()
}

const installEvents = () => (window.dataLayer || []).filter((e) => e.event.startsWith('ms_event_install') || e.event === 'ms_event_app_installed')

beforeEach(() => {
  delete window.dataLayer
  DataLayerService.clearRecentEvents()
  InstallPromptService.reset()
  InstallPromptService.init()
  setPlatform(null)
})

afterEach(() => {
  InstallPromptService.reset()
  setPlatform(null)
})

describe('InstallPromptService', () => {
  it('captures beforeinstallprompt, prevents the mini-infobar and keeps the event', () => {
    const event = makePromptEvent()
    expect(InstallPromptService.canInstall()).toBe(false)
    window.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)
    expect(InstallPromptService.canInstall()).toBe(true)
  })

  it('init is idempotent (one capture per event)', () => {
    InstallPromptService.init()
    InstallPromptService.init()
    window.dispatchEvent(makePromptEvent())
    expect(installEvents().filter((e) => e.event === 'ms_event_install_prompt_shown')).toHaveLength(1)
  })

  it('pushes ms_event_install_prompt_shown with the resolver platform when the button becomes available', () => {
    window.dispatchEvent(makePromptEvent())
    expect(installEvents()).toEqual([{ event: 'ms_event_install_prompt_shown', ms_platform_origin: 'web' }])
  })

  it('does not report "shown" when the resolved platform is not web (button stays hidden)', () => {
    setPlatform('android')
    window.dispatchEvent(makePromptEvent())
    expect(installEvents()).toEqual([])
  })

  it('promptInstall calls prompt(), reads userChoice, reports accepted and hides', async () => {
    const event = makePromptEvent('accepted')
    window.dispatchEvent(event)
    const outcome = await InstallPromptService.promptInstall()
    expect(event.prompt).toHaveBeenCalledTimes(1)
    expect(outcome).toBe('accepted')
    expect(InstallPromptService.canInstall()).toBe(false)
    expect(installEvents()).toContainEqual({ event: 'ms_event_install_choice', ms_install_outcome: 'accepted', ms_platform_origin: 'web' })
  })

  it('reports dismissed and hides (a deferred prompt can only be used once)', async () => {
    window.dispatchEvent(makePromptEvent('dismissed'))
    expect(await InstallPromptService.promptInstall()).toBe('dismissed')
    expect(InstallPromptService.canInstall()).toBe(false)
    expect(installEvents()).toContainEqual({ event: 'ms_event_install_choice', ms_install_outcome: 'dismissed', ms_platform_origin: 'web' })
  })

  it('a second click while the prompt is open does not call prompt() again', async () => {
    const event = makePromptEvent()
    window.dispatchEvent(event)
    const first = InstallPromptService.promptInstall()
    const second = await InstallPromptService.promptInstall()
    await first
    expect(second).toBeNull()
    expect(event.prompt).toHaveBeenCalledTimes(1)
  })

  it('returns null without an event', async () => {
    expect(await InstallPromptService.promptInstall()).toBeNull()
  })

  it('returns null and hides when prompt() throws', async () => {
    const event = makePromptEvent()
    event.prompt = jest.fn(() => { throw new Error('InvalidStateError') })
    window.dispatchEvent(event)
    expect(await InstallPromptService.promptInstall()).toBeNull()
    expect(InstallPromptService.canInstall()).toBe(false)
  })

  it('appinstalled hides the button and pushes ms_event_app_installed', () => {
    window.dispatchEvent(makePromptEvent())
    window.dispatchEvent(new Event('appinstalled'))
    expect(InstallPromptService.canInstall()).toBe(false)
    expect(installEvents()).toContainEqual({ event: 'ms_event_app_installed', ms_platform_origin: 'web' })
  })

  it('notifies subscribers on every state change and stops after unsubscribe', () => {
    const listener = jest.fn()
    const unsubscribe = InstallPromptService.subscribe(listener)
    window.dispatchEvent(makePromptEvent())
    window.dispatchEvent(new Event('appinstalled'))
    expect(listener).toHaveBeenCalledTimes(2)
    unsubscribe()
    window.dispatchEvent(makePromptEvent())
    expect(listener).toHaveBeenCalledTimes(2)
  })
})
