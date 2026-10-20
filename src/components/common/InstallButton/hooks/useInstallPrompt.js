import { useCallback, useEffect, useState } from 'react'

import InstallPromptService from 'core/services/InstallPromptService'

/**
 * Exposes the captured beforeinstallprompt event (Chromium only).
 * promptInstall() must run inside the click handler: browsers require a user gesture.
 */
export default function useInstallPrompt () {
  const [canInstall, setCanInstall] = useState(() => InstallPromptService.canInstall())

  useEffect(() => {
    InstallPromptService.init()
    // The event may have fired between the first render and this effect.
    setCanInstall(InstallPromptService.canInstall())
    return InstallPromptService.subscribe(() => setCanInstall(InstallPromptService.canInstall()))
  }, [])

  const promptInstall = useCallback(() => InstallPromptService.promptInstall(), [])

  return { canInstall, promptInstall }
}
