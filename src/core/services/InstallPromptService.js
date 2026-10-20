import getPlatformOrigin from 'core/Utils/getPlatformOrigin'
import { canShowInstallUi } from 'core/Utils/detectInstallContext'
import { trackInstallPromptShown, trackInstallChoice, trackAppInstalled } from 'components/context/GoogleTagManager/utils/trackInstall'

// Singleton: beforeinstallprompt can fire before React mounts and several components need the same event.
class InstallPromptService {
  constructor () {
    this.deferredEvent = null
    this.listeners = new Set()
    this.attached = false
    this.onBeforeInstallPrompt = this.onBeforeInstallPrompt.bind(this)
    this.onAppInstalled = this.onAppInstalled.bind(this)
  }

  /** Idempotent. Call as early as possible at boot. */
  init () {
    if (this.attached || typeof window === 'undefined') {
      return
    }
    window.addEventListener('beforeinstallprompt', this.onBeforeInstallPrompt)
    window.addEventListener('appinstalled', this.onAppInstalled)
    this.attached = true
  }

  onBeforeInstallPrompt (event) {
    // Stops Chrome's own mini-infobar; our button triggers the prompt instead.
    event.preventDefault()
    this.deferredEvent = event
    // Only report what the user can actually see: the button is hidden outside the browser platform.
    if (canShowInstallUi(getPlatformOrigin())) {
      trackInstallPromptShown()
    }
    this.notify()
  }

  onAppInstalled () {
    this.deferredEvent = null
    trackAppInstalled()
    this.notify()
  }

  canInstall () {
    return !!this.deferredEvent
  }

  /** @returns {Promise<'accepted'|'dismissed'|null>} null when there was nothing to prompt or the prompt failed */
  async promptInstall () {
    const event = this.deferredEvent
    if (!event) {
      return null
    }
    // A deferred prompt can be used once: drop it now so a second click cannot call prompt() again.
    this.deferredEvent = null
    this.notify()

    try {
      event.prompt()
      const choice = await event.userChoice
      const outcome = choice && choice.outcome
      if (outcome !== 'accepted' && outcome !== 'dismissed') {
        return null
      }
      trackInstallChoice(outcome)
      return outcome
    } catch (e) {
      return null
    }
  }

  subscribe (listener) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  notify () {
    this.listeners.forEach((listener) => listener())
  }

  /** Test helper: forget the event and detach the window listeners. */
  reset () {
    if (this.attached) {
      window.removeEventListener('beforeinstallprompt', this.onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', this.onAppInstalled)
    }
    this.attached = false
    this.deferredEvent = null
    this.listeners.clear()
  }
}

export default new InstallPromptService()
