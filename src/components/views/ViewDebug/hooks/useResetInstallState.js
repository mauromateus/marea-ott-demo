import { useCallback, useEffect, useRef, useState } from 'react'

import { INSTALL_SHEET_DISMISSED_KEY, INSTALL_SHEET_INSTALLED_KEY } from 'components/common/InstallSheet/hooks/useInstallSheet'
import Session from 'core/Session'
import Storage from 'core/Storage'
import { translate } from 'core/Translation'
import { PLATFORM_SESSION_KEY } from 'core/Utils/getPlatformOrigin'

export const RELOAD_DELAY_MS = 900

/** Forgets the three things that hide the install UI, shows a confirmation, then reloads so the app resolves them again. */
export default function useResetInstallState () {
  const [message, setMessage] = useState('')
  const [resetting, setResetting] = useState(false)
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  const reset = useCallback(() => {
    if (timer.current) {
      return
    }
    Session.removeItem(PLATFORM_SESSION_KEY)
    Storage.removeItem(INSTALL_SHEET_DISMISSED_KEY)
    Storage.removeItem(INSTALL_SHEET_INSTALLED_KEY)
    setMessage(translate('debug.install.resetDone'))
    setResetting(true)
    // The pause lets the confirmation be read (and announced) before the page goes away.
    timer.current = setTimeout(() => window.location.reload(), RELOAD_DELAY_MS)
  }, [])

  return { reset, message, resetting }
}
