import DataLayerService from 'core/services/DataLayerService'
import getPlatformOrigin from 'core/Utils/getPlatformOrigin'
import EVENTS from '../config/constants'

const push = (eventName, params = {}) => {
  DataLayerService.pushEvent({ eventName, params: { ...params, ms_platform_origin: getPlatformOrigin() } })
}

export const trackInstallPromptShown = () => push(EVENTS.INSTALL_PROMPT_SHOWN)

/** @param {'accepted'|'dismissed'} outcome */
export const trackInstallChoice = (outcome) => push(EVENTS.INSTALL_CHOICE, { ms_install_outcome: outcome })

export const trackAppInstalled = () => push(EVENTS.APP_INSTALLED)

/** @param {'chromium'|'ios'} variant */
export const trackInstallSheetShown = (variant) => push(EVENTS.INSTALL_SHEET_SHOWN, { ms_install_variant: variant })

/** @param {'chromium'|'ios'} variant */
export const trackInstallSheetDismissed = (variant) => push(EVENTS.INSTALL_SHEET_DISMISSED, { ms_install_variant: variant })
