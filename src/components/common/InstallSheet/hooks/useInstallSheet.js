import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

import { useAppContext } from 'components/context/AppContext/AppContext'
import useInstallPrompt from 'components/common/InstallButton/hooks/useInstallPrompt'
import { trackInstallSheetShown, trackInstallSheetDismissed } from 'components/context/GoogleTagManager/utils/trackInstall'
import Session from 'core/Session'
import Storage from 'core/Storage'
import { canShowInstallUi, readInstallContext, shouldShowIosInstructions } from 'core/Utils/detectInstallContext'
import { getDismissalWrites, isHiddenByPolicy, parseReappear } from '../utils/reappearPolicy'

export const INSTALL_SHEET_DELAY_MS = 4000
export const INSTALL_SHEET_DISMISSED_KEY = 'marea:install-sheet-dismissed-at'
export const INSTALL_SHEET_DISMISS_COUNT_KEY = 'marea:install-sheet-dismiss-count'
export const INSTALL_SHEET_SESSION_KEY = 'marea:install-sheet-dismissed-session'
export const INSTALL_SHEET_INSTALLED_KEY = 'marea:install-sheet-installed'

// The page already explains installing in full; /debug is a diagnostics tool.
const QUIET_ROUTES = ['/install', '/debug']

export const isQuietRoute = (pathname) => QUIET_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`))

export const readDismissalState = () => ({
  dismissedAt: Storage.getItem(INSTALL_SHEET_DISMISSED_KEY),
  dismissCount: Storage.getItem(INSTALL_SHEET_DISMISS_COUNT_KEY),
  sessionDismissed: Session.getItem(INSTALL_SHEET_SESSION_KEY) === true
})

const isHiddenByPolicyInStorage = (policy) => isHiddenByPolicy({ policy, ...readDismissalState(), now: Date.now() })

const isHiddenByStorage = (policy) => Storage.getItem(INSTALL_SHEET_INSTALLED_KEY) === true || isHiddenByPolicyInStorage(policy)

/**
 * Decides when the install sheet shows: 4 s after load or on the first scroll (whichever is first),
 * only where install makes sense, never again after an install, and after a close according to the
 * reappearance policy of the config (install.sheet.reappear, see utils/reappearPolicy).
 */
export default function useInstallSheet () {
  const { platform, config } = useAppContext()
  const reappear = config?.install?.sheet?.reappear
  const policy = useMemo(() => parseReappear(reappear), [reappear])
  const { pathname } = useLocation()
  const { canInstall, promptInstall } = useInstallPrompt()
  const [context] = useState(readInstallContext)
  const [armed, setArmed] = useState(false)
  const [hidden, setHidden] = useState(() => isHiddenByStorage(policy))
  const shownTracked = useRef(false)
  // everyLoad keeps no storage, so the close of this page view must survive the stale mark healing below.
  const closedThisView = useRef(false)

  const variant = context.isIos ? 'ios' : 'chromium'
  // iOS cannot be prompted, so its sheet only needs the right device; Chromium needs the captured event.
  const eligible = context.isIos ? shouldShowIosInstructions({ context, platform }) : canInstall && canShowInstallUi(platform)
  const visible = armed && eligible && !hidden && !isQuietRoute(pathname)

  useEffect(() => {
    const arm = () => setArmed(true)
    const timer = setTimeout(arm, INSTALL_SHEET_DELAY_MS)
    window.addEventListener('scroll', arm, { passive: true })
    return () => {
      clearTimeout(timer)
      window.removeEventListener('scroll', arm)
    }
  }, [])

  const markInstalled = useCallback(() => {
    Storage.setItem(INSTALL_SHEET_INSTALLED_KEY, true)
    setHidden(true)
  }, [])

  // The browser only offers an install while the app is not installed, so a stale mark means it was uninstalled.
  useEffect(() => {
    if (canInstall && Storage.getItem(INSTALL_SHEET_INSTALLED_KEY) === true) {
      Storage.removeItem(INSTALL_SHEET_INSTALLED_KEY)
      setHidden(closedThisView.current || isHiddenByPolicyInStorage(policy))
    }
  }, [canInstall, policy])

  // Installed from the browser menu or the header button instead of the sheet.
  useEffect(() => {
    window.addEventListener('appinstalled', markInstalled)
    return () => window.removeEventListener('appinstalled', markInstalled)
  }, [markInstalled])

  useEffect(() => {
    if (visible && !shownTracked.current) {
      shownTracked.current = true
      trackInstallSheetShown(variant)
    }
  }, [visible, variant])

  const dismiss = useCallback(() => {
    const { sessionDismissed, dismissedAt, dismissCount } = getDismissalWrites({
      policy,
      dismissCount: Storage.getItem(INSTALL_SHEET_DISMISS_COUNT_KEY),
      now: Date.now()
    })
    if (sessionDismissed) {
      Session.setItem(INSTALL_SHEET_SESSION_KEY, true)
    }
    if (dismissedAt !== undefined) {
      Storage.setItem(INSTALL_SHEET_DISMISSED_KEY, dismissedAt)
    }
    if (dismissCount !== undefined) {
      Storage.setItem(INSTALL_SHEET_DISMISS_COUNT_KEY, dismissCount)
    }
    closedThisView.current = true
    setHidden(true)
    trackInstallSheetDismissed(variant, policy.mode)
  }, [variant, policy])

  const install = useCallback(async () => {
    const outcome = await promptInstall()
    if (outcome === 'accepted') {
      markInstalled()
    }
    return outcome
  }, [promptInstall, markInstalled])

  return { visible, variant, isIphone: context.isIphone, dismiss, install }
}
