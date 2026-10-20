import { useEffect, useState } from 'react'

import queryWorkerVersion, { NO_WORKER } from 'core/services/ServiceWorker/queryWorkerVersion'
import { getRunningMainBundle } from 'core/Utils/getMainBundleName'
import buildVersionRows from '../utils/buildVersionRows'

const getContainer = () => (typeof navigator !== 'undefined' ? navigator.serviceWorker : undefined)

/** Version rows for the page and the copy report; the worker is asked once and again when it takes control. */
export default function useWorkerVersions () {
  const [running] = useState(() => getRunningMainBundle())
  // Without browser support there is nothing to ask, so the final state is known on the first render.
  const [worker, setWorker] = useState(() => (getContainer() ? null : NO_WORKER))

  useEffect(() => {
    const container = getContainer()
    if (!container) {
      return undefined
    }
    let mounted = true
    const refresh = () => queryWorkerVersion().then((result) => { if (mounted) setWorker(result) })
    refresh()
    container.addEventListener('controllerchange', refresh)
    return () => {
      mounted = false
      container.removeEventListener('controllerchange', refresh)
    }
  }, [])

  return buildVersionRows({ running, worker })
}
