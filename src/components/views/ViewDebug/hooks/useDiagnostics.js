import { useEffect, useState } from 'react'

import { useAppContext } from 'components/context/AppContext/AppContext'
import DataLayerService from 'core/services/DataLayerService'
import collectDiagnostics from '../utils/collectDiagnostics'

export default function useDiagnostics () {
  const { config, platform, platformSource } = useAppContext()
  const [online, setOnline] = useState(navigator.onLine)
  const [events, setEvents] = useState(() => DataLayerService.getRecentEvents())
  const [diagnostics, setDiagnostics] = useState(() => collectDiagnostics({ config, platformDetails: { platform, source: platformSource }, online }))

  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  useEffect(() => DataLayerService.subscribe(() => setEvents(DataLayerService.getRecentEvents())), [])

  // Re-read on connectivity changes and when the service worker takes control (first install).
  useEffect(() => {
    const refresh = () => setDiagnostics(collectDiagnostics({ config, platformDetails: { platform, source: platformSource }, online }))
    refresh()
    const container = navigator.serviceWorker
    container?.addEventListener('controllerchange', refresh)
    return () => container?.removeEventListener('controllerchange', refresh)
  }, [config, platform, platformSource, online])

  return { diagnostics, events }
}
