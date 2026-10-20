import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

import { useAppContext } from 'components/context/AppContext/AppContext'
import useInstallPrompt from 'components/common/InstallButton/hooks/useInstallPrompt'
import { trackInstallSheetShown, trackInstallSheetDismissed } from 'components/context/GoogleTagManager/utils/trackInstall'
import Storage from 'core/Storage'
import { canShowInstallUi, readInstallContext, shouldShowIosInstructions } from 'core/Utils/detectInstallContext'
import isSnoozed from '../utils/isSnoozed'

export const INSTALL_SHEET_DELAY_MS = 4000
export const INSTALL_SHEET_DISMISSED_KEY = 'marea:install-sheet-dismissed-at'
export const INSTALL_SHEET_INSTALLED_KEY = 'marea:install-sheet-installed'

// The page already explains installing in full; /debug is a diagnostics tool.
const QUIET_ROUTES = ['/install', '/debug']

const isQuietRoute = (pathname) => QUIET_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`))

const isHiddenByStorage = () => Storage.getItem(INSTALL_SHEET_INSTALLED_KEY) === true || isSnoozed(Storage.getItem(INSTALL_SHEET_DISMISSED_KEY))

/**
 * Decides when the install sheet shows: 4 s after load or on the first scroll (whichever is first),
 * only where install makes sense, and not again for 7 days after a dismissal or ever after an install.
 */
export default function useInstallSheet () {
  const { platform } = useAppContext()
  const { pathname } = useLocation()
  const { canInstall, promptInstall } = useInstallPrompt()
  const [context] = useState(readInstallContext)
  const [armed, setArmed] = useState(false)
  const [hidden, setHidden] = useState(isHiddenByStorage)
  const shownTracked = useRef(false)

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
    Storage.setItem(INSTALL_SHEET_DISMISSED_KEY, Date.now())
    setHidden(true)
    trackInstallSheetDismissed(variant)
  }, [variant])

  const install = useCallback(async () => {
    const outcome = await promptInstall()
    if (outcome === 'accepted') {
      markInstalled()
    }
    return outcome
  }, [promptInstall, markInstalled])

  return { visible, variant, isIphone: context.isIphone, dismiss, install }
}
