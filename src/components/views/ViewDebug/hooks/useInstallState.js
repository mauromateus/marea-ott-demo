import { useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'

import { useAppContext } from 'components/context/AppContext/AppContext'
import useInstallPrompt from 'components/common/InstallButton/hooks/useInstallPrompt'
import { INSTALL_SHEET_INSTALLED_KEY, isQuietRoute, readDismissalState } from 'components/common/InstallSheet/hooks/useInstallSheet'
import { parseReappear } from 'components/common/InstallSheet/utils/reappearPolicy'
import Session from 'core/Session'
import Storage from 'core/Storage'
import { readInstallContext } from 'core/Utils/detectInstallContext'
import { PLATFORM_SESSION_KEY } from 'core/Utils/getPlatformOrigin'
import buildInstallRows from '../utils/buildInstallRows'
import getInstallStateSummary from '../utils/getInstallStateSummary'

/** Read-only view of everything that can hide the install UI. Storage is read on every render. */
export default function useInstallState () {
  const { platform, config } = useAppContext()
  const reappear = config?.install?.sheet?.reappear
  const policy = useMemo(() => parseReappear(reappear), [reappear])
  const { pathname } = useLocation()
  const { canInstall } = useInstallPrompt()
  const [isIos] = useState(() => readInstallContext().isIos)

  const storedPlatform = Session.getItem(PLATFORM_SESSION_KEY) || ''
  const { dismissedAt, dismissCount, sessionDismissed } = readDismissalState()
  const installedMark = Storage.getItem(INSTALL_SHEET_INSTALLED_KEY) === true

  const summary = getInstallStateSummary({
    canInstall,
    platform,
    storedPlatform,
    dismissedAt,
    dismissCount,
    sessionDismissed,
    policy,
    installedMark,
    isIos,
    quietRoute: isQuietRoute(pathname)
  })
  return buildInstallRows({ platform, canInstall, storedPlatform, installedMark, summary, policy })
}
